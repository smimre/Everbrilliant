import { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertType = 'info' | 'success' | 'warning' | 'error';

const ICONS = {
  info: <Info className="h-4 w-4 shrink-0 mt-0.5" />,
  success: <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />,
  warning: <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />,
  error: <XCircle className="h-4 w-4 shrink-0 mt-0.5" />,
};

const STYLES = {
  info:    'bg-[hsl(var(--info)/0.08)] border-[hsl(var(--info)/0.25)] text-[hsl(var(--info))]',
  success: 'bg-[hsl(var(--success)/0.08)] border-[hsl(var(--success)/0.25)] text-[hsl(var(--success))]',
  warning: 'bg-[hsl(var(--warning)/0.08)] border-[hsl(var(--warning)/0.25)] text-[hsl(var(--warning))]',
  error:   'bg-[hsl(var(--destructive)/0.08)] border-[hsl(var(--destructive)/0.25)] text-[hsl(var(--destructive))]',
};

interface AlertProps {
  type?: AlertType;
  title?: string;
  children: ReactNode;
  className?: string;
  onClose?: () => void;
}

export function Alert({ type = 'info', title, children, className, onClose }: AlertProps) {
  return (
    <div className={cn('flex gap-3 rounded-xl border p-3.5 text-sm', STYLES[type], className)}>
      {ICONS[type]}
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="opacity-90 leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
