/**
 * 支付路由
 * 路径: /api/v1/payments (kebab-case 复数)
 * 路径参数: :paymentId（Express 参数名不支持 '-'，但 URL 仍保持 kebab-case 语义）
 */

const express = require('express');
const paymentController = require('../controllers/payment-controller');

const router = express.Router();

router.post('/payments', paymentController.create);
router.post('/payments/callback', paymentController.callback);
router.get('/payments/:paymentId', paymentController.getById);
router.post('/payments/:paymentId/process', paymentController.process);

module.exports = router;
