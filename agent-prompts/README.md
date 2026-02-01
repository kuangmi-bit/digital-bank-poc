# Agent启动提示词文件

本目录包含10个AI Agent的独立启动提示词文件，每个文件都包含对应的skill引用。

## 文件列表

| Agent | 文件名 | Skill引用 |
|-------|--------|-----------|
| Agent 0 | `agent-0-startup.md` | `agent-0-architecture-control` |
| Agent 1 | `agent-1-startup.md` | `agent-1-core-bank` |
| Agent 2 | `agent-2-startup.md` | `agent-2-payment` |
| Agent 3 | `agent-3-startup.md` | `agent-3-risk` |
| Agent 4 | `agent-4-startup.md` | `agent-4-frontend` |
| Agent 5 | `agent-5-startup.md` | `agent-5-infrastructure` |
| Agent 6 | `agent-6-startup.md` | `agent-6-testing` |
| Agent 7 | `agent-7-startup.md` | `agent-7-security` |
| Agent 8 | `agent-8-startup.md` | `agent-8-devops` |
| Agent 9 | `agent-9-startup.md` | `agent-9-data` |

## 使用方法

### 方法1: 直接读取启动提示词文件

```
请阅读 agent-prompts/agent-1-startup.md 并按照其中的指导开始工作。
今天是Day 3，请执行对应的任务。
```

### 方法2: 使用Skill引用

```
请使用 agent-1-core-bank skill，并阅读 agent-prompts/agent-1-startup.md。
今天是Day 3，请执行对应的任务。
```

### 方法3: 组合使用

```
请使用 agent-1-core-bank skill，然后按照 agent-prompts/agent-1-startup.md 中的提示开始工作。
今天是Day 3，请查看 digital_bank_poc_workplan.md 中Day 3的任务并执行。
```

## 文件结构

每个启动提示词文件包含：

1. **Skill引用**: 明确引用对应的skill
2. **角色定位**: Agent的职责和定位
3. **技术栈**: 使用的技术和工具
4. **核心功能**: MVP功能列表
5. **自动化能力**: 自动化比例和具体能力
6. **交付标准**: 量化指标
7. **今日任务**: 指向工作计划的链接
8. **项目结构**: 代码组织结构
9. **协作关系**: 与其他Agent的协作方式
10. **关键里程碑**: 重要时间节点
11. **进度报告格式**: 报告模板
12. **相关文档**: 相关文档链接

## 与Skill文件的关系

- **启动提示词文件** (`agent-prompts/*.md`): 包含启动Agent的完整提示词，可以直接使用
- **Skill文件** (`skills/agent-*/SKILL.md`): 包含结构化的skill定义，可以在Claude中作为skill引用

两者配合使用：
- 启动Agent时使用启动提示词文件
- 在对话中引用skill来获取特定Agent的能力

## 与工作计划的关系

每个启动提示词文件都指向 `digital_bank_poc_workplan.md`，Agent需要：

1. 查看工作计划中对应Day的任务
2. 执行具体的任务清单
3. 按照交付标准完成工作
4. 向Agent 0报告进度

## 启动流程

1. **选择Agent**: 根据任务需要选择对应的Agent
2. **读取启动提示词**: 读取对应的启动提示词文件
3. **引用Skill**: 使用对应的skill获取完整能力
4. **查看工作计划**: 查看当前Day的具体任务
5. **开始工作**: 执行任务并定期报告进度

## 示例

### 启动Agent 1（Day 3）

```
请使用 agent-1-core-bank skill，并阅读 agent-prompts/agent-1-startup.md。
今天是Day 3，请查看 digital_bank_poc_workplan.md 中Day 3的任务：
- 实现Account实体和Repository
- 实现AccountService业务逻辑
- 实现AccountController REST API
- 编写单元测试（覆盖率≥70%）

请开始执行这些任务。
```

## 相关文档

- 项目计划: `../digital_bank_poc_plan.md`
- 详细工作计划: `../digital_bank_poc_workplan.md`
- Agent启动提示词（汇总）: `../agent_prompts.md`
- Agent技能定义: `../skills/`

---

**版本**: v1.0.0  
**创建日期**: 2026-01-26  
**维护者**: Digital Bank POC Team
