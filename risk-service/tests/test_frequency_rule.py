"""频率规则单元测试."""
import pytest

from src.rules.frequency_rule import evaluate_frequency


def test_frequency_under():
    rule = {"condition": {"max_count": 10, "window": "1h"}}
    ctx = {"count_1h": 5}
    m, _ = evaluate_frequency(rule, ctx)
    assert m is False


def test_frequency_over_1h():
    rule = {"condition": {"max_count": 10, "window": "1h"}}
    ctx = {"count_1h": 11}
    m, msg = evaluate_frequency(rule, ctx)
    assert m is True
    assert msg


def test_frequency_over_24h():
    rule = {"condition": {"max_count": 50, "window": "24h"}}
    ctx = {"count_24h": 51}
    m, _ = evaluate_frequency(rule, ctx)
    assert m is True


def test_frequency_fallback_count_in_window():
    rule = {"condition": {"max_count": 3, "window": "1h"}}
    ctx = {"count_in_window": 4}
    m, _ = evaluate_frequency(rule, ctx)
    assert m is True


def test_frequency_no_max_count():
    rule = {"condition": {"window": "1h"}}
    ctx = {"count_1h": 999}
    m, _ = evaluate_frequency(rule, ctx)
    assert m is False
