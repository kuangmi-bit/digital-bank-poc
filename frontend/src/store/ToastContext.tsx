import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
  dismiss: (id: number) => void;
}

const DEFAULT_DURATION = 4000;
let nextId = 0;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback((type: ToastType, message: string, duration = DEFAULT_DURATION) => {
    const id = ++nextId;
    const item: ToastItem = { id, type, message, duration };
    setToasts((prev) => [...prev, item]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    {
      success: (message: string, duration?: number) => add('success', message, duration ?? DEFAULT_DURATION),
      error: (message: string, duration?: number) => add('error', message, duration ?? DEFAULT_DURATION),
      info: (message: string, duration?: number) => add('info', message, duration ?? DEFAULT_DURATION),
    },
    [add]
  );

  const value: ToastContextValue = { toasts, toast, dismiss };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastList toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastList({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none sm:left-auto sm:right-4 sm:max-w-sm"
      role="region"
      aria-label="通知"
    >
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
}

function ToastItem({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const typeStyles = {
    success: 'bg-primary-50 border-primary-200 text-primary-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-neutral-surface border-neutral-border text-neutral-text',
  };
  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded border shadow-card ${typeStyles[item.type]} animate-[toast-in_0.25s_ease-out]`}
      role="alert"
    >
      <span className="text-sm font-medium">{item.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="shrink-0 p-1 rounded hover:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-label="关闭"
      >
        <span className="text-lg leading-none" aria-hidden>×</span>
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue['toast'] {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
}
