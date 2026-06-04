'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useContracts, useCreateContract, useSignContract } from '@/hooks/use-trading';
import { useUIStore } from '@/store';

const STATUS_MAP: Record<string, { label: string; labelFa: string; color: string; icon: string }> = {
  DRAFT:          { label: 'Draft',          labelFa: 'پیش‌نویس',      color: '#f59e0b', icon: '📝' },
  UNDER_REVIEW:   { label: 'Under Review',   labelFa: 'در بررسی',       color: '#8b5cf6', icon: '🔍' },
  READY_TO_SIGN:  { label: 'Needs Signing',  labelFa: 'نیاز به امضا',   color: '#ef4444', icon: '✍️' },
  ACTIVE:         { label: 'Active',         labelFa: 'فعال',            color: '#3b82f6', icon: '🟢' },
  COMPLETED:      { label: 'Completed',      labelFa: 'تکمیل شده',      color: '#10b981', icon: '🏆' },
  EXPIRED:        { label: 'Expired',        labelFa: 'منقضی شده',      color: '#94a3b8', icon: '⏰' },
  CANCELLED:      { label: 'Cancelled',      labelFa: 'لغو شده',        color: '#ef4444', icon: '❌' },
};

const INCOTERMS = ['EXW','FCA','FAS','FOB','CFR','CIF','CPT','CIP','DAP','DPU','DDP'];

function fmtDate(iso: string) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('fa-IR'); } catch { return iso; }
}

