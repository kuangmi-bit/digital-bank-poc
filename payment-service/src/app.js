/**
 * Express 应用入口
 * 遵循 technical-standards-v1.0 / naming-conventions
 */

const express = require('express');
const { paymentRoutes, settlementRoutes, billPaymentRoutes } = require('./routes');
const { errorHandler } = require('./middleware/error-handler');
const logger = require('./utils/logger');

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info('HTTP request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: Date.now() - start,
    });
  });
  next();
});

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'payment-service',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

// API 路由
app.use('/api/v1', paymentRoutes);
app.use('/api/v1', settlementRoutes);
app.use('/api/v1', billPaymentRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: 'Not Found',
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

// 错误处理中间件（必须最后）
app.use(errorHandler);

module.exports = app;
