'use client';
import { useEffect, useCallback, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

const SIZES: Record<ModalSize, string> = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-2xl',
  '2xl':'max-w-4xl',
  full: 'max-w-6xl',
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  className?: string;
  closeOnBackdrop?: boolean;
  showClose?: boolean;
}

export function Modal({
  open, onClose, title, description, children, footer,
  size = 'md', className, closeOnBackdrop = true, showClose = true,
}: ModalProps) {
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, handleEsc]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in-0 duration-200"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Dialog */}
      <div className={cn(
        'relative w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]',
        'shadow-[var(--shadow-xl)] animate-in slide-in-bottom-4 duration-300',
        'rounded-t-2xl sm:rounded-2xl overflow-hidden',
        SIZES[size], className
      )}>
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[hsl(var(--border))]">
          <div>
            <h2 className="font-semibold text-base text-[hsl(var(--foreground))]">{title}</h2>
            {description && <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">{description}</p>}
          </div>
          {showClose && (
            <button
              onClick={onClose}
              className="ms-4 shrink-0 rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto max-h-[65vh]">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
