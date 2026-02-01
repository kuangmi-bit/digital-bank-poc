"""规则引擎单元测试."""
import pytest

from src.rules.rule_engine import RuleEngine


def test_engine_approve(temp_rules_path):
    engine = RuleEngine(rules_path=temp_rules_path)
    ctx = {"amount": 100, "count_1h": 0, "count_24h": 0, "in_blacklist": False}
    r = engine.evaluate(ctx)
    assert r["action"] == "approve"
    assert "reject_error_code" not in r or r.get("reject_error_code") is None


def test_engine_reject_limit(temp_rules_path):
    engine = RuleEngine(rules_path=temp_rules_path)
    ctx = {"amount": 10000, "count_1h": 0, "count_24h": 0, "in_blacklist": False}
    r = engine.evaluate(ctx)
    assert r["action"] == "reject"
    assert r.get("reject_error_code") == "RKB003"
    assert "limit_5k" in r.get("triggered_rules", [])


def test_engine_reject_frequency(temp_rules_path):
    engine = RuleEngine(rules_path=temp_rules_path)
    ctx = {"amount": 100, "count_1h": 3, "count_24h": 0, "in_blacklist": False}
    r = engine.evaluate(ctx)
    assert r["action"] == "reject"
    assert r.get("reject_error_code") == "RKB004"


def test_engine_reject_blacklist(temp_rules_path):
    engine = RuleEngine(rules_path=temp_rules_path)
    ctx = {"amount": 100, "count_1h": 0, "count_24h": 0, "in_blacklist": True}
    r = engine.evaluate(ctx)
    assert r["action"] == "reject"
    assert r.get("reject_error_code") == "RKB002"
