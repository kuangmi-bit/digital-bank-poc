---
name: agent-2-payment
version: 1.0.0
description: 支付清算处理器Agent技能 - 负责实现支付网关、清算引擎和交易回调处理功能。使用Node.js 20 + Express + MongoDB 7.0技术栈。
author: Digital Bank POC Team
license: MIT
keywords:
  - nodejs
  - express
  - mongodb
  - payment
  - settlement
  - payment-gateway
  - rest-api
  - microservices
---

# Agent 2: 支付清算处理器 💳

## 概述

Agent 2负责实现支付网关、清算引擎和交易回调处理功能。使用Node.js 20 + Express + MongoDB 7.0技术栈，实现支付处理和清算对账功能。

## 何时使用

当需要：
- 实现支付网关功能
- 处理支付订单和状态管理
- 实现清算和对账功能
- 处理支付回调
- 集成Mock支付网关

## 技术栈

- **语言**: Node.js 20
- **框架**: Express.js
- **数据库**: MongoDB 7.0
- **ORM**: Mongoose
- **测试**: Jest + Supertest
- **API文档**: OpenAPI 3.0 / Swagger
- **异步处理**: Bull / Agenda

## 核心功能（MVP）

### 1. 支付网关
- 创建支付订单: `POST /api/v1/payments`
- 处理支付: `POST /api/v1/payments/{id}/process`
- 查询支付状态: `GET /api/v1/payments/{id}`
- Mock支付网关接口

### 2. 清算引擎
- 对账功能: `POST /api/v1/settlements/reconcile`
- 清算处理
- 结算状态查询

### 3. 交易回调
- 支付回调处理
- 异步任务处理
- 状态同步

## 自动化能力

- **代码生成**: 70%自动化
  - RESTful API自动生成
  - 数据模型自动创建（Mongoose Schema）
  - API测试自动编写（Jest + Supertest）
  - Mock服务自动配置（WireMock）

## 交付标准

- **API数量**: 10-15个
- **代码行数**: 约5000行
- **测试覆盖率**: ≥60%
- **响应时间**: P95 < 2s

## 项目结构

```
payment-service/
├── src/
│   ├── models/          # Mongoose模型（Payment, Settlement）
│   ├── routes/          # Express路由
│   ├── controllers/     # 控制器
│   ├── services/        # 业务逻辑
│   ├── mocks/           # Mock支付网关
│   └── utils/           # 工具函数
├── tests/               # 测试代码
├── config/              # 配置文件
└── docs/
    └── openapi.yaml     # API文档
```

## 技术标准规范要求

**重要**: 必须严格遵循技术标准规范和命名规范。

### 必须遵循的规范文档

1. **技术标准规范 v1.0**: `docs/architecture/technical-standards-v1.0.md`
2. **命名规范 v1.0**: `docs/architecture/naming-conventions.md`

## 代码规范

- 遵循Express.js最佳实践
- **严格遵循技术标准规范中的Node.js代码规范**
- **严格遵循命名规范**
- 使用async/await处理异步操作
- 错误处理使用中间件
- 日志使用Winston
- 所有API必须有OpenAPI文档

### 命名规范要点

- **文件名**: kebab-case (如 `payment-service.js`, `payment-controller.js`)
- **类名**: PascalCase (如 `PaymentService`, `PaymentController`)
- **函数名**: camelCase (如 `createPayment()`, `processPayment()`)
- **变量名**: camelCase (如 `paymentId`, `orderId`)
- **常量**: UPPER_SNAKE_CASE (如 `MAX_AMOUNT`, `PAYMENT_TIMEOUT`)
- **API路径**: kebab-case, 复数 (如 `/api/v1/payments`)
- **MongoDB集合**: snake_case, 复数 (如 `payments`, `settlements`)
- **MongoDB字段**: camelCase (如 `paymentId`, `orderId`, `createdAt`)

## 协作关系

- **与Agent 1**: 调用核心银行服务API（账户扣款）
- **与Agent 3**: 调用风控服务API（支付前风控检查）
- **与Agent 5**: 通过API Gateway暴露服务
- **与Agent 6**: 提供API测试接口
- **与Agent 9**: 使用MongoDB数据模型

