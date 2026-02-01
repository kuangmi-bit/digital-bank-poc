package com.digitalbank.core.dto;

import java.math.BigDecimal;

/**
 * 行内转账响应，与 OpenAPI 一致。
 *
 * @author Digital Bank POC Team
 */
public class TransferResponse {

    private String transactionId;
    private Long fromAccountId;
    private Long toAccountId;
    private BigDecimal amount;
    private String status;

    public TransferResponse(String transactionId, Long fromAccountId, Long toAccountId, BigDecimal amount, String status) {
        this.transactionId = transactionId;
        this.fromAccountId = fromAccountId;
        this.toAccountId = toAccountId;
        this.amount = amount;
        this.status = status;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public Long getFromAccountId() {
        return fromAccountId;
    }

    public Long getToAccountId() {
        return toAccountId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getStatus() {
        return status;
    }
}
