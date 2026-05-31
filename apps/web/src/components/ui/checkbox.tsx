'use client';
import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className, id, ...props }, ref) => {
    const cbId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref} id={cbId} type="checkbox"
          className={cn(
            'mt-0.5 h-4 w-4 rounded border-[hsl(var(--border))] bg-[hsl(var(--input))]',
            'text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]',
            'cursor-pointer transition-colors',
            className
          )}
          {...props}
        />
        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && <label htmlFor={cbId} className="text-sm font-medium text-[hsl(var(--foreground))] cursor-pointer">{label}</label>}
            {description && <span className="text-xs text-[hsl(var(--muted-foreground))]">{description}</span>}
          </div>
        )}
        {error && <span className="text-xs text-[hsl(var(--destructive))]">{error}</span>}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';
