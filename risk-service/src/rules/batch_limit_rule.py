"""
批量转账限额规则 - ADR-008
检查批量转账的总额、笔数、单日批次数限制
遵循 naming-conventions: 函数 snake_case
context 需提供 batch_total_amount、batch_count、daily_batch_count（由 RiskService 注入）
"""
from typing import Any, Dict, Optional, Tuple


def evaluate_batch_limit(rule: Dict[str, Any], context: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    批量转账限额规则：
    - max_batch_total：单批转账总额限制
    - max_batch_count：单批转账笔数限制
    - max_daily_batch_count：单日批次数限制
    返回 (matched, message).
    """
    cond = rule.get("condition") or {}

    # 检查单批转账总额
    max_batch_total = cond.get("max_batch_total")
    if max_batch_total is not None:
        batch_total = context.get("batch_total_amount")
        if batch_total is not None:
            try:
                if float(batch_total) > float(max_batch_total):
                    return True, rule.get("message") or f"批量转账总额超过限额 {max_batch_total}"
            except (TypeError, ValueError):
                pass

    # 检查单批转账笔数
    max_batch_count = cond.get("max_batch_count")
    if max_batch_count is not None:
        batch_count = context.get("batch_count")
        if batch_count is not None:
            try:
                if int(batch_count) > int(max_batch_count):
                    return True, rule.get("message") or f"批量转账笔数超过限制 {max_batch_count}"
            except (TypeError, ValueError):
                pass

    # 检查单日批次数
    max_daily_batch_count = cond.get("max_daily_batch_count")
    if max_daily_batch_count is not None:
        daily_batch_count = context.get("daily_batch_count")
        if daily_batch_count is not None:
            try:
                if int(daily_batch_count) >= int(max_daily_batch_count):
                    return True, rule.get("message") or f"单日批量转账批次超过限制 {max_daily_batch_count}"
            except (TypeError, ValueError):
                pass

    return False, None
