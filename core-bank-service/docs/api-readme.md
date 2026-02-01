# 核心银行服务 - API 接口文档

## 概述

- **OpenAPI 规范**: [openapi.yaml](./openapi.yaml)（OpenAPI 3.0）
- **Swagger UI**: 启动服务后访问 `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/api-docs`

## 基础路径与版本

- 基础路径: `/api/v1/`
- 资源: kebab-case 复数，如 `accounts`、`customers`、`transactions`

## 接口一览

### 账户 (accounts)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/v1/accounts | 开户 |
| GET | /api/v1/accounts | 查询账户列表（分页、按 customerId/status 过滤） |
| GET | /api/v1/accounts/{account-id} | 查询账户详情 |
| GET | /api/v1/accounts/{account-id}/balance | 余额查询 |

### 客户 (customers)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/v1/customers | 客户注册 |
| GET | /api/v1/customers/{customer-id} | 客户查询 |
| PUT | /api/v1/customers/{customer-id} | 客户更新 |

### 交易 (transactions)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/v1/transactions | 交易查询（分页、按 accountId/status 过滤） |
| GET | /api/v1/transactions/history | 交易历史（按 accountId、时间范围） |
| POST | /api/v1/transactions/transfer | 行内转账 |

## 通用说明

- **Content-Type**: `application/json`，UTF-8
- **日期时间**: ISO 8601，如 `2026-01-27T10:00:00Z`
- **金额**: 与数据字典一致，DECIMAL(19,2)，JSON 中以 number 表示
- **分页**: `page`（从 1 起）、`pageSize`（默认 20，最大 100）；响应含 `items`、`total`、`page`、`pageSize`

## 测试说明（Day 6 优先修复：Mockito / JDK 25）

- **现象**：在 JDK 25 下，Mockito 创建 mock 可能因 Byte Buddy 版本兼容性报错（`Java 25 (69) is not supported...`）。
- **修复**：`pom.xml` 中已为 surefire 追加 `-Dnet.bytebuddy.experimental=true`（仅测试运行时），以便在 JDK 25 环境继续运行单测。
- **补充**：若未来遇到 “inline mock maker 自附加 agent 将被禁止” 或动态 attach 受限提示，可评估在测试 JVM 增加 `-XX:+EnableDynamicAgentLoading`（注意该参数与 JVM 实现/版本相关，需在团队文档中说明）。

## 错误码（Core Bank）

| 错误码 | 描述 | HTTP |
|--------|------|------|
| CBB001 | 账户不存在 | 404 |
| CBB002 | 余额不足 | 400 |
| CBB003 | 账户已冻结 | 400 |
| CBB004 | 转账金额无效 | 400 |
| CBB005 | 同账户转账 | 400 |
| CBB006 | 客户不存在 | 404 |
| CBV001 | 账号格式无效 | 400 |
| CBV002 | 金额格式无效 | 400 |
| CBV003 | 必填字段缺失 | 400 |
| CBS001 | 数据库连接失败 | 500 |
| CBA001 | Token 过期 | 401 |
| CBA002 | 权限不足 | 403 |

详见 [openapi.yaml](./openapi.yaml) 与 [技术标准规范](../../docs/architecture/technical-standards-v1.0.md) 错误处理一节。
