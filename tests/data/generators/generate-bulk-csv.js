#!/usr/bin/env node
/**
 * 批量生成客户 5万+、账户 10万+ CSV，输出到 database/test-data/
 * 遵循 data-dictionary-v1.0：customers (name,id_card,phone,email,address,status)；
 * bank_accounts (account_number,customer_id,balance,currency,account_type,status)。
 * 保证 id_card、account_number 唯一；customer_id 落在 1..N 内。
 * 用法: node generate-bulk-csv.js [--customers 50100] [--accounts 100500]
 * 依赖: @faker-js/faker（可选）；无则使用内置简易生成器。
 */

const fs = require('fs');
const path = require('path');

function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function pickWeighted(arr, weights) {
  const sum = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * sum;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

function parseArg(name, def) {
  const i = process.argv.indexOf('--' + name);
  if (i === -1 || !process.argv[i + 1]) return def;
  return parseInt(process.argv[i + 1], 10) || def;
}

let faker;
try {
  const m = require('@faker-js/faker/locale/zh_CN');
  faker = m && (m.faker || m);
} catch (_) {
  try {
    const m = require('@faker-js/faker');
    if (m && m.setLocale) m.setLocale('zh_CN');
    faker = m;
  } catch (__) {
    faker = null;
  }
}

function rand(n) { return Math.floor(Math.random() * n); }
function pad(x, w) { return String(x).padStart(w, '0'); }
function rn(w) { return pad(rand(10 ** w), w); }

function genCustomer(i, N) {
  if (faker) {
    return [
      faker.person.fullName(),
      'ID' + pad(i, 8) + (faker.string?.numeric?.(8) || rn(8)),
      faker.phone.number('1##########'),
      faker.internet.email(),
      ((faker.location?.streetAddress?.() || '') + ' ' + (faker.location?.city?.() || '')).replace(/,/g, ' ').slice(0, 200),
      pickWeighted(['active', 'inactive', 'blocked'], [0.9, 0.08, 0.02]),
    ];
  }
  return [
    'Customer' + i,
    'ID' + pad(i, 8) + rn(8),
    '1' + rn(10),
    'c' + i + '@example.com',
    'Address ' + i,
    pickWeighted(['active', 'inactive', 'blocked'], [0.9, 0.08, 0.02]),
  ];
}

function genAccount(j, N) {
  const cid = (faker ? faker.number?.int?.({ min: 1, max: N }) : null) ?? (1 + rand(N));
  const bal = (Math.random() * 999999.99).toFixed(2);
  const at = (faker ? faker.helpers?.arrayElement?.(['savings', 'current']) : null) ?? (Math.random() > 0.3 ? 'savings' : 'current');
  const st = pickWeighted(['active', 'inactive', 'frozen', 'closed'], [0.85, 0.05, 0.05, 0.05]);
  return [
    'A' + pad(j, 10) + (faker?.string?.numeric?.(5) || rn(5)),
    cid,
    bal,
    'CNY',
    at,
    st,
  ];
}

const N = parseArg('customers', 50100);
const M = parseArg('accounts', 100500);
const outDir = path.join(__dirname, '..', '..', '..', 'database', 'test-data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const custHeader = ['name', 'id_card', 'phone', 'email', 'address', 'status'];
const custRows = [custHeader];
for (let i = 1; i <= N; i++) custRows.push(genCustomer(i, N));
fs.writeFileSync(path.join(outDir, 'customers.csv'), '\uFEFF' + custRows.map(r => r.map(csvEscape).join(',')).join('\n'), 'utf8');
console.log('Generated database/test-data/customers.csv: ' + N + ' rows');

const accHeader = ['account_number', 'customer_id', 'balance', 'currency', 'account_type', 'status'];
const accRows = [accHeader];
for (let j = 1; j <= M; j++) accRows.push(genAccount(j, N));
fs.writeFileSync(path.join(outDir, 'accounts.csv'), '\uFEFF' + accRows.map(r => r.map(csvEscape).join(',')).join('\n'), 'utf8');
console.log('Generated database/test-data/accounts.csv: ' + M + ' rows');

console.log('Bulk CSV 生成完成。');
