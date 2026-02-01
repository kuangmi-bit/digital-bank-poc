package com.digitalbank.core.dto;

import com.digitalbank.core.entity.Transaction;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * 交易响应，与 OpenAPI TransactionResponse 一致。
 *
 * @author Digital Bank POC Team
 */
public class TransactionResponse {

    private String transactionId;
    private Long accountId;
    private Long counterAccountId;
    private BigDecimal amount;
    private String transactionType;
    private String status;
    private String remark;
    private Instant createdAt;

    public static TransactionResponse from(Transaction t) {
        TransactionResponse r = new TransactionResponse();
        r.setTransactionId(t.getTransactionId());
        r.setAccountId(t.getAccountId());
        r.setCounterAccountId(t.getCounterAccountId());
        r.setAmount(t.getAmount());
        r.setTransactionType(t.getTransactionType());
        r.setStatus(t.getStatus());
        r.setRemark(t.getRemark());
        r.setCreatedAt(t.getCreatedAt());
        return r;
    }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    public Long getCounterAccountId() { return counterAccountId; }
    public void setCounterAccountId(Long counterAccountId) { this.counterAccountId = counterAccountId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
