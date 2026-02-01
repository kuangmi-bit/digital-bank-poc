/**
 * 清算路由
 * 路径: /api/v1/settlements (kebab-case 复数)
 * 路径参数: :settlementId（Express 参数名不支持 '-'）
 */

const express = require('express');
const settlementController = require('../controllers/settlement-controller');

const router = express.Router();

router.post('/settlements/reconcile', settlementController.reconcile);
router.post('/settlements/:settlementId/process', settlementController.processSettlement);
router.get('/settlements/:settlementId', settlementController.getById);

module.exports = router;
