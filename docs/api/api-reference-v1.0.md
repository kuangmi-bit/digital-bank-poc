# 数字银行 POC API 参考文档 v1.0

**版本**: v1.0.0
**发布日期**: 2026-02-05
**维护者**: Agent 0（架构管控中枢）

---

## 目录

1. [概述](#1-概述)
2. [认证与授权](#2-认证与授权)
3. [核心银行服务 API](#3-核心银行服务-api)
4. [支付服务 API](#4-支付服务-api)
5. [风控服务 API](#5-风控服务-api)
6. [错误码参考](#6-错误码参考)
7. [附录](#7-附录)

---

## 1. 概述

### 1.1 基础信息

| 项目 | 值 |
|------|-----|
| API 版本 | v1 |
| 基础路径 | `/api/v1` |
| 内容类型 | `application/json` |
| 字符编码 | UTF-8 |
| 时间格式 | ISO 8601 (`2026-02-05T10:00:00Z`) |

### 1.2 服务端点

| 服务 | 端口 | 基础路径 |
|------|------|----------|
| 核心银行服务 | 8080 | `/api/v1` |
| 支付服务 | 3001 | `/api/v1` |
| 风控服务 | 8000 | `/api/v1` |

### 1.3 通用响应格式

**成功响应**:
```json
{
  "code": 200,
  "message": "Success",
  "data": { ... },
  "timestamp": "2026-02-05T10:00:00Z"
}
```

**错误响应**:
```json
{
  "code": 400,
  "message": "Bad Request",
  "errorCode": "CBV001",
  "errors": [
    { "field": "amount", "message": "金额必须大于0" }
  ],
  "timestamp": "2026-02-05T10:00:00Z"
}
```

---

## 2. 认证与授权

### 2.1 JWT 认证

所有 API 需要 JWT Token 认证（除健康检查外）。

**请求头**:
```
Authorization: Bearer <token>
```

### 2.2 Token 获取

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

---

## 3. 核心银行服务 API

### 3.1 客户管理

#### 3.1.1 创建客户

```http
POST /api/v1/customers
```

**请求体**:
```json
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "phone": "13812345678",
  "idType": "ID_CARD",
  "idNumber": "110101199001011234"
}
```

**响应** (201 Created):
```json
{
  "code": 201,
  "message": "Created",
  "data": {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com",
    "phone": "13812345678",
    "status": "active",
    "createdAt": "2026-02-05T10:00:00Z"
  }
}
```

#### 3.1.2 查询客户

```http
GET /api/v1/customers/{id}
```

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 客户 ID |

### 3.2 账户管理

#### 3.2.1 开户

```http
POST /api/v1/accounts
```

**请求体**:
```json
{
  "customerId": 1,
  "accountType": "savings",
  "currency": "CNY"
}
```

**响应** (201 Created):
```json
{
  "code": 201,
  "message": "Created",
  "data": {
    "id": 1,
    "accountNumber": "6212345678901234",
    "customerId": 1,
    "accountType": "savings",
    "balance": 0.00,
    "currency": "CNY",
    "status": "active",
    "createdAt": "2026-02-05T10:00:00Z"
  }
}
```

#### 3.2.2 查询余额

```http
GET /api/v1/accounts/{id}/balance
```

**响应**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "accountId": 1,
    "balance": 10000.00,
    "currency": "CNY"
  }
}
```

#### 3.2.3 账户列表

```http
GET /api/v1/accounts?customerId=1&status=active&page=1&pageSize=20
```

**查询参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| customerId | Long | 否 | - | 客户 ID 过滤 |
| status | String | 否 | - | 状态过滤 (active/frozen) |
| page | Integer | 否 | 1 | 页码 |
| pageSize | Integer | 否 | 20 | 每页条数 (最大100) |

### 3.3 交易服务

#### 3.3.1 支付扣款

```http
POST /api/v1/transactions/debit
```

**请求体**:
```json
{
  "accountId": 1,
  "amount": 100.00,
  "refId": "PAY20260205001",
  "remark": "商品购买"
}
```

**响应** (201 Created):
```json
{
  "code": 201,
  "message": "Created",
  "data": {
    "transactionId": "TX1234567890abcdef",
    "accountId": 1,
    "amount": 100.00,
    "status": "completed"
  }
}
```

**幂等性**: 相同 `refId` 多次请求返回相同结果，不重复扣款。

#### 3.3.2 行内转账

```http
POST /api/v1/transactions/transfer
```

**请求体**:
```json
{
  "fromAccountId": 1,
  "toAccountId": 2,
  "amount": 1000.00,
  "remark": "转账备注"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "transactionId": "TX1234567890abcdefO",
    "fromAccountId": 1,
    "toAccountId": 2,
    "amount": 1000.00,
    "status": "completed"
  }
}
```

#### 3.3.3 批量转账

```http
POST /api/v1/transactions/batch-transfer
```

**请求体**:
```json
{
  "batchId": "BATCH20260205001",
  "transfers": [
    {
      "fromAccountId": 1,
      "toAccountId": 2,
      "amount": 100.00,
      "remark": "工资发放"
    },
    {
      "fromAccountId": 1,
      "toAccountId": 3,
      "amount": 200.00,
      "remark": "工资发放"
    }
  ]
}
```

**响应**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "batchId": "BATCH20260205001",
    "totalCount": 2,
    "successCount": 2,
    "failedCount": 0,
    "results": [
      {
        "index": 0,
        "status": "completed",
        "transactionId": "TX001"
      },
      {
        "index": 1,
        "status": "completed",
        "transactionId": "TX002"
      }
    ]
  }
}
```

**限制**: 单批最多 100 笔。

#### 3.3.4 预约转账

**创建预约**:
```http
POST /api/v1/transactions/scheduled
```

**请求体**:
```json
{
  "fromAccountId": 1,
  "toAccountId": 2,
  "amount": 5000.00,
  "scheduledTime": "2026-02-10T10:00:00Z",
  "remark": "定期转账"
}
```

**查询预约列表**:
```http
GET /api/v1/transactions/scheduled?accountId=1&status=pending
```

**取消预约**:
```http
DELETE /api/v1/transactions/scheduled/{scheduledId}
```

#### 3.3.5 交易历史

```http
GET /api/v1/transactions/history?accountId=1&from=2026-01-01T00:00:00Z&to=2026-02-05T23:59:59Z&page=1&pageSize=20
```

---

## 4. 支付服务 API

### 4.1 账单支付

#### 4.1.1 查询账单

```http
GET /api/v1/payments/bill/query?billType=electricity&billAccount=1001001
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| billType | String | 是 | 账单类型 (electricity/water/gas/phone) |
| billAccount | String | 是 | 缴费账号 |

**响应**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "billType": "electricity",
    "billAccount": "1001001",
    "billAmount": 156.80,
    "billPeriod": "2026-01",
    "dueDate": "2026-02-15",
    "payerName": "张三",
    "status": "unpaid"
  }
}
```

#### 4.1.2 支付账单

```http
POST /api/v1/payments/bill
```

**请求体**:
```json
{
  "billType": "electricity",
  "billAccount": "1001001",
  "payerAccountId": 1,
  "amount": 156.80
}
```

**响应** (201 Created):
```json
{
  "code": 201,
  "message": "Created",
  "data": {
    "paymentId": "BP1234567890abcdef",
    "billType": "electricity",
    "billAccount": "1001001",
    "amount": 156.80,
    "status": "completed",
    "paidAt": "2026-02-05T10:30:00Z"
  }
}
```

#### 4.1.3 支付记录列表

```http
GET /api/v1/payments/bill?payerAccountId=1&page=1&pageSize=20
```

### 4.2 支付状态查询

```http
GET /api/v1/payments/{paymentId}
```

---

## 5. 风控服务 API

### 5.1 风控检查

```http
POST /api/v1/risk/check
```

**请求体**:
```json
{
  "customerId": 1,
  "fromAccountId": 1,
  "toAccountId": 2,
  "amount": 50000.00,
  "transactionType": "transfer"
}
```

**响应** (通过):
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "passed": true,
    "riskLevel": "low",
    "checkId": "RK20260205001"
  }
}
```

**响应** (拒绝, 403):
```json
{
  "code": 403,
  "message": "Risk control rejected",
  "errorCode": "RKB001",
  "data": {
    "passed": false,
    "riskLevel": "high",
    "rejectReason": "单笔转账超过限额",
    "ruleTriggered": "single_transfer_limit"
  }
}
```

### 5.2 风控规则类型

| 规则类型 | 说明 | 检查项 |
|----------|------|--------|
| limit | 限额规则 | 单笔/单日限额 |
| frequency | 频率规则 | 单日/单小时次数 |
| blacklist | 黑名单 | 账户/客户黑名单 |
| batch_limit | 批量限额 | 批次总额/笔数限制 |
| scheduled_limit | 预约限额 | 待执行预约数限制 |

---

## 6. 错误码参考

### 6.1 核心银行服务 (CB)

| 错误码 | HTTP 状态 | 说明 |
|--------|-----------|------|
| CBB001 | 404 | 账户不存在 |
| CBB002 | 400 | 余额不足 |
| CBB003 | 400 | 账户已冻结 |
| CBB004 | 400 | 转账金额无效 |
| CBB005 | 400 | 同账户转账 |
| CBB006 | 403/404 | 客户不存在/无权操作 |
| CBB010 | 400 | 批量转账超过限制 |
| CBB011 | 400 | 预约时间无效 |
| CBB012 | 404 | 预约不存在 |
| CBB013 | 400 | 预约已执行/取消 |
| CBV001 | 400 | 必填参数缺失 |
| CBV002 | 400 | 金额格式错误 |
| CBV003 | 400 | 参数格式错误 |
| CBS001 | 500 | 系统内部错误 |

### 6.2 支付服务 (PY)

| 错误码 | HTTP 状态 | 说明 |
|--------|-----------|------|
| PYB001 | 404 | 支付记录不存在 |
| PYB002 | 400 | 账单已支付 |
| PYB003 | 400 | 账单金额不匹配 |
| PYB004 | 400 | 缴费账号无效 |
| PYV001 | 400 | 参数校验失败 |
| PYS001 | 500 | 系统内部错误 |

### 6.3 风控服务 (RK)

| 错误码 | HTTP 状态 | 说明 |
|--------|-----------|------|
| RKB001 | 403 | 风控拒绝（通用） |
| RKB002 | 403 | 黑名单拦截 |
| RKB003 | 403 | 超过限额 |
| RKB004 | 403 | 超过频率限制 |
| RKV001 | 400 | 参数校验失败 |
| RKS001 | 500 | 系统内部错误 |

---

## 7. 附录

### 7.1 数据类型定义

| 类型 | 格式 | 示例 |
|------|------|------|
| 账户 ID | Long | 1, 2, 100 |
| 金额 | Decimal(19,2) | 1000.00 |
| 时间 | ISO 8601 | 2026-02-05T10:00:00Z |
| 账户号 | String(16) | 6212345678901234 |
| 交易 ID | String(26) | TX1234567890abcdefO |
| 批次 ID | String | BATCH20260205001 |

### 7.2 状态枚举

**账户状态**:
| 值 | 说明 |
|-----|------|
| active | 正常 |
| frozen | 冻结 |
| closed | 销户 |

**交易状态**:
| 值 | 说明 |
|-----|------|
| pending | 处理中 |
| completed | 已完成 |
| failed | 失败 |

**预约状态**:
| 值 | 说明 |
|-----|------|
| pending | 待执行 |
| processing | 执行中 |
| completed | 已完成 |
| failed | 失败 |
| cancelled | 已取消 |

### 7.3 限流说明

| API | 限流策略 |
|-----|----------|
| 转账类 | 100 次/分钟/客户 |
| 查询类 | 1000 次/分钟/客户 |
| 批量类 | 10 次/分钟/客户 |

### 7.4 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| v1.0.0 | 2026-02-05 | 初版发布，包含完整 API 定义 |

---

**文档更新**: 2026-02-05
**维护者**: Agent 0（架构管控中枢）
