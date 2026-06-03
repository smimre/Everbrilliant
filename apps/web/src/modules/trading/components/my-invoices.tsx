'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useAuthStore } from '@/store/auth.store';
import { useInvoices } from '@/hooks/use-finance';
import { Receipt, Search, Eye, Download, AlertCircle, ExternalLink } from 'lucide-react';

const STATUS_MAP: Record<string, { fa: string; en: string; color: string }> = {
  DRAFT:     { fa: 'پیش‌نویس',      en: 'Draft',     color: '#94a3b8' },
  SENT:      { fa: 'ارسال شده',     en: 'Sent',      color: '#3b82f6' },
  PAID:      { fa: 'پرداخت شده',    en: 'Paid',      color: '#10b981' },
  PARTIAL:   { fa: 'پرداخت جزئی',  en: 'Partial',   color: '#f59e0b' },
  OVERDUE:   { fa: 'سررسید گذشته', en: 'Overdue',   color: '#ef4444' },
  CANCELLED: { fa: 'لغو شده',       en: 'Cancelled', color: '#6b7280' },
  DISPUTED:  { fa: 'مورد اعتراض',  en: 'Disputed',  color: '#8b5cf6' },
};

function fmt(n: number) {
  return new Intl.NumberFormat('fa-IR').format(n);
}

function normalizeInvoice(raw: any, myCompanyId: number) {
  const st = (raw.status || 'DRAFT').toUpperCase();
  const isSeller = raw.sellerCompanyId === myCompanyId;
  const peer = isSeller ? raw.buyerCompany : raw.sellerCompany;
  const product = raw.items?.[0]?.desc || raw.items?.[0]?.description || '—';

  return {
    id:       raw.id || '',
    no:       raw.invoiceNo || raw.id?.slice(-8) || '—',
    type:     isSeller ? 'sale' : 'purchase',
    status:   st,
    party:    peer?.name || (isSeller ? `Company #${raw.buyerCompanyId}` : `Company #${raw.sellerCompanyId}`),
    product,
    amount:   Number(raw.total ?? raw.subtotal ?? 0),
    paid:     Number(raw.paid ?? 0),
    remaining: Number(raw.remaining ?? raw.total ?? 0),
    dueAt:    raw.dueAt || '—',
    issuedAt: raw.issuedAt || (raw.createdAt ? new Date(raw.createdAt).toLocaleDateString('fa-IR') : '—'),
  };
}

