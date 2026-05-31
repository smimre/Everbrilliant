'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

interface ReportsProps { showSales?: boolean; }

const MOCK_STATS = {
  totalPurchase: 12500000000, totalSale: 8750000000, contractValue: 21000000000,
  inventoryValue: 5400000000, logisticsCost: 980000000,
  purchaseCount: 14, saleCount: 9, contractCount: 3, inventoryCount: 47, shipmentCount: 6,
};
const MOCK_PARTNERS = [
  { name: 'شرکت بازرگانی الفا', count: 12, amount: 8500000000 },
  { name: 'مهر پارس', count: 7, amount: 3200000000 },
  { name: 'ارمغان لجستیک', count: 20, amount: 1500000000 },
  { name: 'تجارت نوین', count: 3, amount: 900000000 },
];
const STATUS_BREAKDOWN = [
  { label: 'در انتظار', en: 'Pending', count: 4, amount: 2100000000, pct: 29, color: '#f59e0b' },
  { label: 'قیمت آمد', en: 'Quoted', count: 3, amount: 1800000000, pct: 21, color: '#3b82f6' },
  { label: 'تأیید شد', en: 'Approved', count: 5, amount: 5200000000, pct: 36, color: '#10b981' },
  { label: 'لغو شد', en: 'Cancelled', count: 2, amount: 800000000, pct: 14, color: '#ef4444' },
];
const CONTRACTS_SAMPLE = [
  { title: 'قرارداد خرید روغن پالم', party: 'شرکت بازرگانی الفا', amount: 5200000000, status: 'signed' },
  { title: 'قرارداد تأمین شکر', party: 'گروه صنعتی پارس', amount: 3100000000, status: 'active' },
  { title: 'قرارداد حمل و لجستیک', party: 'ارمغان لجستیک', amount: 980000000, status: 'draft' },
];

function fmt(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + ' B IRR';
  if (n >= 1e6) return (n / 1e6).toFixed(0) + ' M IRR';
  return n.toLocaleString();
}

