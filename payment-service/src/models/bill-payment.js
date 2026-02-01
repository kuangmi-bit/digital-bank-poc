/**
 * BillPayment 模型（Mongoose）
 * 账单支付记录，ADR-008
 * 集合: bill_payments, 字段 camelCase
 */

const mongoose = require('mongoose');

const billPaymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  billType: {
    type: String,
    required: true,
    enum: ['utility', 'telecom', 'credit_card'],
    index: true
  },
  billAccount: { type: String, required: true },
  payerAccountId: { type: Number, required: true },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, required: true, default: 'CNY' },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  transactionId: { type: String },  // 核心银行交易ID
  billVendor: { type: String },     // 账单供应商（Mock）
  billReferenceNo: { type: String }, // 账单参考号
  errorCode: { type: String },
  errorMessage: { type: String },
}, {
  collection: 'bill_payments',
  timestamps: true,
});

billPaymentSchema.index({ payerAccountId: 1, createdAt: -1 });
billPaymentSchema.index({ status: 1, createdAt: -1 });
billPaymentSchema.index({ billType: 1, billAccount: 1 });

module.exports = mongoose.model('BillPayment', billPaymentSchema);
