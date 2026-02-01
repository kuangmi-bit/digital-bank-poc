package com.digitalbank.core.dto;

import java.math.BigDecimal;

/**
 * 支付扣款响应，ADR-005。201 返回 transactionId、accountId、amount、status。
 *
 * @author Digital Bank POC Team
 */
public class DebitResponse {

    private String transactionId;
    private Long accountId;
    private BigDecimal amount;
    private String status;

    public DebitResponse() {
    }

    public DebitResponse(String transactionId, Long accountId, BigDecimal amount, String status) {
        this.transactionId = transactionId;
        this.accountId = accountId;
        this.amount = amount;
        this.status = status;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
