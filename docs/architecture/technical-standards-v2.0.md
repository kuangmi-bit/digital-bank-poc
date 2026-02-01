# 技术标准规范 v2.0

**版本**: v2.0.0
**发布日期**: 2026-01-31
**维护者**: Agent 0 (架构管控中枢)
**基于**: v1.0.0 + Day 1-7 实践经验

---

## 版本变更说明

### v2.0 新增/更新内容

| 章节 | 变更类型 | 说明 |
|------|----------|------|
| 服务间通信 | **新增** | 基于 ADR-004/005/006 的实践总结 |
| 接口抽象 | **新增** | RiskClient/PaymentClient 接口化模式 |
| 幂等设计 | **新增** | refId 幂等实现规范 |
| 测试环境 | **新增** | 外部依赖配置规范（MongoDB/ES） |
| 性能基线 | **更新** | 基于 ADR-007 的性能指标 |
| 错误码体系 | **更新** | 完整错误码定义（CBB/PYB/RKB/RKS） |

---

## 📋 目录

1. [代码规范](#代码规范)
2. [命名规范](#命名规范)
3. [API设计规范](#api设计规范)
4. [服务间通信规范](#服务间通信规范) *(v2.0 新增)*
5. [数据库设计规范](#数据库设计规范)
6. [测试规范](#测试规范)
7. [安全规范](#安全规范)
8. [部署规范](#部署规范)
9. [日志规范](#日志规范)
10. [错误处理规范](#错误处理规范)
11. [性能规范](#性能规范)

---

## 代码规范

### Java (核心银行服务)

#### 接口抽象原则 *(v2.0 新增)*

外部服务客户端必须抽象为接口，便于测试 Mock：

```java
// 接口定义
public interface RiskClient {
    void checkTransfer(Long customerId, Long accountId, BigDecimal amount, Long recipientAccountId);
}

// 实现类
@Component
public class HttpRiskClient implements RiskClient {
    // HTTP 调用实现
}
```

#### 幂等设计 *(v2.0 新增)*

关键写操作必须支持幂等：

```java
// 使用 refId 实现幂等
public DebitResponse debit(DebitRequest req) {
    Optional<Transaction> existing = transactionRepository.findByRefId(req.getRefId());
    if (existing.isPresent()) {
        return toResponse(existing.get()); // 直接返回，不重复扣款
    }
    // 执行扣款...
}
```

#### 代码质量要求

- **代码覆盖率**: ≥70%（Day 7 目标）
- **接口抽象**: 外部依赖必须抽象为 interface
- **事务边界**: 最小化事务范围，外部调用在事务外

### Node.js (支付服务)

#### 测试环境配置 *(v2.0 新增)*

支持外部数据库避免下载超时：

```javascript
// 测试 MongoDB 配置优先级
// 1. TEST_MONGODB_URI（推荐）
// 2. 本地 MongoDB (127.0.0.1:27017)
// 3. mongodb-memory-server（需显式启用）
const explicit = process.env.TEST_MONGODB_URI;
if (explicit) {
    await mongoose.connect(explicit);
}
```

#### 重试与超时

```javascript
// 指数退避重试
const retryOptions = {
    maxRetries: 3,
    initialDelay: 500,
    maxDelay: 5000,
    backoffType: 'exponential'
};
```

### Python (风控服务)

#### 异步编程

```python
# 全链路异步
async def check_risk(self, request: RiskCheckRequest) -> RiskCheckResponse:
    es = await get_es_client()
    agg = await get_risk_context_aggregates(es, request.customer_id)
    # ...
```

#### 规则热更新

```python
# 线程安全的规则重载
def _maybe_reload_rules(self) -> None:
    with self._rules_lock:
        if mtime_ns != self._rules_mtime_ns:
            self._load_rules()
```

---

## 服务间通信规范 *(v2.0 新增)*

### 通信方式选择

| 场景 | 方式 | 超时 | 重试 |
|------|------|------|------|
| 业务调用（扣款/风控） | 同步 REST | 10s | 3次 |
| 网关回调 | HTTP POST | 30s | 无 |
| 后续任务 | 异步队列 | - | 3次 |

### 请求头规范

```
X-Caller-Service: core-bank-service
X-Request-ID: uuid-v4
Content-Type: application/json
```

### 降级策略

- 外部服务 URL 未配置时跳过调用（开发模式）
- ES 不可用时读操作返回降级值，写操作仅记日志

---

## 错误处理规范

### 错误码体系 *(v2.0 更新)*

#### 核心银行 (CBB/CBV/CBS)

| 错误码 | HTTP | 描述 |
|--------|------|------|
| CBB001 | 404 | 账户不存在 |
| CBB002 | 400 | 余额不足 |
| CBB003 | 400 | 账户已冻结 |
| CBB004 | 400 | 金额无效 |
| CBB005 | 400 | 同账户转账 |
| CBB006 | 404 | 客户不存在 |
| CBB009 | 409 | 身份证号已存在 |
| CBV001 | 400 | 格式错误 |
| CBV002 | 400 | 金额必须大于0 |
| CBV003 | 400 | 必填字段缺失 |
| CBS001 | 500 | 账号生成失败 |
| CBS002 | 504 | 风控服务异常 |
| CBS003 | 502 | 支付服务异常 |

#### 支付服务 (PYB/PYV/PYS)

| 错误码 | HTTP | 描述 |
|--------|------|------|
| PYB001 | 400 | 支付已超时 |
| PYB002 | 500 | 支付处理失败（可重试） |
| PYB008 | 400 | 余额不足 |
| PYV001 | 400 | 参数验证失败 |

#### 风控服务 (RKB/RKS)

| 错误码 | HTTP | 描述 |
|--------|------|------|
| RKB001 | 403 | 风控拦截（通用） |
| RKB002 | 403 | 黑名单命中 |
| RKB003 | 403 | 超过限额 |
| RKB004 | 403 | 交易频率过高 |
| RKB005 | 403 | 风险评分过高 |
| RKS001 | 500 | 服务内部错误 |
| RKS002 | 503 | ES 不可用 |

---

## 测试规范 *(v2.0 更新)*

### 外部依赖配置

| 服务 | 环境变量 | 说明 |
|------|----------|------|
| Payment | `TEST_MONGODB_URI` | 测试 MongoDB 连接串 |
| Risk | `RISK_ES_HOST` | Elasticsearch 主机 |
| Core Bank | `SERVICES_RISK_URL` | 风控服务 URL（空则跳过） |

### 测试覆盖率目标

| 服务 | Day 7 目标 | 说明 |
|------|------------|------|
| Core Bank | ≥70% | 含单元+集成测试 |
| Payment | ≥60% | API + 服务层 |
| Risk | ≥55% | 规则引擎全覆盖 |
| Frontend | ≥50% | 关键组件覆盖 |

---

## 性能规范 *(v2.0 更新)*

### 性能指标（基于 ADR-007）

| 指标 | 目标值 | 告警阈值 |
|------|--------|----------|
| API P95 响应时间 | < 500ms | > 500ms WARNING |
| API P99 响应时间 | < 1000ms | > 1000ms CRITICAL |
| 数据库查询 P95 | < 100ms | > 200ms WARNING |
| 系统吞吐量 | > 1000 TPS | < 500 TPS CRITICAL |
| 错误率 | < 0.1% | > 1% CRITICAL |

### 优化实践

1. **数据库**: 高频查询字段建索引，行级锁顺序加锁
2. **缓存**: 规则引擎本地缓存，JWT 客户端存储
3. **异步**: 非关键路径走消息队列
4. **降级**: 外部服务不可用时优雅降级

---

## 部署规范

### 环境变量

```bash
# 核心银行
SERVICES_RISK_URL=http://risk-service:8000
SERVICES_PAYMENT_URL=http://payment-service:3000

# 支付服务
CORE_BANK_SERVICE_URL=http://core-bank:8080
REDIS_URI=redis://redis:6379
MONGODB_URI=mongodb://mongo:27017/payment_db

# 风控服务
RISK_ES_HOST=elasticsearch
RISK_ES_PORT=9200
```

### 健康检查

| 服务 | 端点 | 说明 |
|------|------|------|
| Core Bank | `/actuator/health` | Spring Actuator |
| Payment | `/health` | Express 中间件 |
| Risk | `/health` | FastAPI |
| Frontend | `/` | 静态资源 |

---

## 日志规范

### 结构化日志格式

```json
{
  "timestamp": "2026-01-31T12:00:00Z",
  "level": "INFO",
  "service": "core-bank-service",
  "traceId": "abc-123",
  "message": "转账成功",
  "context": {
    "fromAccountId": 1,
    "toAccountId": 2,
    "amount": 100.00
  }
}
```

### 敏感信息脱敏

- 卡号: `6200****1234`
- 身份证: `3101****1234`
- 手机号: `138****5678`

---

**生效日期**: 2026-01-31
**审查周期**: 每个迭代阶段结束时修订
**相关文档**: ADR-001 ~ ADR-007、naming-conventions.md、security-baseline.md
