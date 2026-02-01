package com.digitalbank.core.dto;

import com.digitalbank.core.entity.ScheduledTransfer;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * 预约转账响应，ADR-008。
 *
 * @author Digital Bank POC Team
 */
public class ScheduledTransferResponse {

    private String scheduledId;
    private Long fromAccountId;
    private Long toAccountId;
    private BigDecimal amount;
    private Instant scheduledTime;
    private String status;
    private String transactionId;
    private String errorMessage;
    private String remark;
    private Instant createdAt;

    public ScheduledTransferResponse() {
    }

    public static ScheduledTransferResponse from(ScheduledTransfer entity) {
        ScheduledTransferResponse r = new ScheduledTransferResponse();
        r.scheduledId = entity.getScheduledId();
        r.fromAccountId = entity.getFromAccountId();
        r.toAccountId = entity.getToAccountId();
        r.amount = entity.getAmount();
        r.scheduledTime = entity.getScheduledTime();
        r.status = entity.getStatus();
        r.transactionId = entity.getTransactionId();
        r.errorMessage = entity.getErrorMessage();
        r.remark = entity.getRemark();
        r.createdAt = entity.getCreatedAt();
        return r;
    }

    public String getScheduledId() {
        return scheduledId;
    }

    public void setScheduledId(String scheduledId) {
        this.scheduledId = scheduledId;
    }

    public Long getFromAccountId() {
        return fromAccountId;
    }

    public void setFromAccountId(Long fromAccountId) {
        this.fromAccountId = fromAccountId;
    }

    public Long getToAccountId() {
        return toAccountId;
    }

    public void setToAccountId(Long toAccountId) {
        this.toAccountId = toAccountId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Instant getScheduledTime() {
        return scheduledTime;
    }

    public void setScheduledTime(Instant scheduledTime) {
        this.scheduledTime = scheduledTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
