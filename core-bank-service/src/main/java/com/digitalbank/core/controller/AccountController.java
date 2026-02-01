package com.digitalbank.core.controller;

import com.digitalbank.core.dto.*;
import com.digitalbank.core.entity.Account;
import com.digitalbank.core.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 账户 REST API：/api/v1/accounts。
 * 遵循 OpenAPI、api-design-spec：路径 kebab-case，统一 { code, message, data, timestamp }。
 *
 * @author Digital Bank POC Team
 */
@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    /**
     * 开户。POST /api/v1/accounts
     */
    @PostMapping
    public ResponseEntity<ApiResponse<AccountResponse>> createAccount(@Valid @RequestBody CreateAccountRequest request) {
        Account created = accountService.createAccount(request);
        return ResponseEntity.status(201).body(ApiResponse.created(AccountResponse.from(created)));
    }

    /**
     * 查询账户列表。GET /api/v1/accounts?customerId=&status=&page=1&pageSize=20
     */
    @GetMapping
    public ResponseEntity<ApiResponse<AccountListResponse>> listAccounts(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        AccountListResponse data = accountService.listAccounts(customerId, status, page, pageSize);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    /**
     * 查询账户详情。GET /api/v1/accounts/{account-id}
     */
    @GetMapping("/{account-id}")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccount(@PathVariable("account-id") Long accountId) {
        Account a = accountService.getAccountById(accountId);
        return ResponseEntity.ok(ApiResponse.ok(AccountResponse.from(a)));
    }

    /**
     * 余额查询。GET /api/v1/accounts/{account-id}/balance
     */
    @GetMapping("/{account-id}/balance")
    public ResponseEntity<ApiResponse<BalanceResponse>> getBalance(@PathVariable("account-id") Long accountId) {
        BalanceResponse data = accountService.getBalance(accountId);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }
}
