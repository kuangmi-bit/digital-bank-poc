/**
 * SettlementService 业务逻辑
 * 对账、清算处理、查询清算状态；遵循 data-dictionary-v1.0、api-design-spec-v1.0、ADR-005
 */

const Settlement = require('../models/settlement');
const Payment = require('../models/payment');
const { PaymentError } = require('../utils/payment-error');
const logger = require('../utils/logger');

const SETTLEMENT_ID_PREFIX = 'stl';

function generateSettlementId() {
  return `${SETTLEMENT_ID_PREFIX}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * 对账：创建清算批次；仅统计 status=completed 的 Payment，并输出对账差异（d4a2t2）
 * @param {Object} params - { batchId?, paymentIds? }
 * @returns {Promise<{ settlement: import('mongoose').Document, report: { discrepancies: Array<{paymentId,issue,status?,amount?}>, totalAmount: number, paymentCount: number, consistent: boolean } }>}
 */
async function reconcile(params = {}) {
  const { batchId, paymentIds = [] } = params;
  const batch = batchId || `batch-${Date.now()}`;
  const paymentIdList = Array.isArray(paymentIds) ? paymentIds : [];

  const discrepancies = [];
  let totalAmount = 0;
  let completedCount = 0;

  if (paymentIdList.length > 0) {
    const payments = await Payment.find({ paymentId: { $in: paymentIdList } });
    const byId = new Map(payments.map((p) => [p.paymentId, p]));

    for (const pid of paymentIdList) {
      const p = byId.get(pid);
      if (!p) {
        discrepancies.push({ paymentId: pid, issue: 'not_found' });
        continue;
      }
      if (p.status !== 'completed') {
        discrepancies.push({ paymentId: pid, issue: 'not_completed', status: p.status, amount: p.amount });
        continue;
      }
      totalAmount += p.amount;
      completedCount += 1;
    }
  }

  const report = {
    discrepancies,
    totalAmount,
    paymentCount: completedCount,
    consistent: discrepancies.length === 0,
  };

  const settlement = new Settlement({
    settlementId: generateSettlementId(),
    batchId: batch,
    totalAmount,
    paymentCount: completedCount,
    paymentIds: paymentIdList,
    status: 'pending',
  });
  await settlement.save();

  logger.info('Settlement reconcile created', {
    settlementId: settlement.settlementId,
    batchId: batch,
    paymentCount: completedCount,
    totalAmount,
    discrepancies: discrepancies.length,
  });
  return { settlement, report };
}

/**
 * 清算处理：pending -> processing -> completed|failed（d4a2t1）
 * 校验 paymentIds 对应 Payment 均为 completed，且金额汇总与 totalAmount 一致
 * @param {string} settlementId
 * @returns {Promise<import('mongoose').Document>}
 */
async function processSettlement(settlementId) {
  const settlement = await Settlement.findOne({ settlementId });
  if (!settlement) {
    throw new PaymentError('STL001', 'Settlement not found', 404);
  }
  if (settlement.status !== 'pending') {
    throw new PaymentError('PYS001', `Settlement not in pending: ${settlement.status}`, 400);
  }

  settlement.status = 'processing';
  await settlement.save();

  const ids = settlement.paymentIds || [];
  if (ids.length === 0) {
    settlement.status = 'completed';
    await settlement.save();
    logger.info('processSettlement completed (no payments)', { settlementId });
    return settlement;
  }

  const payments = await Payment.find({ paymentId: { $in: ids } });
  const byId = new Map(payments.map((p) => [p.paymentId, p]));

  let sum = 0;
  for (const pid of ids) {
    const p = byId.get(pid);
    if (!p) {
      settlement.status = 'failed';
      await settlement.save();
      throw new PaymentError('PYS001', `Payment not found: ${pid}`, 400);
    }
    if (p.status !== 'completed') {
      settlement.status = 'failed';
      await settlement.save();
      throw new PaymentError('PYS001', `Payment not completed: ${pid} (${p.status})`, 400);
    }
    sum += p.amount;
  }

  const diff = Math.abs(sum - (settlement.totalAmount || 0));
  if (diff > 0.005) {
    settlement.status = 'failed';
    await settlement.save();
    throw new PaymentError('PYS001', `Amount mismatch: sum=${sum} totalAmount=${settlement.totalAmount}`, 400);
  }

  settlement.status = 'completed';
  await settlement.save();
  logger.info('processSettlement completed', { settlementId, paymentCount: ids.length });
  return settlement;
}

/**
 * 查询清算状态
 * @param {string} settlementId
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function getSettlementById(settlementId) {
  return Settlement.findOne({ settlementId });
}

module.exports = {
  reconcile,
  processSettlement,
  getSettlementById,
  generateSettlementId,
};
