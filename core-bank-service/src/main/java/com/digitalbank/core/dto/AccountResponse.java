package com.digitalbank.core.dto;

import com.digitalbank.core.entity.Account;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * 账户响应，与 OpenAPI AccountResponse 一致。
 *
 * @author Digital Bank POC Team
 */
public class AccountResponse {

    private Long accountId;
    private String accountNumber;
    private Long customerId;
    private BigDecimal balance;
    private String currency;
    private String accountType;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;

    public static AccountResponse from(Account a) {
        AccountResponse r = new AccountResponse();
        r.setAccountId(a.getId());
        r.setAccountNumber(a.getAccountNumber());
        r.setCustomerId(a.getCustomerId());
        r.setBalance(a.getBalance());
        r.setCurrency(a.getCurrency());
        r.setAccountType(a.getAccountType());
        r.setStatus(a.getStatus());
        r.setCreatedAt(a.getCreatedAt());
        r.setUpdatedAt(a.getUpdatedAt());
        return r;
    }

    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