## 关键里程碑

- **Day 2**: 项目骨架和API设计完成
- **Day 3**: 支付处理API完成
- **Day 4**: 清算和对账功能完成
- **Day 5**: 与核心银行服务集成完成
- **Day 7**: 支付流程完整实现

## 示例代码结构

### Model示例
```javascript
const mongoose = require('mongoose');

// 遵循命名规范: 集合名snake_case, 复数形式
const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },  // 遵循命名规范: camelCase
  orderId: { type: String, required: true },  // 遵循命名规范: camelCase
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },  // 遵循命名规范: camelCase
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'payments'  // 明确指定集合名，遵循命名规范: snake_case, 复数
});

module.exports = mongoose.model('Payment', paymentSchema);
```

### Service示例
```javascript
const Payment = require('../models/Payment');

class PaymentService {
  async createPayment(paymentData) {
    const payment = new Payment(paymentData);
    return await payment.save();
  }
  
  async processPayment(paymentId) {
    // 支付处理逻辑
  }
}

module.exports = new PaymentService();
```

### Controller示例
```javascript
const express = require('express');
const router = express.Router();
const paymentService = require('../services/payment-service');  // 遵循命名规范: kebab-case文件名

// 遵循命名规范: API路径kebab-case, 复数形式
router.post('/api/v1/payments', async (req, res) => {
  try {
    const payment = await paymentService.createPayment(req.body);  // 遵循命名规范: camelCase方法名
    res.status(201).json({
      code: 201,
      message: 'Success',
      data: payment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      code: 500,
      message: 'Internal Server Error',
      errors: [{ message: error.message }],
      timestamp: new Date().toISOString()
    });
  }
});

// 遵循命名规范: 路径参数kebab-case
router.get('/api/v1/payments/:payment-id', async (req, res) => {
  const paymentId = req.params['payment-id'];  // 遵循命名规范: camelCase变量名
  // 实现
});

module.exports = router;
```

## 错误码定义

### Payment服务错误码

| 错误码 | 描述 | HTTP状态码 | 处理建议 |
|-------|------|-----------|---------|
| `PYB001` | 支付超时 | 408 | 重新发起支付 |
| `PYB002` | 渠道不可用 | 503 | 切换支付渠道 |
| `PYB003` | 支付订单不存在 | 404 | 检查订单ID |
| `PYB004` | 订单已支付 | 400 | 无需重复支付 |
| `PYB005` | 订单已取消 | 400 | 重新创建订单 |
| `PYB006` | 金额超限 | 400 | 检查支付限额 |
| `PYV001` | 参数格式无效 | 400 | 检查请求参数 |
| `PYV002` | 签名验证失败 | 400 | 检查签名算法 |
| `PYS001` | 数据库错误 | 500 | 联系运维 |
| `PYS002` | 外部服务异常 | 502 | 稍后重试 |

---

## 支付状态机

### 支付订单状态流转

```
                    ┌─────────────┐
                    │   CREATED   │ (初始状态)
                    └──────┬──────┘
                           │ 发起支付
                           ▼
                    ┌─────────────┐
                    │  PENDING    │ (待支付)
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
       ┌───────────┐ ┌───────────┐ ┌───────────┐
       │ PROCESSING│ │  EXPIRED  │ │ CANCELLED │
       │  (处理中) │ │  (已过期) │ │  (已取消) │
       └─────┬─────┘ └───────────┘ └───────────┘
             │
    ┌────────┼────────┐
    │                 │
    ▼                 ▼
┌───────────┐   ┌───────────┐
│ COMPLETED │   │  FAILED   │
│  (已完成) │   │  (失败)   │
└─────┬─────┘   └───────────┘
      │
      ▼
┌───────────┐
│ REFUNDED  │ (已退款，可选)
└───────────┘
```

### 状态机实现

