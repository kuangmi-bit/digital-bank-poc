"""
限额规则 - 检查 amount 单笔、单日累计是否超过规则配置的阈值
遵循 naming-conventions: 函数 snake_case
context 需提供 amount、daily_accumulated（由 RiskService 从 ES 聚合后注入，ES 不可用时为 0）
"""
from typing import Any, Dict, Optional, Tuple


def evaluate_limit(rule: Dict[str, Any], context: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    限额规则：
    - max_amount / max_single_amount：单笔 amount > 则命中
    - max_daily_amount：daily_accumulated + amount > 则命中
    - transaction_types：可选，仅当 context.transaction_type 在该列表时才评估
    返回 (matched, message).
    """
    cond = rule.get("condition") or {}
    ttypes = cond.get("transaction_types")
    if ttypes is not None and not (isinstance(ttypes, list) and (context.get("transaction_type") or "").lower() in [str(t).lower() for t in ttypes]):
        return False, None
    amount = context.get("amount")
    if amount is None:
        return False, None
    try:
        am = float(amount)
    except (TypeError, ValueError):
        return False, None

    max_amount = cond.get("max_amount") or cond.get("max_single_amount")
    if max_amount is not None:
        try:
            if am > float(max_amount):
                return True, rule.get("message") or f"超过单笔限额 {max_amount}"
        except (TypeError, ValueError):
            pass

    max_daily = cond.get("max_daily_amount")
    if max_daily is not None:
        daily = float(context.get("daily_accumulated") or 0)
        try:
            if daily + am > float(max_daily):
                return True, rule.get("message") or f"超过单日限额 {max_daily}"
        except (TypeError, ValueError):
            pass
    return False, None
