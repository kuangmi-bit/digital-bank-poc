"""
风控 API 控制器 - POST /check, GET /blacklist
遵循 api-design-spec、technical-standards：统一成功/错误结构，错误码 RKBxxx/RKSxxx
"""
from datetime import datetime
from functools import lru_cache

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse

from src.models.schemas import RiskCheckRequest
from src.services.risk_service import RiskService

router = APIRouter()


@lru_cache
def _get_risk_service_cached() -> RiskService:
    # 复用 RuleEngine 与其规则缓存/热更新逻辑，减少每请求初始化开销
    return RiskService()


def get_risk_service() -> RiskService:
    return _get_risk_service_cached()


def _success(data: dict) -> dict:
    return {"code": 200, "message": "Success", "data": data, "timestamp": datetime.utcnow().isoformat() + "Z"}


def _error(code: int, message: str, error_code: str = "RKS001") -> dict:
    return {"code": code, "message": message, "errorCode": error_code, "timestamp": datetime.utcnow().isoformat() + "Z"}


@router.post("/check", response_model=None)
async def check_risk(request: RiskCheckRequest, svc: RiskService = Depends(get_risk_service)):
    """
    风控检查 - 供核心银行、支付服务在转账/支付前调用.
    若 approved=false，调用方应拒绝交易；错误码 RKB002 黑名单、RKB003 超额、RKB004 频率、RKB001 其他.
    """
    try:
        resp = await svc.check_risk(request)
        if not resp.approved:
            ec = resp.reject_error_code or "RKB001"
            return JSONResponse(status_code=403, content=_error(403, resp.message or "风控拦截", ec))
        return _success(resp.model_dump(mode="json"))
    except HTTPException:
        raise
    except Exception as e:
        return JSONResponse(status_code=500, content=_error(500, str(e), "RKS001"))


@router.get("/blacklist", response_model=None)
async def list_blacklist(
    type_filter: str | None = Query(None, alias="type", description="黑名单类型: customer, account, card, ip, device"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100, alias="pageSize"),
    svc: RiskService = Depends(get_risk_service),
):
    """
    黑名单查询 - 从 risk_blacklist 索引分页查询。ES 不可用时返回 503 RKS002.
    """
    try:
        items, total = await svc.list_blacklist(type_filter, page, page_size)
        return _success({"items": items, "total": total, "page": page, "pageSize": page_size})
    except Exception as e:
        return JSONResponse(status_code=503, content=_error(503, "Elasticsearch 不可用", "RKS002"))


@router.get("/report", response_model=None)
async def get_report(
    from_date: str = Query(..., description="开始日期，ISO 日期如 2026-01-01"),
    to_date: str = Query(..., description="结束日期，ISO 日期如 2026-01-27"),
    svc: RiskService = Depends(get_risk_service),
):
    """
    风控报告 - 按时间范围聚合 risk_events：总量、通过/拒绝、风险等级分布、平均评分、 top 触发规则。
    ES 不可用时返回 503 RKS002.
    """
    try:
        data = await svc.get_report(from_date, to_date)
        return _success(data)
    except Exception as e:
        return JSONResponse(status_code=503, content=_error(503, "Elasticsearch 不可用", "RKS002"))


@router.get("/monitor/realtime", response_model=None)
async def get_realtime_monitor(
    window: str = Query("5m", description="时间窗口，如 1m/5m/15m/1h"),
    svc: RiskService = Depends(get_risk_service),
):
    """
    实时风控监控：
    - in_memory：内存窗口统计（ES 不可用也可用）
    - es：ES 聚合（可用时提供时间序列、P95 等）
    """
    data = await svc.get_realtime_monitor(window)
    return _success(data)
