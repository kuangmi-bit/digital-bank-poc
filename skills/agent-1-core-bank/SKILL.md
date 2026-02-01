---
name: agent-1-core-bank
version: 1.0.0
description: 核心银行服务引擎Agent技能 - 负责实现数字银行的核心业务功能，包括账户管理、交易处理和客户信息管理。使用Java 17 + Spring Boot 3.x + PostgreSQL 15技术栈。
author: Digital Bank POC Team
license: MIT
keywords:
  - java
  - spring-boot
  - postgresql
  - banking
  - account-management
  - transaction-processing
  - rest-api
  - microservices
---

# Agent 1: 核心银行服务引擎 💰

## 概述

Agent 1负责实现数字银行的核心业务功能，包括账户管理、交易处理和客户信息管理。使用Java 17 + Spring Boot 3.x技术栈，实现RESTful API服务。

## 何时使用

当需要：
- 实现银行核心业务功能（账户、交易、客户）
- 创建Spring Boot微服务
- 设计RESTful API
- 实现数据库操作和业务逻辑
- 编写单元测试和集成测试

## 技术栈

- **语言**: Java 17
- **框架**: Spring Boot 3.x
- **数据库**: PostgreSQL 15
- **ORM**: Spring Data JPA
- **测试**: JUnit 5, Mockito, TestContainers
- **API文档**: OpenAPI 3.0 / Swagger

## 核心功能（MVP）

### 1. 账户管理
- 开户接口: `POST /api/v1/accounts`
- 查询账户: `GET /api/v1/accounts/{id}`
- 余额查询: `GET /api/v1/accounts/{id}/balance`
- 账户状态管理

### 2. 交易处理
- 行内转账: `POST /api/v1/transactions/transfer`
- 交易查询: `GET /api/v1/transactions`
- 交易历史: `GET /api/v1/transactions/history`

### 3. 客户信息
- 客户注册: `POST /api/v1/customers`
- 客户查询: `GET /api/v1/customers/{id}`
- 客户更新: `PUT /api/v1/customers/{id}`

## 自动化能力

- **代码生成**: 75%自动化
  - CRUD API自动生成（基于OpenAPI规范）
  - Repository/Service/Controller三层自动生成
  - 单元测试自动编写（Mockito）
  - 集成测试自动编写（TestContainers）

## 交付标准

- **API数量**: 15-20个
- **代码行数**: 约8000行（自动生成）
- **测试覆盖率**: ≥70%
- **响应时间**: P95 < 2s

## 项目结构

```
core-bank-service/
├── src/main/java/
│   ├── entity/          # 实体类（Account, Customer, Transaction）
│   ├── repository/      # Repository层
│   ├── service/         # Service层业务逻辑
│   ├── controller/      # REST API控制器
│   └── config/          # 配置类
├── src/test/java/       # 测试代码
├── src/main/resources/
│   ├── application.yml  # 应用配置
│   └── db/migration/    # Flyway迁移脚本
└── docs/
    └── openapi.yaml     # API文档
```

## 技术标准规范要求

**重要**: 必须严格遵循技术标准规范和命名规范。

### 必须遵循的规范文档

1. **技术标准规范 v1.0**: `docs/architecture/technical-standards-v1.0.md`
2. **命名规范 v1.0**: `docs/architecture/naming-conventions.md`

## 代码规范

- 遵循Spring Boot最佳实践
- **严格遵循技术标准规范中的Java代码规范**
- **严格遵循命名规范**
- 使用RESTful API设计原则（符合API设计规范）
- 异常处理统一使用@ControllerAdvice
- 日志使用SLF4J + Logback
- 所有公共方法必须有JavaDoc注释

### 命名规范要点

- **类名**: PascalCase (如 `AccountService`, `AccountController`)
- **方法名**: camelCase (如 `createAccount()`, `getAccountById()`)
- **变量名**: camelCase (如 `accountNumber`, `customerId`)
- **常量**: UPPER_SNAKE_CASE (如 `MAX_RETRY_COUNT`)
- **包名**: 全小写 (如 `com.digitalbank.core.service`)
- **API路径**: kebab-case, 复数 (如 `/api/v1/accounts`)
- **数据库表**: snake_case, 复数 (如 `bank_accounts`)
- **数据库列**: snake_case (如 `account_number`)

## 协作关系

- **与Agent 2**: 集成支付服务API调用
- **与Agent 3**: 集成风控服务API调用（转账前风控检查）
- **与Agent 5**: 通过API Gateway暴露服务
- **与Agent 6**: 提供API测试接口
- **与Agent 9**: 使用PostgreSQL数据模型

## 关键里程碑

- **Day 2**: 项目骨架和API设计完成
- **Day 3**: 账户管理API完成
- **Day 4**: 交易和客户API完成
- **Day 5**: 服务集成完成
- **Day 7**: 核心功能完成，测试覆盖率≥60%

## 示例代码结构

