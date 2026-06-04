'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store';
import { useInvoices, usePayInvoice } from '@/hooks/use-finance';
import { InvoiceDetailPage } from '@/modules/finance/components/invoice-detail';
import { InvoiceCreatePage } from '@/modules/finance/components/invoice-create';

// Matches spec's INV_STATUS_T (lowercase keys mapped to uppercase from API)
const STATUS_T: Record<string, { fa: string; en: string; icon: string; color: string; bg: string }> = {
  DRAFT:     { fa: 'پیش‌نویس',      en: 'Draft',     icon: '📝', color: '#64748b', bg: 'rgba(100,116,139,.1)' },
  SENT:      { fa: 'ارسال شده',     en: 'Sent',      icon: '📤', color: '#2563eb', bg: 'rgba(37,99,235,.1)'   },
  PARTIAL:   { fa: 'پرداخت جزئی',  en: 'Partial',   icon: '⚡', color: '#d97706', bg: 'rgba(217,119,6,.1)'   },
  PAID:      { fa: 'پرداخت شده',   en: 'Paid',      icon: '✅', color: '#059669', bg: 'rgba(5,150,105,.1)'   },
  OVERDUE:   { fa: 'سررسید گذشته', en: 'Overdue',   icon: '🔴', color: '#ef4444', bg: 'rgba(239,68,68,.1)'   },
  CANCELLED: { fa: 'لغو شده',       en: 'Cancelled', icon: '❌', color: '#6b7280', bg: 'rgba(107,114,128,.1)' },
  DISPUTED:  { fa: 'در اختلاف',    en: 'Disputed',  icon: '⚠️', color: '#8b5cf6', bg: 'rgba(139,92,246,.1)'  },
};

function fmt(n: any) {
  try { return Number(n).toLocaleString('fa-IR'); } catch { return String(n); }
}

