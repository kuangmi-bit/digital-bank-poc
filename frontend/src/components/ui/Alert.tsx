import type { ReactNode } from 'react';

export type AlertVariant = 'error' | 'success' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  /** 主文案 */
  children: ReactNode;
  /** 额外 class */
  className?: string;
  /** 是否可关闭；若提供 onDismiss 则显示关闭按钮 */
  onDismiss?: () => void;
}

const variantClasses: Record<AlertVariant, string> = {
  error: 'bg-red-50 border-red-200 text-red-800',
  success: 'bg-primary-50 border-primary-200 text-primary-800',
  info: 'bg-neutral-surface border-neutral-border text-neutral-text',
};

export function Alert({ variant = 'error', children, className = '', onDismiss }: AlertProps) {
  const base = 'px-4 py-3 rounded border text-sm font-medium';
  const combined = `${base} ${variantClasses[variant]} ${className}`.trim();

  return (
    <div className={combined} role="alert">
      <div className="flex items-start justify-between gap-2">
        <span>{children}</span>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 p-0.5 rounded hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="关闭"
          >
            <span className="text-lg leading-none" aria-hidden>×</span>
          </button>
        )}
      </div>
    </div>
  );
}
