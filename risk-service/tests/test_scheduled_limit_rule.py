"""
预约转账限额规则单元测试 - ADR-008
遵循 naming-conventions: test_should_xxx_when_yyy
"""
import pytest
from src.rules.scheduled_limit_rule import evaluate_scheduled_limit


class TestScheduledLimitRule:
    """预约转账限额规则测试"""

    def test_should_reject_when_pending_count_exceeds_limit(self):
        """待执行预约笔数超过限制时应拒绝"""
        rule = {
            "name": "scheduled_pending_limit",
            "type": "scheduled_limit",
            "condition": {"max_pending_count": 20},
            "message": "待执行预约转账笔数超过限制",
        }
        context = {"pending_scheduled_count": 20}  # >= 20 时拒绝
        matched, msg = evaluate_scheduled_limit(rule, context)
        assert matched is True
        assert "超过限制" in msg

    def test_should_approve_when_pending_count_within_limit(self):
        """待执行预约笔数在限制内时应通过"""
        rule = {
            "name": "scheduled_pending_limit",
            "type": "scheduled_limit",
            "condition": {"max_pending_count": 20},
        }
        context = {"pending_scheduled_count": 10}
        matched, msg = evaluate_scheduled_limit(rule, context)
        assert matched is False
        assert msg is None

    def test_should_reject_when_pending_count_greatly_exceeds_limit(self):
        """待执行预约笔数大幅超过限制时应拒绝"""
        rule = {
            "name": "scheduled_pending_limit",
            "type": "scheduled_limit",
            "condition": {"max_pending_count": 20},
            "message": "预约过多",
        }
        context = {"pending_scheduled_count": 100}
        matched, msg = evaluate_scheduled_limit(rule, context)
        assert matched is True
        assert msg == "预约过多"

    def test_should_approve_when_context_missing_pending_count(self):
        """上下文缺少待执行笔数字段时应通过（静默处理）"""
        rule = {
            "name": "scheduled_pending_limit",
            "type": "scheduled_limit",
            "condition": {"max_pending_count": 20},
        }
        context = {"amount": 1000}  # 无 pending_scheduled_count 字段
        matched, msg = evaluate_scheduled_limit(rule, context)
        assert matched is False
        assert msg is None

    def test_should_approve_when_pending_count_is_zero(self):
        """待执行预约笔数为零时应通过"""
        rule = {
            "name": "scheduled_pending_limit",
            "type": "scheduled_limit",
            "condition": {"max_pending_count": 20},
        }
        context = {"pending_scheduled_count": 0}
        matched, msg = evaluate_scheduled_limit(rule, context)
        assert matched is False
        assert msg is None

    def test_should_approve_when_condition_missing_max_pending_count(self):
        """条件缺少 max_pending_count 时应通过"""
        rule = {
            "name": "scheduled_pending_limit",
            "type": "scheduled_limit",
            "condition": {},
        }
        context = {"pending_scheduled_count": 100}
        matched, msg = evaluate_scheduled_limit(rule, context)
        assert matched is False
        assert msg is None

    def test_should_handle_string_pending_count(self):
        """处理字符串类型的待执行笔数"""
        rule = {
            "name": "scheduled_pending_limit",
            "type": "scheduled_limit",
            "condition": {"max_pending_count": 20},
            "message": "预约过多",
        }
        context = {"pending_scheduled_count": "25"}  # 字符串
        matched, msg = evaluate_scheduled_limit(rule, context)
        assert matched is True

    def test_should_use_default_message_when_message_not_provided(self):
        """未提供 message 时使用默认消息"""
        rule = {
            "name": "scheduled_pending_limit",
            "type": "scheduled_limit",
            "condition": {"max_pending_count": 10},
        }
        context = {"pending_scheduled_count": 15}
        matched, msg = evaluate_scheduled_limit(rule, context)
        assert matched is True
        assert "10" in msg  # 默认消息包含限制值
