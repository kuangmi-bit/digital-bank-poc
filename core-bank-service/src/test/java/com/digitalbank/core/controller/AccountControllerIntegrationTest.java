package com.digitalbank.core.controller;

import com.digitalbank.core.entity.Customer;
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

import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * AccountController 集成测试：完整链路 + Testcontainers PostgreSQL。
 *
 * @author Digital Bank POC Team
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class AccountControllerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("digitalbank")
            .withUsername("digitalbank")
            .withPassword("digitalbank");

    @DynamicPropertySource
    static void configureDatasource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    CustomerRepository customerRepository;

    private long customerId;

    @BeforeEach
    void setUp() {
        Customer c = new Customer();
        c.setName("集成测试客户");
        c.setStatus("active");
        c = customerRepository.save(c);
        customerId = c.getId();
    }

    @Test
    void createAccount_and_get_and_balance() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("customerId", customerId);
        body.put("accountType", "savings");

        String createRes = mvc.perform(post("/api/v1/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.data.accountId").exists())
                .andExpect(jsonPath("$.data.accountNumber").value(startsWith("62")))
                .andExpect(jsonPath("$.data.balance").value(0))
                .andExpect(jsonPath("$.data.currency").value("CNY"))
                .andExpect(jsonPath("$.data.status").value("active"))
                .andReturn().getResponse().getContentAsString();

        long accountId = objectMapper.readTree(createRes).get("data").get("accountId").asLong();

        mvc.perform(get("/api/v1/accounts/{account-id}", accountId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accountId").value(accountId))
                .andExpect(jsonPath("$.data.balance").value(0));

        mvc.perform(get("/api/v1/accounts/{account-id}/balance", accountId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accountId").value(accountId))
                .andExpect(jsonPath("$.data.balance").value(0))
                .andExpect(jsonPath("$.data.currency").value("CNY"));
    }

    @Test
    void getAccount_returns404_whenNotFound() throws Exception {
        mvc.perform(get("/api/v1/accounts/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("CBB001"));
    }

    @Test
    void createAccount_returns404_whenCustomerNotExists() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("customerId", 999999L);
        body.put("accountType", "savings");

        mvc.perform(post("/api/v1/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("CBB006"));
    }

    @Test
    void listAccounts_includesCreatedAccount() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("customerId", customerId);
        body.put("accountType", "current");

        String createRes = mvc.perform(post("/api/v1/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long accountId = objectMapper.readTree(createRes).get("data").get("accountId").asLong();

        mvc.perform(get("/api/v1/accounts").param("customerId", String.valueOf(customerId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.items[*].accountId", hasItem((int) accountId)));
    }
}
