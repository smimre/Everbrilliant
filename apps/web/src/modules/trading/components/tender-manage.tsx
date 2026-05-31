'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useTenders, useCreateTender } from '@/hooks/use-trading';

const WIN_CRITERIA_LABELS: Record<string, string> = {
  highest_price: 'بالاترین قیمت',
  best_combo: 'بهترین ترکیب',
  fastest: 'سریع‌ترین تحویل',
  lowest_price: 'کمترین قیمت',
};

const MOCK_MINE = [
  {
    id:'TND-MY-001', title:'خرید روغن پالم RBD — ۵۰۰ تن', status:'open', deadline:'۱۴۰۳/۰۷/۳۱', deadlineTime:'23:59', opened:false,
    bids:[
      { acc:'acc2', price:41000000000, note:'تحویل ۲۱ روزه', deliveryDays:21, incoterms:'FOB', submittedAt:'۱۴۰۳/۰۵/۰۱' },
      { acc:'acc3', price:40500000000, note:'تحویل ۱۸ روزه', deliveryDays:18, incoterms:'CIF', submittedAt:'۱۴۰۳/۰۵/۰۳' },
      { acc:'acc4', price:42000000000, note:'تحویل ۳۰ روزه', deliveryDays:30, incoterms:'FOB', submittedAt:'۱۴۰۳/۰۵/۰۵' },
    ],
    products:[
      { name:'روغن پالم RBD', qtyMin:'300', qtyMax:'500', unit:'تن', min:80000000, priceMax:90000000, currency:'IRR', deliveryLoc:'بندر امام خمینی', criteria:'lowest_price' },
    ],
  },
  {
    id:'TND-MY-002', title:'تأمین شکر سفید — ۲۰۰ تن', status:'closed', deadline:'۱۴۰۳/۰۴/۱۵', deadlineTime:'18:00', opened:false,
    bids:[
      { acc:'acc2', price:11500000000, note:'', deliveryDays:14, incoterms:'EXW', submittedAt:'۱۴۰۳/۰۴/۱۰' },
      { acc:'acc5', price:11200000000, note:'گواهی ایمنی غذایی دارم', deliveryDays:10, incoterms:'FCA', submittedAt:'۱۴۰۳/۰۴/۱۲' },
    ],
    products:[
      { name:'شکر سفید گرید A', qtyMin:'100', qtyMax:'200', unit:'تن', min:50000000, priceMax:60000000, currency:'IRR', deliveryLoc:'انبار تهران', criteria:'best_combo' },
    ],
  },
  {
    id:'TND-MY-003', title:'واردات تجهیزات صنعتی', status:'closed', deadline:'۱۴۰۳/۰۳/۲۰', deadlineTime:'17:00', opened:true,
    bids:[
      { acc:'acc3', price:25000000000, note:'', deliveryDays:45, incoterms:'CIF', submittedAt:'۱۴۰۳/۰۳/۱۵' },
    ],
    products:[
      { name:'پمپ سانتریفیوژ صنعتی', qtyMin:'5', qtyMax:'10', unit:'دستگاه', min:2000000000, priceMax:3000000000, currency:'IRR', deliveryLoc:'کارخانه', criteria:'fastest' },
    ],
  },
];

function fmt(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + ' B IRR';
  if (n >= 1e6) return (n / 1e6).toFixed(0) + ' M IRR';
  return n.toLocaleString();
}

