"""
风控事件索引结构 - 用于 frequency 聚合与单日累计，以及决策日志
遵循 naming-conventions: 索引 risk_events，字段 snake_case
与 SKILL RiskDecisionLog 对齐：decision_id、processing_time_ms、triggered_rules、risk_level
"""
RISK_EVENTS_INDEX = "risk_events"

RISK_EVENTS_MAPPING = {
    "mappings": {
        "properties": {
            "customer_id": {"type": "keyword"},
            "account_id": {"type": "keyword"},
            "amount": {"type": "float"},
            "transaction_type": {"type": "keyword"},
            "event_type": {"type": "keyword"},
            "decision": {"type": "keyword"},
            "risk_score": {"type": "float"},
            "risk_level": {"type": "keyword"},
            "triggered_rules": {"type": "keyword"},
            "reject_error_code": {"type": "keyword"},
            "decision_id": {"type": "keyword"},
            "processing_time_ms": {"type": "integer"},
            "timestamp": {"type": "date"},
        }
    },
    "settings": {"number_of_shards": 1, "number_of_replicas": 0},
}
