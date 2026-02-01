package com.digitalbank.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 核心银行服务启动类。
 * <p>
 * 数字银行 POC - 核心银行服务引擎，提供账户管理、交易处理、客户信息等 REST API。
 * 技术栈：Java 17, Spring Boot 3.x, PostgreSQL 15, Spring Data JPA.
 * </p>
 *
 * @author Digital Bank POC Team
 * @see com.digitalbank.core.controller
 * @see com.digitalbank.core.service
 * @see com.digitalbank.core.repository
 */
@SpringBootApplication
@EnableScheduling
public class CoreBankApplication {

    public static void main(String[] args) {
        SpringApplication.run(CoreBankApplication.class, args);
    }
}
