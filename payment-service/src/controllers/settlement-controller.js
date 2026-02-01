/**
 * 清算控制器
 * 委托 SettlementService；遵循 api-design-spec-v1.0 响应结构、路径 :settlement-id
 */

const settlementService = require('../services/settlement-service');

/**
 * POST /api/v1/settlements/reconcile - 对账（含 reconcileReport：discrepancies、consistent）
 */
async function reconcile(req, res, next) {
  try {
    const { settlement, report } = await settlementService.reconcile(req.body || {});
    const data = settlement.toObject ? settlement.toObject() : settlement;
    res.status(201).json({
      code: 201,
      message: 'Success',
      data: { ...data, reconcileReport: report },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/settlements/:settlement-id/process - 清算处理（d4a2t1）
 */
async function processSettlement(req, res, next) {
  try {
    const settlementId = req.params.settlementId;
    const settlement = await settlementService.processSettlement(settlementId);
    res.status(200).json({
      code: 200,
      message: 'Success',
      data: settlement,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/settlements/:settlement-id - 查询清算状态
 */
async function getById(req, res, next) {
  try {
    const settlementId = req.params.settlementId;
    const settlement = await settlementService.getSettlementById(settlementId);

    if (!settlement) {
      return res.status(404).json({
        code: 404,
        message: 'Not Found',
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: settlement,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { reconcile, processSettlement, getById };
