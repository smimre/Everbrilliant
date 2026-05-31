import { cn } from '@/lib/utils';

type StatusType =
  | 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'draft'
  | 'sent' | 'paid' | 'overdue' | 'partial' | 'active' | 'open' | 'closed';

const STATUS_CONFIG: Record<StatusType, { label: string; labelFa: string; color: string; bg: string; dot: string }> = {
  draft:     { label: 'Draft',     labelFa: 'پیش‌نویس',    color: 'text-[hsl(var(--muted-foreground))]', bg: 'bg-[hsl(var(--muted))]', dot: 'bg-[hsl(var(--muted-foreground))]' },
  pending:   { label: 'Pending',   labelFa: 'در انتظار',   color: 'text-[hsl(var(--warning))]', bg: 'bg-[hsl(var(--warning)/0.12)]', dot: 'bg-[hsl(var(--warning))]' },
  approved:  { label: 'Approved',  labelFa: 'تأیید شده',   color: 'text-[hsl(var(--success))]', bg: 'bg-[hsl(var(--success)/0.12)]', dot: 'bg-[hsl(var(--success))]' },
  active:    { label: 'Active',    labelFa: 'فعال',         color: 'text-[hsl(var(--success))]', bg: 'bg-[hsl(var(--success)/0.12)]', dot: 'bg-[hsl(var(--success))]' },
  open:      { label: 'Open',      labelFa: 'باز',          color: 'text-[hsl(var(--info))]', bg: 'bg-[hsl(var(--info)/0.12)]', dot: 'bg-[hsl(var(--info))]' },
  sent:      { label: 'Sent',      labelFa: 'ارسال شده',   color: 'text-[hsl(var(--primary))]', bg: 'bg-[hsl(var(--primary)/0.12)]', dot: 'bg-[hsl(var(--primary))]' },
  paid:      { label: 'Paid',      labelFa: 'پرداخت شده',  color: 'text-[hsl(var(--success))]', bg: 'bg-[hsl(var(--success)/0.12)]', dot: 'bg-[hsl(var(--success))]' },
  partial:   { label: 'Partial',   labelFa: 'پرداخت جزئی', color: 'text-amber-400', bg: 'bg-amber-400/12', dot: 'bg-amber-400' },
  overdue:   { label: 'Overdue',   labelFa: 'معوق',         color: 'text-[hsl(var(--destructive))]', bg: 'bg-[hsl(var(--destructive)/0.12)]', dot: 'bg-[hsl(var(--destructive))] animate-pulse' },
  completed: { label: 'Completed', labelFa: 'تکمیل شده',   color: 'text-[hsl(var(--success))]', bg: 'bg-[hsl(var(--success)/0.12)]', dot: 'bg-[hsl(var(--success))]' },
  rejected:  { label: 'Rejected',  labelFa: 'رد شده',       color: 'text-[hsl(var(--destructive))]', bg: 'bg-[hsl(var(--destructive)/0.12)]', dot: 'bg-[hsl(var(--destructive))]' },
  cancelled: { label: 'Cancelled', labelFa: 'لغو شده',      color: 'text-[hsl(var(--muted-foreground))]', bg: 'bg-[hsl(var(--muted))]', dot: 'bg-[hsl(var(--muted-foreground))]' },
  closed:    { label: 'Closed',    labelFa: 'بسته شده',     color: 'text-[hsl(var(--muted-foreground))]', bg: 'bg-[hsl(var(--muted))]', dot: 'bg-[hsl(var(--muted-foreground))]' },
};

interface StatusBadgeProps {
  status: StatusType | string;
  lang?: string;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ status, lang = 'en', showDot = true, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as StatusType] || {
    label: status, labelFa: status,
    color: 'text-[hsl(var(--muted-foreground))]',
    bg: 'bg-[hsl(var(--muted))]',
    dot: 'bg-[hsl(var(--muted-foreground))]',
  };

  const label = lang === 'fa' ? config.labelFa : config.label;

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
      config.color, config.bg, className
    )}>
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dot)} />}
      {label}
    </span>
  );
}
