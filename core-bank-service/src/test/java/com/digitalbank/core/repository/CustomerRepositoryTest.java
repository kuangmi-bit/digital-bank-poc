package com.digitalbank.core.repository;

import com.digitalbank.core.config.JpaConfig;
import com.digitalbank.core.entity.Customer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * CustomerRepository 单元测试。
 * <p>
 * 使用 @DataJpaTest 与 Testcontainers PostgreSQL，验证 Repository 基本 CRUD 与派生查询。
 * Flyway 迁移由 ImportAutoConfiguration 引入以确保表结构存在。
 * </p>
 *
 * @author Digital Bank POC Team
 */
@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(JpaConfig.class)
@ImportAutoConfiguration(FlywayAutoConfiguration.class)
class CustomerRepositoryTest {

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
    CustomerRepository customerRepository;

    @Autowired
    TestEntityManager entityManager;

    @Test
    void shouldSaveAndFindById() {
        Customer c = new Customer();
        c.setName("张三");
        c.setStatus("active");
        Customer saved = customerRepository.save(c);
        entityManager.flush();
        entityManager.clear();

        Optional<Customer> found = customerRepository.findById(saved.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("张三");
        assertThat(found.get().getStatus()).isEqualTo("active");
        assertThat(found.get().getCreatedAt()).isNotNull();
        assertThat(found.get().getUpdatedAt()).isNotNull();
    }

    @Test
    void shouldFindByIdCard() {
        Customer c = new Customer();
        c.setName("李四");
        c.setIdCard("110101199001011234");
        c.setStatus("active");
        customerRepository.save(c);
        entityManager.flush();
        entityManager.clear();

        Optional<Customer> found = customerRepository.findByIdCard("110101199001011234");
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("李四");
    }

    @Test
    void shouldReturnEmptyWhenIdCardNotExists() {
        Optional<Customer> found = customerRepository.findByIdCard("nonexistent");
        assertThat(found).isEmpty();
    }
}
