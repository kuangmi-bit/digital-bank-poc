"""
风险评分算法 -  contextual 加成、等级划分、RKB005 阈值拒绝
遵循 naming-conventions、agent-3-risk SKILL
"""
from typing import Dict, Any

from src.models.schemas import RiskLevel

# 综合评分超过此阈值时拒绝，错误码 RKB005
DEFAULT_REJECT_THRESHOLD = 75.0


def apply_contextual(engine_score: float, context: Dict[str, Any]) -> float:
    """
    在规则引擎得分基础上叠加 contextual 因素，返回 0–100 的最终评分。
    - 金额因子：amount 越高加成越多（例如 >1 万起算）
    - 频率因子：count_1h、count_24h 越高加成越多，封顶
    """
    score = float(engine_score or 0)
    amount = float(context.get("amount") or 0)
    count_1h = int(context.get("count_1h") or 0)
    count_24h = int(context.get("count_24h") or 0)

    if amount >= 10000:
        amount_factor = min(15.0, (amount - 10000) / 50000 * 15)
        score += amount_factor
    if count_1h > 0:
        score += min(10.0, count_1h * 1.5)
    if count_24h > 5:
        score += min(10.0, (count_24h - 5) * 0.5)
    return min(100.0, max(0.0, score))


def score_to_level(score: float) -> RiskLevel:
    """将 0–100 评分映射为 RiskLevel."""
    s = float(score or 0)
    if s >= 80:
        return RiskLevel.CRITICAL
    if s >= 60:
        return RiskLevel.HIGH
    if s >= 30:
        return RiskLevel.MEDIUM
    return RiskLevel.LOW


def should_reject_by_score(score: float, threshold: float | None = None) -> bool:
    """综合评分 >= 阈值则应按 RKB005 拒绝."""
    t = float(threshold) if threshold is not None else DEFAULT_REJECT_THRESHOLD
    return float(score or 0) >= t
