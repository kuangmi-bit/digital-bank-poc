"""黑名单规则单元测试."""
import pytest

from src.rules.blacklist_rule import evaluate_blacklist


def test_blacklist_not_in():
    rule = {"message": "用户在黑名单中"}
    ctx = {"in_blacklist": False}
    m, _ = evaluate_blacklist(rule, ctx)
    assert m is False


def test_blacklist_in():
    rule = {"message": "用户在黑名单中"}
    ctx = {"in_blacklist": True}
    m, msg = evaluate_blacklist(rule, ctx)
    assert m is True
    assert "黑名单" in (msg or "")


def test_blacklist_in_no_message():
    rule = {"type": "blacklist"}
    ctx = {"in_blacklist": True}
    m, msg = evaluate_blacklist(rule, ctx)
    assert m is True
    assert msg
