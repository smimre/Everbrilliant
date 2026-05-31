'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useLocaleStore } from '@/store/locale.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Zap, AlertTriangle } from 'lucide-react';

const METRIC_LABELS: Record<string, { fa: string; en: string; icon: string }> = {
  users:       { fa: 'کاربران', en: 'Users', icon: '👤' },
  requests:    { fa: 'درخواست‌ها', en: 'Requests', icon: '📋' },
  invoices:    { fa: 'فاکتورها', en: 'Invoices', icon: '🧾' },
  tenders:     { fa: 'مزایده‌ها', en: 'Tenders', icon: '🔨' },
  connections: { fa: 'اتصالات', en: 'Connections', icon: '🔗' },
};

interface UsageDashboardProps {
  compact?: boolean;
  onUpgrade?: () => void;
}

export function UsageDashboard({ compact = false, onUpgrade }: UsageDashboardProps) {
  const { lang } = useLocaleStore();

  const { data: sub } = useQuery({
    queryKey: ['saas', 'subscription'],
    queryFn: () => api.get<any>('/saas/subscription'),
    staleTime: 60_000,
  });

  const { data: usage, isLoading } = useQuery({
    queryKey: ['saas', 'usage'],
    queryFn: () => api.get<any[]>('/saas/usage'),
    staleTime: 30_000,
  });

  const nearLimit = usage?.some((u: any) => u.isNearLimit);
  const atLimit = usage?.some((u: any) => u.isAtLimit);

  if (compact) {
    return (
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold">{lang === 'fa' ? 'مصرف ماهانه' : 'Monthly Usage'}</span>
          {sub?.plan && <Badge variant="default">{lang === 'fa' ? sub.plan.nameFa : sub.plan.name}</Badge>}
        </div>
        {isLoading ? (
          <div className="space-y-2">{Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-5"/>)}</div>
        ) : (
          <div className="space-y-2">
            {(usage || []).slice(0, 3).map((u: any) => {
              const info = METRIC_LABELS[u.metric] || { fa: u.metric, en: u.metric, icon: '📊' };
              return (
                <div key={u.metric}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[hsl(var(--muted-foreground))]">{lang === 'fa' ? info.fa : info.en}</span>
                    <span className={cn('font-semibold', u.isAtLimit && 'text-[hsl(var(--destructive))]', u.isNearLimit && !u.isAtLimit && 'text-[hsl(var(--warning))]')}>
                      {u.unlimited ? '∞' : `${u.current}/${u.limit}`}
                    </span>
                  </div>
                  {!u.unlimited && (
                    <div className="h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all',
                          u.isAtLimit ? 'bg-[hsl(var(--destructive))]' :
                          u.isNearLimit ? 'bg-[hsl(var(--warning))]' : 'bg-[hsl(var(--primary))]'
                        )}
                        style={{ width: `${Math.min(100, u.percentage)}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {(nearLimit || atLimit) && onUpgrade && (
          <Button size="sm" className="w-full mt-3" onClick={onUpgrade}>
            <Zap className="h-3.5 w-3.5" />
            {lang === 'fa' ? 'ارتقای پلن' : 'Upgrade Plan'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Subscription header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{lang === 'fa' ? 'اشتراک و مصرف' : 'Subscription & Usage'}</h2>
          {sub?.daysLeft !== undefined && (
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              {lang === 'fa'
                ? `${sub.daysLeft} روز باقیمانده — پلن ${sub.plan?.nameFa || sub.plan?.name}`
                : `${sub.daysLeft} days left — ${sub.plan?.name} plan`}
            </p>
          )}
        </div>
        {onUpgrade && (
          <Button onClick={onUpgrade}>
            <Zap className="h-4 w-4" />
            {lang === 'fa' ? 'ارتقا' : 'Upgrade'}
          </Button>
        )}
      </div>

      {/* Alert if near/at limit */}
      {atLimit && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.2)] text-[hsl(var(--destructive))] text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {lang === 'fa' ? 'به سقف مصرف رسیده‌اید. برای ادامه، پلن خود را ارتقا دهید.' : 'You\'ve reached your plan limits. Please upgrade to continue.'}
        </div>
      )}

      {/* Usage meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({length:5}).map((_,i) => <Skeleton key={i} className="h-28 rounded-xl"/>)
          : (usage || []).map((u: any) => {
              const info = METRIC_LABELS[u.metric] || { fa: u.metric, en: u.metric, icon: '📊' };
              return (
                <div key={u.metric} className={cn(
                  'rounded-xl border p-4 bg-[hsl(var(--secondary))]',
                  u.isAtLimit ? 'border-[hsl(var(--destructive)/0.4)]' :
                  u.isNearLimit ? 'border-[hsl(var(--warning)/0.4)]' : 'border-[hsl(var(--border))]'
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{info.icon}</span>
                      <span className="text-sm font-semibold">{lang === 'fa' ? info.fa : info.en}</span>
                    </div>
                    <span className={cn('text-lg font-bold tabular-nums',
                      u.isAtLimit ? 'text-[hsl(var(--destructive))]' :
                      u.isNearLimit ? 'text-[hsl(var(--warning))]' : 'text-[hsl(var(--foreground))]'
                    )}>
                      {u.unlimited ? '∞' : `${u.current}`}
                    </span>
                  </div>
                  {!u.unlimited ? (
                    <>
                      <div className="h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden mb-1.5">
                        <div
                          className={cn('h-full rounded-full transition-all duration-500',
                            u.isAtLimit ? 'bg-[hsl(var(--destructive))]' :
                            u.isNearLimit ? 'bg-[hsl(var(--warning))]' : 'bg-[hsl(var(--primary))]'
                          )}
                          style={{ width: `${Math.min(100, u.percentage)}%` }}
                        />
                      </div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {u.current} / {u.limit} ({u.percentage}%)
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {lang === 'fa' ? 'نامحدود' : 'Unlimited'}
                    </p>
                  )}
                </div>
              );
            })}
      </div>
    </div>
  );
}
