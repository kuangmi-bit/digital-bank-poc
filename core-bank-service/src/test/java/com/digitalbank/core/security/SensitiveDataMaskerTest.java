package com.digitalbank.core.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 敏感数据脱敏工具单元测试，Day 11。
 */
class SensitiveDataMaskerTest {

    @Test
    @DisplayName("脱敏账户号：保留前 4 后 4")
    void maskAccountNumber() {
        assertEquals("6212****1234", SensitiveDataMasker.maskAccountNumber("6212345678901234"));
        assertEquals("6200****5678", SensitiveDataMasker.maskAccountNumber("6200111122335678"));
    }

    @Test
    @DisplayName("脱敏账户号：短字符串不处理")
    void maskAccountNumber_Short() {
        assertEquals("1234567", SensitiveDataMasker.maskAccountNumber("1234567"));
        assertNull(SensitiveDataMasker.maskAccountNumber(null));
    }

    @Test
    @DisplayName("脱敏账户 ID：保留前 3 位")
    void maskAccountId() {
        assertEquals("123***", SensitiveDataMasker.maskAccountId(12345L));
        assertEquals("100***", SensitiveDataMasker.maskAccountId(100L));
        assertEquals("1***", SensitiveDataMasker.maskAccountId(1L));
        assertEquals("null", SensitiveDataMasker.maskAccountId(null));
    }

    @Test
    @DisplayName("脱敏身份证号：保留前 3 后 4")
    void maskIdCard() {
        assertEquals("110***********1234", SensitiveDataMasker.maskIdCard("110101199001011234"));
        assertEquals("320***********123X", SensitiveDataMasker.maskIdCard("32010119900101123X"));
    }

    @Test
    @DisplayName("脱敏手机号：保留前 3 后 4")
    void maskPhone() {
        assertEquals("138****5678", SensitiveDataMasker.maskPhone("13812345678"));
        assertEquals("199****1234", SensitiveDataMasker.maskPhone("19900001234"));
    }

    @Test
    @DisplayName("脱敏姓名：保留首字")
    void maskName() {
        assertEquals("张*", SensitiveDataMasker.maskName("张三"));
        assertEquals("张**", SensitiveDataMasker.maskName("张三丰"));
        assertEquals("欧****", SensitiveDataMasker.maskName("欧阳修改名"));
    }

    @Test
    @DisplayName("脱敏交易 ID：保留前 6 后 5")
    void maskTransactionId() {
        assertEquals("TX1234****1234O", SensitiveDataMasker.maskTransactionId("TX1234567890abcdef1234O"));
    }

    @Test
    @DisplayName("自动脱敏：检测并脱敏敏感信息")
    void autoMask() {
        // 账户号
        String text1 = "转账账户：6212345678901234";
        assertTrue(SensitiveDataMasker.autoMask(text1).contains("6212****1234"));

        // 手机号
        String text2 = "联系电话：13812345678";
        assertTrue(SensitiveDataMasker.autoMask(text2).contains("138****5678"));

        // 身份证
        String text3 = "身份证号：110101199001011234";
        assertTrue(SensitiveDataMasker.autoMask(text3).contains("110***********1234"));
    }

    @Test
    @DisplayName("自动脱敏：混合多种敏感信息")
    void autoMask_Multiple() {
        String text = "用户手机 13812345678 账户 6212345678901234 进行转账";
        String masked = SensitiveDataMasker.autoMask(text);

        assertTrue(masked.contains("138****5678"));
        assertTrue(masked.contains("6212****1234"));
    }

    @Test
    @DisplayName("自动脱敏：空字符串和 null")
    void autoMask_Empty() {
        assertEquals("", SensitiveDataMasker.autoMask(""));
        assertNull(SensitiveDataMasker.autoMask(null));
    }

    @Test
    @DisplayName("转账日志格式化")
    void formatTransferLog() {
        String log = SensitiveDataMasker.formatTransferLog(12345L, 67890L, "10000.00");
        assertEquals("from=123***, to=678***, amount=10000.00", log);
    }
}
