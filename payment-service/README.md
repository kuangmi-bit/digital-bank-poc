# Payment Service · 支付清算处理器

数字银行 POC - Agent 2 支付服务。Node.js 20 + Express + MongoDB (Mongoose)。

## 快速启动

```bash
# 安装依赖
npm install

# 需先启动 MongoDB，可选用 docker-compose 中的 mongodb
# 启动服务（默认端口 3001）
npm start

# 开发模式（--watch）
npm run dev
```

## 环境变量

见 `.env.example`。常用：`MONGODB_URI`、`PAYMENT_PORT`。

## 测试（重要：离线/弱网可稳定执行）

支付服务的 **API/集成测试** 需要 MongoDB。为避免 `mongodb-memory-server` 首次下载二进制（约数百 MB）在无网/弱网环境下超时，测试默认策略为：

- **优先**：使用 `TEST_MONGODB_URI`（推荐，CI/本地一致）
- **其次**：尝试连接本机 Mongo（默认 `mongodb://127.0.0.1:27017/payment_test`，可用 `TEST_MONGODB_FALLBACK_URI` 覆盖）
- **最后**：仅在显式设置 `USE_MONGODB_MEMORY_SERVER=true` 时启用 `mongodb-memory-server`（可能触发下载，不建议 CI 默认使用）

### 本地运行（推荐：Docker Mongo）

1) 启动本地 Mongo（示例：Docker）

```bash
docker run -d --name payment-test-mongo -p 27017:27017 mongo:7
```

2) 设置测试数据库连接并运行测试

PowerShell:

```powershell
$env:TEST_MONGODB_URI="mongodb://127.0.0.1:27017/payment_test"
npm test
```

Bash:

```bash
export TEST_MONGODB_URI="mongodb://127.0.0.1:27017/payment_test"
npm test
```

### CI 建议

在 CI 中提供 MongoDB 服务（如 GitLab `services: [mongo:7]`），并设置：

- `TEST_MONGODB_URI=mongodb://mongo:27017/payment_test`

这样测试在 CI 中不会依赖外网下载，稳定可复现。

## API

- `POST /api/v1/payments` - 创建支付订单
- `GET /api/v1/payments/:payment-id` - 查询支付状态
- `POST /api/v1/payments/:payment-id/process` - 处理支付
- `POST /api/v1/settlements/reconcile` - 对账
- `GET /api/v1/settlements/:settlement-id` - 查询清算状态

规范：`docs/openapi.yaml` (OpenAPI 3.0)。

## 项目结构

```
src/
├── models/       # Payment, Settlement (Mongoose)
├── routes/       # payment-routes, settlement-routes
├── controllers/  # payment-controller, settlement-controller
├── mocks/        # payment-gateway (Mock)
├── middleware/   # error-handler
├── config/       # mongoose
├── utils/        # logger
├── app.js
└── index.js
```

## 规范

- 技术标准：`docs/architecture/technical-standards-v1.0.md`
- 命名规范：`docs/architecture/naming-conventions.md`
