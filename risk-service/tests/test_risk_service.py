"""RiskService 单元测试：mock ES 与 repository."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from src.models.schemas import RiskCheckRequest, RiskLevel
from src.services.risk_service import RiskService


@pytest.mark.asyncio
async def test_check_risk_approve(temp_rules_path):
    with (
        patch("src.services.risk_service.get_es_client", new_callable=AsyncMock, return_value=MagicMock()),
        patch("src.services.risk_service.get_risk_context_aggregates", new_callable=AsyncMock, return_value={"count_1h": 0, "count_24h": 0, "daily_accumulated": 0.0}),
        patch("src.services.risk_service.check_in_blacklist", new_callable=AsyncMock, return_value=False),
        patch("src.services.risk_service.index_risk_event", new_callable=AsyncMock, return_value=None),
    ):
        svc = RiskService(rules_path=temp_rules_path)
        req = RiskCheckRequest(customer_id="c1", amount=100.0, transaction_type="transfer")
        resp = await svc.check_risk(req)
    assert resp.approved is True
    assert resp.risk_level == RiskLevel.LOW
    assert resp.reject_error_code is None


@pytest.mark.asyncio
async def test_check_risk_reject_limit(temp_rules_path):
    with (
        patch("src.services.risk_service.get_es_client", new_callable=AsyncMock, return_value=MagicMock()),
        patch("src.services.risk_service.get_risk_context_aggregates", new_callable=AsyncMock, return_value={"count_1h": 0, "count_24h": 0, "daily_accumulated": 0.0}),
        patch("src.services.risk_service.check_in_blacklist", new_callable=AsyncMock, return_value=False),
        patch("src.services.risk_service.index_risk_event", new_callable=AsyncMock, return_value=None),
    ):
        svc = RiskService(rules_path=temp_rules_path)
        req = RiskCheckRequest(customer_id="c1", amount=10000.0, transaction_type="transfer")
        resp = await svc.check_risk(req)
    assert resp.approved is False
    assert resp.reject_error_code == "RKB003"


@pytest.mark.asyncio
async def test_check_risk_reject_blacklist(temp_rules_path):
    with (
        patch("src.services.risk_service.get_es_client", new_callable=AsyncMock, return_value=MagicMock()),
        patch("src.services.risk_service.get_risk_context_aggregates", new_callable=AsyncMock, return_value={"count_1h": 0, "count_24h": 0, "daily_accumulated": 0.0}),
        patch("src.services.risk_service.check_in_blacklist", new_callable=AsyncMock, return_value=True),
        patch("src.services.risk_service.index_risk_event", new_callable=AsyncMock, return_value=None),
    ):
        svc = RiskService(rules_path=temp_rules_path)
        req = RiskCheckRequest(customer_id="c1", amount=100.0, transaction_type="transfer")
        resp = await svc.check_risk(req)
    assert resp.approved is False
    assert resp.reject_error_code == "RKB002"


@pytest.mark.asyncio
async def test_list_blacklist_raises():
    with (
        patch("src.services.risk_service.get_es_client", new_callable=AsyncMock, return_value=MagicMock()),
        patch("src.services.risk_service.search_blacklist", new_callable=AsyncMock, side_effect=RuntimeError("ES down")),
    ):
        svc = RiskService(rules_path="config/rules.yaml")
        with pytest.raises(RuntimeError):
            await svc.list_blacklist(None, 1, 20)
