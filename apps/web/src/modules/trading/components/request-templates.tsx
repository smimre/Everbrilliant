'use client';
import { useState, useEffect } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { RefreshCw, Plus, Trash2, Edit2, Rocket, Package, Building2 } from 'lucide-react';
import { useUIStore } from '@/store';
import { useCreateRequest } from '@/hooks/use-trading';

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
  createdAt: string;
}

const STORAGE_KEY = 'eb-request-templates';
const UNITS = ['تن', 'کیلوگرم', 'عدد', 'لیتر', 'متر', 'متر مربع', 'ton', 'kg', 'unit', 'liter', 'm', 'm2'];

function loadTemplates(): ReqTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTemplates(templates: ReqTemplate[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(templates)); } catch {}
}

export function RequestTemplates() {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const createRequest = useCreateRequest();

  const [templates, setTemplates] = useState<ReqTemplate[]>([]);
  const [hydrated, setHydrated]   = useState(false);
  const [showNew, setShowNew]     = useState(false);
  const [editing, setEditing]     = useState<ReqTemplate | null>(null);
  const [form, setForm] = useState({ name: '', product: '', qty: '', unit: 'ton', preferredSeller: '', note: '' });

  useEffect(() => {
    setTemplates(loadTemplates());
    setHydrated(true);
  }, []);

  function persist(updated: ReqTemplate[]) {
    setTemplates(updated);
    saveTemplates(updated);
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  function openNew() {
    setForm({ name: '', product: '', qty: '', unit: 'ton', preferredSeller: '', note: '' });
    setEditing(null);
    setShowNew(true);
  }

  function openEdit(tpl: ReqTemplate) {
    setForm({ name: tpl.name, product: tpl.product, qty: String(tpl.qty), unit: tpl.unit, preferredSeller: tpl.preferredSeller, note: tpl.note });
    setEditing(tpl);
    setShowNew(true);
  }

  function save() {
    if (!form.name || !form.product) {
      toast('error', fa ? 'نام و محصول الزامی است' : 'Name and product are required');
      return;
    }
    const now = new Date().toLocaleDateString('fa-IR');
    if (editing) {
      persist(templates.map(t => t.id === editing.id
        ? { ...t, ...form, qty: Number(form.qty) || t.qty }
        : t));
    } else {
      persist([...templates, {
        id: `TPL-${Date.now()}`,
        ...form,
        qty: Number(form.qty) || 1,
        usedCount: 0,
        lastUsed: '—',
        createdAt: now,
      }]);
    }
    setShowNew(false);
  }

  function del(id: string) {
    if (!confirm(fa ? 'این الگو حذف شود؟' : 'Delete this template?')) return;
    persist(templates.filter(t => t.id !== id));
    toast('success', fa ? 'الگو حذف شد' : 'Template deleted');
  }

  function use(tpl: ReqTemplate) {
    createRequest.mutate(
      {
        product:  tpl.product,
        qty:      tpl.qty || undefined,
        unit:     tpl.unit,
        note:     tpl.note || undefined,
        priority: 'NORMAL',
      },
      {
        onSuccess: () => {
          const now = new Date().toLocaleDateString('fa-IR');
          persist(templates.map(t => t.id === tpl.id
            ? { ...t, usedCount: t.usedCount + 1, lastUsed: now }
            : t));
          toast('success', fa
            ? `درخواست از الگوی "${tpl.name}" ایجاد شد`
            : `Request created from template "${tpl.name}"`);
        },
        onError: (err: any) => toast('error', err?.message || (fa ? 'خطا در ایجاد درخواست' : 'Failed to create request')),
      }
    );
  }

  if (!hydrated) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[hsl(var(--primary))]"/>
            {fa ? 'الگوهای سفارش' : 'Order Templates'}
          </h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            {fa ? 'الگوها در مرورگر شما ذخیره می‌شوند' : 'Templates are saved in your browser'}
          </p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-1.5 px-3 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-sm font-bold">
          <Plus className="w-4 h-4"/> {fa ? 'الگو جدید' : 'New Template'}
        </button>
      </div>

      {/* Stats */}
      {templates.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: fa ? 'کل الگوها' : 'Total Templates',   value: templates.length,                                          color: '#3b82f6' },
            { label: fa ? 'مجموع استفاده' : 'Total Uses',    value: templates.reduce((s, t) => s + t.usedCount, 0),           color: '#10b981' },
            { label: fa ? 'پرکاربردترین' : 'Most Used',      value: Math.max(...templates.map(t => t.usedCount), 0),          color: '#f59e0b' },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
            </div>
          ))}
        </div>
      )}

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
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm flex items-center gap-1.5 truncate">
                    <RefreshCw className="w-3.5 h-3.5 text-[hsl(var(--primary))] shrink-0"/>
                    {tpl.name}
                  </div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1 flex items-center gap-1">
                    <Package className="w-3 h-3 shrink-0"/> {tpl.product} — {tpl.qty} {tpl.unit}
                  </div>
                  {tpl.preferredSeller && (
                    <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3 h-3 shrink-0"/> {tpl.preferredSeller}
                    </div>
                  )}
                  {tpl.note && (
                    <div className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5 italic line-clamp-2">{tpl.note}</div>
                  )}
                </div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))] text-end shrink-0">
                  <div>{fa ? 'استفاده:' : 'Used:'} <span className="font-bold text-[hsl(var(--primary))]">{tpl.usedCount}</span></div>
                  <div>{fa ? 'آخرین:' : 'Last:'} {tpl.lastUsed}</div>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-[hsl(var(--border))]">
                <button
                  onClick={() => use(tpl)}
                  disabled={createRequest.isPending}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-[hsl(var(--primary))] text-white rounded-lg text-xs font-bold disabled:opacity-50">
                  <Rocket className="w-3 h-3"/>
                  {createRequest.isPending ? '...' : (fa ? 'ایجاد درخواست' : 'Create Request')}
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
