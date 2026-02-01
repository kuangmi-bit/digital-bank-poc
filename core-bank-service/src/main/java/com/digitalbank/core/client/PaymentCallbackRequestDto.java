package com.digitalbank.core.client;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 支付回调请求 DTO（对齐 payment-service 的 /api/v1/payments/callback）。
 * 采用 snake_case 以兼容对方服务。
 */
public class PaymentCallbackRequestDto {

    @JsonProperty("payment_id")
    private String paymentId;

    private String status;

    @JsonProperty("gateway_order_id")
    private String gatewayOrderId;

    private String code;

    private String message;

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getGatewayOrderId() {
        return gatewayOrderId;
    }

    public void setGatewayOrderId(String gatewayOrderId) {
        this.gatewayOrderId = gatewayOrderId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

