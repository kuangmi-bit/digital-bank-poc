# API 设计规范 v1.0

**版本**: v1.0.0  
**发布日期**: 2026-01-26  
**维护者**: Agent 0（架构管控中枢）  
**依据**: technical-standards-v1.0、ADR-002、ADR-004、data-dictionary-v1.0

---

## 1. 概述

本规范在《技术标准规范 v1.0》中「API 设计规范」基础上做提炼与扩展，作为各服务 OpenAPI 与实现的一致基准。Agent 1（核心银行）、Agent 2（支付）、Agent 3（风控）、Agent 4（前端调用的后端 API）在编写 `openapi.yaml` 及实现接口时须遵循本文；Agent 0 在决策窗口中按本规范及下文「Day 2 API 审批准则」进行审批。

---

## 2. 通用约定

### 2.1 基础路径与版本

- **基础路径**: `/api/v1/{resource}`  
- **资源名**: kebab-case，复数形式，如 `/api/v1/accounts`、`/api/v1/transactions`、`/api/v1/payments`。  
- **版本**: 路径中包含 `v1`；不兼容变更时升为 `v2`，旧版在弃用期内并行支持。

### 2.2 HTTP 方法语义

| 方法 | 用途 | 幂等 | 示例 |
|------|------|------|------|
| `GET` | 查询单条/列表 | 是 | `GET /api/v1/accounts/{id}` |
| `POST` | 创建、复合操作 | 否 | `POST /api/v1/accounts`、`POST /api/v1/transfers` |
| `PUT` | 全量更新 | 是 | `PUT /api/v1/accounts/{id}` |
| `PATCH` | 部分更新 | 否* | `PATCH /api/v1/accounts/{id}` |
| `DELETE` | 删除（逻辑/物理按业务定） | 是 | `DELETE /api/v1/accounts/{id}` |

\* 按 RFC 建议，PATCH 幂等性取决于具体语义，需在接口说明中标明。

### 2.3 HTTP 状态码

| 状态码 | 含义 | 常见场景 |
|--------|------|----------|
| `200 OK` | 成功 | GET、PUT、PATCH、DELETE 成功 |
| `201 Created` | 创建成功 | POST 创建资源成功，需在 `Location` 或 Body 返回新资源标识 |
| `400 Bad Request` | 请求参数/Body 错误 | 校验失败、业务规则拒绝（如余额不足） |
| `401 Unauthorized` | 未认证 | 缺少或无效 Token |
| `403 Forbidden` | 无权限 | 已认证但权限不足、风控拦截等 |
| `404 Not Found` | 资源不存在 | 路径或 ID 对应资源不存在 |
| `408 Request Timeout` | 请求超时 | 客户端或网关超时 |
| `409 Conflict` | 冲突 | 乐观锁、重复提交、状态不允许 |
| `429 Too Many Requests` | 限流 | 触发限流策略 |
| `500 Internal Server Error` | 服务端错误 | 未分类异常 |
| `503 Service Unavailable` | 服务不可用 | 依赖不可用、过载、维护 |

### 2.4 请求与响应格式

- **Content-Type**: `application/json`  
- **Accept**: `application/json`（可选显式声明）  
- **字符编码**: UTF-8  
- **日期时间**: ISO 8601，如 `2026-01-26T10:00:00Z` 或带时区 `2026-01-26T10:00:00+08:00`

### 2.5 统一成功响应结构

```json
{
  "code": 200,
  "message": "Success",
  "data": { },
  "timestamp": "2026-01-26T10:00:00Z"
}
```

- `code`: 与 HTTP 状态码一致或业务码，推荐与 HTTP 对齐以便网关与客户端统一处理。  
- `message`: 简短描述，可用于日志与前端提示。  
- `data`: 业务载荷；列表时可为 `{ "items": [], "total": 0, "page": 1, "pageSize": 20 }` 等形式。  
- `timestamp`: 服务端响应时间，ISO 8601。

### 2.6 统一错误响应结构

```json
{
  "code": 400,
  "message": "Bad Request",
  "errors": [
    { "field": "accountNumber", "message": "Account number is required" }
  ],
  "timestamp": "2026-01-26T10:00:00Z"
}
```

- `errors`: 按字段的校验错误；若为单条业务错误可只填 `message`，`errors` 可省略或为空数组。  
- 错误码格式与 `technical-standards` 一致：`{SERVICE}{TYPE}{CODE}`（如 `CBB001`、`PYB001`、`RKB001`），在 `code` 或独立 `errorCode` 字段中体现，由各服务 OpenAPI 在 `components` 中声明。

---

## 3. OpenAPI 3.0 要求

- **版本**: OpenAPI 3.0  
- **格式**: YAML（推荐）或 JSON  
- **放置**: `{service}/docs/openapi.yaml` 或项目约定的 `docs/` 目录，便于 CI 与聚合。

**必需顶层节点**:

- `openapi: "3.0.x"`
- `info`: `title`、`version`、`description`
- `servers`: 至少一个 `url`（可为占位，如 `http://localhost:8080`）
- `paths`: 路径及 `get`/`post`/`put`/`patch`/`delete` 等
- `components`: 至少包含 `schemas`；推荐 `securitySchemes`、`responses` 复用

**路径与操作**:

- 每个操作需：`summary`、`description`、`operationId`、`tags`、`responses`（至少 200、4xx、5xx）。  
- 若有请求体，需 `requestBody` 及 `content.application/json.schema`。  
- 若需认证，在操作或路径上声明 `security`。

