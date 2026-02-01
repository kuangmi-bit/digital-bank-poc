/**
 * 格式化工具测试
 * Day 12 - P3 缺陷修复验证
 */

import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatAmount,
  formatDateTime,
  formatAccountNumber,
  formatPhone,
  formatStatus,
  formatPercentage,
} from './format';

describe('formatCurrency', () => {
  it('格式化正常金额', () => {
    expect(formatCurrency(1000)).toBe('¥1,000.00');
    expect(formatCurrency(1234.56)).toBe('¥1,234.56');
  });

  it('格式化字符串金额', () => {
    expect(formatCurrency('1000')).toBe('¥1,000.00');
    expect(formatCurrency('1234.56')).toBe('¥1,234.56');
  });

  it('处理空值', () => {
    expect(formatCurrency(null)).toBe('-');
    expect(formatCurrency(undefined)).toBe('-');
  });

  it('处理无效值', () => {
    expect(formatCurrency('invalid')).toBe('-');
    expect(formatCurrency(NaN)).toBe('-');
  });

  it('不带货币符号', () => {
    expect(formatCurrency(1000, 'CNY', { showSymbol: false })).toBe('1,000.00');
  });

  it('自定义小数位', () => {
    expect(formatCurrency(1000.123, 'CNY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })).toBe('¥1,000');
  });
});

describe('formatAmount', () => {
  it('格式化金额不带符号', () => {
    expect(formatAmount(1000)).toBe('1,000.00');
    expect(formatAmount(1234.56)).toBe('1,234.56');
  });
});

describe('formatDateTime', () => {
  it('格式化完整日期时间', () => {
    const result = formatDateTime('2026-02-05T10:30:00Z', 'full');
    expect(result).toContain('2026');
    expect(result).toContain('02');
    expect(result).toContain('05');
  });

  it('格式化日期', () => {
    const result = formatDateTime('2026-02-05T10:30:00Z', 'date');
    expect(result).toContain('2026');
  });

  it('处理空值', () => {
    expect(formatDateTime(null)).toBe('-');
    expect(formatDateTime(undefined)).toBe('-');
  });

  it('处理无效日期', () => {
    expect(formatDateTime('invalid')).toBe('-');
  });
});

describe('formatAccountNumber', () => {
  it('脱敏账户号', () => {
    expect(formatAccountNumber('6212345678901234')).toBe('6212****1234');
  });

  it('处理短账户号', () => {
    expect(formatAccountNumber('123456')).toBe('123456');
  });

  it('处理空值', () => {
    expect(formatAccountNumber(null)).toBe('-');
    expect(formatAccountNumber(undefined)).toBe('-');
  });
});

describe('formatPhone', () => {
  it('脱敏手机号', () => {
    expect(formatPhone('13812345678')).toBe('138****5678');
  });

  it('处理短号码', () => {
    expect(formatPhone('12345')).toBe('12345');
  });

  it('处理空值', () => {
    expect(formatPhone(null)).toBe('-');
  });
});

describe('formatStatus', () => {
  it('格式化账户状态', () => {
    expect(formatStatus('active', 'account')).toBe('正常');
    expect(formatStatus('frozen', 'account')).toBe('冻结');
  });

  it('格式化交易状态', () => {
    expect(formatStatus('completed', 'transaction')).toBe('已完成');
    expect(formatStatus('failed', 'transaction')).toBe('失败');
  });

  it('格式化预约状态', () => {
    expect(formatStatus('pending', 'scheduled')).toBe('待执行');
    expect(formatStatus('cancelled', 'scheduled')).toBe('已取消');
  });

  it('处理未知状态', () => {
    expect(formatStatus('unknown', 'transaction')).toBe('unknown');
  });

  it('处理空值', () => {
    expect(formatStatus(null)).toBe('-');
  });
});

describe('formatPercentage', () => {
  it('格式化小数为百分比', () => {
    expect(formatPercentage(0.5)).toBe('50.00%');
    expect(formatPercentage(0.1234)).toBe('12.34%');
  });

  it('格式化已经是百分比的数值', () => {
    expect(formatPercentage(50, true)).toBe('50.00%');
    expect(formatPercentage(12.34, true)).toBe('12.34%');
  });

  it('处理空值', () => {
    expect(formatPercentage(null)).toBe('-');
    expect(formatPercentage(undefined)).toBe('-');
  });
});
