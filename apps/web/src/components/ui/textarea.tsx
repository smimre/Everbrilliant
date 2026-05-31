'use client';
import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const taId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label htmlFor={taId} className="text-sm font-medium text-[hsl(var(--foreground))]">{label}</label>}
        <textarea
          ref={ref} id={taId} rows={3}
          className={cn(
            'w-full rounded-lg border bg-[hsl(var(--input))] px-3 py-2 text-sm text-[hsl(var(--foreground))]',
            'placeholder:text-[hsl(var(--muted-foreground))] resize-y min-h-[80px]',
            'focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))]',
            'transition-colors duration-150',
            error ? 'border-[hsl(var(--destructive))]' : 'border-[hsl(var(--border))]',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-[hsl(var(--destructive))]">{error}</span>}
        {hint && !error && <span className="text-xs text-[hsl(var(--muted-foreground))]">{hint}</span>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
