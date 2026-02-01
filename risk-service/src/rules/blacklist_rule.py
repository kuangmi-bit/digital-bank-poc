"""
黑名单检查规则 - 检查 context.in_blacklist 是否为 True
遵循 naming-conventions: 函数 snake_case
context.in_blacklist 由 RiskService 从 ES risk_blacklist 查询后注入；ES 不可用时为 False（降级放行）
"""
from typing import Any, Dict, Optional, Tuple


def evaluate_blacklist(rule: Dict[str, Any], context: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    黑名单规则：若 context["in_blacklist"] 为 True 则命中.
    condition.check_types 可选，用于说明检查的维度（如 customer、account），逻辑由上游注入 in_blacklist 时已考虑.
    返回 (matched, message).
    """
    if not context.get("in_blacklist"):
        return False, None
    return True, rule.get("message") or "用户在黑名单中"
