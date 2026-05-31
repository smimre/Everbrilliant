'use client';
import { useLocaleStore } from '@/store/locale.store';

interface Props { onNavigate: (view: any) => void; }

export function FinanceDashboard({ onNavigate }: Props) {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';

  const stats = [
    { icon: '💰', val: '0', label: fa ? 'کل نقدینگی' : 'Total Cash', color: '#10b981', sub: fa ? 'موجودی بانک' : 'Bank Balance' },
    { icon: '🧾', val: '0', label: fa ? 'فاکتور صادره' : 'Issued Invoices', color: '#3b82f6', sub: fa ? 'این ماه' : 'This month' },
    { icon: '📥', val: '0', label: fa ? 'پرداختنی' : 'Payables', color: '#ef4444', sub: fa ? 'سررسید نزدیک' : 'Due soon' },
    { icon: '📤', val: '0', label: fa ? 'دریافتنی' : 'Receivables', color: '#f59e0b', sub: fa ? 'در انتظار' : 'Pending' },
    { icon: '👥', val: '0', label: fa ? 'پرسنل فعال' : 'Active Staff', color: '#8b5cf6', sub: fa ? 'کارمند' : 'employees' },
    { icon: '📦', val: '0', label: fa ? 'اقلام انبار' : 'Inventory Items', color: '#06b6d4', sub: fa ? 'قلم کالا' : 'items' },
  ];

  const quickActions = [
    { icon: '🧾', label: fa ? 'فاکتور جدید' : 'New Invoice', view: 'invoices', color: '#3b82f6' },
    { icon: '📒', label: fa ? 'سند حسابداری' : 'Journal Entry', view: 'journal', color: '#10b981' },
    { icon: '👤', label: fa ? 'کارمند جدید' : 'New Staff', view: 'staff', color: '#8b5cf6' },
    { icon: '💰', label: fa ? 'اجرای حقوق' : 'Run Payroll', view: 'payroll', color: '#f59e0b' },
    { icon: '🏦', label: fa ? 'تراکنش بانکی' : 'Bank Transaction', view: 'treasury', color: '#06b6d4' },
    { icon: '📊', label: fa ? 'گزارش مالی' : 'Financial Report', view: 'reports', color: '#ec4899' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">💼 {fa ? 'داشبورد مالی' : 'Finance Dashboard'}</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{fa ? 'خلاصه وضعیت مالی شرکت' : 'Company financial overview'}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{s.sub}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h2 className="font-semibold mb-4">⚡ {fa ? 'دسترسی سریع' : 'Quick Actions'}</h2>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((a, i) => (
            <button key={i} onClick={() => onNavigate(a.view)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--muted)/0.5)] transition-all group">
              <div className="rounded-xl p-2 text-xl group-hover:scale-110 transition-transform" style={{ background: a.color + '18', color: a.color }}>{a.icon}</div>
              <span className="text-xs font-medium text-center leading-tight text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
          <h3 className="font-semibold mb-3">🧾 {fa ? 'آخرین فاکتورها' : 'Recent Invoices'}</h3>
          <div className="text-center py-6 text-[hsl(var(--muted-foreground))]">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm">{fa ? 'فاکتوری ثبت نشده' : 'No invoices yet'}</p>
          </div>
        </div>
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
          <h3 className="font-semibold mb-3">📒 {fa ? 'آخرین اسناد' : 'Recent Journal Entries'}</h3>
          <div className="text-center py-6 text-[hsl(var(--muted-foreground))]">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm">{fa ? 'سندی ثبت نشده' : 'No entries yet'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
