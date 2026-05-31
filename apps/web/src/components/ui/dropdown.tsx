'use client';
import { useState, useRef, useEffect, ReactNode } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  checked?: boolean;
  separator?: boolean;
  children?: DropdownItem[];
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'start' | 'end';
  className?: string;
}

export function Dropdown({ trigger, items, align = 'end', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div className={cn(
          'absolute top-full mt-1.5 min-w-[160px] z-50 animate-in',
          'rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))]',
          'shadow-[var(--shadow-lg)] py-1 overflow-hidden',
          align === 'end' ? 'end-0' : 'start-0'
        )}>
          {items.map((item, i) => {
            if (item.separator) return <div key={i} className="my-1 border-t border-[hsl(var(--border))]" />;
            return (
              <button
                key={i}
                onClick={() => { item.onClick?.(); setOpen(false); }}
                disabled={item.disabled}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-start',
                  item.danger
                    ? 'text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.08)]'
                    : 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]',
                  item.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {item.icon && <span className="shrink-0 opacity-70">{item.icon}</span>}
                <span className="flex-1">{item.label}</span>
                {item.checked && <Check className="h-3.5 w-3.5 shrink-0" />}
                {item.children && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
