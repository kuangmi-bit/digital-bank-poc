"""
风控规则引擎框架 - 加载 YAML 规则，按优先级执行，返回通过/拒绝及触发的规则
规则链：全部规则执行完毕后，若综合评分 >= score_reject_threshold 则拒绝，错误码 RKB005
遵循 naming-conventions: 类 PascalCase，函数/变量 snake_case
"""
import logging
import threading
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import yaml

from src.rules.limit_rule import evaluate_limit
from src.rules.frequency_rule import evaluate_frequency
from src.rules.blacklist_rule import evaluate_blacklist
from src.rules.batch_limit_rule import evaluate_batch_limit
from src.rules.scheduled_limit_rule import evaluate_scheduled_limit
from src.services.risk_scoring import apply_contextual, should_reject_by_score

logger = logging.getLogger(__name__)

# 规则 type -> 拒绝时的默认 error_code（可被 rule.error_code 覆盖）
_DEFAULT_REJECT_ERROR_CODES = {
    "limit": "RKB003",
    "frequency": "RKB004",
    "blacklist": "RKB002",
    "batch_limit": "RKB003",
    "scheduled_limit": "RKB003",
}


class RuleEngine:
    """
    风控规则引擎：从 YAML 加载规则，按 priority 排序后依次执行。
    任一规则 action=reject 则立即返回；否则继续，最后汇总 risk_score，
    再叠加 contextual 评分；若 >= score_reject_threshold 则拒绝，错误码 RKB005。
    """

    def __init__(self, rules_path: Optional[str] = None):
        self._rules_path = rules_path or "config/rules.yaml"
        self._rules: List[Dict[str, Any]] = []
        self._enabled_rules: List[Dict[str, Any]] = []
        self._score_reject_threshold: float = 75.0
        self._rules_lock = threading.RLock()
        self._rules_mtime_ns: int | None = None
        self._last_reload_check_ts: float = 0.0
        # 规则热更新检查间隔（秒）：避免每次 evaluate 都 stat 文件
        self._reload_check_interval_sec: float = 2.0
        self._load_rules()

    def _maybe_reload_rules(self) -> None:
        """按间隔检查 rules.yaml 是否变更，若变更则热更新（线程安全）。"""
        now = time.monotonic()
        if now - self._last_reload_check_ts < self._reload_check_interval_sec:
            return
        self._last_reload_check_ts = now
        try:
            p = Path(self._rules_path)
            if not p.exists():
                return
            mtime_ns = p.stat().st_mtime_ns
        except Exception:
            return
        if self._rules_mtime_ns is None or mtime_ns != self._rules_mtime_ns:
            self._load_rules()

    def _load_rules(self) -> None:
        with self._rules_lock:
            p = Path(self._rules_path)
            if not p.exists():
                logger.warning("Rules file not found: %s, using empty rules", self._rules_path)
                self._rules = []
                self._enabled_rules = []
                self._rules_mtime_ns = None
                return
            self._rules_mtime_ns = p.stat().st_mtime_ns
            with open(p, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f) or {}
            self._rules = data.get("rules", [])
            self._score_reject_threshold = float(data.get("score_reject_threshold") or 75.0)
            # 按 priority 升序，未配置的视为 999；预过滤 enabled 以优化执行
            self._rules.sort(key=lambda r: r.get("priority", 999))
            self._enabled_rules = [r for r in self._rules if r.get("enabled", True)]
            logger.info(
                "Loaded %d rules from %s, score_reject_threshold=%.0f",
                len(self._rules),
                self._rules_path,
                self._score_reject_threshold,
            )

    def reload_rules(self) -> None:
        """重新加载规则（可用于热更新）. """
        self._load_rules()

    def _evaluate_one(self, rule: Dict[str, Any], context: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """
        执行单条规则，返回 (是否命中拒绝, 拒绝信息).
        未命中或为 approve 返回 (False, None).
        """
        rtype = (rule.get("type") or "").lower()
        if rtype == "limit":
            return evaluate_limit(rule, context)
        if rtype == "frequency":
            return evaluate_frequency(rule, context)
        if rtype == "blacklist":
            return evaluate_blacklist(rule, context)
        if rtype == "batch_limit":
            return evaluate_batch_limit(rule, context)
        if rtype == "scheduled_limit":
            return evaluate_scheduled_limit(rule, context)
        return False, None

    def evaluate(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        执行规则链，返回:
        - action: "approve" | "reject"
        - message: 拒绝时的原因
        - risk_score: 0-100（规则链结束后叠加 contextual，RKB005 时亦为叠加后）
        - triggered_rules: 触发的规则 name 列表
        """
        triggered: List[str] = []
        risk_score = 0.0

        self._maybe_reload_rules()

        # 读路径：仅持有短锁，避免阻塞并发
        with self._rules_lock:
            enabled_rules = list(self._enabled_rules)
            score_reject_threshold = float(self._score_reject_threshold)

        for rule in enabled_rules:
            name = rule.get("name", "unnamed")
            matched, msg = self._evaluate_one(rule, context)
            if matched:
                triggered.append(name)
                action = (rule.get("action") or "reject").lower()
                if action == "reject":
                    rtype = (rule.get("type") or "").lower()
                    reject_error_code = rule.get("error_code") or _DEFAULT_REJECT_ERROR_CODES.get(rtype, "RKB001")
                    return {
                        "action": "reject",
                        "message": msg or rule.get("message", "规则命中"),
                        "risk_score": min(100.0, risk_score + (rule.get("risk_score_add", 0) or 0)),
                        "triggered_rules": triggered,
                        "reject_error_code": reject_error_code,
                    }
                # warn / review 等可叠加分数后继续
                risk_score += rule.get("risk_score_add", 10) or 10

        # 规则链结束后叠加 contextual，并检查 RKB005 阈值
        final_score = apply_contextual(min(100.0, risk_score), context)
        if should_reject_by_score(final_score, score_reject_threshold):
            return {
                "action": "reject",
                "message": "风险评分过高",
                "risk_score": final_score,
                "triggered_rules": triggered,
                "reject_error_code": "RKB005",
            }
        return {
            "action": "approve",
            "message": None,
            "risk_score": final_score,
            "triggered_rules": triggered,
        }
