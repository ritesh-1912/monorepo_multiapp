/**
 * Toast context and hook for global notifications. Provider wraps the app; use toast() to show messages.
 */
'use client';

import * as React from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'default';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  toast: (message: string, type?: ToastType, duration?: number) => void;
  remove: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const typeStyles: Record<ToastType, string> = {
  success: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200',
  error: 'border-destructive/50 bg-destructive/10 text-destructive',
  info: 'border-primary/50 bg-primary/10 text-primary',
  default: 'border-border bg-card text-card-foreground',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const remove = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (message: string, type: ToastType = 'default', duration = 5000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      if (duration > 0) {
        setTimeout(() => remove(id), duration);
      }
    },
    [remove]
  );

  const value = React.useMemo(() => ({ toasts, toast, remove }), [toasts, toast, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) return null;
  const { toasts, remove } = ctx;
  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center rounded-lg border px-4 py-3 text-sm shadow-lg ${typeStyles[t.type]}`}
          role="alert"
        >
          <span className="flex-1">{t.message}</span>
          <button
            type="button"
            onClick={() => remove(t.id)}
            className="ml-2 rounded p-1 opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
