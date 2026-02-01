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

import java.math.BigDecimal;

/**
 * 风控服务 HTTP 实现：转账前调用 POST /api/v1/risk/check。
 * 请求体 snake_case：customer_id, account_id, amount, transaction_type, recipient_account_id。
 * 若 services.risk.url 未配置或为空，则跳过风控检查（本地开发/测试）。
 */
@Component
public class HttpRiskClient implements RiskClient {

    private static final Logger log = LoggerFactory.getLogger(HttpRiskClient.class);
    private static final String PATH = "/api/v1/risk/check";
    private static final String DEFAULT_CALLER = "core-bank-service";

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public HttpRiskClient(RestTemplate restTemplate, @Value("${services.risk.url:}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl == null ? "" : baseUrl.trim();
    }

    @Override
    public void checkTransfer(Long customerId, Long accountId, BigDecimal amount, Long recipientAccountId) {
        if (baseUrl.isEmpty()) {
            log.debug("风控 URL 未配置，跳过风控检查");
            return;
        }
        RiskCheckRequestDto req = new RiskCheckRequestDto();
        req.setCustomerId(String.valueOf(customerId));
        req.setAccountId(accountId != null ? String.valueOf(accountId) : null);
        req.setAmount(amount);
        req.setTransactionType("transfer");
        req.setRecipientAccountId(recipientAccountId != null ? String.valueOf(recipientAccountId) : null);

        String url = baseUrl.endsWith("/") ? baseUrl + PATH.substring(1) : baseUrl + PATH;
        HttpEntity<RiskCheckRequestDto> entity = new HttpEntity<>(req, ClientHeaderUtil.jsonHeaders(DEFAULT_CALLER));

        try {
            ResponseEntity<Object> res = restTemplate.exchange(url, HttpMethod.POST, entity, Object.class);
            if (res.getStatusCode().is2xxSuccessful()) {
                log.debug("风控检查通过, accountId={}, amount={}", accountId, amount);
                return;
            }
        } catch (HttpClientErrorException.Forbidden e) {
            log.warn("风控拦截: accountId={}, amount={}, response={}", accountId, amount, e.getResponseBodyAsString());
            throw new BusinessException("RKB001", "风控拦截", 403);
        } catch (Exception e) {
            log.error("风控服务调用异常: url={}, error={}", url, e.getMessage(), e);
            throw new BusinessException("CBS002", "风控服务异常，请稍后重试", 504);
        }
    }
}