export function MyInvoices() {
  const { lang } = useLocaleStore();
  const { user } = useAuthStore();
  const fa = lang === 'fa';
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter]   = useState('all');
  const [viewingId, setViewingId]     = useState<string | null>(null);

  const { data: apiData, isLoading } = useInvoices();
  const raw: any[] = (apiData as any)?.data ?? [];
  const myCompanyId = user?.companyId ?? 0;

  const invoices = raw.map(r => normalizeInvoice(r, myCompanyId));

  const filtered = invoices.filter(inv => {
    const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    const matchType   = typeFilter   === 'all' || inv.type   === typeFilter;
    const matchSearch = !search ||
      inv.product.toLowerCase().includes(search.toLowerCase()) ||
      inv.party.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const totalPaid    = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0);
  const totalUnpaid  = invoices.filter(i => ['SENT','PARTIAL','OVERDUE'].includes(i.status)).reduce((s, i) => s + i.remaining, 0);
  const totalOverdue = invoices.filter(i => i.status === 'OVERDUE').length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Receipt className="w-5 h-5 text-[hsl(var(--primary))]"/>
          {fa ? 'فاکتورهای من' : 'My Invoices'}
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: fa ? 'کل فاکتورها'   : 'Total',   value: String(invoices.length), color: '#3b82f6' },
          { label: fa ? 'پرداخت شده'    : 'Paid',    value: fmt(totalPaid),          color: '#10b981' },
          { label: fa ? 'پرداخت نشده'   : 'Unpaid',  value: fmt(totalUnpaid),        color: '#f59e0b' },
          { label: fa ? 'سررسید گذشته' : 'Overdue', value: String(totalOverdue),    color: '#ef4444' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
            <div className="font-bold text-lg" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {totalOverdue > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/30 bg-red-500/5 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0"/>
          {fa ? `${totalOverdue} فاکتور سررسید گذشته دارید.` : `${totalOverdue} overdue invoice(s). Please settle promptly.`}
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
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] outline-none">
          <option value="all">{fa ? 'همه انواع' : 'All Types'}</option>
          <option value="purchase">{fa ? 'خرید' : 'Purchase'}</option>
          <option value="sale">{fa ? 'فروش' : 'Sale'}</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--secondary))]">
        <div className="p-4 border-b border-[hsl(var(--border))]">
          <h3 className="font-semibold text-sm">🧾 {fa ? `فاکتورها (${filtered.length})` : `Invoices (${filtered.length})`}</h3>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
            <div className="w-6 h-6 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
            <p className="text-sm">{fa ? 'در حال بارگذاری...' : 'Loading...'}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30"/>
            <p className="text-sm">{fa ? 'فاکتوری یافت نشد' : 'No invoices found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  {[fa?'شماره':'No.', fa?'نوع':'Type', fa?'طرف حساب':'Party', fa?'محصول':'Product', fa?'سررسید':'Due', fa?'مبلغ':'Amount', fa?'وضعیت':'Status', ''].map((h, i) => (
                    <th key={i} className="px-3 py-2.5 text-start text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => {
                  const st = STATUS_MAP[inv.status] || { fa: inv.status, en: inv.status, color: '#94a3b8' };
                  return (
                    <tr key={inv.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--background))] transition-colors">
                      <td className="px-3 py-3 font-mono text-xs text-[hsl(var(--primary))] font-bold">{inv.no}</td>
                      <td className="px-3 py-3">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${inv.type === 'purchase' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                          {inv.type === 'purchase' ? (fa ? 'خرید' : 'Purchase') : (fa ? 'فروش' : 'Sale')}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-[hsl(var(--muted-foreground))]">{inv.party}</td>
                      <td className="px-3 py-3 font-medium text-sm max-w-[160px] truncate">{inv.product}</td>
                      <td className="px-3 py-3 text-xs text-[hsl(var(--muted-foreground))]">{inv.dueAt}</td>
                      <td className="px-3 py-3 font-bold text-sm">
                        {fmt(inv.amount)}<span className="text-[10px] font-normal text-[hsl(var(--muted-foreground))] ms-1">{fa?'ریال':'IRR'}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium"
                          style={{ background: st.color + '20', color: st.color }}>
                          {fa ? st.fa : st.en}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          <a href="/finance/invoices" title={fa ? 'مشاهده در مالی' : 'View in Finance'}
                            className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--primary))]">
                            <ExternalLink className="w-3.5 h-3.5"/>
                          </a>
                          <button onClick={() => setViewingId(inv.id)}
                            className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]">
                            <Eye className="w-3.5 h-3.5"/>
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]">
                            <Download className="w-3.5 h-3.5"/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick view modal */}
      {viewingId && (() => {
        const inv = filtered.find(i => i.id === viewingId);
        if (!inv) return null;
        const st = STATUS_MAP[inv.status] || { fa: inv.status, en: inv.status, color: '#94a3b8' };
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[hsl(var(--background))] rounded-2xl p-6 w-full max-w-md border border-[hsl(var(--border))]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">🧾 {fa ? 'جزئیات فاکتور' : 'Invoice Details'}</h3>
                <button onClick={() => setViewingId(null)} className="p-1 rounded-lg hover:bg-[hsl(var(--muted)/0.5)]">✕</button>
              </div>
              <dl className="space-y-2 text-sm">
                {[
                  [fa?'شماره':'Invoice No',     inv.no],
                  [fa?'نوع':'Type',              inv.type === 'purchase' ? (fa?'خرید':'Purchase') : (fa?'فروش':'Sale')],
                  [fa?'طرف حساب':'Party',        inv.party],
                  [fa?'محصول':'Product',         inv.product],
                  [fa?'مبلغ کل':'Total',        fmt(inv.amount) + (fa?' ریال':' IRR')],
                  [fa?'پرداخت شده':'Paid',       fmt(inv.paid) + (fa?' ریال':' IRR')],
                  [fa?'باقیمانده':'Remaining',   fmt(inv.remaining) + (fa?' ریال':' IRR')],
                  [fa?'تاریخ صدور':'Issued',     inv.issuedAt],
                  [fa?'سررسید':'Due',            inv.dueAt],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-1.5 border-b border-[hsl(var(--border))]">
                    <dt className="text-[hsl(var(--muted-foreground))]">{k}</dt>
                    <dd className="font-medium text-end">{v}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-4 py-1.5">
                  <dt className="text-[hsl(var(--muted-foreground))]">{fa?'وضعیت':'Status'}</dt>
                  <dd><span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: st.color + '20', color: st.color }}>{fa?st.fa:st.en}</span></dd>
                </div>
              </dl>
              <div className="flex gap-2 mt-4 justify-end">
                <button onClick={() => setViewingId(null)} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'بستن':'Close'}</button>
                <a href="/finance/invoices" className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-bold flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5"/> {fa ? 'مشاهده کامل' : 'Full View'}
                </a>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
