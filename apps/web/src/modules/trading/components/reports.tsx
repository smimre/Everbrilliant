'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useRequests, useContracts, useCRMStats } from '@/hooks/use-trading';
import { useAuthStore } from '@/store/auth.store';

interface ReportsProps { showSales?: boolean; }

function fmt(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + ' B IRR';
  if (n >= 1e6) return (n / 1e6).toFixed(0) + ' M IRR';
  return n.toLocaleString();
}

const STATUS_META: Record<string, { label: string; en: string; color: string }> = {
  PENDING:   { label: 'در انتظار',  en: 'Pending',   color: '#f59e0b' },
  QUOTED:    { label: 'قیمت آمد',   en: 'Quoted',    color: '#3b82f6' },
  APPROVED:  { label: 'تأیید شد',   en: 'Approved',  color: '#10b981' },
  PAID:      { label: 'پرداخت شد',  en: 'Paid',      color: '#06b6d4' },
  COMPLETED: { label: 'تکمیل شده',  en: 'Completed', color: '#8b5cf6' },
  REJECTED:  { label: 'رد شده',     en: 'Rejected',  color: '#ef4444' },
  CANCELLED: { label: 'لغو شده',    en: 'Cancelled', color: '#94a3b8' },
};
const CONTRACT_STATUS_COLORS: Record<string, string> = {
  DRAFT: '#f59e0b', PENDING: '#f59e0b', ACTIVE: '#3b82f6', SIGNED: '#10b981',
  COMPLETED: '#8b5cf6', CANCELLED: '#ef4444',
};

