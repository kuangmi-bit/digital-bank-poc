package com.digitalbank.core.controller;

import com.digitalbank.core.dto.AccountListResponse;
import com.digitalbank.core.dto.BalanceResponse;
import com.digitalbank.core.entity.Account;
import com.digitalbank.core.exception.BusinessException;
import com.digitalbank.core.exception.GlobalExceptionHandler;
import com.digitalbank.core.service.AccountService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * AccountController 单元测试（Mock Service + GlobalExceptionHandler）。
 *
 * @author Digital Bank POC Team
 */
@WebMvcTest(AccountController.class)
@Import(GlobalExceptionHandler.class)
class AccountControllerTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockBean
    AccountService accountService;

    @Test
    void createAccount_returns400_whenValidationFails() throws Exception {
        mvc.perform(post("/api/v1/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"accountType\":\"savings\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("CBV003"));
    }

    @Test
    void createAccount_returns201() throws Exception {
        Account a = new Account();
        a.setId(1L);
        a.setAccountNumber("6200123456789012");
        a.setCustomerId(10L);
        a.setBalance(BigDecimal.ZERO);
        a.setCurrency("CNY");
        a.setAccountType("savings");
        a.setStatus("active");
        a.setCreatedAt(Instant.now());
        a.setUpdatedAt(Instant.now());
        when(accountService.createAccount(any())).thenReturn(a);

        mvc.perform(post("/api/v1/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"customerId\":10,\"accountType\":\"savings\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.data.accountId").value(1))
                .andExpect(jsonPath("$.data.accountNumber").value("6200123456789012"))
                .andExpect(jsonPath("$.data.balance").value(0));
    }

    @Test
    void getAccount_returns200() throws Exception {
        Account a = new Account();
        a.setId(2L);
        a.setAccountNumber("6200123456789013");
        a.setCustomerId(10L);
        a.setBalance(BigDecimal.TEN);
        a.setCurrency("CNY");
        a.setAccountType("current");
        a.setStatus("active");
        a.setCreatedAt(Instant.now());
        a.setUpdatedAt(Instant.now());
        when(accountService.getAccountById(2L)).thenReturn(a);

        mvc.perform(get("/api/v1/accounts/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accountId").value(2))
                .andExpect(jsonPath("$.data.balance").value(10));
    }

    @Test
    void getAccount_returns404_whenServiceThrows() throws Exception {
        when(accountService.getAccountById(999L)).thenThrow(new BusinessException("CBB001", "账户不存在", 404));

        mvc.perform(get("/api/v1/accounts/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("CBB001"));
    }

    @Test
    void getBalance_returns200() throws Exception {
        when(accountService.getBalance(eq(3L))).thenReturn(new BalanceResponse(3L, new BigDecimal("99.99"), "CNY"));

        mvc.perform(get("/api/v1/accounts/3/balance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accountId").value(3))
                .andExpect(jsonPath("$.data.balance").value(99.99))
                .andExpect(jsonPath("$.data.currency").value("CNY"));
    }

    @Test
    void listAccounts_returns200() throws Exception {
        AccountListResponse list = new AccountListResponse(Collections.emptyList(), 0, 1, 20);
        when(accountService.listAccounts(eq(null), eq(null), eq(1), eq(20))).thenReturn(list);

        mvc.perform(get("/api/v1/accounts").param("page", "1").param("pageSize", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items").isArray())
                .andExpect(jsonPath("$.data.total").value(0))
                .andExpect(jsonPath("$.data.page").value(1))
                .andExpect(jsonPath("$.data.pageSize").value(20));
    }
}
