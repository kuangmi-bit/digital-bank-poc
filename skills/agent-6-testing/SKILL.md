---
name: agent-6-testing
version: 1.0.0
description: 测试执行自动机Agent技能 - 负责自动化测试的执行、测试用例生成和测试报告输出。使用Postman + Cypress + JMeter + TestRail技术栈。
author: Digital Bank POC Team
license: MIT
keywords:
  - testing
  - automation
  - postman
  - cypress
  - jmeter
  - api-testing
  - e2e-testing
  - performance-testing
---

# Agent 6: 测试执行自动机 🧪

## 概述

Agent 6负责自动化测试的执行、测试用例生成和测试报告输出。确保所有功能、性能和集成测试自动化执行，提供全面的测试覆盖。

## 何时使用

当需要：
- 执行API测试
- 执行E2E测试
- 执行性能测试
- 生成测试报告
- 验证测试覆盖率

## 技术栈

- **API测试**: Postman / Newman
- **E2E测试**: Cypress
- **性能测试**: JMeter
- **测试管理**: TestRail
- **测试数据**: Faker.js / Python Faker

## 核心功能

### 1. API测试
- 基于OpenAPI自动生成测试用例
- API回归测试
- 集成测试

### 2. E2E测试
- 用户流程测试（登录、转账等）
- 页面功能测试
- 跨浏览器测试

### 3. 性能测试
- 负载测试（100 TPS）
- 压力测试
- 响应时间测试（P95 < 2s）

### 4. 测试数据
- 测试数据自动生成
- 测试数据管理

## 自动化能力

- **测试自动化**: 90%自动化
  - API测试用例自动生成（基于OpenAPI）
  - E2E测试脚本自动生成（基于页面流程）
  - 性能测试脚本自动生成（基于负载模型）
  - 测试数据自动准备
  - 测试报告自动输出

## 执行节奏

- **每小时**: API回归测试
- **每6小时**: 集成测试
- **每24小时**: E2E测试 + 性能测试

## 交付标准

- **API测试用例**: 100+个
- **E2E测试场景**: 10+个
- **性能测试脚本**: 5+个
- **测试覆盖率**: 核心功能≥70%

## 项目结构

```
tests/
├── postman/
│   └── collections/     # Postman测试集合
│       ├── core-bank.json
│       ├── payment.json
│       └── risk.json
├── cypress/
│   └── e2e/             # E2E测试脚本
│       ├── login-flow.spec.js
│       ├── transfer-flow.spec.js
│       └── ...
├── jmeter/
│   └── test-plans/      # JMeter测试计划
│       ├── load-test.jmx
│       └── stress-test.jmx
├── data/
│   └── generators/      # 测试数据生成脚本
└── reports/             # 测试报告
```

## 测试报告格式

- 测试执行摘要
- 通过/失败统计
- 性能指标（响应时间、TPS）
- 问题列表和优先级
- 测试覆盖率报告

## 协作关系

- **与所有服务Agent**: 测试各服务的API
- **与Agent 4**: 测试前端E2E流程
- **与Agent 0**: 报告测试结果和问题
- **与Agent 8**: 在CI/CD中集成测试

## 关键里程碑

- **Day 2**: 测试框架配置完成
- **Day 4**: 基础API测试用例完成
- **Day 5**: 集成测试和E2E测试完成
- **Day 8**: 完整测试套件执行
- **Day 10**: 性能测试完成
- **Day 11**: 综合测试报告完成

## 测试示例

### Postman测试示例
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

### Cypress E2E测试示例
```javascript
describe('Transfer Flow', () => {
  it('should complete a transfer', () => {
    cy.visit('/login');
    cy.get('[data-testid="username"]').type('testuser');
    cy.get('[data-testid="password"]').type('password');
    cy.get('[data-testid="login-button"]').click();
    
    cy.visit('/transfer');
    cy.get('[data-testid="amount"]').type('100');
    cy.get('[data-testid="submit"]').click();
    
    cy.contains('转账成功').should('be.visible');
  });
});
```

## 技术标准规范要求

**重要**: 必须严格遵循技术标准规范和命名规范。

### 必须遵循的规范文档

1. **技术标准规范 v1.0**: `docs/architecture/technical-standards-v1.0.md`
2. **命名规范 v1.0**: `docs/architecture/naming-conventions.md`

### 测试命名规范要点

- **测试文件**: 遵循各技术栈规范 (如 `AccountServiceTest.java`, `payment.test.js`, `test_risk_service.py`)
- **测试方法**: `test_{scenario}_{expected_result}()` 或 `should_{expected_result}_when_{condition}()`
- **测试数据**: 描述性命名 (如 `validAccountData`, `invalidAccountNumber`)
- **测试报告**: `{service}-test-report-{date}.json` (kebab-case)

