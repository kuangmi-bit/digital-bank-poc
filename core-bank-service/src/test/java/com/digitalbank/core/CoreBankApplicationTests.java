package com.digitalbank.core;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * 核心银行服务启动与上下文加载测试。
 * <p>
 * 使用 Testcontainers 启动 PostgreSQL，验证 Spring 上下文、数据源与 Flyway 迁移。
 * </p>
 *
 * @author Digital Bank POC Team
 */
@SpringBootTest
@Testcontainers
class CoreBankApplicationTests {

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

    @Test
    void contextLoads() {
    }
}
