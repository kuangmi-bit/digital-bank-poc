#!/usr/bin/env node
/**
 * 测试数据生成入口
 * 用法: node run-generate.js [account|payment|all] [count]
 * 输出到 tests/data/output/
 */

const fs = require('fs');
const path = require('path');

const count = parseInt(process.argv[3] || '10', 10);
const type = (process.argv[2] || 'all').toLowerCase();
const outDir = path.join(__dirname, '..', 'output');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function writeJson(name, data) {
  const file = path.join(outDir, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Generated ${file}`);
}

try {
  if (type === 'account' || type === 'all') {
    const { generateAccounts, generateCustomers, generateTransactions } = require('./account-generator');
    writeJson('accounts', generateAccounts(count));
    writeJson('customers', generateCustomers(count));
    writeJson('transactions', generateTransactions(count));
  }
  if (type === 'payment' || type === 'all') {
    const { generatePayments, generateSettlements } = require('./payment-generator');
    writeJson('payments', generatePayments(count));
    writeJson('settlements', generateSettlements(Math.min(count, 5)));
  }
  if (type !== 'account' && type !== 'payment' && type !== 'all') {
    console.log('Usage: node run-generate.js [account|payment|all] [count]');
    process.exit(1);
  }
} catch (e) {
  console.error(e);
  process.exit(1);
}