```javascript
const PaymentStateMachine = {
  CREATED: {
    allowedTransitions: ['PENDING', 'CANCELLED'],
    onEnter: (payment) => { /* 创建订单逻辑 */ },
  },
  PENDING: {
    allowedTransitions: ['PROCESSING', 'EXPIRED', 'CANCELLED'],
    timeout: 30 * 60 * 1000, // 30分钟超时
  },
  PROCESSING: {
    allowedTransitions: ['COMPLETED', 'FAILED'],
  },
  COMPLETED: {
    allowedTransitions: ['REFUNDED'],
    onEnter: (payment) => { /* 发送成功通知 */ },
  },
  FAILED: {
    allowedTransitions: [], // 终态
    onEnter: (payment) => { /* 发送失败通知 */ },
  },
  EXPIRED: {
    allowedTransitions: [], // 终态
  },
  CANCELLED: {
    allowedTransitions: [], // 终态
  },
  REFUNDED: {
    allowedTransitions: [], // 终态
  },
};

function transition(payment, newStatus) {
  const currentState = PaymentStateMachine[payment.status];
  if (!currentState.allowedTransitions.includes(newStatus)) {
    throw new PaymentError('PYB005', `Invalid transition: ${payment.status} -> ${newStatus}`);
  }
  payment.status = newStatus;
  payment.updatedAt = new Date();
  return payment;
}
```

---

## 幂等性处理

### 幂等性设计原则

1. **唯一请求ID**: 每个请求携带唯一的`idempotencyKey`
2. **去重存储**: 使用Redis存储已处理的请求
3. **原子操作**: 使用Redis SETNX保证原子性
4. **结果缓存**: 缓存处理结果供重复请求返回

### 幂等性中间件

```javascript
const Redis = require('ioredis');
const redis = new Redis();

const idempotencyMiddleware = async (req, res, next) => {
  const idempotencyKey = req.headers['x-idempotency-key'];

  if (!idempotencyKey) {
    return next(); // 无幂等键，正常处理
  }

  const cacheKey = `pay:idempotency:${idempotencyKey}`;

  // 检查是否已处理
  const cachedResult = await redis.get(cacheKey);
  if (cachedResult) {
    return res.status(200).json(JSON.parse(cachedResult));
  }

  // 尝试获取锁
  const lockKey = `pay:idempotency:lock:${idempotencyKey}`;
  const locked = await redis.set(lockKey, '1', 'NX', 'EX', 60);

  if (!locked) {
    return res.status(409).json({
      code: 'PYB007',
      message: 'Request is being processed',
    });
  }

  // 保存原始send方法
  const originalSend = res.json.bind(res);
  res.json = async (body) => {
    // 缓存结果，TTL 24小时
    await redis.setex(cacheKey, 86400, JSON.stringify(body));
    await redis.del(lockKey);
    return originalSend(body);
  };

  next();
};

module.exports = idempotencyMiddleware;
```

---

## 重试策略

### 支付重试配置

```javascript
const retryConfig = {
  maxRetries: 3,
  initialDelay: 1000,      // 初始延迟1秒
  maxDelay: 30000,         // 最大延迟30秒
  backoffMultiplier: 2,    // 指数退避倍数
  retryableErrors: [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'NETWORK_ERROR',
  ],
};

async function retryableRequest(fn, options = retryConfig) {
  let lastError;
  let delay = options.initialDelay;

  for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!options.retryableErrors.includes(error.code)) {
        throw error; // 不可重试错误，直接抛出
      }

      if (attempt < options.maxRetries) {
        console.log(`Retry attempt ${attempt}, waiting ${delay}ms`);
        await sleep(delay);
        delay = Math.min(delay * options.backoffMultiplier, options.maxDelay);
      }
    }
  }

  throw lastError;
}
```

---

## 消息队列集成

### Bull队列配置

