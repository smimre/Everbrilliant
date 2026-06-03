'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useUIStore } from '@/store';

const MOCK_CHECKS = [
  { id:'QC-001', title:'بازرسی روغن پالم — محموله ۵۰۰ تن', contract:'قرارداد الفا', date:'۱۴۰۳/۰۳/۱۵', status:'approved', inspector:'آزمایشگاه ارمغان', result:'مطابق استاندارد', grade:'A' },
  { id:'QC-002', title:'کنترل کیفیت شکر سفید — ۲۰۰ تن', contract:'قرارداد پارس', date:'۱۴۰۳/۰۳/۲۰', status:'pending', inspector:'شرکت بازرسی ایران', result:'در حال بررسی', grade:'-' },
  { id:'QC-003', title:'آزمایش گندم وارداتی — ۱۰۰۰ تن', contract:'قرارداد نوین', date:'۱۴۰۳/۰۲/۱۰', status:'rejected', inspector:'آزمایشگاه ملی', result:'ناقص — رطوبت بالا', grade:'F' },
];

const STATUS_MAP: Record<string, { label: string; labelFa: string; color: string; icon: string }> = {
  approved: { label: 'Approved', labelFa: 'تایید شده', color: '#10b981', icon: '✅' },
  pending:  { label: 'Pending',  labelFa: 'در انتظار', color: '#f59e0b', icon: '⏳' },
  rejected: { label: 'Rejected', labelFa: 'رد شده',   color: '#ef4444', icon: '❌' },
};

export function QualityChecks() {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const [items, setItems] = useState(MOCK_CHECKS);
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ title: '', contract: '', inspector: '', date: '' });

  const approved = items.filter(i => i.status === 'approved');
  const rejected = items.filter(i => i.status === 'rejected');
  const pending = items.filter(i => i.status === 'pending');

  const statuses = [
    { icon: '🔍', val: items.length, label: fa ? 'بازرسی‌ها' : 'Inspections', color: '#3b82f6' },
    { icon: '✅', val: approved.length, label: fa ? 'تایید شده' : 'Approved', color: '#10b981' },
    { icon: '❌', val: rejected.length, label: fa ? 'رد شده' : 'Rejected', color: '#ef4444' },
    { icon: '⏳', val: pending.length, label: fa ? 'در انتظار' : 'Pending', color: '#f59e0b' },
  ];

  const handleSubmit = () => {
    if (!form.title) { toast('error', fa ? 'عنوان الزامی است' : 'Title required'); return; }
    const newItem = {
      id: `QC-${String(items.length + 1).padStart(3, '0')}`,
      title: form.title,
      contract: form.contract || '-',
      date: form.date || new Date().toLocaleDateString('fa-IR'),
      status: 'pending',
      inspector: form.inspector || '-',
      result: fa ? 'در حال بررسی' : 'Under review',
      grade: '-',
    };
    setItems(prev => [...prev, newItem]);
    setForm({ title: '', contract: '', inspector: '', date: '' });
    setShowNew(false);
  };

  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{fa ? '✅ کنترل کیفیت' : '✅ Quality Checks'}</h1>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          ➕ {fa ? 'بازرسی جدید' : 'New Inspection'}
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
          const st = STATUS_MAP[item.status] || STATUS_MAP.pending;
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
                    <span>📄 {item.contract}</span>
                    <span>📅 {item.date}</span>
                    <span>🔍 {item.inspector}</span>
                    {item.grade !== '-' && (
                      <span className="font-bold" style={{ color: st.color }}>{fa ? 'درجه:' : 'Grade:'} {item.grade}</span>
                    )}
                  </div>
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
              <h2 className="font-bold text-lg">🔍 {fa ? 'بازرسی جدید' : 'New Inspection'}</h2>
              <button onClick={() => setShowNew(false)} className="text-[hsl(var(--muted-foreground))] text-xl">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'عنوان بازرسی *' : 'Inspection Title *'}</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inp} placeholder={fa ? 'مثال: بازرسی محموله روغن' : 'e.g. Oil Shipment Inspection'} />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'قرارداد مرتبط' : 'Related Contract'}</label>
                <input value={form.contract} onChange={e => setForm({ ...form, contract: e.target.value })} className={inp} placeholder={fa ? 'شماره یا عنوان قرارداد' : 'Contract title or number'} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'بازرس / آزمایشگاه' : 'Inspector / Lab'}</label>
                  <input value={form.inspector} onChange={e => setForm({ ...form, inspector: e.target.value })} className={inp} placeholder={fa ? 'نام آزمایشگاه' : 'Lab name'} />
                </div>
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'تاریخ' : 'Date'}</label>
                  <input value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inp} placeholder="1403/06/15" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
              <button onClick={handleSubmit} className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">✅ {fa ? 'ثبت' : 'Submit'}</button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">🔍 {selected.title}</h2>
              <button onClick={() => setSelected(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            {(() => {
              const st = STATUS_MAP[selected.status] || STATUS_MAP.pending;
              return (
                <>
                  <span className="text-xs px-2 py-1 rounded-full mb-4 inline-block" style={{ background: st.color + '20', color: st.color }}>
                    {st.icon} {fa ? st.labelFa : st.label}
                  </span>
                  <div className="space-y-2 mt-3">
                    {[
                      [fa ? 'قرارداد' : 'Contract', selected.contract],
                      [fa ? 'بازرس' : 'Inspector', selected.inspector],
                      [fa ? 'تاریخ' : 'Date', selected.date],
                      [fa ? 'نتیجه' : 'Result', selected.result],
                      [fa ? 'درجه' : 'Grade', selected.grade],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm py-2 border-b border-[hsl(var(--border)/0.5)]">
                        <span className="text-[hsl(var(--muted-foreground))]">{k}</span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
