'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useRequests, useAcceptQuote, useQuotesForRequest } from '@/hooks/use-trading';
import { MessageSquare, Search, Package, Building2, Calendar, Check, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const STATUS_MAP: Record<string, { fa: string; en: string; color: string }> = {
  PENDING:   { fa: 'در انتظار', en: 'Pending',   color: '#f59e0b' },
  ACCEPTED:  { fa: 'پذیرفته',  en: 'Accepted',  color: '#10b981' },
  REJECTED:  { fa: 'رد شده',   en: 'Rejected',  color: '#ef4444' },
  pending:   { fa: 'در انتظار', en: 'Pending',   color: '#f59e0b' },
  accepted:  { fa: 'پذیرفته',  en: 'Accepted',  color: '#10b981' },
  rejected:  { fa: 'رد شده',   en: 'Rejected',  color: '#ef4444' },
};

function fmt(n: number) {
  return new Intl.NumberFormat('fa-IR').format(n);
}

function QuoteRow({ quote, fa, onAccept }: { quote: any; fa: boolean; onAccept: (id: string) => void }) {
  const st = STATUS_MAP[quote.status] || STATUS_MAP.pending;
  const canAccept = ['PENDING', 'pending'].includes(quote.status);
  return (
    <tr className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--background))] transition-colors">
      <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--primary))] font-bold">{quote.id?.slice(-6) || '—'}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]"/>
          <span className="text-sm font-medium">{quote.sellerName || quote.sellerCompany?.name || '—'}</span>
        </div>
      </td>
      <td className="px-4 py-3 font-bold text-sm">
        {quote.price || quote.amount
          ? fmt(quote.price || quote.amount) + (fa ? ' ریال' : ' IRR')
          : '—'}
      </td>
      <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
        {quote.validUntil
          ? new Date(quote.validUntil).toLocaleDateString(fa ? 'fa-IR' : 'en-US')
          : (quote.createdAt ? new Date(quote.createdAt).toLocaleDateString(fa ? 'fa-IR' : 'en-US') : '—')}
      </td>
      <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))] max-w-[150px] truncate">
        {quote.note || quote.description || '—'}
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: st.color + '20', color: st.color }}>
          {fa ? st.fa : st.en}
        </span>
      </td>
      <td className="px-4 py-3">
        {canAccept && (
          <button onClick={() => onAccept(quote.id)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-[hsl(var(--primary))] text-white rounded-lg font-bold hover:opacity-90 transition-opacity">
            <Check className="w-3 h-3"/>
            {fa ? 'پذیرش' : 'Accept'}
          </button>
        )}
      </td>
    </tr>
  );
}