export function MyContracts() {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const { data: rawContracts, isLoading } = useContracts();
  const contracts: any[] = (rawContracts as any)?.data ?? [];
  const signContract = useSignContract();
  const [selected, setSelected] = useState<any>(null);
  const [showNew, setShowNew] = useState(false);
  const [signModal, setSignModal] = useState<any>(null);
  const [signPass, setSignPass] = useState('');

  const needsSigning = contracts.filter(c => ['DRAFT','READY_TO_SIGN'].includes((c.status || '').toUpperCase()));
  const active       = contracts.filter(c => (c.status || '').toUpperCase() === 'ACTIVE');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">📄 {fa ? 'قراردادها' : 'My Contracts'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{contracts.length} {fa ? 'قرارداد' : 'contracts'}</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90"
        >
          📄 {fa ? 'قرارداد جدید' : 'New Contract'}
        </button>
      </div>

      {/* 4-col Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: '📄', val: contracts.length,   label: fa ? 'کل قراردادها' : 'All Contracts',  color: '#3b82f6' },
          { icon: '✍️', val: needsSigning.length, label: fa ? 'نیاز به امضا' : 'Needs Signing',  color: '#ef4444' },
          { icon: '🟢', val: active.length,       label: fa ? 'فعال' : 'Active',                 color: '#10b981' },
          { icon: '📝', val: contracts.filter(c => (c.status || '').toUpperCase() === 'DRAFT').length, label: fa ? 'پیش‌نویس' : 'Draft', color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alert */}
      {needsSigning.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
          ✍️ <strong>{needsSigning.length} {fa ? 'قرارداد' : 'contract'}</strong> {fa ? 'منتظر امضای شماست!' : 'awaiting your signature!'}
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-32 rounded-xl bg-[hsl(var(--muted)/0.5)] animate-pulse" />)}</div>
      ) : contracts.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">📄</div>
          <p className="font-medium">{fa ? 'قراردادی ندارید' : 'No contracts yet'}</p>
          <button onClick={() => setShowNew(true)} className="mt-4 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm">
            {fa ? '+ قرارداد جدید' : '+ New Contract'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((c: any) => (
            <ContractCard key={c.id} contract={c} lang={lang} onView={() => setSelected(c)} onSign={() => setSignModal(c)} />
          ))}
        </div>
      )}

      {showNew && <NewContractModal lang={lang} onClose={() => setShowNew(false)} />}
      {selected && <ContractDetailModal contract={selected} lang={lang} onClose={() => setSelected(null)} onSign={() => { setSelected(null); setSignModal(selected); }} />}
      {signModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-sm p-6 shadow-2xl">
            <h2 className="font-bold mb-3">✍️ {fa ? 'تایید امضای قرارداد' : 'Confirm Contract Signature'}</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
              {fa ? 'برای امضای قرارداد رمز عبور خود را وارد کنید:' : 'Enter your password to sign the contract:'}
            </p>
            <input
              type="password"
              value={signPass}
              onChange={e => setSignPass(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]"
              placeholder="••••••••"
            />
            <div className="flex gap-3">
              <button onClick={() => { setSignModal(null); setSignPass(''); }} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
              <button
                disabled={signContract.isPending}
                onClick={() => {
                  if (!signPass) return;
                  signContract.mutate(signModal.id, {
                    onSuccess: () => {
                      toast('success', fa ? 'قرارداد با موفقیت امضا شد' : 'Contract signed successfully');
                      setSignModal(null); setSignPass('');
                    },
                    onError: (err: any) => toast('error', err?.message || (fa ? 'خطا در امضا' : 'Failed to sign')),
                  });
                }}
                className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium disabled:opacity-50"
              >
                ✍️ {fa ? 'تایید امضا' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContractCard({ contract: c, lang, onView, onSign }: { contract: any; lang: string; onView: () => void; onSign: () => void }) {
  const fa = lang === 'fa';
  const st = (c.status || '').toUpperCase();
  const info = STATUS_MAP[st] || STATUS_MAP.DRAFT;
  const needsSigning = ['DRAFT', 'READY_TO_SIGN'].includes(st);

  return (
    <div
      className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 hover:border-[hsl(var(--primary)/0.3)] transition-colors"
      style={{ borderRight: `4px solid ${info.color}` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-bold text-sm truncate">{c.title}</span>
            <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ background: info.color + '20', color: info.color }}>
              {info.icon} {fa ? info.labelFa : info.label}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-[hsl(var(--muted-foreground))]">
            {c.amountIRR && <span className="text-amber-500 font-semibold">💰 {Number(c.amountIRR).toLocaleString('fa-IR')} {c.currency || 'IRR'}</span>}
            {c.deliveryDate && <span>📅 {fmtDate(c.deliveryDate)}</span>}
            {c.terms && <span>📋 {c.terms}</span>}
          </div>
          {/* Signature Status */}
          <div className="flex gap-3 mt-2 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.signedBuyer ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
              🏢 {fa ? 'خریدار' : 'Buyer'}: {c.signedBuyer ? (fa ? 'امضا شد ✅' : 'Signed ✅') : (fa ? 'در انتظار ⏳' : 'Pending ⏳')}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.signedSeller ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
              🏭 {fa ? 'فروشنده' : 'Seller'}: {c.signedSeller ? (fa ? 'امضا شد ✅' : 'Signed ✅') : (fa ? 'در انتظار ⏳' : 'Pending ⏳')}
            </span>
            {st === 'ACTIVE' && !c.invoiceId && (
              <a href="/finance/invoices"
                className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors">
                + {fa ? 'ایجاد فاکتور مالی' : 'Create Finance Invoice'}
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={onView} className="text-xs px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]">
            {fa ? 'مشاهده' : 'View'}
          </button>
          {needsSigning && (
            <button onClick={onSign} className="text-xs px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))] text-white hover:opacity-90">
              ✍️ {fa ? 'امضا' : 'Sign'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ContractDetailModal({ contract: c, lang, onClose, onSign }: { contract: any; lang: string; onClose: () => void; onSign: () => void }) {
  const fa = lang === 'fa';
  const st = (c.status || '').toUpperCase();
  const info = STATUS_MAP[st] || STATUS_MAP.DRAFT;
  const needsSigning = ['DRAFT', 'READY_TO_SIGN'].includes(st);

  const rows: [string, any][] = [
    [fa ? 'ارزش قرارداد' : 'Contract Value', c.amountIRR ? `${Number(c.amountIRR).toLocaleString('fa-IR')} ${c.currency || 'IRR'}` : null],
    [fa ? 'ارز' : 'Currency', c.currency],
    [fa ? 'تاریخ تحویل' : 'Delivery Date', c.deliveryDate ? fmtDate(c.deliveryDate) : null],
    [fa ? 'شرایط پرداخت' : 'Payment Terms', c.terms],
    [fa ? 'تاریخ ایجاد' : 'Created', c.createdAt ? fmtDate(c.createdAt) : null],
  ].filter(([, v]) => v) as [string, any][];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl my-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">📄 {c.title}</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] text-xl">✕</button>
        </div>
        <span className="text-xs px-2 py-1 rounded-full mb-4 inline-block" style={{ background: info.color + '20', color: info.color }}>
          {info.icon} {fa ? info.labelFa : info.label}
        </span>

        {rows.length > 0 && (
          <div className="space-y-1 mt-3">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm py-2 border-b border-[hsl(var(--border)/0.5)]">
                <span className="text-[hsl(var(--muted-foreground))]">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Signature blocks */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {[
            { role: fa ? '🏢 خریدار' : '🏢 Buyer', signed: c.signedBuyer, at: c.signedBuyerAt },
            { role: fa ? '🏭 فروشنده' : '🏭 Seller', signed: c.signedSeller, at: c.signedSellerAt },
          ].map((s, i) => (
            <div key={i} className={`p-3 rounded-xl border text-sm ${s.signed ? 'border-green-500/30 bg-green-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
              <div className="font-medium mb-1">{s.role}</div>
              {s.signed ? (
                <div className="text-green-500 text-xs">✅ {fa ? 'امضا شده' : 'Signed'}{s.at ? ` — ${fmtDate(s.at)}` : ''}</div>
              ) : (
                <div className="text-amber-500 text-xs">⏳ {fa ? 'در انتظار' : 'Pending'}</div>
              )}
            </div>
          ))}
        </div>

        {needsSigning && (
          <button onClick={onSign} className="w-full mt-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
            ✍️ {fa ? 'امضای قرارداد' : 'Sign Contract'}
          </button>
        )}

        {/* Cross-module links */}
        <div className="mt-4 p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-2">🔗 {fa ? 'ماژول‌های مرتبط' : 'Related Modules'}</p>
          <div className="flex gap-2 flex-wrap">
            <a href="/finance/invoices"
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors font-medium">
              🧾 {fa ? 'فاکتورهای مالی' : 'Finance Invoices'}
            </a>
            <a href="/trading/letterhead"
              className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors font-medium">
              📄 {fa ? 'سربرگ / امضا دیجیتال' : 'Letterhead / Sign'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewContractModal({ lang, onClose }: { lang: string; onClose: () => void }) {
  const fa = lang === 'fa';
  const { toast } = useUIStore();
  const createContract = useCreateContract();
  const [form, setForm] = useState({
    title: '', role: 'buyer', product: '', qty: '', unit: 'ton', unitPrice: '',
    currency: 'IRR', deliveryDate: '', deliveryPlace: '', paymentTerms: '', incoterms: 'EXW', clauses: '',
  });

  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";
  const totalPrice = form.qty && form.unitPrice ? Number(form.qty) * Number(form.unitPrice) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">📄 {fa ? 'قرارداد جدید' : 'New Contract'}</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] text-xl">✕</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'عنوان قرارداد *' : 'Contract Title *'}</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inp} placeholder={fa ? 'مثال: قرارداد خرید روغن پالم' : 'e.g. Palm Oil Purchase Contract'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'نقش من' : 'My Role'}</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className={inp}>
                <option value="buyer">{fa ? '🏢 خریدار' : '🏢 Buyer'}</option>
                <option value="seller">{fa ? '🏭 فروشنده' : '🏭 Seller'}</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'اینکوترمز' : 'Incoterms'}</label>
              <select value={form.incoterms} onChange={e => setForm({...form, incoterms: e.target.value})} className={inp}>
                {INCOTERMS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'کالا / خدمات' : 'Product / Service'}</label>
            <input value={form.product} onChange={e => setForm({...form, product: e.target.value})} className={inp} />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-2">
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'مقدار' : 'Quantity'}</label>
              <input value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} type="number" className={inp} />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'واحد' : 'Unit'}</label>
              <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className={inp}>
                {['ton','kg','unit','m','m2','m3','liter'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'ارز' : 'Currency'}</label>
              <select value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} className={inp}>
                <option>IRR</option><option>USD</option><option>EUR</option><option>AED</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'قیمت واحد' : 'Unit Price'}</label>
              <input value={form.unitPrice} onChange={e => setForm({...form, unitPrice: e.target.value})} type="number" className={inp} />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'ارزش کل' : 'Total'}</label>
              <div className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] text-sm font-bold text-amber-500">
                {totalPrice > 0 ? totalPrice.toLocaleString('fa-IR') : '—'} {form.currency}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'تاریخ تحویل' : 'Delivery Date'}</label>
              <input value={form.deliveryDate} onChange={e => setForm({...form, deliveryDate: e.target.value})} className={inp} placeholder="1403/06/15" />
            </div>
            <div>
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'محل تحویل' : 'Delivery Place'}</label>
              <input value={form.deliveryPlace} onChange={e => setForm({...form, deliveryPlace: e.target.value})} className={inp} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'شرایط پرداخت' : 'Payment Terms'}</label>
            <input value={form.paymentTerms} onChange={e => setForm({...form, paymentTerms: e.target.value})} className={inp} placeholder={fa ? 'مثال: ۳۰ روزه از تاریخ تحویل' : 'e.g. 30 days from delivery'} />
          </div>
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'بندهای اضافی (هر بند یک خط)' : 'Additional Clauses (one per line)'}</label>
            <textarea value={form.clauses} onChange={e => setForm({...form, clauses: e.target.value})} rows={3} className={inp + " resize-none"} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
          <button
            disabled={createContract.isPending}
            onClick={() => {
              if (!form.title) { toast('error', fa ? 'عنوان الزامی است' : 'Title required'); return; }
              createContract.mutate(
                { ...form, totalPrice },
                {
                  onSuccess: () => { toast('success', fa ? 'قرارداد ایجاد شد' : 'Contract created'); onClose(); },
                  onError: (err: any) => toast('error', err?.message || (fa ? 'خطا در ایجاد قرارداد' : 'Failed to create contract')),
                },
              );
            }}
            className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium disabled:opacity-50"
          >
            {createContract.isPending ? (fa ? 'در حال ثبت...' : 'Saving...') : `✅ ${fa ? 'ثبت قرارداد' : 'Create'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
