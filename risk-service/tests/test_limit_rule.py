"""限额规则单元测试."""
import pytest

from src.rules.limit_rule import evaluate_limit


def test_limit_not_matched_below():
    rule = {"condition": {"max_amount": 50000}, "message": "超限"}
    ctx = {"amount": 1000}
    m, msg = evaluate_limit(rule, ctx)
    assert m is False
    assert msg is None


def test_limit_matched_above():
    rule = {"condition": {"max_amount": 50000}, "message": "超限"}
    ctx = {"amount": 60000}
    m, msg = evaluate_limit(rule, ctx)
    assert m is True
    assert "超限" in (msg or "")


def test_limit_max_single_amount():
    rule = {"condition": {"max_single_amount": 1000}}
    ctx = {"amount": 1001}
    m, _ = evaluate_limit(rule, ctx)
    assert m is True


def test_limit_daily_accumulated_under():
    rule = {"condition": {"max_daily_amount": 100000}}
    ctx = {"amount": 1000, "daily_accumulated": 50000}
    m, _ = evaluate_limit(rule, ctx)
    assert m is False


def test_limit_daily_accumulated_over():
    rule = {"condition": {"max_daily_amount": 100000}}
    ctx = {"amount": 1000, "daily_accumulated": 99500}
    m, _ = evaluate_limit(rule, ctx)
    assert m is True


def test_limit_no_amount():
    rule = {"condition": {"max_amount": 100}}
    ctx = {}
    m, _ = evaluate_limit(rule, ctx)
    assert m is False


def test_limit_transaction_types_skip():
    """transaction_types 存在且 context.transaction_type 不在列表中时不评估."""
    rule = {"condition": {"max_amount": 1000, "transaction_types": ["payment"]}}
    ctx = {"amount": 5000, "transaction_type": "transfer"}
    m, _ = evaluate_limit(rule, ctx)
    assert m is False


def test_limit_transaction_types_apply():
    """transaction_types 匹配时按 max_amount 评估."""
    rule = {"condition": {"max_amount": 1000, "transaction_types": ["payment"]}}
    ctx = {"amount": 5000, "transaction_type": "payment"}
    m, _ = evaluate_limit(rule, ctx)
    assert m is True
