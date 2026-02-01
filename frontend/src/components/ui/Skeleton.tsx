import type { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** 矩形宽度，默认 100% */
  width?: string | number;
  /** 矩形高度 */
  height?: string | number;
  /** 圆角 */
  rounded?: 'none' | 'sm' | 'DEFAULT' | 'full';
}

const roundedClasses = { none: 'rounded-none', sm: 'rounded-sm', DEFAULT: 'rounded', full: 'rounded-full' };

export function Skeleton({
  width,
  height = 20,
  rounded = 'DEFAULT',
  className = '',
  style,
  ...rest
}: SkeletonProps) {
  const s = { width, height: typeof height === 'number' ? `${height}px` : height, ...style };
  return (
    <div
      className={`animate-pulse bg-neutral-border ${roundedClasses[rounded]} ${className}`.trim()}
      style={s}
      aria-hidden
      {...rest}
    />
  );
}

/** 多行骨架，用于列表、段落 */
export function SkeletonLines({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`.trim()}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} height={16} width={i === lines - 1 && lines > 1 ? '75%' : undefined} />
      ))}
    </div>
  );
}

/** 账户列表骨架屏 */
export function AccountListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex justify-between items-center py-2 border-b border-neutral-border last:border-0">
          <Skeleton width={140} height={14} />
          <Skeleton width={100} height={14} />
        </div>
      ))}
    </div>
  );
}

/** 总余额卡片骨架 */
export function BalanceCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton width={80} height={14} />
      <Skeleton width={160} height={28} />
    </div>
  );
}

/** 交易表格骨架屏 */
export function TransactionTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-border text-left">
            {['时间', '类型', '对手方', '金额', '状态', '备注'].map((h) => (
              <th key={h} className="py-2 pr-4">
                <Skeleton width={h.length * 10} height={12} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, i) => (
            <tr key={i} className="border-b border-neutral-border last:border-0">
              {Array.from({ length: 6 }, (_, j) => (
                <td key={j} className="py-2 pr-4">
                  <Skeleton width={j === 3 ? 72 : 56} height={14} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 转账表单骨架 */
export function TransferFormSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton width={80} height={14} className="mb-2" />
        <Skeleton height={40} />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <Skeleton width={i === 1 ? 100 : 60} height={14} className="mb-2" />
          <Skeleton height={40} />
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <Skeleton width={100} height={40} rounded="DEFAULT" />
        <Skeleton width={80} height={40} rounded="DEFAULT" />
      </div>
    </div>
  );
}
