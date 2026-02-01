/**
 * 账单支付服务
 * ADR-008
 */

const { v4: uuidv4 } = require('uuid');
const BillPayment = require('../models/bill-payment');
const coreBankClient = require('../clients/core-bank-client');
const billSystem = require('../mocks/bill-system');
const logger = require('../utils/logger');
const PaymentError = require('../utils/payment-error');

/**
 * 创建账单支付
 * @param {object} params
 * @param {string} params.billType - utility/telecom/credit_card
 * @param {string} params.billAccount - 账单账户号
 * @param {number} params.amount - 支付金额
 * @param {number} params.payerAccountId - 付款人银行账户ID
 * @returns {Promise<object>} 支付结果
 */
async function createBillPayment({ billType, billAccount, amount, payerAccountId }) {
  // 1. 验证账单类型
  const validTypes = ['utility', 'telecom', 'credit_card'];
  if (!validTypes.includes(billType)) {
    throw new PaymentError('PYB010', '账单类型不支持', 400);
  }

  // 2. 验证账单信息（Mock 账单系统）
  const validation = billSystem.validateBillAccount(billType, billAccount);
  if (!validation.valid) {
    throw new PaymentError('PYB011', validation.message || '账单账户无效', 400);
  }

  // 3. 创建支付记录
  const paymentId = `BP${uuidv4().replace(/-/g, '').substring(0, 24)}`;
  const billPayment = new BillPayment({
    paymentId,
    billType,
    billAccount,
    payerAccountId,
    amount,
    status: 'pending',
    billVendor: validation.vendor,
  });
  await billPayment.save();

  logger.info('账单支付创建', { paymentId, billType, billAccount, amount });

  // 4. 调用核心银行扣款
  try {
    billPayment.status = 'processing';
    await billPayment.save();

    if (!coreBankClient.isAvailable()) {
      throw new Error('核心银行服务不可用');
    }

    const debitResult = await coreBankClient.debit(
      payerAccountId,
      amount,
      paymentId,  // refId 幂等
      `账单支付-${billType}-${billAccount}`
    );

    billPayment.transactionId = debitResult.transactionId;

    // 5. 确认账单支付（Mock）
    const confirmation = billSystem.confirmPayment(billType, billAccount, amount);
    if (!confirmation.success) {
      // 账单确认失败，但扣款已成功，记录错误（实际应退款）
      billPayment.status = 'failed';
      billPayment.errorCode = 'PYB012';
      billPayment.errorMessage = confirmation.message;
      await billPayment.save();

      logger.error('账单确认失败', { paymentId, message: confirmation.message });
      throw new PaymentError('PYB012', '账单确认失败', 500);
    }

    billPayment.billReferenceNo = confirmation.referenceNo;
    billPayment.status = 'completed';
    await billPayment.save();

    logger.info('账单支付完成', { paymentId, transactionId: debitResult.transactionId, referenceNo: confirmation.referenceNo });

    return {
      paymentId,
      billType,
      billAccount,
      amount,
      status: 'completed',
      transactionId: debitResult.transactionId,
      billReferenceNo: confirmation.referenceNo,
      billVendor: validation.vendor,
      createdAt: billPayment.createdAt,
    };

  } catch (error) {
    logger.error('账单支付失败', { paymentId, error: error.message });

    billPayment.status = 'failed';
    billPayment.errorCode = error.errorCode || 'PYB002';
    billPayment.errorMessage = error.message;
    await billPayment.save();

    if (error instanceof PaymentError) {
      throw error;
    }

    // 核心银行余额不足
    if (error.status === 400 && error.body?.errorCode === 'CBB002') {
      throw new PaymentError('PYB008', '余额不足', 400);
    }

    throw new PaymentError('PYB002', error.message || '账单支付处理失败', 500);
  }
}

/**
 * 查询账单支付
 * @param {string} paymentId
 * @returns {Promise<object>}
 */
async function getBillPayment(paymentId) {
  const payment = await BillPayment.findOne({ paymentId });
  if (!payment) {
    throw new PaymentError('PYB004', '支付记录不存在', 404);
  }
  return payment.toObject();
}

/**
 * 查询账单支付列表
 * @param {object} params
 * @param {number} params.payerAccountId
 * @param {string} [params.billType]
 * @param {string} [params.status]
 * @param {number} [params.page=1]
 * @param {number} [params.pageSize=20]
 * @returns {Promise<{ items: object[], total: number, page: number, pageSize: number }>}
 */
async function listBillPayments({ payerAccountId, billType, status, page = 1, pageSize = 20 }) {
  const query = { payerAccountId };
  if (billType) query.billType = billType;
  if (status) query.status = status;

  const skip = (Math.max(1, page) - 1) * Math.min(100, Math.max(1, pageSize));
  const limit = Math.min(100, Math.max(1, pageSize));

  const [items, total] = await Promise.all([
    BillPayment.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    BillPayment.countDocuments(query),
  ]);

  return {
    items,
    total,
    page: Math.max(1, page),
    pageSize: limit,
  };
}

/**
 * 查询账单信息
 * @param {string} billType
 * @param {string} billAccount
 * @returns {object}
 */
function queryBillInfo(billType, billAccount) {
  const validTypes = ['utility', 'telecom', 'credit_card'];
  if (!validTypes.includes(billType)) {
    throw new PaymentError('PYB010', '账单类型不支持', 400);
  }

  const result = billSystem.queryBill(billType, billAccount);
  if (!result.found) {
    throw new PaymentError('PYB011', '账单账户不存在', 404);
  }

  return result.data;
}

module.exports = {
  createBillPayment,
  getBillPayment,
  listBillPayments,
  queryBillInfo,
};
