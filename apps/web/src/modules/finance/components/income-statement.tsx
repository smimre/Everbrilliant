'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useIncomeStatement } from '@/hooks/use-finance';

const FALLBACK_REVENUE  = [
  { code: '4100', name: 'Sales Revenue',   nameFa: 'درآمد فروش',    amount: '350000000' },
  { code: '4200', name: 'Service Revenue', nameFa: 'درآمد خدمات',   amount: '80000000'  },
  { code: '4300', name: 'Other Revenue',   nameFa: 'سایر درآمدها',  amount: '20000000'  },
];
const FALLBACK_EXPENSES = [
  { code: '6100', name: 'Salaries',        nameFa: 'حقوق و دستمزد', amount: '85000000'  },
  { code: '6200', name: 'Rent',            nameFa: 'اجاره',          amount: '24000000'  },
  { code: '6300', name: 'Marketing',       nameFa: 'بازاریابی',      amount: '12000000'  },
  { code: '6400', name: 'Transport',       nameFa: 'حمل‌ونقل',      amount: '8000000'   },
  { code: '6500', name: 'Other Expenses',  nameFa: 'سایر هزینه‌ها',  amount: '15000000'  },
];

export function IncomeStatement() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';

  const now = new Date();
  const defaultFrom = `${now.getFullYear()}-01-01`;
  const defaultTo   = now.toISOString().split('T')[0];
  const [from, setFrom] = useState(defaultFrom);
  const [to,   setTo]   = useState(defaultTo);

  const { data: raw, isLoading } = useIncomeStatement(from, to);

  const hasData = raw && (raw as any).revenue?.length > 0;
  const revenue  = hasData ? (raw as any).revenue  : FALLBACK_REVENUE;
  const expenses = hasData ? (raw as any).expenses : FALLBACK_EXPENSES;
  const isMock   = !hasData;

  const n = (v: string | number) => Number(v).toLocaleString(fa ? 'fa-IR' : 'en-US');

  const totalRev     = revenue.reduce((s: number, r: any) => s + Number(r.amount), 0);
  const totalExp     = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0);
  const grossProfit  = hasData ? Number((raw as any).grossProfit)  : totalRev - totalExp;
  const tax          = hasData ? Number((raw as any).tax)          : Math.round(grossProfit > 0 ? grossProfit * 0.25 : 0);
  const netProfit    = hasData ? Number((raw as any).netProfit)    : grossProfit - tax;
  const salesCount   = hasData ? (raw as any).invoiceSalesCount    : 0;

  const Row = ({ label, value, indent, bold, color, divider }: {
    label: React.ReactNode; value: string | number; indent?: boolean;
    bold?: boolean; color?: string; divider?: boolean;
  }) => (
    <div className={`flex justify-between px-4 py-2.5 text-sm ${divider ? 'border-t-2 border-[hsl(var(--border))]' : 'border-t border-[hsl(var(--border)/0.3)]'} ${bold ? 'font-bold bg-[hsl(var(--muted)/0.2)]' : 'hover:bg-[hsl(var(--muted)/0.3)]'}`}>
      <span className={indent ? 'ps-4 text-[hsl(var(--muted-foreground))]' : ''}>{label}</span>
      <span className={bold ? '' : 'font-medium'} style={color ? { color } : {}}>{typeof value === 'number' ? n(value) : value}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold">📈 {fa ? 'صورت سود و زیان' : 'Income Statement'}</h1>
        <div className="flex gap-2 items-center flex-wrap">
          {isMock && !isLoading && (
            <span className="text-xs px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
              {fa ? 'داده نمونه' : 'Sample data'}
            </span>
          )}
          {salesCount > 0 && (
            <span className="text-xs px-2 py-1 rounded-lg bg-green-500/10 text-green-600 border border-green-500/20">
              {fa ? `${n(salesCount)} فاکتور فروش` : `${n(salesCount)} paid invoices`}
            </span>
          )}
          <button className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)]">
            🖨️ {fa ? 'چاپ' : 'Print'}
          </button>
        </div>
      </div>

      {/* Date range filter */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <label className="text-[hsl(var(--muted-foreground))] text-xs">{fa ? 'از' : 'From'}</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="px-2 py-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-sm focus:outline-none" />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-[hsl(var(--muted-foreground))] text-xs">{fa ? 'تا' : 'To'}</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="px-2 py-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-sm focus:outline-none" />
        </div>
        {isLoading && <span className="text-xs text-[hsl(var(--muted-foreground))]">⏳</span>}
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        {/* Revenue */}
        <div className="px-4 py-2 bg-green-500/10 text-green-700 text-xs font-bold uppercase">
          {fa ? '📈 درآمدها' : '📈 Revenue'}
        </div>
        {revenue.map((r: any) => (
          <Row key={r.code}
            label={<><span className="font-mono text-xs me-2 text-[hsl(var(--muted-foreground))]">{r.code}</span>{fa ? r.nameFa : r.name}</>}
            value={Number(r.amount)} indent />
        ))}
        <Row label={fa ? 'جمع درآمدها' : 'Total Revenue'} value={totalRev} bold color="#10b981" divider />

        {/* COGS / Expenses */}
        <div className="px-4 py-2 bg-red-500/10 text-red-600 text-xs font-bold uppercase mt-1">
          {fa ? '📉 هزینه‌ها' : '📉 Expenses'}
        </div>
        {expenses.map((e: any) => (
          <Row key={e.code}
            label={<><span className="font-mono text-xs me-2 text-[hsl(var(--muted-foreground))]">{e.code}</span>{fa ? e.nameFa : e.name}</>}
            value={`(${n(Number(e.amount))})`} indent />
        ))}
        <Row label={fa ? 'جمع هزینه‌ها' : 'Total Expenses'} value={`(${n(totalExp)})`} bold divider />

        <Row label={fa ? '📊 سود ناخالص' : '📊 Gross Profit'} value={grossProfit}
          bold color={grossProfit >= 0 ? '#10b981' : '#ef4444'} divider />
        <Row label={fa ? 'مالیات (۲۵٪)' : 'Income Tax (25%)'} value={`(${n(tax)})`} indent />
        <Row label={fa ? '🏆 سود/زیان خالص' : '🏆 Net Profit / Loss'} value={netProfit}
          bold color={netProfit >= 0 ? '#10b981' : '#ef4444'} divider />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '📈', val: totalRev,   label: fa ? 'کل درآمد'    : 'Total Revenue',  color: '#10b981' },
          { icon: '📊', val: grossProfit, label: fa ? 'سود ناخالص'  : 'Gross Profit',  color: '#3b82f6' },
          { icon: '🏆', val: netProfit,   label: fa ? 'سود خالص'    : 'Net Profit',    color: netProfit >= 0 ? '#10b981' : '#ef4444' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 text-center">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-lg font-bold" style={{ color: s.color }}>{n(s.val)}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
