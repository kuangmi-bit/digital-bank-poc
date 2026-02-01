"""
风控 ES 读写 - 聚合 count_1h/24h、daily_accumulated、黑名单查询、risk_events 写入
ES 不可用时：读操作返回降级值（0、0.0、False、[]），写操作忽略并记日志
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import Any, List, Optional, Tuple

from elasticsearch import AsyncElasticsearch

from src.models.blacklist import RISK_BLACKLIST_INDEX
from src.models.risk_events import RISK_EVENTS_INDEX

logger = logging.getLogger(__name__)

def _parse_window_to_timedelta(window: str) -> timedelta:
    w = (window or "5m").strip().lower()
    try:
        if w.endswith("s"):
            return timedelta(seconds=float(w[:-1]))
        if w.endswith("m"):
            return timedelta(minutes=float(w[:-1]))
        if w.endswith("h"):
            return timedelta(hours=float(w[:-1]))
        # 默认分钟
        return timedelta(minutes=float(w))
    except Exception:
        return timedelta(minutes=5)


async def get_risk_context_aggregates(
    es: Optional[AsyncElasticsearch], customer_id: str
) -> dict:
    """
    单次 ES 查询获取 count_1h、count_24h、daily_accumulated，用于规则上下文与性能优化。
    ES 不可用或失败返回 {"count_1h": 0, "count_24h": 0, "daily_accumulated": 0.0}。
    """
    if not es:
        return {"count_1h": 0, "count_24h": 0, "daily_accumulated": 0.0}
    try:
        now = datetime.now(timezone.utc)
        since_1h = (now - timedelta(hours=1)).isoformat()
        since_24h = (now - timedelta(hours=24)).isoformat()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        body = {
            "size": 0,
            "query": {"term": {"customer_id": customer_id}},
            "aggs": {
                "count_1h": {"filter": {"range": {"timestamp": {"gte": since_1h}}}},
                "count_24h": {"filter": {"range": {"timestamp": {"gte": since_24h}}}},
                "daily_sum": {
                    "filter": {"range": {"timestamp": {"gte": today_start}}},
                    "aggs": {"s": {"sum": {"field": "amount"}}},
                },
            },
        }
        r = await es.search(index=RISK_EVENTS_INDEX, body=body)
        aggs = r.get("aggregations") or {}
        c1 = (aggs.get("count_1h") or {}).get("doc_count", 0) or 0
        c24 = (aggs.get("count_24h") or {}).get("doc_count", 0) or 0
        daily = float(((aggs.get("daily_sum") or {}).get("s") or {}).get("value") or 0.0)
        return {"count_1h": int(c1), "count_24h": int(c24), "daily_accumulated": daily}
    except Exception as e:
        logger.debug("get_risk_context_aggregates failed: %s", e)
        return {"count_1h": 0, "count_24h": 0, "daily_accumulated": 0.0}


async def get_count_1h(es: Optional[AsyncElasticsearch], customer_id: str) -> int:
    """过去 1 小时该 customer 的 risk_events 条数；ES 失败返回 0."""
    if not es:
        return 0
    try:
        since = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
        r = await es.count(
            index=RISK_EVENTS_INDEX,
            body={"query": {"bool": {"must": [{"term": {"customer_id": customer_id}}, {"range": {"timestamp": {"gte": since}}}]}}},
        )
        return int(r.get("count", 0))
    except Exception as e:
        logger.debug("get_count_1h failed: %s", e)
        return 0


async def get_count_24h(es: Optional[AsyncElasticsearch], customer_id: str) -> int:
    """过去 24 小时该 customer 的 risk_events 条数；ES 失败返回 0."""
    if not es:
        return 0
    try:
        since = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
        r = await es.count(
            index=RISK_EVENTS_INDEX,
            body={"query": {"bool": {"must": [{"term": {"customer_id": customer_id}}, {"range": {"timestamp": {"gte": since}}}]}}},
        )
        return int(r.get("count", 0))
    except Exception as e:
        logger.debug("get_count_24h failed: %s", e)
        return 0


async def get_daily_accumulated(es: Optional[AsyncElasticsearch], customer_id: str) -> float:
    """当日该 customer 在 risk_events 中 amount 之和；ES 失败返回 0.0."""
    if not es:
        return 0.0
    try:
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        r = await es.search(
            index=RISK_EVENTS_INDEX,
            body={
                "size": 0,
                "query": {"bool": {"must": [{"term": {"customer_id": customer_id}}, {"range": {"timestamp": {"gte": today_start}}}]}},
                "aggs": {"sum_amount": {"sum": {"field": "amount"}}},
            },
        )
        return float((r.get("aggregations") or {}).get("sum_amount", {}).get("value") or 0)
    except Exception as e:
        logger.debug("get_daily_accumulated failed: %s", e)
        return 0.0


async def check_in_blacklist(
    es: Optional[AsyncElasticsearch], customer_id: str, account_id: Optional[str], check_types: List[str]
) -> bool:
    """检查 customer_id 或 account_id 是否在 risk_blacklist 中（is_active=true，未过期）；ES 失败返回 False."""
    if not es or not check_types:
        return False
    try:
        now = datetime.now(timezone.utc).isoformat()
        expiry_ok = {"bool": {"should": [{"bool": {"must_not": {"exists": {"field": "expires_at"}}}}, {"range": {"expires_at": {"gt": now}}}]}}
        should: list[dict] = []
        for t, v in [("customer", customer_id), ("account", account_id)]:
            if t in check_types and v:
                should.append({"bool": {"must": [{"term": {"type": t}}, {"term": {"value": v}}]}})
        if not should:
            return False
        r = await es.search(
            index=RISK_BLACKLIST_INDEX,
            body={
                "size": 1,
                "query": {
                    "bool": {
                        "must": [{"term": {"is_active": True}}],
                        "filter": [expiry_ok],
                        "should": should,
                        "minimum_should_match": 1,
                    }
                },
            },
        )
        total = (r.get("hits") or {}).get("total") or 0
        if isinstance(total, dict):
            total = total.get("value", 0)
        return int(total or 0) > 0
    except Exception as e:
        logger.debug("check_in_blacklist failed: %s", e)
        return False


async def search_blacklist(
    es: Optional[AsyncElasticsearch], type_filter: Optional[str], page: int, page_size: int
) -> Tuple[List[dict], int]:
    """分页查询 risk_blacklist，返回 (items, total)。ES 失败则 raise，由上层返回 503."""
    if not es:
        raise RuntimeError("Elasticsearch not available")
    size = max(1, min(100, page_size))
    from_ = (max(1, page) - 1) * size
    q = {"bool": {"must": [{"term": {"is_active": True}}]}}
    if type_filter:
        q["bool"]["must"].append({"term": {"type": type_filter}})
    try:
        r = await es.search(
            index=RISK_BLACKLIST_INDEX,
            body={"from": from_, "size": size, "query": q, "sort": [{"created_at": "desc"}]},
        )
        hits = (r.get("hits") or {})
        total = hits.get("total") or 0
        if isinstance(total, dict):
            total = total.get("value", 0)
        items = [{"id": h.get("_id"), **(h.get("_source") or {})} for h in hits.get("hits", [])]
        return items, int(total)
    except Exception as e:
        logger.warning("search_blacklist failed: %s", e)
        raise


async def get_report(
    es: Optional[AsyncElasticsearch], from_date: str, to_date: str
) -> dict:
    """
    风控报告：按时间范围聚合 risk_events，返回 total、by_decision、by_risk_level、avg_risk_score、top_triggered_rules。
    from_date、to_date 为 ISO 日期或日期时间；仅日期时自动补 00:00:00 / 23:59:59.999。
    ES 不可用时 raise，由 Controller 返回 503.
    """
    if not es:
        raise RuntimeError("Elasticsearch not available")
    gte = from_date if len(from_date) > 10 else f"{from_date}T00:00:00"
    lte = to_date if len(to_date) > 10 else f"{to_date}T23:59:59.999"
    try:
        body = {
            "size": 0,
            "query": {"range": {"timestamp": {"gte": gte, "lte": lte}}},
            "aggs": {
                "by_decision": {"terms": {"field": "decision", "size": 10}},
                "by_risk_level": {"terms": {"field": "risk_level", "size": 10}},
                "by_transaction_type": {"terms": {"field": "transaction_type", "size": 20}},
                "by_reject_error_code": {"terms": {"field": "reject_error_code", "size": 20}},
                "avg_risk_score": {"avg": {"field": "risk_score"}},
                "latency_ms": {"percentiles": {"field": "processing_time_ms", "percents": [50, 95, 99]}},
                "top_triggered_rules": {"terms": {"field": "triggered_rules", "size": 20}},
                "daily": {"date_histogram": {"field": "timestamp", "calendar_interval": "1d"}, "aggs": {"by_decision": {"terms": {"field": "decision", "size": 5}}}},
            },
        }
        r = await es.search(index=RISK_EVENTS_INDEX, body=body)
        total = (r.get("hits") or {}).get("total") or 0
        if isinstance(total, dict):
            total = total.get("value", 0)
        total = int(total)
        aggs = r.get("aggregations") or {}
        by_dec = {b["key"]: b["doc_count"] for b in (aggs.get("by_decision") or {}).get("buckets") or []}
        by_lev = {b["key"]: b["doc_count"] for b in (aggs.get("by_risk_level") or {}).get("buckets") or []}
        by_type = {b["key"]: b["doc_count"] for b in (aggs.get("by_transaction_type") or {}).get("buckets") or []}
        by_ec = {b["key"]: b["doc_count"] for b in (aggs.get("by_reject_error_code") or {}).get("buckets") or []}
        avg_sc = float((aggs.get("avg_risk_score") or {}).get("value") or 0.0)
        latency_vals = ((aggs.get("latency_ms") or {}).get("values") or {})
        top_rules = [{"rule": b["key"], "count": b["doc_count"]} for b in (aggs.get("top_triggered_rules") or {}).get("buckets") or []]
        daily = []
        for b in (aggs.get("daily") or {}).get("buckets") or []:
            bd = {x["key"]: x["doc_count"] for x in (b.get("by_decision") or {}).get("buckets") or []}
            daily.append(
                {
                    "date": b.get("key_as_string"),
                    "total": b.get("doc_count", 0),
                    "approve": int(bd.get("approve") or 0),
                    "reject": int(bd.get("reject") or 0),
                }
            )
        approve_count = int(by_dec.get("approve") or 0)
        reject_count = int(by_dec.get("reject") or 0)
        return {
            "from_date": from_date,
            "to_date": to_date,
            "total_count": total,
            "approve_count": approve_count,
            "reject_count": reject_count,
            "approve_rate": (approve_count / total if total else 0.0),
            "by_decision": by_dec,
            "by_risk_level": by_lev,
            "by_transaction_type": by_type,
            "by_reject_error_code": by_ec,
            "avg_risk_score": round(avg_sc, 2),
            "p50_processing_time_ms": int(latency_vals.get("50.0") or 0),
            "p95_processing_time_ms": int(latency_vals.get("95.0") or 0),
            "p99_processing_time_ms": int(latency_vals.get("99.0") or 0),
            "top_triggered_rules": top_rules,
            "daily": daily,
        }
    except RuntimeError:
        raise
    except Exception as e:
        logger.warning("get_report failed: %s", e)
        raise RuntimeError("Elasticsearch not available") from e


async def get_realtime_stats(es: Optional[AsyncElasticsearch], window: str = "5m") -> dict:
    """
    实时风控监控（ES）：最近窗口聚合 + 1 分钟粒度时间序列。
    ES 不可用时 raise，由上层降级处理。
    """
    if not es:
        raise RuntimeError("Elasticsearch not available")
    now = datetime.now(timezone.utc)
    since = (now - _parse_window_to_timedelta(window)).isoformat()
    try:
        body = {
            "size": 0,
            "query": {"range": {"timestamp": {"gte": since}}},
            "aggs": {
                "by_decision": {"terms": {"field": "decision", "size": 10}},
                "by_risk_level": {"terms": {"field": "risk_level", "size": 10}},
                "by_transaction_type": {"terms": {"field": "transaction_type", "size": 20}},
                "by_reject_error_code": {"terms": {"field": "reject_error_code", "size": 20}},
                "top_triggered_rules": {"terms": {"field": "triggered_rules", "size": 20}},
                "latency_ms": {"percentiles": {"field": "processing_time_ms", "percents": [50, 95, 99]}},
                "timeseries": {
                    "date_histogram": {"field": "timestamp", "fixed_interval": "1m"},
                    "aggs": {"by_decision": {"terms": {"field": "decision", "size": 5}}},
                },
            },
        }
        r = await es.search(index=RISK_EVENTS_INDEX, body=body)
        total = (r.get("hits") or {}).get("total") or 0
        if isinstance(total, dict):
            total = total.get("value", 0)
        total = int(total or 0)
        aggs = r.get("aggregations") or {}
        by_dec = {b["key"]: b["doc_count"] for b in (aggs.get("by_decision") or {}).get("buckets") or []}
        approve = int(by_dec.get("approve") or 0)
        reject = int(by_dec.get("reject") or 0)
        latency_vals = ((aggs.get("latency_ms") or {}).get("values") or {})
        timeseries = []
        for b in (aggs.get("timeseries") or {}).get("buckets") or []:
            bd = {x["key"]: x["doc_count"] for x in (b.get("by_decision") or {}).get("buckets") or []}
            timeseries.append(
                {
                    "ts": b.get("key_as_string"),
                    "total": b.get("doc_count", 0),
                    "approve": int(bd.get("approve") or 0),
                    "reject": int(bd.get("reject") or 0),
                }
            )
        return {
            "window": window,
            "since": since,
            "total_count": total,
            "approve_count": approve,
            "reject_count": reject,
            "reject_rate": (reject / total if total else 0.0),
            "by_decision": by_dec,
            "by_risk_level": {b["key"]: b["doc_count"] for b in (aggs.get("by_risk_level") or {}).get("buckets") or []},
            "by_transaction_type": {b["key"]: b["doc_count"] for b in (aggs.get("by_transaction_type") or {}).get("buckets") or []},
            "by_reject_error_code": {b["key"]: b["doc_count"] for b in (aggs.get("by_reject_error_code") or {}).get("buckets") or []},
            "p50_processing_time_ms": int(latency_vals.get("50.0") or 0),
            "p95_processing_time_ms": int(latency_vals.get("95.0") or 0),
            "p99_processing_time_ms": int(latency_vals.get("99.0") or 0),
            "top_triggered_rules": [{"rule": b["key"], "count": b["doc_count"]} for b in (aggs.get("top_triggered_rules") or {}).get("buckets") or []],
            "timeseries_1m": timeseries,
        }
    except Exception as e:
        logger.warning("get_realtime_stats failed: %s", e)
        raise RuntimeError("Elasticsearch not available") from e


async def index_risk_event(
    es: Optional[AsyncElasticsearch],
    customer_id: str,
    account_id: Optional[str],
    amount: float,
    transaction_type: str,
    decision: str,
    risk_score: float,
    *,
    decision_id: Optional[str] = None,
    processing_time_ms: Optional[int] = None,
    triggered_rules: Optional[List[str]] = None,
    risk_level: Optional[str] = None,
    reject_error_code: Optional[str] = None,
) -> None:
    """写入一条风控决策到 risk_events；ES 失败仅记日志. 扩展字段与 SKILL RiskDecisionLog 对齐."""
    if not es:
        return
    doc: dict = {
        "customer_id": customer_id,
        "account_id": account_id or "",
        "amount": amount,
        "transaction_type": transaction_type,
        "event_type": "decision",
        "decision": decision,
        "risk_score": risk_score,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    if decision_id is not None:
        doc["decision_id"] = decision_id
    if processing_time_ms is not None:
        doc["processing_time_ms"] = int(processing_time_ms)
    if triggered_rules is not None:
        doc["triggered_rules"] = list(triggered_rules)
    if risk_level is not None:
        doc["risk_level"] = str(risk_level)
    if reject_error_code is not None:
        doc["reject_error_code"] = str(reject_error_code)
    try:
        await es.index(index=RISK_EVENTS_INDEX, document=doc)
    except Exception as e:
        logger.warning("index_risk_event failed: %s", e)
