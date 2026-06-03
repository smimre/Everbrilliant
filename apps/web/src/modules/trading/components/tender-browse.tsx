'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useUIStore } from '@/store';

const INCOTERMS_2020 = ['EXW','FCA','FAS','FOB','CFR','CIF','CPT','CIP','DAP','DPU','DDP'];

const MOCK_TENDERS = [
  {
    id:'TND-001', title:'خرید روغن پالم RBD — ۵۰۰ تن', owner:'شرکت بازرگانی الفا', ownerInitials:'ب', ownerColor:'#3b82f6',
    deadline:'۱۴۰۳/۰۶/۳۱', deadlineTime:'23:59', bids:4, connected:true, sealed:false,
    myBid:false, blacklisted:false,
    products:[{name:'روغن پالم RBD', qty:'500', qtyMin:'200', qtyMax:'500', unit:'تن', min:82000000, currency:'IRR', deliveryLoc:'بندر امام خمینی'}],
    notes:'محصول باید دارای گواهی RSPO باشد.',
  },
  {
    id:'TND-002', title:'تأمین شکر سفید گرید A — ۲۰۰ تن', owner:'گروه صنعتی پارس', ownerInitials:'پ', ownerColor:'#8b5cf6',
    deadline:'۱۴۰۳/۰۷/۱۵', deadlineTime:'18:00', bids:2, connected:true, sealed:true,
    myBid:true, blacklisted:false,
    products:[{name:'شکر سفید گرید A', qty:'200', qtyMin:'100', qtyMax:'200', unit:'تن', min:55000000, currency:'IRR', deliveryLoc:'انبار اصفهان'}],
    notes:'',
  },
  {
    id:'TND-003', title:'واردات گندم — ۱۰۰۰ تن', owner:'تجارت نوین UAE', ownerInitials:'ت', ownerColor:'#10b981',
    deadline:'۱۴۰۳/۰۵/۰۵', deadlineTime:'23:59', bids:7, connected:false, sealed:false,
    myBid:false, blacklisted:false,
    products:[{name:'گندم', qty:'1000', qtyMin:'500', qtyMax:'1000', unit:'تن', min:28000000, currency:'IRR', deliveryLoc:'سیلوی تهران'}],
    notes:'',
  },
  {
    id:'TND-004', title:'تأمین پلی‌اتیلن سبک — ۸۰ تن', owner:'پتروشیمی کیمیا', ownerInitials:'ک', ownerColor:'#f59e0b',
    deadline:'۱۴۰۳/۰۸/۰۱', deadlineTime:'14:00', bids:1, connected:true, sealed:true,
    myBid:false, blacklisted:true,
    products:[{name:'پلی‌اتیلن سبک LDPE', qty:'80', qtyMin:'40', qtyMax:'80', unit:'تن', min:95000000, currency:'IRR', deliveryLoc:'انبار شیراز'}],
    notes:'',
  },
];

function urgencyColor(deadline: string) {
  // Simple mock: if month < current, urgent
  return deadline.includes('۰۵') ? '#ef4444' : '#3b82f6';
}

