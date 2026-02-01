"""
风控 API 请求/响应模型 - Pydantic
遵循 naming-conventions: 字段 snake_case；与 api-design-spec / OpenAPI 一致
"""
from datetime import datetime
from enum import Enum
from typing import Any, List, Optional

from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    """风险等级."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RiskCheckRequest(BaseModel):
    """风控检查请求 - POST /api/v1/risk/check."""

    customer_id: str = Field(..., description="客户ID")
    account_id: Optional[str] = Field(None, description="账户ID")
    amount: float = Field(..., ge=0, description="交易金额")
    transaction_type: str = Field(..., description="交易类型，如 transfer、payment")
    recipient_account_id: Optional[str] = Field(None, description="收款账户ID")
    metadata: Optional[dict[str, Any]] = Field(default_factory=dict, description="扩展信息")

    model_config = {"json_schema_extra": {"example": {"customer_id": "cust-001", "amount": 1000.0, "transaction_type": "transfer"}}}


class RiskCheckResponse(BaseModel):
    """风控检查响应."""

    approved: bool = Field(..., description="是否通过")
    risk_score: float = Field(..., ge=0, le=100, description="风险评分 0-100")
    risk_level: RiskLevel = Field(..., description="风险等级")
    message: Optional[str] = Field(None, description="拒绝或提示信息")
    triggered_rules: List[str] = Field(default_factory=list, description="触发的规则 ID/名称")
    reject_error_code: Optional[str] = Field(None, description="拒绝时的错误码 RKB002/RKB003/RKB004，仅 approved=false 时有效")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"json_schema_extra": {"example": {"approved": True, "risk_score": 10.0, "risk_level": "low", "triggered_rules": []}}}
