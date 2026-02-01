/**
 * 全局错误处理中间件
 * 遵循 technical-standards-v1.0 错误码规范（PY*）
 */

const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  const errorCode = err.errorCode || 'PYS001';
  const httpStatus = err.httpStatus || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('Request error', {
    errorCode,
    message,
    path: req.path,
    stack: err.stack,
  });

  const body = {
    code: httpStatus,
    message,
    errorCode,
    timestamp: new Date().toISOString(),
  };

  if (err.errors && Array.isArray(err.errors)) {
    body.errors = err.errors;
  }

  res.status(httpStatus).json(body);
}

module.exports = { errorHandler };