### Entity示例
```java
@Entity
@Table(name = "bank_accounts")  // 遵循命名规范: snake_case, 复数
public class Account {  // 遵循命名规范: PascalCase
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // 遵循命名规范: 主键使用id
    
    @Column(name = "account_number", nullable = false, unique = true)  // 遵循命名规范: snake_case
    private String accountNumber;  // 遵循命名规范: camelCase
    
    @Column(name = "balance", precision = 19, scale = 2)
    private BigDecimal balance;
    
    @Column(name = "customer_id")
    private Long customerId;  // 遵循命名规范: 外键使用{table}_id格式
    
    // getters and setters
}
```

### Service示例
```java
@Service
public class AccountService {
    @Autowired
    private AccountRepository accountRepository;
    
    public Account createAccount(Account account) {
        // 业务逻辑
        return accountRepository.save(account);
    }
}
```

### Controller示例
```java
@RestController
@RequestMapping("/api/v1/accounts")  // 遵循命名规范: kebab-case, 复数形式
public class AccountController {  // 遵循命名规范: PascalCase
    @Autowired
    private AccountService accountService;  // 遵循命名规范: camelCase
    
    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
        @RequestBody CreateAccountRequest request  // 遵循命名规范: DTO使用Request/Response后缀
    ) {
        Account created = accountService.createAccount(request);  // 遵循命名规范: camelCase方法名
        return ResponseEntity.ok(new AccountResponse(created));
    }
    
    @GetMapping("/{account-id}")  // 遵循命名规范: 路径参数kebab-case
    public ResponseEntity<AccountResponse> getAccount(
        @PathVariable("account-id") String accountId  // 遵循命名规范: camelCase变量名
    ) {
        // 实现
    }
}
```

## 错误码定义

### Core Bank服务错误码

| 错误码 | 描述 | HTTP状态码 | 处理建议 |
|-------|------|-----------|---------|
| `CBB001` | 账户不存在 | 404 | 检查账户ID是否正确 |
| `CBB002` | 余额不足 | 400 | 提示用户余额不足 |
| `CBB003` | 账户已冻结 | 400 | 提示联系客服 |
| `CBB004` | 转账金额无效 | 400 | 检查金额格式 |
| `CBB005` | 同账户转账 | 400 | 转入转出账户不能相同 |
| `CBB006` | 客户不存在 | 404 | 检查客户ID |
| `CBV001` | 账号格式无效 | 400 | 检查账号格式 |
| `CBV002` | 金额格式无效 | 400 | 金额必须为正数 |
| `CBV003` | 必填字段缺失 | 400 | 检查请求参数 |
| `CBS001` | 数据库连接失败 | 500 | 重试或联系运维 |
| `CBS002` | 服务超时 | 504 | 稍后重试 |
| `CBA001` | Token过期 | 401 | 重新登录 |
| `CBA002` | 权限不足 | 403 | 检查用户权限 |

### 错误响应示例

```java
@Data
@Builder
public class ErrorResponse {
    private String code;      // 错误码，如 "CBB001"
    private String message;   // 错误消息
    private String timestamp; // ISO 8601时间戳
    private String path;      // 请求路径
    private List<FieldError> errors; // 字段级错误（可选）
}
```

---

## 分布式事务处理

### 事务处理策略

对于跨服务的转账操作，采用**Saga模式**处理分布式事务：

```
转账事务流程：
1. 风控检查 (Agent 3) → 成功则继续
2. 源账户扣款 (Agent 1) → 成功则继续
3. 目标账户入账 (Agent 1) → 成功则提交
4. 失败回滚：入账失败 → 回滚扣款
```

### Saga实现示例

```java
@Service
public class TransferSagaService {

    @Transactional
    public TransferResult executeTransfer(TransferRequest request) {
        // Step 1: 风控检查
        RiskCheckResult riskResult = riskServiceClient.checkRisk(request);
        if (!riskResult.isApproved()) {
            return TransferResult.rejected(riskResult.getReason());
        }

        // Step 2: 扣款
        try {
            accountService.debit(request.getFromAccountId(), request.getAmount());
        } catch (Exception e) {
            return TransferResult.failed("扣款失败: " + e.getMessage());
        }

        // Step 3: 入账
        try {
            accountService.credit(request.getToAccountId(), request.getAmount());
        } catch (Exception e) {
            // 补偿：回滚扣款
            accountService.credit(request.getFromAccountId(), request.getAmount());
            return TransferResult.failed("入账失败，已回滚: " + e.getMessage());
        }

        return TransferResult.success();
    }
}
```

---

## 缓存策略

### Redis缓存配置

```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(5))  // 默认TTL 5分钟
            .serializeValuesWith(SerializationPair.fromSerializer(
                new GenericJackson2JsonRedisSerializer()));

        return RedisCacheManager.builder(factory)
            .cacheDefaults(config)
            .withCacheConfiguration("accounts",
                config.entryTtl(Duration.ofMinutes(10)))  // 账户缓存10分钟
            .withCacheConfiguration("customers",
                config.entryTtl(Duration.ofMinutes(30))) // 客户缓存30分钟
            .build();
    }
}
```

