'use client';

import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  description?: string;
  duration: number;
}

interface ToastContextValue {
  toast: (opts: { type?: ToastType; title: string; description?: string; duration?: number }) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

const config: Record<ToastType, { icon: typeof CheckCircle2; ring: string; iconWrap: string; bar: string }> = {
  success: {
    icon: CheckCircle2,
    ring: 'border-emerald-100',
    iconWrap: 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/30',
    bar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  },
  error: {
    icon: XCircle,
    ring: 'border-rose-100',
    iconWrap: 'bg-gradient-to-br from-rose-500 to-pink-500 shadow-rose-500/30',
    bar: 'bg-gradient-to-r from-rose-500 to-pink-500',
  },
  warning: {
    icon: AlertTriangle,
    ring: 'border-amber-100',
    iconWrap: 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30',
    bar: 'bg-gradient-to-r from-amber-500 to-orange-500',
  },
  info: {
    icon: Info,
    ring: 'border-sky-100',
    iconWrap: 'bg-gradient-to-br from-sky-500 to-blue-500 shadow-blue-500/30',
    bar: 'bg-gradient-to-r from-sky-500 to-blue-500',
  },
};

function ToastCard({ toast, onClose }: { toast: Toast; onClose: (id: number) => void }) {
  const [leaving, setLeaving] = useState(false);
  const c = config[toast.type];
  const Icon = c.icon;

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onClose(toast.id), 220);
  }, [toast.id, onClose]);

  useEffect(() => {
    const t = setTimeout(dismiss, toast.duration);
    return () => clearTimeout(t);
  }, [dismiss, toast.duration]);

  return (
    <div
      className={`pointer-events-auto relative w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-white border ${c.ring} shadow-xl shadow-slate-900/10 ${leaving ? 'toast-out' : 'toast-in'}`}
      role="status"
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`p-2 rounded-xl shadow-lg ${c.iconWrap} flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-bold text-slate-800 leading-snug">{toast.title}</p>
          {toast.description && (
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{toast.description}</p>
          )}
        </div>
        <button
          onClick={dismiss}
          className="p-1 text-slate-300 hover:text-slate-500 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* progress bar */}
      <div className="h-1 w-full bg-slate-100">
        <div
          className={`h-full ${c.bar} toast-progress`}
          style={{ animationDuration: `${toast.duration}ms` }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (opts: { type?: ToastType; title: string; description?: string; duration?: number }) => {
      const id = Date.now() + Math.random();
      const toast: Toast = {
        id,
        type: opts.type || 'info',
        title: opts.title,
        description: opts.description,
        duration: opts.duration ?? 3500,
      };
      setToasts((prev) => [...prev, toast].slice(-4)); // keep max 4
    },
    []
  );

  const value: ToastContextValue = {
    toast: push,
    success: (title, description) => push({ type: 'success', title, description }),
    error: (title, description) => push({ type: 'error', title, description }),
    warning: (title, description) => push({ type: 'warning', title, description }),
    info: (title, description) => push({ type: 'info', title, description }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
