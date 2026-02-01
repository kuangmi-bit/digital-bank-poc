/**
 * Mock 账单系统
 * 模拟水电煤、电信、信用卡账单验证和支付确认
 * ADR-008
 */

const logger = require('../utils/logger');

// Mock 账单数据
const mockBills = {
  utility: {
    '1234567890': { vendor: '国家电网', balance: 156.80, status: 'unpaid' },
    '0987654321': { vendor: '城市燃气', balance: 89.50, status: 'unpaid' },
    '1111222233': { vendor: '自来水公司', balance: 45.20, status: 'paid' },
  },
  telecom: {
    '13800138000': { vendor: '中国移动', balance: 100.00, status: 'unpaid' },
    '13900139000': { vendor: '中国联通', balance: 50.00, status: 'unpaid' },
    '18600186000': { vendor: '中国电信', balance: 0, status: 'paid' },
  },
  credit_card: {
    '6222021234567890123': { vendor: '工商银行', balance: 5000.00, status: 'unpaid' },
    '6228480812345678901': { vendor: '建设银行', balance: 2500.00, status: 'unpaid' },
  },
};

/**
 * 验证账单账户
 * @param {string} billType - utility/telecom/credit_card
 * @param {string} billAccount - 账单账户号
 * @returns {{ valid: boolean, vendor?: string, balance?: number, message?: string }}
 */
function validateBillAccount(billType, billAccount) {
  logger.info('Mock 账单验证', { billType, billAccount });

  const typeData = mockBills[billType];
  if (!typeData) {
    return { valid: false, message: '不支持的账单类型' };
  }

  const bill = typeData[billAccount];
  if (!bill) {
    return { valid: false, message: '账单账户不存在' };
  }

  if (bill.status === 'paid') {
    return { valid: true, vendor: bill.vendor, balance: 0, message: '账单已支付' };
  }

  return {
    valid: true,
    vendor: bill.vendor,
    balance: bill.balance,
    status: bill.status,
  };
}

/**
 * 确认账单支付
 * @param {string} billType
 * @param {string} billAccount
 * @param {number} amount
 * @returns {{ success: boolean, referenceNo?: string, message?: string }}
 */
function confirmPayment(billType, billAccount, amount) {
  logger.info('Mock 账单支付确认', { billType, billAccount, amount });

  const typeData = mockBills[billType];
  if (!typeData || !typeData[billAccount]) {
    return { success: false, message: '账单账户不存在' };
  }

  // 生成账单参考号
  const referenceNo = `BILL${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // 模拟更新账单状态
  typeData[billAccount].balance = Math.max(0, typeData[billAccount].balance - amount);
  if (typeData[billAccount].balance === 0) {
    typeData[billAccount].status = 'paid';
  }

  return {
    success: true,
    referenceNo,
    message: '账单支付成功',
  };
}

/**
 * 查询账单信息
 * @param {string} billType
 * @param {string} billAccount
 * @returns {{ found: boolean, data?: object }}
 */
function queryBill(billType, billAccount) {
  const typeData = mockBills[billType];
  if (!typeData || !typeData[billAccount]) {
    return { found: false };
  }

  return {
    found: true,
    data: {
      billType,
      billAccount,
      ...typeData[billAccount],
    },
  };
}

module.exports = {
  validateBillAccount,
  confirmPayment,
  queryBill,
};
