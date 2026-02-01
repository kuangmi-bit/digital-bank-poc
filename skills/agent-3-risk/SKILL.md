---
name: agent-3-risk
version: 1.0.0
description: 风控合规守护者Agent技能 - 负责实现交易限额检查、风控规则引擎和黑名单管理功能。使用Python 3.11 + FastAPI + Elasticsearch 8.x技术栈。
author: Digital Bank POC Team
license: MIT
keywords:
  - python
  - fastapi
  - elasticsearch
  - risk-control
  - compliance
  - rule-engine
  - blacklist
  - security
---

# Agent 3: 风控合规守护者 🛡️

## 概述

Agent 3负责实现交易限额检查、风控规则引擎和黑名单管理功能。使用Python 3.11 + FastAPI + Elasticsearch 8.x技术栈，提供实时风控检查服务。

## 何时使用

当需要：
- 实现风控规则引擎
- 检查交易限额和频率
- 管理黑名单
- 计算风险评分
- 记录风控日志

## 技术栈

- **语言**: Python 3.11
- **框架**: FastAPI
- **搜索引擎**: Elasticsearch 8.x
- **测试**: pytest
- **API文档**: OpenAPI 3.0（FastAPI自动生成）

## 核心功能（MVP）

### 1. 风控规则引擎
- 限额检查规则
- 频率检查规则
- 黑名单检查规则
- 规则链执行引擎
- 风险评分算法

### 2. 风控API
- 风控检查: `POST /api/v1/risk/check`
- 黑名单查询: `GET /api/v1/risk/blacklist`
- 风控报告: `GET /api/v1/risk/report`

### 3. 风控日志
- 风控日志记录（Elasticsearch）
- 实时风控监控

## 自动化能力

- **规则引擎**: 65%自动化
  - 风控规则自动加载（YAML配置）
  - 黑名单自动管理
  - 风险评分自动计算

## 交付标准

- **API数量**: 8-10个
- **规则数量**: 10-15条
- **代码行数**: 约3000行
- **响应时间**: P95 < 500ms（风控检查）

## 项目结构

```
risk-service/
├── src/
│   ├── services/        # 业务逻辑（risk_service.py）
│   ├── controllers/     # API控制器（risk_controller.py）
│   ├── rules/           # 规则引擎（rule_engine.py）
│   └── models/          # 数据模型
├── config/
│   └── rules.yaml       # 风控规则配置（10-15条）
├── tests/               # 测试代码
└── docs/
    └── openapi.yaml     # API文档（FastAPI自动生成）
```

## 技术标准规范要求

**重要**: 必须严格遵循技术标准规范和命名规范。

### 必须遵循的规范文档

1. **技术标准规范 v1.0**: `docs/architecture/technical-standards-v1.0.md`
2. **命名规范 v1.0**: `docs/architecture/naming-conventions.md`

## 代码规范

- 遵循FastAPI最佳实践
- **严格遵循技术标准规范中的Python代码规范**
- **严格遵循命名规范**
- 使用Pydantic进行数据验证
- 规则配置使用YAML格式
- 日志使用Python logging
- 所有API自动生成OpenAPI文档

### 命名规范要点

- **文件名**: snake_case (如 `risk_service.py`, `rule_engine.py`)
- **类名**: PascalCase (如 `RiskService`, `RuleEngine`)
- **函数名**: snake_case (如 `check_risk()`, `evaluate_rule()`)
- **变量名**: snake_case (如 `risk_score`, `transaction_amount`)
- **常量**: UPPER_SNAKE_CASE (如 `MAX_AMOUNT`, `RISK_THRESHOLD`)
- **API路径**: kebab-case (如 `/api/v1/risk/check`)
- **Elasticsearch索引**: snake_case (如 `risk_events`)

## 协作关系

- **与Agent 1**: 提供风控检查API（转账前检查）
- **与Agent 2**: 提供风控检查API（支付前检查）
- **与Agent 5**: 通过API Gateway暴露服务
- **与Agent 6**: 提供API测试接口
- **与Agent 9**: 使用Elasticsearch存储风控日志

## 关键里程碑

- **Day 2**: 项目骨架和规则引擎框架完成
- **Day 3**: 基础风控规则完成（限额、频率、黑名单）
- **Day 4**: 风险评分和规则链完成
- **Day 5**: 性能优化完成
- **Day 7**: 风控功能完整实现

## 规则配置示例

```yaml
rules:
  - name: daily_limit_check
    type: limit
    condition: amount > 50000
    action: reject
    message: "超过单日限额"
  
  - name: frequency_check
    type: frequency
    condition: count > 10 in 1h
    action: reject
    message: "交易频率过高"
  
  - name: blacklist_check
    type: blacklist
    condition: userId in blacklist
    action: reject
    message: "用户已被列入黑名单"
```

## 示例代码结构

### Service示例
```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, List

# 遵循命名规范: PascalCase类名
class RiskCheckRequest(BaseModel):  # 遵循命名规范: Request后缀
    user_id: str  # 遵循命名规范: snake_case字段名
    amount: float
    transaction_type: str  # 遵循命名规范: snake_case
    customer_id: str

# 遵循命名规范: PascalCase类名
class RiskService:
    def __init__(self):
        self.rules = self.load_rules()  # 遵循命名规范: snake_case变量名
    
    def check_risk(self, request: RiskCheckRequest) -> Dict:  # 遵循命名规范: snake_case方法名
        # 执行规则链
        for rule in self.rules:
            result = rule.evaluate(request)
            if result['action'] == 'reject':
                return result
        return {'action': 'approve', 'score': 0}
```

