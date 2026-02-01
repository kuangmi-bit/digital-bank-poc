"""
黑名单数据结构 - 模型与 Elasticsearch 索引映射
遵循 naming-conventions: 索引 risk_blacklist，字段 snake_case
"""
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class BlacklistType(str, Enum):
    """黑名单类型."""

    CUSTOMER = "customer"
    ACCOUNT = "account"
    CARD = "card"
    IP = "ip"
    DEVICE = "device"


class BlacklistEntry(BaseModel):
    """黑名单条目 - 内存与 API 传输用."""

    id: Optional[str] = Field(None, description="唯一 ID，如 ES _id")
    type: BlacklistType = Field(..., description="黑名单类型")
    value: str = Field(..., description="标识值，如 customer_id、account_number、ip")
    reason: Optional[str] = Field(None, description="列入原因")
    source: Optional[str] = Field(None, description="来源，如 MANUAL、RULE、PARTNER")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = Field(None, description="过期时间，空表示永久")
    is_active: bool = True

    model_config = {"json_schema_extra": {"example": {"type": "customer", "value": "cust-001", "reason": "欺诈"}}}


# Elasticsearch 索引 risk_blacklist 的映射 (snake_case)
RISK_BLACKLIST_INDEX = "risk_blacklist"

RISK_BLACKLIST_MAPPING = {
    "mappings": {
        "properties": {
            "type": {"type": "keyword"},
            "value": {"type": "keyword"},
            "reason": {"type": "text"},
            "source": {"type": "keyword"},
            "created_at": {"type": "date"},
            "expires_at": {"type": "date"},
            "is_active": {"type": "boolean"},
        }
    },
    "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 0,
    },
}
