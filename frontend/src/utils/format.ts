/**
 * 格式化工具
 * Day 12 - 修复 P3 缺陷：金额格式化在特定区域设置下显示异常
 */

/**
 * 格式化金额显示
 * 使用统一的 zh-CN 区域设置，避免不同浏览器/系统区域设置导致的显示差异
 *
 * @param amount 金额数值
 * @param currency 货币代码，默认 CNY
 * @param options 可选配置
 * @returns 格式化后的金额字符串
 */
export function formatCurrency(
  amount: number | string | undefined | null,
  currency: string = 'CNY',
  options?: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  if (amount === undefined || amount === null) {
    return '-';
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return '-';
  }

  const { showSymbol = true, minimumFractionDigits = 2, maximumFractionDigits = 2 } = options || {};

  try {
    // 使用固定的 zh-CN 区域设置，确保一致的格式
    const formatter = new Intl.NumberFormat('zh-CN', {
      style: showSymbol ? 'currency' : 'decimal',
      currency: currency,
      minimumFractionDigits,
      maximumFractionDigits,
    });

    return formatter.format(numAmount);
  } catch (error) {
    // 降级处理：如果 Intl 不支持，使用简单格式化
    const formatted = numAmount.toFixed(2);
    return showSymbol ? `¥${formatted}` : formatted;
  }
}

/**
 * 格式化金额（不带货币符号）
 *
 * @param amount 金额数值
 * @returns 格式化后的金额字符串
 */
export function formatAmount(amount: number | string | undefined | null): string {
  return formatCurrency(amount, 'CNY', { showSymbol: false });
}

/**
 * 格式化日期时间
 *
 * @param dateString ISO 8601 日期字符串
 * @param format 格式化模式
 * @returns 格式化后的日期字符串
 */
export function formatDateTime(
  dateString: string | undefined | null,
  format: 'full' | 'date' | 'time' | 'short' = 'full'
): string {
  if (!dateString) {
    return '-';
  }

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return '-';
    }

    const options: Intl.DateTimeFormatOptions = {
      full: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      },
      date: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      },
      time: {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      },
      short: {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      },
    }[format];

    return new Intl.DateTimeFormat('zh-CN', options).format(date);
  } catch (error) {
    return dateString;
  }
}

/**
 * 格式化账户号（脱敏显示）
 *
 * @param accountNumber 账户号
 * @returns 脱敏后的账户号
 */
export function formatAccountNumber(accountNumber: string | undefined | null): string {
  if (!accountNumber || accountNumber.length < 8) {
    return accountNumber || '-';
  }

  return `${accountNumber.slice(0, 4)}****${accountNumber.slice(-4)}`;
}

/**
 * 格式化手机号（脱敏显示）
 *
 * @param phone 手机号
 * @returns 脱敏后的手机号
 */
export function formatPhone(phone: string | undefined | null): string {
  if (!phone || phone.length < 7) {
    return phone || '-';
  }

  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

/**
 * 格式化状态显示
 *
 * @param status 状态代码
 * @param type 状态类型
 * @returns 状态显示文本
 */
export function formatStatus(
  status: string | undefined | null,
  type: 'account' | 'transaction' | 'scheduled' | 'payment' = 'transaction'
): string {
  if (!status) {
    return '-';
  }

  const statusMap: Record<string, Record<string, string>> = {
    account: {
      active: '正常',
      frozen: '冻结',
      closed: '已销户',
    },
    transaction: {
      pending: '处理中',
      completed: '已完成',
      failed: '失败',
    },
    scheduled: {
      pending: '待执行',
      processing: '执行中',
      completed: '已完成',
      failed: '失败',
      cancelled: '已取消',
    },
    payment: {
      pending: '待支付',
      completed: '已支付',
      failed: '支付失败',
    },
  };

  return statusMap[type]?.[status] || status;
}

/**
 * 格式化百分比
 *
 * @param value 数值（0-1 或 0-100）
 * @param isPercentage 是否已经是百分比（0-100）
 * @returns 格式化后的百分比字符串
 */
export function formatPercentage(
  value: number | undefined | null,
  isPercentage: boolean = false
): string {
  if (value === undefined || value === null) {
    return '-';
  }

  const percentage = isPercentage ? value : value * 100;
  return `${percentage.toFixed(2)}%`;
}

/**
 * 格式化文件大小
 *
 * @param bytes 字节数
 * @returns 格式化后的文件大小
 */
export function formatFileSize(bytes: number | undefined | null): string {
  if (bytes === undefined || bytes === null) {
    return '-';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}