```javascript
const Queue = require('bull');

// 支付回调处理队列
const paymentCallbackQueue = new Queue('payment-callback', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

// 添加任务
async function enqueueCallback(paymentId, callbackData) {
  await paymentCallbackQueue.add('process-callback', {
    paymentId,
    callbackData,
    timestamp: new Date().toISOString(),
  }, {
    jobId: `callback-${paymentId}`, // 保证幂等
    priority: 1,
  });
}

// 处理任务
paymentCallbackQueue.process('process-callback', async (job) => {
  const { paymentId, callbackData } = job.data;

  try {
    await processPaymentCallback(paymentId, callbackData);
    return { success: true };
  } catch (error) {
    console.error(`Callback processing failed: ${error.message}`);
    throw error; // Bull会自动重试
  }
});

// 死信队列处理
paymentCallbackQueue.on('failed', async (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    // 进入死信队列
    await deadLetterQueue.add('failed-callback', {
      originalJob: job.data,
      error: err.message,
      failedAt: new Date().toISOString(),
    });
  }
});
```

---

## 支付渠道适配器

### 适配器模式实现

```javascript
// 支付渠道接口
class PaymentChannel {
  async createPayment(order) { throw new Error('Not implemented'); }
  async queryPayment(paymentId) { throw new Error('Not implemented'); }
  async refund(paymentId, amount) { throw new Error('Not implemented'); }
  verifyCallback(data, signature) { throw new Error('Not implemented'); }
}

// 微信支付适配器
class WechatPayChannel extends PaymentChannel {
  constructor(config) {
    super();
    this.appId = config.appId;
    this.mchId = config.mchId;
    this.apiKey = config.apiKey;
  }

  async createPayment(order) {
    // 调用微信支付API
    const params = {
      appid: this.appId,
      mch_id: this.mchId,
      out_trade_no: order.orderId,
      total_fee: order.amount * 100, // 微信以分为单位
      // ...其他参数
    };
    return await this.callWechatApi('/pay/unifiedorder', params);
  }

  verifyCallback(data, signature) {
    // 验证微信回调签名
    const calculatedSign = this.calculateSign(data);
    return calculatedSign === signature;
  }
}

// 支付宝适配器
class AlipayChannel extends PaymentChannel {
  async createPayment(order) {
    // 调用支付宝API
  }
}

// 渠道工厂
class PaymentChannelFactory {
  static channels = {
    wechat: WechatPayChannel,
    alipay: AlipayChannel,
  };

  static create(channelType, config) {
    const ChannelClass = this.channels[channelType];
    if (!ChannelClass) {
      throw new PaymentError('PYB002', `Unknown channel: ${channelType}`);
    }
    return new ChannelClass(config);
  }
}

// 使用示例
const channel = PaymentChannelFactory.create('wechat', wechatConfig);
const result = await channel.createPayment(order);
```

---

## 健康检查

### 健康检查端点

```javascript
const express = require('express');
const mongoose = require('mongoose');
const Redis = require('ioredis');

const healthRouter = express.Router();
const redis = new Redis();

healthRouter.get('/health', async (req, res) => {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'payment-service',
    checks: {},
  };

  // MongoDB检查
  try {
    await mongoose.connection.db.admin().ping();
    checks.checks.mongodb = { status: 'up' };
  } catch (error) {
    checks.checks.mongodb = { status: 'down', error: error.message };
    checks.status = 'unhealthy';
  }

  // Redis检查
  try {
    await redis.ping();
    checks.checks.redis = { status: 'up' };
  } catch (error) {
    checks.checks.redis = { status: 'down', error: error.message };
    checks.status = 'unhealthy';
  }

  const statusCode = checks.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(checks);
});

// 就绪检查
healthRouter.get('/health/ready', async (req, res) => {
  // 检查所有依赖是否就绪
  res.status(200).json({ status: 'ready' });
});

// 存活检查
healthRouter.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

module.exports = healthRouter;
```

---

## 相关资源

- Agent启动提示词: `agent_prompts.md`
- 详细工作计划: `digital_bank_poc_workplan.md`
- **技术标准规范 v1.0**: `docs/architecture/technical-standards-v1.0.md` ⚠️ **必须遵循**
- **命名规范 v1.0**: `docs/architecture/naming-conventions.md` ⚠️ **必须遵循**

---

**版本**: v1.1.0  
**创建日期**: 2026-01-26  
**维护者**: Digital Bank POC Team
