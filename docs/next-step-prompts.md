# 下一步建议 — 可直接复制的提示词

按 `docs/PROJECT-PROGRESS.md` 与 `docs/daily-briefings/` 的建议顺序执行；完成每步后在 `docs/agent-progress-monitor.html` 勾选对应项。

---

## 当前建议

**下一步**：Day 1-8 已完成。请从 **Day 9 决策窗口 1** 开始：先完成 d9a0t1、d9a0t2（审查集成测试问题、协调修复优先级），再启动 Day 9 各 Agent 修复任务（d9a14t1、d9a5t1、d9a6t1、d9a7t1、d9a8t1），最后在 **Day 9 决策窗口 2** 生成 `docs/daily-briefings/day-9.md` 并勾选 d9a0t3。

---

## 进度检查摘要

*基于 `docs/agent-progress-monitor.html` 与 `docs/daily-briefings/` 检查结果。*

### 总体

| 阶段 | 状态 | 说明 |
|------|------|------|
| **Day 1-8** | [已完成] | 进度监控中已勾选；简报 `day-1` 到 `day-8` 已存在。 |
| **Day 9** | [未启动] | 当前 d9a0t1、d9a0t2、d9a0t3 及 d9a14t1、d9a5t1、d9a6t1、d9a7t1、d9a8t1 仍未勾选。 |
| **Day 10+** | [未启动] | 按 workplan 在 Day 9 收敛后启动。 |

### 已关闭项（Day 6 优先修复，摘自 day-5 / day6-dw1）

| 优先级 | 任务 | 负责人 |
|--------|------|--------|
| P1 | RiskClient / PaymentClient 改为接口（Mockito/JDK25 兼容） | Agent 1 |
| P1 | 配置外部 MongoDB 或缓存二进制（Memory Server 下载超时） | Agent 2 |
| P2 | 修正规则引擎 decision 返回逻辑（测试断言） | Agent 3 |
| P2 | 增加 Frontend 页面测试（Transfer、TransactionHistory 等） | Agent 6 |

### 下一步建议（精简）

1. **Day 9 决策窗口 1**：d9a0t1、d9a0t2（审查集成测试问题、协调修复优先级）。
2. **Day 9 修复**：启动 d9a14t1、d9a5t1、d9a6t1、d9a7t1、d9a8t1，集中收敛集成测试与配置/安全/部署问题。
3. **Day 9 决策窗口 2**：生成 `docs/daily-briefings/day-9.md`，勾选 d9a0t3。

---

## 一、补齐 Day 1：Agent 0 决策窗口 2 + 每日进度简报 Day-1（已完成，保留参考）

**用途**：补齐 Day 1 唯一遗留，产出 `docs/daily-briefings/day-1.md`（或 `docs/` 下你指定的路径），并在进度监控中勾选 d1a0t7–d1a0t10。

**复制到 Cursor 发送**：

```
请使用 agent-0-architecture-control skill，并阅读 agent-prompts/agent-0-startup.md。

你是 Agent 0（架构管控中枢）。当前是 Day 1 决策窗口 2（22:00–23:00），请执行：

1. **审查各 Agent 提交的工作成果**
   - 查阅：docs/data-model/、database/、infrastructure/、.gitlab-ci.yml、docker/、monitoring/、security/ 等 Day 1 产出，以及 docs/PROJECT-PROGRESS.md 的「二、已完成事项」。
   - 对 Agent 5（基建）、Agent 8（CI/CD/监控/部署）、Agent 9（数据模型/迁移）、Agent 7（安全）的交付物做简要审查结论（通过/待改进/风险点）。

2. **审批基础设施配置**
   - 对 infrastructure/、.gitlab-ci.yml、docker/、monitoring/ 的配置做审批结论。

3. **生成每日进度简报 Day-1**
   - 按 `digital_bank_poc_workplan.md` 中的「每日进度简报模板」编写。
   - 保存为 `docs/daily-briefings/day-1.md`（若目录不存在请先创建）；可合并上述审查结论到简报的「各 Agent 进度」「关键里程碑」或单独「决策窗口 2 审查结论」小节。

4. **识别阻塞问题与风险**（如有则写，无则写「无」）

5. **规划 Day 2 工作重点**（列出 3–5 条）

6. **更新进度监控**：在 `docs/agent-progress-monitor.html` 中为以下 checkbox 添加 `checked`：d1a0t7、d1a0t8、d1a0t9、d1a0t10。
```

---

## 二、启动 Day 2：Agent 0 决策窗口 1（已完成，保留参考）

