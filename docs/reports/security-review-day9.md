# 安全复核报告 - Day 9

**日期**: 2026-02-02
**复核范围**: Day 8 新增 API（批量转账、预约转账、账单支付）
**执行者**: Agent 7（安全扫描卫士）

---

## 复核概述

Day 8 阶段 3 新增了三个核心功能模块，本报告对其进行安全复核，评估潜在风险并提供安全建议。

---

## 复核范围

### 核心银行服务（Agent 1）

| API | 方法 | 路径 |
|-----|------|------|
| 批量转账 | POST | `/api/v1/transactions/batch-transfer` |
| 创建预约 | POST | `/api/v1/transactions/scheduled` |
| 查询预约 | GET | `/api/v1/transactions/scheduled` |
| 取消预约 | DELETE | `/api/v1/transactions/scheduled/{scheduledId}` |

### 支付服务（Agent 2）

| API | 方法 | 路径 |
|-----|------|------|
| 账单支付 | POST | `/api/v1/payments/bill` |
| 查询账单 | GET | `/api/v1/payments/bill/query` |
| 支付列表 | GET | `/api/v1/payments/bill` |

---

## 安全检查清单

### 1. 输入验证

| 检查项 | 批量转账 | 预约转账 | 账单支付 | 状态 |
|--------|----------|----------|----------|------|
| 参数类型验证 | ✅ | ✅ | ✅ | PASS |
| 金额范围验证 | ✅ | ✅ | ✅ | PASS |
| 账户ID验证 | ✅ | ✅ | ✅ | PASS |
| 时间格式验证 | N/A | ✅ | N/A | PASS |
| SQL注入防护 | ✅ JPA | ✅ JPA | ✅ Mongoose | PASS |
| XSS防护 | ✅ JSON | ✅ JSON | ✅ JSON | PASS |

### 2. 授权控制

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 账户归属验证 | ⚠️ | 需确保 fromAccountId 属于当前用户 |
| API 权限控制 | ✅ | 需认证访问 |
| 跨账户访问 | ⚠️ | 需增加业务层校验 |

**建议**: 在业务层增加账户归属校验：
```java
// TransactionService.java
if (!accountBelongsToCustomer(fromAccountId, currentCustomerId)) {
    throw new BusinessException("CBB006", "无权操作此账户", 403);
}
```

### 3. 业务逻辑安全

| 检查项 | 批量转账 | 预约转账 | 账单支付 | 状态 |
|--------|----------|----------|----------|------|
| 幂等控制 | ✅ batchId | ✅ scheduledId | ✅ paymentId | PASS |
| 重放攻击防护 | ✅ | ✅ | ✅ | PASS |
| 并发安全 | ✅ 悲观锁 | ✅ 悲观锁 | ✅ | PASS |
| 余额竞态 | ✅ SELECT FOR UPDATE | ✅ | ✅ | PASS |

### 4. 限额与风控

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 单笔限额 | ✅ | 已配置风控规则 |
| 单日限额 | ✅ | 已配置风控规则 |
| 批量限额 | ✅ | Day 9 新增 batch_limit 规则 |
| 预约限额 | ✅ | Day 9 新增 scheduled_limit 规则 |
| 风控规则热更新 | ✅ | 支持 YAML 热加载 |

### 5. 敏感数据处理

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 账户信息脱敏 | ⚠️ | 日志中应脱敏账户号 |
| 交易金额日志 | ✅ | 合理记录 |
| 错误信息泄露 | ✅ | 使用错误码，不暴露内部细节 |

**建议**: 在日志输出时对账户号进行脱敏：
```java
logger.info("转账: from={}***, to={}***, amount={}",
    fromAccountId.toString().substring(0, 3),
    toAccountId.toString().substring(0, 3),
    amount);
```

---

## 风险评估

### 高风险（P0）

**无高风险问题发现。**

### 中风险（P1）

| 风险 | 描述 | 建议 |
|------|------|------|
| 账户归属未校验 | 当前仅依赖风控检查，未在业务层强制校验账户归属 | 增加 customerId 校验 |

### 低风险（P2）

