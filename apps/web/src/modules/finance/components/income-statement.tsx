'use client';
import { useLocaleStore } from '@/store/locale.store';

export function IncomeStatement() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';

  const data = {
    revenue: [
      { code: '4100', name: 'Sales Revenue', nameFa: 'درآمد فروش', amount: 350000000 },
      { code: '4200', name: 'Service Revenue', nameFa: 'درآمد خدمات', amount: 80000000 },
      { code: '4300', name: 'Other Revenue', nameFa: 'سایر درآمدها', amount: 20000000 },
    ],
    cogs: 180000000,
    opex: [
      { code: '6100', name: 'Salaries', nameFa: 'حقوق و دستمزد', amount: 85000000 },
      { code: '6200', name: 'Rent', nameFa: 'اجاره', amount: 24000000 },
      { code: '6300', name: 'Marketing', nameFa: 'بازاریابی', amount: 12000000 },
      { code: '6400', name: 'Transport', nameFa: 'حمل‌ونقل', amount: 8000000 },
      { code: '6500', name: 'Other Expenses', nameFa: 'سایر هزینه‌ها', amount: 15000000 },
    ],
  };

  const totalRev = data.revenue.reduce((s, r) => s + r.amount, 0);
  const grossProfit = totalRev - data.cogs;
  const totalOpEx = data.opex.reduce((s, e) => s + e.amount, 0);
  const opProfit = grossProfit - totalOpEx;
  const tax = Math.round(opProfit * 0.25);
  const netProfit = opProfit - tax;

  const Row = ({ label, value, indent, bold, color, divider }: any) => (
    <div className={`flex justify-between px-4 py-2.5 text-sm ${divider ? 'border-t-2 border-[hsl(var(--border))]' : 'border-t border-[hsl(var(--border)/0.3)]'} ${bold ? 'font-bold bg-[hsl(var(--muted)/0.2)]' : 'hover:bg-[hsl(var(--muted)/0.3)]'}`}>
      <span className={indent ? 'ps-4 text-[hsl(var(--muted-foreground))]' : ''}>{label}</span>
      <span className={bold ? (color || '') : 'font-medium'} style={color ? { color } : {}}>{typeof value === 'number' ? value.toLocaleString('fa-IR') : value}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">📈 {fa ? 'صورت سود و زیان' : 'Income Statement'}</h1>
        <button className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)]">
          🖨️ {fa ? 'چاپ' : 'Print'}
        </button>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        {/* Revenue */}
        <div className="px-4 py-2 bg-green-500/10 text-green-700 text-xs font-bold uppercase">{fa ? '📈 درآمدها' : '📈 Revenue'}</div>
        {data.revenue.map(r => <Row key={r.code} label={<><span className="font-mono text-xs me-2 text-[hsl(var(--muted-foreground))]">{r.code}</span>{fa ? r.nameFa : r.name}</>} value={r.amount} indent />)}
        <Row label={fa ? 'جمع درآمدها' : 'Total Revenue'} value={totalRev} bold color="#10b981" divider />

        {/* COGS */}
        <Row label={<><span className="font-mono text-xs me-2 text-[hsl(var(--muted-foreground))]">5100</span>{fa ? 'بهای تمام شده کالای فروش رفته' : 'Cost of Goods Sold'}</>} value={`(${data.cogs.toLocaleString('fa-IR')})`} indent />
        <Row label={fa ? '📊 سود ناخالص' : '📊 Gross Profit'} value={grossProfit} bold color={grossProfit >= 0 ? '#10b981' : '#ef4444'} divider />

        {/* OpEx */}
        <div className="px-4 py-2 bg-red-500/10 text-red-600 text-xs font-bold uppercase mt-1">{fa ? '📉 هزینه‌های عملیاتی' : '📉 Operating Expenses'}</div>
        {data.opex.map(e => <Row key={e.code} label={<><span className="font-mono text-xs me-2 text-[hsl(var(--muted-foreground))]">{e.code}</span>{fa ? e.nameFa : e.name}</>} value={`(${e.amount.toLocaleString('fa-IR')})`} indent />)}
        <Row label={fa ? 'جمع هزینه‌های عملیاتی' : 'Total OpEx'} value={`(${totalOpEx.toLocaleString('fa-IR')})`} bold divider />

        {/* Profit */}
        <Row label={fa ? '💼 سود عملیاتی' : '💼 Operating Profit'} value={opProfit} bold color={opProfit >= 0 ? '#10b981' : '#ef4444'} divider />
        <Row label={fa ? `مالیات بر درآمد (۲۵٪)` : `Income Tax (25%)`} value={`(${tax.toLocaleString('fa-IR')})`} indent />
        <Row label={fa ? '🏆 سود/زیان خالص' : '🏆 Net Profit/Loss'} value={netProfit} bold color={netProfit >= 0 ? '#10b981' : '#ef4444'} divider />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '📈', val: totalRev, label: fa?'کل درآمد':'Total Revenue', color: '#10b981' },
          { icon: '📊', val: grossProfit, label: fa?'سود ناخالص':'Gross Profit', color: '#3b82f6' },
          { icon: '🏆', val: netProfit, label: fa?'سود خالص':'Net Profit', color: netProfit >= 0 ? '#10b981' : '#ef4444' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 text-center">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-lg font-bold" style={{ color: s.color }}>{s.val.toLocaleString('fa-IR')}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
