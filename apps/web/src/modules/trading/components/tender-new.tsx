'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store';
import { useCreateTender } from '@/hooks/use-trading';

const UNITS = ['تن','کیلوگرم','لیتر','متر','متر مربع','عدد','دست','سری','کارتن','پالت'];
const CURRENCIES = ['IRR','USD','EUR','AED','CNY','TRY'];
const INCOTERMS_2020 = [
  { code:'EXW', name:'تحویل در محل', group:'E', color:'#8b5cf6', desc:'کمترین مسئولیت فروشنده' },
  { code:'FCA', name:'تحویل به حمل‌کننده', group:'F', color:'#3b82f6', desc:'مناسب کانتینر' },
  { code:'FAS', name:'کنار کشتی', group:'F', color:'#3b82f6', desc:'کالای فله دریایی' },
  { code:'FOB', name:'روی عرشه کشتی', group:'F', color:'#3b82f6', desc:'محبوب‌ترین در ایران' },
  { code:'CFR', name:'هزینه و کرایه', group:'C', color:'#10b981', desc:'بدون بیمه' },
  { code:'CIF', name:'هزینه، بیمه و کرایه', group:'C', color:'#10b981', desc:'با بیمه' },
  { code:'CPT', name:'حمل پرداخت تا مقصد', group:'C', color:'#10b981', desc:'همه روش‌ها' },
  { code:'CIP', name:'حمل و بیمه تا مقصد', group:'C', color:'#10b981', desc:'همه روش‌ها + بیمه' },
  { code:'DAP', name:'تحویل در مقصد', group:'D', color:'#f59e0b', desc:'ترخیص با خریدار' },
  { code:'DPU', name:'تحویل در مقصد تخلیه‌شده', group:'D', color:'#f59e0b', desc:'شامل تخلیه' },
  { code:'DDP', name:'تحویل تعرفه پرداخت‌شده', group:'D', color:'#ef4444', desc:'بیشترین مسئولیت فروشنده' },
];

const PROD_FIELD_GROUPS = [
  { group: 'مقدار', fields: [
    { key: 'qty_range', icon: '📦', label: 'حداقل / حداکثر مقدار', en: 'Qty Range' },
  ]},
  { group: 'قیمت', fields: [
    { key: 'price_floor', icon: '💰', label: 'کف قیمت', en: 'Floor Price' },
    { key: 'price_ceil', icon: '💰', label: 'سقف قیمت', en: 'Ceiling Price' },
    { key: 'currency', icon: '💱', label: 'واحد ارز', en: 'Currency' },
  ]},
  { group: 'تحویل', fields: [
    { key: 'delivery_loc', icon: '📍', label: 'محل تحویل', en: 'Delivery Location' },
    { key: 'delivery_date', icon: '📅', label: 'بازه زمانی تحویل', en: 'Delivery Date Range' },
    { key: 'delivery_type', icon: '🚛', label: 'نوع تحویل (اینکوترمز)', en: 'Incoterms' },
  ]},
  { group: 'پرداخت و قوانین', fields: [
    { key: 'payment_term', icon: '💳', label: 'شرایط پرداخت', en: 'Payment Terms' },
    { key: 'criteria', icon: '🏆', label: 'معیار انتخاب برنده', en: 'Win Criteria' },
    { key: 'guarantee', icon: '🔒', label: 'ضمانت‌نامه', en: 'Guarantee' },
  ]},
  { group: 'شرایط', fields: [
    { key: 'min_exp', icon: '🏛️', label: 'حداقل سابقه (سال)', en: 'Min Experience' },
    { key: 'region', icon: '🗺️', label: 'منطقه جغرافیایی', en: 'Geographic Region' },
    { key: 'docs', icon: '📋', label: 'مدارک مورد نیاز', en: 'Required Documents' },
  ]},
  { group: 'فنی', fields: [
    { key: 'specs', icon: '📝', label: 'مشخصات فنی', en: 'Technical Specs' },
  ]},
];

type ProductRow = {
  name: string; qty: string; qtyMin: string; qtyMax: string; unit: string;
  currency: string; priceFloor: string; priceCeil: string;
  deliveryLoc: string; deliveryFrom: string; deliveryTo: string; deliveryType: string;
  paymentTerm: string; criteria: string; guarantee: string;
  minExp: string; region: string; docs: string; specs: string;
  enabled: Record<string, boolean>;
};

