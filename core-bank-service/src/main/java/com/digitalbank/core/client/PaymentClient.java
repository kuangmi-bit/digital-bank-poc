package com.digitalbank.core.client;

/**
 * 支付服务客户端（接口）。
 * <p>
 * Day 6：为规避 JDK 25 下 Mockito/Byte Buddy inline mock 兼容性问题，将客户端抽象为接口，便于测试替换/Mock。
 * </p>
 */
public interface PaymentClient {

    /**
     * 投递支付回调。
     */
    void sendCallback(PaymentCallbackRequestDto req);
}

