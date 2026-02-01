/**
 * 支付控制器
 * 委托 PaymentService；遵循 api-design-spec-v1.0 响应结构、路径 :payment-id
 */

const paymentService = require('../services/payment-service');
const callbackService = require('../services/callback-service');

/**
 * POST /api/v1/payments - 创建支付订单
 */
async function create(req, res, next) {
  try {
    const payment = await paymentService.createPayment(req.body);
    res.status(201).json({
      code: 201,
      message: 'Success',
      data: payment,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/payments/:payment-id - 查询支付状态
 */
async function getById(req, res, next) {
  try {
    const paymentId = req.params.paymentId;
    const payment = await paymentService.getPaymentById(paymentId);

    if (!payment) {
      return res.status(404).json({
        code: 404,
        message: 'Not Found',
        errorCode: 'PYB003',
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: payment,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/payments/:payment-id/process - 处理支付
 */
async function process(req, res, next) {
  try {
    const paymentId = req.params.paymentId;
    const payment = await paymentService.processPayment(paymentId, {
      simulateFailure: req.body?.simulateFailure === true,
    });
    res.status(200).json({
      code: 200,
      message: 'Success',
      data: payment,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/payments/callback - 支付回调（d4a2t3）
 */
async function callback(req, res, next) {
  try {
    const result = await callbackService.handleCallback(req.body || {}, req.headers);
    res.status(200).json({
      code: 200,
      message: 'Success',
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getById, process, callback };
