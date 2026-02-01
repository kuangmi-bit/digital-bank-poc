/**
 * 账单支付路由
 * ADR-008
 */

const express = require('express');
const billPaymentController = require('../controllers/bill-payment-controller');

const router = express.Router();

// 查询账单信息（必须在 /:paymentId 之前定义）
router.get('/payments/bill/query', billPaymentController.queryBillInfo);

// 账单支付列表
router.get('/payments/bill', billPaymentController.listBillPayments);

// 创建账单支付
router.post('/payments/bill', billPaymentController.createBillPayment);

// 查询账单支付详情
router.get('/payments/bill/:paymentId', billPaymentController.getBillPayment);

module.exports = router;