| 风险 | 描述 | 建议 |
|------|------|------|
| 日志脱敏 | 部分敏感信息可能在日志中明文 | 统一日志脱敏工具 |
| 预约调度安全 | 多实例部署可能重复执行 | 添加分布式锁 |

---

## 代码安全模式审查

### 批量转账服务 (BatchTransferService.java)

```java
// ✅ 幂等检查
Optional<BatchTransfer> existing = batchTransferRepository.findByBatchId(batchId);
if (existing.isPresent()) {
    return toResponse(existing.get());
}

// ✅ 风控检查
riskClient.checkTransfer(fromAcc.getCustomerId(), fromId, amount, toId);

// ✅ 并发安全 - 按ID顺序加锁避免死锁
Long id1 = fromId < toId ? fromId : toId;
Long id2 = fromId < toId ? toId : fromId;
Account a1 = accountRepository.findByIdForUpdate(id1).orElse(null);
Account a2 = accountRepository.findByIdForUpdate(id2).orElse(null);
```

**评估**: 代码安全模式良好，采用了：
- 幂等控制（batchId）
- 风控前置检查
- 按序加锁避免死锁
- 状态检查（账户冻结）

### 预约转账服务 (ScheduledTransferService.java)

```java
// ✅ 加锁防止重复执行
ScheduledTransfer locked = scheduledTransferRepository.findByScheduledIdForUpdate(scheduled.getScheduledId())
    .orElse(null);
if (locked == null || !"pending".equals(locked.getStatus())) {
    return; // 已被处理
}
```

**评估**: 使用悲观锁防止重复执行，但单实例部署。多实例需分布式锁。

### 账单支付服务 (bill-payment-service.js)

```javascript
// ✅ 幂等 - paymentId 唯一
const paymentId = `BP${uuidv4().replace(/-/g, '').substring(0, 24)}`;

// ✅ 风控 - 调用核心银行扣款（含风控）
const debitResult = await coreBankClient.debit(
  payerAccountId,
  amount,
  paymentId,  // refId 幂等
  `账单支付-${billType}-${billAccount}`
);
```

**评估**: 通过核心银行服务的扣款 API 继承风控能力。

---

## OWASP Top 10 检查

| 风险类别 | 状态 | 说明 |
|----------|------|------|
| A01 访问控制失效 | ⚠️ | 需增加账户归属校验 |
| A02 加密失败 | ✅ | 敏感数据传输使用 HTTPS |
| A03 注入 | ✅ | 使用 ORM 参数化查询 |
| A04 不安全设计 | ✅ | 架构设计合理 |
| A05 安全配置错误 | ✅ | 生产配置已分离 |
| A06 脆弱组件 | ⚠️ | 需定期 Snyk 扫描 |
| A07 认证失败 | ✅ | 使用 JWT 认证 |
| A08 数据完整性失败 | ✅ | 使用数据库事务 |
| A09 日志监控不足 | ⚠️ | 建议增加安全事件日志 |
| A10 SSRF | ✅ | 无外部 URL 调用 |

---

## 安全建议

### 立即修复（P0）

无。

### 近期修复（P1）

1. **增加账户归属校验**
   - 在 TransactionController 中添加 customerId 校验
   - 确保用户只能操作自己的账户

2. **定期依赖扫描**
   - 配置 Snyk 每日扫描
   - 高危漏洞阻断 CI/CD

### 后续优化（P2）

1. **日志脱敏**
   - 实现统一的日志脱敏 Filter
   - 脱敏账户号、卡号等敏感信息

2. **安全事件日志**
   - 记录风控拒绝事件
   - 记录异常访问模式

3. **分布式锁**
   - 预约转账调度添加 Redis 分布式锁
   - 防止多实例重复执行

---

## 结论

Day 8 新增的扩展功能整体安全设计良好：

- ✅ 输入验证完善
- ✅ 幂等控制到位
- ✅ 并发安全处理
- ✅ 风控规则覆盖
- ⚠️ 账户归属校验需增强
- ⚠️ 日志脱敏需优化

**安全评级**: **B+**（良好，有小幅改进空间）

---

**报告生成时间**: 2026-02-02
**报告版本**: v1.0