**用途**：Day 2 首先由 Agent 0 做审查与 ADR、API 规范，再启动 Agent 1–4、6。

**复制到 Cursor 发送**：

```
请使用 agent-0-architecture-control skill，并阅读 agent-prompts/agent-0-startup.md。

今天是 Day 2，决策窗口 1（10:00–12:00），请执行：

1. 审查数据模型设计（参考 docs/data-model/、database/）
2. 审批 API 接口规范初稿（若 Agent 1–4 已有初稿则审批，否则给出 Day 2 的审批准则）
3. 生成架构决策记录 ADR-003：数据存储策略（保存到 docs/adr/）
4. 生成架构决策记录 ADR-004：服务间通信方式（保存到 docs/adr/）
5. 发布 API 设计规范 v1.0（保存到 docs/architecture/api-design-spec-v1.0.md 或同类路径）

完成后在 docs/agent-progress-monitor.html 勾选：d2a0t1、d2a0t2、d2a0t3、d2a0t4、d2a0t5。
```

---

## 三、启动 Day 2：Agent 1（核心银行服务引擎）（已完成，保留参考）

```
请使用 agent-1-core-bank skill，并阅读 agent-prompts/agent-1-startup.md。

今天是 Day 2，请按 digital_bank_poc_workplan.md 执行：

1. 创建 Spring Boot 项目骨架
2. 配置 PostgreSQL 连接
3. 设计 RESTful API 规范（OpenAPI 3.0）
4. 生成 API 接口文档
5. 创建基础实体类（Account, Customer, Transaction）
6. 创建 Repository 层接口
7. 编写基础单元测试框架

遵守 docs/architecture/technical-standards-v1.0.md 与 naming-conventions.md。  
完成后在 docs/agent-progress-monitor.html 勾选 Day 2 的 Agent 1 对应项（d2a1t1–d2a1t7）。
```

---

## 四、启动 Day 2：Agent 2（支付清算处理器）（已完成，保留参考）

```
请使用 agent-2-payment skill，并阅读 agent-prompts/agent-2-startup.md。

今天是 Day 2，请按 digital_bank_poc_workplan.md 执行：

1. 创建 Node.js 项目骨架
2. 配置 Express 框架
3. 配置 MongoDB 连接（Mongoose）
4. 设计支付 API 规范（OpenAPI 3.0）
5. 创建数据模型（Payment, Settlement）
6. 创建基础路由结构
7. 配置 Mock 支付网关接口

遵守 technical-standards-v1.0 与 naming-conventions。  
完成后在 docs/agent-progress-monitor.html 勾选 Day 2 Agent 2 对应项（d2a2t1–d2a2t7）。
```

---

## 五、启动 Day 2：Agent 3（风控合规守护者）（已完成，保留参考）

```
请使用 agent-3-risk skill，并阅读 agent-prompts/agent-3-startup.md。

今天是 Day 2，请按 digital_bank_poc_workplan.md 执行：

1. 创建 FastAPI 项目骨架
2. 配置 Elasticsearch 连接
3. 设计风控 API 规范
4. 创建风控规则引擎框架
5. 设计规则配置 YAML 格式
6. 创建基础风控规则（限额、频率）
7. 配置黑名单数据结构

遵守 technical-standards-v1.0 与 naming-conventions。  
完成后在 docs/agent-progress-monitor.html 勾选 Day 2 Agent 3 对应项（d2a3t1–d2a3t7）。
```

---

## 六、启动 Day 2：Agent 4（前端体验构建器）（已完成，保留参考）

```
请使用 agent-4-frontend skill，并阅读 agent-prompts/agent-4-startup.md。

今天是 Day 2，请按 digital_bank_poc_workplan.md 执行：

1. 创建 React + TypeScript 项目
2. 配置 Tailwind CSS
3. 设计组件库结构
4. 创建设计系统（颜色、字体、间距）
5. 创建基础组件（Button, Input, Card）
6. 配置路由（React Router）
7. 配置 API 客户端（Axios）

遵守 technical-standards-v1.0 与 naming-conventions。  
完成后在 docs/agent-progress-monitor.html 勾选 Day 2 Agent 4 对应项（d2a4t1–d2a4t7）。
```

---

## 七、启动 Day 2：Agent 6（测试执行自动机）（已完成，保留参考）

