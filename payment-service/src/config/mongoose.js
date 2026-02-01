/**
 * MongoDB 连接配置（Mongoose）
 * 遵循 technical-standards-v1.0 / naming-conventions
 */

const mongoose = require('mongoose');
const config = require('../../config/default');
const logger = require('../utils/logger');

async function connect() {
  try {
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    logger.info('MongoDB connected', { uri: config.mongodb.uri.replace(/\/\/[^@]+@/, '//***@') });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
  } catch (err) {
    logger.error('MongoDB connect failed', { error: err.message });
    throw err;
  }
}

async function disconnect() {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}

module.exports = { connect, disconnect };
