/**
 * Payment 模型（Mongoose）
 * 集合: payments (snake_case 复数), 字段 camelCase
 * 遵循 data-dictionary-v1.0 §3.1、api-design-spec、naming-conventions
 */

const mongoose = require('mongoose');

const gatewayResponseSchema = new mongoose.Schema({
  gatewayOrderId: { type: String },
  code: { type: String },
  message: { type: String },
  paidAt: { type: Date },
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  userId: { type: String, required: true },
  accountId: { type: String },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, required: true, default: 'CNY' },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
  },
  channel: { type: String, enum: ['wechat', 'alipay', 'bank_card', 'mock'], default: 'mock' },
  gatewayResponse: { type: gatewayResponseSchema },
  // Day 5：重试/状态同步/错误追踪（不影响既有 API；可选字段）
  retryCount: { type: Number, default: 0, min: 0 },
  lastAttemptAt: { type: Date },
  lastErrorCode: { type: String },
  lastErrorMessage: { type: String },
}, {
  collection: 'payments',
  timestamps: true,
});

paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ userId: 1, status: 1, createdAt: -1 });
paymentSchema.index({ status: 1, lastAttemptAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