export function MyInvoices() {
  const { lang } = useLocaleStore();
  const { user } = useAuthStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const myCompanyId = user?.companyId ?? 0;

  const [filter, setFilter]       = useState<'all' | 'issued' | 'received'>('all');
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [payingId, setPayingId]   = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('BANK_TRANSFER');
  const [payRef, setPayRef]       = useState('');

  const payInvoice = usePayInvoice();
  const { data: apiData, isLoading } = useInvoices();
  const raw: any[] = (apiData as any)?.data ?? [];

  const invoices = raw.map((r: any) => {
    const st = (r.status || 'DRAFT').toUpperCase();
    const isSeller = r.sellerCompanyId === myCompanyId;
    const peer = isSeller ? r.buyerCompany : r.sellerCompany;
    return {
      id:        r.id as string,
      no:        (r.invoiceNo || r.id?.slice(-8) || '—') as string,
      status:    st,
      isSeller,
      party:     (peer?.name || '—') as string,
      issuedAt:  r.issuedAt || (r.createdAt ? new Date(r.createdAt).toLocaleDateString('fa-IR') : '—'),
      dueAt:     r.dueAt || '—',
      total:     Number(r.total ?? 0),
      paid:      Number(r.paid ?? 0),
      remaining: Number(r.remaining ?? r.total ?? 0),
      vatPct:    r.items?.[0]?.taxPct ?? 9,
      items:     (r.items as any[]) || [],
    };
  });

  const displayed = invoices.filter(i =>
    filter === 'all' ? true : filter === 'issued' ? i.isSeller : !i.isSeller
  );

  // Stats
  const totalIssued   = invoices.filter(i => i.isSeller).reduce((s, i) => s + i.total, 0);
  const totalReceived = invoices.filter(i => !i.isSeller).reduce((s, i) => s + i.total, 0);
  const unpaid        = invoices.filter(i => ['SENT','PARTIAL','OVERDUE'].includes(i.status));

  // Alert: buyer-side unpaid invoices with total amount
  const buyerUnpaid      = unpaid.filter(i => !i.isSeller);
  const buyerUnpaidTotal = buyerUnpaid.reduce((s, i) => s + i.remaining, 0);

  // Render full-page sub-views
  if (viewingId) {
    return <InvoiceDetailPage invoiceId={viewingId} onBack={() => setViewingId(null)} />;
  }
  if (showCreate) {
    return <InvoiceCreatePage onBack={() => setShowCreate(false)} onCreated={() => setShowCreate(false)} />;
  }

  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  return (
    <div className="space-y-4">

      {/* 4-col stats — spec: کل / صادره / دریافتی / پرداخت نشده */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: '🧾', val: invoices.length,    label: fa ? 'کل فاکتورها'  : 'Total Invoices', color: '#3b82f6' },
          { icon: '📤', val: fmt(totalIssued),   label: fa ? 'صادره'         : 'Issued',         color: '#10b981' },
          { icon: '📥', val: fmt(totalReceived), label: fa ? 'دریافتی'       : 'Received',       color: '#06b6d4' },
          { icon: '⏳', val: unpaid.length,      label: fa ? 'پرداخت نشده'  : 'Unpaid',         color: '#ef4444' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-base font-bold leading-tight" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alert — buyer unpaid invoices with total amount */}
      {buyerUnpaid.length > 0 && (
        <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 text-sm text-amber-700 dark:text-amber-400">
          ⏳ <strong>{buyerUnpaid.length} {fa ? 'فاکتور' : 'invoice(s)'}</strong>{' '}
          {fa ? 'منتظر پرداخت شما' : 'awaiting your payment'}{' '}
          — {fa ? 'مبلغ:' : 'Amount:'} {fmt(buyerUnpaidTotal)}
        </div>
      )}

      {/* Main card */}
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">

        {/* Header: title + new invoice button */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
          <h2 className="font-bold">🧾 {fa ? 'فاکتورهای تجاری' : 'Trade Invoices'}</h2>
          <button
            onClick={() => setShowCreate(true)}
            className="px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))] text-white text-xs font-medium hover:opacity-90 transition-opacity"
          >
            + {fa ? 'فاکتور جدید' : 'New Invoice'}
          </button>
        </div>

        {/* Filter pills: همه / صادره / دریافتی */}
        <div className="flex gap-2 px-5 py-3 border-b border-[hsl(var(--border))]">
          {(['all', 'issued', 'received'] as const).map((f, i) => {
            const lbl = fa
              ? ['همه', 'صادره', 'دریافتی'][i]
              : ['All',  'Issued', 'Received'][i];
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: active ? 'hsl(var(--primary))' : 'hsl(var(--muted)/0.5)',
                  color: active ? '#fff' : 'hsl(var(--muted-foreground))',
                }}
              >
                {lbl}
              </button>
            );
          })}
        </div>

        {/* Invoice cards */}
        {isLoading ? (
          <div className="p-5 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-[hsl(var(--muted)/0.5)] animate-pulse" />)}
          </div>
        ) : displayed.length === 0 ? (
          <div className="py-16 text-center text-[hsl(var(--muted-foreground))]">
            <div className="text-5xl mb-3">🧾</div>
            <p>{fa ? 'فاکتوری ندارید' : 'No invoices yet'}</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {displayed.map(inv => {
              const st = STATUS_T[inv.status] ?? { fa: inv.status, en: inv.status, icon: '📄', color: '#94a3b8', bg: 'rgba(148,163,184,.1)' };
              const isUnpaid = ['SENT','PARTIAL','OVERDUE'].includes(inv.status);
              const itemsDesc = inv.items
                .map((it: any) => it.desc || it.description || '')
                .filter(Boolean)
                .join(' | ');
              return (
                <div
                  key={inv.id}
                  className="rounded-xl bg-[hsl(var(--background))] p-4"
                  style={{ borderRight: `4px solid ${st.color}` }}
                >
                  {/* Top row: badges + amount */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="font-mono text-sm font-bold" style={{ color: 'hsl(var(--primary))' }}>
                          {inv.no}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: st.bg, color: st.color }}>
                          {st.icon} {fa ? st.fa : st.en}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]">
                          {inv.isSeller
                            ? '📤 صادره'
                            : (fa ? '📥 دریافتی' : '📥 Received')}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs text-[hsl(var(--muted-foreground))] flex-wrap">
                        <span>{inv.isSeller ? (fa ? '🏢 خریدار:' : '🏢 Buyer:') : (fa ? '🏭 فروشنده:' : '🏭 Seller:')} {inv.party}</span>
                        <span>📅 {inv.issuedAt}</span>
                        <span>⏰ {fa ? 'سررسید:' : 'Due:'} {inv.dueAt}</span>
                      </div>
                      {itemsDesc && (
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 line-clamp-1 opacity-70">{itemsDesc}</p>
                      )}
                    </div>
                    <div className="text-end shrink-0">
                      <div className="font-bold text-sm">{fmt(inv.total)}</div>
                      <div className="text-[10px] text-[hsl(var(--muted-foreground))]">
                        {fa ? `شامل ${inv.vatPct}٪ مالیات` : `incl. ${inv.vatPct}% tax`}
                      </div>
                      {inv.remaining > 0 && inv.remaining < inv.total && (
                        <div className="text-xs text-amber-500 font-medium mt-0.5">
                          {fa ? 'مانده:' : 'Rem:'} {fmt(inv.remaining)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setViewingId(inv.id)}
                      className="px-3 py-1 rounded-lg bg-[hsl(var(--primary))] text-white text-xs font-medium hover:opacity-90 transition-opacity"
                    >
                      🧾 {fa ? 'مشاهده' : 'View'}
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1 rounded-lg border border-[hsl(var(--border))] text-xs hover:bg-[hsl(var(--muted)/0.5)] transition-colors"
                    >
                      🖨️ {fa ? 'چاپ' : 'Print'}
                    </button>
                    {/* 💳 Pay — buyer + unpaid */}
                    {!inv.isSeller && isUnpaid && (
                      <button
                        onClick={() => {
                          setPayingId(inv.id);
                          setPayAmount(String(inv.remaining || inv.total));
                          setPayMethod('BANK_TRANSFER');
                          setPayRef('');
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                        style={{ background: 'rgba(16,185,129,.12)', color: '#10b981' }}
                      >
                        💳 {fa ? 'پرداخت' : 'Pay'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pay modal */}
      {payingId && (() => {
        const inv = invoices.find(i => i.id === payingId);
        if (!inv) return null;
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-sm p-6 shadow-2xl">
              <h3 className="font-bold mb-1">💳 {fa ? 'پرداخت فاکتور' : 'Pay Invoice'}</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">{inv.no}</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">
                    {fa ? 'مبلغ' : 'Amount'}
                  </label>
                  <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} className={inp} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">
                    {fa ? 'روش پرداخت' : 'Payment Method'}
                  </label>
                  <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className={inp}>
                    <option value="BANK_TRANSFER">{fa ? 'انتقال بانکی' : 'Bank Transfer'}</option>
                    <option value="CARD">{fa ? 'کارت به کارت' : 'Card to Card'}</option>
                    <option value="CHEQUE">{fa ? 'چک' : 'Cheque'}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">
                    {fa ? 'کد رهگیری' : 'Reference No.'}
                  </label>
                  <input
                    value={payRef}
                    onChange={e => setPayRef(e.target.value)}
                    className={inp}
                    placeholder={fa ? 'شماره پیگیری' : 'Tracking number'}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setPayingId(null)}
                  className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)] transition-colors"
                >
                  {fa ? 'بعداً' : 'Later'}
                </button>
                <button
                  disabled={payInvoice.isPending}
                  onClick={() => {
                    if (!payAmount) { toast('error', fa ? 'مبلغ را وارد کنید' : 'Enter amount'); return; }
                    payInvoice.mutate(
                      { id: payingId, amount: Number(payAmount), paymentMethod: payMethod, referenceNo: payRef || undefined },
                      {
                        onSuccess: () => { toast('success', fa ? '✅ پرداخت ثبت شد' : '✅ Payment recorded'); setPayingId(null); },
                        onError: (e: any) => toast('error', e?.message || 'Error'),
                      }
                    );
                  }}
                  className="flex-1 py-2 rounded-lg bg-green-500 text-white text-sm font-bold hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  {payInvoice.isPending ? '...' : `✅ ${fa ? 'تایید پرداخت' : 'Confirm Pay'}`}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
