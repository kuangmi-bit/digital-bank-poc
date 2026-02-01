# Postman 测试集合框架

遵循 `technical-standards-v1.0`、`naming-conventions`。API 测试：Postman / Newman。

## 目录

- `collections/` - 测试集合（core-bank, payment, risk）
- `environments/` - 环境变量（dev, qa）
- `package.json` - Newman CLI 与脚本

## 环境变量

| 变量 | 说明 | dev 示例 |
|------|------|----------|
| `core_bank_base_url` | 核心银行服务 | http://localhost:8080 |
| `payment_base_url` | 支付服务 | http://localhost:3001 |
| `risk_base_url` | 风控服务 | http://localhost:8000 |
| `account_id` | 测试用账户ID（运行时写入） | |
| `payment_id` | 测试用支付ID（运行时写入） | |

## 运行

```bash
# 安装 Newman
npm ci

# 运行全部集合（需先启动各服务）
npm run test:postman

# 运行单个集合
npx newman run collections/core-bank.json -e environments/dev.json
npx newman run collections/payment.json -e environments/dev.json
npx newman run collections/risk.json -e environments/dev.json

# 生成 HTML 报告
npm run test:postman:report
```

## 集合说明

- **core-bank.json**: 账户、客户、交易、转账等 API
- **payment.json**: 支付创建、处理、查询，清算对账
- **risk.json**: 风控检查、黑名单查询

## 命名规范

- 请求名：`{HTTP方法} {资源} - {场景}`，如 `POST 开户 - 成功`
- 测试脚本：`pm.test("should_{expected}_when_{condition}", ...)` 或 `pm.test("Status code is 200", ...)`
- 报告：`{service}-test-report-{date}.json`（kebab-case）
