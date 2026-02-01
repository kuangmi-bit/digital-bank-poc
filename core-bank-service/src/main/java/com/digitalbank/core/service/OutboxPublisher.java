package com.digitalbank.core.service;

import com.digitalbank.core.client.PaymentCallbackRequestDto;
import com.digitalbank.core.client.PaymentClient;
import com.digitalbank.core.entity.OutboxEvent;
import com.digitalbank.core.repository.OutboxEventRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Outbox 轮询发布器（可选）：从 outbox_events 领取 pending 事件并投递到下游。
 * - 使用 FOR UPDATE SKIP LOCKED 避免多实例竞争
 * - 失败时重试（maxAttempts 达到后标记 failed）
 */
@Component
@ConditionalOnProperty(prefix = "outbox.publisher", name = "enabled", havingValue = "true")
public class OutboxPublisher {

    private static final Logger log = LoggerFactory.getLogger(OutboxPublisher.class);

    private final OutboxEventRepository outboxEventRepository;
    private final PaymentClient paymentClient;
    private final ObjectMapper objectMapper;
    private final int batchSize;
    private final int maxAttempts;

    public OutboxPublisher(OutboxEventRepository outboxEventRepository,
                           PaymentClient paymentClient,
                           ObjectMapper objectMapper,
                           @Value("${outbox.publisher.batch-size:50}") int batchSize,
                           @Value("${outbox.publisher.max-attempts:10}") int maxAttempts) {
        this.outboxEventRepository = outboxEventRepository;
        this.paymentClient = paymentClient;
        this.objectMapper = objectMapper;
        this.batchSize = Math.max(1, Math.min(200, batchSize));
        this.maxAttempts = Math.max(1, Math.min(100, maxAttempts));
    }

    @Scheduled(fixedDelayString = "${outbox.publisher.poll-interval-ms:1000}")
    public void pollAndPublish() {
        List<OutboxEvent> events = outboxEventRepository.claimPending(batchSize);
        if (events.isEmpty()) return;

        for (OutboxEvent e : events) {
            try {
                publishOne(e);
                outboxEventRepository.markSent(e.getId(), Instant.now());
            } catch (Exception ex) {
                String err = ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName();
                if (e.getAttempts() + 1 >= maxAttempts) {
                    outboxEventRepository.markFailed(e.getId(), err, Instant.now());
                    log.warn("outbox 投递失败(已达最大重试), id={}, eventType={}, err={}", e.getId(), e.getEventType(), err);
                } else {
                    outboxEventRepository.markRetry(e.getId(), err, Instant.now());
                    log.warn("outbox 投递失败(将重试), id={}, eventType={}, err={}", e.getId(), e.getEventType(), err);
                }
            }
        }
    }

    private void publishOne(OutboxEvent e) throws Exception {
        String type = e.getEventType() != null ? e.getEventType() : "";
        if ("PAYMENT_DEBIT_COMPLETED".equalsIgnoreCase(type)) {
            // 将 core-bank 的扣款完成事件回调通知 payment-service（演示最终一致性通知）
            PaymentCallbackRequestDto cb = buildPaymentCallback(e.getAggregateId(), e.getPayload());
            paymentClient.sendCallback(cb);
            return;
        }

        // 其它事件暂不投递（可扩展：MQ / webhook / settlement 等）
        log.debug("outbox 事件已领取但未配置投递策略，将直接标记 sent, id={}, eventType={}", e.getId(), type);
    }

    private PaymentCallbackRequestDto buildPaymentCallback(String aggregateId, String payloadJson) {
        PaymentCallbackRequestDto cb = new PaymentCallbackRequestDto();
        cb.setPaymentId(aggregateId); // refId/paymentId
        cb.setStatus("completed");
        cb.setCode("CB000");
        cb.setMessage("core-bank debit completed");
        cb.setGatewayOrderId(null);

        try {
            JsonNode n = objectMapper.readTree(payloadJson);
            if (n.hasNonNull("transactionId")) cb.setGatewayOrderId(n.get("transactionId").asText());
            if (n.hasNonNull("status")) cb.setStatus(n.get("status").asText());
            if (n.hasNonNull("refId") && (cb.getPaymentId() == null || cb.getPaymentId().isBlank())) {
                cb.setPaymentId(n.get("refId").asText());
            }
            // amount 可选：仅用于日志/审计；此处不强依赖
            if (n.hasNonNull("amount")) {
                BigDecimal a = new BigDecimal(n.get("amount").asText());
                if (a.compareTo(BigDecimal.ZERO) <= 0) {
                    // ignore
                }
            }
        } catch (Exception ignore) {
            // ignore parsing error，使用默认字段
        }
        return cb;
    }

    // 预留扩展：可在此处增加多事件类型路由/异步投递/批量投递等能力
}

