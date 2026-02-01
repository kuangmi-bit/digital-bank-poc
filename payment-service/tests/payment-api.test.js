/**
 * 支付与清算 API 测试（Supertest）
 * 说明：
 * - 优先使用 TEST_MONGODB_URI（避免 mongodb-memory-server 首次下载导致超时）
 * - 其次尝试本机 Mongo（默认 mongodb://127.0.0.1:27017/payment_test）
 * - 最后仅在 USE_MONGODB_MEMORY_SERVER=true 时启用 mongodb-memory-server
 *
 * 遵循 api-design-spec-v1.0、OpenAPI
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { connectTestMongo, disconnectTestMongo, clearMongoCollections } = require('./helpers/test-mongodb');

let mongoCtx;
let app;

beforeAll(async () => {
  // 关键：避免 mongodb-memory-server 在无网/弱网环境下首次下载导致测试不可执行
  mongoCtx = await connectTestMongo();

  // 在 mongoose 连接后加载 app（会加载使用 mongoose.model 的 models）
  app = require('../src/app');
}, 30000);

afterAll(async () => {
  await disconnectTestMongo(mongoCtx);
});

afterEach(async () => {
  await clearMongoCollections();
});

describe('POST /api/v1/payments', () => {
  it('应 201 创建支付订单并返回 data', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .send({ orderId: 'ord-1', userId: 'u1', amount: 99.99 })
      .expect(201);

    expect(res.body).toMatchObject({
      code: 201,
      message: 'Success',
      data: expect.objectContaining({
        paymentId: expect.any(String),
        orderId: 'ord-1',
        userId: 'u1',
        amount: 99.99,
        status: 'pending',
      }),
      timestamp: expect.any(String),
    });
  });

  it('缺少 orderId 时应 400', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .send({ userId: 'u1', amount: 10 })
      .expect(400);

    expect(res.body.code).toBe(400);
    expect(res.body.errorCode).toBe('PYV001');
  });
});

describe('GET /api/v1/payments/:payment-id', () => {
  it('存在时应 200 返回', async () => {
    const create = await request(app)
      .post('/api/v1/payments')
      .send({ orderId: 'o1', userId: 'u1', amount: 1 })
      .expect(201);

    const paymentId = create.body.data.paymentId;

    const res = await request(app)
      .get(`/api/v1/payments/${paymentId}`)
      .expect(200);

    expect(res.body.data.paymentId).toBe(paymentId);
    expect(res.body.data.status).toBe('pending');
  });

  it('不存在时应 404', async () => {
    const res = await request(app)
      .get('/api/v1/payments/pay-nonexistent-123')
      .expect(404);

    expect(res.body.errorCode).toBe('PYB003');
  });
});

describe('POST /api/v1/payments/:payment-id/process', () => {
  it('应 200 处理成功并置 status=completed', async () => {
    const create = await request(app)
      .post('/api/v1/payments')
      .send({ orderId: 'o1', userId: 'u1', amount: 10 })
      .expect(201);

    const paymentId = create.body.data.paymentId;

    const res = await request(app)
      .post(`/api/v1/payments/${paymentId}/process`)
      .send({})
      .expect(200);

    expect(res.body.data.status).toBe('completed');
  });

  it('重复 process 已支付订单应 400', async () => {
    const create = await request(app)
      .post('/api/v1/payments')
      .send({ orderId: 'o1', userId: 'u1', amount: 10 })
      .expect(201);

    const paymentId = create.body.data.paymentId;
    await request(app).post(`/api/v1/payments/${paymentId}/process`).send({}).expect(200);

    const res = await request(app)
      .post(`/api/v1/payments/${paymentId}/process`)
      .send({})
      .expect(400);

    expect(res.body.errorCode).toBe('PYB004');
  });

  it('simulateFailure=true 时应 200 且 status=failed', async () => {
    const create = await request(app)
      .post('/api/v1/payments')
      .send({ orderId: 'o1', userId: 'u1', amount: 10 })
      .expect(201);

    const res = await request(app)
      .post(`/api/v1/payments/${create.body.data.paymentId}/process`)
      .send({ simulateFailure: true })
      .expect(200);

    expect(res.body.data.status).toBe('failed');
  });

  it('带 accountId 且未配置 CORE_BANK_SERVICE_URL 时仅走 Mock 应 200 completed', async () => {
    const create = await request(app)
      .post('/api/v1/payments')
      .send({ orderId: 'o1', userId: 'u1', accountId: '1', amount: 10 })
      .expect(201);

    const res = await request(app)
      .post(`/api/v1/payments/${create.body.data.paymentId}/process`)
      .send({})
      .expect(200);

    expect(res.body.data.status).toBe('completed');
  });
});

describe('POST /api/v1/settlements/reconcile', () => {
  it('应 201 创建清算批次', async () => {
    const res = await request(app)
      .post('/api/v1/settlements/reconcile')
      .send({ batchId: 'batch-1', paymentIds: [] })
      .expect(201);

    expect(res.body).toMatchObject({
      code: 201,
      message: 'Success',
      data: expect.objectContaining({
        settlementId: expect.any(String),
        batchId: 'batch-1',
        totalAmount: 0,
        paymentCount: 0,
        status: 'pending',
      }),
      timestamp: expect.any(String),
    });
  });

  it('提供 paymentIds 且均为 completed 时应聚合 totalAmount 并返回 reconcileReport', async () => {
    const p1 = await request(app).post('/api/v1/payments').send({ orderId: 'o1', userId: 'u1', amount: 50 }).expect(201);
    const p2 = await request(app).post('/api/v1/payments').send({ orderId: 'o2', userId: 'u1', amount: 30 }).expect(201);
    await request(app).post(`/api/v1/payments/${p1.body.data.paymentId}/process`).send({}).expect(200);
    await request(app).post(`/api/v1/payments/${p2.body.data.paymentId}/process`).send({}).expect(200);

    const res = await request(app)
      .post('/api/v1/settlements/reconcile')
      .send({ paymentIds: [p1.body.data.paymentId, p2.body.data.paymentId] })
      .expect(201);

    expect(res.body.data.totalAmount).toBe(80);
    expect(res.body.data.paymentCount).toBe(2);
    expect(res.body.data.reconcileReport).toMatchObject({ consistent: true, discrepancies: [], totalAmount: 80, paymentCount: 2 });
  });

  it('paymentIds 含未 completed 时 reconcileReport.discrepancies 有记录', async () => {
    const p1 = await request(app).post('/api/v1/payments').send({ orderId: 'o1', userId: 'u1', amount: 50 }).expect(201);
    const p2 = await request(app).post('/api/v1/payments').send({ orderId: 'o2', userId: 'u1', amount: 30 }).expect(201);
    await request(app).post(`/api/v1/payments/${p1.body.data.paymentId}/process`).send({}).expect(200);

    const res = await request(app)
      .post('/api/v1/settlements/reconcile')
      .send({ paymentIds: [p1.body.data.paymentId, p2.body.data.paymentId] })
      .expect(201);

    expect(res.body.data.reconcileReport.consistent).toBe(false);
    expect(res.body.data.reconcileReport.discrepancies).toHaveLength(1);
    expect(res.body.data.reconcileReport.discrepancies[0]).toMatchObject({ paymentId: p2.body.data.paymentId, issue: 'not_completed' });
    expect(res.body.data.totalAmount).toBe(50);
    expect(res.body.data.paymentCount).toBe(1);
  });
});

describe('GET /api/v1/settlements/:settlement-id', () => {
  it('存在时应 200', async () => {
    const rec = await request(app).post('/api/v1/settlements/reconcile').send({}).expect(201);
    const id = rec.body.data.settlementId;

    const res = await request(app).get(`/api/v1/settlements/${id}`).expect(200);
    expect(res.body.data.settlementId).toBe(id);
  });

  it('不存在时应 404', async () => {
    await request(app).get('/api/v1/settlements/stl-nonexistent').expect(404);
  });
});

describe('POST /api/v1/settlements/:settlement-id/process', () => {
  it('应 200 将 pending 清算处理为 completed', async () => {
    const p1 = await request(app).post('/api/v1/payments').send({ orderId: 'o1', userId: 'u1', amount: 50 }).expect(201);
    const p2 = await request(app).post('/api/v1/payments').send({ orderId: 'o2', userId: 'u1', amount: 30 }).expect(201);
    await request(app).post(`/api/v1/payments/${p1.body.data.paymentId}/process`).send({}).expect(200);
    await request(app).post(`/api/v1/payments/${p2.body.data.paymentId}/process`).send({}).expect(200);
    const rec = await request(app)
      .post('/api/v1/settlements/reconcile')
      .send({ paymentIds: [p1.body.data.paymentId, p2.body.data.paymentId] })
      .expect(201);
    const sid = rec.body.data.settlementId;

    const res = await request(app).post(`/api/v1/settlements/${sid}/process`).expect(200);
    expect(res.body.data.status).toBe('completed');
  });

  it('不存在时应 404', async () => {
    const res = await request(app).post('/api/v1/settlements/stl-nonexistent/process').expect(404);
    expect(res.body.errorCode).toBeDefined();
  });
});

describe('POST /api/v1/payments/callback', () => {
  it('processing -> completed 应 200 且 processed=true', async () => {
    const create = await request(app).post('/api/v1/payments').send({ orderId: 'o1', userId: 'u1', amount: 10 }).expect(201);
    const Payment = require('../src/models/payment');
    await Payment.updateOne({ paymentId: create.body.data.paymentId }, { $set: { status: 'processing' } });

    const res = await request(app)
      .post('/api/v1/payments/callback')
      .send({ paymentId: create.body.data.paymentId, status: 'completed' })
      .expect(200);

    expect(res.body.data.processed).toBe(true);
    expect(res.body.data.paymentId).toBe(create.body.data.paymentId);
    const get = await request(app).get(`/api/v1/payments/${create.body.data.paymentId}`).expect(200);
    expect(get.body.data.status).toBe('completed');
  });

  it('缺少 paymentId 或 status 应 200 且 processed=false', async () => {
    const res = await request(app).post('/api/v1/payments/callback').send({}).expect(200);
    expect(res.body.data.processed).toBe(false);
    expect(res.body.data.reason).toBe('paymentId and status are required');
  });
});
