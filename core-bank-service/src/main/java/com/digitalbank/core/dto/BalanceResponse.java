package com.digitalbank.core.dto;

import java.math.BigDecimal;

/**
 * 余额查询响应，与 OpenAPI /accounts/{account-id}/balance 一致。
 *
 * @author Digital Bank POC Team
 */
public class BalanceResponse {

    private Long accountId;
    private BigDecimal balance;
    private String currency;

    public BalanceResponse() {}

    public BalanceResponse(Long accountId, BigDecimal balance, String currency) {
        this.accountId = accountId;
        this.balance = balance;
        this.currency = currency;
    }

    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}