export function ReportsPage({ showSales }: ReportsProps = {}) {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [tab, setTab] = useState<'summary' | 'partners' | 'status' | 'contracts'>(showSales ? 'status' : 'summary');

  const kpis = [
    { icon: '📥', label: fa ? 'کل خرید' : 'Total Purchase', val: fmt(MOCK_STATS.totalPurchase), sub: MOCK_STATS.purchaseCount + (fa ? ' معامله' : ' deals'), color: '#3b82f6' },
    { icon: '📤', label: fa ? 'کل فروش' : 'Total Sales', val: fmt(MOCK_STATS.totalSale), sub: MOCK_STATS.saleCount + (fa ? ' معامله' : ' deals'), color: '#10b981' },
    { icon: '📄', label: fa ? 'ارزش قراردادها' : 'Contract Value', val: fmt(MOCK_STATS.contractValue), sub: MOCK_STATS.contractCount + (fa ? ' قرارداد' : ' contracts'), color: '#8b5cf6' },
    { icon: '📦', label: fa ? 'ارزش انبار' : 'Inventory', val: fmt(MOCK_STATS.inventoryValue), sub: MOCK_STATS.inventoryCount + (fa ? ' قلم' : ' items'), color: '#f59e0b' },
    { icon: '🚛', label: fa ? 'هزینه حمل' : 'Logistics', val: fmt(MOCK_STATS.logisticsCost), sub: MOCK_STATS.shipmentCount + (fa ? ' محموله' : ' shipments'), color: '#06b6d4' },
  ];

  const CONTRACT_STATUS_COLORS: Record<string, string> = { draft: '#f59e0b', signed: '#10b981', active: '#3b82f6', completed: '#8b5cf6', cancelled: '#ef4444' };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{fa ? '📊 گزارشات بازرگانی' : '📊 Trading Reports'}</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((k, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
            <div className="text-2xl mb-1">{k.icon}</div>
            <div className="text-sm font-bold" style={{ color: k.color }}>{k.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{k.label}</div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[hsl(var(--secondary))] rounded-xl p-1">
        {([
          { id: 'summary', label: fa ? 'خلاصه' : 'Summary' },
          { id: 'partners', label: fa ? 'شرکاء' : 'Partners' },
          { id: 'status', label: fa ? 'وضعیت' : 'Status' },
          { id: 'contracts', label: fa ? 'قراردادها' : 'Contracts' },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.id ? 'bg-[hsl(var(--primary))] text-white' : 'text-[hsl(var(--muted-foreground))]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Summary Tab */}
      {tab === 'summary' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[fa ? '📥 درخواست‌های خرید' : '📥 Purchase Requests', fa ? '📤 درخواست‌های فروش' : '📤 Sales Requests'].map((title, ti) => (
            <div key={ti} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
              <h3 className="font-bold text-sm mb-3">{title}</h3>
              {STATUS_BREAKDOWN.map((s, i) => (
                <div key={i} className="flex justify-between text-xs py-1.5 border-b border-[hsl(var(--border))] last:border-0">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: s.color }} />
                    {fa ? s.label : s.en}
                  </span>
                  <span className="font-semibold">{ti === 0 ? s.count : Math.max(0, s.count - 1)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Partners Tab */}
      {tab === 'partners' && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">
          <div className="p-4 border-b border-[hsl(var(--border))]">
            <h2 className="font-bold text-sm">🤝 {fa ? 'شرکاء تجاری برتر' : 'Top Trade Partners'}</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="p-3 text-start text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'شرکت' : 'Company'}</th>
                <th className="p-3 text-center text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'تعداد' : 'Count'}</th>
                <th className="p-3 text-end text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'ارزش کل' : 'Total'}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PARTNERS.map((p, i) => (
                <tr key={i} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted)/0.3)]">
                  <td className="p-3 font-semibold">{p.name}</td>
                  <td className="p-3 text-center">{p.count}</td>
                  <td className="p-3 text-end font-bold text-[hsl(var(--primary))]">{fmt(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Tab */}
      {tab === 'status' && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 space-y-4">
          <h2 className="font-bold text-sm">📈 {fa ? 'وضعیت درخواست‌ها' : 'Request Status Breakdown'}</h2>
          {STATUS_BREAKDOWN.map((s, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  {fa ? s.label : s.en}
                </span>
                <span className="text-[hsl(var(--muted-foreground))]">
                  {s.count} {fa ? 'مورد' : 'items'} | {fmt(s.amount)} | {s.pct}%
                </span>
              </div>
              <div className="h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contracts Tab */}
      {tab === 'contracts' && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">
          <div className="p-4 border-b border-[hsl(var(--border))]">
            <h2 className="font-bold text-sm">📄 {fa ? 'خلاصه قراردادها' : 'Contracts Summary'}</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="p-3 text-start text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'عنوان' : 'Title'}</th>
                <th className="p-3 text-start text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'طرف مقابل' : 'Party'}</th>
                <th className="p-3 text-end text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'مبلغ' : 'Amount'}</th>
                <th className="p-3 text-center text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'وضعیت' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {CONTRACTS_SAMPLE.map((c, i) => {
                const color = CONTRACT_STATUS_COLORS[c.status] || '#64748b';
                return (
                  <tr key={i} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted)/0.3)]">
                    <td className="p-3 font-medium">{c.title}</td>
                    <td className="p-3 text-[hsl(var(--muted-foreground))]">{c.party}</td>
                    <td className="p-3 text-end font-bold" style={{ color }}>{fmt(c.amount)}</td>
                    <td className="p-3 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: color + '20', color }}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-center text-[hsl(var(--muted-foreground))]">
        {fa ? '⚠️ داده نمایشی — پس از اتصال API داده واقعی نمایش داده می‌شود' : '⚠️ Demo data — real data after API connection'}
      </p>
    </div>
  );
}