export function ReportsPage({ showSales }: ReportsProps = {}) {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'summary' | 'partners' | 'status' | 'contracts'>(showSales ? 'status' : 'summary');

  const { data: rawReqs } = useRequests({ limit: 1000 });
  const { data: rawContracts } = useContracts();
  const { data: crmStats } = useCRMStats();

  const allReqs: any[] = (rawReqs as any)?.data ?? [];
  const allContracts: any[] = (rawContracts as any)?.data ?? [];
  const myReqs = allReqs.filter((r: any) =>
    r.buyerCompanyId === user?.companyId || r.sellerCompanyId === user?.companyId
  );

  const buyReqs  = myReqs.filter((r: any) => r.buyerCompanyId === user?.companyId);
  const saleReqs = myReqs.filter((r: any) => r.sellerCompanyId === user?.companyId);
  const won      = myReqs.filter((r: any) => ['COMPLETED','PAID'].includes((r.status||'').toUpperCase()));
  const lost     = myReqs.filter((r: any) => ['REJECTED','CANCELLED'].includes((r.status||'').toUpperCase()));
  const convRate = (crmStats as any)?.convRate ?? (myReqs.length ? Math.round(won.length / myReqs.length * 100) : 0);
  const contractValue = allContracts.reduce((s: number, c: any) => s + (c.value || 0), 0);

  // Status breakdown from real data
  const statusBreakdown = Object.entries(STATUS_META).map(([key, meta]) => {
    const count = myReqs.filter((r: any) => (r.status || '').toUpperCase() === key).length;
    const pct = myReqs.length ? Math.round(count / myReqs.length * 100) : 0;
    return { ...meta, key, count, pct };
  }).filter(s => s.count > 0);

  // Top partners from real data
  const partnerMap = new Map<string, { name: string; count: number; amount: number }>();
  myReqs.forEach((r: any) => {
    const isBuyer = r.buyerCompanyId === user?.companyId;
    const partner = isBuyer ? r.sellerCompany : r.buyerCompany;
    if (!partner) return;
    const key = String(partner.id);
    const existing = partnerMap.get(key) || { name: partner.name || key, count: 0, amount: 0 };
    partnerMap.set(key, { ...existing, count: existing.count + 1, amount: existing.amount + (r.amountIRR || 0) });
  });
  const topPartners = [...partnerMap.values()].sort((a, b) => b.amount - a.amount).slice(0, 10);

  const kpis = [
    { icon: '📋', label: fa ? 'کل درخواست' : 'Total Requests', val: String(myReqs.length), sub: `${won.length} ${fa ? 'موفق' : 'won'}`, color: '#3b82f6' },
    { icon: '🏆', label: fa ? 'موفق' : 'Won', val: String(won.length), sub: `${convRate}% ${fa ? 'نرخ تبدیل' : 'conv.'}`, color: '#10b981' },
    { icon: '❌', label: fa ? 'ناموفق' : 'Lost', val: String(lost.length), sub: `${myReqs.length - won.length - lost.length} ${fa ? 'در جریان' : 'active'}`, color: '#ef4444' },
    { icon: '📄', label: fa ? 'ارزش قراردادها' : 'Contracts', val: fmt(contractValue), sub: `${allContracts.length} ${fa ? 'قرارداد' : 'contracts'}`, color: '#8b5cf6' },
    { icon: '📈', label: fa ? 'نرخ تبدیل' : 'Conv. Rate', val: `${convRate}%`, sub: `${(crmStats as any)?.overdue ?? 0} ${fa ? 'پیگیری عقب' : 'overdue'}`, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{showSales ? (fa ? '📊 گزارش فروش' : '📊 Sales Report') : (fa ? '📊 گزارشات بازرگانی' : '📊 Trading Reports')}</h1>

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
          { id: 'summary',   label: fa ? 'خلاصه' : 'Summary' },
          { id: 'partners',  label: fa ? 'شرکاء' : 'Partners' },
          { id: 'status',    label: fa ? 'وضعیت' : 'Pipeline' },
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
          {([
            { title: fa ? '📥 درخواست‌های خرید' : '📥 Purchase Requests', reqs: buyReqs },
            { title: fa ? '📤 درخواست‌های فروش' : '📤 Sales Requests',    reqs: saleReqs },
          ]).map(({ title, reqs }, ti) => (
            <div key={ti} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
              <h3 className="font-bold text-sm mb-3">{title} ({reqs.length})</h3>
              {Object.entries(STATUS_META).map(([key, meta]) => {
                const count = reqs.filter((r: any) => (r.status || '').toUpperCase() === key).length;
                if (!count) return null;
                return (
                  <div key={key} className="flex justify-between text-xs py-1.5 border-b border-[hsl(var(--border))] last:border-0">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: meta.color }} />
                      {fa ? meta.label : meta.en}
                    </span>
                    <span className="font-semibold">{count}</span>
                  </div>
                );
              })}
              {reqs.length === 0 && (
                <p className="text-xs text-[hsl(var(--muted-foreground))] text-center py-4">{fa ? 'موردی نیست' : 'None yet'}</p>
              )}
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
          {topPartners.length === 0 ? (
            <div className="text-center py-10 text-[hsl(var(--muted-foreground))]">
              <p className="text-sm">{fa ? 'معامله‌ای ثبت نشده' : 'No trades yet'}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  <th className="p-3 text-start text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'شرکت' : 'Company'}</th>
                  <th className="p-3 text-center text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'تعداد' : 'Count'}</th>
                  <th className="p-3 text-end text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'ارزش کل' : 'Total'}</th>
                </tr>
              </thead>
              <tbody>
                {topPartners.map((p, i) => (
                  <tr key={i} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted)/0.3)]">
                    <td className="p-3 font-semibold">{p.name}</td>
                    <td className="p-3 text-center">{p.count}</td>
                    <td className="p-3 text-end font-bold text-[hsl(var(--primary))]">{p.amount > 0 ? fmt(p.amount) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Status / Pipeline Tab */}
      {tab === 'status' && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 space-y-4">
          <h2 className="font-bold text-sm">📈 {fa ? 'وضعیت Pipeline' : 'Pipeline Breakdown'}</h2>
          {statusBreakdown.length === 0 ? (
            <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-sm">{fa ? 'داده‌ای برای نمایش نیست' : 'No data yet'}</p>
            </div>
          ) : statusBreakdown.map((s) => (
            <div key={s.key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  {fa ? s.label : s.en}
                </span>
                <span className="text-[hsl(var(--muted-foreground))]">
                  {s.count} {fa ? 'مورد' : 'items'} — {s.pct}%
                </span>
              </div>
              <div className="h-5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full flex items-center px-2 text-white text-[10px] font-bold transition-all"
                  style={{ width: `${Math.max(s.pct, 8)}%`, background: s.color, minWidth: s.count ? '24px' : '0' }}
                >
                  {s.count > 0 ? s.count : ''}
                </div>
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
          {allContracts.length === 0 ? (
            <div className="text-center py-10 text-[hsl(var(--muted-foreground))]">
              <p className="text-sm">{fa ? 'قراردادی ثبت نشده' : 'No contracts yet'}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  <th className="p-3 text-start text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'عنوان' : 'Title'}</th>
                  <th className="p-3 text-start text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'طرف مقابل' : 'Party'}</th>
                  <th className="p-3 text-end text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'مبلغ' : 'Value'}</th>
                  <th className="p-3 text-center text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'وضعیت' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {allContracts.map((c: any, i: number) => {
                  const status = (c.status || 'DRAFT').toUpperCase();
                  const color = CONTRACT_STATUS_COLORS[status] || '#64748b';
                  const party = c.buyerCompanyId === user?.companyId ? c.sellerCompany?.name : c.buyerCompany?.name;
                  return (
                    <tr key={i} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted)/0.3)]">
                      <td className="p-3 font-medium">{c.title || c.id}</td>
                      <td className="p-3 text-[hsl(var(--muted-foreground))]">{party || '—'}</td>
                      <td className="p-3 text-end font-bold" style={{ color }}>{c.value ? fmt(c.value) : '—'}</td>
                      <td className="p-3 text-center">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: color + '20', color }}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
