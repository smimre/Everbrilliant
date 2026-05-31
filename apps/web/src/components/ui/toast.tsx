'use client';
import { useUIStore } from '@/store/ui.store';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS = {
  success: <CheckCircle className="h-4 w-4" />,
  error: <XCircle className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
};

const STYLES = {
  success: 'bg-[hsl(var(--success)/0.1)] border-[hsl(var(--success)/0.3)] text-[hsl(var(--success))]',
  error: 'bg-[hsl(var(--error)/0.1)] border-[hsl(var(--error)/0.3)] text-[hsl(var(--destructive))]',
  warning: 'bg-[hsl(var(--warning)/0.1)] border-[hsl(var(--warning)/0.3)] text-[hsl(var(--warning))]',
  info: 'bg-[hsl(var(--info)/0.1)] border-[hsl(var(--info)/0.3)] text-[hsl(var(--info))]',
};

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 end-4 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-[var(--shadow-lg)] animate-in',
            STYLES[t.type]
          )}
        >
          <span className="mt-0.5 shrink-0">{ICONS[t.type]}</span>
          <span className="flex-1 font-medium">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
