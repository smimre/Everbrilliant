'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useUIStore } from '@/store';

const MANAQESEH = [
  { id:'MNQ-001', title:'مناقصه تأمین تجهیزات صنعتی', owner:'کارخانه ارمغان', deadline:'۱۴۰۳/۰۳/۲۸', proposals:3, connected:true, budget:5000000000, items:['پمپ سانتریفیوژ','شیر صنعتی','لوله استنلس'], status:'open' },
  { id:'MNQ-002', title:'مناقصه خدمات حمل بین‌المللی', owner:'گلوبال ترید', deadline:'۱۴۰۳/۰۴/۱۰', proposals:5, connected:false, budget:12000000000, items:['حمل جاده‌ای','ترخیص گمرکی'], status:'open' },
  { id:'MNQ-003', title:'مناقصه خرید مواد اولیه', owner:'پتروشیمی پارس', deadline:'۱۴۰۳/۰۵/۰۱', proposals:8, connected:true, budget:25000000000, items:['پلی اتیلن','پلی پروپیلن'], status:'open' },
];

export function ManaqesehBrowse() {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const [search, setSearch] = useState('');
  const [connOnly, setConnOnly] = useState(false);
  const [proposalModal, setProposalModal] = useState<string|null>(null);
  const [proposalPrice, setProposalPrice] = useState('');

  const participated = MANAQESEH.filter(m => m.proposals > 3);
  const won = MANAQESEH.filter(m => m.proposals > 6);

  const filtered = MANAQESEH.filter(m => {
    if (connOnly && !m.connected) return false;
    if (search && !m.title.includes(search) && !m.owner.includes(search)) return false;
    return true;
  });

  const statuses = [
    { icon: '📋', val: MANAQESEH.length, label: fa ? 'مناقصه باز' : 'Open Tenders', color: '#3b82f6' },
    { icon: '🤝', val: participated.length, label: fa ? 'شرکت کرده‌ام' : 'Participated', color: '#8b5cf6' },
    { icon: '📢', val: MANAQESEH.filter(m => m.connected).length, label: fa ? 'قابل شرکت' : 'Available', color: '#f59e0b' },
    { icon: '🏆', val: won.length, label: fa ? 'برنده شده' : 'Won', color: '#10b981' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{fa ? '📋 مناقصه‌ها' : '📋 Tenders'}</h1>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {statuses.map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 text-center relative overflow-hidden group hover:scale-[1.03] hover:shadow-md transition-all duration-200">
            <div className="absolute top-0 inset-x-0 h-1 rounded-t-xl" style={{ background: s.color }} />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-200 pointer-events-none" style={{ background: s.color }} />
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-xl font-bold leading-none" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={fa ? '🔍 جستجو...' : '🔍 Search...'}
          className="flex-1 min-w-[150px] bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"
        />
        <button
          onClick={() => setConnOnly(!connOnly)}
          className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${connOnly ? 'bg-[hsl(var(--primary))] text-white border-transparent' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`}
        >
          {fa ? 'فقط متصل‌ها' : 'Connected Only'}
        </button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
            <div className="text-4xl mb-2">📋</div>
            <p>{fa ? 'مناقصه‌ای یافت نشد' : 'No tenders found'}</p>
          </div>
        )}
        {filtered.map(m => (
          <div key={m.id} className={`rounded-xl border bg-[hsl(var(--secondary))] p-4 transition-all duration-200 hover:shadow-md ${m.connected ? 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] hover:-translate-y-0.5' : 'border-[hsl(var(--border))] opacity-70'}`}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <div className="font-bold text-sm">{m.title}</div>
                <div className="flex gap-3 text-xs text-[hsl(var(--muted-foreground))] mt-1 flex-wrap">
                  <span>🏭 {m.owner}</span>
                  <span>⏰ {m.deadline}</span>
                  <span>📋 {m.proposals} {fa ? 'پیشنهاد' : 'proposals'}</span>
                  <span className="text-green-500 font-semibold">💰 {(m.budget / 1e9).toFixed(1)}B IRR</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                {m.connected
                  ? <button
                      onClick={() => { setProposalModal(m.id); setProposalPrice(''); }}
                      className="px-3 py-1.5 bg-[hsl(var(--primary))] text-white rounded-lg text-xs font-bold"
                    >
                      {fa ? 'شرکت در مناقصه' : 'Submit Proposal'}
                    </button>
                  : <span className="text-xs text-red-400">{fa ? 'ابتدا متصل شوید' : 'Connect first'}</span>
                }
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {m.items.map((item, i) => (
                <span key={i} className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg px-2 py-1 text-xs">{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {proposalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(var(--background))] rounded-2xl p-6 w-full max-w-md border border-[hsl(var(--border))]">
            <h3 className="font-bold text-lg mb-4">📋 {fa ? 'ارسال پیشنهاد' : 'Submit Proposal'}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa ? 'قیمت پیشنهادی (ریال)' : 'Proposed Price (IRR)'}</label>
                <input
                  type="number"
                  value={proposalPrice}
                  onChange={e => setProposalPrice(e.target.value)}
                  placeholder="5000000000"
                  className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa ? 'توضیحات پیشنهاد' : 'Proposal Notes'}</label>
                <textarea
                  rows={3}
                  className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none resize-none"
                  placeholder={fa ? 'شرح پیشنهاد...' : 'Describe your proposal...'}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setProposalModal(null)} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
              <button
                onClick={() => { setProposalModal(null); toast('success', fa ? 'پیشنهاد ارسال شد' : 'Proposal submitted'); }}
                className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-bold"
              >
                {fa ? '✅ ارسال' : '✅ Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
