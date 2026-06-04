'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useMyTenders, useCreateTender, useCloseTender, useAwardTender, useTenderBids } from '@/hooks/use-trading';
import { useUIStore } from '@/store';

function fmt(n: any) {
  try { return Number(n).toLocaleString('fa-IR'); } catch { return String(n); }
}

function DeadlineBadge({ endDate }: { endDate: string }) {
  if (!endDate) return null;
  const end  = new Date(endDate);
  const now  = new Date();
  const days = Math.ceil((end.getTime() - now.getTime()) / 86400_000);
  const urgent = days <= 3;
  const label = end.toLocaleDateString('fa-IR');
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs"
      style={{
        background: urgent ? 'rgba(239,68,68,.12)' : 'rgba(59,130,246,.08)',
        border: `1px solid ${urgent ? 'rgba(239,68,68,.4)' : 'rgba(59,130,246,.3)'}`,
        color: urgent ? '#ef4444' : '#2563eb',
      }}
    >
      📅 {label}
    </span>
  );
}

function ResultsModal({ tenderId, lang, onClose }: { tenderId: string; lang: string; onClose: () => void }) {
  const fa = lang === 'fa';
  const { data: bidsRaw, isLoading } = useTenderBids(tenderId);
  const bids: any[] = Array.isArray(bidsRaw) ? bidsRaw : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">📊 {fa ? 'نتایج مزایده' : 'Auction Results'}</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] text-xl leading-none">✕</button>
        </div>
        {isLoading ? (
          <div className="py-8 text-center text-[hsl(var(--muted-foreground))]">
            <div className="w-6 h-6 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          </div>
        ) : bids.length === 0 ? (
          <div className="py-8 text-center text-[hsl(var(--muted-foreground))]">
            <p>{fa ? 'پیشنهادی دریافت نشده' : 'No bids received'}</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {bids.map((b: any, i: number) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl bg-[hsl(var(--background))] p-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: i === 0 ? '#f59e0b20' : 'hsl(var(--muted)/0.5)', color: i === 0 ? '#f59e0b' : undefined }}>
                    {i + 1}
                  </span>
                  <span className="text-[hsl(var(--muted-foreground))] text-xs">
                    {new Date(b.submittedAt).toLocaleDateString('fa-IR')}
                  </span>
                </div>
                <span className="font-bold" style={{ color: i === 0 ? '#f59e0b' : undefined }}>
                  {fmt(b.totalPrice)} {b.currency || 'IRR'}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
            {fa ? 'بستن' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TenderManage() {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const { data: raw, isLoading } = useMyTenders();
  const tenders: any[] = (raw as any)?.data ?? [];
  const [showNew, setShowNew]       = useState(false);
  const [resultsId, setResultsId]   = useState<string | null>(null);

  const closeTender = useCloseTender();
  const awardTender = useAwardTender();

  const handleClose = (id: string) => {
    closeTender.mutate(id, {
      onSuccess: () => toast('success', fa ? '🔒 مزایده بسته شد' : '🔒 Auction closed'),
      onError: (e: any) => toast('error', e?.message || 'Error'),
    });
  };

  const handleAward = (id: string) => {
    awardTender.mutate(id, {
      onSuccess: () => { toast('success', fa ? '🔓 پاکت باز شد' : '🔓 Envelope opened'); setResultsId(id); },
      onError: (e: any) => toast('error', e?.message || 'Error'),
    });
  };

  return (
    <div className="space-y-4">
      {/* Top: new auction button — right-aligned, matching spec */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          ➕ {fa ? 'مزایده جدید' : 'New Auction'}
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-32 rounded-xl bg-[hsl(var(--muted)/0.5)] animate-pulse" />)}</div>
      ) : tenders.length === 0 ? (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-10 text-center text-[hsl(var(--muted-foreground))]">
          <div className="text-5xl mb-3">🏷️</div>
          <p className="font-medium">{fa ? 'مزایده‌ای ایجاد نشده' : 'No auctions yet'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tenders.map(t => {
            const st = (t.status || '').toUpperCase();
            const isOpen   = st === 'OPEN';
            const isClosed = st === 'CLOSED';
            const isAwarded = st === 'AWARDED';

            return (
              <div key={t.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="font-bold text-base mb-0.5">{t.title}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))] font-mono mb-2">{t.id}</div>
                    <DeadlineBadge endDate={t.endDate} />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold shrink-0 ${
                    isOpen ? 'bg-green-500/10 text-green-600' : 'bg-[hsl(var(--muted)/0.6)] text-[hsl(var(--muted-foreground))]'
                  }`}>
                    {isOpen ? '🟢 باز' : '🔒 بسته'}
                  </span>
                </div>

                {/* Products grid */}
                {(t.products || []).length > 0 && (
                  <div className="space-y-2 mb-4">
                    {(t.products as any[]).map((p: any, i: number) => (
                      <div key={i} className="rounded-lg bg-[hsl(var(--background))] px-3 py-2 text-xs border border-[hsl(var(--border))]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{p.name}</span>
                          <span className="text-[hsl(var(--muted-foreground))]">{p.currency || 'ریال'}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[hsl(var(--muted-foreground))]">
                          <span>{Number(p.qty)} {p.unit}</span>
                          <span>
                            {p.minPrice ? `کف: ${fmt(p.minPrice)}` : ''}
                            {p.maxPrice ? ` | سقف: ${fmt(p.maxPrice)}` : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer: bid count + action buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))]">
                  <span className="text-sm">
                    <span className="font-bold" style={{ color: 'hsl(var(--primary))' }}>{t.bidsCount ?? 0}</span>
                    {' '}{fa ? 'پیشنهاد' : 'bids'}
                  </span>
                  <div className="flex gap-2">
                    {isOpen && (
                      <button
                        disabled={closeTender.isPending}
                        onClick={() => handleClose(t.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-300/50 bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        🔒 {fa ? 'بستن' : 'Close'}
                      </button>
                    )}
                    {isClosed && (
                      <button
                        disabled={awardTender.isPending}
                        onClick={() => handleAward(t.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-700 border border-green-500/30 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                      >
                        🔓 {fa ? 'باز کردن پاکت' : 'Open Envelope'}
                      </button>
                    )}
                    {isAwarded && (
                      <button
                        onClick={() => setResultsId(t.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[hsl(var(--primary))] text-white hover:opacity-90 transition-opacity"
                      >
                        📊 {fa ? 'نتایج' : 'Results'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showNew && <NewAuctionModal lang={lang} onClose={() => setShowNew(false)} />}
      {resultsId && <ResultsModal tenderId={resultsId} lang={lang} onClose={() => setResultsId(null)} />}
    </div>
  );
}

function NewAuctionModal({ lang, onClose }: { lang: string; onClose: () => void }) {
  const fa = lang === 'fa';
  const { toast } = useUIStore();
  const createTender = useCreateTender();
  const [form, setForm] = useState({ title: '', deadline: '', deadlineTime: '23:59', type: 'AUCTION', description: '' });
  const [products, setProducts] = useState([{ name: '', qtyMin: '', qtyMax: '', unit: 'ton', currency: 'IRR' }]);

  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  const addProduct = () => setProducts(p => [...p, { name: '', qtyMin: '', qtyMax: '', unit: 'ton', currency: 'IRR' }]);
  const setP = (i: number, k: string, v: string) => setProducts(p => p.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  const removeP = (i: number) => setProducts(p => p.filter((_, idx) => idx !== i));

  const handleSubmit = () => {
    if (!form.title)    { toast('error', fa ? 'عنوان الزامی است' : 'Title required'); return; }
    if (!form.deadline) { toast('error', fa ? 'مهلت الزامی است' : 'Deadline required'); return; }
    if (products.some(p => !p.name)) { toast('error', fa ? 'نام محصول الزامی است' : 'Product name required'); return; }

    createTender.mutate(
      {
        type: form.type,
        title: form.title,
        description: form.description || undefined,
        endDate: form.deadline,
        products: products.filter(p => p.name).map(p => ({
          name: p.name,
          qty: Number(p.qtyMax) || Number(p.qtyMin) || 0,
          unit: p.unit,
          currency: p.currency,
        })),
      },
      {
        onSuccess: () => { toast('success', fa ? '📤 مزایده منتشر شد' : '📤 Auction published'); onClose(); },
        onError: (err: any) => toast('error', err?.message || (fa ? 'خطا در انتشار مزایده' : 'Failed to publish')),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">🏷️ {fa ? 'مزایده جدید' : 'New Auction'}</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] text-xl leading-none">✕</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">{fa ? 'عنوان مزایده *' : 'Auction Title *'}</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inp}
              placeholder={fa ? 'مناقصه فروش...' : 'e.g. Motor Oil 1000L'} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">📅 {fa ? 'تاریخ مهلت *' : 'Deadline *'}</label>
              <input value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
                className={inp} placeholder="2026-09-01" type="date" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">{fa ? 'نوع' : 'Type'}</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inp}>
                <option value="AUCTION">{fa ? '🔒 پاکت بسته' : '🔒 Sealed'}</option>
                <option value="TENDER">{fa ? '📖 باز' : '📖 Open'}</option>
              </select>
            </div>
          </div>

          {/* Products */}
          <div className="rounded-xl border border-[hsl(var(--border))] p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">📦 {fa ? 'محصولات' : 'Products'}</span>
              <button onClick={addProduct} className="text-xs px-2 py-1 rounded-lg border border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.08)]">
                + {fa ? 'محصول' : 'Add'}
              </button>
            </div>
            {products.map((p, i) => (
              <div key={i} className="bg-[hsl(var(--background))] rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[hsl(var(--primary))]">{fa ? 'محصول' : 'Product'} {i + 1}</span>
                  {products.length > 1 && <button onClick={() => removeP(i)} className="text-red-400 text-xs">✕</button>}
                </div>
                <input value={p.name} onChange={e => setP(i, 'name', e.target.value)} className={inp}
                  placeholder={fa ? 'نام کالا *' : 'Product name *'} />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'حداقل' : 'Min'}</label>
                    <input value={p.qtyMin} onChange={e => setP(i, 'qtyMin', e.target.value)} type="number" className={inp} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'حداکثر' : 'Max'}</label>
                    <input value={p.qtyMax} onChange={e => setP(i, 'qtyMax', e.target.value)} type="number" className={inp} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'واحد' : 'Unit'}</label>
                    <select value={p.unit} onChange={e => setP(i, 'unit', e.target.value)} className={inp}>
                      {['ton','kg','liter','m','m2','unit','pallet'].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 block">{fa ? 'توضیحات' : 'Notes'}</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3} className={inp + ' resize-none'}
              placeholder={fa ? 'شرایط تحویل...' : 'Delivery conditions...'} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
            {fa ? 'انصراف' : 'Cancel'}
          </button>
          <button onClick={handleSubmit} disabled={createTender.isPending}
            className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity">
            {createTender.isPending ? (fa ? 'در حال انتشار...' : 'Publishing...') : `📤 ${fa ? 'انتشار' : 'Publish'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
