/**
 * Settlement 模型（Mongoose）
 * 集合: settlements (snake_case 复数), 字段 camelCase
 * 遵循 data-dictionary-v1.0 §3.2、api-design-spec、naming-conventions
 */

const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
  settlementId: { type: String, required: true, unique: true },
  batchId: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  paymentCount: { type: Number, default: 0 },
  paymentIds: [{ type: String }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
}, {
  collection: 'settlements',
  timestamps: true,
});

settlementSchema.index({ batchId: 1 });
settlementSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Settlement', settlementSchema);
