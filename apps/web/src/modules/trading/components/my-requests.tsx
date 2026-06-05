'use client';
import { useState, useEffect } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useRequests, useCreateRequest, useConnections, useAcceptQuote, useCancelRequest, useQuotesForRequest } from '@/hooks/use-trading';
import { useUIStore } from '@/store';
import { useAuthStore } from '@/store/auth.store';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b', QUOTED: '#3b82f6', APPROVED: '#10b981',
  PAID: '#06b6d4', ISSUED: '#8b5cf6', COMPLETED: '#10b981',
  CANCELLED: '#94a3b8', REJECTED: '#ef4444',
};
const STATUS_ICONS: Record<string, string> = {
  PENDING: '⏳', QUOTED: '💬', APPROVED: '✅', PAID: '💳',
  ISSUED: '📜', COMPLETED: '✔️', CANCELLED: '🚫', REJECTED: '❌',
};
const STATUS_LABELS: Record<string, { fa: string; en: string }> = {
  PENDING:   { fa: '⏳ در انتظار',   en: '⏳ Pending' },
  QUOTED:    { fa: '💬 قیمت آمد',    en: '💬 Quoted' },
  APPROVED:  { fa: '✅ تایید شده',   en: '✅ Approved' },
  PAID:      { fa: '💳 پرداخت شده', en: '💳 Paid' },
  ISSUED:    { fa: '📜 صادر شده',    en: '📜 Issued' },
  COMPLETED: { fa: '✔️ تکمیل شده',  en: '✔️ Completed' },
  CANCELLED: { fa: '🚫 لغو شده',    en: '🚫 Cancelled' },
  REJECTED:  { fa: '❌ رد شده',      en: '❌ Rejected' },
};

function fmtDate(iso: string) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('fa-IR'); } catch { return iso; }
}

export function MyRequests() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const { user } = useAuthStore();
  const { data: rawRequests, isLoading } = useRequests();
  const allRequests: any[] = rawRequests?.data ?? [];
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [confirmTarget, setConfirmTarget] = useState<any>(null);

  // Buyer-side only — spec: r.buyerAcc===curAcc.id
  const requests = allRequests.filter((r: any) => r.buyerCompanyId === user?.companyId);

  const tabLabel: Record<string, { fa: string; en: string }> = {
    ALL:      { fa: 'همه',        en: 'All' },
    PENDING:  { fa: 'در انتظار',  en: 'Pending' },
    QUOTED:   { fa: 'قیمت آمد',  en: 'Quoted' },
    APPROVED: { fa: 'تایید شده', en: 'Approved' },
    REJECTED: { fa: 'رد شده',    en: 'Rejected' },
  };

  const filtered = requests.filter((r: any) => {
    const st = (r.status || '').toUpperCase();
    const matchStatus =
      filter === 'ALL' ||
      (filter === 'APPROVED' ? ['APPROVED', 'PAID', 'ISSUED', 'COMPLETED'].includes(st) : st === filter);
    const matchSearch = !search || (r.product || r.title || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    ALL:      requests.length,
    PENDING:  requests.filter(r => (r.status || '').toUpperCase() === 'PENDING').length,
    QUOTED:   requests.filter(r => (r.status || '').toUpperCase() === 'QUOTED').length,
    APPROVED: requests.filter(r => ['APPROVED','PAID','ISSUED','COMPLETED'].includes((r.status || '').toUpperCase())).length,
    REJECTED: requests.filter(r => ['REJECTED','CANCELLED'].includes((r.status || '').toUpperCase())).length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">📋 {fa ? 'درخواست‌های من' : 'My Requests'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{filtered.length} {fa ? 'درخواست' : 'requests'}</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          ➕ {fa ? 'درخواست جدید' : 'New Request'}
        </button>
      </div>

      {/* 5-column stats */}
      <div className="grid grid-cols-5 gap-2">
        {(['ALL','PENDING','QUOTED','APPROVED','REJECTED'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`p-3 rounded-xl border text-center transition-all ${
              filter === s
                ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)]'
                : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary))] hover:border-[hsl(var(--primary)/0.3)]'
            }`}
          >
            <div className="text-lg font-bold" style={{ color: s === 'ALL' ? 'hsl(var(--foreground))' : (STATUS_COLORS[s] || '#64748b') }}>
              {counts[s]}
            </div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))] leading-tight">
              {fa ? tabLabel[s].fa : tabLabel[s].en}
            </div>
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={fa ? '🔍 جستجو در درخواست‌ها...' : '🔍 Search requests...'}
        className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]"
      />

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-[hsl(var(--muted)/0.5)] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">📋</div>
          <p className="font-medium">{fa ? 'درخواستی ثبت نشده' : 'No requests yet'}</p>
          <button
            onClick={() => setShowNew(true)}
            className="mt-3 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            + {fa ? 'درخواست جدید' : 'New Request'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r: any) => (
            <RequestCard
              key={r.id}
              request={r}
              lang={lang}
              onSelect={() => setSelected(r)}
              onConfirm={() => setConfirmTarget(r)}
              onReject={() => setConfirmTarget({ ...r, _rejecting: true })}
            />
          ))}
        </div>
      )}

      {showNew && <NewRequestModal lang={lang} onClose={() => setShowNew(false)} />}
      {selected && (
        <RequestDetailModal
          request={selected}
          lang={lang}
          onClose={() => setSelected(null)}
          onConfirm={() => { setSelected(null); setConfirmTarget(selected); }}
          onReject={() => { setSelected(null); setConfirmTarget({ ...selected, _rejecting: true }); }}
        />
      )}
      {confirmTarget && (
        <QuoteActionModal
          request={confirmTarget}
          lang={lang}
          onClose={() => setConfirmTarget(null)}
        />
      )}
    </div>
  );
}