**Schema**:

- 与 `data-dictionary-v1.0`、ADR-003 一致：  
  - 金额：`number` 或 `string`+`format` 需在 Schema 中说明精度与货币；与库中 `DECIMAL(19,2)` 或 `number` 对应。  
  - 时间：`string` + `format: date-time`（ISO 8601）。  
  - 枚举：与数据字典中 status、type 等一致，用 `enum` 列出。

---

## 4. 分页、排序与过滤

- **分页**: 推荐 `page`（从 1 起）、`pageSize`（默认 20，最大可约定如 100）；响应中提供 `total` 或 `totalCount`。  
- **排序**: `sort=field1,-field2` 或 `orderBy=field1&order=desc`，在 OpenAPI 的 `parameters` 中写清。  
- **过滤**: 按资源需要 `filter[field]=value` 或 `field=value`，在文档中列出支持字段及类型。

---

## 5. 安全

- **认证**: JWT；`Authorization: Bearer <token>`；Token 过期与刷新策略见 `technical-standards`。  
- **授权**: 按角色/资源做校验；风控拦截等可返回 403 与统一错误体。  
- 在 OpenAPI 中声明 `securitySchemes`（如 `bearerAuth`）及需要认证的 path/operation。

---

## 6. Day 2 API 审批准则

> **适用场景**：Agent 1–4 在 Day 2 尚未提交 OpenAPI 初稿时，本段作为 **审批准则**：各 Agent 编写 `openapi.yaml` 时应满足以下条款；Agent 0 在收到初稿后的决策窗口 1 中按此审批。若已有初稿，则直接按本规范与下文检查清单做通过/退回决策。

### 6.1 必须满足项（否则不予通过）

1. **格式与放置**  
   - OpenAPI 3.0，YAML/JSON 合法，可被标准工具解析。  
   - 文件位置符合项目约定（如 `{service}/docs/openapi.yaml`）。

2. **路径与版本**  
   - 路径以 `/api/v1/` 为前缀。  
   - 资源名为 kebab-case、复数。

3. **与数据模型一致**  
   - 请求/响应中的实体字段与 `data-dictionary-v1.0` 及 ADR-003 中对应存储一致（命名可按 API 习惯 camelCase，但与数据字典可映射）。  
   - 枚举值与数据字典一致（如 `status`、`transaction_type`、`payment.status`）。

4. **HTTP 与状态码**  
   - 使用 2.3 中约定的状态码；不得滥用 200 表示业务失败。  
   - 成功与错误响应结构符合 2.5、2.6；错误码符合 `technical-standards` 错误码规范。

5. **契约完整**  
   - 每个 path 的每个 method 具备：`summary`、`operationId`、`responses`（含 200/201 及 4xx、5xx）。  
   - 有 Body 时具备 `requestBody` 与 `schema`；`components.schemas` 可被引用、无循环引用导致解析失败。

6. **安全**  
   - 需认证的接口在 OpenAPI 中声明 `security` 及 `securitySchemes`（如 JWT）。

### 6.2 建议满足项（不满足时需在评审中说明或列入改进）

- 分页、排序、过滤的入参与响应格式在文档中写清。  
- 为典型 4xx/5xx 提供 `examples`。  
- 服务间依赖的接口（如支付调核心银行、风控）在 `description` 或 `tags` 中标明「内部/服务间」，便于与 ADR-004 对照。  
- 和 `api-design-spec-v1.0`、`technical-standards` 中的错误码、日志（如 `traceId` 建议放在 Header）的对应关系在描述中简要说明。

### 6.3 审批检查清单（Agent 0 使用）

- [ ] OpenAPI 3.0、格式合法、路径 `/api/v1/`、kebab-case 复数资源名  
- [ ] 与 `data-dictionary-v1.0`、ADR-003 映射清晰，枚举一致  
- [ ] 成功/错误响应结构、HTTP 状态码、错误码符合本规范与 technical-standards  
- [ ] 各操作具备 `operationId`、`responses`、必要的 `requestBody` 与 `schema`  
- [ ] 认证/授权在 `security`/`securitySchemes` 中声明  
- [ ] 与 ADR-004 服务间通信（REST、JSON、超时/重试/熔断的契约侧描述）无冲突  

---

## 7. 与服务、存储的对应关系

| 服务       | 主要资源示例 | 存储（ADR-003） | OpenAPI 负责 |
|------------|--------------|-----------------|--------------|
| 核心银行   | accounts, customers, transactions, transfers | PostgreSQL | Agent 1 |
| 支付清算   | payments, settlements, callbacks | MongoDB | Agent 2 |
| 风控       | risk-check, rules, blacklists, events | Elasticsearch（+ 配置/缓存） | Agent 3 |
| 前端       | 仅消费上述 API，不经 Kong 的 BFF 若存在则单列 | — | Agent 4 协同 |

---

## 8. 相关文档

- 技术标准: `docs/architecture/technical-standards-v1.0.md`
- 命名规范: `docs/architecture/naming-conventions.md`
- 数据字典: `docs/data-model/data-dictionary-v1.0.md`
- ADR-002: 微服务拆分策略  
- ADR-003: 数据存储策略  
- ADR-004: 服务间通信方式  

---

**更新记录**

- v1.0.0 (2026-01-26): 初版发布；纳入 Day 2 API 审批准则与审批检查清单。
