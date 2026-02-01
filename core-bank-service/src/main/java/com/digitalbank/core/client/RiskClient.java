package com.digitalbank.core.client;

import java.math.BigDecimal;

/**
 * 风控服务客户端（接口）。
 * <p>
 * Day 6：为规避 JDK 25 下 Mockito/Byte Buddy inline mock 兼容性问题，将客户端抽象为接口，便于测试替换/Mock。
 * </p>
 */
public interface RiskClient {

    /**
     * 行内转账前风控检查。通过则返回；拦截/异常则抛出 BusinessException。
     */
    void checkTransfer(Long customerId, Long accountId, BigDecimal amount, Long recipientAccountId);
}
