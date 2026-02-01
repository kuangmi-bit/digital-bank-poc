/**
 * 初始化 MongoDB payment_db 集合与索引
 * 依据: database/mongodb/schemas/payment.json, settlement.json, data-dictionary-v1.0, ADR-003
 * 用法: mongosh "mongodb://localhost:27017" --file init-mongodb-collections.js
 *   或: mongosh $MONGO_URI --file database/scripts/init-mongodb-collections.js
 */

const dbName = 'payment_db';
const db = db.getSiblingDB(dbName);

// -----------------------------------------------------------------------------
// payments
// -----------------------------------------------------------------------------
if (!db.getCollectionNames().includes('payments')) {
  db.createCollection('payments');
  print('集合已创建: payments');
}
db.payments.createIndex({ paymentId: 1 }, { unique: true });
db.payments.createIndex({ orderId: 1 });
db.payments.createIndex({ userId: 1, createdAt: -1 });
db.payments.createIndex({ status: 1, createdAt: -1 });
db.payments.createIndex({ userId: 1, status: 1, createdAt: -1 });
print('payments 索引已创建/已存在');

// -----------------------------------------------------------------------------
// settlements
// -----------------------------------------------------------------------------
if (!db.getCollectionNames().includes('settlements')) {
  db.createCollection('settlements');
  print('集合已创建: settlements');
}
db.settlements.createIndex({ settlementId: 1 }, { unique: true });
db.settlements.createIndex({ batchId: 1 });
db.settlements.createIndex({ status: 1, createdAt: -1 });
print('settlements 索引已创建/已存在');

print('MongoDB payment_db 初始化完成。');
