import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  /** 紧凑模式，减小内边距 */
  compact?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500 border-transparent',
  secondary: 'bg-neutral-surface-2 text-neutral-text hover:bg-neutral-border border border-neutral-border',
  outline: 'bg-transparent text-primary-500 border-2 border-primary-500 hover:bg-primary-50',
  ghost: 'bg-transparent text-neutral-text-soft hover:bg-neutral-surface-2 border-transparent',
};

export function Button({
  children,
  variant = 'primary',
  compact = false,
  className = '',
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const padding = compact ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-base';
  const combined = `${base} ${padding} ${variantClasses[variant]} ${className}`.trim();

  return (
    <button
      type={type}
      className={combined}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
