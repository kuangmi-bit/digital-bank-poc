/**
 * 支付回调处理（Day 4 d4a2t3）
 * 根据 payload 查 Payment、校验、更新 status；可选入队 Bull 做后续处理
 */

const Payment = require('../models/payment');
const { addCallbackJob } = require('../queues/payment-callback-queue');
const logger = require('../utils/logger');

const ALLOWED_FROM = ['processing'];
const ALLOWED_TO = ['completed', 'failed'];

/**
 * 处理支付网关回调
 * @param {Object} payload - { paymentId, status, gatewayOrderId?, code?, message? }
 * @param {Object} headers - 请求头，Mock 下可校验 X-Callback-Signature
 * @returns {Promise<{ processed: boolean, paymentId?: string, reason?: string }>}
 */
async function handleCallback(payload, headers = {}) {
  const { paymentId, status } = payload || {};
  if (!paymentId || !status) {
    return { processed: false, reason: 'paymentId and status are required' };
  }

  const payment = await Payment.findOne({ paymentId });
  if (!payment) {
    return { processed: false, reason: 'not_found', paymentId };
  }

  if (!ALLOWED_FROM.includes(payment.status)) {
    return { processed: false, reason: 'invalid_state', paymentId, currentStatus: payment.status };
  }

  if (!ALLOWED_TO.includes(status)) {
    return { processed: false, reason: 'invalid_status', paymentId, status };
  }

  // Mock：可选的简单签名校验；正式可替换为渠道验签
  const sig = headers['x-callback-signature'] || headers['X-Callback-Signature'];
  if (payment.channel !== 'mock' && sig === undefined) {
    // 非 mock 渠道时若未提供签名可拒绝；POC 放宽
  }

  payment.status = status;
  const prev = (payment.gatewayResponse && typeof payment.gatewayResponse.toObject === 'function')
    ? payment.gatewayResponse.toObject() : (payment.gatewayResponse || {});
  payment.gatewayResponse = {
    ...prev,
    code: payload.code || (status === 'completed' ? 'CALLBACK_SUCCESS' : 'CALLBACK_FAILED'),
    message: payload.message || status,
    gatewayOrderId: payload.gatewayOrderId ?? prev.gatewayOrderId,
  };
  await payment.save();

  logger.info('Callback handled', { paymentId, status });

  try {
    await addCallbackJob({ paymentId, callbackData: payload });
  } catch (e) {
    logger.warn('addCallbackJob after handleCallback failed', { paymentId, error: e.message });
  }

  return { processed: true, paymentId };
}

module.exports = { handleCallback };
