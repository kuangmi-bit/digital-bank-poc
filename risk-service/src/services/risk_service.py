"""
风控业务逻辑 - 组装上下文（ES 聚合 count_1h/24h、daily_accumulated、in_blacklist）、
调用规则引擎、写 risk_events、转换为 API 响应。ES 不可用时读操作降级为 0/False，写操作忽略。
遵循 naming-conventions: risk_service.py, check_risk()
"""
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple

from src.config.elasticsearch import get_es_client
from src.config.settings import get_settings
from src.models.schemas import RiskCheckRequest, RiskCheckResponse
from src.repositories.risk_es_repository import (
    check_in_blacklist,
    get_risk_context_aggregates,
    get_report as repo_get_report,
    index_risk_event,
    search_blacklist,
)
from src.rules.rule_engine import RuleEngine
from src.services.risk_scoring import score_to_level
from src.services.risk_metrics import get_snapshot, record_decision


class RiskService:
    """风控服务：规则引擎编排、ES 聚合与降级、上下文构建、决策写入、响应封装."""

    def __init__(self, rules_path: Optional[str] = None):
        path = rules_path or get_settings().rules_config_path
        if not Path(path).is_absolute():
            base = Path(__file__).resolve().parents[2]
            path = str(base / path)
        self._engine = RuleEngine(rules_path=path)

    async def check_risk(self, request: RiskCheckRequest) -> RiskCheckResponse:
        """
        执行风控检查：从 ES 拉取 count_1h、count_24h、daily_accumulated（单次聚合）、in_blacklist（ES 不可用时降级），
        组装 context，调用规则引擎，写 risk_events（含 decision_id、processing_time_ms、triggered_rules、risk_level），
        返回 RiskCheckResponse.
        """
        t0 = time.perf_counter()
        decision_id = str(uuid.uuid4())
        es = await get_es_client()
        agg = await get_risk_context_aggregates(es, request.customer_id)
        in_blacklist = await check_in_blacklist(es, request.customer_id, request.account_id, ["customer", "account"])

        context = {
            "customer_id": request.customer_id,
            "account_id": request.account_id,
            "amount": request.amount,
            "transaction_type": request.transaction_type,
            "recipient_account_id": request.recipient_account_id,
            "count_1h": agg["count_1h"],
            "count_24h": agg["count_24h"],
            "daily_accumulated": agg["daily_accumulated"],
            "in_blacklist": in_blacklist,
            **(request.metadata or {}),
        }
        result = self._engine.evaluate(context)
        action = result.get("action", "approve")
        score = float(result.get("risk_score", 0))
        triggered = result.get("triggered_rules", [])
        reject_error_code = result.get("reject_error_code") if action != "approve" else None
        rl = score_to_level(score)

        processing_time_ms = int((time.perf_counter() - t0) * 1000)
        await index_risk_event(
            es,
            request.customer_id,
            request.account_id,
            request.amount,
            request.transaction_type,
            action,
            score,
            decision_id=decision_id,
            processing_time_ms=processing_time_ms,
            triggered_rules=triggered,
            risk_level=rl.value,
            reject_error_code=reject_error_code,
        )
        # 实时监控（内存）：即使 ES 写入失败也能观测到流量与拒绝率
        record_decision(
            decision=action,
            risk_level=rl.value,
            processing_time_ms=processing_time_ms,
            triggered_rules=triggered,
            reject_error_code=reject_error_code,
            transaction_type=request.transaction_type,
        )

        return RiskCheckResponse(
            approved=(action == "approve"),
            risk_score=score,
            risk_level=rl,
            message=result.get("message"),
            triggered_rules=triggered,
            reject_error_code=reject_error_code,
            timestamp=datetime.utcnow(),
        )

    async def list_blacklist(
        self, type_filter: Optional[str], page: int, page_size: int
    ) -> Tuple[List[dict], int]:
        """
        分页查询黑名单。ES 不可用时 search_blacklist 会 raise，由 Controller 捕获并返回 503 RKS002.
        """
        es = await get_es_client()
        return await search_blacklist(es, type_filter, page, page_size)

    async def get_report(self, from_date: str, to_date: str) -> dict:
        """
        风控报告：按时间范围聚合 risk_events。ES 不可用时 raise，由 Controller 返回 503 RKS002.
        """
        es = await get_es_client()
        return await repo_get_report(es, from_date, to_date)

    async def get_realtime_monitor(self, window: str = "5m") -> dict:
        """
        实时风控监控：
        - 内存快照（总量/拒绝率/Top 规则/耗时分布）
        - ES 聚合（若可用）：时间序列与更完整的聚合
        """
        from src.repositories.risk_es_repository import get_realtime_stats

        data = {"window": window, "in_memory": get_snapshot(window), "es": None}
        try:
            es = await get_es_client()
            data["es"] = await get_realtime_stats(es, window)
            data["es_available"] = True
        except Exception:
            data["es_available"] = False
        return data
