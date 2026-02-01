/**
 * Jest 测试 MongoDB 连接助手
 *
 * 目标：在无网络/弱网环境下也能稳定执行测试：
 * - 优先：TEST_MONGODB_URI（CI/本地均可配置，推荐）
 * - 其次：尝试本机 Mongo（默认 mongodb://127.0.0.1:27017/payment_test，可用 TEST_MONGODB_FALLBACK_URI 覆盖）
 * - 最后：仅在 USE_MONGODB_MEMORY_SERVER=true 时才启用 mongodb-memory-server（可能触发首次下载，不建议在 CI 默认使用）
 */

const mongoose = require('mongoose');

function normalizeUri(uri) {
  return String(uri || '').trim();
}

function redactMongoUri(uri) {
  // mongodb://user:pass@host -> mongodb://***@host
  return uri.replace(/\/\/[^@]+@/, '//***@');
}

async function connectWithUri(uri, options = {}) {
  const finalOptions = {
    // 连接失败时快速返回，避免测试长时间挂死
    serverSelectionTimeoutMS: 2000,
    ...options,
  };
  await mongoose.connect(uri, finalOptions);
}

async function connectTestMongo() {
  const explicit = normalizeUri(process.env.TEST_MONGODB_URI);
  if (explicit) {
    await connectWithUri(explicit);
    return { mode: 'external', uri: explicit, mongod: null };
  }

  const fallback = normalizeUri(process.env.TEST_MONGODB_FALLBACK_URI) || 'mongodb://127.0.0.1:27017/payment_test';
  try {
    await connectWithUri(fallback);
    return { mode: 'local', uri: fallback, mongod: null };
  } catch (e) {
    // ignore, try next strategy
  }

  const allowMemory = String(process.env.USE_MONGODB_MEMORY_SERVER || '').toLowerCase() === 'true';
  if (!allowMemory) {
    const msg = [
      '测试数据库不可用：未配置 TEST_MONGODB_URI，且无法连接本机 Mongo。',
      '',
      '请任选其一：',
      '1) 推荐：设置 TEST_MONGODB_URI 使用外部 Mongo（CI/本地均可）。',
      '   - PowerShell:  $env:TEST_MONGODB_URI="mongodb://127.0.0.1:27017/payment_test"',
      '   - Bash:       export TEST_MONGODB_URI="mongodb://127.0.0.1:27017/payment_test"',
      '2) 启动本机 Mongo（默认会尝试 mongodb://127.0.0.1:27017/payment_test）。',
      '3) 若确需 mongodb-memory-server：设置 USE_MONGODB_MEMORY_SERVER=true（可能触发首次下载，不适合无网/弱网 CI）。',
    ].join('\n');
    const err = new Error(msg);
    err.code = 'TEST_MONGODB_UNAVAILABLE';
    throw err;
  }

  // 显式启用 mongodb-memory-server（可能需要下载二进制）
  // 注意：此路径仅作为“最后兜底”，避免默认在无网环境下触发下载超时。
  // eslint-disable-next-line global-require
  const { MongoMemoryServer } = require('mongodb-memory-server');
  // eslint-disable-next-line global-require
  const path = require('path');
  // eslint-disable-next-line global-require
  const fs = require('fs');

  const downloadDir = path.resolve(__dirname, '../_cache/mongodb-binaries');
  fs.mkdirSync(downloadDir, { recursive: true });
  const version = normalizeUri(process.env.MONGOMS_VERSION) || '7.0.8';

  const mongod = await MongoMemoryServer.create({
    binary: { downloadDir, version },
    instance: { dbName: 'payment_test' },
  });
  const uri = mongod.getUri();
  await connectWithUri(uri, { serverSelectionTimeoutMS: 5000 });
  return { mode: 'memory', uri, mongod };
}

async function disconnectTestMongo(ctx) {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
  if (ctx && ctx.mongod) {
    await ctx.mongod.stop();
  }
}

async function clearMongoCollections() {
  const collections = mongoose.connection.collections;
  // 若未连接，直接返回
  if (!collections) return;
  for (const key of Object.keys(collections)) {
    // eslint-disable-next-line no-await-in-loop
    await collections[key].deleteMany({});
  }
}

module.exports = {
  connectTestMongo,
  disconnectTestMongo,
  clearMongoCollections,
  redactMongoUri,
};

