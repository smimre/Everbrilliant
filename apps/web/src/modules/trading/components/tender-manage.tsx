'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useMyTenders, useCreateTender } from '@/hooks/use-trading';
import { useUIStore } from '@/store';

const STATUS_MAP: Record<string, { label: string; labelFa: string; color: string; icon: string }> = {
  DRAFT:     { label: 'Draft',     labelFa: 'پیش‌نویس', color: '#f59e0b', icon: '📝' },
  OPEN:      { label: 'Open',      labelFa: 'باز',       color: '#10b981', icon: '🟢' },
  CLOSED:    { label: 'Closed',    labelFa: 'بسته',      color: '#64748b', icon: '🔒' },
  AWARDED:   { label: 'Awarded',   labelFa: 'اعلام شده', color: '#8b5cf6', icon: '🏆' },
  CANCELLED: { label: 'Cancelled', labelFa: 'لغو شده',  color: '#ef4444', icon: '❌' },
};

function fmtDate(iso: string) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('fa-IR'); } catch { return iso; }
}

export function TenderManage() {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const { data: raw, isLoading } = useMyTenders();
  const tenders: any[] = (raw as any)?.data ?? [];
  const [showNew, setShowNew] = useState(false);

  const open      = tenders.filter(t => (t.status || '').toUpperCase() === 'OPEN');
  const closed    = tenders.filter(t => ['CLOSED','AWARDED','CANCELLED'].includes((t.status || '').toUpperCase()));
  const totalBids = tenders.reduce((s, t) => s + (t.bidsCount ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">🏆 {fa ? 'مزایده‌های من' : 'My Auctions'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{tenders.length} {fa ? 'مزایده' : 'auctions'}</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90"
        >
          ➕ {fa ? 'مزایده جدید' : 'New Auction'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '🟢', val: open.length,   label: fa ? 'باز' : 'Open',         color: '#10b981' },
          { icon: '🔒', val: closed.length, label: fa ? 'بسته' : 'Closed',       color: '#64748b' },
          { icon: '📋', val: totalBids,     label: fa ? 'کل پیشنهادها' : 'Total Bids', color: '#3b82f6' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-28 rounded-xl bg-[hsl(var(--muted)/0.5)] animate-pulse" />)}</div>
      ) : tenders.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">🏷️</div>
          <p className="font-medium">{fa ? 'مزایده‌ای ایجاد نشده' : 'No auctions yet'}</p>
          <button onClick={() => setShowNew(true)} className="mt-4 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm">
            {fa ? '➕ مزایده جدید' : '➕ New Auction'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tenders.map(t => {
            const st = (t.status || '').toUpperCase();
            const info = STATUS_MAP[st] || STATUS_MAP.DRAFT;
            return (
              <div key={t.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">
                <div className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-sm">{t.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: info.color + '20', color: info.color }}>
                        {info.icon} {fa ? info.labelFa : info.label}
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs text-[hsl(var(--muted-foreground))] flex-wrap">
                      <span>📅 {fa ? 'مهلت:' : 'Deadline:'} {fmtDate(t.endDate)}</span>
                      <span className="font-semibold text-[hsl(var(--primary))]">📋 {t.bidsCount ?? 0} {fa ? 'پیشنهاد' : 'bids'}</span>
                    </div>
                  </div>
                </div>

                {/* Products */}
                {(t.products || []).length > 0 && (
                  <div className="px-4 pb-3 flex gap-2 flex-wrap">
                    {t.products.map((p: any, i: number) => (
                      <div key={i} className="bg-[hsl(var(--background))] rounded-lg px-2.5 py-1.5 text-xs border border-[hsl(var(--border))]">
                        <span className="font-semibold">📦 {p.name}</span>
                        <span className="text-[hsl(var(--muted-foreground))] ml-1.5">{Number(p.qty)} {p.unit}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bid progress bar */}
                {(t.bidsCount ?? 0) > 0 && (
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                      <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                        <div className="h-full rounded-full bg-[hsl(var(--primary))]" style={{ width: `${Math.min(100, (t.bidsCount ?? 0) * 20)}%` }} />
                      </div>
                      <span>{t.bidsCount} {fa ? 'پیشنهاد دریافت شد' : 'bids received'}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showNew && <NewAuctionModal lang={lang} onClose={() => setShowNew(false)} />}
    </div>
  );
}

function NewAuctionModal({ lang, onClose }: { lang: string; onClose: () => void }) {
  const fa = lang === 'fa';
  const { toast } = useUIStore();
  const createTender = useCreateTender();
  const [form, setForm] = useState({ title: '', deadline: '', deadlineTime: '23:59', type: 'AUCTION', description: '', isPublic: true });
  const [products, setProducts] = useState([{ name: '', qtyMin: '', qtyMax: '', unit: 'ton', currency: 'IRR', deliveryLoc: '' }]);

  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  const addProduct = () => setProducts(p => [...p, { name: '', qtyMin: '', qtyMax: '', unit: 'ton', currency: 'IRR', deliveryLoc: '' }]);
  const setP = (i: number, k: string, v: string) => setProducts(p => p.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  const removeP = (i: number) => setProducts(p => p.filter((_, idx) => idx !== i));

  const handleSubmit = () => {
    if (!form.title) { toast('error', fa ? 'عنوان الزامی است' : 'Title required'); return; }
    if (!form.deadline) { toast('error', fa ? 'مهلت الزامی است' : 'Deadline required'); return; }
    if (products.some(p => !p.name)) { toast('error', fa ? 'نام محصول الزامی است' : 'Product name required'); return; }

    createTender.mutate(
      {
        type: form.type,
        title: form.title,
        description: form.description || undefined,
        isPublic: form.isPublic,
        endDate: form.deadline,
        products: products.filter(p => p.name).map(p => ({
          name: p.name,
          qty: Number(p.qtyMax) || Number(p.qtyMin) || 0,
          unit: p.unit,
        })),
      },
      {
        onSuccess: () => { toast('success', fa ? 'مزایده منتشر شد' : 'Auction published'); onClose(); },
        onError: (err: any) => toast('error', err?.message || (fa ? 'خطا در انتشار مزایده' : 'Failed to publish')),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">🏷️ {fa ? 'مزایده جدید' : 'New Auction'}</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] text-xl">✕</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'عنوان مزایده *' : 'Auction Title *'}</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inp} placeholder={fa ? 'مثال: خرید روغن موتور ۱۰۰۰ لیتر' : 'e.g. Motor Oil 1000L'} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">📅 {fa ? 'تاریخ مهلت *' : 'Deadline *'}</label>
              <input value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className={inp} placeholder="2026-09-01" type="date" />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'نوع' : 'Type'}</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inp}>
                <option value="AUCTION">{fa ? '🔒 مزایده' : '🔒 Auction'}</option>
                <option value="TENDER">{fa ? '📋 مناقصه' : '📋 Tender'}</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={form.isPublic} onChange={e => setForm({ ...form, isPublic: e.target.checked })} className="w-4 h-4" />
            {fa ? 'مزایده عمومی' : 'Public auction'}
          </label>

          {/* Products */}
          <div className="rounded-xl border border-[hsl(var(--border))] p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">📦 {fa ? 'محصولات' : 'Products'}</h3>
              <button onClick={addProduct} className="text-xs px-2 py-1 rounded-lg border border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.08)]">+ {fa ? 'محصول' : 'Add'}</button>
            </div>
            {products.map((p, i) => (
              <div key={i} className="bg-[hsl(var(--background))] rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[hsl(var(--primary))]">{fa ? 'محصول' : 'Product'} {i + 1}</span>
                  {products.length > 1 && <button onClick={() => removeP(i)} className="text-red-400 text-xs">✕</button>}
                </div>
                <input value={p.name} onChange={e => setP(i, 'name', e.target.value)} className={inp} placeholder={fa ? 'نام کالا *' : 'Product name *'} />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'حداقل' : 'Min Qty'}</label>
                    <input value={p.qtyMin} onChange={e => setP(i, 'qtyMin', e.target.value)} type="number" className={inp} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'حداکثر' : 'Max Qty'}</label>
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
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'توضیحات' : 'Notes'}</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
              className={inp + " resize-none"} placeholder={fa ? 'شرایط ضمانت، گواهی‌نامه‌های مورد نیاز...' : 'Warranty conditions, required certificates...'} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
          <button onClick={handleSubmit} disabled={createTender.isPending} className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium disabled:opacity-50">
            {createTender.isPending ? (fa ? 'در حال انتشار...' : 'Publishing...') : `🏷️ ${fa ? 'انتشار مزایده' : 'Publish Auction'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