```
请使用 agent-6-testing skill，并阅读 agent-prompts/agent-6-startup.md。

今天是 Day 2，请按 digital_bank_poc_workplan.md 执行：

1. 配置 Postman 测试集合框架
2. 配置 Cypress E2E 测试框架
3. 配置 JMeter 性能测试框架
4. 创建测试数据生成脚本
5. 配置 TestRail 测试管理（或等价物）
6. 生成基础测试用例模板

遵守 technical-standards-v1.0 与 naming-conventions。  
完成后在 docs/agent-progress-monitor.html 勾选 Day 2 Agent 6 对应项（d2a6t1–d2a6t6）。
```

---

## 八、Day 2 决策窗口 2（当日收尾）（已完成，保留参考）

```
请使用 agent-0-architecture-control skill。

今天是 Day 2，决策窗口 2（22:00–23:00），请执行：

1. 审查各 Agent 提交的设计文档
2. 审批基础设施配置（如有更新）
3. 生成每日进度简报 Day-2（保存到 docs/daily-briefings/day-2.md）

并在 docs/agent-progress-monitor.html 勾选：d2a0t6、d2a0t7、d2a0t8。
```

---

## 九、启动 Day 3：Agent 0 决策窗口 1

**用途**：Day 3 首先由 Agent 0 审查 API 设计、服务间接口与依赖，再启动各开发 Agent。

**复制到 Cursor 发送**：

```
请使用 agent-0-architecture-control skill，并阅读 agent-prompts/agent-0-startup.md。

今天是 Day 3，决策窗口 1（10:00–12:00），请执行：

1. 审查各服务 API 设计（参考 core-bank-service/docs/openapi.yaml、payment-service/docs/openapi.yaml、risk-service/docs/openapi.yaml 及实现进度）
2. 审批服务间接口协议（核心银行↔支付、核心银行/支付↔风控，对照 docs/architecture/api-design-spec-v1.0.md、ADR-004）
3. 生成架构决策记录 ADR-005：服务间通信协议（保存到 docs/adr/）
4. 协调服务依赖关系（与 docs/architecture/agent-dependency-matrix.md 对齐，避免循环依赖）

完成后在 docs/agent-progress-monitor.html 勾选：d3a0t1、d3a0t2、d3a0t3、d3a0t4。
```

---

## 十、启动 Day 3：Agent 1（核心银行服务引擎）

```
请使用 agent-1-core-bank skill，并阅读 agent-prompts/agent-1-startup.md。

今天是 Day 3，请按 digital_bank_poc_workplan.md 与 core-bank-service/docs/openapi.yaml 执行：

1. 实现 Account、Customer、Transaction 实体和 Repository（与现有 entity/repository 对齐或完善）
2. 实现 AccountService 业务逻辑：开户、查询账户、余额查询
3. 实现 AccountController REST API（/api/v1/accounts、/api/v1/accounts/{id}、/api/v1/accounts/{id}/balance）
4. 编写单元测试（覆盖率≥70%）与集成测试

遵守 docs/architecture/technical-standards-v1.0.md、api-design-spec-v1.0、data-dictionary-v1.0。
完成后在 docs/agent-progress-monitor.html 勾选：d3a1t1–d3a1t7（含 d3a1t4a–d3a1t4c）。
```

---

## 十一、启动 Day 3：Agent 2（支付清算处理器）

```
请使用 agent-2-payment skill，并阅读 agent-prompts/agent-2-startup.md。

今天是 Day 3，请按 digital_bank_poc_workplan.md 与 payment-service/docs/openapi.yaml 执行：

1. 实现 Payment、Settlement 模型和 Schema（与现有 models 对齐或完善）
2. 实现 PaymentService 业务逻辑：创建支付订单、支付处理、支付状态查询
3. 实现 PaymentController、SettlementController REST API（/api/v1/payments、/api/v1/settlements 等）
4. 集成 Mock 支付网关
5. 编写单元测试与 API 测试

遵守 technical-standards-v1.0、api-design-spec-v1.0、data-dictionary-v1.0。
完成后在 docs/agent-progress-monitor.html 勾选：d3a2t1–d3a2t7（含 d3a2t3a–d3a2t3c）。
```

---

## 十二、启动 Day 3：Agent 3（风控合规守护者）

