'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useUIStore } from '@/store';

const MOCK_DISPUTES = [
  { id:'DSP-001', title:'اختلاف در کیفیت محموله روغن پالم', contract:'قرارداد الفا-۱۴۰۳', party:'شرکت بازرگانی الفا', amount:2500000000, date:'۱۴۰۳/۰۲/۲۵', status:'negotiating', desc:'محموله ۵۰۰ تن روغن پالم با مشخصات اعلام‌شده مطابقت نداشت. رطوبت ۱.۸٪ بجای ۰.۵٪ بود.' },
  { id:'DSP-002', title:'تأخیر در تحویل کالا', contract:'قرارداد پارس-۱۴۰۲', party:'گروه صنعتی پارس', amount:800000000, date:'۱۴۰۳/۰۱/۱۰', status:'resolved', desc:'تحویل ۴۵ روز با تأخیر انجام شد. خسارت تأخیر پرداخت گردید.' },
];

const STATUS_MAP: Record<string, { label: string; labelFa: string; color: string; icon: string }> = {
  open:        { label: 'Open',        labelFa: 'باز',          color: '#ef4444', icon: '🔴' },
  negotiating: { label: 'Negotiating', labelFa: 'در مذاکره',   color: '#f59e0b', icon: '💬' },
  resolved:    { label: 'Resolved',    labelFa: 'حل شده',      color: '#10b981', icon: '✅' },
  escalated:   { label: 'Escalated',   labelFa: 'ارجاع داده',  color: '#8b5cf6', icon: '⚠️' },
};

export function Disputes() {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const [items, setItems] = useState(MOCK_DISPUTES);
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ title: '', contract: '', party: '', amount: '', desc: '' });

  const open = items.filter(i => i.status === 'open');
  const negotiating = items.filter(i => i.status === 'negotiating');
  const resolved = items.filter(i => i.status === 'resolved');

  const statuses = [
    { icon: '⚖️', val: items.length, label: fa ? 'کل اختلافات' : 'Total Disputes', color: '#3b82f6' },
    { icon: '🔴', val: open.length + negotiating.length, label: fa ? 'باز / در مذاکره' : 'Open / Negotiating', color: '#ef4444' },
    { icon: '💬', val: negotiating.length, label: fa ? 'در مذاکره' : 'Negotiating', color: '#f59e0b' },
    { icon: '✅', val: resolved.length, label: fa ? 'حل شده' : 'Resolved', color: '#10b981' },
  ];

  const handleSubmit = () => {
    if (!form.title) { toast('error', fa ? 'عنوان الزامی است' : 'Title required'); return; }
    const newItem = {
      id: `DSP-${String(items.length + 1).padStart(3, '0')}`,
      title: form.title,
      contract: form.contract || '-',
      party: form.party || '-',
      amount: Number(form.amount) || 0,
      date: new Date().toLocaleDateString('fa-IR'),
      status: 'open',
      desc: form.desc,
    };
    setItems(prev => [...prev, newItem]);
    setForm({ title: '', contract: '', party: '', amount: '', desc: '' });
    setShowNew(false);
  };

  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{fa ? '⚖️ اختلافات تجاری' : '⚖️ Trade Disputes'}</h1>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          ➕ {fa ? 'اختلاف جدید' : 'New Dispute'}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {statuses.map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const st = STATUS_MAP[item.status] || STATUS_MAP.open;
          return (
            <div
              key={item.id}
              onClick={() => setSelected(item)}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 cursor-pointer hover:border-[hsl(var(--primary)/0.3)] transition-colors"
              style={{ borderRight: `4px solid ${st.color}` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{item.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: st.color + '20', color: st.color }}>
                      {st.icon} {fa ? st.labelFa : st.label}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                    <span>🏢 {item.party}</span>
                    <span>📄 {item.contract}</span>
                    <span>📅 {item.date}</span>
                    {item.amount > 0 && (
                      <span className="text-red-500 font-semibold">💰 {(item.amount / 1e9).toFixed(1)}B IRR</span>
                    )}
                  </div>
                  {item.desc && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 line-clamp-2">{item.desc}</p>
                  )}
                </div>
                <span className="text-xs px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] shrink-0">{fa ? 'جزئیات' : 'Details'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">⚖️ {fa ? 'اختلاف جدید' : 'New Dispute'}</h2>
              <button onClick={() => setShowNew(false)} className="text-[hsl(var(--muted-foreground))] text-xl">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'موضوع اختلاف *' : 'Dispute Subject *'}</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inp} placeholder={fa ? 'مثال: اختلاف در کیفیت کالا' : 'e.g. Quality dispute'} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'قرارداد' : 'Contract'}</label>
                  <input value={form.contract} onChange={e => setForm({ ...form, contract: e.target.value })} className={inp} />
                </div>
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'طرف مقابل' : 'Other Party'}</label>
                  <input value={form.party} onChange={e => setForm({ ...form, party: e.target.value })} className={inp} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'مبلغ اختلاف (ریال)' : 'Disputed Amount (IRR)'}</label>
                <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className={inp} placeholder="1000000000" />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'شرح اختلاف' : 'Description'}</label>
                <textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} rows={3} className={inp + ' resize-none'} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
              <button onClick={handleSubmit} className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">⚖️ {fa ? 'ثبت اختلاف' : 'Submit'}</button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">⚖️ {selected.title}</h2>
              <button onClick={() => setSelected(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            {(() => {
              const st = STATUS_MAP[selected.status] || STATUS_MAP.open;
              return (
                <>
                  <span className="text-xs px-2 py-1 rounded-full mb-4 inline-block" style={{ background: st.color + '20', color: st.color }}>
                    {st.icon} {fa ? st.labelFa : st.label}
                  </span>
                  <div className="space-y-2 mt-3">
                    {[
                      [fa ? 'قرارداد' : 'Contract', selected.contract],
                      [fa ? 'طرف مقابل' : 'Other Party', selected.party],
                      [fa ? 'تاریخ' : 'Date', selected.date],
                      [fa ? 'مبلغ اختلاف' : 'Disputed Amount', selected.amount > 0 ? `${(selected.amount / 1e9).toFixed(2)} B IRR` : '-'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm py-2 border-b border-[hsl(var(--border)/0.5)]">
                        <span className="text-[hsl(var(--muted-foreground))]">{k}</span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                  {selected.desc && (
                    <div className="mt-3 p-3 bg-[hsl(var(--muted)/0.3)] rounded-lg">
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{selected.desc}</p>
                    </div>
                  )}
                  {selected.status !== 'resolved' && (
                    <button
                      onClick={() => {
                        setItems(prev => prev.map(i => i.id === selected.id ? { ...i, status: 'negotiating' } : i));
                        setSelected({ ...selected, status: 'negotiating' });
                      }}
                      className="w-full mt-5 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium"
                    >
                      💬 {fa ? 'شروع مذاکره' : 'Start Negotiation'}
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
