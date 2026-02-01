/**
 * 支付服务启动入口
 * 连接 MongoDB，启动 Express
 */

const app = require('./app');
const { connect: connectMongo } = require('./config/mongoose');
const config = require('../config/default');
const logger = require('./utils/logger');

async function start() {
  try {
    await connectMongo();
    const { startProcessor } = require('./queues/payment-callback-queue');
    if (typeof startProcessor === 'function') startProcessor();
    const server = app.listen(config.server.port, () => {
      logger.info('Payment service started', {
        port: config.server.port,
        env: config.server.env,
      });
    });

    const shutdown = async () => {
      logger.info('Shutting down...');
      server.close();
      const { disconnect } = require('./config/mongoose');
      await disconnect();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    logger.error('Failed to start', { error: err.message });
    process.exit(1);
  }
}

start();
