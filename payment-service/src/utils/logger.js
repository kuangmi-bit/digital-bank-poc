/**
 * Winston 结构化日志
 * 遵循 technical-standards-v1.0 日志规范
 */

const winston = require('winston');

const { combine, timestamp, json } = winston.format;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'payment-service' },
  format: combine(
    timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    json()
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

module.exports = logger;
