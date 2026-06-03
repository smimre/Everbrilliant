'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useUIStore } from '@/store';

const MNQ_TYPES = [
  { id: 'goods', icon: '📦', label: 'کالا', en: 'Goods' },
  { id: 'service', icon: '🛠️', label: 'خدمات', en: 'Services' },
  { id: 'project', icon: '🏗️', label: 'پروژه/EPC', en: 'Project/EPC' },
  { id: 'rental', icon: '🔑', label: 'اجاره', en: 'Rental' },
  { id: 'other', icon: '📋', label: 'سایر', en: 'Other' },
];

const MOCK_TENDERS: any[] = [
  {
    id: 'MNQ-MY-001', type: 'goods', title: 'مناقصه تأمین تجهیزات انبار', status: 'open',
    deadline: '۱۴۰۳/۰۶/۳۰', proposals: 3, budget: 8000000000, subject: 'تأمین رک‌های انباری و تجهیزات جانبی',
    items: [{ name: 'رک انباری فلزی', qty: 50, unit: 'دست' }],
  },
  {
    id: 'MNQ-MY-002', type: 'service', title: 'مناقصه خدمات حمل بین‌المللی', status: 'closed',
    deadline: '۱۴۰۳/۰۵/۱۵', proposals: 7, budget: 12000000000, subject: 'خدمات ترخیص و حمل دریایی',
    items: [{ name: 'حمل دریایی FCL', qty: 10, unit: 'محموله' }],
  },
];

