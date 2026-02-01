"""
实时风控监控（内存）- 用于 ES 不可用时的降级观测与快速自检。
遵循 naming-conventions: snake_case
"""
from __future__ import annotations

from collections import Counter, deque
from dataclasses import dataclass
from threading import Lock
from time import time
from typing import Iterable, Optional


@dataclass(frozen=True)
class _DecisionEvent:
    ts: float
    decision: str
    risk_level: str
    processing_time_ms: int
    triggered_rules: tuple[str, ...]
    reject_error_code: str | None
    transaction_type: str | None


_LOCK = Lock()
_EVENTS: deque[_DecisionEvent] = deque(maxlen=5000)


def _parse_window(window: str) -> int:
    w = (window or "5m").strip().lower()
    if w.endswith("ms"):
        return max(1, int(float(w[:-2]) / 1000))
    if w.endswith("s"):
        return max(1, int(float(w[:-1])))
    if w.endswith("m"):
        return max(1, int(float(w[:-1]) * 60))
    if w.endswith("h"):
        return max(1, int(float(w[:-1]) * 3600))
    # 默认按分钟
    try:
        return max(1, int(float(w) * 60))
    except Exception:
        return 300


def record_decision(
    *,
    decision: str,
    risk_level: str,
    processing_time_ms: int,
    triggered_rules: Optional[Iterable[str]] = None,
    reject_error_code: Optional[str] = None,
    transaction_type: Optional[str] = None,
) -> None:
    """记录一条内存事件（用于实时监控降级）。"""
    ev = _DecisionEvent(
        ts=time(),
        decision=str(decision or "").lower(),
        risk_level=str(risk_level or "").lower(),
        processing_time_ms=int(processing_time_ms or 0),
        triggered_rules=tuple(triggered_rules or ()),
        reject_error_code=str(reject_error_code) if reject_error_code else None,
        transaction_type=str(transaction_type) if transaction_type else None,
    )
    with _LOCK:
        _EVENTS.append(ev)


def get_snapshot(window: str = "5m") -> dict:
    """获取最近窗口的内存监控快照。"""
    seconds = _parse_window(window)
    now = time()
    cutoff = now - seconds
    with _LOCK:
        events = [e for e in _EVENTS if e.ts >= cutoff]

    total = len(events)
    by_decision = Counter(e.decision for e in events)
    by_level = Counter(e.risk_level for e in events)
    by_type = Counter((e.transaction_type or "unknown") for e in events)
    by_error = Counter((e.reject_error_code or "none") for e in events)
    rule_hits: Counter[str] = Counter()
    latencies = []
    for e in events:
        rule_hits.update(e.triggered_rules)
        latencies.append(e.processing_time_ms)
    latencies.sort()
    p95 = latencies[int(0.95 * (total - 1))] if total else 0

    approve = int(by_decision.get("approve") or 0)
    reject = int(by_decision.get("reject") or 0)
    return {
        "window": window,
        "total_count": total,
        "approve_count": approve,
        "reject_count": reject,
        "reject_rate": (reject / total if total else 0.0),
        "by_decision": dict(by_decision),
        "by_risk_level": dict(by_level),
        "by_transaction_type": dict(by_type),
        "by_reject_error_code": dict(by_error),
        "p95_processing_time_ms": int(p95),
        "top_triggered_rules": [{"rule": k, "count": v} for k, v in rule_hits.most_common(10)],
    }

