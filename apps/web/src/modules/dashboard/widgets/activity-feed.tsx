'use client';
import { useLocaleStore } from '@/store/locale.store';
import { Avatar } from '@/components/ui/avatar';

const MOCK_ACTIVITIES = [
  { id: 1, user: 'احمد رضایی', action_fa: 'درخواست جدید ایجاد کرد', action_en: 'created a new request', time: '2 min ago', icon: '📋', color: '#3b82f6' },
  { id: 2, user: 'علی کریمی', action_fa: 'فاکتور صادر کرد', action_en: 'issued an invoice', time: '15 min ago', icon: '🧾', color: '#10b981' },
  { id: 3, user: 'فاطمه رضایی', action_fa: 'قرارداد امضا کرد', action_en: 'signed a contract', time: '1 hr ago', icon: '✍️', color: '#8b5cf6' },
  { id: 4, user: 'حسین موسوی', action_fa: 'پیام جدید دریافت کرد', action_en: 'received a new message', time: '2 hr ago', icon: '💬', color: '#f59e0b' },
  { id: 5, user: 'مریم احمدی', action_fa: 'در مزایده شرکت کرد', action_en: 'placed a bid', time: '3 hr ago', icon: '🔨', color: '#ef4444' },
];

export function ActivityFeedWidget() {
  const { lang } = useLocaleStore();
  const title = lang === 'fa' ? '🕐 فعالیت اخیر' : lang === 'ar' ? '🕐 النشاط الأخير' : '🕐 Recent Activity';

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
      <h2 className="font-semibold mb-4">{title}</h2>
      <div className="space-y-3">
        {MOCK_ACTIVITIES.map((a) => (
          <div key={a.id} className="flex items-start gap-3">
            <div className="relative">
              <Avatar name={a.user} size="sm" />
              <span className="absolute -bottom-0.5 -end-0.5 text-xs leading-none">{a.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[hsl(var(--foreground))]">
                <span className="font-semibold">{a.user}</span>{' '}
                <span className="text-[hsl(var(--muted-foreground))]">
                  {lang === 'fa' ? a.action_fa : a.action_en}
                </span>
              </p>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
