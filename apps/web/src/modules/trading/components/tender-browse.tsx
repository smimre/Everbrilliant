'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useUIStore } from '@/store';
import { useTenders, usePlaceBid } from '@/hooks/use-trading';

const INCOTERMS_2020 = ['EXW','FCA','FAS','FOB','CFR','CIF','CPT','CIP','DAP','DPU','DDP'];

const TYPE_COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4'];

function fmtDate(iso: string) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('fa-IR'); } catch { return iso; }
}

function companyInitials(name: string) {
  return (name || '?').slice(0, 2);
}

export function TenderBrowse() {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';

  const { data: raw, isLoading } = useTenders();
  const tenders: any[] = (raw as any)?.data ?? [];
  const placeBid = usePlaceBid();

  const [search, setSearch] = useState('');
  const [bidModal, setBidModal] = useState<any>(null);
  const [bidPrice, setBidPrice] = useState('');
  const [bidNote, setBidNote] = useState('');
  const [bidIncoterm, setBidIncoterm] = useState('FOB');
  const [bidDelivery, setBidDelivery] = useState('');
  const [detailModal, setDetailModal] = useState<any>(null);

  const filtered = tenders.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.products || []).some((p: any) => p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleBidSubmit = () => {
    if (!bidPrice) { toast('error', fa ? 'قیمت الزامی است' : 'Price required'); return; }
    placeBid.mutate(
      { tenderId: bidModal.id, totalPrice: Number(bidPrice), currency: 'IRR', note: bidNote, deliveryDays: bidDelivery ? Number(bidDelivery) : undefined },
      {
        onSuccess: () => { toast('success', fa ? 'پیشنهاد قیمت ثبت شد' : 'Bid submitted'); setBidModal(null); setBidPrice(''); setBidNote(''); },
        onError: (err: any) => toast('error', err?.message || (fa ? 'خطا در ثبت پیشنهاد' : 'Failed to submit bid')),
      }
    );
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{fa ? '🏷️ مزایده‌های فعال' : '🏷️ Active Auctions'}</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '🏷️', val: tenders.length, label: fa ? 'مزایده فعال' : 'Active Auctions', color: '#3b82f6' },
          { icon: '📦', val: tenders.filter(t => (t.type || '').toUpperCase() === 'AUCTION').length, label: fa ? 'مزایده' : 'Auction', color: '#8b5cf6' },
          { icon: '📋', val: tenders.filter(t => (t.type || '').toUpperCase() === 'TENDER').length, label: fa ? 'مناقصه' : 'Tender', color: '#10b981' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder={fa ? '🔍 جستجوی مزایده یا کالا...' : '🔍 Search auction or product...'}
        className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]"
      />

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-28 rounded-xl bg-[hsl(var(--muted)/0.5)] animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-2">🏷️</div>
          <p>{fa ? 'مزایده‌ای یافت نشد' : 'No auctions found'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t, idx) => {
            const color = TYPE_COLORS[idx % TYPE_COLORS.length];
            const companyName = t.company?.name || '';
            const isAuction = (t.type || '').toUpperCase() === 'AUCTION';
            return (
              <div key={t.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 hover:border-[hsl(var(--primary)/0.3)] transition-colors">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: color }}>
                      {companyInitials(companyName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm">{t.title}</div>
                      <div className="flex gap-2 text-xs text-[hsl(var(--muted-foreground))] mt-1 flex-wrap items-center">
                        {companyName && <span>🏭 {companyName}</span>}
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                          📅 {fmtDate(t.endDate)}
                        </span>
                        <span>👥 {t.bidsCount ?? 0} {fa ? 'پیشنهاد' : 'bids'}</span>
                        {isAuction && <span className="text-purple-400 font-medium">🔒 {fa ? 'مزایده' : 'Auction'}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setDetailModal(t)} className="text-xs px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
                      {fa ? 'جزئیات' : 'Details'}
                    </button>
                    <button
                      onClick={() => { setBidModal(t); setBidPrice(''); setBidNote(''); setBidIncoterm('FOB'); setBidDelivery(''); }}
                      className="text-xs px-3 py-1.5 bg-[hsl(var(--primary))] text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
                    >
                      💰 {fa ? 'پیشنهاد' : 'Bid'}
                    </button>
                  </div>
                </div>

                {/* Product chips */}
                <div className="flex gap-2 flex-wrap">
                  {(t.products || []).map((p: any, i: number) => (
                    <div key={i} className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg px-2.5 py-1.5 text-xs">
                      <span className="font-semibold">📦 {p.name}</span>
                      <span className="text-[hsl(var(--muted-foreground))] mx-1.5">{Number(p.qty)} {p.unit}</span>
                    </div>
                  ))}
                </div>

                {t.description && (
                  <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))] line-clamp-1">📝 {t.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--background))] rounded-2xl p-6 w-full max-w-lg border border-[hsl(var(--border))] my-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base">🏷️ {detailModal.title}</h3>
              <button onClick={() => setDetailModal(null)} className="text-[hsl(var(--muted-foreground))] text-xl">✕</button>
            </div>
            <div className="space-y-1.5 mb-4">
              {[
                [fa ? 'برگزارکننده' : 'Owner', detailModal.company?.name],
                [fa ? 'مهلت' : 'Deadline', fmtDate(detailModal.endDate)],
                [fa ? 'نوع' : 'Type', (detailModal.type || '').toUpperCase() === 'AUCTION' ? (fa ? '🔒 مزایده' : '🔒 Auction') : (fa ? '📋 مناقصه' : '📋 Tender')],
                [fa ? 'پیشنهادها' : 'Bids', `${detailModal.bidsCount ?? 0}`],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm py-1.5 border-b border-[hsl(var(--border)/0.5)]">
                  <span className="text-[hsl(var(--muted-foreground))]">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
            <h4 className="font-semibold text-sm mb-2">📦 {fa ? 'محصولات' : 'Products'}</h4>
            {(detailModal.products || []).map((p: any, i: number) => (
              <div key={i} className="bg-[hsl(var(--secondary))] rounded-xl p-3 mb-2 text-sm">
                <div className="font-bold">{p.name}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">📦 {Number(p.qty)} {p.unit}</div>
              </div>
            ))}
            {detailModal.description && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">📝 {detailModal.description}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDetailModal(null)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'بستن' : 'Close'}</button>
              <button
                onClick={() => { setBidModal(detailModal); setDetailModal(null); setBidPrice(''); setBidNote(''); }}
                className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-bold"
              >
                💰 {fa ? 'ثبت پیشنهاد' : 'Submit Bid'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bid Modal */}
      {bidModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--background))] rounded-2xl p-6 w-full max-w-md border border-[hsl(var(--border))] my-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base">💰 {fa ? 'ثبت پیشنهاد قیمت' : 'Submit Bid'}</h3>
              <button onClick={() => setBidModal(null)} className="text-[hsl(var(--muted-foreground))] text-xl">✕</button>
            </div>
            <div className="bg-[hsl(var(--secondary))] rounded-xl p-3 mb-4 text-xs text-[hsl(var(--muted-foreground))]">📋 {bidModal.title}</div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'قیمت پیشنهادی کل (IRR) *' : 'Total Bid Price (IRR) *'}</label>
                <input type="number" value={bidPrice} onChange={e => setBidPrice(e.target.value)}
                  placeholder="1000000000"
                  className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]" />
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'اینکوترمز' : 'Incoterms'}</label>
                <select value={bidIncoterm} onChange={e => setBidIncoterm(e.target.value)}
                  className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none">
                  {INCOTERMS_2020.map(ic => <option key={ic}>{ic}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'زمان تحویل (روز)' : 'Delivery Days'}</label>
                <input type="number" value={bidDelivery} onChange={e => setBidDelivery(e.target.value)} placeholder="30"
                  className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'توضیحات پیشنهاد' : 'Bid Notes'}</label>
                <textarea value={bidNote} onChange={e => setBidNote(e.target.value)} rows={2}
                  placeholder={fa ? 'سابقه کار، ضمانت‌نامه، شرایط...' : 'Experience, guarantee, terms...'}
                  className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none resize-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setBidModal(null)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
              <button onClick={handleBidSubmit} disabled={placeBid.isPending} className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-bold disabled:opacity-50">
                {placeBid.isPending ? (fa ? 'در حال ثبت...' : 'Submitting...') : `✅ ${fa ? 'ثبت پیشنهاد' : 'Submit Bid'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