```
请使用 agent-3-risk skill，并阅读 agent-prompts/agent-3-startup.md。

今天是 Day 3，请按 digital_bank_poc_workplan.md 与 risk-service/docs/openapi.yaml 执行：

1. 实现规则引擎核心逻辑、限额检查规则、频率检查规则、黑名单检查规则
2. 实现 RiskService 业务逻辑与 RiskController REST API（/api/v1/risk/check、/api/v1/risk/blacklist）
3. 配置 Elasticsearch 索引（或 ES 不可用时实现占位/降级）
4. 编写单元测试

遵守 technical-standards-v1.0、api-design-spec-v1.0。风控为服务间调用，请求字段可与调用方约定 camelCase 或 snake_case 并在 OpenAPI 中写明。
完成后在 docs/agent-progress-monitor.html 勾选：d3a3t1–d3a3t8。
```

---

## 十三、启动 Day 3：Agent 4（前端体验构建器）

```
请使用 agent-4-frontend skill，并阅读 agent-prompts/agent-4-startup.md。

今天是 Day 3，请按 digital_bank_poc_workplan.md 执行：

1. 实现登录页面组件、注册页面组件、账户概览页面
2. 集成认证 API、账户查询 API（经 api-client，baseURL 指向网关或后端）
3. 实现状态管理（Context API 或 Redux Toolkit）
4. 编写组件单元测试

遵守 technical-standards-v1.0、design-system、api-design-spec-v1.0。
完成后在 docs/agent-progress-monitor.html 勾选：d3a4t1–d3a4t7。
```

---

## 十四、启动 Day 3：Agent 5（应用基础设施层）

```
请使用 agent-5-infrastructure skill，并阅读 agent-prompts/agent-5-startup.md。

今天是 Day 3，请按 digital_bank_poc_workplan.md 执行：

1. 配置 Kong API Gateway 路由规则（/api/v1 转发至 core-bank、payment、risk）
2. 配置服务注册（Consul）：各服务注册与健康检查
3. 配置负载均衡规则、限流规则（与 technical-standards 性能规范一致）
4. 部署核心银行服务到 K8s，验证服务发现

遵守 infrastructure/kong/kong.yml、ADR-004、technical-standards。若新增 K8s Deployment/Service 或 Kong 路由，需符合 Day 2 审批的架构结论。
完成后在 docs/agent-progress-monitor.html 勾选：d3a5t1–d3a5t6。
```

---

## 十五、启动 Day 3：Agent 8（运维自动化引擎）

```
请使用 agent-8-devops skill，并阅读 agent-prompts/agent-8-startup.md。

今天是 Day 3，请按 digital_bank_poc_workplan.md 执行：

1. 配置核心银行、支付、风控、前端的 CI/CD 流水线（.gitlab-ci.yml 或等价）
2. 部署到 Dev 环境
3. 验证自动化部署（构建、镜像、部署、健康检查）

遵守 technical-standards、docker/、.gitlab-ci.yml 现有结构。
完成后在 docs/agent-progress-monitor.html 勾选：d3a8t1–d3a8t6。
```

---

## 十六、启动 Day 3：Agent 9（数据处理分析师）

```
请使用 agent-9-data skill，并阅读 agent-prompts/agent-9-startup.md。

今天是 Day 3，请按 digital_bank_poc_workplan.md 执行：

1. 执行 PostgreSQL Schema 迁移（database/postgresql/migrations/）
2. 执行 MongoDB Collection 创建（依 database/mongodb/schemas/、data-dictionary-v1.0）
3. 生成测试数据：账户 10 万+、客户 5 万+（可用 tests/data/generators 或等价脚本）
4. 验证数据模型完整性，生成数据质量报告

遵守 data-dictionary-v1.0、ADR-003。勿直接修改已有 V1 迁移，新增需求以新迁移迭代。
完成后在 docs/agent-progress-monitor.html 勾选：d3a9t1–d3a9t6。
```

---

## 十七、Day 3 决策窗口 2（当日收尾）

```
请使用 agent-0-architecture-control skill。

今天是 Day 3，决策窗口 2（22:00–23:00），请执行：

1. 审查各 Agent 开发进度（Agent 1–4、5、8、9 的 Day 3 产出）
2. 处理技术阻塞问题（如有则记录并给出缓解或责任人）
3. 生成每日进度简报 Day-3（保存到 docs/daily-briefings/day-3.md）

并在 docs/agent-progress-monitor.html 勾选：d3a0t5、d3a0t6、d3a0t7。
```

---

## 十八、启动 Day 4：Agent 0 决策窗口 1

**用途**：Day 4 首先由 Agent 0 审查服务实现、审批异常处理与日志规范，再启动 Agent 1、2、3、4、6、7。

**复制到 Cursor 发送**：

