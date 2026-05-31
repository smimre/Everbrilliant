'use client';
import { forwardRef, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label htmlFor={selectId} className="text-sm font-medium text-[hsl(var(--foreground))]">{label}</label>}
        <select
          ref={ref} id={selectId}
          className={cn(
            'w-full rounded-lg border bg-[hsl(var(--input))] px-3 py-2 text-sm text-[hsl(var(--foreground))]',
            'focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))]',
            'transition-colors duration-150',
            error ? 'border-[hsl(var(--destructive))]' : 'border-[hsl(var(--border))]',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
        </select>
        {error && <span className="text-xs text-[hsl(var(--destructive))]">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
