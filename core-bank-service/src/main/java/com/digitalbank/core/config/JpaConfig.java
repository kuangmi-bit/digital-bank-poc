package com.digitalbank.core.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JPA 配置：启用审计（created_at、updated_at 自动维护）。
 *
 * @author Digital Bank POC Team
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
}