```
请使用 agent-0-architecture-control skill。

今天是 Day 4，决策窗口 1（10:00–12:00），请执行：

1. 审查服务实现进度（对照 Day 3 简报与各服务代码：Agent 1 缺口 debit/Transaction/Customer 等；Agent 2–4、5、8、9 就绪情况）
2. 审批异常处理策略（核心银行 GlobalExceptionHandler、支付 error-handler、风控 risk_controller 与 technical-standards 错误处理规范）
3. 审批日志规范（各服务 Logger/logger 与 technical-standards 日志规范）

可产出 docs/architecture/day4-dw1-approval-record.md 记录审查与审批结论。
完成后在 docs/agent-progress-monitor.html 勾选：d4a0t1、d4a0t2、d4a0t3。
```

---

## 十九、启动 Day 4：Agent 1（核心银行服务引擎）

```
请使用 agent-1-core-bank skill。

今天是 Day 4，请按 digital_bank_poc_workplan.md、ADR-005、docs/daily-briefings/day-3.md 执行：

1. 实现 **POST /api/v1/transactions/debit**（ADR-005，支付扣款；Request: accountId, amount, refId, remark?；Response: 201 transactionId/accountId/amount/status；幂等 refId）
2. 实现 TransactionService：行内转账、交易查询、交易历史
3. 实现 CustomerService：客户注册、客户信息查询、客户信息更新
4. 实现 TransactionController、CustomerController REST API
5. 集成风控服务调用（POST /api/v1/risk/check，转账前）
6. 编写单元测试和集成测试

优先补齐 debit，以便 Agent 2 集成核心银行扣款。
完成后在 docs/agent-progress-monitor.html 勾选：d4a1t1–d4a1t6（含 d4a1t1a–c、d4a1t2a–c）。
```

---

## 二十、启动 Day 4：Agent 2（支付清算处理器）

```
请使用 agent-2-payment skill。

今天是 Day 4，请按 digital_bank_poc_workplan.md、ADR-005 执行：

1. 实现清算引擎核心逻辑、对账功能、支付回调处理
2. 实现异步任务处理（Bull/Agenda，若已选型）
3. **集成核心银行服务（账户扣款）**：在 processPayment 中调用 GET /api/v1/accounts/{id}/balance 与 **POST /api/v1/transactions/debit**（ADR-005；refId=paymentId，幂等）

遵守 RiskCheckRequest 的 snake_case；若核心银行 debit 未就绪，可先留 HTTP 客户端占位，待 Agent 1 完成后再联调。
完成后在 docs/agent-progress-monitor.html 勾选：d4a2t1–d4a2t6。
```

---

## 廿一、启动 Day 4：Agent 3（风控合规守护者）

```
请使用 agent-3-risk skill。今天是 Day 4，请按 workplan 执行：扩展风控规则（10–15 条）、风险评分、规则链执行引擎、风控日志（ES）、风控报告、规则执行性能优化。完成后勾选 d4a3t1–d4a3t6。
```

---

## 廿二、启动 Day 4：Agent 4（前端体验构建器）

```
请使用 agent-4-frontend skill。今天是 Day 4，请按 workplan 执行：转账页、交易历史页、管理后台基础框架、转账与交易查询 API 集成、表单验证、错误处理。完成后勾选 d4a4t1–d4a4t7。
```

---

## 廿三、启动 Day 4：Agent 6（测试执行自动机）

```
请使用 agent-6-testing skill。今天是 Day 4，请按 workplan 执行：基于 OpenAPI 生成 API 测试用例、API 回归、E2E（登录、转账）、基础 E2E 执行、测试报告。完成后勾选 d4a6t1–d4a6t5。
```

---

## 廿四、启动 Day 4：Agent 7（安全扫描卫士）

```
请使用 agent-7-security skill。今天是 Day 4，请按 workplan 执行：SAST（核心银行、支付）、依赖漏洞扫描、结果分析、安全报告 Day-4、高危漏洞修复（如有）。完成后勾选 d4a7t1–d4a7t6。
```

---

## 廿五、Day 4 决策窗口 2（当日收尾）

```
请使用 agent-0-architecture-control skill。

今天是 Day 4，决策窗口 2（22:00–23:00），请执行：

1. 审查集成测试结果
2. 生成每日进度简报 Day-4（保存到 docs/daily-briefings/day-4.md）

并在 docs/agent-progress-monitor.html 勾选：d4a0t4、d4a0t5。
```

---

## 廿六、启动 Day 5：Agent 0 决策窗口 1

