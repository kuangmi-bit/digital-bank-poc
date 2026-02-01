package com.digitalbank.core.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * 开户请求，与 OpenAPI CreateAccountRequest 一致。
 *
 * @author Digital Bank POC Team
 */
public class CreateAccountRequest {

    @NotNull(message = "customerId 不能为空")
    private Long customerId;

    @NotNull(message = "accountType 不能为空")
    @Pattern(regexp = "(?i)^(savings|current)$", message = "accountType 必须为 savings 或 current")
    private String accountType = "savings";

    private String currency = "CNY";

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency != null ? currency : "CNY";
    }
}
