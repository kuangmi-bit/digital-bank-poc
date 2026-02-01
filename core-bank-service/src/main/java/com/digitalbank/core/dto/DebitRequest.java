package com.digitalbank.core.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * 支付扣款请求，ADR-005。用于 POST /api/v1/transactions/debit。
 * refId 用于幂等：同一 refId 多次请求返回同一 transactionId，不重复扣款。
 *
 * @author Digital Bank POC Team
 */
public class DebitRequest {

    @NotNull(message = "accountId 不能为空")
    private Long accountId;

    @NotNull(message = "amount 不能为空")
    @DecimalMin(value = "0.01", message = "金额必须大于 0")
    private BigDecimal amount;

    @NotBlank(message = "refId 不能为空")
    private String refId;

    private String remark;

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

    public String getRefId() {
        return refId;
    }

    public void setRefId(String refId) {
        this.refId = refId;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }
}
