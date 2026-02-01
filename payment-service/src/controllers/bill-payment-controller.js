/**
 * 账单支付控制器
 * ADR-008
 */

const billPaymentService = require('../services/bill-payment-service');
const logger = require('../utils/logger');

/**
 * 创建账单支付 POST /api/v1/payments/bill
 */
async function createBillPayment(req, res, next) {
  try {
    const { billType, billAccount, amount, payerAccountId } = req.body;

    // 参数验证
    if (!billType || !billAccount || !amount || !payerAccountId) {
      return res.status(400).json({
        code: 400,
        errorCode: 'PYV001',
        message: '参数验证失败：billType, billAccount, amount, payerAccountId 必填',
      });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        code: 400,
        errorCode: 'PYV001',
        message: '金额必须大于 0',
      });
    }

    const result = await billPaymentService.createBillPayment({
      billType,
      billAccount,
      amount,
      payerAccountId,
    });

    logger.info('账单支付 API 成功', { paymentId: result.paymentId });

    res.status(201).json({
      code: 201,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 查询账单支付 GET /api/v1/payments/bill/:paymentId
 */
async function getBillPayment(req, res, next) {
  try {
    const { paymentId } = req.params;
    const result = await billPaymentService.getBillPayment(paymentId);

    res.status(200).json({
      code: 200,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 查询账单支付列表 GET /api/v1/payments/bill
 */
async function listBillPayments(req, res, next) {
  try {
    const { payerAccountId, billType, status, page, pageSize } = req.query;

    if (!payerAccountId) {
      return res.status(400).json({
        code: 400,
        errorCode: 'PYV001',
        message: '参数验证失败：payerAccountId 必填',
      });
    }

    const result = await billPaymentService.listBillPayments({
      payerAccountId: parseInt(payerAccountId, 10),
      billType,
      status,
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 20,
    });

    res.status(200).json({
      code: 200,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 查询账单信息 GET /api/v1/payments/bill/query
 */
async function queryBillInfo(req, res, next) {
  try {
    const { billType, billAccount } = req.query;

    if (!billType || !billAccount) {
      return res.status(400).json({
        code: 400,
        errorCode: 'PYV001',
        message: '参数验证失败：billType, billAccount 必填',
      });
    }

    const result = billPaymentService.queryBillInfo(billType, billAccount);

    res.status(200).json({
      code: 200,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBillPayment,
  getBillPayment,
  listBillPayments,
  queryBillInfo,
};
