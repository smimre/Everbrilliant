'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { RefreshCw, Plus, Trash2, Edit2, Rocket, Package, Building2 } from 'lucide-react';

interface ReqTemplate {
  id: string;
  name: string;
  product: string;
  qty: number;
  unit: string;
  preferredSeller: string;
  note: string;
  usedCount: number;
  lastUsed: string;
}

const INIT_TEMPLATES: ReqTemplate[] = [
  { id: 'TPL-001', name: 'خرید ماهانه روغن پالم',      product: 'روغن پالم',      qty: 20,  unit: 'تن',     preferredSeller: 'مهر پارس',   note: 'گرید RBD، تحویل انبار تهران', usedCount: 8,  lastUsed: '۱۴۰۳/۰۳/۰۱' },
  { id: 'TPL-002', name: 'سفارش فصلی مواد شیمیایی',   product: 'اسید سولفوریک', qty: 5,   unit: 'تن',     preferredSeller: 'تجارت نوین', note: 'درجه خلوص ۹۸٪',              usedCount: 3,  lastUsed: '۱۴۰۳/۰۲/۱۵' },
  { id: 'TPL-003', name: 'خرید قطعات یدکی',           product: 'قطعات صنعتی',   qty: 100, unit: 'عدد',    preferredSeller: '',            note: 'اورجینال یا معادل',           usedCount: 12, lastUsed: '۱۴۰۳/۰۳/۱۰' },
];

const UNITS = ['تن', 'کیلوگرم', 'عدد', 'لیتر', 'متر', 'متر مربع'];

