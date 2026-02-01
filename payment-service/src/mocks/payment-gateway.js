/**
 * Mock 支付网关接口
 * 用于开发与测试，模拟支付渠道响应
 * 遵循 naming-conventions (camelCase 方法名、变量名)
 */

const logger = require('../utils/logger');

/**
 * 生成模拟的网关订单号
 */
function generateGatewayOrderId() {
  return `MOCK_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * 创建支付订单（Mock：仅返回可用的网关单号等信息）
 * @param {Object} params - { orderId, amount, currency, channel }
 * @returns {Promise<{ gatewayOrderId: string, code: string, message: string }>}
 */
async function createOrder(params) {
  const { orderId, amount, currency = 'CNY', channel = 'mock' } = params;
  const gatewayOrderId = generateGatewayOrderId();
  logger.info('Mock gateway createOrder', { orderId, gatewayOrderId, amount, channel });

  return {
    gatewayOrderId,
    code: 'MOCK_SUCCESS',
    message: 'Order created',
  };
}

/**
 * 处理支付（Mock：模拟成功或可配置的失败）
 * @param {Object} params - { paymentId, orderId, amount, currency, gatewayOrderId, channel }
 * @param {Object} [options] - { simulateFailure?: boolean }
 * @returns {Promise<{ code: string, message: string, paidAt?: string }>}
 */
async function processPayment(params, options = {}) {
  const { paymentId, orderId, amount, gatewayOrderId } = params;
  logger.info('Mock gateway processPayment', { paymentId, orderId, amount });

  if (options.simulateFailure) {
    return {
      code: 'MOCK_FAILED',
      message: 'Simulated gateway failure',
    };
  }

  // 模拟短延迟
  await new Promise((r) => setTimeout(r, 50));

  return {
    code: 'MOCK_SUCCESS',
    message: 'Payment completed',
    paidAt: new Date().toISOString(),
    gatewayOrderId: gatewayOrderId || generateGatewayOrderId(),
  };
}

/**
 * 查询支付状态（Mock）
 * @param {string} paymentId - 支付单号
 * @param {string} [gatewayOrderId] - 网关订单号
 * @returns {Promise<{ code: string, status: string, paidAt?: string }>}
 */
async function queryStatus(paymentId, gatewayOrderId) {
  logger.info('Mock gateway queryStatus', { paymentId, gatewayOrderId });

  return {
    code: 'MOCK_SUCCESS',
    status: 'completed',
    paidAt: new Date().toISOString(),
    gatewayOrderId: gatewayOrderId || generateGatewayOrderId(),
  };
}

module.exports = {
  createOrder,
  processPayment,
  queryStatus,
  generateGatewayOrderId,
};
