'use client';
import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  color?: string;
  colorHsl?: string;
  onClick?: () => void;
  loading?: boolean;
  suffix?: string;
}

export function StatCard({
  icon, label, value, change, changeType, color = '#3b82f6',
  onClick, loading, suffix,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-[hsl(var(--border))] p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-3 w-16" />
      </div>
    );
  }

  const ChangeIcon = changeType === 'up' ? TrendingUp : changeType === 'down' ? TrendingDown : Minus;

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl p-4',
        'border border-[hsl(var(--border))] bg-[hsl(var(--secondary))]',
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:border-[hsl(var(--primary)/0.4)] hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.1)] hover:-translate-y-0.5'
      )}
    >
      {/* Glow */}
      <div
        className="absolute -top-6 -end-6 h-20 w-20 rounded-full opacity-15 blur-2xl"
        style={{ background: color }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1.5 truncate">{label}</p>
          <p className="text-2xl font-bold text-[hsl(var(--foreground))] tabular-nums truncate">
            {value}{suffix && <span className="text-sm font-normal text-[hsl(var(--muted-foreground))] ms-1">{suffix}</span>}
          </p>
          {change && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium mt-1.5',
              changeType === 'up' ? 'text-[hsl(var(--success))]' :
              changeType === 'down' ? 'text-[hsl(var(--destructive))]' :
              'text-[hsl(var(--muted-foreground))]'
            )}>
              <ChangeIcon className="h-3 w-3" />
              {change}
            </div>
          )}
        </div>

        <div
          className="rounded-xl p-2.5 shrink-0"
          style={{ background: `${color}18`, color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