export function RequestTemplates() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';

  const [templates, setTemplates] = useState<ReqTemplate[]>(INIT_TEMPLATES);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<ReqTemplate | null>(null);
  const [form, setForm] = useState({ name: '', product: '', qty: '', unit: 'تن', preferredSeller: '', note: '' });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const openNew = () => {
    setForm({ name: '', product: '', qty: '', unit: 'تن', preferredSeller: '', note: '' });
    setEditing(null);
    setShowNew(true);
  };

  const openEdit = (tpl: ReqTemplate) => {
    setForm({ name: tpl.name, product: tpl.product, qty: String(tpl.qty), unit: tpl.unit, preferredSeller: tpl.preferredSeller, note: tpl.note });
    setEditing(tpl);
    setShowNew(true);
  };

  const save = () => {
    if (!form.name || !form.product) return alert(fa ? 'نام و محصول الزامی است' : 'Name and product are required');
    if (editing) {
      setTemplates(ts => ts.map(t => t.id === editing.id ? { ...t, ...form, qty: Number(form.qty) || t.qty } : t));
    } else {
      setTemplates(ts => [...ts, {
        id: 'TPL-' + Date.now(), ...form, qty: Number(form.qty) || 1,
        usedCount: 0, lastUsed: '—',
      }]);
    }
    setShowNew(false);
  };

  const del = (id: string) => {
    if (!confirm(fa ? 'این الگو حذف شود؟' : 'Delete this template?')) return;
    setTemplates(ts => ts.filter(t => t.id !== id));
  };

  const use = (tpl: ReqTemplate) => {
    setTemplates(ts => ts.map(t => t.id === tpl.id ? { ...t, usedCount: t.usedCount + 1, lastUsed: '۱۴۰۳/۰۳/۱۵' } : t));
    alert(fa ? `الگوی "${tpl.name}" انتخاب شد — به صفحه درخواست جدید بروید` : `Template "${tpl.name}" selected — go to New Request`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-[hsl(var(--primary))]"/>
          {fa ? 'الگوهای سفارش' : 'Order Templates'}
        </h2>
        <button onClick={openNew}
          className="flex items-center gap-1.5 px-3 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-sm font-bold">
          <Plus className="w-4 h-4"/> {fa ? 'الگو جدید' : 'New Template'}
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[hsl(var(--border))] rounded-xl text-[hsl(var(--muted-foreground))]">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 opacity-20"/>
          <p className="font-semibold">{fa ? 'الگویی ندارید' : 'No templates yet'}</p>
          <p className="text-sm mt-1 max-w-xs mx-auto">
            {fa
              ? 'الگوها به شما کمک می‌کنند سفارش‌های تکراری را سریع‌تر ثبت کنید'
              : 'Templates help you quickly reuse recurring order details'}
          </p>
          <button onClick={openNew}
            className="mt-4 px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-sm font-bold">
            + {fa ? 'ایجاد الگو' : 'Create Template'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map(tpl => (
            <div key={tpl.id}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 hover:border-[hsl(var(--primary)/0.4)] transition-colors">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-[hsl(var(--primary))]"/>
                    {tpl.name}
                  </div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1 flex items-center gap-1">
                    <Package className="w-3 h-3"/> {tpl.product} — {tpl.qty} {tpl.unit}
                  </div>
                  {tpl.preferredSeller && (
                    <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3 h-3"/> {tpl.preferredSeller}
                    </div>
                  )}
                  {tpl.note && (
                    <div className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5 italic">{tpl.note}</div>
                  )}
                </div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))] text-end shrink-0">
                  <div>{fa ? 'استفاده:' : 'Used:'} {tpl.usedCount}</div>
                  <div>{fa ? 'آخرین:' : 'Last:'} {tpl.lastUsed}</div>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-[hsl(var(--border))]">
                <button onClick={() => use(tpl)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-[hsl(var(--primary))] text-white rounded-lg text-xs font-bold">
                  <Rocket className="w-3 h-3"/> {fa ? 'استفاده' : 'Use'}
                </button>
                <button onClick={() => openEdit(tpl)}
                  className="p-1.5 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]">
                  <Edit2 className="w-3.5 h-3.5"/>
                </button>
                <button onClick={() => del(tpl.id)}
                  className="p-1.5 border border-red-500/20 rounded-lg hover:bg-red-500/10 text-red-400">
                  <Trash2 className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(var(--background))] rounded-2xl p-6 w-full max-w-md border border-[hsl(var(--border))]">
            <h3 className="font-bold text-lg mb-4">
              {editing ? (fa ? '✏️ ویرایش الگو' : '✏️ Edit Template') : (fa ? '🔁 الگوی سفارش جدید' : '🔁 New Order Template')}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa ? 'نام الگو *' : 'Template Name *'}</label>
                <input value={form.name} onChange={set('name')}
                  placeholder={fa ? 'مثال: خرید ماهانه روغن پالم' : 'e.g. Monthly Palm Oil Order'}
                  className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"/>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa ? 'محصول *' : 'Product *'}</label>
                <input value={form.product} onChange={set('product')}
                  placeholder={fa ? 'نام کالا' : 'Product name'}
                  className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"/>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa ? 'مقدار' : 'Qty'}</label>
                  <input value={form.qty} onChange={set('qty')} type="number"
                    className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"/>
                </div>
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa ? 'واحد' : 'Unit'}</label>
                  <select value={form.unit} onChange={set('unit')}
                    className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none">
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa ? 'فروشنده ترجیحی' : 'Preferred Seller'}</label>
                <input value={form.preferredSeller} onChange={set('preferredSeller')}
                  placeholder={fa ? 'اختیاری' : 'Optional'}
                  className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"/>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa ? 'یادداشت / شرایط ثابت' : 'Notes / Fixed Terms'}</label>
                <textarea value={form.note} onChange={set('note')}
                  placeholder={fa ? 'گرید، محل تحویل، شرایط ثابت...' : 'Grade, delivery location, fixed terms...'}
                  className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none resize-none h-16"/>
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setShowNew(false)}
                className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">
                {fa ? 'انصراف' : 'Cancel'}
              </button>
              <button onClick={save}
                className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-bold">
                💾 {fa ? 'ذخیره الگو' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
