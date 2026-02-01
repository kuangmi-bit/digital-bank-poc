package com.digitalbank.core.service;

import com.digitalbank.core.entity.OutboxEvent;
import com.digitalbank.core.repository.OutboxEventRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * Outbox 写入服务：与业务数据同事务落库，保证最终一致性。
 */
@Service
public class OutboxService {

    private static final Logger log = LoggerFactory.getLogger(OutboxService.class);

    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    public OutboxService(OutboxEventRepository outboxEventRepository, ObjectMapper objectMapper) {
        this.outboxEventRepository = outboxEventRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public OutboxEvent recordEvent(String eventType,
                                   String aggregateType,
                                   String aggregateId,
                                   String idempotencyKey,
                                   Map<String, Object> payload) {
        String payloadJson = toJson(payload);
        OutboxEvent e = new OutboxEvent();
        e.setEventType(eventType);
        e.setAggregateType(aggregateType);
        e.setAggregateId(aggregateId);
        e.setIdempotencyKey(idempotencyKey);
        e.setPayload(payloadJson);
        e.setHeaders(null);
        e.setStatus("pending");
        OutboxEvent saved = outboxEventRepository.save(e);
        log.debug("outbox 事件写入, id={}, eventType={}, aggregateType={}, aggregateId={}",
                saved.getId(), eventType, aggregateType, aggregateId);
        return saved;
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            // 极端情况下，避免影响主业务流程：写入最小 payload
            log.warn("outbox payload 序列化失败，将降级为 toString, err={}", e.getMessage());
            return String.valueOf(obj);
        }
    }
}

