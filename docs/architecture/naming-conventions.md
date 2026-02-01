# 命名规范 v1.0

**版本**: v1.0.0  
**发布日期**: 2026-01-26  
**维护者**: Agent 0 (架构管控中枢)  
**适用范围**: 所有Agent必须严格遵循

---

## 📋 目录

1. [概述](#概述)
2. [代码命名规范](#代码命名规范)
3. [文件命名规范](#文件命名规范)
4. [目录结构命名](#目录结构命名)
5. [API命名规范](#api命名规范)
6. [数据库命名规范](#数据库命名规范)
7. [服务命名规范](#服务命名规范)
8. [配置命名规范](#配置命名规范)
9. [测试命名规范](#测试命名规范)
10. [文档命名规范](#文档命名规范)
11. [Git命名规范](#git命名规范)
12. [容器和镜像命名](#容器和镜像命名)
13. [监控和日志命名](#监控和日志命名)
14. [环境命名规范](#环境命名规范)
15. [版本命名规范](#版本命名规范)
16. [命名冲突处理](#命名冲突处理)
17. [Redis命名规范](#redis命名规范) *(新增)*
18. [消息队列命名规范](#消息队列命名规范) *(新增)*
19. [定时任务命名规范](#定时任务命名规范) *(新增)*
20. [事件命名规范](#事件命名规范) *(新增)*
21. [枚举命名规范](#枚举命名规范) *(新增)*
22. [接口和抽象类命名规范](#接口和抽象类命名规范) *(新增)*
23. [泛型参数命名规范](#泛型参数命名规范) *(新增)*
24. [Lambda和闭包命名规范](#lambda和闭包命名规范) *(新增)*

---

## 概述

### 基本原则

1. **一致性**: 同一概念在整个项目中使用相同的命名
2. **可读性**: 命名清晰表达意图，避免缩写（除非是通用缩写）
3. **可搜索性**: 命名便于搜索和定位
4. **跨语言一致性**: 不同技术栈遵循相同的命名逻辑
5. **避免冲突**: 使用命名空间/前缀避免冲突

### 通用规则

- **使用英文**: 所有命名使用英文，避免中文
- **避免保留字**: 不使用编程语言和框架的保留字
- **避免特殊字符**: 不使用空格、特殊符号（除下划线、短横线）
- **大小写规范**: 严格遵循各技术栈的大小写规范
- **长度限制**: 命名长度适中，一般不超过50个字符

---

## 代码命名规范

### Java (Agent 1: 核心银行服务)

#### 类命名
- **规则**: PascalCase（大驼峰）
- **示例**: `AccountService`, `AccountController`, `AccountRepository`
- **实体类**: `Account`, `Customer`, `Transaction`
- **DTO类**: `AccountDTO`, `CreateAccountRequest`, `AccountResponse`
- **异常类**: `AccountNotFoundException`, `InsufficientBalanceException`
- **配置类**: `DatabaseConfig`, `SecurityConfig`

#### 方法命名
- **规则**: camelCase（小驼峰）
- **示例**: `createAccount()`, `getAccountById()`, `updateAccountBalance()`
- **布尔方法**: `isActive()`, `hasPermission()`, `canTransfer()`
- **查询方法**: `findByAccountNumber()`, `findAllActiveAccounts()`
- **业务方法**: `transferFunds()`, `validateAccount()`, `calculateInterest()`

#### 变量命名
- **规则**: camelCase（小驼峰）
- **示例**: `accountNumber`, `customerId`, `transactionAmount`
- **常量**: `MAX_RETRY_COUNT`, `DEFAULT_INTEREST_RATE`, `API_BASE_URL`
- **集合**: `accounts`, `customerList`, `transactionMap`
- **布尔值**: `isActive`, `hasPermission`, `canTransfer`

#### 包命名
- **规则**: 全小写，点分隔
- **格式**: `com.digitalbank.{service}.{layer}`
- **示例**: 
  - `com.digitalbank.core.controller`
  - `com.digitalbank.core.service`
  - `com.digitalbank.core.repository`
  - `com.digitalbank.core.entity`
  - `com.digitalbank.core.dto`
  - `com.digitalbank.core.config`
  - `com.digitalbank.core.exception`

### Node.js (Agent 2: 支付服务)

#### 文件命名
- **规则**: kebab-case（小写短横线分隔）
- **示例**: `payment-service.js`, `payment-controller.js`, `payment-model.js`
- **路由文件**: `payment-routes.js`, `settlement-routes.js`
- **中间件**: `auth-middleware.js`, `validation-middleware.js`
- **工具文件**: `date-utils.js`, `currency-utils.js`

#### 类命名
- **规则**: PascalCase（大驼峰）
- **示例**: `PaymentService`, `PaymentController`, `PaymentModel`

#### 函数命名
- **规则**: camelCase（小驼峰）
- **示例**: `createPayment()`, `processPayment()`, `getPaymentById()`
- **异步函数**: `async createPayment()`, `async processSettlement()`
- **回调函数**: `handlePaymentCallback()`, `onPaymentSuccess()`

#### 变量命名
- **规则**: camelCase（小驼峰）
- **示例**: `paymentId`, `orderId`, `amount`, `status`
- **常量**: `MAX_AMOUNT`, `PAYMENT_TIMEOUT`, `DEFAULT_CURRENCY`
- **对象**: `paymentData`, `settlementInfo`, `gatewayConfig`

#### 模块导出
- **规则**: 使用命名导出或默认导出
- **示例**: 
  ```javascript
  // 命名导出
  export const PaymentService = class { ... };
  export function createPayment() { ... };
  
  // 默认导出
  export default PaymentController;
  ```

### Python (Agent 3: 风控服务)

#### 文件命名
- **规则**: snake_case（小写下划线分隔）
- **示例**: `risk_service.py`, `risk_controller.py`, `rule_engine.py`
- **模块文件**: `payment_risk.py`, `transaction_risk.py`

#### 类命名
- **规则**: PascalCase（大驼峰）
- **示例**: `RiskService`, `RuleEngine`, `RiskController`
- **异常类**: `RiskCheckFailed`, `RuleNotFound`, `InvalidRuleConfig`

#### 函数命名
- **规则**: snake_case（小写下划线分隔）
- **示例**: `check_risk()`, `evaluate_rule()`, `get_risk_score()`
- **私有函数**: `_validate_rule()`, `_calculate_score()`

#### 变量命名
- **规则**: snake_case（小写下划线分隔）
- **示例**: `risk_score`, `transaction_amount`, `customer_id`
- **常量**: `MAX_AMOUNT`, `RISK_THRESHOLD`, `DEFAULT_LIMIT`
- **私有变量**: `_internal_state`, `_cache_data`

#### 模块命名
- **规则**: snake_case（小写下划线分隔）
- **示例**: `risk_service`, `rule_engine`, `blacklist_manager`

### TypeScript/React (Agent 4: 前端)

#### 组件命名
- **规则**: PascalCase（大驼峰）
- **示例**: `AccountOverview.tsx`, `PaymentForm.tsx`, `TransactionList.tsx`
- **页面组件**: `LoginPage.tsx`, `DashboardPage.tsx`
- **基础组件**: `Button.tsx`, `Input.tsx`, `Card.tsx`

#### 文件命名
- **规则**: 与组件名一致，PascalCase
- **示例**: `AccountOverview.tsx`, `PaymentForm.tsx`
- **工具文件**: `api-client.ts`, `date-utils.ts`, `validation.ts`
- **类型文件**: `types.ts`, `api-types.ts`, `model-types.ts`

#### 函数命名
- **规则**: camelCase（小驼峰）
- **示例**: `fetchAccount()`, `handleSubmit()`, `validateForm()`
- **Hook函数**: `useAccount()`, `usePayment()`, `useAuth()`
- **事件处理**: `handleClick()`, `onChange()`, `onSubmit()`

#### 变量命名
- **规则**: camelCase（小驼峰）
- **示例**: `accountBalance`, `isLoading`, `errorMessage`
- **常量**: `API_BASE_URL`, `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT`
- **状态变量**: `accountState`, `paymentState`, `userState`

#### 类型/接口命名
- **规则**: PascalCase，接口以`I`开头（可选）
- **示例**: `Account`, `Payment`, `Transaction`
- **接口**: `IAccount`, `IPayment` 或 `Account`, `Payment`
- **类型别名**: `AccountId`, `PaymentStatus`, `TransactionType`

---

## 文件命名规范

### 通用规则

- **使用小写**: 文件名使用小写字母
- **分隔符**: 
  - 代码文件: 根据技术栈规范（Java用PascalCase，其他用kebab-case或snake_case）
  - 配置文件: kebab-case（短横线分隔）
  - 文档文件: kebab-case（短横线分隔）

### 配置文件

- **YAML文件**: `application.yml`, `docker-compose.yml`, `k8s-deployment.yml`
- **JSON文件**: `package.json`, `tsconfig.json`, `eslintrc.json`
- **Properties文件**: `application.properties`, `log4j.properties`
- **环境文件**: `.env`, `.env.development`, `.env.production`

### 文档文件

- **Markdown**: `README.md`, `api-documentation.md`, `deployment-guide.md`
- **API文档**: `openapi.yaml`, `swagger.yaml`
- **架构文档**: `architecture-overview.md`, `system-design.md`

### 脚本文件

- **Shell脚本**: `deploy.sh`, `build.sh`, `test.sh`
- **PowerShell脚本**: `deploy.ps1`, `build.ps1`
- **Python脚本**: `generate_data.py`, `migrate_db.py`

---

## 目录结构命名

### 服务目录

- **格式**: `{service-name}-service`
- **示例**: 
  - `core-bank-service/`
  - `payment-service/`
  - `risk-service/`
  - `frontend/`

### 通用目录结构

```
{service-name}/
├── src/                    # 源代码
│   ├── main/              # 主代码
│   │   ├── java/          # Java代码（Agent 1）
│   │   ├── resources/     # 资源文件
│   │   └── ...
│   ├── test/              # 测试代码
│   └── ...
├── docs/                   # 文档
│   ├── api/               # API文档
│   └── ...
├── scripts/                # 脚本
├── config/                 # 配置文件
└── tests/                  # 测试文件（Agent 6）
```

### 基础设施目录

- **格式**: `{component-name}/`
- **示例**:
  - `infrastructure/terraform/`
  - `infrastructure/k8s/`
  - `infrastructure/nginx/`
  - `infrastructure/kong/`

### 数据库目录

- **格式**: `database/{db-type}/`
- **示例**:
  - `database/postgresql/migrations/`
  - `database/mongodb/schemas/`
  - `database/redis/scripts/`

---

## API命名规范

### RESTful API

#### URL路径
- **规则**: kebab-case（小写短横线分隔），使用复数形式
- **格式**: `/api/v{version}/{resource}`
- **示例**:
  - `/api/v1/accounts`
  - `/api/v1/accounts/{account-id}`
  - `/api/v1/accounts/{account-id}/transactions`
  - `/api/v1/payments`
  - `/api/v1/risk-checks`

#### HTTP方法
- **GET**: 查询资源
- **POST**: 创建资源
- **PUT**: 完整更新资源
- **PATCH**: 部分更新资源
- **DELETE**: 删除资源

#### 路径参数
- **规则**: kebab-case
- **示例**: `{account-id}`, `{transaction-id}`, `{customer-id}`

#### 查询参数
- **规则**: camelCase
- **示例**: `?accountNumber=123&page=1&pageSize=20&sortBy=createdAt`

### 请求/响应字段

#### 请求字段
- **规则**: camelCase（JSON）
- **示例**:
```json
{
  "accountNumber": "1234567890",
  "customerId": "cust-001",
  "initialBalance": 1000.00
}
```

#### 响应字段
- **规则**: camelCase（JSON）
- **示例**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "accountId": "acc-001",
    "accountNumber": "1234567890",
    "balance": 1000.00
  },
  "timestamp": "2026-01-26T10:00:00Z"
}
```

---

## 数据库命名规范

### PostgreSQL (Agent 1, Agent 9)

#### 表命名
- **规则**: snake_case（小写下划线分隔），使用复数形式
- **示例**: 
  - `bank_accounts`
  - `customers`
  - `transactions`
  - `transaction_details`

#### 列命名
- **规则**: snake_case（小写下划线分隔）
- **示例**:
  - `account_number`
  - `customer_id`
  - `transaction_amount`
  - `created_at`
  - `updated_at`

#### 主键
- **规则**: `id` 或 `{table}_id`
- **示例**: `id`, `account_id`, `customer_id`

#### 外键
- **规则**: `{referenced_table}_id`
- **示例**: `customer_id`, `account_id`, `transaction_id`

#### 索引命名
- **规则**: `idx_{table}_{columns}`
- **示例**: 
  - `idx_accounts_account_number`
  - `idx_transactions_customer_id`
  - `idx_transactions_created_at`

#### 约束命名
- **唯一约束**: `uk_{table}_{column}`
- **外键约束**: `fk_{table}_{referenced_table}`
- **检查约束**: `ck_{table}_{condition}`

### MongoDB (Agent 2, Agent 9)

#### 集合命名
- **规则**: snake_case（小写下划线分隔），使用复数形式
- **示例**: 
  - `payments`
  - `settlements`
  - `payment_callback_logs`

#### 文档字段命名
- **规则**: camelCase（小驼峰）
- **示例**:
  - `paymentId`
  - `orderId`
  - `amount`
  - `status`
  - `createdAt`

#### 索引命名
- **规则**: `idx_{field1}_{field2}`
- **示例**: `idx_paymentId`, `idx_orderId_status`

### Elasticsearch (Agent 3)

#### 索引命名
- **规则**: snake_case（小写下划线分隔）
- **示例**: 
  - `risk_events`
  - `transaction_logs`
  - `blacklist_entries`

#### 字段命名
- **规则**: snake_case（小写下划线分隔）
- **示例**: 
  - `risk_score`
  - `transaction_amount`
  - `event_timestamp`

---

## 服务命名规范

### 服务标识

- **格式**: `{service-name}-service`
- **示例**:
  - `core-bank-service`
  - `payment-service`
  - `risk-service`

### Kubernetes服务

- **格式**: `{service-name}-service`
- **命名空间**: `{environment}` (dev, qa, uat, prod)
- **示例**:
  - `core-bank-service.dev`
  - `payment-service.qa`

### 服务发现

- **格式**: `{service-name}-service.{namespace}.svc.cluster.local`
- **示例**: `core-bank-service.dev.svc.cluster.local`

---

## 配置命名规范

### 环境变量

- **规则**: UPPER_SNAKE_CASE（全大写下划线分隔）
- **格式**: `{SERVICE}_{CATEGORY}_{NAME}`
- **示例**:
  - `CORE_BANK_DB_HOST`
  - `CORE_BANK_DB_PORT`
  - `PAYMENT_SERVICE_API_URL`
  - `RISK_SERVICE_ELASTICSEARCH_HOST`

### 配置键

- **规则**: kebab-case（YAML/Properties）或 camelCase（JSON）
- **YAML示例**:
```yaml
core-bank:
  database:
    host: localhost
    port: 5432
  api:
    base-url: http://api.example.com
```

- **JSON示例**:
```json
{
  "coreBank": {
    "database": {
      "host": "localhost",
      "port": 5432
    }
  }
}
```

---

## 测试命名规范

### 测试类/文件命名

- **Java**: `{ClassName}Test.java`
- **Node.js**: `{module-name}.test.js` 或 `{module-name}.spec.js`
- **Python**: `test_{module_name}.py`
- **TypeScript**: `{Component}.test.tsx` 或 `{Component}.spec.tsx`

### 测试方法命名

- **规则**: 描述性命名，说明测试场景
- **格式**: `test_{scenario}_{expected_result}` 或 `should_{expected_result}_when_{condition}`
- **示例**:
  - `test_createAccount_success()`
  - `test_createAccount_failsWhenAccountNumberExists()`
  - `should_returnAccount_when_accountExists()`
  - `should_throwException_when_insufficientBalance()`

### 测试数据命名

- **规则**: 描述性命名
- **示例**: `validAccountData`, `invalidAccountNumber`, `sampleTransaction`

---

## 文档命名规范

### 架构文档

- **格式**: `{document-type}-{topic}.md`
- **示例**:
  - `architecture-overview.md`
  - `system-design.md`
  - `deployment-guide.md`

### API文档

- **格式**: `openapi.yaml` 或 `api-{service-name}.yaml`
- **示例**: 
  - `openapi.yaml`
  - `api-core-bank.yaml`
  - `api-payment.yaml`

### ADR文档

- **格式**: `ADR-{number}-{title}.md`
- **示例**: 
  - `ADR-001-技术栈选择.md`
  - `ADR-002-微服务拆分策略.md`

---

## Git命名规范

### 分支命名

- **格式**: `{type}/{description}`
- **类型**:
  - `feature/`: 新功能
  - `bugfix/`: 修复
  - `hotfix/`: 紧急修复
  - `release/`: 发布
  - `agent-{n}/`: Agent专用分支
- **示例**:
  - `feature/account-management`
  - `bugfix/payment-timeout`
  - `agent-1/core-bank-service`
  - `release/v1.0.0`

### 提交消息

- **格式**: `{type}: {description}`
- **类型**:
  - `feat`: 新功能
  - `fix`: 修复
  - `docs`: 文档
  - `style`: 格式
  - `refactor`: 重构
  - `test`: 测试
  - `chore`: 构建/工具
- **示例**:
  - `feat: add account creation API`
  - `fix: resolve payment timeout issue`
  - `docs: update API documentation`

### 标签命名

- **格式**: `v{major}.{minor}.{patch}`
- **示例**: `v1.0.0`, `v1.1.0`, `v2.0.0`

---

## 容器和镜像命名

### Docker镜像

- **格式**: `{registry}/{service-name}:{tag}`
- **示例**:
  - `digitalbank/core-bank-service:v1.0.0`
  - `digitalbank/payment-service:latest`
  - `digitalbank/risk-service:dev`

### 容器命名

- **格式**: `{service-name}-{instance}`
- **示例**:
  - `core-bank-service-1`
  - `payment-service-1`

### Kubernetes资源

- **Deployment**: `{service-name}-deployment`
- **Service**: `{service-name}-service`
- **ConfigMap**: `{service-name}-config`
- **Secret**: `{service-name}-secret`

---

## 监控和日志命名

### 指标命名

- **规则**: snake_case，使用点分隔层级
- **格式**: `{service}.{category}.{metric}`
- **示例**:
  - `core_bank.api.request.count`
  - `core_bank.api.response.time`
  - `payment.service.transaction.count`
  - `risk.service.check.duration`

### 日志命名

- **规则**: 结构化日志，使用标准字段
- **格式**: JSON格式
- **字段**:
  - `timestamp`: ISO 8601格式
  - `level`: INFO, WARN, ERROR, DEBUG
  - `service`: 服务名称
  - `message`: 日志消息
  - `context`: 上下文信息
- **示例**:
```json
{
  "timestamp": "2026-01-26T10:00:00Z",
  "level": "INFO",
  "service": "core-bank-service",
  "message": "Account created successfully",
  "context": {
    "accountId": "acc-001",
    "accountNumber": "1234567890"
  }
}
```

---

## 环境命名规范

### 环境标识

- **开发环境**: `dev`
- **测试环境**: `qa`
- **用户验收测试**: `uat`
- **生产环境**: `prod`
- **演示环境**: `demo`

### 环境变量前缀

- **格式**: `{ENV}_{SERVICE}_{CONFIG}`
- **示例**:
  - `DEV_CORE_BANK_DB_HOST`
  - `PROD_PAYMENT_API_URL`

---

## 版本命名规范

### 语义化版本

- **格式**: `{major}.{minor}.{patch}`
- **规则**:
  - `major`: 不兼容的API修改
  - `minor`: 向下兼容的功能性新增
  - `patch`: 向下兼容的问题修正
- **示例**: `1.0.0`, `1.1.0`, `2.0.0`

### API版本

- **格式**: `v{major}`
- **示例**: `v1`, `v2`

---

## 命名冲突处理

### 跨服务命名冲突

- **使用服务前缀**: 在可能冲突的命名前添加服务前缀
- **示例**:
  - `core_bank_account_id` vs `payment_account_id`
  - `risk_transaction_id` vs `payment_transaction_id`

### 全局唯一标识符

- **格式**: `{service-prefix}-{type}-{id}`
- **示例**:
  - `cb-acc-001` (core-bank account)
  - `pay-txn-001` (payment transaction)
  - `risk-evt-001` (risk event)

---

## Agent特定命名规则

### Agent 1 (核心银行服务)

- **服务前缀**: `core-bank` 或 `cb`
- **包前缀**: `com.digitalbank.core`
- **表前缀**: `bank_` (可选)

### Agent 2 (支付服务)

- **服务前缀**: `payment` 或 `pay`
- **集合前缀**: `payment_` (可选)

### Agent 3 (风控服务)

- **服务前缀**: `risk`
- **索引前缀**: `risk_`

### Agent 4 (前端)

- **组件前缀**: 无强制前缀，使用功能模块组织
- **API客户端**: `{service}Api`，如 `coreBankApi`, `paymentApi`

### Agent 5 (基础设施)

- **资源前缀**: `infra-` 或 `{component-name}-`
- **示例**: `infra-kong`, `infra-consul`, `nginx-config`

### Agent 6 (测试)

- **测试套件**: `{service}-test-suite`
- **测试数据**: `{service}-test-data`

### Agent 7 (安全)

- **扫描报告**: `{service}-security-scan-{date}.json`
- **漏洞标识**: `{service}-{vuln-id}`

### Agent 8 (运维)

- **CI/CD流水线**: `{service}-pipeline`
- **部署脚本**: `deploy-{service}-{env}.sh`

### Agent 9 (数据)

- **迁移脚本**: `V{version}__{description}.sql`
- **数据模型**: `{service}-data-model`

---

## Redis命名规范

### Key命名规范

#### 基本规则
- **格式**: `{service}:{module}:{entity}:{identifier}`
- **分隔符**: 使用冒号 `:` 分隔层级
- **大小写**: 全小写，使用短横线分隔单词
- **长度限制**: Key长度不超过128字符

#### 命名示例

| 用途 | Key格式 | 示例 |
|-----|--------|------|
| 账户详情 | `cb:account:detail:{id}` | `cb:account:detail:acc-001` |
| 账户余额 | `cb:account:balance:{id}` | `cb:account:balance:acc-001` |
| 用户会话 | `{service}:session:{user-id}` | `cb:session:user-001` |
| 验证码 | `{service}:captcha:{type}:{key}` | `cb:captcha:sms:13800138000` |
| 分布式锁 | `{service}:lock:{resource}` | `pay:lock:order-001` |
| 限流计数 | `{service}:ratelimit:{api}:{user}` | `cb:ratelimit:transfer:user-001` |
| 配置缓存 | `{service}:config:{name}` | `risk:config:rules` |
| 黑名单 | `{service}:blacklist:{type}:{id}` | `risk:blacklist:customer:cust-001` |
| 临时数据 | `{service}:temp:{type}:{id}` | `pay:temp:callback:cb-001` |
| 统计数据 | `{service}:stats:{metric}:{date}` | `cb:stats:transaction:2026-01-26` |

#### Hash字段命名
- **规则**: camelCase（小驼峰）
- **示例**: `accountNumber`, `balance`, `status`, `updatedAt`

#### Set/List元素
- **规则**: 使用业务ID或唯一标识符
- **示例**: `acc-001`, `txn-002`, `user-003`

---

## 消息队列命名规范

### Topic命名规范

#### 基本规则
- **格式**: `{service}.{domain}.{event}.{version}`
- **分隔符**: 使用点 `.` 分隔层级
- **大小写**: 全小写，使用短横线分隔单词

#### 命名示例

| 事件类型 | Topic名称 |
|---------|----------|
| 账户创建 | `core-bank.account.created.v1` |
| 账户更新 | `core-bank.account.updated.v1` |
| 交易完成 | `core-bank.transaction.completed.v1` |
| 支付成功 | `payment.order.paid.v1` |
| 支付失败 | `payment.order.failed.v1` |
| 风控告警 | `risk.alert.triggered.v1` |
| 规则变更 | `risk.rule.changed.v1` |

### Queue命名规范

#### 基本规则
- **格式**: `{service}-{consumer}-{purpose}-queue`
- **示例**:
  - `payment-notification-sms-queue`
  - `risk-audit-log-queue`
  - `core-bank-report-generate-queue`

### 死信队列命名
- **格式**: `{original-queue}-dlq`
- **示例**: `payment-notification-sms-queue-dlq`

### Consumer Group命名
- **格式**: `{service}-{purpose}-group`
- **示例**: `payment-sms-sender-group`, `risk-alert-handler-group`

---

## 定时任务命名规范

### 任务名称规范

#### 基本规则
- **格式**: `{service}:{task-type}:{description}`
- **分隔符**: 使用冒号 `:` 分隔
- **大小写**: 全小写，使用短横线分隔单词

#### 命名示例

| 任务类型 | 任务名称 |
|---------|---------|
| 日终结算 | `core-bank:batch:daily-settlement` |
| 利息计算 | `core-bank:batch:interest-calculation` |
| 账单生成 | `payment:batch:bill-generation` |
| 数据清理 | `core-bank:maintenance:data-cleanup` |
| 报表统计 | `core-bank:report:daily-statistics` |
| 健康检查 | `infra:monitor:health-check` |
| 日志归档 | `infra:maintenance:log-archive` |

### Cron表达式注释
```yaml
# 格式: 任务名称 - 执行频率描述
# core-bank:batch:daily-settlement - 每日凌晨2点执行
schedule: "0 2 * * *"

# core-bank:batch:interest-calculation - 每月1日凌晨3点执行
schedule: "0 3 1 * *"
```

---

## 事件命名规范

### 领域事件命名

#### 基本规则
- **格式**: `{Entity}{Action}Event`
- **时态**: 使用过去时态表示已发生的事件
- **大小写**: PascalCase

#### 命名示例

| 事件 | 事件类名 | 事件类型字符串 |
|-----|---------|---------------|
| 账户创建 | `AccountCreatedEvent` | `account.created` |
| 账户激活 | `AccountActivatedEvent` | `account.activated` |
| 账户冻结 | `AccountFrozenEvent` | `account.frozen` |
| 交易发起 | `TransactionInitiatedEvent` | `transaction.initiated` |
| 交易完成 | `TransactionCompletedEvent` | `transaction.completed` |
| 交易失败 | `TransactionFailedEvent` | `transaction.failed` |
| 支付成功 | `PaymentSucceededEvent` | `payment.succeeded` |
| 风控拦截 | `RiskInterceptedEvent` | `risk.intercepted` |

#### 事件属性命名
```java
// Java
public class AccountCreatedEvent {
    private String eventId;      // 事件ID
    private String eventType;    // 事件类型
    private Instant occurredAt;  // 发生时间
    private String accountId;    // 账户ID
    private String customerId;   // 客户ID
    private AccountType type;    // 账户类型
}
```

---

## 枚举命名规范

### Java枚举

#### 基本规则
- **类名**: PascalCase，名词
- **枚举值**: UPPER_SNAKE_CASE

#### 命名示例
```java
// 账户状态
public enum AccountStatus {
    ACTIVE,
    INACTIVE,
    FROZEN,
    CLOSED
}

// 交易类型
public enum TransactionType {
    DEPOSIT,
    WITHDRAWAL,
    TRANSFER_IN,
    TRANSFER_OUT,
    INTEREST
}

// 支付渠道
public enum PaymentChannel {
    WECHAT_PAY,
    ALIPAY,
    UNION_PAY,
    BANK_TRANSFER
}
```

### TypeScript枚举

#### 基本规则
- **枚举名**: PascalCase
- **枚举值**: PascalCase 或 UPPER_SNAKE_CASE

#### 命名示例
```typescript
// 账户状态
enum AccountStatus {
    Active = 'ACTIVE',
    Inactive = 'INACTIVE',
    Frozen = 'FROZEN',
    Closed = 'CLOSED'
}

// 或使用const对象
const PaymentStatus = {
    Pending: 'PENDING',
    Processing: 'PROCESSING',
    Completed: 'COMPLETED',
    Failed: 'FAILED'
} as const;
```

### Python枚举

#### 基本规则
- **类名**: PascalCase
- **枚举值**: UPPER_SNAKE_CASE

#### 命名示例
```python
from enum import Enum

class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class TransactionStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
```

---

## 接口和抽象类命名规范

### Java接口

#### 基本规则
- **接口名**: PascalCase，描述能力或行为
- **前缀**: 不强制使用 `I` 前缀（推荐不使用）
- **后缀**: 根据用途使用合适后缀

#### 命名示例
```java
// 能力接口（形容词或动词+able）
public interface Transferable { }
public interface Cacheable { }
public interface Auditable { }

// 服务接口
public interface AccountService { }
public interface PaymentGateway { }

// Repository接口
public interface AccountRepository { }
public interface TransactionRepository { }

// 策略接口
public interface RiskStrategy { }
public interface PricingStrategy { }

// 工厂接口
public interface AccountFactory { }
```

### Java抽象类

#### 基本规则
- **类名**: PascalCase
- **前缀**: 使用 `Abstract` 前缀
- **或后缀**: 使用 `Base` 后缀

#### 命名示例
```java
// 使用Abstract前缀
public abstract class AbstractAccountService { }
public abstract class AbstractPaymentHandler { }

// 使用Base后缀
public abstract class BaseEntity { }
public abstract class BaseController { }
```

### TypeScript接口

#### 基本规则
- **接口名**: PascalCase
- **前缀**: 可使用 `I` 前缀（可选，团队统一即可）

#### 命名示例
```typescript
// 不带前缀（推荐）
interface Account {
    id: string;
    accountNumber: string;
    balance: number;
}

// 带I前缀（可选）
interface IAccountService {
    getAccount(id: string): Promise<Account>;
    createAccount(data: CreateAccountRequest): Promise<Account>;
}

// 类型别名
type AccountId = string;
type TransactionStatus = 'pending' | 'completed' | 'failed';
```

---

## 泛型参数命名规范

### 通用规则
- **单字母**: 使用大写单字母表示
- **描述性**: 复杂场景使用描述性名称

### 标准泛型参数

| 参数 | 含义 | 使用场景 |
|-----|-----|---------|
| `T` | Type | 通用类型 |
| `E` | Element | 集合元素类型 |
| `K` | Key | 键类型 |
| `V` | Value | 值类型 |
| `R` | Return | 返回类型 |
| `N` | Number | 数字类型 |
| `S`, `U` | 第二、三个类型 | 多泛型参数 |

### 命名示例

#### Java
```java
// 单类型参数
public class Repository<T> { }
public interface Service<T, ID> { }

// 多类型参数
public class Pair<K, V> { }
public interface Function<T, R> { }

// 有界泛型
public class AccountRepository<T extends BaseEntity> { }
```

#### TypeScript
```typescript
// 单类型参数
interface Repository<T> {
    findById(id: string): Promise<T | null>;
    save(entity: T): Promise<T>;
}

// 多类型参数
interface ApiResponse<T, E = Error> {
    data?: T;
    error?: E;
}

// 描述性泛型名
interface Cache<Key, Value> {
    get(key: Key): Value | undefined;
    set(key: Key, value: Value): void;
}
```

---

## Lambda和闭包命名规范

### Java Lambda

#### 参数命名规则
- **单参数**: 使用有意义的短名称
- **多参数**: 使用描述性名称

#### 命名示例
```java
// 单参数 - 使用简短有意义的名称
accounts.stream()
    .filter(account -> account.isActive())
    .map(account -> account.getBalance())
    .collect(Collectors.toList());

// 多参数
transactions.stream()
    .reduce((first, second) -> first.getAmount() > second.getAmount() ? first : second);

// 方法引用优先
accounts.stream()
    .filter(Account::isActive)
    .map(Account::getBalance);
```

### JavaScript/TypeScript

#### 命名规则
- **箭头函数**: 参数使用camelCase
- **回调函数**: 使用描述性名称

#### 命名示例
```typescript
// 简单转换
const activeAccounts = accounts.filter(account => account.isActive);

// 事件处理
const handleClick = (event: MouseEvent) => { };
const onAccountCreated = (account: Account) => { };

// 异步回调
const fetchAccount = async (accountId: string): Promise<Account> => { };
```

### Python

#### 命名规则
- **lambda**: 参数使用snake_case
- **闭包函数**: 使用描述性snake_case名称

#### 命名示例
```python
# lambda表达式
active_accounts = list(filter(lambda account: account.is_active, accounts))
sorted_by_balance = sorted(accounts, key=lambda acc: acc.balance)

# 闭包函数
def create_validator(min_amount: float):
    def validate_amount(amount: float) -> bool:
        return amount >= min_amount
    return validate_amount
```

---

## 命名检查清单

在创建新资源时，检查以下清单：

- [ ] 命名是否符合对应技术栈的规范？
- [ ] 命名是否清晰表达意图？
- [ ] 命名是否避免缩写（除非是通用缩写）？
- [ ] 命名是否避免与现有资源冲突？
- [ ] 命名是否遵循跨服务一致性？
- [ ] 命名是否便于搜索和定位？

---

## 相关文档

- [技术标准规范 v1.0](technical-standards-v1.0.md)
- [ADR-001: 技术栈选择](../adr/ADR-001-技术栈选择.md)
- [ADR-002: 微服务拆分策略](../adr/ADR-002-微服务拆分策略.md)

---

## 更新记录

- **v1.0.0** (2026-01-26): 初始版本发布
- **v1.1.0** (2026-01-26): 补充Redis命名规范、消息队列命名规范、定时任务命名规范、事件命名规范、枚举命名规范、接口和抽象类命名规范、泛型参数命名规范、Lambda和闭包命名规范

---

**文档维护**: Agent 0 (架构管控中枢)  
**审核**: 所有Agent  
**生效日期**: 2026-01-26  
**强制执行**: 所有Agent必须严格遵循本规范
