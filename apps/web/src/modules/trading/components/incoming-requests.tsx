'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useRequests } from '@/hooks/use-trading';
import { useUIStore } from '@/store';

interface Props { showQuotes?: boolean; }

export function IncomingRequests({ showQuotes }: Props = {}) {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const { data: rawRequests } = useRequests();
  const requests: any[] = rawRequests?.data ?? [];
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteNote, setQuoteNote] = useState('');

  const incoming = requests.filter((r: any) => r.type === 'incoming' || r.sellerAcc !== undefined);
  const pending = incoming.filter((r: any) => r.status === 'pending');
  const quoted = incoming.filter((r: any) => r.status === 'quoted');
  const won = incoming.filter((r: any) => ['paid','completed','issued'].includes(r.status));

  const display = showQuotes ? quoted : incoming;

  const filtered = display.filter((r: any) => {
    const matchFilter = filter === 'all' || r.status === filter;
    const matchSearch = !search ||
      (r.productName || r.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.buyerName || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filterOptions = showQuotes
    ? [{ id: 'all', label: fa ? 'همه' : 'All' }, { id: 'quoted', label: fa ? 'قیمت داده' : 'Quoted' }, { id: 'approved', label: fa ? 'تایید شده' : 'Approved' }]
    : [{ id: 'all', label: fa ? 'همه' : 'All' }, { id: 'pending', label: fa ? 'نیاز به قیمت' : 'Needs Quote' }, { id: 'quoted', label: fa ? 'قیمت داده' : 'Quoted' }, { id: 'approved', label: fa ? 'تایید شده' : 'Approved' }];

  const handleQuote = () => {
    if (!quoteAmount) { toast('error', fa ? 'مبلغ قیمت الزامی است' : 'Quote amount required'); return; }
    toast('success', fa ? `قیمت ${Number(quoteAmount).toLocaleString('fa-IR')} IRR ارسال شد` : `Quote ${Number(quoteAmount).toLocaleString()} IRR sent`);
    setSelected(null);
    setQuoteAmount('');
    setQuoteNote('');
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">
          {showQuotes ? (fa ? '💬 پیشنهادهای من' : '💬 My Quotes') : (fa ? '📥 درخواست‌های ورودی' : '📥 Incoming Requests')}
        </h1>
      </div>

      {/* 4-col stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: '📥', val: incoming.length, label: fa ? 'کل دریافتی' : 'Total Received', color: '#3b82f6' },
          { icon: '⏳', val: pending.length, label: fa ? 'نیاز به قیمت' : 'Needs Quoting', color: '#f59e0b' },
          { icon: '💬', val: quoted.length, label: fa ? 'قیمت‌دهی شده' : 'Quoted', color: '#8b5cf6' },
          { icon: '🏆', val: won.length, label: fa ? 'برنده شده' : 'Won', color: '#10b981' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
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

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={fa ? '🔍 جستجو بر اساس کالا یا شرکت خریدار...' : '🔍 Search by product or buyer...'}
        className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]"
      />

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-medium">{fa ? 'درخواستی دریافت نشده' : 'No incoming requests'}</p>
          <p className="text-sm mt-1">{fa ? 'درخواست‌های خریداران اینجا نمایش داده می‌شوند' : 'Buyer requests will appear here'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r: any) => {
            const statusColor: Record<string, string> = {
              pending: '#f59e0b', quoted: '#3b82f6', approved: '#10b981',
              paid: '#06b6d4', completed: '#10b981', rejected: '#ef4444',
            };
            const color = statusColor[r.status] || '#64748b';
            const statusLabelMap: Record<string, string> = {
              pending: fa ? 'در انتظار قیمت' : 'Needs Quote',
              quoted: fa ? 'قیمت داده شده' : 'Quoted',
              approved: fa ? 'تایید شده' : 'Approved',
              paid: fa ? 'پرداخت شده' : 'Paid',
              completed: fa ? 'تکمیل شده' : 'Completed',
              rejected: fa ? 'رد شده' : 'Rejected',
            };
            return (
              <div
                key={r.id}
                onClick={() => setSelected(r)}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 cursor-pointer hover:border-[hsl(var(--primary)/0.3)] transition-colors"
                style={{ borderRight: `4px solid ${color}` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-sm">{r.productName || r.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ background: color + '20', color }}>
                        {statusLabelMap[r.status] || r.status}
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs text-[hsl(var(--muted-foreground))] flex-wrap">
                      {r.buyerName && <span>🏢 {r.buyerName}</span>}
                      {r.quantity && <span>📦 {r.quantity} {r.unit}</span>}
                      {r.createdAt && <span>📅 {r.createdAt}</span>}
                      {r.amountIRR && <span className="text-amber-500 font-semibold">💰 {Number(r.amountIRR).toLocaleString('fa-IR')} IRR</span>}
                    </div>
                  </div>
                  {r.status === 'pending' && (
                    <button
                      className="px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))] text-white text-xs font-medium shrink-0"
                      onClick={e => { e.stopPropagation(); setSelected(r); setQuoteAmount(''); }}
                    >
                      💬 {fa ? 'اعلام قیمت' : 'Quote'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail / Quote Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">📋 {selected.productName || selected.title}</h2>
              <button onClick={() => setSelected(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-1 text-sm mb-4">
              {selected.buyerName && (
                <div className="flex justify-between py-2 border-b border-[hsl(var(--border)/0.5)]">
                  <span className="text-[hsl(var(--muted-foreground))]">{fa ? 'خریدار' : 'Buyer'}</span>
                  <span className="font-medium">🏢 {selected.buyerName}</span>
                </div>
              )}
              {selected.quantity && (
                <div className="flex justify-between py-2 border-b border-[hsl(var(--border)/0.5)]">
                  <span className="text-[hsl(var(--muted-foreground))]">{fa ? 'مقدار' : 'Quantity'}</span>
                  <span className="font-medium">{selected.quantity} {selected.unit}</span>
                </div>
              )}
              {selected.deadline && (
                <div className="flex justify-between py-2 border-b border-[hsl(var(--border)/0.5)]">
                  <span className="text-[hsl(var(--muted-foreground))]">{fa ? 'مهلت' : 'Deadline'}</span>
                  <span className="font-medium">⏰ {selected.deadline}</span>
                </div>
              )}
              {selected.description && (
                <p className="text-xs text-[hsl(var(--muted-foreground))] p-3 bg-[hsl(var(--muted)/0.3)] rounded-lg mt-2">{selected.description}</p>
              )}
            </div>
            {selected.status === 'pending' && (
              <div className="space-y-3 border-t border-[hsl(var(--border))] pt-4">
                <h3 className="font-semibold text-sm">💬 {fa ? 'اعلام قیمت' : 'Submit Quote'}</h3>
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">
                    {fa ? 'قیمت پیشنهادی (IRR) *' : 'Quote Amount (IRR) *'}
                  </label>
                  <input
                    type="number"
                    value={quoteAmount}
                    onChange={e => setQuoteAmount(e.target.value)}
                    placeholder="1000000000"
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">
                    {fa ? 'توضیحات قیمت' : 'Quote Notes'}
                  </label>
                  <textarea
                    value={quoteNote}
                    onChange={e => setQuoteNote(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)] resize-none"
                    placeholder={fa ? 'شرایط تحویل، ضمانت...' : 'Delivery terms, warranty...'}
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setSelected(null)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">
                    {fa ? 'انصراف' : 'Cancel'}
                  </button>
                  <button onClick={handleQuote} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
                    💬 {fa ? 'ارسال قیمت' : 'Send Quote'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