### Controller示例
```python
from fastapi import FastAPI
from .services.risk_service import RiskService, RiskCheckRequest

app = FastAPI()
risk_service = RiskService()  # 遵循命名规范: snake_case变量名

# 遵循命名规范: API路径kebab-case
@app.post("/api/v1/risk/check")
async def check_risk(request: RiskCheckRequest):  # 遵循命名规范: snake_case函数名
    result = risk_service.check_risk(request)
    return {
        'code': 200,
        'message': 'Success',
        'data': result,
        'timestamp': datetime.utcnow().isoformat()
    }
```

## 错误码定义

### Risk服务错误码

| 错误码 | 描述 | HTTP状态码 | 处理建议 |
|-------|------|-----------|---------|
| `RKB001` | 风控拦截 | 403 | 交易被风控规则拦截 |
| `RKB002` | 用户在黑名单 | 403 | 用户已被列入黑名单 |
| `RKB003` | 超过交易限额 | 400 | 交易金额超过限额 |
| `RKB004` | 交易频率过高 | 429 | 交易频率超限 |
| `RKB005` | 风险评分过高 | 403 | 风险评分超过阈值 |
| `RKV001` | 参数格式无效 | 400 | 检查请求参数 |
| `RKS001` | 规则引擎异常 | 500 | 联系运维 |
| `RKS002` | Elasticsearch不可用 | 503 | ES服务异常 |

---

## 规则热更新机制

### 规则版本管理

```yaml
# config/rules.yaml
version: "1.2.0"
updated_at: "2026-01-26T10:00:00Z"
rules:
  - id: "RULE_001"
    name: "daily_limit_check"
    version: "1.0"
    enabled: true
    priority: 1
    type: "limit"
    condition:
      field: "amount"
      operator: ">"
      value: 50000
    action: "reject"
    message: "超过单日限额"
```

### 热更新实现

```python
import yaml
import hashlib
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import threading

class RuleManager:
    def __init__(self, rules_path: str):
        self.rules_path = rules_path
        self.rules = []
        self.rules_version = None
        self.rules_hash = None
        self._lock = threading.RLock()
        self._load_rules()
        self._start_watcher()

    def _load_rules(self):
        """加载规则配置"""
        with open(self.rules_path, 'r', encoding='utf-8') as f:
            content = f.read()
            config = yaml.safe_load(content)

        new_hash = hashlib.md5(content.encode()).hexdigest()

        with self._lock:
            if new_hash != self.rules_hash:
                self.rules = config.get('rules', [])
                self.rules_version = config.get('version')
                self.rules_hash = new_hash
                print(f"Rules reloaded: version={self.rules_version}")

    def _start_watcher(self):
        """启动文件监控，自动热更新"""
        # 使用watchdog监控rules.yaml变化
        pass

    def get_rules(self):
        with self._lock:
            return self.rules.copy()
```

---

## 风控决策日志

### 决策日志结构

```python
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class RiskDecisionLog(BaseModel):
    decision_id: str          # 决策ID
    timestamp: datetime       # 时间戳
    user_id: str             # 用户ID
    transaction_id: str      # 交易ID
    amount: float            # 金额
    decision: str            # APPROVE / REJECT / REVIEW
    risk_score: float        # 综合风险评分
    risk_level: str          # LOW / MEDIUM / HIGH / CRITICAL
    triggered_rules: List[str]  # 触发的规则
    processing_time_ms: int  # 处理耗时(毫秒)
```

### Elasticsearch日志写入

```python
async def log_decision(self, decision: RiskDecisionLog):
    """记录风控决策日志到Elasticsearch"""
    index_name = f"risk_decisions-{datetime.now().strftime('%Y.%m')}"
    await self.es.index(
        index=index_name,
        document=decision.dict(),
        id=decision.decision_id
    )
```

---

## 指标埋点

### Prometheus指标定义

```python
from prometheus_client import Counter, Histogram, Gauge

# 风控检查计数器
risk_check_total = Counter(
    'risk_check_total',
    'Total number of risk checks',
    ['decision', 'risk_level']
)

# 风控检查耗时直方图
risk_check_duration = Histogram(
    'risk_check_duration_seconds',
    'Risk check processing time',
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0]
)

# 规则命中计数器
rule_hit_total = Counter(
    'rule_hit_total',
    'Total number of rule hits',
    ['rule_id', 'rule_name']
)

# 黑名单数量
blacklist_size = Gauge(
    'blacklist_size',
    'Current size of blacklist',
    ['type']
)
```

---

## 健康检查

```python
@router.get("/health")
async def health_check():
    checks = {"status": "healthy", "checks": {}}

    # Elasticsearch检查
    try:
        await es_client.ping()
        checks["checks"]["elasticsearch"] = {"status": "up"}
    except Exception as e:
        checks["checks"]["elasticsearch"] = {"status": "down"}
        checks["status"] = "unhealthy"

    return checks
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
