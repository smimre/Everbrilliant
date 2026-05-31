'use client';
import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, suffix, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[hsl(var(--foreground))]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && <span className="absolute start-3 text-[hsl(var(--muted-foreground))]">{prefix}</span>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-lg border bg-[hsl(var(--input))] px-3 py-2 text-sm',
              'text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]',
              'transition-colors duration-150',
              'focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))]',
              error ? 'border-[hsl(var(--destructive))]' : 'border-[hsl(var(--border))]',
              prefix ? 'ps-9' : '',
              suffix ? 'pe-9' : '',
              className
            )}
            {...props}
          />
          {suffix && <span className="absolute end-3 text-[hsl(var(--muted-foreground))]">{suffix}</span>}
        </div>
        {error && <span className="text-xs text-[hsl(var(--destructive))]">{error}</span>}
        {hint && !error && <span className="text-xs text-[hsl(var(--muted-foreground))]">{hint}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