type FormState = {
  title: string; deadline: string; hour: string; type: string;
  notes: string; isPublic: boolean; reqDocs: string;
};

const DEFAULT_ENABLED = Object.fromEntries(
  PROD_FIELD_GROUPS.flatMap(g => g.fields).map(f => [f.key, true])
);

const emptyProduct = (): ProductRow => ({
  name:'', qty:'', qtyMin:'', qtyMax:'', unit:'تن', currency:'IRR',
  priceFloor:'', priceCeil:'', deliveryLoc:'', deliveryFrom:'', deliveryTo:'',
  deliveryType:'FOB', paymentTerm:'', criteria:'lowest_price', guarantee:'',
  minExp:'', region:'', docs:'', specs:'',
  enabled: { ...DEFAULT_ENABLED },
});

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2,'0') + ':00').concat(['23:59']);

export function TenderNew() {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const router = useRouter();

  const createTender = useCreateTender();

  const [form, setForm] = useState<FormState>({
    title:'', deadline:'', hour:'23:59', type:'sealed', notes:'', isPublic:true, reqDocs:'',
  });
  const [products, setProducts] = useState<ProductRow[]>([emptyProduct()]);
  const [submitted, setSubmitted] = useState(false);
  const [showIncoterms, setShowIncoterms] = useState(false);
  const [expandedToggle, setExpandedToggle] = useState<number|null>(null);

  const setF = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: (e.target as HTMLInputElement).type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const addProduct = () => setProducts(p => [...p, emptyProduct()]);
  const removeProduct = (i: number) => setProducts(p => p.filter((_, idx) => idx !== i));
  const setP = (i: number, k: keyof ProductRow, v: string) =>
    setProducts(p => p.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  const toggleField = (pi: number, fk: string) =>
    setProducts(p => p.map((r, idx) => idx === pi ? { ...r, enabled: { ...r.enabled, [fk]: !r.enabled[fk] } } : r));
  const setAllFields = (pi: number, val: boolean) =>
    setProducts(p => p.map((r, idx) => idx === pi ? { ...r, enabled: Object.fromEntries(Object.keys(r.enabled).map(k => [k, val])) } : r));

  const submit = () => {
    if (!form.title)    { toast('error', fa ? 'عنوان مزایده الزامی است' : 'Title required');   return; }
    if (!form.deadline) { toast('error', fa ? 'تاریخ مهلت الزامی است'   : 'Deadline required'); return; }
    if (products.some(p => !p.name)) { toast('error', fa ? 'نام محصول الزامی است' : 'Product name required'); return; }

    const apiType = form.type === 'sealed' ? 'AUCTION' : 'TENDER';
    createTender.mutate(
      {
        type:        apiType,
        title:       form.title,
        description: form.notes || undefined,
        isPublic:    form.isPublic,
        endDate:     form.deadline,
        products:    products.filter(p => p.name).map(p => ({
          name: p.name,
          qty:  Number(p.qtyMax) || Number(p.qtyMin) || 0,
          unit: p.unit,
        })),
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          setTimeout(() => router.push('/trading/tender-manage'), 2000);
        },
        onError: (err: any) => toast('error', err?.message || (fa ? 'خطا در انتشار مزایده' : 'Failed to publish auction')),
      }
    );
  };

  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  if (submitted) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="text-5xl">🎉</div>
      <h2 className="text-xl font-bold text-green-500">{fa ? 'مزایده منتشر شد!' : 'Auction Published!'}</h2>
      <p className="text-sm text-[hsl(var(--muted-foreground))]">{fa ? 'در حال انتقال به صفحه مزایده‌ها...' : 'Redirecting to auctions...'}</p>
    </div>
  );

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-xl font-bold">{fa ? '🏷️ مزایده جدید' : '🏷️ New Auction'}</h1>

      {/* Main Info Card */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'عنوان مزایده *' : 'Auction Title *'}</label>
          <input value={form.title} onChange={setF('title')}
            placeholder={fa ? 'مثال: خرید روغن پالم ۵۰۰ تن' : 'e.g. Purchase 500 tons Palm Oil'}
            className={inp} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">📅 {fa ? 'تاریخ مهلت *' : 'Deadline *'}</label>
            <input value={form.deadline} onChange={setF('deadline')} type="date" className={inp} />
          </div>
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">⏰ {fa ? 'ساعت' : 'Hour'}</label>
            <select value={form.hour} onChange={setF('hour')} className={inp}>
              {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>

        {form.deadline && (
          <div className="px-3 py-2 rounded-lg bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--primary)/0.2)] text-sm text-[hsl(var(--primary))]">
            ⏰ {fa ? 'مهلت نهایی:' : 'Final Deadline:'} <strong>{form.deadline} — {form.hour}</strong>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'نوع مزایده' : 'Auction Type'}</label>
            <select value={form.type} onChange={setF('type')} className={inp}>
              <option value="sealed">{fa ? '🔒 پاکت بسته' : '🔒 Sealed'}</option>
              <option value="open">{fa ? '📖 باز' : '📖 Open'}</option>
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPublic}
                onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))} className="w-4 h-4" />
              <span className="text-sm">{fa ? 'مزایده عمومی (همه شرکاء)' : 'Public (all partners)'}</span>
            </label>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'توضیحات و شرایط' : 'Notes & Conditions'}</label>
          <textarea value={form.notes} onChange={setF('notes')} rows={3}
            placeholder={fa ? 'شرایط تحویل، ضمانت‌نامه، سایر شرایط...' : 'Delivery conditions, guarantees, other terms...'}
            className={inp + " resize-none"} />
        </div>

        <div>
          <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'مدارک مورد نیاز (هر مدرک یک خط)' : 'Required Documents (one per line)'}</label>
          <textarea value={form.reqDocs} onChange={setF('reqDocs')} rows={2}
            placeholder={fa ? 'گواهی ثبت شرکت\nجواز کسب\nسابقه کار' : 'Company registration\nBusiness license\nWork history'}
            className={inp + " resize-none"} />
        </div>
      </div>

      {/* Products */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">📦 {fa ? 'محصولات مزایده' : 'Auction Products'}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowIncoterms(true)}
              className="text-xs px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]"
            >
              📚 {fa ? 'راهنمای اینکوترمز' : 'Incoterms Guide'}
            </button>
            <button onClick={addProduct}
              className="text-xs px-3 py-1.5 rounded-lg border border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.08)]">
              ➕ {fa ? 'محصول' : 'Add Product'}
            </button>
          </div>
        </div>

        {products.map((p, pi) => (
          <div key={pi} className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[hsl(var(--primary))]">{fa ? 'محصول' : 'Product'} {pi + 1}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setExpandedToggle(expandedToggle === pi ? null : pi)}
                  className="text-xs px-2 py-1 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]"
                >
                  ⚙️ {fa ? 'فیلدها' : 'Fields'}
                </button>
                {products.length > 1 && (
                  <button onClick={() => removeProduct(pi)} className="text-red-400 hover:text-red-500 text-xs px-2">✕</button>
                )}
              </div>
            </div>

            {/* Field Toggle Panel */}
            {expandedToggle === pi && (
              <div className="bg-[hsl(var(--secondary))] rounded-xl p-3 border border-[hsl(var(--border))]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[hsl(var(--muted-foreground))]">⚙️ {fa ? 'فیلدهای فعال' : 'Active Fields'}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setAllFields(pi, true)} className="text-xs px-2 py-0.5 rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]">✅ {fa ? 'همه' : 'All'}</button>
                    <button onClick={() => setAllFields(pi, false)} className="text-xs px-2 py-0.5 rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]">⬜ {fa ? 'هیچ' : 'None'}</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
                  {PROD_FIELD_GROUPS.map(g => (
                    <div key={g.group}>
                      <div className="text-[10px] text-[hsl(var(--muted-foreground))] font-bold mb-1 mt-2">{g.group}</div>
                      {g.fields.map(f => (
                        <label key={f.key} className="flex items-center gap-1.5 cursor-pointer mb-1 text-xs">
                          <input type="checkbox" checked={p.enabled[f.key] !== false}
                            onChange={() => toggleField(pi, f.key)} className="w-3.5 h-3.5" />
                          {f.icon} {fa ? f.label : f.en}
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Always-on: Name + Unit */}
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-3">
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'نام محصول *' : 'Product Name *'}</label>
                <input value={p.name} onChange={e => setP(pi, 'name', e.target.value)}
                  placeholder={fa ? 'مثال: روغن پالم RBD' : 'e.g. Palm Oil RBD'}
                  className={inp} />
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'واحد' : 'Unit'}</label>
                <select value={p.unit} onChange={e => setP(pi, 'unit', e.target.value)} className={inp}>
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>

            {/* Qty range */}
            {p.enabled['qty_range'] !== false && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">📦 {fa ? 'حداقل مقدار' : 'Min Quantity'}</label>
                  <input value={p.qtyMin} onChange={e => setP(pi, 'qtyMin', e.target.value)} type="number" className={inp} />
                </div>
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">📦 {fa ? 'حداکثر مقدار' : 'Max Quantity'}</label>
                  <input value={p.qtyMax} onChange={e => setP(pi, 'qtyMax', e.target.value)} type="number" className={inp} />
                </div>
              </div>
            )}

            {/* Price + Currency */}
            <div className="grid grid-cols-3 gap-2">
              {p.enabled['price_floor'] !== false && (
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">💰 {fa ? 'کف قیمت' : 'Floor Price'}</label>
                  <input value={p.priceFloor} onChange={e => setP(pi, 'priceFloor', e.target.value)} type="number" placeholder="80000000" className={inp} />
                </div>
              )}
              {p.enabled['price_ceil'] !== false && (
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">💰 {fa ? 'سقف قیمت' : 'Ceiling Price'}</label>
                  <input value={p.priceCeil} onChange={e => setP(pi, 'priceCeil', e.target.value)} type="number" placeholder="100000000" className={inp} />
                </div>
              )}
              {p.enabled['currency'] !== false && (
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">💱 {fa ? 'ارز' : 'Currency'}</label>
                  <select value={p.currency} onChange={e => setP(pi, 'currency', e.target.value)} className={inp}>
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Delivery */}
            {p.enabled['delivery_loc'] !== false && (
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">📍 {fa ? 'محل تحویل' : 'Delivery Location'}</label>
                <input value={p.deliveryLoc} onChange={e => setP(pi, 'deliveryLoc', e.target.value)}
                  placeholder={fa ? 'مثال: بندر امام خمینی' : 'e.g. Imam Khomeini Port'}
                  className={inp} />
              </div>
            )}
            {p.enabled['delivery_date'] !== false && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">📅 {fa ? 'از تاریخ' : 'From Date'}</label>
                  <input value={p.deliveryFrom} onChange={e => setP(pi, 'deliveryFrom', e.target.value)} className={inp} placeholder="1403/06/01" />
                </div>
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">📅 {fa ? 'تا تاریخ' : 'To Date'}</label>
                  <input value={p.deliveryTo} onChange={e => setP(pi, 'deliveryTo', e.target.value)} className={inp} placeholder="1403/08/01" />
                </div>
              </div>
            )}
            {p.enabled['delivery_type'] !== false && (
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">🚛 {fa ? 'نوع تحویل (اینکوترمز ۲۰۲۰)' : 'Delivery Type (Incoterms 2020)'}</label>
                <select value={p.deliveryType} onChange={e => setP(pi, 'deliveryType', e.target.value)} className={inp}>
                  {['E','F','C','D'].map(g => (
                    <optgroup key={g} label={`گروه ${g}`}>
                      {INCOTERMS_2020.filter(i => i.group === g).map(i => (
                        <option key={i.code} value={i.code}>{i.code} — {i.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}

            {/* Payment + Criteria + Guarantee */}
            <div className="grid grid-cols-2 gap-2">
              {p.enabled['payment_term'] !== false && (
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">💳 {fa ? 'شرایط پرداخت' : 'Payment Terms'}</label>
                  <input value={p.paymentTerm} onChange={e => setP(pi, 'paymentTerm', e.target.value)}
                    placeholder={fa ? '۳۰ روزه' : '30 days'} className={inp} />
                </div>
              )}
              {p.enabled['criteria'] !== false && (
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">🏆 {fa ? 'معیار انتخاب برنده' : 'Win Criteria'}</label>
                  <select value={p.criteria} onChange={e => setP(pi, 'criteria', e.target.value)} className={inp}>
                    <option value="lowest_price">{fa ? 'کمترین قیمت' : 'Lowest Price'}</option>
                    <option value="highest_price">{fa ? 'بالاترین قیمت' : 'Highest Price'}</option>
                    <option value="fastest">{fa ? 'سریع‌ترین تحویل' : 'Fastest Delivery'}</option>
                    <option value="best_combo">{fa ? 'بهترین ترکیب' : 'Best Combo'}</option>
                  </select>
                </div>
              )}
            </div>

            {p.enabled['guarantee'] !== false && (
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">🔒 {fa ? 'ضمانت‌نامه' : 'Guarantee Type'}</label>
                <select value={p.guarantee} onChange={e => setP(pi, 'guarantee', e.target.value)} className={inp}>
                  <option value="">{fa ? 'بدون ضمانت' : 'None'}</option>
                  <option value="bank">{fa ? 'ضمانت‌نامه بانکی' : 'Bank Guarantee'}</option>
                  <option value="check">{fa ? 'چک' : 'Cheque'}</option>
                  <option value="promissory">{fa ? 'سفته' : 'Promissory Note'}</option>
                  <option value="insurance">{fa ? 'بیمه‌نامه' : 'Insurance Bond'}</option>
                </select>
              </div>
            )}

            {/* Conditions */}
            <div className="grid grid-cols-2 gap-2">
              {p.enabled['min_exp'] !== false && (
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">🏛️ {fa ? 'حداقل سابقه (سال)' : 'Min Experience (yrs)'}</label>
                  <input value={p.minExp} onChange={e => setP(pi, 'minExp', e.target.value)} type="number" placeholder="5" className={inp} />
                </div>
              )}
              {p.enabled['region'] !== false && (
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">🗺️ {fa ? 'منطقه جغرافیایی' : 'Geographic Region'}</label>
                  <input value={p.region} onChange={e => setP(pi, 'region', e.target.value)}
                    placeholder={fa ? 'مثال: تهران، اصفهان' : 'e.g. Tehran, Isfahan'} className={inp} />
                </div>
              )}
            </div>
            {p.enabled['docs'] !== false && (
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">📋 {fa ? 'مدارک مورد نیاز این محصول' : 'Required Docs for this Product'}</label>
                <input value={p.docs} onChange={e => setP(pi, 'docs', e.target.value)}
                  placeholder={fa ? 'گواهی کیفیت، COA، ...' : 'Quality certificate, COA, ...'} className={inp} />
              </div>
            )}
            {p.enabled['specs'] !== false && (
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">📝 {fa ? 'مشخصات فنی' : 'Technical Specs'}</label>
                <textarea value={p.specs} onChange={e => setP(pi, 'specs', e.target.value)} rows={2}
                  placeholder={fa ? 'گرید، استاندارد، پارامترهای کیفی...' : 'Grade, standard, quality parameters...'}
                  className={inp + " resize-none"} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Buttons */}
      <div className="flex gap-3 justify-end pb-6">
        <button onClick={() => router.push('/trading')}
          className="px-5 py-2.5 border border-[hsl(var(--border))] rounded-lg text-sm hover:bg-[hsl(var(--muted)/0.5)]">
          {fa ? 'انصراف' : 'Cancel'}
        </button>
        <button onClick={submit} disabled={createTender.isPending}
          className="px-6 py-2.5 bg-[hsl(var(--primary))] text-white rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50">
          {createTender.isPending ? (fa ? 'در حال انتشار...' : 'Publishing...') : `📤 ${fa ? 'انتشار مزایده' : 'Publish Auction'}`}
        </button>
      </div>

      {/* Incoterms Guide Modal */}
      {showIncoterms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-2xl p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">📚 {fa ? 'راهنمای اینکوترمز ۲۰۲۰' : 'Incoterms 2020 Guide'}</h2>
              <button onClick={() => setShowIncoterms(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {['E','F','C','D'].map(g => (
                <div key={g}>
                  <div className="text-xs font-bold text-[hsl(var(--muted-foreground))] mb-1.5 mt-3">{fa ? 'گروه' : 'Group'} {g}</div>
                  <div className="space-y-1.5">
                    {INCOTERMS_2020.filter(i => i.group === g).map(i => (
                      <div key={i.code} className="rounded-xl border border-[hsl(var(--border))] p-3"
                        style={{ borderRight: `3px solid ${i.color}` }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm" style={{ color: i.color }}>{i.code}</span>
                          <span className="font-medium text-sm">{i.name}</span>
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">· {i.desc}</span>
                        </div>
                      </div>
                    ))}
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