### 缓存Key规范

| 缓存类型 | Key格式 | TTL | 示例 |
|---------|--------|-----|------|
| 账户详情 | `cb:account:detail:{id}` | 10分钟 | `cb:account:detail:123` |
| 账户余额 | `cb:account:balance:{id}` | 5分钟 | `cb:account:balance:123` |
| 客户信息 | `cb:customer:{id}` | 30分钟 | `cb:customer:456` |
| 交易记录 | `cb:txn:list:{accountId}` | 5分钟 | `cb:txn:list:123` |

### 缓存注解使用

```java
@Service
public class AccountService {

    @Cacheable(value = "accounts", key = "'detail:' + #id")
    public Account getAccountById(Long id) {
        return accountRepository.findById(id)
            .orElseThrow(() -> new BusinessException("CBB001", "账户不存在"));
    }

    @CacheEvict(value = "accounts", key = "'detail:' + #account.id")
    public Account updateAccount(Account account) {
        return accountRepository.save(account);
    }

    @CacheEvict(value = "accounts", allEntries = true)
    public void clearAllAccountCache() {
        // 清除所有账户缓存
    }
}
```

---

## 日志规范实现

### 日志配置 (logback-spring.xml)

```xml
<configuration>
    <property name="LOG_PATTERN"
        value='{"timestamp":"%d{yyyy-MM-dd HH:mm:ss.SSS}","level":"%level","service":"core-bank-service","traceId":"%X{traceId}","spanId":"%X{spanId}","class":"%logger{36}","message":"%msg"}%n'/>

    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
        </encoder>
    </appender>

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
    </root>
</configuration>
```

### 日志使用示例

```java
@Slf4j
@Service
public class AccountService {

    public Account createAccount(CreateAccountRequest request) {
        // 记录业务操作日志
        log.info("创建账户开始, customerId={}, accountType={}",
            request.getCustomerId(), request.getAccountType());

        try {
            Account account = accountRepository.save(buildAccount(request));

            log.info("账户创建成功, accountId={}, accountNumber={}",
                account.getId(), account.getAccountNumber());

            return account;
        } catch (Exception e) {
            log.error("账户创建失败, customerId={}, error={}",
                request.getCustomerId(), e.getMessage(), e);
            throw new BusinessException("CBS001", "账户创建失败");
        }
    }
}
```

---

## 健康检查端点

### Actuator配置

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
  health:
    db:
      enabled: true
    redis:
      enabled: true
```

### 自定义健康检查

```java
@Component
public class DatabaseHealthIndicator implements HealthIndicator {

    @Autowired
    private DataSource dataSource;

    @Override
    public Health health() {
        try (Connection conn = dataSource.getConnection()) {
            if (conn.isValid(1)) {
                return Health.up()
                    .withDetail("database", "PostgreSQL")
                    .withDetail("status", "connected")
                    .build();
            }
        } catch (SQLException e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
        return Health.down().build();
    }
}
```

### 健康检查端点

| 端点 | 路径 | 用途 |
|-----|------|------|
| 健康检查 | `/actuator/health` | K8s liveness/readiness探针 |
| 就绪检查 | `/actuator/health/readiness` | 服务就绪状态 |
| 存活检查 | `/actuator/health/liveness` | 服务存活状态 |
| 指标 | `/actuator/prometheus` | Prometheus指标采集 |

---

## 服务间调用

### Feign客户端配置

```java
@FeignClient(
    name = "risk-service",
    url = "${services.risk.url}",
    fallback = RiskServiceFallback.class
)
public interface RiskServiceClient {

    @PostMapping("/api/v1/risk/check")
    RiskCheckResponse checkRisk(@RequestBody RiskCheckRequest request);
}

@Component
public class RiskServiceFallback implements RiskServiceClient {

    @Override
    public RiskCheckResponse checkRisk(RiskCheckRequest request) {
        // 熔断降级：默认拒绝高风险交易
        return RiskCheckResponse.builder()
            .approved(false)
            .reason("风控服务不可用，暂停交易")
            .build();
    }
}
```

### 超时和重试配置

```yaml
# application.yml
feign:
  client:
    config:
      default:
        connectTimeout: 3000      # 连接超时3秒
        readTimeout: 10000        # 读取超时10秒
        loggerLevel: basic
      risk-service:
        connectTimeout: 2000      # 风控服务连接超时2秒
        readTimeout: 5000         # 风控服务读取超时5秒

resilience4j:
  circuitbreaker:
    instances:
      riskService:
        slidingWindowSize: 10
        failureRateThreshold: 50   # 50%失败率触发熔断
        waitDurationInOpenState: 30s
  retry:
    instances:
      riskService:
        maxAttempts: 3
        waitDuration: 1s
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