**用途**：Day 5 首先由 Agent 0 审查服务集成、审批消息队列、发布 ADR-006，再启动 Agent 1–4、5、6、8。

**复制到 Cursor 发送**：

```
请使用 agent-0-architecture-control skill。

今天是 Day 5，决策窗口 1（10:00–12:00），请执行：

1. 审查服务集成方案（支付↔核心银行、核心银行/支付↔风控、支付回调与 Bull 队列）
2. 审批消息队列使用（Bull+Redis payment-callback；REDIS_URI 未配置时 no-op）
3. 生成架构决策记录 ADR-006：异步处理策略（保存到 docs/adr/）

可产出 docs/architecture/day5-dw1-approval-record.md。完成后勾选 d5a0t1、d5a0t2、d5a0t3。
```

---

## 廿七、启动 Day 5：Agent 1（核心银行服务引擎）

```
请使用 agent-1-core-bank skill。今天是 Day 5，按 workplan：集成支付服务（调用支付 API）、集成风控（已有）、事务管理（分布式事务）、消息通知（可选）、优化数据库查询、完善异常处理与日志。完成后勾选 d5a1t1–d5a1t7。
```

---

## 廿八、启动 Day 5：Agent 2（支付清算处理器）

```
请使用 agent-2-payment skill。今天是 Day 5，按 workplan：完善支付流程（与核心银行）、支付重试、超时、MongoDB 性能、支付状态同步、错误处理。遵守 ADR-005、ADR-006。完成后勾选 d5a2t1–d5a2t6。
```

---

## 廿九、启动 Day 5：Agent 3（风控合规守护者）

```
请使用 agent-3-risk skill。今天是 Day 5，按 workplan：规则引擎与 ES 性能、规则缓存、实时风控监控、风控报告完善。完成后勾选 d5a3t1–d5a3t5。
```

---

## 三十、启动 Day 5：Agent 4（前端体验构建器）

```
请使用 agent-4-frontend skill。今天是 Day 5，按 workplan：完善 UI/UX、响应式、加载/骨架屏、错误与成功提示、性能、国际化（可选）。完成后勾选 d5a4t1–d5a4t6。
```

---

## 卅一、启动 Day 5：Agent 5（应用基础设施层）

```
请使用 agent-5-infrastructure skill。今天是 Day 5，按 workplan：配置所有服务 Kong 路由、限流、JWT、CORS、SSL/TLS、验证网关。完成后勾选 d5a5t1–d5a5t6。
```

---

## 卅二、启动 Day 5：Agent 6（测试执行自动机）

```
请使用 agent-6-testing skill。今天是 Day 5，按 workplan：完整 API 回归、集成测试、E2E（完整用户流程）、覆盖率报告、结果分析。完成后勾选 d5a6t1–d5a6t5。
```

---

## 卅三、启动 Day 5：Agent 8（运维自动化引擎）

```
请使用 agent-8-devops skill。今天是 Day 5，按 workplan：部署所有服务到 QA、QA 监控、告警、验证自动化部署、回滚脚本。完成后勾选 d5a8t1–d5a8t5。
```

---

## 卅四、Day 5 决策窗口 2（当日收尾）

```
请使用 agent-0-architecture-control skill。

今天是 Day 5，决策窗口 2（22:00–23:00），请执行：

1. 审查集成测试结果
2. 生成每日进度简报 Day-5（保存到 docs/daily-briefings/day-5.md）

并在 docs/agent-progress-monitor.html 勾选：d5a0t4、d5a0t5。
```

---

## 卅五、启动 Day 6：Agent 0 决策窗口 1

**用途**：Day 6 首先由 Agent 0 审查功能完整性、审批性能优化方案，再启动各 Agent 完善与修复任务。

**复制到 Cursor 发送**：

```
请使用 agent-0-architecture-control skill。

今天是 Day 6，决策窗口 1（10:00–12:00），请执行：

1. 审查功能完整性（对照 Day 5 简报、各服务实现与 OpenAPI；含 Day 5 遗留的测试环境与覆盖率）
2. 审批性能优化方案（JMeter、technical-standards 指标、DB/ES/前端等优化方向）

可产出 docs/architecture/day6-dw1-approval-record.md。完成后勾选 d6a0t1、d6a0t2。
```

---

## 卅六、启动 Day 6：各 Agent 完善任务