function RequestCard({
  request: r, lang, onSelect, onConfirm, onReject,
}: {
  request: any; lang: string;
  onSelect: () => void; onConfirm: () => void; onReject: () => void;
}) {
  const fa = lang === 'fa';
  const st = (r.status || '').toUpperCase();
  const color = STATUS_COLORS[st] || '#64748b';
  const label = STATUS_LABELS[st] ? (fa ? STATUS_LABELS[st].fa : STATUS_LABELS[st].en) : r.status;
  const isQuoted = st === 'QUOTED';

  return (
    <div
      className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 hover:border-[hsl(var(--primary)/0.3)] transition-colors cursor-pointer border-l-2"
      style={{ borderRight: `4px solid ${isQuoted ? '#3b82f6' : st === 'APPROVED' ? '#10b981' : st === 'REJECTED' || st === 'CANCELLED' ? '#ef4444' : color}`, borderLeftColor: isQuoted ? '#3b82f6' : st === 'APPROVED' ? '#10b981' : st === 'REJECTED' || st === 'CANCELLED' ? '#ef4444' : color }}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-semibold text-sm truncate">{r.product || r.title || (fa ? 'درخواست' : 'Request')}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0" style={{ background: `${color}20`, color }}>
              {label}
            </span>
          </div>
          {/* Meta row: seller / id / date / qty — matches spec */}
          <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))] flex-wrap">
            {r.sellerCompany?.name && <span>🏭 {r.sellerCompany.name}</span>}
            <span>📋 {r.id}</span>
            {r.createdAt && <span>📅 {fmtDate(r.createdAt)}</span>}
            {r.qty && <span>📦 {Number(r.qty)} {r.unit || ''}</span>}
          </div>
          {r.note && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1.5 line-clamp-1">💬 {r.note}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0" onClick={e => e.stopPropagation()}>
          {r.amountIRR && (
            <span className="text-sm font-bold" style={{ color: '#f59e0b' }}>
              {Number(r.amountIRR).toLocaleString('fa-IR')} IRR
            </span>
          )}
          {isQuoted ? (
            <div className="flex gap-1.5">
              <button
                onClick={onConfirm}
                className="px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 text-xs font-bold hover:bg-green-500/20 transition-colors"
              >
                ✅ {fa ? 'تایید' : 'Confirm'}
              </button>
              <button
                onClick={onReject}
                className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-colors"
              >
                ❌
              </button>
            </div>
          ) : (
            <button
              onClick={onSelect}
              className="text-xs px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)] transition-colors"
            >
              {fa ? 'جزئیات' : 'Details'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function RequestDetailModal({
  request: r, lang, onClose, onConfirm, onReject,
}: {
  request: any; lang: string; onClose: () => void; onConfirm: () => void; onReject: () => void;
}) {
  const fa = lang === 'fa';
  const st = (r.status || '').toUpperCase();
  const color = STATUS_COLORS[st] || '#64748b';
  const label = STATUS_LABELS[st] ? (fa ? STATUS_LABELS[st].fa : STATUS_LABELS[st].en) : r.status;
  const fields: [string, any][] = [
    [fa ? 'نام کالا' : 'Product',   r.product || r.title],
    [fa ? 'فروشنده' : 'Seller',     r.sellerCompany?.name],
    [fa ? 'مقدار' : 'Quantity',     r.qty ? `${Number(r.qty)} ${r.unit || ''}` : null],
    [fa ? 'مبلغ' : 'Amount',        r.amountIRR ? `${Number(r.amountIRR).toLocaleString('fa-IR')} IRR` : null],
    [fa ? 'تاریخ' : 'Date',         r.createdAt ? fmtDate(r.createdAt) : null],
    [fa ? 'وضعیت' : 'Status',       label],
  ].filter(([, v]) => v) as [string, any][];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">📋 {r.product || r.title || (fa ? 'درخواست' : 'Request')}</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] text-xl leading-none">✕</button>
        </div>
        <span className="text-xs px-2 py-1 rounded-full mb-4 inline-block" style={{ background: color + '20', color }}>
          {STATUS_ICONS[st]} {label}
        </span>
        <div className="space-y-1 mt-3">
          {fields.map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm py-2 border-b border-[hsl(var(--border)/0.5)]">
              <span className="text-[hsl(var(--muted-foreground))]">{k}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </div>
        {r.note && (
          <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))] p-3 bg-[hsl(var(--muted)/0.3)] rounded-lg">💬 {r.note}</p>
        )}
        {st === 'QUOTED' ? (
          <div className="flex gap-3 mt-5">
            <button onClick={onConfirm} className="flex-1 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 text-sm font-bold hover:bg-green-500/20 transition-colors">
              ✅ {fa ? 'تایید قیمت' : 'Confirm Quote'}
            </button>
            <button onClick={onReject} className="flex-1 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-bold hover:bg-red-500/20 transition-colors">
              ❌ {fa ? 'رد قیمت' : 'Reject Quote'}
            </button>
          </div>
        ) : (
          <div className="mt-5 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
              {fa ? 'بستن' : 'Close'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function QuoteActionModal({ request: r, lang, onClose }: { request: any; lang: string; onClose: () => void }) {
  const fa = lang === 'fa';
  const { toast } = useUIStore();
  const isRejecting = r._rejecting === true;
  const acceptQuote = useAcceptQuote();
  const cancelRequest = useCancelRequest();
  const { data: quotesRaw } = useQuotesForRequest(r.id);
  const quotes: any[] = Array.isArray(quotesRaw) ? quotesRaw : (quotesRaw as any)?.data ?? [];
  // Pick the first PENDING quote (the seller's offer)
  const pendingQuote = quotes.find((q: any) => (q.status || '').toUpperCase() === 'PENDING');

  if (isRejecting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-sm p-6 shadow-2xl text-center">
          <div className="text-3xl mb-3">❌</div>
          <p className="font-medium mb-1">{fa ? 'رد قیمت' : 'Reject Quote'}</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-5">{r.product}</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
              {fa ? 'انصراف' : 'Cancel'}
            </button>
            <button
              disabled={cancelRequest.isPending}
              onClick={() => cancelRequest.mutate(r.id, {
                onSuccess: () => { toast('success', fa ? 'درخواست لغو شد' : 'Request cancelled'); onClose(); },
                onError: (e: any) => toast('error', e?.message || 'Error'),
              })}
              className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {cancelRequest.isPending ? '...' : (fa ? 'بله، رد کن' : 'Yes, Reject')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-sm p-6 shadow-2xl">
        <h2 className="font-bold mb-4">✅ {fa ? 'تایید قیمت' : 'Confirm Quote'}</h2>
        <div className="rounded-xl bg-[hsl(var(--muted)/0.4)] p-4 mb-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">{fa ? 'کالا:' : 'Product:'}</span>
            <strong>{r.product}</strong>
          </div>
          {r.amountIRR && (
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">{fa ? 'مبلغ:' : 'Amount:'}</span>
              <strong style={{ color: '#f59e0b' }}>{Number(r.amountIRR).toLocaleString('fa-IR')} IRR</strong>
            </div>
          )}
          {pendingQuote?.deliveryDays && (
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">{fa ? 'زمان تحویل:' : 'Delivery:'}</span>
              <span>{pendingQuote.deliveryDays} {fa ? 'روز' : 'days'}</span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
            {fa ? 'انصراف' : 'Cancel'}
          </button>
          <button
            disabled={acceptQuote.isPending || !pendingQuote}
            onClick={() => {
              if (!pendingQuote) { toast('error', fa ? 'قیمتی یافت نشد' : 'No quote found'); return; }
              acceptQuote.mutate(pendingQuote.id, {
                onSuccess: () => { toast('success', fa ? '✅ قیمت تایید شد' : '✅ Quote confirmed'); onClose(); },
                onError: (e: any) => toast('error', e?.message || 'Error'),
              });
            }}
            className="flex-1 py-2 rounded-lg bg-green-500 text-white text-sm font-bold hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {acceptQuote.isPending ? '...' : `✅ ${fa ? 'تایید' : 'Confirm'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function NewRequestModal({ lang, onClose }: { lang: string; onClose: () => void }) {
  const fa = lang === 'fa';
  const { toast } = useUIStore();
  const { user } = useAuthStore();
  const createRequest = useCreateRequest();
  const { data: rawConns } = useConnections();
  const conns: any[] = (rawConns as any)?.data ?? [];

  const sellers = conns.map((c: any) => {
    const isA = c.companyAId === user?.companyId;
    const peer = isA ? c.companyB : c.companyA;
    return { id: String(peer?.id ?? ''), name: peer?.name ?? '' };
  }).filter(s => s.id && s.name);

  const [sellerId, setSellerId] = useState('');
  const [product, setProduct] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('تن');
  const [note, setNote] = useState('');

  // Auto-select first seller once connections load
  useEffect(() => {
    if (sellers.length && !sellerId) setSellerId(sellers[0].id);
  }, [sellers.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  // Show empty state only after connections have loaded (rawConns is defined)
  if (rawConns !== undefined && !sellers.length) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-sm p-6 shadow-2xl text-center">
          <div className="text-4xl mb-3">🔌</div>
          <h2 className="font-bold mb-2">
            {fa ? 'ابتدا باید به یک تامین‌کننده متصل شوید' : 'First connect to a supplier'}
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
            {fa ? 'برای ثبت درخواست خرید باید یک اتصال فعال داشته باشید.' : 'You need an active connection to submit a purchase request.'}
          </p>
          <div className="flex gap-2 justify-center">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
              {fa ? 'بستن' : 'Close'}
            </button>
            <a href="/connections" onClick={onClose} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
              🔗 {fa ? 'کد دعوت' : 'Invite Code'}
            </a>
          </div>
        </div>
      </div>
    );
  }

  function handleSubmit() {
    if (!product.trim()) { toast('error', fa ? 'نام کالا الزامی است' : 'Product name required'); return; }
    if (!qty) { toast('error', fa ? 'مقدار الزامی است' : 'Quantity required'); return; }
    createRequest.mutate(
      {
        sellerCompanyId: sellerId ? Number(sellerId) : undefined,
        product: product.trim(),
        qty: Number(qty),
        unit,
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => { toast('success', fa ? 'درخواست ثبت شد' : 'Request submitted'); onClose(); },
        onError: (err: any) => toast('error', err?.message || (fa ? 'خطا در ثبت درخواست' : 'Failed to submit')),
      }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-[580px] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">📋 {fa ? 'درخواست جدید' : 'New Request'}</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] text-xl leading-none">✕</button>
        </div>
        <div className="space-y-4">
          {/* Supplier */}
          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">
              {fa ? 'تامین‌کننده' : 'Supplier'}
            </label>
            <select value={sellerId} onChange={e => setSellerId(e.target.value)} className={inp}>
              {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          {/* Product Name */}
          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">
              {fa ? 'نام کالا' : 'Product Name'}
            </label>
            <input
              value={product}
              onChange={e => setProduct(e.target.value)}
              className={inp}
              placeholder={fa ? 'مثال: روغن پالم، شکر' : 'e.g. Palm oil, Sugar'}
            />
          </div>
          {/* Quantity + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">
                {fa ? 'مقدار' : 'Quantity'}
              </label>
              <input
                type="number"
                value={qty}
                onChange={e => setQty(e.target.value)}
                className={inp}
                placeholder={fa ? 'عدد' : 'Number'}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">
                {fa ? 'واحد' : 'Unit'}
              </label>
              <select value={unit} onChange={e => setUnit(e.target.value)} className={inp}>
                <option value="تن">{fa ? 'تن' : 'Ton'}</option>
                <option value="کیلوگرم">{fa ? 'کیلوگرم' : 'Kilogram'}</option>
                <option value="عدد">{fa ? 'عدد' : 'Unit'}</option>
                <option value="لیتر">{fa ? 'لیتر' : 'Liter'}</option>
              </select>
            </div>
          </div>
          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">
              {fa ? 'توضیحات' : 'Description'}
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              className={inp + ' resize-none'}
              placeholder={fa ? 'مشخصات فنی...' : 'Technical specs...'}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)] transition-colors"
          >
            {fa ? 'انصراف' : 'Cancel'}
          </button>
          <button
            disabled={createRequest.isPending}
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {createRequest.isPending
              ? (fa ? 'در حال ثبت...' : 'Submitting...')
              : `📤 ${fa ? 'ارسال' : 'Submit'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
