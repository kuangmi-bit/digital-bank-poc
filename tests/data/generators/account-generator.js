/**
 * 账户与客户测试数据生成
 * 遵循 naming-conventions、technical-standards-v1.0
 * 使用 @faker-js/faker
 */

const { faker } = require('@faker-js/faker/locale/zh_CN');

const generateAccount = (overrides = {}) => ({
  accountNumber: faker.string.numeric(16),
  customerId: overrides.customerId ?? faker.number.int({ min: 1, max: 99999 }),
  balance: faker.number.float({ min: 0, max: 1000000, fractionDigits: 2 }),
  status: faker.helpers.arrayElement(['active', 'inactive', 'frozen']),
  accountType: faker.helpers.arrayElement(['savings', 'checking']),
  currency: 'CNY',
  createdAt: faker.date.past().toISOString(),
  ...overrides,
});

const generateCustomer = (overrides = {}) => ({
  name: faker.person.fullName(),
  idNumber: faker.string.numeric(18),
  phone: faker.phone.number('1##########'),
  email: faker.internet.email(),
  ...overrides,
});

const generateTransaction = (overrides = {}) => ({
  transactionId: `TXN${faker.string.numeric(12)}`,
  fromAccountId: overrides.fromAccountId ?? faker.string.uuid().slice(0, 8),
  toAccountId: overrides.toAccountId ?? faker.string.uuid().slice(0, 8),
  amount: faker.number.float({ min: 1, max: 50000, fractionDigits: 2 }),
  type: faker.helpers.arrayElement(['transfer', 'deposit', 'withdrawal']),
  status: faker.helpers.arrayElement(['pending', 'completed', 'failed']),
  currency: 'CNY',
  createdAt: faker.date.recent().toISOString(),
  ...overrides,
});

const generateAccounts = (count) => Array.from({ length: count }, generateAccount);
const generateCustomers = (count) => Array.from({ length: count }, generateCustomer);
const generateTransactions = (count, overrides = {}) =>
  Array.from({ length: count }, () => generateTransaction(overrides));

module.exports = {
  generateAccount,
  generateCustomer,
  generateTransaction,
  generateAccounts,
  generateCustomers,
  generateTransactions,
};
