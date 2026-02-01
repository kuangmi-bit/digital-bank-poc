/**
 * Redis 缓存工具
 * Day 10 性能优化
 */

const config = require('../../config/default');
const logger = require('./logger');

// 内存缓存（Redis 不可用时的降级方案）
const memoryCache = new Map();
const memoryCacheExpiry = new Map();

let redisClient = null;
let redisAvailable = false;

/**
 * 初始化 Redis 连接
 */
async function initRedis() {
  const redisUri = config.redis?.uri;
  if (!redisUri) {
    logger.info('Redis URI 未配置，使用内存缓存');
    return false;
  }

  try {
    // 动态导入 redis（可选依赖）
    const redis = await import('redis');
    redisClient = redis.createClient({ url: redisUri });

    redisClient.on('error', (err) => {
      logger.error('Redis 连接错误', { error: err.message });
      redisAvailable = false;
    });

    redisClient.on('connect', () => {
      logger.info('Redis 已连接');
      redisAvailable = true;
    });

    await redisClient.connect();
    return true;
  } catch (err) {
    logger.warn('Redis 初始化失败，使用内存缓存', { error: err.message });
    return false;
  }
}

/**
 * 获取缓存
 * @param {string} key
 * @returns {Promise<any>}
 */
async function get(key) {
  try {
    if (redisAvailable && redisClient) {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    }

    // 内存缓存降级
    const expiry = memoryCacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      memoryCache.delete(key);
      memoryCacheExpiry.delete(key);
      return null;
    }
    return memoryCache.get(key) || null;
  } catch (err) {
    logger.warn('缓存读取失败', { key, error: err.message });
    return null;
  }
}

/**
 * 设置缓存
 * @param {string} key
 * @param {any} value
 * @param {number} ttlSeconds
 * @returns {Promise<boolean>}
 */
async function set(key, value, ttlSeconds = 60) {
  try {
    const serialized = JSON.stringify(value);

    if (redisAvailable && redisClient) {
      await redisClient.setEx(key, ttlSeconds, serialized);
      return true;
    }

    // 内存缓存降级
    memoryCache.set(key, value);
    memoryCacheExpiry.set(key, Date.now() + ttlSeconds * 1000);
    return true;
  } catch (err) {
    logger.warn('缓存写入失败', { key, error: err.message });
    return false;
  }
}

/**
 * 删除缓存
 * @param {string} key
 * @returns {Promise<boolean>}
 */
async function del(key) {
  try {
    if (redisAvailable && redisClient) {
      await redisClient.del(key);
    }
    memoryCache.delete(key);
    memoryCacheExpiry.delete(key);
    return true;
  } catch (err) {
    logger.warn('缓存删除失败', { key, error: err.message });
    return false;
  }
}

/**
 * 清理过期的内存缓存
 */
function cleanupMemoryCache() {
  const now = Date.now();
  for (const [key, expiry] of memoryCacheExpiry.entries()) {
    if (now > expiry) {
      memoryCache.delete(key);
      memoryCacheExpiry.delete(key);
    }
  }
}

// 定期清理内存缓存（每分钟）
setInterval(cleanupMemoryCache, 60000);

/**
 * 缓存键生成器
 */
const cacheKeys = {
  billInfo: (billType, billAccount) => `bill:${billType}:${billAccount}`,
  paymentStatus: (paymentId) => `payment:status:${paymentId}`,
  accountBalance: (accountId) => `account:balance:${accountId}`,
  batchResult: (batchId) => `batch:result:${batchId}`,
};

module.exports = {
  initRedis,
  get,
  set,
  del,
  cacheKeys,
  isRedisAvailable: () => redisAvailable,
};
