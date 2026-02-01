import type { ReactNode } from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: ReactNode;
}

const sizeClasses = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-neutral-border border-t-primary-600`}
        role="status"
        aria-label={text ? undefined : '加载中'}
      />
      {text != null && <p className="mt-2 text-sm text-neutral-muted">{text}</p>}
    </div>
  );
}
