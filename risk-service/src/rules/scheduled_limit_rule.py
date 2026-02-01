"""
预约转账限额规则 - ADR-008
检查待执行预约转账笔数限制
遵循 naming-conventions: 函数 snake_case
context 需提供 pending_scheduled_count（由 RiskService 注入）
"""
from typing import Any, Dict, Optional, Tuple


def evaluate_scheduled_limit(rule: Dict[str, Any], context: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    预约转账限额规则：
    - max_pending_count：待执行预约转账笔数上限
    返回 (matched, message).
    """
    cond = rule.get("condition") or {}

    # 检查待执行预约笔数
    max_pending_count = cond.get("max_pending_count")
    if max_pending_count is not None:
        pending_count = context.get("pending_scheduled_count")
        if pending_count is not None:
            try:
                if int(pending_count) >= int(max_pending_count):
                    return True, rule.get("message") or f"待执行预约转账笔数超过限制 {max_pending_count}"
            except (TypeError, ValueError):
                pass

    return False, None
