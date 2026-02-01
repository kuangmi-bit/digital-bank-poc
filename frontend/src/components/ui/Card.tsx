import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** 标题，显示在卡片顶部 */
  title?: ReactNode;
  /** 是否显示顶 accent 条 */
  accentBar?: boolean;
}

export function Card({
  children,
  title,
  accentBar = false,
  className = '',
  ...rest
}: CardProps) {
  const base = 'rounded bg-neutral-surface border border-neutral-border shadow-card overflow-hidden transition-shadow hover:shadow-card-hover';
  const combined = `${base} ${className}`.trim();

  return (
    <div className={combined} {...rest}>
      {accentBar && (
        <div className="h-1 bg-gradient-to-r from-primary-500 to-accent-400" aria-hidden />
      )}
      {title && (
        <div className="px-4 py-3 border-b border-neutral-border">
          <h3 className="font-sans font-semibold text-neutral-text">{title}</h3>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
