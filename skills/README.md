# 数字银行POC系统 - Agent Skills

本目录包含10个AI Agent的skill文件，每个skill定义了对应Agent的职责、技术栈、工作流程和交付标准。

## Skill列表

| Agent | Skill名称 | 描述 |
|-------|-----------|------|
| Agent 0 | `agent-0-architecture-control` | 架构管控中枢 - 负责架构决策、进度协调和质量把关 |
| Agent 1 | `agent-1-core-bank` | 核心银行服务引擎 - 实现账户管理、交易处理和客户信息管理 |
| Agent 2 | `agent-2-payment` | 支付清算处理器 - 实现支付网关、清算引擎和交易回调处理 |
| Agent 3 | `agent-3-risk` | 风控合规守护者 - 实现交易限额检查、风控规则引擎和黑名单管理 |
| Agent 4 | `agent-4-frontend` | 前端体验构建器 - 实现前端用户界面和交互功能 |
| Agent 5 | `agent-5-infrastructure` | 应用基础设施层 - 配置API网关、服务注册发现和负载均衡 |
| Agent 6 | `agent-6-testing` | 测试执行自动机 - 执行自动化测试、生成测试报告 |
| Agent 7 | `agent-7-security` | 安全扫描卫士 - 执行代码安全扫描、API安全测试和渗透测试 |
| Agent 8 | `agent-8-devops` | 运维自动化引擎 - 配置CI/CD、容器编排和监控告警 |
| Agent 9 | `agent-9-data` | 数据处理分析师 - 设计数据模型、生成测试数据和分析数据质量 |

## 目录结构

```
skills/
├── README.md                           # 本文件
├── agent-0-architecture-control/
│   └── SKILL.md                       # Agent 0技能定义
├── agent-1-core-bank/
│   └── SKILL.md                       # Agent 1技能定义
├── agent-2-payment/
│   └── SKILL.md                       # Agent 2技能定义
├── agent-3-risk/
│   └── SKILL.md                       # Agent 3技能定义
├── agent-4-frontend/
│   └── SKILL.md                       # Agent 4技能定义
├── agent-5-infrastructure/
│   └── SKILL.md                       # Agent 5技能定义
├── agent-6-testing/
│   └── SKILL.md                       # Agent 6技能定义
├── agent-7-security/
│   └── SKILL.md                       # Agent 7技能定义
├── agent-8-devops/
│   └── SKILL.md                       # Agent 8技能定义
└── agent-9-data/
    └── SKILL.md                       # Agent 9技能定义
```

## 使用方法

### 1. 在Claude中使用Skill

当需要启动某个Agent时，可以引用对应的skill：

```
请使用 agent-1-core-bank skill 来帮助我实现核心银行服务。
```

或者直接读取skill文件：

```
请阅读 skills/agent-1-core-bank/SKILL.md 并按照其中的指导开始工作。
```

### 2. Skill文件结构

每个skill文件包含：

- **Frontmatter**: 元数据（名称、版本、描述、关键词等）
- **概述**: Agent的角色定位和职责
- **何时使用**: 使用场景
- **技术栈**: 使用的技术和工具
- **核心功能**: MVP功能列表
- **自动化能力**: 自动化比例和具体能力
- **交付标准**: 量化指标
- **项目结构**: 代码组织结构
- **协作关系**: 与其他Agent的协作方式
- **关键里程碑**: 重要时间节点
- **示例代码**: 代码示例（如适用）

### 3. 与启动提示词的关系

这些skill文件是对 `agent_prompts.md` 中启动提示词的补充和扩展：

- **agent_prompts.md**: 包含详细的启动提示词，用于直接启动Agent
- **skills/**: 包含结构化的skill定义，可以在Claude中作为skill引用

两者可以配合使用：
- 启动Agent时使用 `agent_prompts.md` 中的完整提示词
- 在Claude对话中引用skill来获取特定Agent的能力

## 技能集成

这些skill可以与其他相关skill集成使用：

- **deeparchi**: 用于创建架构图
- **drawio**: 用于绘制流程图和架构图
- **ddd**: 用于领域建模（Agent 1, 2, 3）
- **bpmn**: 用于流程建模（Agent 1, 2）

## 维护

- **版本**: v1.0.0
- **创建日期**: 2026-01-26
- **维护者**: Digital Bank POC Team

## 相关文档

- 项目计划: `digital_bank_poc_plan.md`
- 详细工作计划: `digital_bank_poc_workplan.md`
- Agent启动提示词: `agent_prompts.md`

---

**注意**: 这些skill文件是为数字银行POC项目专门创建的，可以根据项目需要进行调整和扩展。
