/**
 * 核心银行服务 HTTP 客户端（ADR-005）
 * GET /api/v1/accounts/{account-id}/balance
 * POST /api/v1/transactions/debit（refId=paymentId 幂等）
 * Header: X-Caller-Service: payment-service, X-Request-ID
 */

const config = require('../../config/default');
const logger = require('../utils/logger');

const TIMEOUT_MS = 10000;
const CALLER_SERVICE = 'payment-service';

function isAvailable() {
  return !!(config.coreBank && config.coreBank.serviceUrl);
}

function parseAccountId(accountId) {
  const n = typeof accountId === 'string' ? parseInt(accountId, 10) : Number(accountId);
  if (Number.isNaN(n) || n < 1) {
    throw new Error(`Invalid accountId: ${accountId}`);
  }
  return n;
}

/**
 * 余额查询 GET /api/v1/accounts/{account-id}/balance
 * @returns {Promise<{ accountId: number, balance: number, currency: string }>}
 */
async function getBalance(accountId) {
  const base = config.coreBank?.serviceUrl;
  if (!base) {
    throw new Error('Core bank service URL not configured (CORE_BANK_SERVICE_URL)');
  }
  const aid = parseAccountId(accountId);
  const url = `${base.replace(/\/$/, '')}/api/v1/accounts/${aid}/balance`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Caller-Service': CALLER_SERVICE,
    'X-Request-ID': typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}`,
  };

  const ac = new AbortController();
  const to = setTimeout(() => ac.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, { method: 'GET', headers, signal: ac.signal });
    clearTimeout(to);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = body.message || body.errorCode || res.statusText;
      const err = new Error(msg);
      err.status = res.status;
      err.body = body;
      throw err;
    }
    return {
      accountId: body.accountId ?? aid,
      balance: Number(body.balance),
      currency: body.currency || 'CNY',
    };
  } catch (e) {
    clearTimeout(to);
    if (e.name === 'AbortError') {
      const err = new Error('Core bank request timeout');
      err.status = 504;
      throw err;
    }
    throw e;
  }
}

/**
 * 支付扣款 POST /api/v1/transactions/debit（refId 幂等，ADR-005）
 * @param {string|number} accountId
 * @param {number} amount
 * @param {string} refId - 如 paymentId，幂等键
 * @param {string} [remark]
 * @returns {Promise<{ transactionId: string, accountId: number, amount: number, status: string }>}
 */
async function debit(accountId, amount, refId, remark) {
  const base = config.coreBank?.serviceUrl;
  if (!base) {
    throw new Error('Core bank service URL not configured (CORE_BANK_SERVICE_URL)');
  }
  const aid = parseAccountId(accountId);
  const url = `${base.replace(/\/$/, '')}/api/v1/transactions/debit`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Caller-Service': CALLER_SERVICE,
    'X-Request-ID': typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}`,
  };
  const body = { accountId: aid, amount: Number(amount), refId: String(refId) };
  if (remark != null) body.remark = String(remark);

  const ac = new AbortController();
  const to = setTimeout(() => ac.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: ac.signal,
    });
    clearTimeout(to);
    const data = await res.json().catch(() => ({}));
    const payload = data.data || data;
    if (!res.ok) {
      const msg = data.message || data.errorCode || res.statusText;
      const err = new Error(msg);
      err.status = res.status;
      err.body = data;
      throw err;
    }
    return {
      transactionId: payload.transactionId,
      accountId: payload.accountId ?? aid,
      amount: payload.amount ?? amount,
      status: payload.status || 'completed',
    };
  } catch (e) {
    clearTimeout(to);
    if (e.name === 'AbortError') {
      const err = new Error('Core bank debit request timeout');
      err.status = 504;
      throw err;
    }
    throw e;
  }
}

module.exports = {
  isAvailable,
  getBalance,
  debit,
};