```
按 workplan 与 day-5 明日计划执行。Agent 1：完善核心银行（含 P1 Client 接口化）；Agent 2：完善支付（含 P1 MongoDB 配置）；Agent 3：完善风控（含 P2 规则断言修正）；Agent 4：完善前端；Agent 5：完善基础设施；Agent 6：持续测试、提升覆盖率；Agent 7：持续安全扫描；Agent 8：持续运维优化；Agent 9：数据质量检查。完成后勾选 d6a1t1、d6a2t1、…、d6a9t1。
```

### Day 6 各 Agent 启动提示词（可直接复制到 Cursor 发送）

#### Agent 1（核心银行服务引擎）— d6a1t1

```
请使用 agent-1-core-bank skill，并阅读 agent-prompts/agent-1-startup.md（如存在）。

今天是 Day 6，请按 workplan 与 Day 5 简报的“Day 6 优先修复”执行核心银行完善任务：

1) P1 修复：解决 Mockito/JDK 25 兼容性问题
   - 优先方案：将 RiskClient / PaymentClient 从 class 调整为 interface（或引入适配层），使单测可稳定 mock
   - 备选方案：评估 JVM 参数 -XX:+EnableDynamicAgentLoading 的影响与可移植性（如采用需在文档中说明）

2) 回归与质量：
   - 重新跑核心银行单元/集成测试，确保失败项收敛
   - 检查异常处理与日志是否符合 technical-standards-v1.0（尤其是错误码、关键字段）

3) 交付物：
   - 提交代码改动 + 简短变更说明（写入相应文档或在 PR/commit 说明中体现）

完成后在 docs/agent-progress-monitor.html 勾选：d6a1t1。
```

#### Agent 2（支付清算处理器）— d6a2t1

```
请使用 agent-2-payment skill，并阅读 agent-prompts/agent-2-startup.md（如存在）。

今天是 Day 6，请按 workplan 与 Day 5 简报的“Day 6 优先修复”执行支付服务完善任务：

1) P1 修复：解决 mongodb-memory-server 首次下载超时导致测试不可执行
   - 方案A：支持通过 TEST_MONGODB_URI 使用外部 MongoDB（CI/本地均可配置）
   - 方案B：缓存/固定 MongoDB 二进制下载（如项目策略允许）
   - 确保测试在无网络/弱网环境下也可稳定执行（至少不因下载失败而整体跳过）

2) 回归与质量：
   - 跑支付服务测试（含 API/集成），确认跳过用例恢复执行
   - 校验与核心银行 debit 幂等调用、错误处理、回调队列（Bull）行为符合标准

3) 交付物：
   - 更新 README/配置说明（如何设置 TEST_MONGODB_URI / 本地运行方式）

完成后在 docs/agent-progress-monitor.html 勾选：d6a2t1。
```

#### Agent 3（风控合规守护者）— d6a3t1

```
请使用 agent-3-risk skill，并阅读 agent-prompts/agent-3-startup.md（如存在）。

今天是 Day 6，请按 workplan 与 Day 5 简报的“Day 6 优先修复”执行风控服务完善任务：

1) P2 修复：修正规则引擎测试断言失败
   - 重点检查 decision / approved / reject_error_code 等返回字段的一致性
   - 修复后补齐/更新单测断言，使行为与业务语义一致

2) 稳定性：
   - 检查 Elasticsearch 不可用时的降级/返回码（如 503 RKS002）是否符合 OpenAPI 与标准
   - 复核日志与错误结构统一性（technical-standards-v1.0）

3) 回归：
   - 运行风控单测，确保失败用例清零或有明确可接受原因与记录

完成后在 docs/agent-progress-monitor.html 勾选：d6a3t1。
```

#### Agent 4（前端体验构建器）— d6a4t1

```
请使用 agent-4-frontend skill，并阅读 agent-prompts/agent-4-startup.md（如存在）。

今天是 Day 6，请按 workplan 执行前端完善任务：

1) 功能与体验回归：
   - 关键页面：登录/注册、账户概览、转账、交易历史
   - 校验错误提示、成功提示、加载/骨架屏、表单校验是否一致且不误导

2) 与后端契约对齐：
   - 对照 OpenAPI 与实际错误响应格式，确保前端错误处理能展示 code/message/errorCode/timestamp 等关键信息
   - 校验与网关路径/环境变量配置一致

3) 交付物：
   - 小结：本日修复点/体验改进点清单

完成后在 docs/agent-progress-monitor.html 勾选：d6a4t1。
```

#### Agent 5（应用基础设施层）— d6a5t1

