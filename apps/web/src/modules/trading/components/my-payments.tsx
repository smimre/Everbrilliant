'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useRequests } from '@/hooks/use-trading';
import { CreditCard, Clock, CheckCircle, Building2, Package, Calendar, Search } from 'lucide-react';

const STATUS_MAP: Record<string, { fa: string; en: string; color: string; icon: string }> = {
  pending:   { fa: 'در انتظار',     en: 'Pending',   color: '#f59e0b', icon: '⏳' },
  quoted:    { fa: 'قیمت‌دهی',     en: 'Quoted',    color: '#3b82f6', icon: '💬' },
  approved:  { fa: 'تایید شده',    en: 'Approved',  color: '#10b981', icon: '✅' },
  paid:      { fa: 'پرداخت شده',   en: 'Paid',      color: '#06b6d4', icon: '💳' },
  completed: { fa: 'تکمیل شده',   en: 'Completed', color: '#8b5cf6', icon: '✔️' },
  rejected:  { fa: 'رد شده',       en: 'Rejected',  color: '#ef4444', icon: '❌' },
};

function fmt(n: number) {
  return new Intl.NumberFormat('fa-IR').format(n);
}

export function MyPayments() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const { data: raw } = useRequests();
  const allRequests = (raw as any[]) || [];
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const reqs = allRequests.filter((r: any) => r.amountIRR || r.amount);

  const paid    = reqs.filter((r: any) => ['paid', 'completed'].includes(r.status));
  const pending = reqs.filter((r: any) => ['quoted', 'approved'].includes(r.status));
  const totalPaid    = paid.reduce((s: number, r: any) => s + (r.amountIRR || r.amount || 0), 0);
  const totalPending = pending.reduce((s: number, r: any) => s + (r.amountIRR || r.amount || 0), 0);

  const filtered = reqs.filter((r: any) => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchSearch = !search ||
      (r.productName || r.product || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.sellerName || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = [
    { icon: <CheckCircle className="w-5 h-5"/>, label: fa ? 'پرداخت شده' : 'Paid', value: fmt(totalPaid) + (fa ? ' ریال' : ' IRR'), color: '#10b981', bg: '#10b98115' },
    { icon: <Clock className="w-5 h-5"/>,       label: fa ? 'در انتظار پرداخت' : 'Pending', value: fmt(totalPending) + (fa ? ' ریال' : ' IRR'), color: '#f59e0b', bg: '#f59e0b15' },
    { icon: <CreditCard className="w-5 h-5"/>,  label: fa ? 'کل فاکتورها' : 'Total', value: String(reqs.length), color: '#3b82f6', bg: '#3b82f615' },
    { icon: <Building2 className="w-5 h-5"/>,   label: fa ? 'تامین‌کنندگان' : 'Suppliers', value: String(new Set(reqs.map((r: any) => r.sellerAcc || r.sellerId)).size), color: '#8b5cf6', bg: '#8b5cf615' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[hsl(var(--primary))]"/>
          {fa ? 'پرداخت‌های من' : 'My Payments'}
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] p-4" style={{ background: s.bg }}>
            <div className="flex items-center gap-2 mb-2" style={{ color: s.color }}>{s.icon}</div>
            <div className="font-bold text-sm" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative">
          <Search className="absolute start-2.5 top-2.5 w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]"/>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={fa ? 'جستجو...' : 'Search...'}
            className="ps-8 pe-3 py-2 text-xs rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] outline-none w-44"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] outline-none">
          <option value="all">{fa ? 'همه وضعیت‌ها' : 'All Status'}</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => (
            <option key={k} value={k}>{fa ? v.fa : v.en}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--secondary))]">
        <div className="p-4 border-b border-[hsl(var(--border))]">
          <h3 className="font-semibold text-sm">
            {fa ? `💳 پرداخت‌ها (${filtered.length})` : `💳 Payments (${filtered.length})`}
          </h3>
        </div>

        {filtered.length === 0 ? (
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
                    fa ? 'شناسه' : 'ID',
                    fa ? 'محصول' : 'Product',
                    fa ? 'فروشنده' : 'Seller',
                    fa ? 'تاریخ' : 'Date',
                    fa ? 'مبلغ' : 'Amount',
                    fa ? 'وضعیت' : 'Status',
                  ].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-start text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r: any) => {
                  const st = STATUS_MAP[r.status] || STATUS_MAP.pending;
                  const amount = r.amountIRR || r.amount || 0;
                  return (
                    <tr key={r.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--background))] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--primary))] font-bold">{r.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]"/>
                          <span className="font-medium text-sm">{r.productName || r.product || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3"/>
                          {r.sellerName || r.sellerAcc || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3"/>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString('fa-IR') : r.date || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-sm">
                        {amount > 0 ? fmt(amount) + (fa ? ' ریال' : ' IRR') : '—'}
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
