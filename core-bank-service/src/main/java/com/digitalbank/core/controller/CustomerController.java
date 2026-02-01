package com.digitalbank.core.controller;

import com.digitalbank.core.dto.ApiResponse;
import com.digitalbank.core.dto.CreateCustomerRequest;
import com.digitalbank.core.dto.CustomerResponse;
import com.digitalbank.core.dto.UpdateCustomerRequest;
import com.digitalbank.core.entity.Customer;
import com.digitalbank.core.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 客户 REST API：/api/v1/customers。
 * 客户注册、查询、更新。遵循 OpenAPI、api-design-spec。
 *
 * @author Digital Bank POC Team
 */
@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        Customer created = customerService.createCustomer(request);
        return ResponseEntity.status(201).body(ApiResponse.created(CustomerResponse.from(created)));
    }

    @GetMapping("/{customer-id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomer(@PathVariable("customer-id") Long customerId) {
        Customer c = customerService.getCustomerById(customerId);
        return ResponseEntity.ok(ApiResponse.ok(CustomerResponse.from(c)));
    }

    @PutMapping("/{customer-id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
            @PathVariable("customer-id") Long customerId,
            @Valid @RequestBody UpdateCustomerRequest request) {
        Customer updated = customerService.updateCustomer(customerId, request);
        return ResponseEntity.ok(ApiResponse.ok(CustomerResponse.from(updated)));
    }
}
