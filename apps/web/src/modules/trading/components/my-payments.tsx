'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useAuthStore } from '@/store/auth.store';
import { useInvoices } from '@/hooks/use-finance';
import { CreditCard, Clock, CheckCircle, Building2, Package, Calendar, Search, TrendingDown, TrendingUp } from 'lucide-react';

const STATUS_MAP: Record<string, { fa: string; en: string; color: string; icon: string }> = {
  DRAFT:     { fa: 'پیش‌نویس',      en: 'Draft',     color: '#94a3b8', icon: '📝' },
  SENT:      { fa: 'در انتظار',     en: 'Sent',      color: '#3b82f6', icon: '⏳' },
  PARTIAL:   { fa: 'پرداخت جزئی',  en: 'Partial',   color: '#f59e0b', icon: '💛' },
  PAID:      { fa: 'پرداخت شده',    en: 'Paid',      color: '#10b981', icon: '✅' },
  OVERDUE:   { fa: 'سررسید گذشته', en: 'Overdue',   color: '#ef4444', icon: '🚨' },
  CANCELLED: { fa: 'لغو شده',       en: 'Cancelled', color: '#6b7280', icon: '❌' },
  DISPUTED:  { fa: 'مورد اعتراض',  en: 'Disputed',  color: '#8b5cf6', icon: '⚖️' },
};

function fmt(n: number) {
  return new Intl.NumberFormat('fa-IR').format(n);
}

