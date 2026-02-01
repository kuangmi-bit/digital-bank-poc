package com.digitalbank.core.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 客户更新请求，与 OpenAPI UpdateCustomerRequest 一致。全部可选。
 *
 * @author Digital Bank POC Team
 */
public class UpdateCustomerRequest {

    @Size(max = 100)
    private String name;

    @Size(max = 20)
    private String phone;

    @Size(max = 128)
    private String email;

    private String address;

    @Pattern(regexp = "(?i)^(active|inactive|blocked)?$", message = "status 必须为 active、inactive 或 blocked")
    private String status;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
