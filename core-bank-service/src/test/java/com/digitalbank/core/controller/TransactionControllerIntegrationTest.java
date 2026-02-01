package com.digitalbank.core.controller;

import com.digitalbank.core.entity.Account;
import com.digitalbank.core.repository.AccountRepository;
import com.digitalbank.core.repository.CustomerRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * TransactionController 集成测试：debit（含幂等）、transfer、listTransactions、history。
 * 风控 URL 未配置时跳过检查。
 *
 * @author Digital Bank POC Team
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class TransactionControllerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("digitalbank")
            .withUsername("digitalbank")
            .withPassword("digitalbank");

    @DynamicPropertySource
    static void configure(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("services.risk.url", () -> "");
    }

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    CustomerRepository customerRepository;

    @Autowired
    AccountRepository accountRepository;

    private long customerId;
    private long accountId1;
    private long accountId2;

    @BeforeEach
    void setUp() {
        var c = new com.digitalbank.core.entity.Customer();
        c.setName("交易测试客户");
        c.setStatus("active");
        c = customerRepository.save(c);
        customerId = c.getId();

        var a1 = new Account();
        a1.setAccountNumber("62" + System.nanoTime());
        a1.setCustomerId(customerId);
        a1.setBalance(new BigDecimal("200.00"));
        a1.setCurrency("CNY");
        a1.setAccountType("savings");
        a1.setStatus("active");
        a1 = accountRepository.save(a1);
        accountId1 = a1.getId();

        var a2 = new Account();
        a2.setAccountNumber("62" + (System.nanoTime() + 1));
        a2.setCustomerId(customerId);
        a2.setBalance(BigDecimal.ZERO);
        a2.setCurrency("CNY");
        a2.setAccountType("savings");
        a2.setStatus("active");
        a2 = accountRepository.save(a2);
        accountId2 = a2.getId();
    }

    @Test
    void debit_success_returns201() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("accountId", accountId1);
        body.put("amount", 50.00);
        body.put("refId", "ref-debit-001");
        body.put("remark", "集成测试扣款");

        mvc.perform(post("/api/v1/transactions/debit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.data.transactionId").exists())
                .andExpect(jsonPath("$.data.accountId").value(accountId1))
                .andExpect(jsonPath("$.data.amount").value(50.0))
                .andExpect(jsonPath("$.data.status").value("completed"));

        mvc.perform(get("/api/v1/accounts/{id}/balance", accountId1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.balance").value(150.0));
    }

    @Test
    void debit_idempotent_sameRefIdReturnsSameTransactionId() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("accountId", accountId1);
        body.put("amount", 10.00);
        body.put("refId", "ref-idem-001");

        String r1 = mvc.perform(post("/api/v1/transactions/debit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.transactionId").exists())
                .andReturn().getResponse().getContentAsString();

        String r2 = mvc.perform(post("/api/v1/transactions/debit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String tx1 = objectMapper.readTree(r1).get("data").get("transactionId").asText();
        String tx2 = objectMapper.readTree(r2).get("data").get("transactionId").asText();
        assertThat(tx1).isEqualTo(tx2);

        mvc.perform(get("/api/v1/accounts/{id}/balance", accountId1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.balance").value(190.0));
    }

    @Test
    void debit_returns400_whenInsufficientBalance() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("accountId", accountId1);
        body.put("amount", 99999.00);
        body.put("refId", "ref-fail-001");

        mvc.perform(post("/api/v1/transactions/debit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("CBB002"));
    }

    @Test
    void transfer_success() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("fromAccountId", accountId1);
        body.put("toAccountId", accountId2);
        body.put("amount", 60.00);
        body.put("remark", "集成测试转账");

        mvc.perform(post("/api/v1/transactions/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.transactionId").exists())
                .andExpect(jsonPath("$.data.fromAccountId").value(accountId1))
                .andExpect(jsonPath("$.data.toAccountId").value(accountId2))
                .andExpect(jsonPath("$.data.amount").value(60.0))
                .andExpect(jsonPath("$.data.status").value("completed"));

        mvc.perform(get("/api/v1/accounts/{id}/balance", accountId1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.balance").value(140.0));
        mvc.perform(get("/api/v1/accounts/{id}/balance", accountId2))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.balance").value(60.0));
    }

    @Test
    void listTransactions_and_history() throws Exception {
        Map<String, Object> debitBody = new HashMap<>();
        debitBody.put("accountId", accountId1);
        debitBody.put("amount", 25.00);
        debitBody.put("refId", "ref-list-001");
        mvc.perform(post("/api/v1/transactions/debit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(debitBody)))
                .andExpect(status().isCreated());

        mvc.perform(get("/api/v1/transactions").param("accountId", String.valueOf(accountId1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.total", greaterThanOrEqualTo(1)));

        mvc.perform(get("/api/v1/transactions/history").param("accountId", String.valueOf(accountId1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items", hasSize(greaterThanOrEqualTo(1))));
    }
}
