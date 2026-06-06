'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useRequests, useCreateQuote } from '@/hooks/use-trading';
import { useUIStore } from '@/store';
import { useAuthStore } from '@/store/auth.store';

function fmtDate(iso: string) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('fa-IR'); } catch { return iso; }
}
function fmtNum(n: any) {
  try { return Number(n).toLocaleString('fa-IR'); } catch { return n; }
}

const STATUS_LABEL: Record<string, { fa: string; en: string; color: string }> = {
  PENDING:   { fa: '⏳ نیاز به قیمت',   en: '⏳ Needs Quote', color: '#f59e0b' },
  QUOTED:    { fa: '💬 قیمت داده شده',  en: '💬 Quoted',      color: '#3b82f6' },
  APPROVED:  { fa: '✅ تایید شده',      en: '✅ Approved',    color: '#10b981' },
  PAID:      { fa: '💳 پرداخت',         en: '💳 Paid',        color: '#06b6d4' },
  ISSUED:    { fa: '📜 صادر',           en: '📜 Issued',      color: '#8b5cf6' },
  COMPLETED: { fa: '✔️ تکمیل',         en: '✔️ Completed',   color: '#10b981' },
  REJECTED:  { fa: '❌ رد شده',         en: '❌ Rejected',    color: '#ef4444' },
  CANCELLED: { fa: '🚫 لغو',           en: '🚫 Cancelled',   color: '#94a3b8' },
};

const DELIVERY_OPTIONS = [
  { label: '۲۴ ساعته', days: 1 },
  { label: '۳ روزه',   days: 3 },
  { label: '۷ روزه',   days: 7 },
  { label: '۱۴ روزه',  days: 14 },
];

interface Props { showQuotes?: boolean; }

