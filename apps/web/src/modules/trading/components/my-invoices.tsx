'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { Receipt, Search, Eye, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const MOCK_INVOICES = [
  { id: 'INV-2024-001', no: '۱۴۰۳/۰۰۱', type: 'purchase', status: 'paid',    seller: 'مهر پارس',       product: 'روغن پالم ۲۰ تن',   amount: 4200000000, dueAt: '۱۴۰۳/۰۱/۳۱', issuedAt: '۱۴۰۳/۰۱/۱۵' },
  { id: 'INV-2024-002', no: '۱۴۰۳/۰۰۲', type: 'purchase', status: 'overdue', seller: 'ارمغان لجستیک', product: 'حمل و نقل بین‌الملل', amount:  980000000, dueAt: '۱۴۰۳/۰۲/۱۰', issuedAt: '۱۴۰۳/۰۱/۲۵' },
  { id: 'INV-2024-003', no: '۱۴۰۳/۰۰۳', type: 'purchase', status: 'sent',    seller: 'تجارت نوین',     product: 'مواد اولیه شیمیایی',  amount: 1600000000, dueAt: '۱۴۰۳/۰۳/۰۵', issuedAt: '۱۴۰۳/۰۲/۲۰' },
  { id: 'INV-2024-004', no: '۱۴۰۳/۰۰۴', type: 'sale',     status: 'draft',   seller: 'الفا بازرگانی',  product: 'صادرات ادویه جات',    amount:  750000000, dueAt: '۱۴۰۳/۰۳/۱۵', issuedAt: '۱۴۰۳/۰۳/۰۱' },
  { id: 'INV-2024-005', no: '۱۴۰۳/۰۰۵', type: 'purchase', status: 'partial', seller: 'مهر پارس',       product: 'روغن آفتابگردان ۱۵ تن',amount: 3100000000, dueAt: '۱۴۰۳/۰۳/۲۰', issuedAt: '۱۴۰۳/۰۳/۰۵' },
];

const STATUS_MAP = {
  draft:     { fa: 'پیش‌نویس',      en: 'Draft',     color: '#94a3b8', icon: <Clock className="w-3 h-3"/> },
  sent:      { fa: 'ارسال شده',     en: 'Sent',      color: '#3b82f6', icon: <Receipt className="w-3 h-3"/> },
  paid:      { fa: 'پرداخت شده',    en: 'Paid',      color: '#10b981', icon: <CheckCircle className="w-3 h-3"/> },
  partial:   { fa: 'پرداخت جزئی',  en: 'Partial',   color: '#f59e0b', icon: <AlertCircle className="w-3 h-3"/> },
  overdue:   { fa: 'سررسید گذشته', en: 'Overdue',   color: '#ef4444', icon: <AlertCircle className="w-3 h-3"/> },
  cancelled: { fa: 'لغو شده',       en: 'Cancelled', color: '#6b7280', icon: <AlertCircle className="w-3 h-3"/> },
} as const;

function fmt(n: number) {
  return new Intl.NumberFormat('fa-IR').format(n);
}

export function MyInvoices() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const invoices = MOCK_INVOICES;

  const filtered = invoices.filter(inv => {
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchType   = typeFilter   === 'all' || inv.type   === typeFilter;
    const matchSearch = !search ||
      inv.product.includes(search) || inv.seller.includes(search) || inv.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const totalPaid    = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalUnpaid  = invoices.filter(i => ['sent','partial','overdue'].includes(i.status)).reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').length;

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
          { label: fa ? 'کل فاکتورها' : 'Total', value: String(invoices.length), color: '#3b82f6' },
          { label: fa ? 'پرداخت شده' : 'Paid',   value: fmt(totalPaid), color: '#10b981' },
          { label: fa ? 'پرداخت نشده' : 'Unpaid',value: fmt(totalUnpaid), color: '#f59e0b' },
          { label: fa ? 'سررسید گذشته' : 'Overdue',value: String(totalOverdue), color: '#ef4444' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
            <div className="font-bold text-lg" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {totalOverdue > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/30 bg-red-500/5 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0"/>
          {fa
            ? `${totalOverdue} فاکتور سررسید گذشته دارید. لطفاً هرچه سریع‌تر پرداخت کنید.`
            : `You have ${totalOverdue} overdue invoice(s). Please settle them promptly.`}
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
          <option value="all">{fa ? 'همه وضعیت‌ها' : 'All Status'}</option>
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

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30"/>
            <p className="text-sm">{fa ? 'فاکتوری یافت نشد' : 'No invoices found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  {[fa?'شماره':'No.', fa?'نوع':'Type', fa?'طرف حساب':'Party', fa?'محصول':'Product', fa?'سررسید':'Due', fa?'مبلغ':'Amount', fa?'وضعیت':'Status', ''].map((h,i) => (
                    <th key={i} className="px-3 py-2.5 text-start text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => {
                  const st = STATUS_MAP[inv.status as keyof typeof STATUS_MAP];
                  return (
                    <tr key={inv.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--background))] transition-colors">
                      <td className="px-3 py-3 font-mono text-xs text-[hsl(var(--primary))] font-bold">{inv.no}</td>
                      <td className="px-3 py-3">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${inv.type === 'purchase' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                          {inv.type === 'purchase' ? (fa ? 'خرید' : 'Purchase') : (fa ? 'فروش' : 'Sale')}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-[hsl(var(--muted-foreground))]">{inv.seller}</td>
                      <td className="px-3 py-3 font-medium text-sm">{inv.product}</td>
                      <td className="px-3 py-3 text-xs text-[hsl(var(--muted-foreground))]">{inv.dueAt}</td>
                      <td className="px-3 py-3 font-bold text-sm">{fmt(inv.amount)}<span className="text-[10px] font-normal text-[hsl(var(--muted-foreground))] ms-1">{fa?'ریال':'IRR'}</span></td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium"
                          style={{ background: st.color + '20', color: st.color }}>
                          {st.icon} {fa ? st.fa : st.en}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]">
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
    </div>
  );
}
