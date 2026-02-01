package com.digitalbank.core.security;

import java.util.regex.Pattern;

/**
 * 敏感数据脱敏工具，Day 11 安全加固。
 * 用于日志输出时对账户号、身份证号、手机号等敏感信息进行脱敏处理。
 *
 * 遵循 Day 9 安全复核报告建议：实现统一的日志脱敏 Filter。
 *
 * @author Digital Bank POC Team
 */
public final class SensitiveDataMasker {

    private SensitiveDataMasker() {
        // 工具类禁止实例化
    }

    // 账户号正则：以 62 开头的 16 位数字
    private static final Pattern ACCOUNT_NUMBER_PATTERN = Pattern.compile("62\\d{14}");

    // 身份证号正则：18 位（最后一位可能是 X）
    private static final Pattern ID_CARD_PATTERN = Pattern.compile("\\d{17}[\\dXx]");

    // 手机号正则：以 1 开头的 11 位数字
    private static final Pattern PHONE_PATTERN = Pattern.compile("1[3-9]\\d{9}");

    // 银行卡号正则：16-19 位数字
    private static final Pattern CARD_NUMBER_PATTERN = Pattern.compile("\\d{16,19}");

    /**
     * 脱敏账户号：保留前 4 后 4，中间用 * 替换。
     * 例：6212345678901234 -> 6212****1234
     *
     * @param accountNumber 账户号
     * @return 脱敏后的字符串
     */
    public static String maskAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.length() < 8) {
            return accountNumber;
        }
        int len = accountNumber.length();
        return accountNumber.substring(0, 4) + "****" + accountNumber.substring(len - 4);
    }

    /**
     * 脱敏账户 ID：保留前 3 位，后面用 *** 替换。
     * 例：12345 -> 123***
     *
     * @param accountId 账户 ID
     * @return 脱敏后的字符串
     */
    public static String maskAccountId(Long accountId) {
        if (accountId == null) {
            return "null";
        }
        String idStr = accountId.toString();
        if (idStr.length() <= 3) {
            return idStr + "***";
        }
        return idStr.substring(0, 3) + "***";
    }

    /**
     * 脱敏身份证号：保留前 3 后 4，中间用 * 替换。
     * 例：110101199001011234 -> 110***********1234
     *
     * @param idCard 身份证号
     * @return 脱敏后的字符串
     */
    public static String maskIdCard(String idCard) {
        if (idCard == null || idCard.length() < 7) {
            return idCard;
        }
        int len = idCard.length();
        return idCard.substring(0, 3) + "***********" + idCard.substring(len - 4);
    }

    /**
     * 脱敏手机号：保留前 3 后 4，中间用 * 替换。
     * 例：13812345678 -> 138****5678
     *
     * @param phone 手机号
     * @return 脱敏后的字符串
     */
    public static String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) {
            return phone;
        }
        int len = phone.length();
        return phone.substring(0, 3) + "****" + phone.substring(len - 4);
    }

    /**
     * 脱敏姓名：保留首字，后面用 * 替换。
     * 例：张三 -> 张*，张三丰 -> 张**
     *
     * @param name 姓名
     * @return 脱敏后的字符串
     */
    public static String maskName(String name) {
        if (name == null || name.length() < 2) {
            return name;
        }
        return name.charAt(0) + "*".repeat(name.length() - 1);
    }

    /**
     * 脱敏金额：对大额金额进行模糊处理（可选）。
     * 例：1234567.89 -> 123****（保留前 3 位）
     *
     * @param amount 金额字符串
     * @return 脱敏后的字符串
     */
    public static String maskAmount(String amount) {
        if (amount == null || amount.length() < 4) {
            return amount;
        }
        return amount.substring(0, 3) + "****";
    }

    /**
     * 脱敏交易 ID：保留前 6 后 4，中间用 * 替换。
     * 例：TX1234567890abcdef1234O -> TX1234****1234O
     *
     * @param transactionId 交易 ID
     * @return 脱敏后的字符串
     */
    public static String maskTransactionId(String transactionId) {
        if (transactionId == null || transactionId.length() < 10) {
            return transactionId;
        }
        int len = transactionId.length();
        return transactionId.substring(0, 6) + "****" + transactionId.substring(len - 5);
    }

    /**
     * 自动检测并脱敏字符串中的敏感信息。
     * 支持自动识别账户号、身份证、手机号、银行卡号。
     *
     * @param text 原始文本
     * @return 脱敏后的文本
     */
    public static String autoMask(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }

        String result = text;

        // 脱敏账户号
        result = ACCOUNT_NUMBER_PATTERN.matcher(result).replaceAll(match -> maskAccountNumber(match.group()));

        // 脱敏身份证号
        result = ID_CARD_PATTERN.matcher(result).replaceAll(match -> maskIdCard(match.group()));

        // 脱敏手机号
        result = PHONE_PATTERN.matcher(result).replaceAll(match -> maskPhone(match.group()));

        // 脱敏银行卡号（16-19 位）- 在账户号之后处理，避免重复脱敏
        result = CARD_NUMBER_PATTERN.matcher(result).replaceAll(match -> {
            String cardNum = match.group();
            if (cardNum.length() >= 16 && cardNum.length() <= 19) {
                return cardNum.substring(0, 4) + "****" + cardNum.substring(cardNum.length() - 4);
            }
            return cardNum;
        });

        return result;
    }

    /**
     * 日志格式化辅助：转账日志脱敏输出。
     *
     * @param fromAccountId 转出账户 ID
     * @param toAccountId   转入账户 ID
     * @param amount        金额
     * @return 脱敏后的日志字符串
     */
    public static String formatTransferLog(Long fromAccountId, Long toAccountId, Object amount) {
        return String.format("from=%s, to=%s, amount=%s",
                maskAccountId(fromAccountId),
                maskAccountId(toAccountId),
                amount);
    }
}
