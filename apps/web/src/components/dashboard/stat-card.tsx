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
        onClick && 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5'
      )}
      style={{ borderTopColor: color, borderTopWidth: 2 }}
    >
      {/* Glow */}
      <div
        className="absolute -top-8 -end-8 h-24 w-24 rounded-full opacity-10 blur-2xl pointer-events-none"
        style={{ background: color }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2 leading-snug line-clamp-2">{label}</p>
          <p className="text-2xl font-bold text-[hsl(var(--foreground))] tabular-nums truncate leading-none">
            {value}{suffix && <span className="text-xs font-normal text-[hsl(var(--muted-foreground))] ms-1">{suffix}</span>}
          </p>
          {change && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium mt-2',
              changeType === 'up' ? 'text-emerald-500' :
              changeType === 'down' ? 'text-[hsl(var(--destructive))]' :
              'text-[hsl(var(--muted-foreground))]'
            )}>
              <ChangeIcon className="h-3 w-3 shrink-0" />
              <span className="truncate">{change}</span>
            </div>
          )}
        </div>

        <div
          className="rounded-xl p-2.5 shrink-0 ring-1"
          style={{ background: `${color}15`, color, ringColor: `${color}30` }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