export function MyManaqeseh() {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const [showNew, setShowNew] = useState(false);
  const [items, setItems] = useState(MOCK_TENDERS);
  const [selected, setSelected] = useState<any>(null);
  const [showProposals, setShowProposals] = useState<any>(null);

  const open = items.filter(i => i.status === 'open');
  const totalProposals = items.reduce((s: number, i: any) => s + i.proposals, 0);
  const awarded = items.filter(i => i.status === 'awarded');

  const statuses = [
    { icon: '📢', val: items.length, label: fa ? 'کل مناقصه‌ها' : 'Total', color: '#3b82f6' },
    { icon: '🟢', val: open.length, label: fa ? 'باز' : 'Open', color: '#10b981' },
    { icon: '📋', val: totalProposals, label: fa ? 'پیشنهاد دریافتی' : 'Bids Received', color: '#8b5cf6' },
    { icon: '🏆', val: awarded.length, label: fa ? 'برنده اعلام شده' : 'Awarded', color: '#f59e0b' },
  ];

  const STATUS_COLORS: Record<string, string> = {
    open: '#10b981', closed: '#f59e0b', evaluating: '#3b82f6', awarded: '#8b5cf6', cancelled: '#ef4444',
  };
  const STATUS_LABELS: Record<string, string> = {
    open: fa ? 'باز' : 'Open', closed: fa ? 'بسته' : 'Closed',
    evaluating: fa ? 'در حال ارزیابی' : 'Evaluating', awarded: fa ? 'برنده اعلام شد' : 'Awarded', cancelled: fa ? 'لغو شده' : 'Cancelled',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{fa ? '📝 مناقصه‌های من' : '📝 My Tenders'}</h1>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          ➕ {fa ? 'مناقصه جدید' : 'New Tender'}
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

      {items.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">📝</div>
          <p className="font-medium">{fa ? 'مناقصه‌ای ایجاد نشده' : 'No tenders yet'}</p>
          <button onClick={() => setShowNew(true)} className="mt-4 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm">
            {fa ? '+ مناقصه جدید' : '+ New Tender'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any) => {
            const typeObj = MNQ_TYPES.find(t => t.id === item.type) || MNQ_TYPES[0];
            const color = STATUS_COLORS[item.status] || '#64748b';
            return (
              <div key={item.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">
                <div className="p-4" style={{ borderRight: `4px solid ${color}` }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-base">{typeObj.icon}</span>
                        <span className="font-bold text-sm">{item.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: color + '20', color }}>
                          {STATUS_LABELS[item.status]}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs text-[hsl(var(--muted-foreground))] flex-wrap">
                        <span>⏰ {item.deadline}</span>
                        <span className="font-semibold text-amber-500">📋 {item.proposals} {fa ? 'پیشنهاد' : 'proposals'}</span>
                        {item.budget > 0 && <span className="text-green-500 font-semibold">💰 {(item.budget/1e9).toFixed(1)}B IRR</span>}
                      </div>
                      {item.subject && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1.5 line-clamp-1">{item.subject}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setSelected(item)} className="text-xs px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]">
                        {fa ? 'مشاهده' : 'View'}
                      </button>
                      {item.proposals > 0 && (
                        <button
                          onClick={() => setShowProposals(item)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))] text-white hover:opacity-90"
                        >
                          📋 {fa ? `${item.proposals} پیشنهاد` : `${item.proposals} Proposals`}
                        </button>
                      )}
                      {item.status === 'open' && (
                        <button
                          onClick={() => {
                            if (confirm(fa ? 'آیا مناقصه را ببندید؟' : 'Close this tender?'))
                              setItems(prev => prev.map((p: any) => p.id === item.id ? { ...p, status: 'closed' } : p));
                          }}
                          className="text-xs px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
                        >
                          {fa ? 'بستن' : 'Close'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Tender Modal */}
      {showNew && <NewTenderModal lang={lang} onClose={() => setShowNew(false)} onSubmit={(t: any) => { setItems(prev => [...prev, t]); setShowNew(false); }} />}

      {/* Proposals Modal */}
      {showProposals && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">📋 {fa ? 'پیشنهادهای دریافتی' : 'Received Proposals'}</h2>
              <button onClick={() => setShowProposals(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3">
              {Array.from({ length: showProposals.proposals }).map((_, i) => (
                <div key={i} className={`rounded-xl border p-4 ${i === 0 ? 'border-green-500/30 bg-green-500/5' : 'border-[hsl(var(--border))]'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">
                        {i === 0 && <span className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-500 rounded mr-2">🥇 {fa ? 'کمترین قیمت' : 'Lowest'}</span>}
                        {fa ? `شرکت نمونه ${i + 1}` : `Company ${i + 1}`}
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                        💰 {((5 + i) * 1000000000 / 1e9).toFixed(1)}B IRR · 📅 {i + 30} {fa ? 'روز' : 'days delivery'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-xs px-2 py-1 rounded-lg border border-green-500/30 text-green-500 hover:bg-green-500/10">
                        {fa ? '🏆 برنده' : '🏆 Award'}
                      </button>
                      <button className="text-xs px-2 py-1 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]">
                        {fa ? 'جزئیات' : 'Details'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NewTenderModal({ lang, onClose, onSubmit }: { lang: string; onClose: () => void; onSubmit: (t: any) => void }) {
  const fa = lang === 'fa';
  const { toast } = useUIStore();
  const [type, setType] = useState('goods');
  const [form, setForm] = useState({ title: '', subject: '', description: '', deadline: '', deadlineTime: '23:59', deliveryPlace: '', deliveryDays: '', paymentTerms: '', budget: '', budgetVisible: false, isPublic: true });
  const [itemRows, setItemRows] = useState([{ name: '', qty: '', unit: 'تن', specs: '' }]);
  const [criteria, setCriteria] = useState([{ label: fa ? 'قیمت' : 'Price', weight: '60' }, { label: fa ? 'تحویل' : 'Delivery', weight: '40' }]);
  const [reqDocs, setReqDocs] = useState('');

  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  const addItem = () => setItemRows(prev => [...prev, { name: '', qty: '', unit: 'تن', specs: '' }]);
  const setItemField = (i: number, k: string, v: string) =>
    setItemRows(prev => prev.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

  const totalWeight = criteria.reduce((s, c) => s + Number(c.weight || 0), 0);

  const handleSubmit = () => {
    if (!form.title) { toast('error', fa ? 'عنوان الزامی است' : 'Title required'); return; }
    if (!form.deadline) { toast('error', fa ? 'مهلت الزامی است' : 'Deadline required'); return; }
    if (totalWeight !== 100) { toast('error', fa ? 'مجموع وزن معیارها باید ۱۰۰٪ باشد' : 'Criteria weights must total 100%'); return; }
    onSubmit({
      id: `MNQ-MY-${Date.now()}`, type, title: form.title, status: 'open',
      deadline: form.deadline, proposals: 0, budget: Number(form.budget) || 0, subject: form.subject,
      items: itemRows.filter(r => r.name),
    });
    toast('success', fa ? 'مناقصه منتشر شد' : 'Tender published');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-2xl p-6 shadow-2xl my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">📝 {fa ? 'مناقصه جدید' : 'New Tender'}</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] text-xl">✕</button>
        </div>

        <div className="space-y-5">
          {/* Type selector */}
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2 block">{fa ? 'نوع مناقصه' : 'Tender Type'}</label>
            <div className="grid grid-cols-5 gap-2">
              {MNQ_TYPES.map(t => (
                <button key={t.id} onClick={() => setType(t.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all text-xs ${type === t.id ? 'bg-[hsl(var(--primary))] text-white border-transparent' : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)]'}`}>
                  <div className="text-xl mb-1">{t.icon}</div>
                  {fa ? t.label : t.en}
                </button>
              ))}
            </div>
          </div>

          {/* Basic info */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'عنوان مناقصه *' : 'Tender Title *'}</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inp} placeholder={fa ? 'مثال: مناقصه تأمین مواد اولیه' : 'e.g. Raw Materials Tender'} />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'خلاصه موضوع' : 'Subject Summary'}</label>
              <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'توضیحات کامل' : 'Full Description'}</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className={inp + " resize-none"} />
            </div>
          </div>

          {/* Items */}
          <div className="rounded-xl border border-[hsl(var(--border))] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">📦 {fa ? 'اقلام' : 'Items'}</h3>
              <button onClick={addItem} className="text-xs px-3 py-1.5 rounded-lg border border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.08)]">
                ➕ {fa ? 'افزودن' : 'Add'}
              </button>
            </div>
            {itemRows.map((row, i) => (
              <div key={i} className="bg-[hsl(var(--background))] rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'نام قلم *' : 'Item Name *'}</label>
                    <input value={row.name} onChange={e => setItemField(i, 'name', e.target.value)} className={inp} placeholder={fa ? 'مثال: روغن پالم' : 'e.g. Palm Oil'} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'مقدار' : 'Qty'}</label>
                    <input value={row.qty} onChange={e => setItemField(i, 'qty', e.target.value)} type="number" className={inp} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'واحد' : 'Unit'}</label>
                    <select value={row.unit} onChange={e => setItemField(i, 'unit', e.target.value)} className={inp}>
                      {['تن','کیلوگرم','لیتر','متر','عدد','دست'].map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'مشخصات فنی' : 'Technical Specs'}</label>
                  <input value={row.specs} onChange={e => setItemField(i, 'specs', e.target.value)} className={inp} placeholder={fa ? 'گرید، استاندارد...' : 'Grade, standard...'} />
                </div>
              </div>
            ))}
          </div>

          {/* Conditions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'مهلت ارسال پیشنهاد *' : 'Submission Deadline *'}</label>
              <input value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className={inp} placeholder="1403/06/15" />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'ساعت مهلت' : 'Deadline Time'}</label>
              <input value={form.deadlineTime} onChange={e => setForm({...form, deadlineTime: e.target.value})} type="time" className={inp} />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'محل تحویل' : 'Delivery Place'}</label>
              <input value={form.deliveryPlace} onChange={e => setForm({...form, deliveryPlace: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'زمان تحویل (روز)' : 'Delivery Days'}</label>
              <input value={form.deliveryDays} onChange={e => setForm({...form, deliveryDays: e.target.value})} type="number" className={inp} />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'شرایط پرداخت' : 'Payment Terms'}</label>
              <input value={form.paymentTerms} onChange={e => setForm({...form, paymentTerms: e.target.value})} className={inp} placeholder={fa ? '۳۰ روزه' : '30 days'} />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'سقف بودجه (اختیاری)' : 'Budget Cap (optional)'}</label>
              <input value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} type="number" className={inp} placeholder="10000000000" />
            </div>
          </div>

          {/* Evaluation Criteria */}
          <div className="rounded-xl border border-[hsl(var(--border))] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">⚖️ {fa ? 'معیارهای ارزیابی' : 'Evaluation Criteria'}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${totalWeight === 100 ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                {fa ? 'مجموع: ' : 'Total: '}{totalWeight}%
              </span>
            </div>
            {criteria.map((c, i) => (
              <div key={i} className="flex gap-2">
                <input value={c.label} onChange={e => setCriteria(prev => prev.map((r, idx) => idx === i ? { ...r, label: e.target.value } : r))}
                  className={inp + " flex-1"} placeholder={fa ? 'معیار ارزیابی' : 'Criterion'} />
                <input value={c.weight} onChange={e => setCriteria(prev => prev.map((r, idx) => idx === i ? { ...r, weight: e.target.value } : r))}
                  type="number" max="100" className={inp + " w-20"} placeholder="%" />
                {criteria.length > 1 && (
                  <button onClick={() => setCriteria(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 px-2">✕</button>
                )}
              </div>
            ))}
            <button onClick={() => setCriteria(prev => [...prev, { label: '', weight: '0' }])}
              className="text-xs text-[hsl(var(--primary))] hover:underline">
              ➕ {fa ? 'افزودن معیار' : 'Add Criterion'}
            </button>
          </div>

          {/* Required docs */}
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'مدارک مورد نیاز (هر مدرک یک خط)' : 'Required Documents (one per line)'}</label>
            <textarea value={reqDocs} onChange={e => setReqDocs(e.target.value)} rows={3} className={inp + " resize-none"}
              placeholder={fa ? 'گواهی ثبت شرکت\nجواز کسب\nسابقه کار' : 'Company registration\nBusiness license\nWork experience'} />
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.budgetVisible} onChange={e => setForm({...form, budgetVisible: e.target.checked})} className="w-4 h-4" />
              <span className="text-sm">{fa ? 'نمایش بودجه به متقاضیان' : 'Show budget to participants'}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPublic} onChange={e => setForm({...form, isPublic: e.target.checked})} className="w-4 h-4" />
              <span className="text-sm">{fa ? 'دعوت عمومی (همه شرکاء)' : 'Public invite (all partners)'}</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
          <button onClick={() => { onSubmit({ id: `MNQ-DRAFT-${Date.now()}`, type, title: form.title || fa ? 'پیش‌نویس' : 'Draft', status: 'draft', deadline: form.deadline, proposals: 0, budget: Number(form.budget) || 0, subject: form.subject, items: itemRows }); }} className="px-5 py-2.5 rounded-lg border border-[hsl(var(--border))] text-sm">
            📝 {fa ? 'ذخیره پیش‌نویس' : 'Save Draft'}
          </button>
          <button onClick={handleSubmit} className="flex-1 px-5 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-bold">
            📢 {fa ? 'انتشار مناقصه' : 'Publish Tender'}
          </button>
        </div>
      </div>
    </div>
  );
}
