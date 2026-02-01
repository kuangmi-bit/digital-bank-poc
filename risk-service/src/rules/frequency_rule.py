"""
频率规则 - 检查在时间窗口内次数是否超限
遵循 naming-conventions: 函数 snake_case
context 需提供 count_1h、count_24h（由 RiskService 从 ES risk_events 聚合）；ES 不可用时为 0。兼容 count_in_window.
"""
from typing import Any, Dict, Optional, Tuple


def _get_count_for_window(context: Dict[str, Any], window: str) -> int:
    w = (window or "").strip().lower()
    if "1h" in w or w == "1h":
        return int(context.get("count_1h") or context.get("count_in_window") or 0)
    if "24" in w or "1d" in w or w == "24h":
        return int(context.get("count_24h") or context.get("count_in_window") or 0)
    return int(context.get("count_in_window") or 0)


def evaluate_frequency(rule: Dict[str, Any], context: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    频率规则：根据 condition.window 取 context.count_1h 或 count_24h，若 > max_count 则命中.
    返回 (matched, message).
    """
    cond = rule.get("condition") or {}
    max_count = cond.get("max_count")
    if max_count is None:
        return False, None
    try:
        mc = int(max_count)
    except (TypeError, ValueError):
        return False, None
    cnt = _get_count_for_window(context, cond.get("window", "1h"))
    if cnt > mc:
        window = cond.get("window", "1h")
        return True, rule.get("message") or f"交易频率过高，{window} 内不得超过 {mc} 笔"
    return False, None
