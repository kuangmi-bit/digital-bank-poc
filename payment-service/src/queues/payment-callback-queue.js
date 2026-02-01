/**
 * 支付回调 Bull 队列（ADR-005、agent-2-payment）
 * 若 REDIS_URI 未配置则 getQueue=null、addCallbackJob 为 no-op，避免启动失败
 */

const config = require('../../config/default');
const logger = require('../utils/logger');

let queue = null;
let processorStarted = false;

function getQueue() {
  if (queue) return queue;
  const uri = config.redis?.uri;
  if (!uri) return null;
  try {
    const Bull = require('bull');
    const Redis = require('ioredis');
    // Bull 要求 bclient/subscriber 禁用 enableReadyCheck 且 maxRetriesPerRequest=null
    // 否则会抛错：Using a redis instance with enableReadyCheck or maxRetriesPerRequest ...
    const redisOptions = { maxRetriesPerRequest: null, enableReadyCheck: false };
    queue = new Bull('payment-callback', {
      createClient: (type) => new Redis(uri, redisOptions),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
    queue.on('error', (err) => logger.warn('Payment callback queue error', { error: err.message }));
    return queue;
  } catch (e) {
    logger.warn('Bull queue init skipped', { reason: e.message });
    return null;
  }
}

/**
 * 入队回调后处理任务；无 Redis 时 no-op
 * @param {{ paymentId: string, callbackData: object }} data
 */
async function addCallbackJob(data) {
  const q = getQueue();
  if (!q) return;
  try {
    await q.add('callback', data, {
      jobId: `callback-${data.paymentId}-${Date.now()}`,
      priority: 1,
    });
  } catch (e) {
    logger.warn('addCallbackJob failed', { paymentId: data.paymentId, error: e.message });
  }
}

/**
 * 启动队列 processor；在 index 启动时调用。无 Redis 时 no-op
 */
function startProcessor() {
  if (processorStarted) return;
  const q = getQueue();
  if (!q) return;
  processorStarted = true;
  q.process('callback', async (job) => {
    logger.info('Payment callback job', { paymentId: job.data.paymentId, jobId: job.id });
    return { processed: true };
  });
  logger.info('Payment callback queue processor started');
}

module.exports = {
  getQueue,
  addCallbackJob,
  startProcessor,
};
