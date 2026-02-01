package com.digitalbank.core.security;

import ch.qos.logback.classic.PatternLayout;
import ch.qos.logback.classic.spi.ILoggingEvent;

/**
 * Logback 日志脱敏布局，Day 11 安全加固。
 * 自动对日志中的敏感信息进行脱敏处理。
 *
 * 使用方式：在 logback-spring.xml 中配置：
 * <pre>
 * &lt;layout class="com.digitalbank.core.security.MaskingPatternLayout"&gt;
 *     &lt;pattern&gt;%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n&lt;/pattern&gt;
 * &lt;/layout&gt;
 * </pre>
 *
 * @author Digital Bank POC Team
 */
public class MaskingPatternLayout extends PatternLayout {

    @Override
    public String doLayout(ILoggingEvent event) {
        String message = super.doLayout(event);
        return SensitiveDataMasker.autoMask(message);
    }
}
