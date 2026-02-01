/**
 * 支付服务默认配置
 * 环境变量覆盖: PAYMENT_*, MONGODB_*
 */

module.exports = {
  server: {
    port: parseInt(process.env.PAYMENT_PORT || '3001', 10),
    env: process.env.NODE_ENV || 'development',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || process.env.PAYMENT_MONGODB_URI || 'mongodb://localhost:27017/payment_db',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    },
  },
  payment: {
    defaultCurrency: process.env.PAYMENT_DEFAULT_CURRENCY || 'CNY',
    timeoutMinutes: parseInt(process.env.PAYMENT_TIMEOUT_MINUTES || '30', 10),
  },
  coreBank: {
    serviceUrl: process.env.CORE_BANK_SERVICE_URL || process.env.CORE_BANK_SERVICE_URI || '',
  },
  redis: {
    uri: process.env.REDIS_URI || process.env.REDIS_URL || '',
    // 缓存配置 (Day 10 性能优化)
    cacheTTL: {
      billInfo: 300,        // 账单信息缓存 5 分钟
      paymentStatus: 60,    // 支付状态缓存 1 分钟
      accountBalance: 30,   // 余额缓存 30 秒
    },
  },
  // 性能优化配置 (Day 10)
  performance: {
    batchSize: 50,
    maxConcurrency: 10,
    requestTimeout: 10000,
  },
};
