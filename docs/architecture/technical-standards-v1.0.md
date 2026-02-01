# 技术标准规范 v1.0

**版本**: v1.0.0  
**发布日期**: 2026-01-26  
**维护者**: Agent 0 (架构管控中枢)

---

## 📋 目录

1. [代码规范](#代码规范)
2. [命名规范](#命名规范)
3. [API设计规范](#api设计规范)
4. [数据库设计规范](#数据库设计规范)
5. [测试规范](#测试规范)
6. [安全规范](#安全规范)
7. [部署规范](#部署规范)
8. [文档规范](#文档规范)
9. [日志规范](#日志规范) *(新增)*
10. [错误处理规范](#错误处理规范) *(新增)*
11. [缓存规范](#缓存规范) *(新增)*
12. [消息队列规范](#消息队列规范) *(新增)*
13. [性能规范](#性能规范) *(新增)*
14. [代码审查规范](#代码审查规范) *(新增)*
15. [国际化规范](#国际化规范) *(新增)*
16. [备份和恢复规范](#备份和恢复规范) *(新增)*

---

## 代码规范

### Java (Agent 1: 核心银行服务)

#### 命名规范
- **类名**: 大驼峰命名 (PascalCase)，如 `AccountService`
- **方法名**: 小驼峰命名 (camelCase)，如 `createAccount`
- **常量**: 全大写下划线分隔，如 `MAX_RETRY_COUNT`
- **包名**: 全小写，如 `com.digitalbank.core.service`

#### 代码结构
```
core-bank-service/
├── src/main/java/com/digitalbank/core/
│   ├── controller/     # REST控制器
│   ├── service/       # 业务逻辑层
│   ├── repository/    # 数据访问层
│   ├── entity/        # 实体类
│   ├── dto/           # 数据传输对象
│   └── config/        # 配置类
├── src/test/java/     # 测试代码
└── src/main/resources/
    ├── application.yml
    └── db/migration/  # Flyway迁移脚本
```

#### 代码质量要求
- **代码覆盖率**: ≥70%
- **代码审查**: 所有代码必须通过SonarQube检查
- **代码风格**: 遵循Google Java Style Guide
- **注释**: 所有公共方法必须有JavaDoc注释

### Node.js (Agent 2: 支付服务)

#### 命名规范
- **文件名**: 小写短横线分隔，如 `payment-service.js`
- **变量名**: 小驼峰命名，如 `paymentId`
- **常量**: 全大写下划线分隔，如 `MAX_AMOUNT`
- **类名**: 大驼峰命名，如 `PaymentService`

#### 代码结构
```
payment-service/
├── src/
│   ├── controllers/   # 控制器
│   ├── services/      # 业务逻辑
│   ├── models/        # 数据模型
│   ├── routes/        # 路由定义
│   ├── middleware/  # 中间件
│   └── utils/         # 工具函数
├── tests/             # 测试代码
└── package.json
```

#### 代码质量要求
- **代码覆盖率**: ≥60%
- **ESLint**: 使用Airbnb JavaScript Style Guide
- **TypeScript**: 推荐使用TypeScript（可选）
- **异步处理**: 使用async/await，避免回调地狱

### Python (Agent 3: 风控服务)

#### 命名规范
- **文件名**: 小写下划线分隔，如 `risk_service.py`
- **类名**: 大驼峰命名，如 `RiskService`
- **函数名**: 小写下划线分隔，如 `check_risk`
- **常量**: 全大写下划线分隔，如 `MAX_AMOUNT`

#### 代码结构
```
risk-service/
├── src/
│   ├── api/           # API路由
│   ├── services/      # 业务逻辑
│   ├── models/        # 数据模型
│   ├── rules/         # 风控规则
│   └── config/        # 配置文件
├── tests/             # 测试代码
└── requirements.txt
```

#### 代码质量要求
- **代码覆盖率**: ≥60%
- **Pylint**: 代码质量评分≥8.0
- **类型提示**: 使用类型提示提高代码可读性
- **文档字符串**: 所有公共函数必须有文档字符串

### TypeScript/React (Agent 4: 前端)

#### 命名规范
- **组件名**: 大驼峰命名，如 `AccountOverview`
- **文件名**: 与组件名一致，如 `AccountOverview.tsx`
- **变量名**: 小驼峰命名，如 `accountBalance`
- **常量**: 全大写下划线分隔，如 `API_BASE_URL`

#### 代码结构
```
frontend/
├── src/
│   ├── components/    # 组件
│   │   ├── ui/        # 基础UI组件
│   │   └── features/   # 功能组件
│   ├── pages/         # 页面组件
│   ├── hooks/         # 自定义Hooks
│   ├── services/      # API服务
│   ├── utils/         # 工具函数
│   └── types/         # TypeScript类型定义
├── tests/             # 测试代码
└── package.json
```

#### 代码质量要求
- **代码覆盖率**: ≥60%
- **ESLint**: 使用React推荐配置
- **TypeScript**: 严格模式，禁止使用any
- **组件规范**: 使用函数组件和Hooks

---

## 命名规范

**重要**: 所有Agent必须严格遵循命名规范，这是跨Agent协作的基础。

### 核心原则

1. **一致性**: 同一概念在整个项目中使用相同的命名
2. **可读性**: 命名清晰表达意图，避免缩写（除非是通用缩写）
3. **可搜索性**: 命名便于搜索和定位
4. **跨语言一致性**: 不同技术栈遵循相同的命名逻辑
5. **避免冲突**: 使用命名空间/前缀避免冲突

### 详细规范

完整的命名规范请参考: [命名规范 v1.0](naming-conventions.md)

**关键命名规则摘要**:

- **服务命名**: `{service-name}-service` (如 `core-bank-service`, `payment-service`)
- **API路径**: `/api/v1/{resource}` (kebab-case, 复数形式)
- **数据库表**: snake_case, 复数形式 (如 `bank_accounts`, `transactions`)
- **代码文件**: 遵循各技术栈规范 (Java: PascalCase, Node.js: kebab-case, Python: snake_case)
- **环境变量**: UPPER_SNAKE_CASE (如 `CORE_BANK_DB_HOST`)
- **Git分支**: `{type}/{description}` (如 `feature/account-management`, `agent-1/core-bank-service`)

---

## API设计规范

### RESTful API设计

#### URL规范
- **基础路径**: `/api/v1/{resource}`
- **资源名**: 使用复数形式，如 `/api/v1/accounts`
- **操作**: 使用HTTP方法表示操作
  - `GET`: 查询
  - `POST`: 创建
  - `PUT`: 完整更新
  - `PATCH`: 部分更新
  - `DELETE`: 删除

#### HTTP状态码
- `200 OK`: 成功
- `201 Created`: 创建成功
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未授权
- `403 Forbidden`: 禁止访问
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器错误

#### 请求/响应格式
- **Content-Type**: `application/json`
- **字符编码**: UTF-8
- **日期格式**: ISO 8601，如 `2026-01-26T10:00:00Z`

#### 响应结构
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    // 响应数据
  },
  "timestamp": "2026-01-26T10:00:00Z"
}
```

#### 错误响应
```json
{
  "code": 400,
  "message": "Bad Request",
  "errors": [
    {
      "field": "accountNumber",
      "message": "Account number is required"
    }
  ],
  "timestamp": "2026-01-26T10:00:00Z"
}
```

### OpenAPI规范

- **版本**: OpenAPI 3.0
- **文档格式**: YAML
- **文件位置**: `{service}/docs/openapi.yaml`
- **必需字段**:
  - `info`: API基本信息
  - `servers`: 服务器地址
  - `paths`: API路径定义
  - `components`: 组件定义（schemas, securitySchemes等）

---

## 数据库设计规范

### PostgreSQL (Agent 1, Agent 9)

#### 命名规范
- **表名**: 小写下划线分隔，如 `bank_accounts`
- **列名**: 小写下划线分隔，如 `account_number`
- **主键**: 使用 `id` 作为主键名
- **外键**: `{table}_id`，如 `customer_id`

#### 数据类型
- **ID**: `BIGSERIAL` 或 `UUID`
- **金额**: `DECIMAL(19, 2)`
- **日期时间**: `TIMESTAMP WITH TIME ZONE`
- **文本**: `VARCHAR(n)` 或 `TEXT`
- **布尔值**: `BOOLEAN`

#### 索引规范
- **主键**: 自动创建索引
- **外键**: 自动创建索引
- **查询字段**: 经常用于查询的字段创建索引
- **唯一约束**: 使用 `UNIQUE` 约束

#### 迁移脚本
- **工具**: Flyway
- **命名**: `V{version}__{description}.sql`
- **版本**: 递增版本号

### MongoDB (Agent 2, Agent 9)

#### 命名规范
- **集合名**: 小写下划线分隔，如 `payments`
- **字段名**: 小驼峰命名，如 `paymentId`
- **文档ID**: 使用 `_id` 字段

#### Schema设计
- **嵌入文档**: 一对少关系使用嵌入
- **引用文档**: 一对多或多对多关系使用引用
- **索引**: 为查询字段创建索引

### Elasticsearch (Agent 3)

#### 索引规范
- **索引名**: 小写下划线分隔，如 `risk_events`
- **类型**: 使用 `_doc` 类型
- **映射**: 明确定义字段映射

---

## 测试规范

### 单元测试
- **覆盖率要求**: ≥60%（核心业务逻辑≥70%）
- **测试框架**:
  - Java: JUnit 5 + Mockito
  - Node.js: Jest
  - Python: pytest
  - React: Jest + React Testing Library

### 集成测试
- **测试框架**: TestContainers (Java), Supertest (Node.js)
- **测试范围**: API接口、数据库操作、服务间调用

### E2E测试
- **测试框架**: Cypress
- **测试场景**: 核心业务流程
- **测试数据**: 使用Faker生成测试数据

### 性能测试
- **测试工具**: JMeter
- **性能指标**:
  - TPS: ≥100
  - 响应时间P95: <2s
  - 错误率: <0.1%

---

## 安全规范

### 认证和授权
- **认证方式**: JWT Token
- **Token过期时间**: 1小时
- **刷新Token**: 7天
- **密码策略**: 至少8位，包含大小写字母、数字和特殊字符

### 数据安全
- **敏感数据加密**: 使用AES-256加密
- **密钥管理**: 使用HashiCorp Vault
- **传输加密**: 使用HTTPS

### 代码安全
- **依赖扫描**: 使用Snyk/Dependabot扫描依赖漏洞
- **代码扫描**: 使用SonarQube进行代码安全扫描
- **API安全**: 使用OWASP ZAP进行API安全扫描

### 安全标准
- **遵循**: OWASP Top 10
- **扫描频率**: 
  - 代码扫描: 每次提交
  - API扫描: 每12小时
  - 依赖扫描: 每日

---

## 部署规范

### 容器化
- **镜像基础**: 使用官方基础镜像
- **镜像大小**: 尽量减小镜像大小
- **多阶段构建**: 使用多阶段构建优化镜像

### Kubernetes
- **命名空间**: 按环境划分（dev, qa, uat, prod）
- **资源限制**: 设置CPU和内存限制
- **健康检查**: 配置liveness和readiness探针
- **滚动更新**: 使用滚动更新策略

### CI/CD
- **CI工具**: GitLab CI
- **构建流程**: 
  1. 代码检查（Lint, 单元测试）
  2. 构建镜像
  3. 安全扫描
  4. 部署到环境
- **部署策略**: 蓝绿部署或滚动更新

---

## 文档规范

### API文档
- **格式**: OpenAPI 3.0 (YAML)
- **位置**: `{service}/docs/openapi.yaml`
- **必需内容**: 
  - API路径和操作
  - 请求/响应Schema
  - 错误码定义
  - 示例请求/响应

### 代码文档
- **Java**: JavaDoc
- **Python**: 文档字符串（Google风格）
- **TypeScript**: JSDoc

### 架构文档
- **格式**: Markdown
- **位置**: `docs/architecture/`
- **内容**: 
  - 架构图
  - 设计决策（ADR）
  - 技术标准规范

---

## 版本管理

### 版本号规范
- **格式**: `主版本号.次版本号.修订号`，如 `1.0.0`
- **主版本号**: 不兼容的API修改
- **次版本号**: 向下兼容的功能性新增
- **修订号**: 向下兼容的问题修正

### 文档版本
- **技术标准规范**: v1.0, v2.0（重大更新时）
- **API版本**: v1, v2（API不兼容时）

---

## 日志规范

### 日志级别

| 级别 | 使用场景 | 示例 |
|-----|---------|------|
| `ERROR` | 系统错误，需要立即关注 | 数据库连接失败、外部API调用异常 |
| `WARN` | 潜在问题，但系统可继续运行 | 重试成功、配置使用默认值 |
| `INFO` | 关键业务操作 | 账户创建、交易完成、用户登录 |
| `DEBUG` | 调试信息 | 方法入参、中间计算结果 |
| `TRACE` | 详细跟踪信息 | 循环迭代、详细执行路径 |

### 日志格式

#### 结构化日志（必须）
```json
{
  "timestamp": "2026-01-26T10:00:00.123Z",
  "level": "INFO",
  "service": "core-bank-service",
  "traceId": "abc123def456",
  "spanId": "789xyz",
  "message": "Account created successfully",
  "context": {
    "accountId": "acc-001",
    "customerId": "cust-001",
    "operation": "CREATE_ACCOUNT"
  },
  "duration": 150
}
```

#### 必需字段
- `timestamp`: ISO 8601格式，精确到毫秒
- `level`: 日志级别
- `service`: 服务名称
- `traceId`: 分布式追踪ID
- `message`: 日志消息

#### 上下文字段
- `accountId`, `customerId`, `transactionId`: 业务标识
- `operation`: 操作类型
- `duration`: 操作耗时（毫秒）
- `userId`: 操作用户

### 日志最佳实践

1. **不要记录敏感信息**: 密码、Token、完整卡号、身份证号等
2. **脱敏处理**: 卡号显示前6后4位 `622848****1234`
3. **避免大量日志**: 循环内不记录DEBUG日志
4. **异常堆栈**: ERROR级别必须记录完整堆栈
5. **性能日志**: 耗时超过阈值的操作记录WARN日志

---

## 错误处理规范

### 错误码规范

#### 错误码格式
- **格式**: `{SERVICE}{TYPE}{CODE}`
- **SERVICE**: 服务标识 (2位字母)
  - `CB`: Core Bank (核心银行)
  - `PY`: Payment (支付)
  - `RK`: Risk (风控)
  - `FE`: Frontend (前端)
- **TYPE**: 错误类型 (1位字母)
  - `B`: 业务错误 (Business)
  - `S`: 系统错误 (System)
  - `V`: 验证错误 (Validation)
  - `A`: 认证/授权错误 (Auth)
- **CODE**: 具体错误码 (3位数字)

#### 错误码示例
| 错误码 | 描述 | HTTP状态码 |
|-------|------|-----------|
| `CBB001` | 账户不存在 | 404 |
| `CBB002` | 余额不足 | 400 |
| `CBB003` | 账户已冻结 | 400 |
| `CBV001` | 账号格式无效 | 400 |
| `CBS001` | 数据库连接失败 | 500 |
| `PYB001` | 支付超时 | 408 |
| `PYB002` | 渠道不可用 | 503 |
| `RKB001` | 风控拦截 | 403 |
| `CBA001` | Token过期 | 401 |
| `CBA002` | 权限不足 | 403 |

### 异常处理

#### Java (Agent 1)
```java
// 自定义业务异常
public class BusinessException extends RuntimeException {
    private final String errorCode;
    private final String errorMessage;

    public BusinessException(String errorCode, String errorMessage) {
        super(errorMessage);
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }
}

// 全局异常处理
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        // 返回标准错误响应
    }
}
```

#### Node.js (Agent 2)
```javascript
// 自定义错误类
class PaymentError extends Error {
    constructor(errorCode, message) {
        super(message);
        this.errorCode = errorCode;
        this.name = 'PaymentError';
    }
}

// 错误中间件
const errorHandler = (err, req, res, next) => {
    const response = {
        code: err.errorCode || 'PYS001',
        message: err.message,
        timestamp: new Date().toISOString()
    };
    res.status(err.httpStatus || 500).json(response);
};
```

#### Python (Agent 3)
```python
# 自定义异常
class RiskCheckError(Exception):
    def __init__(self, error_code: str, message: str):
        self.error_code = error_code
        self.message = message
        super().__init__(message)

# FastAPI异常处理
@app.exception_handler(RiskCheckError)
async def risk_exception_handler(request: Request, exc: RiskCheckError):
    return JSONResponse(
        status_code=400,
        content={"code": exc.error_code, "message": exc.message}
    )
```

---

## 缓存规范

### Redis使用规范

#### Key命名规范
- **格式**: `{service}:{module}:{entity}:{id}`
- **分隔符**: 使用冒号 `:` 分隔层级
- **示例**:
  - `cb:account:detail:acc-001` - 账户详情
  - `cb:customer:session:cust-001` - 客户会话
  - `pay:order:status:ord-001` - 订单状态
  - `risk:blacklist:customer:cust-001` - 黑名单

#### TTL策略
| 数据类型 | TTL | 说明 |
|---------|-----|------|
| 会话数据 | 30分钟 | 用户会话、Token |
| 热点数据 | 5分钟 | 账户余额、汇率 |
| 配置数据 | 1小时 | 系统配置、规则 |
| 临时数据 | 10分钟 | 验证码、临时Token |
| 统计数据 | 24小时 | 日统计、报表缓存 |

#### 缓存策略
1. **Cache-Aside**:
   - 读取: 先查缓存，未命中则查数据库并写入缓存
   - 写入: 先更新数据库，再删除缓存
2. **缓存穿透防护**: 空值缓存，TTL设置为1分钟
3. **缓存雪崩防护**: TTL添加随机偏移量
4. **缓存击穿防护**: 热点Key使用分布式锁

#### 序列化规范
- **格式**: JSON序列化
- **编码**: UTF-8
- **压缩**: 超过1KB的数据使用GZIP压缩

---

## 消息队列规范

### 消息队列使用场景
- 异步处理: 交易通知、短信发送
- 解耦服务: 服务间事件传递
- 流量削峰: 高并发场景缓冲
- 日志收集: 结构化日志传输

### Topic/Queue命名规范
- **格式**: `{service}.{event-type}.{version}`
- **示例**:
  - `core-bank.account-created.v1`
  - `payment.transaction-completed.v1`
  - `risk.alert-triggered.v1`

### 消息格式规范
```json
{
  "messageId": "msg-uuid-001",
  "messageType": "account.created",
  "version": "1.0",
  "timestamp": "2026-01-26T10:00:00Z",
  "source": "core-bank-service",
  "traceId": "trace-uuid-001",
  "payload": {
    "accountId": "acc-001",
    "customerId": "cust-001",
    "accountType": "SAVINGS"
  },
  "metadata": {
    "retryCount": 0,
    "priority": "normal"
  }
}
```

### 消息处理规范
1. **幂等性**: 消费者必须保证幂等处理
2. **顺序性**: 同一业务ID的消息保证顺序（使用分区键）
3. **重试策略**: 最多3次重试，间隔指数退避（1s, 5s, 30s）
4. **死信队列**: 重试失败的消息进入死信队列
5. **消息确认**: 处理成功后手动确认

---

## 性能规范

### 连接池配置

#### 数据库连接池
| 参数 | 开发环境 | 生产环境 |
|-----|---------|---------|
| 最小连接数 | 2 | 10 |
| 最大连接数 | 10 | 50 |
| 连接超时 | 5s | 3s |
| 空闲超时 | 10分钟 | 30分钟 |
| 最大生命周期 | 30分钟 | 2小时 |

#### HTTP连接池
| 参数 | 值 |
|-----|-----|
| 最大连接数 | 100 |
| 每路由最大连接 | 20 |
| 连接超时 | 3s |
| 读取超时 | 30s |
| 空闲超时 | 60s |

### 超时配置
| 场景 | 超时时间 |
|-----|---------|
| API网关 | 60s |
| 服务间调用 | 10s |
| 数据库查询 | 5s |
| Redis操作 | 1s |
| 外部API调用 | 30s |

### 性能指标要求
| 指标 | 目标 |
|-----|------|
| API响应时间P50 | <200ms |
| API响应时间P95 | <1s |
| API响应时间P99 | <2s |
| 数据库查询P95 | <100ms |
| 缓存命中率 | >90% |
| 错误率 | <0.1% |
| TPS | ≥100 |

### 限流规范
- **全局限流**: API网关层，1000 req/s
- **服务限流**: 单服务，500 req/s
- **用户限流**: 单用户，10 req/s
- **限流响应**: HTTP 429 Too Many Requests

---

## 代码审查规范

### 审查流程
1. **自动检查**: 提交前自动运行Lint、单元测试
2. **机器审查**: SonarQube代码质量扫描
3. **人工审查**: 至少1位团队成员审查
4. **合并条件**: 所有检查通过 + 人工审批

### 审查关注点
- [ ] 代码是否符合命名规范
- [ ] 是否有潜在的安全漏洞
- [ ] 异常处理是否完善
- [ ] 日志记录是否规范
- [ ] 是否有性能问题
- [ ] 单元测试覆盖率是否达标
- [ ] API设计是否符合RESTful规范
- [ ] 是否有敏感信息泄露风险

### 审查时效
- **普通PR**: 24小时内完成审查
- **紧急修复**: 4小时内完成审查
- **安全漏洞**: 2小时内完成审查

---

## 国际化规范

### 多语言支持

#### 支持语言
- 简体中文 (zh-CN) - 默认
- 英文 (en-US)

#### 文本资源管理
- **格式**: JSON或Properties文件
- **位置**: `{service}/src/main/resources/i18n/`
- **命名**: `messages_{locale}.json`

#### 示例
```json
// messages_zh-CN.json
{
  "account.created": "账户创建成功",
  "account.not_found": "账户不存在",
  "balance.insufficient": "余额不足"
}

// messages_en-US.json
{
  "account.created": "Account created successfully",
  "account.not_found": "Account not found",
  "balance.insufficient": "Insufficient balance"
}
```

#### API国际化
- **请求头**: `Accept-Language: zh-CN, en-US`
- **响应消息**: 根据请求头返回对应语言
- **错误消息**: 支持多语言错误提示

### 货币和数字格式
- **货币格式**: 使用ISO 4217货币代码 (CNY, USD)
- **数字格式**: 根据语言环境格式化
- **日期格式**: ISO 8601 (API), 本地化格式 (前端显示)

---

## 备份和恢复规范

### 备份策略

#### 数据库备份
| 类型 | 频率 | 保留时间 |
|-----|------|---------|
| 全量备份 | 每日 | 30天 |
| 增量备份 | 每小时 | 7天 |
| 事务日志 | 实时 | 7天 |

#### 备份存储
- **本地存储**: 快速恢复用，保留7天
- **远程存储**: 灾备用，保留30天
- **异地备份**: 容灾用，保留90天

### 恢复测试
- **频率**: 每月进行一次恢复测试
- **RTO目标**: 恢复时间 <4小时
- **RPO目标**: 数据丢失 <1小时

### 配置备份
- 所有配置文件版本化管理 (Git)
- Kubernetes ConfigMap/Secret定期导出
- 基础设施配置 (Terraform) 版本化管理

---

## 附录

### 相关文档
- [命名规范 v1.0](naming-conventions.md) - **所有Agent必须严格遵循**
- [云资源与云服务清单](cloud-resources-and-services-checklist.md) - 上云采购与资源规划
- ADR-001: 技术栈选择
- ADR-002: 微服务拆分策略
- 项目计划: `digital_bank_poc_plan.md`
- 详细工作计划: `digital_bank_poc_workplan.md`

### 更新记录
- **v1.0.0** (2026-01-26): 初始版本发布
- **v1.1.0** (2026-01-26): 补充日志规范、错误处理规范、缓存规范、消息队列规范、性能规范、代码审查规范、国际化规范、备份和恢复规范

---

**文档维护**: Agent 0 (架构管控中枢)  
**审核**: 所有Agent  
**生效日期**: 2026-01-26