export function TenderBrowse() {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const [search, setSearch] = useState('');
  const [connOnly, setConnOnly] = useState(false);
  const [bidModal, setBidModal] = useState<any>(null);
  const [bidPrice, setBidPrice] = useState('');
  const [bidNote, setBidNote] = useState('');
  const [bidIncoterm, setBidIncoterm] = useState('FOB');
  const [bidDelivery, setBidDelivery] = useState('');
  const [tenders, setTenders] = useState(MOCK_TENDERS);
  const [detailModal, setDetailModal] = useState<any>(null);

  const available = tenders.filter(t => t.connected && !t.blacklisted);
  const totalBids = tenders.reduce((s, t) => s + t.bids, 0);

  const filtered = tenders.filter(t => {
    if (connOnly && !t.connected) return false;
    if (search && !t.title.includes(search) && !t.products.some(p => p.name.includes(search))) return false;
    return true;
  });

  const handleBidSubmit = () => {
    if (!bidPrice) { toast('error', fa ? 'قیمت الزامی است' : 'Price required'); return; }
    setTenders(prev => prev.map(t => t.id === bidModal.id ? { ...t, myBid: true, bids: t.bids + 1 } : t));
    toast('success', fa ? 'پیشنهاد قیمت با موفقیت ثبت شد' : 'Bid submitted successfully');
    setBidModal(null); setBidPrice(''); setBidNote('');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{fa ? '🏷️ مزایده‌های فعال' : '🏷️ Active Auctions'}</h1>

      {/* 3-col Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '🏷️', val: tenders.length, label: fa ? 'مزایده فعال' : 'Active Auctions', color: '#3b82f6' },
          { icon: '✅', val: available.length, label: fa ? 'قابل شرکت' : 'Available', color: '#10b981' },
          { icon: '💰', val: totalBids, label: fa ? 'پیشنهاد ثبت‌شده' : 'Bids Submitted', color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder={fa ? '🔍 جستجوی مزایده یا کالا...' : '🔍 Search auction or product...'}
          className="flex-1 min-w-[150px] bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]"
        />
        <button
          onClick={() => setConnOnly(!connOnly)}
          className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${connOnly ? 'bg-[hsl(var(--primary))] text-white border-transparent' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`}
        >
          {fa ? 'فقط متصل‌ها' : 'Connected Only'}
        </button>
      </div>

      {/* Tender List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
            <div className="text-4xl mb-2">🏷️</div>
            <p>{fa ? 'مزایده‌ای یافت نشد' : 'No auctions found'}</p>
          </div>
        )}
        {filtered.map(t => {
          const urgColor = urgencyColor(t.deadline);
          return (
            <div
              key={t.id}
              className={`rounded-xl border bg-[hsl(var(--secondary))] p-4 transition-all ${t.connected && !t.blacklisted ? 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)]' : 'border-[hsl(var(--border))] opacity-70'}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Owner avatar */}
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: t.ownerColor }}>
                    {t.ownerInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{t.title}</div>
                    <div className="flex gap-2 text-xs text-[hsl(var(--muted-foreground))] mt-1 flex-wrap items-center">
                      <span>🏭 {t.owner}</span>
                      {/* Deadline badge */}
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]"
                        style={{ background: urgColor + '15', border: `1px solid ${urgColor}40`, color: urgColor }}>
                        📅 {t.deadline}
                        {t.deadlineTime && <span className="font-bold"> ⏰ {t.deadlineTime}</span>}
                      </span>
                      <span className="text-[hsl(var(--muted-foreground))]">👥 {t.bids} {fa ? 'پیشنهاد' : 'bids'}</span>
                      {t.sealed && <span className="text-purple-400 font-medium">🔒 {fa ? 'پاکت بسته' : 'Sealed'}</span>}
                    </div>
                  </div>
                </div>
                {/* Action area */}
                <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                  {t.blacklisted ? (
                    <span className="text-xs text-red-500 font-bold px-2 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30">🚫 {fa ? 'ممنوع' : 'Banned'}</span>
                  ) : !t.connected ? (
                    <span className="text-xs text-red-400">{fa ? 'ابتدا متصل شوید' : 'Connect first'}</span>
                  ) : t.myBid ? (
                    <span className="text-xs px-2 py-1.5 rounded-lg bg-green-500/10 text-green-500 border border-green-500/30 font-medium">✅ {fa ? 'ثبت شده' : 'Bid Submitted'}</span>
                  ) : (
                    <>
                      <button
                        onClick={() => setDetailModal(t)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)] transition-colors"
                      >
                        {fa ? 'جزئیات' : 'Details'}
                      </button>
                      <button
                        onClick={() => { setBidModal(t); setBidPrice(''); setBidNote(''); setBidIncoterm('FOB'); setBidDelivery(''); }}
                        className="text-xs px-3 py-1.5 bg-[hsl(var(--primary))] text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
                      >
                        💰 {fa ? 'پیشنهاد' : 'Bid'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Product chips */}
              <div className="flex gap-2 flex-wrap">
                {t.products.map((p, i) => (
                  <div key={i} className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg px-2.5 py-1.5 text-xs">
                    <span className="font-semibold">📦 {p.name}</span>
                    <span className="text-[hsl(var(--muted-foreground))] mx-1.5">
                      {p.qtyMin && p.qtyMax ? `${p.qtyMin}–${p.qtyMax}` : p.qty} {p.unit}
                    </span>
                    {p.min > 0 && (
                      <span className="text-amber-500 font-semibold">کف: {(p.min / 1e6).toFixed(0)}M {p.currency}</span>
                    )}
                    {p.deliveryLoc && <span className="text-[hsl(var(--muted-foreground))] mr-1.5">📍 {p.deliveryLoc}</span>}
                  </div>
                ))}
              </div>

              {t.sealed && (
                <div className="mt-2 text-xs text-purple-400 flex items-center gap-1">
                  🔒 {fa ? 'پاکت بسته — قیمت‌ها محرمانه است' : 'Sealed — prices are confidential'}
                </div>
              )}
              {t.notes && (
                <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))] line-clamp-1">📝 {t.notes}</p>
              )}
            </div>
          );
        })}
      </div>

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
                [fa ? 'برگزارکننده' : 'Owner', detailModal.owner],
                [fa ? 'مهلت' : 'Deadline', `${detailModal.deadline} — ${detailModal.deadlineTime}`],
                [fa ? 'نوع' : 'Type', detailModal.sealed ? (fa ? '🔒 پاکت بسته' : '🔒 Sealed') : (fa ? '📖 باز' : '📖 Open')],
                [fa ? 'پیشنهادها' : 'Bids', `${detailModal.bids}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm py-1.5 border-b border-[hsl(var(--border)/0.5)]">
                  <span className="text-[hsl(var(--muted-foreground))]">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
            <h4 className="font-semibold text-sm mb-2">📦 {fa ? 'محصولات' : 'Products'}</h4>
            {detailModal.products.map((p: any, i: number) => (
              <div key={i} className="bg-[hsl(var(--secondary))] rounded-xl p-3 mb-2 text-sm">
                <div className="font-bold">{p.name}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1 space-y-0.5">
                  <div>📦 {p.qtyMin && p.qtyMax ? `${p.qtyMin}–${p.qtyMax}` : p.qty} {p.unit}</div>
                  {p.min > 0 && <div className="text-amber-500">💰 {fa ? 'کف قیمت:' : 'Floor:'} {(p.min/1e6).toFixed(0)}M {p.currency}</div>}
                  {p.deliveryLoc && <div>📍 {p.deliveryLoc}</div>}
                </div>
              </div>
            ))}
            {detailModal.notes && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">📝 {detailModal.notes}</p>}
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
            <div className="bg-[hsl(var(--secondary))] rounded-xl p-3 mb-4 text-xs text-[hsl(var(--muted-foreground))]">
              📋 {bidModal.title}
              {bidModal.sealed && <span className="text-purple-400 mr-2">🔒 {fa ? 'پاکت بسته' : 'Sealed'}</span>}
            </div>
            <div className="space-y-3">
              {bidModal.products.map((p: any, i: number) => (
                <div key={i} className="rounded-lg border border-[hsl(var(--border))] p-3">
                  <div className="font-semibold text-sm mb-2">📦 {p.name}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
                    {p.qtyMin && p.qtyMax ? `${p.qtyMin}–${p.qtyMax}` : p.qty} {p.unit}
                    {p.min > 0 && <span className="text-amber-500 mr-2"> | {fa ? 'کف:' : 'Floor:'} {(p.min/1e6).toFixed(0)}M {p.currency}</span>}
                  </div>
                  <div>
                    <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'قیمت پیشنهادی کل (IRR) *' : 'Total Bid Price (IRR) *'}</label>
                    <input
                      type="number" value={bidPrice} onChange={e => setBidPrice(e.target.value)}
                      placeholder={p.min ? String(p.min) : '1000000000'}
                      className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]"
                    />
                    {bidPrice && p.min && Number(bidPrice) < p.min && (
                      <p className="text-red-400 text-xs mt-1">⚠️ {fa ? 'کمتر از کف قیمت تعیین‌شده' : 'Below the floor price'}</p>
                    )}
                  </div>
                </div>
              ))}
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'اینکوترمز' : 'Incoterms'}</label>
                <select value={bidIncoterm} onChange={e => setBidIncoterm(e.target.value)}
                  className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none">
                  {INCOTERMS_2020.map(ic => <option key={ic}>{ic}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'زمان تحویل (روز)' : 'Delivery Days'}</label>
                <input type="number" value={bidDelivery} onChange={e => setBidDelivery(e.target.value)}
                  placeholder="30"
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
              <button onClick={handleBidSubmit} className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-bold">
                ✅ {fa ? 'ثبت پیشنهاد' : 'Submit Bid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