## 测试数据管理

### 测试数据生成器

```javascript
// tests/data/generators/account-generator.js
const { faker } = require('@faker-js/faker/locale/zh_CN');

const generateAccount = (overrides = {}) => ({
  accountNumber: faker.string.numeric(16),
  customerName: faker.person.fullName(),
  balance: faker.number.float({ min: 0, max: 1000000, precision: 0.01 }),
  status: faker.helpers.arrayElement(['active', 'inactive', 'frozen']),
  accountType: faker.helpers.arrayElement(['savings', 'checking']),
  createdAt: faker.date.past().toISOString(),
  ...overrides,
});

const generateTransaction = (overrides = {}) => ({
  transactionId: `TXN${faker.string.numeric(12)}`,
  fromAccountId: faker.string.uuid(),
  toAccountId: faker.string.uuid(),
  amount: faker.number.float({ min: 1, max: 50000, precision: 0.01 }),
  type: faker.helpers.arrayElement(['transfer', 'deposit', 'withdrawal']),
  status: faker.helpers.arrayElement(['pending', 'completed', 'failed']),
  createdAt: faker.date.recent().toISOString(),
  ...overrides,
});

module.exports = {
  generateAccount,
  generateTransaction,
  generateAccounts: (count) => Array.from({ length: count }, generateAccount),
  generateTransactions: (count) => Array.from({ length: count }, generateTransaction),
};
```

### 测试数据Fixtures

```javascript
// tests/fixtures/accounts.json
{
  "validAccount": {
    "accountNumber": "6222021234567890",
    "customerName": "张三",
    "balance": 10000.00,
    "status": "active"
  },
  "frozenAccount": {
    "accountNumber": "6222029876543210",
    "customerName": "李四",
    "balance": 5000.00,
    "status": "frozen"
  },
  "zeroBalanceAccount": {
    "accountNumber": "6222025555555555",
    "customerName": "王五",
    "balance": 0.00,
    "status": "active"
  }
}
```

### 测试数据清理

```javascript
// tests/helpers/cleanup.js
const mongoose = require('mongoose');

async function cleanupTestData() {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    if (collection.collectionName.startsWith('test_')) {
      await collection.deleteMany({});
    }
  }
}

async function setupTestData(fixtures) {
  // 导入测试数据
  for (const [collectionName, data] of Object.entries(fixtures)) {
    await mongoose.connection.db.collection(collectionName).insertMany(data);
  }
}

module.exports = { cleanupTestData, setupTestData };
```

---

## Mock服务配置

### WireMock配置

```json
// tests/mocks/wiremock/mappings/risk-service.json
{
  "mappings": [
    {
      "name": "Risk Check - Approve",
      "request": {
        "method": "POST",
        "urlPath": "/api/v1/risk/check",
        "bodyPatterns": [
          {
            "matchesJsonPath": "$.amount",
            "lessThan": 50000
          }
        ]
      },
      "response": {
        "status": 200,
        "headers": {
          "Content-Type": "application/json"
        },
        "jsonBody": {
          "code": 200,
          "message": "Success",
          "data": {
            "decision": "APPROVE",
            "riskScore": 10,
            "riskLevel": "LOW"
          }
        }
      }
    },
    {
      "name": "Risk Check - Reject High Amount",
      "request": {
        "method": "POST",
        "urlPath": "/api/v1/risk/check",
        "bodyPatterns": [
          {
            "matchesJsonPath": "$.amount",
            "greaterThanOrEqual": 50000
          }
        ]
      },
      "response": {
        "status": 403,
        "jsonBody": {
          "code": "RKB003",
          "message": "超过交易限额"
        }
      }
    }
  ]
}
```

### Mock Service Worker (MSW)

```javascript
// tests/mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  // 账户查询Mock
  rest.get('/api/v1/accounts/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        code: 200,
        data: {
          id,
          accountNumber: '6222021234567890',
          balance: 10000.00,
          status: 'active'
        }
      })
    );
  }),

  // 转账Mock
  rest.post('/api/v1/transactions/transfer', async (req, res, ctx) => {
    const body = await req.json();
    if (body.amount > 500000) {
      return res(
        ctx.status(400),
        ctx.json({ code: 'CBB004', message: '超过单笔限额' })
      );
    }
    return res(
      ctx.status(201),
      ctx.json({
        code: 201,
        data: { transactionId: 'TXN123456789012' }
      })
    );
  }),
];
```

---