export function MyPayments() {
  const { lang } = useLocaleStore();
  const { user } = useAuthStore();
  const fa = lang === 'fa';
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dirFilter, setDirFilter]     = useState('all'); // 'all' | 'payable' | 'receivable'

  const { data: apiData, isLoading } = useInvoices();
  const rawInvoices: any[] = (apiData as any)?.data ?? [];
  const myCompanyId = user?.companyId ?? 0;

  const payments = rawInvoices.map((r: any) => {
    const isSeller = r.sellerCompanyId === myCompanyId;
    const peer     = isSeller ? r.buyerCompany  : r.sellerCompany;
    const status   = (r.status || 'DRAFT').toUpperCase();
    return {
      id:          r.id || '',
      invoiceNo:   r.invoiceNo || r.id?.slice(-8) || '—',
      direction:   isSeller ? 'receivable' : 'payable',
      party:       peer?.name || '—',
      product:     r.items?.[0]?.desc || r.items?.[0]?.description || '—',
      total:       Number(r.total   ?? 0),
      paid:        Number(r.paid    ?? 0),
      remaining:   Number(r.remaining ?? r.total ?? 0),
      status,
      dueAt:       r.dueAt    || '—',
      issuedAt:    r.issuedAt || (r.createdAt ? new Date(r.createdAt).toLocaleDateString('fa-IR') : '—'),
    };
  });

  const filtered = payments.filter(p => {
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchDir    = dirFilter    === 'all' || p.direction === dirFilter;
    const matchSearch = !search ||
      p.product.toLowerCase().includes(search.toLowerCase()) ||
      p.party.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchDir && matchSearch;
  });

  const totalPaid       = payments.filter(p => p.direction === 'payable').reduce((s, p) => s + p.paid, 0);
  const totalReceived   = payments.filter(p => p.direction === 'receivable').reduce((s, p) => s + p.paid, 0);
  const totalOutstanding = payments.filter(p => p.direction === 'payable' && ['SENT','PARTIAL','OVERDUE'].includes(p.status)).reduce((s, p) => s + p.remaining, 0);
  const overdueCount    = payments.filter(p => p.status === 'OVERDUE').length;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-[hsl(var(--primary))]"/>
        {fa ? 'پرداخت‌های من' : 'My Payments'}
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: <TrendingDown className="w-5 h-5"/>, label: fa ? 'پرداخت‌شده (خرید)'   : 'Paid (Payables)',   value: fmt(totalPaid)        + (fa?' ریال':' IRR'), color: '#ef4444', bg: '#ef444415' },
          { icon: <TrendingUp   className="w-5 h-5"/>, label: fa ? 'دریافت‌شده (فروش)'  : 'Received (Sales)',  value: fmt(totalReceived)    + (fa?' ریال':' IRR'), color: '#10b981', bg: '#10b98115' },
          { icon: <Clock        className="w-5 h-5"/>, label: fa ? 'بدهی جاری'            : 'Outstanding',       value: fmt(totalOutstanding) + (fa?' ریال':' IRR'), color: '#f59e0b', bg: '#f59e0b15' },
          { icon: <CheckCircle  className="w-5 h-5"/>, label: fa ? 'سررسید گذشته'         : 'Overdue',           value: String(overdueCount),                        color: '#8b5cf6', bg: '#8b5cf615' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] p-4" style={{ background: s.bg }}>
            <div className="flex items-center gap-2 mb-2" style={{ color: s.color }}>{s.icon}</div>
            <div className="font-bold text-sm" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {overdueCount > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/30 bg-red-500/5 text-red-500 text-sm">
          🚨 {fa ? `${overdueCount} پرداخت سررسید گذشته دارید.` : `${overdueCount} overdue payment(s). Please settle promptly.`}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative">
          <Search className="absolute start-2.5 top-2.5 w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={fa ? 'جستجو...' : 'Search...'}
            className="ps-8 pe-3 py-2 text-xs rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] outline-none w-44"/>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] outline-none">
          <option value="ALL">{fa ? 'همه وضعیت‌ها' : 'All Status'}</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => (
            <option key={k} value={k}>{fa ? v.fa : v.en}</option>
          ))}
        </select>
        <select value={dirFilter} onChange={e => setDirFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] outline-none">
          <option value="all">{fa ? 'همه' : 'All'}</option>
          <option value="payable">{fa ? '🔴 پرداختنی' : '🔴 Payable'}</option>
          <option value="receivable">{fa ? '🟢 دریافتنی' : '🟢 Receivable'}</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--secondary))]">
        <div className="p-4 border-b border-[hsl(var(--border))]">
          <h3 className="font-semibold text-sm">
            💳 {fa ? `پرداخت‌ها (${filtered.length})` : `Payments (${filtered.length})`}
          </h3>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
            <div className="w-6 h-6 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
            <p className="text-sm">{fa ? 'در حال بارگذاری...' : 'Loading...'}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30"/>
            <p className="text-sm">{fa ? 'پرداختی ثبت نشده' : 'No payments found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  {[
                    fa ? 'شماره'       : 'No.',
                    fa ? 'جهت'         : 'Dir',
                    fa ? 'طرف حساب'   : 'Party',
                    fa ? 'محصول'       : 'Product',
                    fa ? 'سررسید'      : 'Due',
                    fa ? 'پرداخت شده' : 'Paid',
                    fa ? 'باقیمانده'  : 'Remaining',
                    fa ? 'وضعیت'       : 'Status',
                  ].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-start text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const st = STATUS_MAP[p.status] || { fa: p.status, en: p.status, color: '#94a3b8', icon: '' };
                  const isPayable = p.direction === 'payable';
                  return (
                    <tr key={p.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--background))] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--primary))] font-bold">{p.invoiceNo}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${isPayable ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                          {isPayable ? (fa ? '🔴 پرداختنی' : '🔴 Payable') : (fa ? '🟢 دریافتنی' : '🟢 Receivable')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 shrink-0"/>
                          {p.party}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] shrink-0"/>
                          <span className="font-medium text-sm truncate max-w-[140px]">{p.product}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 shrink-0"/>
                          {p.dueAt}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-500">
                        {p.paid > 0 ? fmt(p.paid) + (fa ? ' ریال' : ' IRR') : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: p.remaining > 0 ? '#f59e0b' : '#10b981' }}>
                        {p.remaining > 0 ? fmt(p.remaining) + (fa ? ' ریال' : ' IRR') : '✅'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium"
                          style={{ background: st.color + '20', color: st.color }}>
                          {st.icon} {fa ? st.fa : st.en}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
