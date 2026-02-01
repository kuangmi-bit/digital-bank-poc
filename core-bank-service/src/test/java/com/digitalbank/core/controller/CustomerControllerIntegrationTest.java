package com.digitalbank.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * CustomerController 集成测试：客户注册、查询、更新。
 *
 * @author Digital Bank POC Team
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class CustomerControllerIntegrationTest {

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

    @Test
    void createCustomer_and_get() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("name", "集成测试客户");
        body.put("phone", "13800138000");
        body.put("email", "test@example.com");

        String createRes = mvc.perform(post("/api/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.data.customerId").exists())
                .andExpect(jsonPath("$.data.name").value("集成测试客户"))
                .andExpect(jsonPath("$.data.phone").value("13800138000"))
                .andExpect(jsonPath("$.data.status").value("active"))
                .andReturn().getResponse().getContentAsString();

        long customerId = objectMapper.readTree(createRes).get("data").get("customerId").asLong();

        mvc.perform(get("/api/v1/customers/{customer-id}", customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.customerId").value(customerId))
                .andExpect(jsonPath("$.data.name").value("集成测试客户"));
    }

    @Test
    void updateCustomer_success() throws Exception {
        Map<String, Object> createBody = new HashMap<>();
        createBody.put("name", "待更新客户");
        String createRes = mvc.perform(post("/api/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createBody)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long customerId = objectMapper.readTree(createRes).get("data").get("customerId").asLong();

        Map<String, Object> updateBody = new HashMap<>();
        updateBody.put("phone", "13900139000");
        updateBody.put("address", "北京市海淀区");

        mvc.perform(put("/api/v1/customers/{customer-id}", customerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.phone").value("13900139000"))
                .andExpect(jsonPath("$.data.address").value("北京市海淀区"));

        mvc.perform(get("/api/v1/customers/{customer-id}", customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.phone").value("13900139000"));
    }

    @Test
    void getCustomer_returns404_whenNotFound() throws Exception {
        mvc.perform(get("/api/v1/customers/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("CBB006"));
    }
}
