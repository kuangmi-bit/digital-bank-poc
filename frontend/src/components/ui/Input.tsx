import type { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 标签文案 */
  label?: ReactNode;
  /** 错误信息，显示时边框与文案为红色 */
  error?: string;
  /** 辅助说明 */
  hint?: ReactNode;
}

export function Input({
  label,
  error,
  hint,
  id: idProp,
  className = '',
  ...rest
}: InputProps) {
  const id = idProp || `input-${Math.random().toString(36).slice(2, 9)}`;
  const hasError = Boolean(error);

  const inputClass = [
    'w-full px-3 py-2 rounded border bg-neutral-surface font-sans text-neutral-text',
    'placeholder:text-neutral-muted',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 focus:border-primary-500',
    hasError
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
      : 'border-neutral-border',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-neutral-text-soft mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={inputClass}
        aria-invalid={hasError}
        aria-describedby={hint ? `${id}-hint` : error ? `${id}-error` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-neutral-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
