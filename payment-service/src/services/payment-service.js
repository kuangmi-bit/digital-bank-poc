/**
 * PaymentService 业务逻辑
 * 创建支付订单、支付处理、支付状态查询
 * 集成 Mock 支付网关；遵循 data-dictionary-v1.0、api-design-spec-v1.0
 */

const Payment = require('../models/payment');
const mockGateway = require('../mocks/payment-gateway');
const { PaymentError } = require('../utils/payment-error');
const logger = require('../utils/logger');
const config = require('../../config/default');
const { retryableRequest, isRetryableError } = require('../utils/retry');

const PAYMENT_ID_PREFIX = 'pay';

function generatePaymentId() {
  return `${PAYMENT_ID_PREFIX}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isTimedOut(payment) {
  const minutes = Number(config.payment?.timeoutMinutes ?? 30);
  const ttlMs = minutes * 60 * 1000;
  const createdAt = payment.createdAt ? new Date(payment.createdAt).getTime() : 0;
  return createdAt > 0 && (Date.now() - createdAt) > ttlMs;
}

function markAttempt(payment) {
  payment.lastAttemptAt = new Date();
}

function setFailureMeta(payment, code, message) {
  payment.lastErrorCode = code;
  payment.lastErrorMessage = message;
  payment.retryCount = Number(payment.retryCount || 0);
}

function canAutoRetry(payment) {
  const retryCount = Number(payment.retryCount || 0);
  if (retryCount >= 3) return false;
  return ['PYB002', 'PYS002', 'CORE_BANK_ERROR'].includes(payment.lastErrorCode);
}

/**
 * 创建支付订单（d3a2t3a）
 * @param {Object} params - { orderId, userId, accountId?, amount, currency?, channel? }
 * @returns {Promise<import('mongoose').Document>}
 */
async function createPayment(params) {
  const { orderId, userId, accountId, amount, currency = 'CNY', channel = 'mock' } = params;

  if (!orderId || !userId) {
    throw new PaymentError('PYV001', 'orderId and userId are required', 400, [
      { field: !orderId ? 'orderId' : 'userId', message: 'is required' },
    ]);
  }
  if (amount == null || Number(amount) <= 0) {
    throw new PaymentError('PYV001', 'amount must be a positive number', 400, [
      { field: 'amount', message: 'must be greater than 0' },
    ]);
  }

  const paymentId = generatePaymentId();
  const mockResult = await mockGateway.createOrder({ orderId, amount: Number(amount), currency, channel });

  const payment = new Payment({
    paymentId,
    orderId,
    userId,
    accountId: accountId || undefined,
    amount: Number(amount),
    currency,
    channel,
    status: 'pending',
    gatewayResponse: {
      gatewayOrderId: mockResult.gatewayOrderId,
      code: mockResult.code,
      message: mockResult.message,
    },
  });
  await payment.save();

  logger.info('Payment created', { paymentId, orderId, userId, amount: payment.amount });
  return payment;
}

/**
 * 支付处理（d3a2t3b、d4a2t5 ADR-005）
 * 若 payment.accountId 存在且核心银行可用：先 GET balance、再 POST debit（refId=paymentId 幂等），失败则置 failed。
 * 否则仅走 Mock 网关。
 */
async function processPayment(paymentId, options = {}) {
  let payment = await Payment.findOne({ paymentId });
  if (!payment) {
    throw new PaymentError('PYB003', 'Payment not found', 404);
  }
  if (payment.status === 'completed') {
    throw new PaymentError('PYB004', 'Order already paid', 400);
  }
  if (payment.status === 'cancelled') {
    throw new PaymentError('PYB005', 'Order cannot be processed', 400);
  }
  if (payment.status === 'failed' && !canAutoRetry(payment)) {
    throw new PaymentError('PYB005', 'Order cannot be processed', 400);
  }

  // 超时保护（Day 5：PYB001）
  if (isTimedOut(payment)) {
    payment.status = 'failed';
    setFailureMeta(payment, 'PYB001', 'Payment timeout');
    markAttempt(payment);
    await payment.save();
    throw new PaymentError('PYB001', 'Payment timeout', 408);
  }

  // 并发幂等锁：仅允许 pending/failed(可重试) -> processing 的单次占用
  const fromStatuses = payment.status === 'failed' ? ['failed'] : ['pending'];
  const locked = await Payment.findOneAndUpdate(
    { paymentId, status: { $in: fromStatuses } },
    {
      $set: { status: 'processing' },
      $inc: payment.status === 'failed' ? { retryCount: 1 } : {},
      $setOnInsert: {},
    },
    { new: true }
  );
  if (!locked) {
    // 其他请求已在处理中：直接返回最新状态
    return Payment.findOne({ paymentId });
  }
  payment = locked;
  payment.gatewayResponse = payment.gatewayResponse || {};
  markAttempt(payment);
  await payment.save();

  const coreBank = require('../clients/core-bank-client');
  if (payment.accountId && coreBank.isAvailable()) {
    try {
      const balance = await retryableRequest(() => coreBank.getBalance(payment.accountId));
      if (Number(balance.balance) < Number(payment.amount)) {
        payment.status = 'failed';
        const prev = (payment.gatewayResponse && typeof payment.gatewayResponse.toObject === 'function')
          ? payment.gatewayResponse.toObject() : (payment.gatewayResponse || {});
        payment.gatewayResponse = { ...prev, code: 'PYB008', message: 'Insufficient balance' };
        setFailureMeta(payment, 'PYB008', 'Insufficient balance');
        markAttempt(payment);
        await payment.save();
        logger.info('Payment failed: insufficient balance', { paymentId, accountId: payment.accountId });
        return payment;
      }
      await retryableRequest(() => coreBank.debit(
        payment.accountId,
        payment.amount,
        paymentId,
        `payment:${payment.orderId || paymentId}`
      ));
    } catch (e) {
      payment.status = 'failed';
      const prev = (payment.gatewayResponse && typeof payment.gatewayResponse.toObject === 'function')
        ? payment.gatewayResponse.toObject() : (payment.gatewayResponse || {});
      payment.gatewayResponse = {
        ...prev,
        code: 'CORE_BANK_ERROR',
        message: e.message || 'Core bank unavailable',
      };
      // 外部依赖错误归类：核心银行不可用 -> PYS002（外部服务异常）
      setFailureMeta(payment, 'PYS002', e.message || 'Core bank unavailable');
      markAttempt(payment);
      await payment.save();
      logger.warn('Payment failed: core bank', { paymentId, error: e.message });
      return payment;
    }
  }

  let mockResult;
  try {
    mockResult = await mockGateway.processPayment({
      paymentId,
      orderId: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      gatewayOrderId: payment.gatewayResponse?.gatewayOrderId,
      channel: payment.channel,
    }, { simulateFailure: options.simulateFailure === true });
  } catch (e) {
    // 外部渠道异常：可重试（Day 5）
    payment.status = 'failed';
    const prev = payment.gatewayResponse && typeof payment.gatewayResponse.toObject === 'function'
      ? payment.gatewayResponse.toObject()
      : (payment.gatewayResponse || {});
    payment.gatewayResponse = { ...prev, code: 'PYB002', message: e.message || 'Channel unavailable' };
    setFailureMeta(payment, 'PYB002', e.message || 'Channel unavailable');
    markAttempt(payment);
    await payment.save();
    logger.warn('Payment failed: gateway exception', { paymentId, error: e.message });
    return payment;
  }

  payment.status = mockResult.code === 'MOCK_SUCCESS' ? 'completed' : 'failed';
  const prev = payment.gatewayResponse && typeof payment.gatewayResponse.toObject === 'function'
    ? payment.gatewayResponse.toObject()
    : (payment.gatewayResponse || {});
  payment.gatewayResponse = {
    ...prev,
    code: mockResult.code,
    message: mockResult.message,
    paidAt: mockResult.paidAt,
    gatewayOrderId: mockResult.gatewayOrderId || prev.gatewayOrderId,
  };
  if (payment.status === 'failed') {
    // Mock 网关失败：默认视为渠道不可用（PYB002，允许重试）；simulateFailure 场景会返回 MOCK_FAILED
    const errCode = mockResult.code === 'MOCK_FAILED' ? 'PYB002' : 'PYB002';
    setFailureMeta(payment, errCode, mockResult.message || 'Payment failed');
  } else {
    payment.lastErrorCode = undefined;
    payment.lastErrorMessage = undefined;
  }
  markAttempt(payment);
  await payment.save();

  logger.info('Payment processed', { paymentId, status: payment.status });
  return payment;
}

/**
 * 支付状态查询（d3a2t3c）
 * @param {string} paymentId
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function getPaymentById(paymentId) {
  const payment = await Payment.findOne({ paymentId });
  if (!payment) return null;

  // Day 5：支付状态同步（processing 时尝试从网关查询并落库）
  if (payment.status === 'processing') {
    try {
      const sync = await retryableRequest(() => mockGateway.queryStatus(paymentId, payment.gatewayResponse?.gatewayOrderId));
      if (sync && sync.status && ['completed', 'failed'].includes(sync.status)) {
        payment.status = sync.status;
        const prev = (payment.gatewayResponse && typeof payment.gatewayResponse.toObject === 'function')
          ? payment.gatewayResponse.toObject() : (payment.gatewayResponse || {});
        payment.gatewayResponse = {
          ...prev,
          code: sync.code || prev.code,
          message: sync.status,
          paidAt: sync.paidAt ? new Date(sync.paidAt) : prev.paidAt,
          gatewayOrderId: sync.gatewayOrderId || prev.gatewayOrderId,
        };
        markAttempt(payment);
        await payment.save();
      }
    } catch (e) {
      logger.warn('Payment status sync failed', { paymentId, error: e.message });
    }
  }

  return payment;
}

module.exports = {
  createPayment,
  processPayment,
  getPaymentById,
  generatePaymentId,
};
