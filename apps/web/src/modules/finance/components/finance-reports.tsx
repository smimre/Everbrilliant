'use client';
import { useLocaleStore } from '@/store/locale.store';

export function FinanceReports() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';

  const reports = [
    { icon: '📊', title: fa?'ترازنامه':'Balance Sheet', desc: fa?'دارایی، بدهی و حقوق صاحبان سهام':'Assets, Liabilities & Equity', color: '#3b82f6', view: 'balance-sheet' },
    { icon: '📈', title: fa?'صورت سود و زیان':'Income Statement', desc: fa?'درآمد، هزینه و سود خالص':'Revenue, Expenses & Net Profit', color: '#10b981', view: 'income-stmt' },
    { icon: '💸', title: fa?'جریان نقدی':'Cash Flow', desc: fa?'ورودی و خروجی وجه نقد':'Cash Inflows & Outflows', color: '#06b6d4', view: 'cashflow' },
    { icon: '⚖️', title: fa?'تراز آزمایشی':'Trial Balance', desc: fa?'بدهکار و بستانکار کلیه حساب‌ها':'All Accounts Debit & Credit', color: '#8b5cf6', view: 'trial-balance' },
    { icon: '🎯', title: fa?'بودجه در مقابل واقعی':'Budget vs Actual', desc: fa?'مقایسه بودجه با عملکرد واقعی':'Performance vs Plan', color: '#f59e0b', view: 'budget' },
    { icon: '🧾', title: fa?'گزارش فاکتورها':'Invoice Report', desc: fa?'فاکتورهای صادره و دریافتی':'Issued & Received Invoices', color: '#ec4899', view: 'invoices' },
    { icon: '💰', title: fa?'گزارش حقوق':'Payroll Report', desc: fa?'خلاصه حقوق و دستمزد':'Salary & Deductions Summary', color: '#10b981', view: 'payroll' },
    { icon: '🏦', title: fa?'گزارش بانکی':'Bank Statement', desc: fa?'تراز بانکی و تراکنش‌ها':'Bank Balance & Transactions', color: '#3b82f6', view: 'treasury' },
    { icon: '📦', title: fa?'گزارش انبار':'Inventory Report', desc: fa?'موجودی، ارزش و تحرکات':'Stock, Value & Movements', color: '#8b5cf6', view: 'inventory' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">📋 {fa?'گزارشات مالی':'Financial Reports'}</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{fa?'انتخاب گزارش مورد نیاز':'Select a report to view'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {reports.map((r, i) => (
          <div key={i}
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 cursor-pointer hover:shadow-md transition-all hover:border-[hsl(var(--primary)/0.3)] group">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform"
                style={{ background: r.color + '15', color: r.color }}>
                {r.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1">{r.title}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">{r.desc}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button className="text-xs font-medium hover:underline" style={{ color: r.color }}>
                {fa?'مشاهده گزارش ←':'View Report →'}
              </button>
              <div className="flex gap-1">
                <button className="text-xs px-2 py-1 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]">🖨️</button>
                <button className="text-xs px-2 py-1 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]">📥 Excel</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
