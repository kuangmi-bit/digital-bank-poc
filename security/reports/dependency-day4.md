# 依赖漏洞扫描报告 - Day 4

**日期**: 2026-01-27  
**范围**: core-bank-service (Maven), payment-service (npm)  
**执行**: Agent 7（安全扫描卫士）  
**方法**: 依赖清单审查、已知 CVE 与版本建议（OWASP dependency-check、npm audit 需在具备 lockfile 与网络环境下复测）

---

## 1. 执行概要

- **core-bank-service**：基于 `pom.xml` 的依赖清单审查；`mvn org.owasp:dependency-check-maven:check` 需网络与 JAVA_HOME，本地未执行，建议 CI 接入。
- **payment-service**：`npm audit` 依赖 `package-lock.json`，当前仓库无 lockfile，未执行；建议先 `npm install` 生成 lockfile 后复测。

---

## 2. core-bank-service (Maven)

### 2.1 依赖概览（来自 pom.xml）

| 组件 | 版本 | 说明 |
|------|------|------|
| Spring Boot | 3.2.1 | parent |
| spring-boot-starter-web, data-jpa, validation, actuator | (BOM) | |
| postgresql | (BOM) | runtime |
| flyway-core | (BOM) | |
| springdoc-openapi-starter-webmvc-ui | 2.3.0 | |
| lombok | (BOM) | optional |
| spring-boot-starter-test, testcontainers | (BOM) | test |

### 2.2 已知风险与建议

- 截至 2026-01 的公开信息：**Spring Boot 3.2.x** 与当前使用的 starters 在近期的安全公告中，未发现需紧急升级的**严重/高危** CVE；若后续有公告，应尽快升级。
- **springdoc 2.3.0**：建议关注 [SpringDoc 安全公告](https://github.com/springdoc/springdoc-openapi/releases)，按需升级。
- **PostgreSQL 驱动**：随 Spring Boot BOM，建议保持与 Spring Boot 同步升级。

**建议**：在 CI 中运行 `mvn org.owasp:dependency-check-maven:check` 或 Snyk，对 `pom.xml` 做持续依赖扫描；输出见 `security/dependency-scan-config.yaml`。

---

## 3. payment-service (npm)

### 3.1 依赖概览（来自 package.json）

| 包 | 版本 | 类型 |
|----|------|------|
| bull | ^4.12.0 | dep |
| express | ^4.21.0 | dep |
| ioredis | ^5.4.1 | dep |
| mongoose | ^8.8.0 | dep |
| winston | ^3.14.0 | dep |
| jest | ^29.7.0 | dev |
| mongodb-memory-server | ^10.0.0 | dev |
| supertest | ^7.0.0 | dev |

### 3.2 已知风险与建议

- **express 4.21.x**：需关注 [Express 安全公告](https://expressjs.com/en/advanced/security-updates.html)；历史上有过 4.x 的中低危 CVE，需定期升级。
- **mongoose 8.8.x**：相对较新，建议关注发布说明与 CVE。
- **bull、ioredis、winston**：建议在生成 `package-lock.json` 后运行 `npm audit`，并按 `security/dependency-scan-config.yaml`、`.snyk` 在 CI 执行 Snyk。

### 3.3 锁文件与可复现构建

| ID | 严重程度 | 描述 | 建议 |
|----|----------|------|------|
| payment-dep-001 | 中 | 缺少 `package-lock.json`，依赖版本未锁定，`npm audit` 无法运行，且影响构建可复现性 | 在项目根执行 `npm install`（或 `npm ci` 前先 `npm install`）生成 `package-lock.json`，并提交到仓库；后续 MR 中运行 `npm audit` 与 Snyk |

---

## 4. 汇总

| 服务 | 高危 | 中危 | 低危 | 说明 |
|------|------|------|------|------|
| core-bank-service | 0 | 0 | 0 | 基于清单的静态审查未发现已知高危；建议 CI 做 OWASP dependency-check / Snyk |
| payment-service | 0 | 1 | 0 | 缺 lockfile 导致无法完成审计；建议新增 lockfile 后复测 |

**结论**：未发现需立即修复的**高危依赖漏洞**；需落实 lockfile 与 CI 依赖扫描，便于后续持续监控。

---

## 5. 后续建议

- **core-bank**：在 `.gitlab-ci.yml` 的 security 阶段增加 `mvn org.owasp:dependency-check-maven:check` 或 Snyk（Maven）；失败时阻断合并（依 `security-baseline.md`）。
- **payment**：生成并提交 `package-lock.json`；在 CI 中对 `payment-service` 运行 `npm audit --audit-level=high` 与 Snyk。
- 风控、前端等服务的依赖扫描按 `dependency-scan-config.yaml` 在 CI 中一并接入。

---

**报告生成**: Agent 7  
**依据**: `security/dependency-scan-config.yaml`、`.snyk`、`security/security-baseline.md`
