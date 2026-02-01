"""
批量转账限额规则单元测试 - ADR-008
遵循 naming-conventions: test_should_xxx_when_yyy
"""
import pytest
from src.rules.batch_limit_rule import evaluate_batch_limit


class TestBatchLimitRule:
    """批量转账限额规则测试"""

    def test_should_reject_when_batch_total_exceeds_limit(self):
        """批量转账总额超过限制时应拒绝"""
        rule = {
            "name": "batch_total_limit",
            "type": "batch_limit",
            "condition": {"max_batch_total": 500000},
            "message": "批量转账总额超过限额",
        }
        context = {"batch_total_amount": 600000}
        matched, msg = evaluate_batch_limit(rule, context)
        assert matched is True
        assert "总额超过限额" in msg

    def test_should_approve_when_batch_total_within_limit(self):
        """批量转账总额在限制内时应通过"""
        rule = {
            "name": "batch_total_limit",
            "type": "batch_limit",
            "condition": {"max_batch_total": 500000},
        }
        context = {"batch_total_amount": 100000}
        matched, msg = evaluate_batch_limit(rule, context)
        assert matched is False
        assert msg is None

    def test_should_reject_when_batch_count_exceeds_limit(self):
        """批量转账笔数超过限制时应拒绝"""
        rule = {
            "name": "batch_count_limit",
            "type": "batch_limit",
            "condition": {"max_batch_count": 100},
            "message": "批量转账笔数超过限制",
        }
        context = {"batch_count": 150}
        matched, msg = evaluate_batch_limit(rule, context)
        assert matched is True
        assert "笔数超过限制" in msg

    def test_should_approve_when_batch_count_within_limit(self):
        """批量转账笔数在限制内时应通过"""
        rule = {
            "name": "batch_count_limit",
            "type": "batch_limit",
            "condition": {"max_batch_count": 100},
        }
        context = {"batch_count": 50}
        matched, msg = evaluate_batch_limit(rule, context)
        assert matched is False
        assert msg is None

    def test_should_reject_when_daily_batch_count_exceeds_limit(self):
        """单日批次数超过限制时应拒绝"""
        rule = {
            "name": "daily_batch_limit",
            "type": "batch_limit",
            "condition": {"max_daily_batch_count": 10},
            "message": "单日批量转账批次超过限制",
        }
        context = {"daily_batch_count": 10}  # >= 10 时拒绝
        matched, msg = evaluate_batch_limit(rule, context)
        assert matched is True
        assert "批次超过限制" in msg

    def test_should_approve_when_daily_batch_count_within_limit(self):
        """单日批次数在限制内时应通过"""
        rule = {
            "name": "daily_batch_limit",
            "type": "batch_limit",
            "condition": {"max_daily_batch_count": 10},
        }
        context = {"daily_batch_count": 5}
        matched, msg = evaluate_batch_limit(rule, context)
        assert matched is False
        assert msg is None

    def test_should_approve_when_context_missing_batch_fields(self):
        """上下文缺少批量字段时应通过（静默处理）"""
        rule = {
            "name": "batch_limit",
            "type": "batch_limit",
            "condition": {"max_batch_total": 500000, "max_batch_count": 100},
        }
        context = {"amount": 1000}  # 无批量相关字段
        matched, msg = evaluate_batch_limit(rule, context)
        assert matched is False
        assert msg is None

    def test_should_check_multiple_conditions(self):
        """多条件同时存在时应按顺序检查"""
        rule = {
            "name": "multi_batch_limit",
            "type": "batch_limit",
            "condition": {
                "max_batch_total": 500000,
                "max_batch_count": 100,
                "max_daily_batch_count": 10,
            },
            "message": "批量转账限制",
        }
        # 总额超限
        context1 = {"batch_total_amount": 600000, "batch_count": 50, "daily_batch_count": 5}
        matched, _ = evaluate_batch_limit(rule, context1)
        assert matched is True

        # 笔数超限
        context2 = {"batch_total_amount": 100000, "batch_count": 150, "daily_batch_count": 5}
        matched, _ = evaluate_batch_limit(rule, context2)
        assert matched is True

        # 批次数超限
        context3 = {"batch_total_amount": 100000, "batch_count": 50, "daily_batch_count": 10}
        matched, _ = evaluate_batch_limit(rule, context3)
        assert matched is True

        # 全部通过
        context4 = {"batch_total_amount": 100000, "batch_count": 50, "daily_batch_count": 5}
        matched, _ = evaluate_batch_limit(rule, context4)
        assert matched is False
