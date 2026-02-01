package com.digitalbank.core.client;

import com.digitalbank.core.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

/**
 * 支付服务 HTTP 实现：投递支付回调 /api/v1/payments/callback（用于 OutboxPublisher 演示最终一致性通知）。
 */
@Component
public class HttpPaymentClient implements PaymentClient {

    private static final Logger log = LoggerFactory.getLogger(HttpPaymentClient.class);
    private static final String DEFAULT_CALLER = "core-bank-service";
    private static final String CALLBACK_PATH = "/api/v1/payments/callback";

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public HttpPaymentClient(RestTemplate restTemplate, @Value("${services.payment.url:}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl == null ? "" : baseUrl.trim();
    }

    @Override
    public void sendCallback(PaymentCallbackRequestDto req) {
        if (baseUrl.isEmpty()) {
            log.debug("支付 URL 未配置，跳过 payment callback 投递");
            return;
        }
        String url = baseUrl.endsWith("/") ? baseUrl + CALLBACK_PATH.substring(1) : baseUrl + CALLBACK_PATH;
        HttpEntity<PaymentCallbackRequestDto> entity = new HttpEntity<>(
                req,
                ClientHeaderUtil.jsonHeaders(DEFAULT_CALLER)
        );
        try {
            ResponseEntity<Object> res = restTemplate.exchange(url, HttpMethod.POST, entity, Object.class);
            if (res.getStatusCode().is2xxSuccessful()) {
                log.debug("payment callback 投递成功, paymentId={}, status={}", req.getPaymentId(), req.getStatus());
                return;
            }
            throw new BusinessException("CBS003", "支付服务返回非预期状态: " + res.getStatusCode(), 502);
        } catch (HttpClientErrorException e) {
            log.warn("payment callback 投递失败: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException("CBS003", "支付服务异常，请稍后重试", 502);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("payment callback 调用异常: url={}, err={}", url, e.getMessage(), e);
            throw new BusinessException("CBS003", "支付服务异常，请稍后重试", 502);
        }
    }
}

