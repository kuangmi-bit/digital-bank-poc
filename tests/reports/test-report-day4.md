# 测试报告 Day-4

**日期**: 2026-01-30  
**Agent**: 6 测试执行自动机  
**依据**: digital_bank_poc_workplan Day 4、technical-standards-v1.0、naming-conventions

---

## 1. 执行摘要

| 类别         | 状态   | 说明 |
|--------------|--------|------|
| API 测试用例 | 已就绪 | 基于 OpenAPI 生成，core-bank 21，payment 15，risk 4 |
| API 回归测试 | 可执行 | Newman，需 core-bank:8080、payment:3001、risk:8000 |
| E2E 脚本     | 已就绪 | 登录 4 条、转账 3 条，基于 /auth/login、/transactions/transfer |
| E2E 执行     | 可执行 | Cypress，需 frontend:3000 |
| 测试报告     | 已生成 | 本文件 |

---

## 2. API 测试（基于 OpenAPI）

### 2.1 用例统计

- **core-bank.json**（21）：Health 1；Accounts 9（开户 2、列表 3、详情 2、余额 2）；Customers 5（注册 2、查询 2、更新 1）；Transactions 6（列表 2、历史 1、转账 2、扣款 1）。
- **payment.json**（15）：Payments 9（创建 3、查询 2、处理 3、回调 1）；Settlements 6（对账 2、查询 2、处理 2）。
- **risk.json**（4）：风控检查 1、黑名单 1（本次沿用既有集合）。

### 2.2 运行方式（API 回归）

```bash
cd tests/postman
npm ci
# 先启动 core-bank:8080、payment:3001、risk:8000
npm run test:postman
```

- 报告输出：`tests/reports/core-bank-test-report.json`、`payment-test-report.json`、`risk-test-report.json`
- 若服务未启动：Newman 会报连接错误；环境就绪后重新执行即可。

---

## 3. E2E 测试（登录、转账）

### 3.1 用例

- **login-flow.spec.js**：表单展示、注册入口、登录成功跳转 /accounts、登录失败展示 [role="alert"]。
- **transfer-flow.spec.js**：转账表单展示（需已登录 + 账户列表 stub）、转账成功清空金额、转账失败展示 [role="alert"]。

### 3.2 运行方式（基础 E2E）

```bash
cd tests/cypress
npm ci
# 先启动 frontend:3000（可代理 /api 到 core-bank 或全部 stub）
npm run e2e
```

- 登录、转账用例通过 `cy.intercept`  stub `/api/v1/auth/login`、`/api/v1/accounts*`、`/api/v1/transactions/transfer`，可不依赖后端即可跑通。
- 若未启动 frontend，`cy.visit` 会失败；启动后执行即可。

---

## 4. 通过/失败统计（本次）

- **API**：未实际执行（依赖服务）；执行后可从 `*-test-report.json` 汇总。
- **E2E**：未实际执行（依赖 frontend）；执行后可从 Cypress 报告汇总。

---

## 5. 交付物

- `tests/postman/collections/core-bank.json`（20+）
- `tests/postman/collections/payment.json`（15+）
- `tests/cypress/e2e/login-flow.spec.js`
- `tests/cypress/e2e/transfer-flow.spec.js`
- `tests/reports/test-report-day4.md`（本报告）

---

## 6. 后续

- Day 5：完整 API 回归 + 集成/E2E + 覆盖率。
- 环境就绪后执行：`tests/postman` 下 `npm run test:postman`，`tests/cypress` 下 `npm run e2e`。