```
请使用 agent-5-infrastructure skill，并阅读 agent-prompts/agent-5-startup.md（如存在）。

今天是 Day 6，请按 workplan 执行基础设施完善任务：

1) 网关与路由复核：
   - Kong 路由/限流/JWT/CORS/SSL 配置复核，确保与当前各服务 API 前缀一致
   - 补齐缺失的说明与示例（如何在本地/QA 验证）

2) 可观测性与运维友好：
   - 检查健康检查、日志采集字段、基础告警规则是否可用
   - 若发现与服务实现不一致，提出修正或提交配置修复

完成后在 docs/agent-progress-monitor.html 勾选：d6a5t1。
```

#### Agent 6（测试执行自动机）— d6a6t1

```
请使用 agent-6-testing skill，并阅读 agent-prompts/agent-6-startup.md（如存在）。

今天是 Day 6，请按 workplan 执行持续测试与覆盖率提升：

1) P2 修复：提升前端覆盖率（Day 5 显示 Transfer / TransactionHistory 等覆盖不足）
   - 补齐关键页面与关键交互的测试用例
   - 目标：覆盖率向既定目标收敛，并确保用例稳定

2) 回归验证：
   - 在 Agent 1/2/3 修复后，重新执行相关测试集，确认：
     - Core Bank：Mockito/JDK25 问题不再导致大面积失败
     - Payment：MongoDB 测试不再因下载超时跳过
     - Risk：规则引擎断言失败修复完成

3) 输出：
   - 更新/新增 Day 6 测试结果记录（报告或简要摘要即可）

完成后在 docs/agent-progress-monitor.html 勾选：d6a6t1。
```

#### Agent 7（安全扫描卫士）— d6a7t1

```
请使用 agent-7-security skill，并阅读 agent-prompts/agent-7-startup.md（如存在）。

今天是 Day 6，请按 workplan 执行持续安全扫描与复核：

1) 复核 Day 4 中危项的处置状态（若仍存在给出修复建议/优先级）
2) 对新增/变更代码做快速 SAST/依赖扫描复核（重点：支付回调签名校验、默认密码/弱配置、依赖锁文件等）
3) 输出：Day 6 安全结论摘要（无高危也要写“无高危”与关注点）

完成后在 docs/agent-progress-monitor.html 勾选：d6a7t1。
```

#### Agent 8（运维自动化引擎）— d6a8t1

```
请使用 agent-8-devops skill，并阅读 agent-prompts/agent-8-startup.md（如存在）。

今天是 Day 6，请按 workplan 执行持续运维优化：

1) QA/本地一键启动与验证链路复核（服务启动顺序、依赖就绪、健康检查）
2) 监控/告警/回滚脚本复核：能否在服务异常时快速定位与恢复
3) 输出：Day 6 运维改进点清单（可操作、可验证）

完成后在 docs/agent-progress-monitor.html 勾选：d6a8t1。
```

#### Agent 9（数据处理分析师）— d6a9t1

```
请使用 agent-9-data skill，并阅读 agent-prompts/agent-9-startup.md（如存在）。

今天是 Day 6，请按 workplan 执行数据质量检查：

1) 对照 data-dictionary 与现有数据/迁移脚本，抽样检查关键实体（Account/Customer/Transaction/Payment等）一致性
2) 复核数据质量报告口径（如有新增数据或规则变化，更新结论）
3) 输出：Day 6 数据质量检查摘要（问题/风险/建议）

完成后在 docs/agent-progress-monitor.html 勾选：d6a9t1。
```

---

## 卅七、Day 6 决策窗口 2（当日收尾）

```
请使用 agent-0-architecture-control skill。

今天是 Day 6，决策窗口 2（22:00–23:00），请执行：

1. 生成每日进度简报 Day-6（保存到 docs/daily-briefings/day-6.md）

并在 docs/agent-progress-monitor.html 勾选：d6a0t3。
```

---

## 使用说明

- **进度检查**：见上文 **进度检查摘要**；按 `agent-progress-monitor.html` 与 `daily-briefings/` 核验后，可刷新摘要与 **当前建议**。
- **当前顺序**：Day 1–5 已完成；Day 6 **卅五** 已完成，**卅六** 可拆分多窗口并行，**卅七** 收尾。**一～卅四** 保留作历史参考。
- **Skill**：若 Cursor 中未配置 `agent-X-*`，可改为「请阅读 `skills/agent-X-xxx/SKILL.md` 并按其中指引执行」。
- **路径**：`docs/daily-briefings/` 由 Agent 0 在首次生成简报时创建；`docs/next-step-prompts.md` 可随 Day 迭代增补（如 Day 4、5、6…）。
