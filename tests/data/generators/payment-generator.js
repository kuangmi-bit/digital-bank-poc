/**
 * 支付与清算测试数据生成
 * 遵循 naming-conventions、technical-standards-v1.0
 */

const { faker } = require('@faker-js/faker/locale/zh_CN');

const generatePayment = (overrides = {}) => ({
  orderId: `ORD-${faker.string.alphanumeric(10).toUpperCase()}`,
  amount: faker.number.float({ min: 0.01, max: 50000, fractionDigits: 2 }),
  currency: 'CNY',
  channel: faker.helpers.arrayElement(['BANK_TRANSFER', 'WECHAT_PAY', 'ALIPAY', 'UNION_PAY']),
  status: faker.helpers.arrayElement(['pending', 'processing', 'completed', 'failed']),
  createdAt: faker.date.recent().toISOString(),
  ...overrides,
});

const generateSettlement = (overrides = {}) => ({
  settlementId: `STL${faker.string.numeric(12)}`,
  date: faker.date.recent().toISOString().slice(0, 10),
  totalCount: faker.number.int({ min: 1, max: 1000 }),
  totalAmount: faker.number.float({ min: 100, max: 1000000, fractionDigits: 2 }),
  status: faker.helpers.arrayElement(['pending', 'reconciled', 'discrepancy']),
  ...overrides,
});

const generatePayments = (count, overrides = {}) =>
  Array.from({ length: count }, () => generatePayment(overrides));
const generateSettlements = (count, overrides = {}) =>
  Array.from({ length: count }, () => generateSettlement(overrides));

module.exports = {
  generatePayment,
  generateSettlement,
  generatePayments,
  generateSettlements,
};