## 契约测试

### Pact契约测试（消费者端）

```javascript
// tests/contract/consumer/account.pact.spec.js
const { Pact } = require('@pact-foundation/pact');
const { accountApi } = require('../../../src/services/account-api');

describe('Account API Contract', () => {
  const provider = new Pact({
    consumer: 'frontend',
    provider: 'core-bank-service',
    port: 1234,
  });

  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());
  afterEach(() => provider.verify());

  describe('GET /api/v1/accounts/:id', () => {
    it('should return account details', async () => {
      await provider.addInteraction({
        state: 'account with id 123 exists',
        uponReceiving: 'a request for account 123',
        withRequest: {
          method: 'GET',
          path: '/api/v1/accounts/123',
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: {
            code: 200,
            data: {
              id: '123',
              accountNumber: Pact.Matchers.string('6222021234567890'),
              balance: Pact.Matchers.decimal(10000.00),
              status: Pact.Matchers.term({
                generate: 'active',
                matcher: 'active|inactive|frozen'
              })
            }
          }
        }
      });

      const account = await accountApi.getAccountById('123');
      expect(account.data.id).toBe('123');
    });
  });
});
```

### 契约测试（提供者端）

```javascript
// tests/contract/provider/verify.spec.js
const { Verifier } = require('@pact-foundation/pact');

describe('Pact Verification', () => {
  it('validates the expectations of frontend', async () => {
    const verifier = new Verifier({
      providerBaseUrl: 'http://localhost:8080',
      pactBrokerUrl: process.env.PACT_BROKER_URL,
      provider: 'core-bank-service',
      publishVerificationResult: true,
      providerVersion: process.env.GIT_COMMIT,
    });

    await verifier.verifyProvider();
  });
});
```

---

## 测试环境隔离

### Docker Compose测试环境

```yaml
# tests/docker-compose.test.yml
version: '3.8'

services:
  postgres-test:
    image: postgres:15
    environment:
      POSTGRES_DB: testbank_test
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
    ports:
      - "5433:5432"
    tmpfs:
      - /var/lib/postgresql/data  # 使用内存存储，测试后自动清理

  mongodb-test:
    image: mongo:7.0
    ports:
      - "27018:27017"
    tmpfs:
      - /data/db

  redis-test:
    image: redis:7
    ports:
      - "6380:6379"

  wiremock:
    image: wiremock/wiremock:3.0.0
    ports:
      - "8090:8080"
    volumes:
      - ./mocks/wiremock:/home/wiremock
    command: --verbose
```

### 测试环境配置

```javascript
// tests/config/test-env.js
module.exports = {
  database: {
    host: process.env.TEST_DB_HOST || 'localhost',
    port: process.env.TEST_DB_PORT || 5433,
    name: 'testbank_test',
    user: 'test',
    password: 'test',
  },
  mongodb: {
    uri: process.env.TEST_MONGO_URI || 'mongodb://localhost:27018/testbank_test',
  },
  redis: {
    host: process.env.TEST_REDIS_HOST || 'localhost',
    port: process.env.TEST_REDIS_PORT || 6380,
  },
  mockServer: {
    url: process.env.MOCK_SERVER_URL || 'http://localhost:8090',
  },
};
```

---

## 测试报告模板

### 测试报告格式

```json
{
  "reportName": "Digital Bank POC - 测试报告",
  "reportDate": "2026-01-26",
  "environment": "QA",
  "summary": {
    "totalTests": 150,
    "passed": 145,
    "failed": 3,
    "skipped": 2,
    "passRate": "96.67%",
    "duration": "5m 23s"
  },
  "byCategory": {
    "unit": { "total": 80, "passed": 79, "failed": 1 },
    "integration": { "total": 40, "passed": 38, "failed": 2 },
    "e2e": { "total": 20, "passed": 19, "failed": 1 },
    "performance": { "total": 10, "passed": 9, "failed": 0 }
  },
  "byService": {
    "core-bank-service": { "total": 50, "passed": 48, "failed": 2 },
    "payment-service": { "total": 35, "passed": 35, "failed": 0 },
    "risk-service": { "total": 25, "passed": 24, "failed": 1 },
    "frontend": { "total": 40, "passed": 38, "failed": 0 }
  },
  "performance": {
    "tps": 120,
    "p95ResponseTime": "1.2s",
    "p99ResponseTime": "1.8s",
    "errorRate": "0.05%"
  },
  "failedTests": [
    {
      "name": "test_transfer_insufficient_balance",
      "service": "core-bank-service",
      "error": "Expected 400 but got 500",
      "category": "integration"
    }
  ]
}
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
