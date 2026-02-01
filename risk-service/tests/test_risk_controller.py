"""RiskController 单元测试：FastAPI TestClient，Mock RiskService."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from src.main import app
from src.controllers.risk_controller import get_risk_service
from src.models.schemas import RiskCheckResponse, RiskLevel


@pytest.fixture(autouse=True)
def patch_es_lifespan():
    """避免 lifespan 连接真实 ES."""
    with (
        patch("src.main.get_es_client", new_callable=AsyncMock, return_value=MagicMock()),
        patch("src.main.ensure_risk_blacklist_index", new_callable=AsyncMock, return_value=None),
        patch("src.main.ensure_risk_events_index", new_callable=AsyncMock, return_value=None),
    ):
        yield


@pytest.fixture
def mock_svc_approve():
    m = AsyncMock()
    m.check_risk.return_value = RiskCheckResponse(
        approved=True, risk_score=10.0, risk_level=RiskLevel.LOW, triggered_rules=[]
    )
    m.list_blacklist.return_value = ([], 0)
    return m


@pytest.fixture
def client_override(mock_svc_approve):
    def _get():
        return mock_svc_approve

    app.dependency_overrides[get_risk_service] = _get
    yield
    app.dependency_overrides.pop(get_risk_service, None)


def test_check_approve(client_override, mock_svc_approve):
    with TestClient(app) as c:
        r = c.post("/api/v1/risk/check", json={"customer_id": "c1", "amount": 100.0, "transaction_type": "transfer"})
    assert r.status_code == 200
    d = r.json()
    assert d.get("code") == 200
    assert d.get("data", {}).get("approved") is True


def test_check_reject(client_override, mock_svc_approve):
    mock_svc_approve.check_risk.return_value = RiskCheckResponse(
        approved=False, risk_score=50.0, risk_level=RiskLevel.MEDIUM, message="超过单笔限额", reject_error_code="RKB003", triggered_rules=["limit_5k"]
    )
    with TestClient(app) as c:
        r = c.post("/api/v1/risk/check", json={"customer_id": "c1", "amount": 99999.0, "transaction_type": "transfer"})
    assert r.status_code == 403
    d = r.json()
    assert d.get("errorCode") == "RKB003"


def test_blacklist_ok(client_override, mock_svc_approve):
    mock_svc_approve.list_blacklist.return_value = ([{"id": "1", "type": "customer", "value": "c1", "is_active": True}], 1)
    with TestClient(app) as c:
        r = c.get("/api/v1/risk/blacklist?page=1&pageSize=20")
    assert r.status_code == 200
    d = r.json()
    assert d.get("data", {}).get("total") == 1
    assert len(d.get("data", {}).get("items", [])) == 1


def test_blacklist_503(client_override, mock_svc_approve):
    mock_svc_approve.list_blacklist.side_effect = RuntimeError("ES down")
    with TestClient(app) as c:
        r = c.get("/api/v1/risk/blacklist?page=1&pageSize=20")
    assert r.status_code == 503
    assert r.json().get("errorCode") == "RKS002"


def test_report_ok(client_override, mock_svc_approve):
    mock_svc_approve.get_report = AsyncMock(
        return_value={
            "from_date": "2026-01-01",
            "to_date": "2026-01-27",
            "total_count": 100,
            "approve_count": 80,
            "reject_count": 20,
            "approve_rate": 0.8,
            "by_decision": {"approve": 80, "reject": 20},
            "by_risk_level": {"low": 70, "medium": 20, "high": 10},
            "avg_risk_score": 25.5,
            "top_triggered_rules": [{"rule": "single_amount_limit", "count": 15}],
        }
    )
    with TestClient(app) as c:
        r = c.get("/api/v1/risk/report?from_date=2026-01-01&to_date=2026-01-27")
    assert r.status_code == 200
    d = r.json()
    assert d.get("code") == 200
    assert d.get("data", {}).get("total_count") == 100
    assert d.get("data", {}).get("approve_rate") == 0.8


def test_report_503(client_override, mock_svc_approve):
    mock_svc_approve.get_report = AsyncMock(side_effect=RuntimeError("ES down"))
    with TestClient(app) as c:
        r = c.get("/api/v1/risk/report?from_date=2026-01-01&to_date=2026-01-27")
    assert r.status_code == 503
    assert r.json().get("errorCode") == "RKS002"


def test_realtime_monitor_ok(client_override, mock_svc_approve):
    mock_svc_approve.get_realtime_monitor = AsyncMock(
        return_value={"window": "5m", "in_memory": {"total_count": 1}, "es": None, "es_available": False}
    )
    with TestClient(app) as c:
        r = c.get("/api/v1/risk/monitor/realtime?window=5m")
    assert r.status_code == 200
    d = r.json()
    assert d.get("code") == 200
    assert d.get("data", {}).get("window") == "5m"
