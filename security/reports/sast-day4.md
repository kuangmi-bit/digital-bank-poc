# SAST 扫描报告 - Day 4

**日期**: 2026-01-27  
**范围**: core-bank-service, payment-service  
**执行**: Agent 7（安全扫描卫士）  
**方法**: 静态规则检查、代码审阅、Repository/Controller/Service 安全模式检查

---

## 1. 执行概要

| 项目 | 说明 |
|------|------|
| SonarQube | 未配置本地/CI 服务器，本次未运行；建议在 CI 配置 `SONAR_HOST_URL`、`SONAR_TOKEN` 后接入 `sonar-scanner` |
| 静态规则 | 使用 grep/代码审阅：硬编码密码/密钥、SQL 拼接、eval/exec、XSS 相关模式 |
| 代码审阅 | TransactionService、AccountController、TransactionController、CustomerController、TransactionRepository、AccountRepository；payment-controller、payment-service、callback-service、config |

---

## 2. core-bank-service 结果

### 2.1 安全模式检查

- **SQL 注入**：未发现。所有数据访问经 JPA Repository；`@Query` 使用 `:param` 参数绑定（`findWithFilters`、`findByIdForUpdate`、`findByAccountIdAndCreatedAtBetween` 等），无字符串拼接。
- **命令执行 / 反序列化**：未发现 `Runtime.getRuntime().exec`、`ProcessBuilder`、`ObjectInputStream`、不安全反序列化。
- **硬编码密钥**：未在源码中发现。`application.yml` 使用 `${CORE_BANK_DB_PASSWORD:digitalbank}` 环境变量+默认值，见 2.2。
- **敏感信息日志**：`TransactionService`、`AccountService` 等日志为 ID、金额、refId，未发现密码、Token、完整卡号等。

### 2.2 发现与建议

| ID | 类别 | 严重程度 | 描述 | 建议 |
|----|------|----------|------|------|
| core-bank-sast-001 | 安全配置 | 中 | `application.yml` 中 `CORE_BANK_DB_PASSWORD` 默认值为 `digitalbank`，若生产未设置环境变量则存在弱口令风险 | 生产必须通过 `CORE_BANK_DB_PASSWORD` 覆盖；`application-prod.yml` 不设默认或使用占位强制配置 |

### 2.3 良好实践

- 使用 `@Valid`、DTO 校验；统一 `BusinessException`、`GlobalExceptionHandler`。
- 转账前调用风控 `RiskClient.checkTransfer`；debit 幂等（refId）。
- `open-in-view: false`；Actuator 仅暴露 `health,info,metrics,prometheus`，`show-details: when-authorized`。

---

## 3. payment-service 结果

### 3.1 安全模式检查

- **注入 / XSS / 命令执行**：未发现 `eval`、`innerHTML`、`document.write`、`child_process.exec`、`new Function(用户输入)`。Controller 将 `req.body`、`req.params` 传 Service，Mongoose 使用对象查询 `{ paymentId }`，无拼接。
- **硬编码密钥**：未发现。`config/default.js` 中 `mongodb.uri`、`redis.uri`、`coreBank.serviceUrl` 均从环境变量读取，默认仅为本地开发用。
- **回调验签**：见 3.2。

### 3.2 发现与建议

| ID | 类别 | 严重程度 | 描述 | 建议 |
|----|------|----------|------|------|
| payment-sast-001 | 逻辑/完整性 | 中 | `callback-service` 对非 mock 渠道的 `X-Callback-Signature` 未强制校验，仅注释「POC 放宽」 | 生产接入真实渠道时，必须按渠道规范实现验签并拒绝无效签名 |

### 3.3 良好实践

- 使用 `PaymentError`、`error-handler` 中间件统一错误响应。
- `Payment.findOne({ paymentId })` 等均为参数化；`logger` 不记录敏感字段。

---

## 4. 汇总

| 严重程度 | 数量 |
|----------|------|
| 高 | 0 |
| 中 | 2 |
| 低 | 0 |

**结论**：未发现高危 SAST 问题；2 项为配置/逻辑建议，需在生产部署前落实。

---

## 5. 后续建议

- 在 CI 中接入 SonarQube（或等价 SAST），对每次 MR 运行。
- 对 core-bank 可增加 SpotBugs + FindSecBugs；对 payment 可增加 `eslint-plugin-security`。
- 落实 `security-baseline.md` 中的生产配置（密码、验签、Vault 等）。

---

**报告生成**: Agent 7  
**依据**: `skills/agent-7-security/SKILL.md`、`docs/architecture/technical-standards-v1.0.md`、`security/security-baseline.md`
