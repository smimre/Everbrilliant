'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useRequests, useCreateRequest } from '@/hooks/use-trading';
import { useUIStore } from '@/store';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', quoted: '#3b82f6', approved: '#10b981',
  paid: '#06b6d4', issued: '#8b5cf6', completed: '#10b981', rejected: '#ef4444',
};
const STATUS_ICONS: Record<string, string> = {
  pending: '⏳', quoted: '💬', approved: '✅', paid: '💳', issued: '📜', completed: '✔️', rejected: '❌',
};

export function MyRequests() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const { data: rawRequests, isLoading } = useRequests();
  const requests: any[] = rawRequests?.data ?? [];
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const statusLabel: Record<string, { fa: string; en: string }> = {
    all:       { fa: 'همه', en: 'All' },
    pending:   { fa: 'در انتظار', en: 'Pending' },
    quoted:    { fa: 'قیمت داده', en: 'Quoted' },
    approved:  { fa: 'تایید شده', en: 'Approved' },
    paid:      { fa: 'پرداخت شده', en: 'Paid' },
    completed: { fa: 'تکمیل', en: 'Completed' },
    rejected:  { fa: 'رد شده', en: 'Rejected' },
  };

  const filtered = requests.filter((r: any) => {
    const matchStatus = filter === 'all' || r.status === filter;
    const matchSearch = !search || (r.productName || r.title || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    all: requests.length,
    pending: requests.filter((r: any) => r.status === 'pending').length,
    quoted: requests.filter((r: any) => r.status === 'quoted').length,
    approved: requests.filter((r: any) => ['approved','paid','completed'].includes(r.status)).length,
    rejected: requests.filter((r: any) => r.status === 'rejected').length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">📋 {fa ? 'درخواست‌های من' : 'My Requests'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{filtered.length} {fa ? 'درخواست' : 'requests'}</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          ➕ {fa ? 'درخواست جدید' : 'New Request'}
        </button>
      </div>

      {/* 5-column stats */}
      <div className="grid grid-cols-5 gap-2">
        {(['all','pending','quoted','approved','rejected'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`p-3 rounded-xl border text-center transition-all ${
              filter === s
                ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)]'
                : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary))] hover:border-[hsl(var(--primary)/0.3)]'
            }`}
          >
            <div className="text-lg font-bold" style={{ color: s === 'all' ? 'hsl(var(--foreground))' : STATUS_COLORS[s] }}>
              {counts[s]}
            </div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))] leading-tight">
              {fa ? statusLabel[s].fa : statusLabel[s].en}
            </div>
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={fa ? '🔍 جستجو در درخواست‌ها...' : '🔍 Search requests...'}
        className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]"
      />

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-[hsl(var(--muted)/0.5)] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-medium">{fa ? 'درخواستی یافت نشد' : 'No requests found'}</p>
          <p className="text-sm mt-1">{fa ? 'درخواست جدید ثبت کنید' : 'Create a new request'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r: any) => (
            <RequestCard key={r.id} request={r} lang={lang} onSelect={() => setSelected(r)} />
          ))}
        </div>
      )}

      {showNew && <NewRequestModal lang={lang} onClose={() => setShowNew(false)} />}
      {selected && <RequestDetailModal request={selected} lang={lang} onClose={() => setSelected(null)} />}
    </div>
  );
}

function RequestCard({ request: r, lang, onSelect }: { request: any; lang: string; onSelect: () => void }) {
  const fa = lang === 'fa';
  const { toast } = useUIStore();
  const color = STATUS_COLORS[r.status] || '#64748b';
  const statusLabels: Record<string, string> = {
    pending: fa ? '⏳ در انتظار' : '⏳ Pending',
    quoted: fa ? '💬 قیمت داده' : '💬 Quoted',
    approved: fa ? '✅ تایید شده' : '✅ Approved',
    paid: fa ? '💳 پرداخت شده' : '💳 Paid',
    issued: fa ? '📜 صادر شده' : '📜 Issued',
    completed: fa ? '✔️ تکمیل شده' : '✔️ Completed',
    rejected: fa ? '❌ رد شده' : '❌ Rejected',
  };

  return (
    <div
      className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 hover:border-[hsl(var(--primary)/0.3)] transition-colors cursor-pointer"
      style={{ borderRight: `4px solid ${color}` }}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-sm truncate">{r.productName || r.title || (fa ? 'درخواست' : 'Request')}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0" style={{ background: `${color}20`, color }}>
              {statusLabels[r.status] || r.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))] flex-wrap">
            {r.quantity && <span>📦 {r.quantity} {r.unit || ''}</span>}
            {r.amountIRR && <span className="font-semibold" style={{ color: '#f59e0b' }}>💰 {Number(r.amountIRR).toLocaleString('fa-IR')} IRR</span>}
            {r.createdAt && <span>📅 {r.createdAt}</span>}
          </div>
          {r.description && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 line-clamp-2">{r.description}</p>
          )}
        </div>
        {/* Quoted: show Confirm/Reject actions */}
        {r.status === 'quoted' && (
          <div className="flex gap-2 shrink-0" onClick={e => e.stopPropagation()}>
            <button
              className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500 text-xs font-bold hover:bg-green-500/20 transition-colors"
              onClick={() => toast('success', fa ? 'قیمت تایید شد' : 'Quote confirmed')}
            >
              ✅ {fa ? 'تایید' : 'Confirm'}
            </button>
            <button
              className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-colors"
              onClick={() => toast('success', fa ? 'قیمت رد شد' : 'Quote rejected')}
            >
              ❌ {fa ? 'رد' : 'Reject'}
            </button>
          </div>
        )}
        {r.status !== 'quoted' && (
          <button className="text-xs px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)] transition-colors shrink-0">
            {fa ? 'جزئیات' : 'Details'}
          </button>
        )}
      </div>
    </div>
  );
}