export function TenderManage() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const { data: rawTenders = [] } = useTenders();
  const [myTenders, setMyTenders] = useState(MOCK_MINE);
  const [showNew, setShowNew] = useState(false);
  const [resultsModal, setResultsModal] = useState<any>(null);

  const open = myTenders.filter(t => t.status === 'open');
  const closed = myTenders.filter(t => t.status === 'closed');
  const totalBids = myTenders.reduce((s, t) => s + t.bids.length, 0);

  const handleClose = (id: string) => {
    if (!confirm(fa ? 'مزایده بسته شود؟' : 'Close this auction?')) return;
    setMyTenders(prev => prev.map(t => t.id === id ? { ...t, status: 'closed' } : t));
  };

  const handleOpenEnvelope = (id: string) => {
    if (!confirm(fa ? 'پاکت باز شود؟ این عمل برگشت‌پذیر نیست.' : 'Open envelope? This cannot be undone.')) return;
    setMyTenders(prev => prev.map(t => t.id === id ? { ...t, opened: true } : t));
    const t = myTenders.find(t => t.id === id);
    if (t) setResultsModal(t);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">🏆 {fa ? 'مزایده‌های من' : 'My Auctions'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{myTenders.length} {fa ? 'مزایده' : 'auctions'}</p>
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
          { icon: '🟢', val: open.length, label: fa ? 'باز' : 'Open', color: '#10b981' },
          { icon: '🔒', val: closed.length, label: fa ? 'بسته' : 'Closed', color: '#64748b' },
          { icon: '📋', val: totalBids, label: fa ? 'کل پیشنهادها' : 'Total Bids', color: '#3b82f6' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {myTenders.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">🏷️</div>
          <p className="font-medium">{fa ? 'مزایده‌ای ایجاد نشده' : 'No auctions yet'}</p>
          <button onClick={() => setShowNew(true)} className="mt-4 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm">
            {fa ? '➕ مزایده جدید' : '➕ New Auction'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {myTenders.map(t => (
            <div key={t.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">
              {/* Header */}
              <div className="p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-sm">{t.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.status === 'open' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-400'}`}>
                      {t.status === 'open' ? '🟢 ' + (fa ? 'باز' : 'Open') : '🔒 ' + (fa ? 'بسته' : 'Closed')}
                    </span>
                    {t.opened && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">📂 {fa ? 'پاکت باز شد' : 'Opened'}</span>}
                  </div>
                  <div className="flex gap-2 text-xs text-[hsl(var(--muted-foreground))] flex-wrap">
                    <span>📅 {t.deadline} {t.deadlineTime && `— ${t.deadlineTime}`}</span>
                    <span className="font-semibold text-[hsl(var(--primary))]">📋 {t.bids.length} {fa ? 'پیشنهاد' : 'bids'}</span>
                  </div>
                </div>
                {/* Action buttons */}
                <div className="flex gap-2 shrink-0 flex-wrap">
                  {t.status === 'open' && (
                    <button onClick={() => handleClose(t.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 transition-colors">
                      🔒 {fa ? 'بستن' : 'Close'}
                    </button>
                  )}
                  {t.status !== 'open' && !t.opened && t.bids.length > 0 && (
                    <button onClick={() => handleOpenEnvelope(t.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500 hover:bg-green-500/20 transition-colors font-medium">
                      🔓 {fa ? 'باز کردن پاکت' : 'Open Envelope'}
                    </button>
                  )}
                  {t.opened && (
                    <button onClick={() => setResultsModal(t)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))] text-white hover:opacity-90 transition-opacity font-medium">
                      📊 {fa ? 'نتایج' : 'Results'}
                    </button>
                  )}
                </div>
              </div>

              {/* Products */}
              <div className="px-4 pb-3 space-y-2">
                {t.products.map((p, i) => (
                  <div key={i} className="bg-[hsl(var(--background))] rounded-lg p-3 text-xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-bold text-sm">📦 {p.name}</span>
                      <span className="text-[hsl(var(--muted-foreground))]">{p.currency}</span>
                    </div>
                    <div className="flex gap-3 mt-1.5 text-[hsl(var(--muted-foreground))] flex-wrap">
                      <span>{p.qtyMin && p.qtyMax ? `${p.qtyMin}–${p.qtyMax}` : ''} {p.unit}</span>
                      {p.min > 0 && <span className="text-amber-500">{fa ? 'کف:' : 'Floor:'} {fmt(p.min)}</span>}
                      {p.priceMax > 0 && <span className="text-red-400">{fa ? 'سقف:' : 'Ceiling:'} {fmt(p.priceMax)}</span>}
                    </div>
                    {p.deliveryLoc && <div className="mt-1 text-[hsl(var(--muted-foreground))]">📍 {p.deliveryLoc}</div>}
                    {p.criteria && (
                      <div className="mt-1 text-blue-400">
                        🏆 {fa ? WIN_CRITERIA_LABELS[p.criteria] || p.criteria : p.criteria}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bid count bar */}
              {t.bids.length > 0 && !t.opened && (
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                    <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                      <div className="h-full rounded-full bg-[hsl(var(--primary))]" style={{ width: `${Math.min(100, t.bids.length * 20)}%` }} />
                    </div>
                    <span>{t.bids.length} {fa ? 'پیشنهاد دریافت شد' : 'bids received'}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Results Modal */}
      {resultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-xl p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">📊 {fa ? 'نتایج مزایده' : 'Auction Results'}</h2>
              <button onClick={() => setResultsModal(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="text-sm font-medium mb-4 text-[hsl(var(--muted-foreground))]">{resultsModal.title}</div>
            <div className="space-y-2">
              {resultsModal.bids
                .map((b: any, i: number) => ({ ...b, rank: i + 1 }))
                .sort((a: any, b: any) => a.price - b.price)
                .map((b: any, i: number) => (
                  <div key={i}
                    className={`rounded-xl border p-4 ${i === 0 ? 'border-green-500/30 bg-green-500/5' : 'border-[hsl(var(--border))]'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-green-500 text-white' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>
                          {i === 0 ? '🥇' : i + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{b.acc}</div>
                          <div className="text-xs text-[hsl(var(--muted-foreground))]">
                            📅 {b.deliveryDays} {fa ? 'روز' : 'days'} · {b.incoterms} · {b.submittedAt}
                          </div>
                          {b.note && <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">📝 {b.note}</div>}
                        </div>
                      </div>
                      <div className="text-end shrink-0">
                        <div className="font-bold text-sm" style={{ color: i === 0 ? '#10b981' : undefined }}>{fmt(b.price)}</div>
                        {i === 0 && (
                          <div className="flex gap-1 mt-2">
                            <button
                              onClick={() => { alert(fa ? `برنده: ${b.acc} — اعلام شد ✅` : `Winner: ${b.acc} — Awarded ✅`); setResultsModal(null); }}
                              className="text-xs px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500 hover:bg-green-500/20"
                            >
                              🏆 {fa ? 'اعلام برنده' : 'Award'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {showNew && <NewAuctionModal lang={lang} onClose={() => setShowNew(false)} onSubmit={(t: any) => { setMyTenders(prev => [...prev, t]); setShowNew(false); }} />}
    </div>
  );
}

function NewAuctionModal({ lang, onClose, onSubmit }: { lang: string; onClose: () => void; onSubmit: (t: any) => void }) {
  const fa = lang === 'fa';
  const [form, setForm] = useState({ title: '', deadline: '', deadlineTime: '23:59', type: 'sealed', description: '', isPublic: true });
  const [products, setProducts] = useState([{ name: '', qtyMin: '', qtyMax: '', unit: 'تن', min: '', priceMax: '', currency: 'IRR', deliveryLoc: '', criteria: 'lowest_price' }]);

  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  const addProduct = () => setProducts(p => [...p, { name: '', qtyMin: '', qtyMax: '', unit: 'تن', min: '', priceMax: '', currency: 'IRR', deliveryLoc: '', criteria: 'lowest_price' }]);
  const setP = (i: number, k: string, v: string) => setProducts(p => p.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  const removeP = (i: number) => setProducts(p => p.filter((_, idx) => idx !== i));

  const handleSubmit = () => {
    if (!form.title) { alert(fa ? 'عنوان الزامی است' : 'Title required'); return; }
    if (!form.deadline) { alert(fa ? 'مهلت الزامی است' : 'Deadline required'); return; }
    if (products.some(p => !p.name)) { alert(fa ? 'نام محصول الزامی است' : 'Product name required'); return; }
    onSubmit({
      id: `TND-MY-${Date.now()}`, title: form.title, status: 'open',
      deadline: form.deadline, deadlineTime: form.deadlineTime, opened: false,
      bids: [], products: products.filter(p => p.name),
    });
    alert(fa ? 'مزایده منتشر شد ✅' : 'Auction published ✅');
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
              <input value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className={inp} placeholder="1403/06/15" />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">⏰ {fa ? 'ساعت' : 'Time'}</label>
              <input value={form.deadlineTime} onChange={e => setForm({ ...form, deadlineTime: e.target.value })} type="time" className={inp} />
            </div>
          </div>
          {form.deadline && (
            <div className="text-sm px-3 py-2 rounded-lg bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))]">
              ⏰ {fa ? 'مهلت نهایی:' : 'Deadline:'} <strong>{form.deadline} — {form.deadlineTime}</strong>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'نوع مزایده' : 'Type'}</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inp}>
                <option value="sealed">{fa ? '🔒 پاکت بسته' : '🔒 Sealed'}</option>
                <option value="open">{fa ? '📖 باز' : '📖 Open'}</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isPublic} onChange={e => setForm({ ...form, isPublic: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm">{fa ? 'مزایده عمومی' : 'Public auction'}</span>
              </label>
            </div>
          </div>

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
                <div>
                  <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'نام *' : 'Name *'}</label>
                  <input value={p.name} onChange={e => setP(i, 'name', e.target.value)} className={inp} placeholder={fa ? 'نام کالا' : 'Product name'} />
                </div>
                <div className="grid grid-cols-4 gap-2">
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
                      {['تن','کیلوگرم','لیتر','متر','عدد','دستگاه','پالت'].map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'ارز' : 'Currency'}</label>
                    <select value={p.currency} onChange={e => setP(i, 'currency', e.target.value)} className={inp}>
                      <option>IRR</option><option>USD</option><option>EUR</option><option>AED</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'کف قیمت (IRR)' : 'Floor Price'}</label>
                    <input value={p.min} onChange={e => setP(i, 'min', e.target.value)} type="number" className={inp} placeholder="80000000" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'سقف قیمت (IRR)' : 'Ceiling Price'}</label>
                    <input value={p.priceMax} onChange={e => setP(i, 'priceMax', e.target.value)} type="number" className={inp} placeholder="100000000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'محل تحویل' : 'Delivery Location'}</label>
                    <input value={p.deliveryLoc} onChange={e => setP(i, 'deliveryLoc', e.target.value)} className={inp} placeholder={fa ? 'بندر / انبار' : 'Port / Warehouse'} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'معیار انتخاب برنده' : 'Win Criteria'}</label>
                    <select value={p.criteria} onChange={e => setP(i, 'criteria', e.target.value)} className={inp}>
                      <option value="lowest_price">{fa ? '🏆 کمترین قیمت' : '🏆 Lowest Price'}</option>
                      <option value="highest_price">{fa ? '🏆 بالاترین قیمت' : '🏆 Highest Price'}</option>
                      <option value="fastest">{fa ? '🚀 سریع‌ترین تحویل' : '🚀 Fastest Delivery'}</option>
                      <option value="best_combo">{fa ? '⚖️ بهترین ترکیب' : '⚖️ Best Combo'}</option>
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
          <button onClick={handleSubmit} className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
            🏷️ {fa ? 'انتشار مزایده' : 'Publish Auction'}
          </button>
        </div>
      </div>
    </div>
  );
}