function RequestWithQuotes({ req, fa, onAccept }: { req: any; fa: boolean; onAccept: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const { data: quotesData, isLoading } = useQuotesForRequest(expanded ? req.id : '');
  const quotes: any[] = (quotesData as any)?.data ?? (Array.isArray(quotesData) ? quotesData : []);
  const quoteCount = req._count?.quotes ?? req.quotesCount ?? 0;

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 bg-[hsl(var(--secondary))] cursor-pointer hover:bg-[hsl(var(--background))] transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Package className="w-4 h-4 text-[hsl(var(--muted-foreground))] shrink-0"/>
            <span className="font-semibold text-sm">{req.productName || req.title || fa ? 'محصول بدون نام' : 'Unnamed product'}</span>
            <span className="text-[10px] font-mono text-[hsl(var(--muted-foreground))]">#{req.id?.slice(-6)}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-[hsl(var(--muted-foreground))] flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3"/>
              {req.createdAt ? new Date(req.createdAt).toLocaleDateString(fa ? 'fa-IR' : 'en-US') : '—'}
            </span>
            {req.quantity && <span>{req.quantity} {req.unit || ''}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs px-2 py-1 rounded-full font-bold"
            style={{ background: '#3b82f620', color: '#3b82f6' }}>
            {quoteCount} {fa ? 'پیشنهاد' : 'quote(s)'}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-[hsl(var(--muted-foreground))]"/> : <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]"/>}
        </div>
      </div>

      {expanded && (
        <div>
          {isLoading ? (
            <div className="p-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
              <div className="w-5 h-5 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto mb-2"/>
              {fa ? 'در حال بارگذاری...' : 'Loading quotes...'}
            </div>
          ) : quotes.length === 0 ? (
            <div className="p-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30"/>
              {fa ? 'هنوز پیشنهادی ارائه نشده' : 'No quotes yet'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]">
                    {[fa?'شناسه':'ID', fa?'فروشنده':'Seller', fa?'قیمت':'Price', fa?'تاریخ':'Date', fa?'یادداشت':'Note', fa?'وضعیت':'Status', ''].map((h,i) => (
                      <th key={i} className="px-4 py-2 text-start text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((q: any) => (
                    <QuoteRow key={q.id} quote={q} fa={fa} onAccept={onAccept}/>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MyQuotes() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [search, setSearch] = useState('');

  const { data: raw, isLoading } = useRequests();
  const allRequests: any[] = (raw as any)?.data ?? [];
  const acceptQuote = useAcceptQuote();

  // Show requests that have at least some quotes (quoted status or explicitly have quote count)
  const requestsWithQuotes = allRequests.filter((r: any) =>
    ['quoted', 'QUOTED', 'approved', 'APPROVED'].includes(r.status) || (r._count?.quotes ?? 0) > 0
  );

  const filtered = requestsWithQuotes.filter((r: any) => {
    if (!search) return true;
    return (r.productName || r.title || '').toLowerCase().includes(search.toLowerCase());
  });

  const handleAccept = (quoteId: string) => {
    if (!confirm(fa ? 'این پیشنهاد پذیرفته شود؟' : 'Accept this quote?')) return;
    acceptQuote.mutate(quoteId, {
      onSuccess: () => alert(fa ? '✅ پیشنهاد پذیرفته شد' : '✅ Quote accepted'),
      onError: (e: any) => alert(e.message || (fa ? 'خطا' : 'Error')),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[hsl(var(--primary))]"/>
          {fa ? 'پیشنهادهای من' : 'My Quotes'}
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: fa ? 'کل درخواست‌های دارای پیشنهاد' : 'Requests w/ Quotes', value: requestsWithQuotes.length, color: '#3b82f6' },
          { label: fa ? 'در انتظار پذیرش' : 'Awaiting Acceptance', value: requestsWithQuotes.filter((r:any) => ['quoted','QUOTED'].includes(r.status)).length, color: '#f59e0b' },
          { label: fa ? 'پذیرفته شده' : 'Accepted', value: requestsWithQuotes.filter((r:any) => ['approved','APPROVED'].includes(r.status)).length, color: '#10b981' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
            <div className="font-bold text-xl" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-56">
        <Search className="absolute start-2.5 top-2.5 w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]"/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={fa ? 'جستجو در درخواست‌ها...' : 'Search requests...'}
          className="ps-8 pe-3 py-2 text-xs rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] outline-none w-full"/>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-16 text-center text-[hsl(var(--muted-foreground))]">
          <div className="w-7 h-7 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
          <p className="text-sm">{fa ? 'در حال بارگذاری...' : 'Loading...'}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-[hsl(var(--muted-foreground))] border border-dashed border-[hsl(var(--border))] rounded-xl">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20"/>
          <p className="text-sm font-medium">{fa ? 'پیشنهادی یافت نشد' : 'No quotes found'}</p>
          <p className="text-xs mt-1">{fa ? 'وقتی فروشندگان به درخواست‌های شما قیمت بدهند اینجا نشان داده می‌شود' : 'Quotes from sellers will appear here'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req: any) => (
            <RequestWithQuotes key={req.id} req={req} fa={fa} onAccept={handleAccept}/>
          ))}
        </div>
      )}

      {acceptQuote.isError && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/30 bg-red-500/5 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0"/>
          {(acceptQuote.error as any)?.message || (fa ? 'خطا در پذیرش پیشنهاد' : 'Error accepting quote')}
        </div>
      )}
    </div>
  );
}