function RequestDetailModal({ request: r, lang, onClose }: { request: any; lang: string; onClose: () => void }) {
  const fa = lang === 'fa';
  const color = STATUS_COLORS[r.status] || '#64748b';
  const fields: [string, any][] = [
    [fa ? 'نام کالا' : 'Product', r.productName || r.title],
    [fa ? 'مقدار' : 'Quantity', r.quantity ? `${r.quantity} ${r.unit || ''}` : null],
    [fa ? 'مبلغ' : 'Amount', r.amountIRR ? `${Number(r.amountIRR).toLocaleString('fa-IR')} IRR` : null],
    [fa ? 'تاریخ' : 'Date', r.createdAt],
    [fa ? 'وضعیت' : 'Status', r.status],
  ].filter(([, v]) => v) as [string, any][];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">📋 {r.productName || r.title || (fa ? 'درخواست' : 'Request')}</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] text-xl">✕</button>
        </div>
        <span className="text-xs px-2 py-1 rounded-full mb-4 inline-block" style={{ background: color + '20', color }}>
          {STATUS_ICONS[r.status]} {r.status}
        </span>
        <div className="space-y-1 mt-3">
          {fields.map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm py-2 border-b border-[hsl(var(--border)/0.5)]">
              <span className="text-[hsl(var(--muted-foreground))]">{k}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </div>
        {r.description && (
          <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))] p-3 bg-[hsl(var(--muted)/0.3)] rounded-lg">{r.description}</p>
        )}
        {r.status === 'quoted' && (
          <div className="flex gap-3 mt-5">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500 text-sm font-bold"
            >
              ✅ {fa ? 'تایید قیمت' : 'Confirm Quote'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-bold"
            >
              ❌ {fa ? 'رد قیمت' : 'Reject Quote'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NewRequestModal({ lang, onClose }: { lang: string; onClose: () => void }) {
  const fa = lang === 'fa';
  const { toast } = useUIStore();
  const createRequest = useCreateRequest();
  const [form, setForm] = useState({
    productName: '', quantity: '', unit: 'ton', currency: 'IRR',
    priority: 'normal', deadline: '', description: '', hsCode: '',
  });

  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">➕ {fa ? 'درخواست جدید' : 'New Request'}</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] text-xl">✕</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'نام کالا / خدمات *' : 'Product / Service *'}</label>
            <input value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })} className={inp}
              placeholder={fa ? 'مثال: فولاد ساختمانی' : 'e.g. Construction Steel'} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'مقدار' : 'Quantity'}</label>
              <input value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} type="number" className={inp} />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'واحد' : 'Unit'}</label>
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className={inp}>
                <option value="ton">{fa ? 'تن' : 'Ton'}</option>
                <option value="kg">Kg</option>
                <option value="unit">{fa ? 'عدد' : 'Unit'}</option>
                <option value="m">{fa ? 'متر' : 'Meter'}</option>
                <option value="liter">{fa ? 'لیتر' : 'Liter'}</option>
                <option value="m2">{fa ? 'متر مربع' : 'Sq.m'}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'ارز' : 'Currency'}</label>
              <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className={inp}>
                <option>IRR</option><option>USD</option><option>EUR</option><option>AED</option><option>CNY</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'اولویت' : 'Priority'}</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className={inp}>
                <option value="low">{fa ? 'پایین' : 'Low'}</option>
                <option value="normal">{fa ? 'معمولی' : 'Normal'}</option>
                <option value="high">{fa ? 'بالا' : 'High'}</option>
                <option value="urgent">{fa ? 'فوری' : 'Urgent'}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'تاریخ مهلت' : 'Deadline'}</label>
            <input value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className={inp} placeholder="1403/06/15" />
          </div>
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'کد HS (اختیاری)' : 'HS Code (optional)'}</label>
            <input value={form.hsCode} onChange={e => setForm({ ...form, hsCode: e.target.value })} className={inp} placeholder="1511.90" />
          </div>
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'توضیحات' : 'Description'}</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
              className={inp + " resize-none"} placeholder={fa ? 'مشخصات فنی، شرایط تحویل...' : 'Technical specs, delivery terms...'} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
            {fa ? 'انصراف' : 'Cancel'}
          </button>
          <button
            disabled={createRequest.isPending}
            onClick={() => {
              if (!form.productName) { toast('error', fa ? 'نام کالا الزامی است' : 'Product name required'); return; }
              createRequest.mutate(
                {
                  product: form.productName,
                  qty: form.quantity ? Number(form.quantity) : undefined,
                  unit: form.unit,
                  currency: form.currency,
                  priority: form.priority,
                  deadline: form.deadline || undefined,
                  note: form.description || undefined,
                  hsCode: form.hsCode || undefined,
                },
                {
                  onSuccess: () => { toast('success', fa ? 'درخواست ثبت شد' : 'Request submitted'); onClose(); },
                  onError: (err: any) => toast('error', err?.message || (fa ? 'خطا در ثبت درخواست' : 'Failed to submit')),
                }
              );
            }}
            className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {createRequest.isPending ? (fa ? 'در حال ثبت...' : 'Submitting...') : `✅ ${fa ? 'ثبت درخواست' : 'Submit'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