export function IncomingRequests({ showQuotes }: Props = {}) {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const { user } = useAuthStore();
  const { data: rawRequests } = useRequests();
  const requests: any[] = rawRequests?.data ?? [];
  const createQuote = useCreateQuote();

  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [deliveryDays, setDeliveryDays] = useState(7);
  const [quoteNote, setQuoteNote] = useState('');

  // Seller-side: requests directed at this company
  const incoming = requests.filter((r: any) => r.sellerCompanyId === user?.companyId);
  const pending   = incoming.filter((r: any) => (r.status || '').toUpperCase() === 'PENDING');
  const quoted    = incoming.filter((r: any) => (r.status || '').toUpperCase() === 'QUOTED');
  const won       = incoming.filter((r: any) => ['PAID', 'COMPLETED', 'ISSUED'].includes((r.status || '').toUpperCase()));

  const display = showQuotes ? quoted : incoming;

  const filtered = display.filter((r: any) => {
    const st = (r.status || '').toUpperCase();
    const matchFilter =
      filter === 'ALL' ||
      (filter === 'APPROVED' ? ['APPROVED', 'PAID', 'ISSUED', 'COMPLETED'].includes(st) : st === filter);
    const matchSearch =
      !search ||
      (r.product || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.buyerCompany?.name || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filterOptions = showQuotes
    ? [
        { id: 'ALL',      label: fa ? 'همه' : 'All' },
        { id: 'QUOTED',   label: fa ? 'قیمت داده' : 'Quoted' },
        { id: 'APPROVED', label: fa ? 'تایید شده' : 'Approved' },
      ]
    : [
        { id: 'ALL',      label: fa ? 'همه' : 'All' },
        { id: 'PENDING',  label: fa ? 'نیاز به قیمت' : 'Needs Quote' },
        { id: 'QUOTED',   label: fa ? 'قیمت داده شده' : 'Quoted' },
        { id: 'APPROVED', label: fa ? 'تایید شده' : 'Approved' },
      ];

  const handleQuote = () => {
    if (!quoteAmount) { toast('error', fa ? 'مبلغ قیمت الزامی است' : 'Quote amount required'); return; }
    createQuote.mutate(
      {
        requestId: selected.id,
        unitPrice: Number(quoteAmount),
        currency: 'IRR',
        deliveryDays,
        note: quoteNote || undefined,
      },
      {
        onSuccess: () => {
          toast('success', fa
            ? `قیمت ${fmtNum(quoteAmount)} ریال ارسال شد`
            : `Quote ${Number(quoteAmount).toLocaleString()} IRR sent`);
          setSelected(null); setQuoteAmount(''); setQuoteNote('');
        },
        onError: (err: any) => toast('error', err?.message || (fa ? 'خطا در ارسال قیمت' : 'Failed to send quote')),
      }
    );
  };

  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">
        {showQuotes
          ? (fa ? '💬 پیشنهادهای من' : '💬 My Quotes')
          : (fa ? '📥 درخواست‌های دریافتی' : '📥 Incoming Requests')}
      </h1>

      {/* 4-col stats — spec: Total / Needs Quoting / Quoted / Won */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: '📥', val: incoming.length, label: fa ? 'کل دریافتی'      : 'Total Received', color: '#3b82f6' },
          { icon: '⏳', val: pending.length,  label: fa ? 'نیاز به قیمت‌دهی' : 'Needs Quoting',  color: '#f59e0b' },
          { icon: '💬', val: quoted.length,   label: fa ? 'قیمت‌دهی شده'    : 'Quoted',         color: '#8b5cf6' },
          { icon: '🏆', val: won.length,      label: fa ? 'برنده شده'        : 'Won',            color: '#10b981' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 text-center relative overflow-hidden group hover:scale-[1.03] hover:shadow-md transition-all duration-200">
            <div className="absolute top-0 inset-x-0 h-1 rounded-t-xl" style={{ background: s.color }} />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-200 pointer-events-none" style={{ background: s.color }} />
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-xl font-bold leading-none" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter + Search — spec: select + input */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex gap-1.5 flex-wrap">
          {filterOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === opt.id
                  ? 'bg-[hsl(var(--primary))] text-white'
                  : 'bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={fa ? '🔍 جستجو...' : '🔍 Search...'}
          className="flex-1 min-w-[150px] px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">📥</div>
          <p className="font-medium">{fa ? 'درخواستی دریافت نشده' : 'No incoming requests'}</p>
          <p className="text-sm mt-1">{fa ? 'درخواست‌های خریداران اینجا نمایش داده می‌شوند' : 'Buyer requests will appear here'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r: any) => {
            const st = (r.status || '').toUpperCase();
            const meta = STATUS_LABEL[st] ?? { fa: r.status, en: r.status, color: '#64748b' };
            const isPending = st === 'PENDING';
            const borderColor = isPending ? '#f59e0b' : st === 'APPROVED' ? '#10b981' : '#e2e8f0';

            return (
              <div
                key={r.id}
                onClick={() => setSelected(r)}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 cursor-pointer hover:border-[hsl(var(--primary)/0.4)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-l-2"
                style={{ borderRight: `4px solid ${borderColor}`, borderLeftColor: borderColor }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-semibold text-sm">{r.product}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                        style={{ background: meta.color + '20', color: meta.color }}>
                        {fa ? meta.fa : meta.en}
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs text-[hsl(var(--muted-foreground))] flex-wrap">
                      {r.buyerCompany?.name && <span>🏢 {r.buyerCompany.name}</span>}
                      <span>📋 {r.id}</span>
                      <span>📅 {fmtDate(r.createdAt)}</span>
                      {r.qty && <span>📦 {r.qty} {r.unit || ''}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {r.amountIRR && (
                      <span className="text-xs font-bold" style={{ color: '#f59e0b' }}>
                        {fmtNum(r.amountIRR)} IRR
                      </span>
                    )}
                    {isPending && (
                      <button
                        onClick={e => { e.stopPropagation(); setSelected(r); setQuoteAmount(''); setQuoteNote(''); }}
                        className="px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))] text-white text-xs font-medium hover:opacity-90 transition-all active:scale-95"
                      >
                        💬 {fa ? 'قیمت‌دهی' : 'Quote'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail / Quote Modal — matches showQuoteForm spec */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">
                {(selected.status || '').toUpperCase() === 'PENDING'
                  ? `💬 ${fa ? 'اعلام قیمت' : 'Submit Quote'} — ${selected.id}`
                  : `📋 ${selected.product}`}
              </h2>
              <button onClick={() => setSelected(null)} className="text-xl text-[hsl(var(--muted-foreground))] leading-none">✕</button>
            </div>

            {/* Request summary box */}
            <div className="rounded-xl bg-[hsl(var(--muted)/0.4)] p-3 mb-4 space-y-1.5 text-sm">
              {selected.buyerCompany?.name && (
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">{fa ? 'خریدار:' : 'Buyer:'}</span>
                  <strong>{selected.buyerCompany.name}</strong>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">{fa ? 'کالا:' : 'Product:'}</span>
                <strong>{selected.product}</strong>
              </div>
              {selected.qty && (
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">{fa ? 'مقدار:' : 'Qty:'}</span>
                  <span>{selected.qty} {selected.unit || ''}</span>
                </div>
              )}
              {selected.note && (
                <p className="text-xs text-[hsl(var(--muted-foreground))] pt-1 border-t border-[hsl(var(--border)/0.5)]">
                  {selected.note}
                </p>
              )}
            </div>

            {/* Quote form — only for PENDING */}
            {(selected.status || '').toUpperCase() === 'PENDING' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">
                    {fa ? 'قیمت (ریال)' : 'Price (IRR)'}
                  </label>
                  <input
                    type="number"
                    value={quoteAmount}
                    onChange={e => setQuoteAmount(e.target.value)}
                    placeholder={fa ? 'مبلغ' : 'Amount'}
                    className={inp}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">
                    {fa ? 'زمان تحویل' : 'Delivery Time'}
                  </label>
                  <select
                    value={deliveryDays}
                    onChange={e => setDeliveryDays(Number(e.target.value))}
                    className={inp}
                  >
                    {DELIVERY_OPTIONS.map(o => (
                      <option key={o.days} value={o.days}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">
                    {fa ? 'توضیحات' : 'Notes'}
                  </label>
                  <textarea
                    value={quoteNote}
                    onChange={e => setQuoteNote(e.target.value)}
                    rows={2}
                    className={inp + ' resize-none'}
                    placeholder={fa ? 'شرایط...' : 'Terms...'}
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setSelected(null)}
                    className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)] transition-colors"
                  >
                    {fa ? 'انصراف' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleQuote}
                    disabled={createQuote.isPending}
                    className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all active:scale-95"
                  >
                    {createQuote.isPending
                      ? (fa ? 'در حال ارسال...' : 'Sending...')
                      : `📤 ${fa ? 'ارسال' : 'Submit'}`}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)] transition-colors"
                >
                  {fa ? 'بستن' : 'Close'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
