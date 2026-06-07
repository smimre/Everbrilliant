'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { exportInvoicePDF } from '@/lib/export-pdf';

// ── Types ─────────────────────────────────────────────────────
interface InvoiceItem {
  id: string;
  description: string;
  descriptionFa?: string;
  qty: number;
  unit: string;
  unitPrice: number;
  discount: number;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
}

interface Invoice {
  id: string;
  no: string;
  type: 'sale' | 'purchase';
  country: 'IR' | 'AE' | 'OTHER';
  invoiceType?: 'type1' | 'type2' | 'type3'; // Iran: نوع اول/دوم/سوم
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  issuedAt: string;
  dueAt: string;
  // Seller
  sellerName: string;
  sellerNationalId?: string;    // شناسه ملی
  sellerEconomicCode?: string;  // کد اقتصادی
  sellerVatNo?: string;         // شماره مالیاتی (امارات)
  sellerTRN?: string;           // TRN امارات
  sellerAddress?: string;
  sellerPostalCode?: string;
  sellerRegNo?: string;
  // Buyer
  buyerName: string;
  buyerNationalId?: string;
  buyerEconomicCode?: string;
  buyerVatNo?: string;
  buyerTRN?: string;
  buyerAddress?: string;
  // Items
  items: InvoiceItem[];
  // Totals
  subtotal: number;
  discountTotal: number;
  netSubtotal: number;
  vatAmount: number;   // 9% Iran / 5% UAE
  tolAmount: number;   // 1% Iran عوارض
  taxTotal: number;
  grandTotal: number;
  // Iran specific
  taxSerial?: string;        // شماره یکتا (سامانه مودیان)
  modiyanRef?: string;       // کد رهگیری سامانه مودیان
  samanehRef?: string;       // سامانه جامع تجارت
  satpRef?: string;          // سامانه ثامن
  // UAE specific
  trnNo?: string;
  currency: 'IRR' | 'AED' | 'USD';
  notes?: string;
  internalRef?: string;
}

const IRAN_VAT_RATE = 9;
const IRAN_TOL_RATE = 1;
const UAE_VAT_RATE = 5;

interface Props { isPurchase?: boolean; }

export function Invoices({ isPurchase }: Props) {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [showPrint, setShowPrint] = useState<Invoice | null>(null);

  const filtered = invoices.filter(i => isPurchase ? i.type === 'purchase' : i.type === 'sale');

  const stats = [
    { icon: '🧾', val: filtered.length, label: fa ? 'کل فاکتورها' : 'Total', color: '#3b82f6' },
    { icon: '✅', val: filtered.filter(i => i.status === 'paid').length, label: fa ? 'پرداخت شده' : 'Paid', color: '#10b981' },
    { icon: '⏳', val: filtered.filter(i => ['sent','partial'].includes(i.status)).length, label: fa ? 'در انتظار' : 'Pending', color: '#f59e0b' },
    { icon: '🔴', val: filtered.filter(i => i.status === 'overdue').length, label: fa ? 'سررسید گذشته' : 'Overdue', color: '#ef4444' },
  ];

  const statusColors: Record<string,string> = { draft:'#64748b', sent:'#3b82f6', paid:'#10b981', partial:'#f59e0b', overdue:'#ef4444', cancelled:'#94a3b8' };
  const statusLabels: Record<string,string> = {
    draft: fa?'پیش‌نویس':'Draft', sent: fa?'ارسال شده':'Sent',
    paid: fa?'پرداخت شده':'Paid', partial: fa?'پرداخت ناقص':'Partial',
    overdue: fa?'سررسید گذشته':'Overdue', cancelled: fa?'لغو شده':'Cancelled',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            {isPurchase ? (fa ? '📥 فاکتور خرید' : '📥 Purchase Invoices') : (fa ? '🧾 فاکتورها' : '🧾 Invoices')}
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{filtered.length} {fa ? 'فاکتور' : 'invoices'}</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90">
          ➕ {fa ? 'فاکتور جدید' : 'New Invoice'}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">🧾</div>
          <p className="font-medium">{fa ? 'فاکتوری ثبت نشده' : 'No invoices yet'}</p>
          <button onClick={() => setShowNew(true)} className="mt-4 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm">
            {fa ? '+ فاکتور جدید' : '+ New Invoice'}
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(var(--muted)/0.5)]">
              <tr>
                {[fa?'شماره':'No.', fa?'تاریخ':'Date', fa?'طرف حساب':'Party',
                  fa?'مبلغ کل':'Total', fa?'مالیات':'Tax', fa?'وضعیت':'Status', ''].map(h => (
                  <th key={h} className="text-start px-4 py-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.3)] cursor-pointer"
                  onClick={() => setSelected(inv)}>
                  <td className="px-4 py-3 font-mono text-xs font-bold">{inv.no}</td>
                  <td className="px-4 py-3">{inv.issuedAt}</td>
                  <td className="px-4 py-3 font-medium">{inv.type === 'sale' ? inv.buyerName : inv.sellerName}</td>
                  <td className="px-4 py-3 font-bold">{inv.grandTotal.toLocaleString('fa-IR')} {inv.currency}</td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                    {inv.vatAmount.toLocaleString('fa-IR')}
                    {inv.country === 'IR' && <span className="text-xs ms-1">(+عوارض)</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: statusColors[inv.status]+'20', color: statusColors[inv.status] }}>
                      {statusLabels[inv.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={e => { e.stopPropagation(); setShowPrint(inv); }}
                        className="text-xs px-2 py-1 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]">
                        🖨️
                      </button>
                      <button onClick={e => { e.stopPropagation(); exportInvoicePDF(generateInvoiceHTML(inv), inv.no); }}
                        className="text-xs px-2 py-1 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]">
                        📄
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showNew && <NewInvoiceModal lang={lang} isPurchase={isPurchase} onClose={() => setShowNew(false)}
        onSave={(inv) => { setInvoices([...invoices, inv]); setShowNew(false); }} />}
      {selected && <InvoiceDetailModal invoice={selected} lang={lang} onClose={() => setSelected(null)} onPrint={() => setShowPrint(selected)} />}
      {showPrint && <PrintInvoiceView invoice={showPrint} onClose={() => setShowPrint(null)} />}
    </div>
  );
}

// ── New Invoice Modal ─────────────────────────────────────────
function NewInvoiceModal({ lang, isPurchase, onClose, onSave }: {
  lang: string; isPurchase?: boolean; onClose: () => void; onSave: (inv: Invoice) => void;
}) {
  const fa = lang === 'fa';
  const [country, setCountry] = useState<'IR'|'AE'|'OTHER'>('IR');
  const [invoiceType, setInvoiceType] = useState<'type1'|'type2'|'type3'>('type1');
  const [currency, setCurrency] = useState<'IRR'|'AED'|'USD'>('IRR');
  const [items, setItems] = useState<Partial<InvoiceItem>[]>([
    { id: '1', description: '', qty: 1, unit: 'عدد', unitPrice: 0, discount: 0, vatRate: country === 'IR' ? IRAN_VAT_RATE : UAE_VAT_RATE }
  ]);
  const [form, setForm] = useState({
    sellerName: '', sellerNationalId: '', sellerEconomicCode: '', sellerVatNo: '', sellerTRN: '',
    sellerAddress: '', sellerPostalCode: '', sellerRegNo: '',
    buyerName: '', buyerNationalId: '', buyerEconomicCode: '', buyerVatNo: '', buyerTRN: '',
    buyerAddress: '',
    issuedAt: '', dueAt: '', internalRef: '', notes: '',
  });

  const vatRate = country === 'IR' ? IRAN_VAT_RATE : country === 'AE' ? UAE_VAT_RATE : 0;
  const tolRate = country === 'IR' ? IRAN_TOL_RATE : 0;

  const calcItem = (item: Partial<InvoiceItem>) => {
    const subtotal = (item.qty || 0) * (item.unitPrice || 0);
    const discAmt = (subtotal * (item.discount || 0)) / 100;
    const net = subtotal - discAmt;
    const vat = Math.round(net * vatRate / 100);
    const tol = Math.round(net * tolRate / 100);
    return { ...item, subtotal: net, vatAmount: vat, total: net + vat + tol };
  };

  const calcedItems = items.map(calcItem);
  const subtotal = calcedItems.reduce((s, i) => s + (i.subtotal || 0), 0);
  const vatTotal = calcedItems.reduce((s, i) => s + (i.vatAmount || 0), 0);
  const tolTotal = country === 'IR' ? Math.round(subtotal * tolRate / 100) : 0;
  const grandTotal = subtotal + vatTotal + tolTotal;

  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-3xl p-6 shadow-2xl my-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg">🧾 {fa ? 'فاکتور جدید' : 'New Invoice'}</h2>
          <button onClick={onClose} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
        </div>

        {/* Country & Type */}
        <div className="grid grid-cols-3 gap-3 mb-5 p-4 rounded-xl bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border))]">
          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1 block">🌍 {fa ? 'کشور / قوانین مالیاتی' : 'Country / Tax System'}</label>
            <select value={country} onChange={e => { setCountry(e.target.value as any); setCurrency(e.target.value === 'AE' ? 'AED' : 'IRR'); }} className={inp}>
              <option value="IR">🇮🇷 ایران — سامانه مودیان</option>
              <option value="AE">🇦🇪 امارات — VAT 5%</option>
              <option value="OTHER">🌐 سایر کشورها</option>
            </select>
          </div>
          {country === 'IR' && (
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1 block">📋 {fa ? 'نوع صورتحساب' : 'Invoice Type'}</label>
              <select value={invoiceType} onChange={e => setInvoiceType(e.target.value as any)} className={inp}>
                <option value="type1">نوع اول — فروش کالا/خدمات</option>
                <option value="type2">نوع دوم — صادرات</option>
                <option value="type3">نوع سوم — معاف از مالیات</option>
              </select>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1 block">💱 {fa ? 'ارز' : 'Currency'}</label>
            <select value={currency} onChange={e => setCurrency(e.target.value as any)} className={inp}>
              <option value="IRR">ریال (IRR)</option>
              <option value="AED">درهم (AED)</option>
              <option value="USD">دلار (USD)</option>
            </select>
          </div>
          <div className="col-span-3 flex items-center gap-4 text-xs">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
              {country === 'IR' ? `مالیات ارزش افزوده: ${IRAN_VAT_RATE}% + عوارض: ${IRAN_TOL_RATE}%` :
               country === 'AE' ? `VAT: ${UAE_VAT_RATE}%` : 'بدون مالیات'}
            </span>
            {country === 'IR' && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">ملزم به ثبت در سامانه مودیان</span>}
            {country === 'AE' && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">Federal Tax Authority (FTA)</span>}
          </div>
        </div>

        {/* Dates & Ref */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">📅 {fa ? 'تاریخ صدور *' : 'Issue Date *'}</label>
            <input value={form.issuedAt} onChange={e => setForm({...form, issuedAt: e.target.value})} className={inp} placeholder={country === 'IR' ? '1403/06/15' : '2024-09-05'} />
          </div>
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">⏰ {fa ? 'سررسید پرداخت' : 'Due Date'}</label>
            <input value={form.dueAt} onChange={e => setForm({...form, dueAt: e.target.value})} className={inp} />
          </div>
          <div>
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">🔖 {fa ? 'مرجع داخلی' : 'Internal Ref'}</label>
            <input value={form.internalRef} onChange={e => setForm({...form, internalRef: e.target.value})} className={inp} />
          </div>
        </div>

        {/* Seller & Buyer */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Seller */}
          <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5">
            <div className="text-xs font-bold text-blue-600 mb-2">🏭 {fa ? 'فروشنده (مودی مالیاتی)' : 'Seller (Tax Payer)'}</div>
            <div className="space-y-2">
              <input value={form.sellerName} onChange={e => setForm({...form, sellerName: e.target.value})} className={inp} placeholder={fa ? 'نام شرکت / اشخاص *' : 'Company Name *'} />
              {country === 'IR' && <>
                <input value={form.sellerNationalId} onChange={e => setForm({...form, sellerNationalId: e.target.value})} className={inp} placeholder="شناسه ملی (۱۱ رقم)" />
                <input value={form.sellerEconomicCode} onChange={e => setForm({...form, sellerEconomicCode: e.target.value})} className={inp} placeholder="کد اقتصادی (۱۲ رقم)" />
                <input value={form.sellerRegNo} onChange={e => setForm({...form, sellerRegNo: e.target.value})} className={inp} placeholder="شماره ثبت شرکت" />
                <input value={form.sellerPostalCode} onChange={e => setForm({...form, sellerPostalCode: e.target.value})} className={inp} placeholder="کد پستی (۱۰ رقم)" />
              </>}
              {country === 'AE' && <>
                <input value={form.sellerTRN} onChange={e => setForm({...form, sellerTRN: e.target.value})} className={inp} placeholder="TRN (Tax Registration Number)" />
                <input value={form.sellerVatNo} onChange={e => setForm({...form, sellerVatNo: e.target.value})} className={inp} placeholder="VAT Number" />
              </>}
              <input value={form.sellerAddress} onChange={e => setForm({...form, sellerAddress: e.target.value})} className={inp} placeholder={fa ? 'آدرس کامل' : 'Full Address'} />
            </div>
          </div>

          {/* Buyer */}
          <div className="p-3 rounded-xl border border-green-500/30 bg-green-500/5">
            <div className="text-xs font-bold text-green-600 mb-2">🏢 {fa ? 'خریدار' : 'Buyer'}</div>
            <div className="space-y-2">
              <input value={form.buyerName} onChange={e => setForm({...form, buyerName: e.target.value})} className={inp} placeholder={fa ? 'نام شرکت / اشخاص *' : 'Company Name *'} />
              {country === 'IR' && <>
                <input value={form.buyerNationalId} onChange={e => setForm({...form, buyerNationalId: e.target.value})} className={inp} placeholder="شناسه ملی (۱۱ رقم)" />
                <input value={form.buyerEconomicCode} onChange={e => setForm({...form, buyerEconomicCode: e.target.value})} className={inp} placeholder="کد اقتصادی (۱۲ رقم)" />
              </>}
              {country === 'AE' && <>
                <input value={form.buyerTRN} onChange={e => setForm({...form, buyerTRN: e.target.value})} className={inp} placeholder="TRN (Tax Registration Number)" />
              </>}
              <input value={form.buyerAddress} onChange={e => setForm({...form, buyerAddress: e.target.value})} className={inp} placeholder={fa ? 'آدرس کامل' : 'Full Address'} />
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-4">
          <div className="text-sm font-semibold mb-2">📦 {fa ? 'اقلام فاکتور' : 'Invoice Items'}</div>
          <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-[hsl(var(--muted)/0.5)]">
                <tr>
                  {[fa?'شرح کالا/خدمت':'Description', fa?'تعداد':'Qty', fa?'واحد':'Unit',
                    fa?'قیمت واحد':'Unit Price', fa?'تخفیف%':'Disc%', fa?'مبلغ':'Subtotal',
                    country!=='OTHER'?(fa?`مالیات ${vatRate}%`:`Tax ${vatRate}%`):'', ''].map((h,i) => h ? (
                    <th key={i} className="text-start px-3 py-2 font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                  ) : null)}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const c = calcItem(item);
                  return (
                    <tr key={i} className="border-t border-[hsl(var(--border)/0.5)]">
                      <td className="px-2 py-1"><input value={item.description||''} onChange={e=>{const r=[...items];r[i].description=e.target.value;setItems(r);}} className={inp+" min-w-[120px]"} /></td>
                      <td className="px-2 py-1"><input type="number" value={item.qty||1} onChange={e=>{const r=[...items];r[i].qty=Number(e.target.value);setItems(r);}} className={inp+" w-16"} /></td>
                      <td className="px-2 py-1"><input value={item.unit||''} onChange={e=>{const r=[...items];r[i].unit=e.target.value;setItems(r);}} className={inp+" w-16"} /></td>
                      <td className="px-2 py-1"><input type="number" value={item.unitPrice||0} onChange={e=>{const r=[...items];r[i].unitPrice=Number(e.target.value);setItems(r);}} className={inp+" w-24"} /></td>
                      <td className="px-2 py-1"><input type="number" value={item.discount||0} onChange={e=>{const r=[...items];r[i].discount=Number(e.target.value);setItems(r);}} className={inp+" w-14"} /></td>
                      <td className="px-3 py-2 font-medium">{(c.subtotal||0).toLocaleString('fa-IR')}</td>
                      {country !== 'OTHER' && <td className="px-3 py-2 text-amber-600">{(c.vatAmount||0).toLocaleString('fa-IR')}</td>}
                      <td className="px-2 py-1"><button onClick={()=>setItems(items.filter((_,j)=>j!==i))} className="text-red-500 hover:opacity-70 px-1">✕</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button onClick={()=>setItems([...items, {id: String(Date.now()), description:'', qty:1, unit:'عدد', unitPrice:0, discount:0, vatRate}])}
            className="mt-2 text-sm text-[hsl(var(--primary))] hover:underline">➕ {fa?'افزودن ردیف':'Add Row'}</button>
        </div>

        {/* Totals */}
        <div className="rounded-xl border border-[hsl(var(--border))] p-4 bg-[hsl(var(--muted)/0.2)] mb-4">
          <div className="space-y-2 text-sm max-w-xs ms-auto">
            <div className="flex justify-between"><span className="text-[hsl(var(--muted-foreground))]">{fa?'جمع کل اقلام:':'Subtotal:'}</span><span className="font-medium">{subtotal.toLocaleString('fa-IR')} {currency}</span></div>
            {country !== 'OTHER' && <div className="flex justify-between text-amber-600"><span>{fa?`مالیات ارزش افزوده (${vatRate}%):`:`VAT (${vatRate}%):`}</span><span className="font-medium">{vatTotal.toLocaleString('fa-IR')}</span></div>}
            {country === 'IR' && invoiceType !== 'type3' && <div className="flex justify-between text-orange-600"><span>{fa?`عوارض (${tolRate}%):`:`Toll (${tolRate}%):`}</span><span className="font-medium">{tolTotal.toLocaleString('fa-IR')}</span></div>}
            <div className="flex justify-between font-bold text-base border-t border-[hsl(var(--border))] pt-2"><span>{fa?'مبلغ کل قابل پرداخت:':'Grand Total:'}</span><span className="text-[hsl(var(--primary))]">{grandTotal.toLocaleString('fa-IR')} {currency}</span></div>
          </div>
        </div>

        {/* Iran Specific Fields */}
        {country === 'IR' && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 mb-4">
            <div className="text-xs font-bold text-amber-600 mb-3">🇮🇷 اطلاعات سامانه‌های مالیاتی ایران</div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">شماره یکتا (سامانه مودیان)</label>
                <input className={inp} placeholder="UID از سامانه مودیان" />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">کد رهگیری مودیان</label>
                <input className={inp} placeholder="my.tax.gov.ir" />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">شماره سامانه جامع تجارت</label>
                <input className={inp} placeholder="ttis.mimt.gov.ir" />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">کد رهگیری ثامن</label>
                <input className={inp} placeholder="sabt.samanehsatbt.ir" />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">نرخ مالیات (پیش‌فرض ۹٪)</label>
                <input className={inp} defaultValue="9" type="number" />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">نرخ عوارض (پیش‌فرض ۱٪)</label>
                <input className={inp} defaultValue="1" type="number" />
              </div>
            </div>
          </div>
        )}

        {/* UAE Specific */}
        {country === 'AE' && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 mb-4">
            <div className="text-xs font-bold text-green-600 mb-3">🇦🇪 UAE VAT Information (Federal Tax Authority)</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">Seller TRN (Tax Registration No.)</label>
                <input className={inp} placeholder="100-XXXXXX-X-XXXX" />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">Buyer TRN (if registered)</label>
                <input className={inp} placeholder="Optional" />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">Supply Type</label>
                <select className={inp}>
                  <option>Standard Rated (5%)</option>
                  <option>Zero Rated (0%)</option>
                  <option>Exempt</option>
                  <option>Out of Scope</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">Tax Period</label>
                <input className={inp} placeholder="Q1 2024" />
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="mb-4">
          <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'توضیحات':'Notes'}</label>
          <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className={inp+" resize-none"} />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
          <button className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'💾 ذخیره پیش‌نویس':'💾 Save Draft'}</button>
          <button className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">🧾 {fa?'صدور فاکتور':'Issue Invoice'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Invoice Detail Modal ──────────────────────────────────────
function InvoiceDetailModal({ invoice: inv, lang, onClose, onPrint }: {
  invoice: Invoice; lang: string; onClose: () => void; onPrint: () => void;
}) {
  const fa = lang === 'fa';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">🧾 {inv.no}</h2>
          <div className="flex gap-2">
            <button onClick={onPrint} className="px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-sm">🖨️ {fa?'چاپ':'Print'}</button>
            <button onClick={() => exportInvoicePDF(generateInvoiceHTML(inv), inv.no)}
              className="px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-sm">
              📄 PDF
            </button>
            <button onClick={onClose} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-[hsl(var(--border)/0.5)]">
            <span className="text-[hsl(var(--muted-foreground))]">{fa?'فروشنده':'Seller'}</span>
            <span className="font-medium">{inv.sellerName}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[hsl(var(--border)/0.5)]">
            <span className="text-[hsl(var(--muted-foreground))]">{fa?'خریدار':'Buyer'}</span>
            <span className="font-medium">{inv.buyerName}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[hsl(var(--border)/0.5)]">
            <span className="text-[hsl(var(--muted-foreground))]">{fa?'مبلغ کل':'Grand Total'}</span>
            <span className="font-bold text-[hsl(var(--primary))]">{inv.grandTotal.toLocaleString('fa-IR')} {inv.currency}</span>
          </div>
          {inv.vatAmount > 0 && (
            <div className="flex justify-between py-2 border-b border-[hsl(var(--border)/0.5)]">
              <span className="text-[hsl(var(--muted-foreground))]">{fa?'مالیات ارزش افزوده':'VAT'}</span>
              <span className="text-amber-600">{inv.vatAmount.toLocaleString('fa-IR')}</span>
            </div>
          )}
          {inv.modiyanRef && (
            <div className="flex justify-between py-2 border-b border-[hsl(var(--border)/0.5)]">
              <span className="text-[hsl(var(--muted-foreground))]">کد رهگیری مودیان</span>
              <span className="font-mono text-xs">{inv.modiyanRef}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Print Invoice View ────────────────────────────────────────
function PrintInvoiceView({ invoice: inv, onClose }: { invoice: Invoice; onClose: () => void }) {
  const isIran = inv.country === 'IR';
  const isUAE = inv.country === 'AE';

  const printContent = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(generateInvoiceHTML(inv));
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold">🖨️ {isIran ? 'چاپ صورتحساب الکترونیکی' : isUAE ? 'Print VAT Invoice' : 'Print Invoice'}</h2>
          <button onClick={onClose} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
        </div>
        <div className="space-y-3 mb-5">
          <div className="rounded-xl border border-[hsl(var(--border))] p-3 text-sm">
            <div className="font-medium mb-1">{isIran ? '🇮🇷 صورتحساب الکترونیکی مالیاتی' : isUAE ? '🇦🇪 UAE VAT Invoice' : '🌐 Commercial Invoice'}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">
              {isIran ? 'مطابق قانون پایانه‌های فروشگاهی و سامانه مودیان' : isUAE ? 'Federal Tax Authority (FTA) Compliant' : 'Standard Commercial Invoice'}
            </div>
          </div>
          {isIran && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 space-y-1">
              <div>✅ مالیات ارزش افزوده (۹٪) + عوارض (۱٪)</div>
              <div>✅ شناسه ملی و کد اقتصادی</div>
              <div>✅ شماره یکتا (UID) سامانه مودیان</div>
              <div>✅ اطلاعات سامانه جامع تجارت</div>
            </div>
          )}
          {isUAE && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-3 text-xs text-green-700 space-y-1">
              <div>✅ VAT 5% (Standard Rate)</div>
              <div>✅ TRN (Tax Registration Number)</div>
              <div>✅ FTA Compliant Format</div>
              <div>✅ Supply Type Classification</div>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">انصراف</button>
          <button onClick={() => exportInvoicePDF(generateInvoiceHTML(inv), inv.no)}
            className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm font-medium">
            📄 PDF
          </button>
          <button onClick={printContent} className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
            🖨️ {isIran ? 'چاپ فاکتور رسمی' : 'Print Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Generate Print HTML ───────────────────────────────────────
function generateInvoiceHTML(inv: Invoice): string {
  const isIran = inv.country === 'IR';
  const isUAE = inv.country === 'AE';
  const vatLabel = isIran ? 'مالیات ارزش افزوده (۹٪)' : isUAE ? 'VAT (5%)' : 'Tax';
  const tolLabel = 'عوارض (۱٪)';

  const rows = inv.items.map(item => `
    <tr>
      <td style="text-align:right;padding:7px 8px;border:1px solid #e2e8f0;font-weight:600">${item.description}</td>
      <td style="text-align:center;padding:7px 8px;border:1px solid #e2e8f0">${item.qty}</td>
      <td style="text-align:center;padding:7px 8px;border:1px solid #e2e8f0">${item.unit}</td>
      <td style="text-align:left;padding:7px 8px;border:1px solid #e2e8f0;direction:ltr">${item.unitPrice.toLocaleString('fa-IR')}</td>
      <td style="text-align:center;padding:7px 8px;border:1px solid #e2e8f0">${item.discount}%</td>
      <td style="text-align:left;padding:7px 8px;border:1px solid #e2e8f0;direction:ltr;font-weight:600">${item.subtotal.toLocaleString('fa-IR')}</td>
      <td style="text-align:left;padding:7px 8px;border:1px solid #e2e8f0;color:#854d0e;direction:ltr">${item.vatAmount.toLocaleString('fa-IR')}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html dir="${isIran ? 'rtl' : 'ltr'}" lang="${isIran ? 'fa' : 'en'}">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700;900&display=swap" rel="stylesheet">
<title>${isIran ? 'صورتحساب الکترونیکی' : isUAE ? 'VAT Invoice' : 'Invoice'} - ${inv.no}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Vazirmatn',Arial,sans-serif;background:#fff;color:#1e293b;font-size:12px;direction:${isIran?'rtl':'ltr'}}
  .page{max-width:800px;margin:0 auto;padding:24px}
  .header{border:2.5px solid #1e293b;border-radius:8px;padding:16px;margin-bottom:16px}
  .title{font-size:20px;font-weight:900}
  .parties{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
  .party{border:1px solid #cbd5e1;border-radius:8px;padding:12px;background:#f8fafc}
  .party.seller{border-right:4px solid #3b82f6}
  .party.buyer{border-right:4px solid #10b981}
  .party-label{font-size:10px;font-weight:700;color:#64748b;margin-bottom:6px;text-transform:uppercase}
  .party-name{font-size:14px;font-weight:900;margin-bottom:4px}
  .row{display:flex;justify-content:space-between;margin-top:3px;font-size:11px}
  .key{color:#64748b}.val{font-weight:600;direction:ltr;text-align:left}
  table{width:100%;border-collapse:collapse;margin-bottom:14px;font-size:11px}
  thead tr{background:#1e293b;color:#fff}
  th{padding:8px 6px;text-align:center;border:1px solid #334155}
  .sum-row td{background:#f8fafc;font-weight:700}
  .vat-row td{background:#fefce8;color:#854d0e;font-weight:700}
  .tol-row td{background:#fff7ed;color:#9a3412;font-weight:700}
  .total-row td{background:#dbeafe;font-size:13px;font-weight:900;color:#1e40af;border:2px solid #93c5fd}
  .notice{background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:10px;font-size:10px;color:#1d4ed8;margin-bottom:12px;line-height:1.7}
  .stamp{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px}
  .stamp-box{text-align:center}
  .stamp-line{height:48px;border-bottom:1px solid #94a3b8;margin-bottom:6px}
  @media print{body{font-size:11px}.page{padding:15px}@page{margin:10mm}}
</style>
</head>
<body><div class="page">

  <div class="header">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <div>
        <div class="title">${isIran ? 'صورتحساب الکترونیکی مالیاتی' : isUAE ? 'Tax Invoice | فاتورة ضريبية' : 'Commercial Invoice'}</div>
        ${isIran ? `<div style="font-size:11px;background:#f1f5f9;padding:3px 10px;border-radius:20px;color:#64748b;display:inline-block;margin-top:4px">نوع اول — فروش کالا و خدمات</div>` : ''}
      </div>
      <div style="text-align:${isIran?'left':'right'}">
        <div style="font-size:10px;color:#94a3b8">${isIran?'شماره سریال':'Invoice No.'}</div>
        <div style="font-size:14px;font-weight:900">${inv.no}</div>
        ${inv.taxSerial ? `<div style="font-size:10px;color:#94a3b8">UID: ${inv.taxSerial}</div>` : ''}
      </div>
    </div>
    <div style="display:flex;gap:16px;font-size:11px;color:#475569;flex-wrap:wrap">
      <span>📅 ${isIran?'تاریخ صدور':'Issue Date'}: <strong>${inv.issuedAt}</strong></span>
      ${inv.dueAt ? `<span>⏰ ${isIran?'سررسید':'Due Date'}: <strong>${inv.dueAt}</strong></span>` : ''}
      ${inv.internalRef ? `<span>🔖 ${isIran?'مرجع':'Ref'}: <strong>${inv.internalRef}</strong></span>` : ''}
    </div>
  </div>

  <div class="parties">
    <div class="party seller">
      <div class="party-label">🏭 ${isIran?'فروشنده (مودی مالیاتی)':'Seller'}</div>
      <div class="party-name">${inv.sellerName}</div>
      ${isIran && inv.sellerNationalId ? `<div class="row"><span class="key">شناسه ملی:</span><span class="val">${inv.sellerNationalId}</span></div>` : ''}
      ${isIran && inv.sellerEconomicCode ? `<div class="row"><span class="key">کد اقتصادی:</span><span class="val">${inv.sellerEconomicCode}</span></div>` : ''}
      ${isUAE && inv.sellerTRN ? `<div class="row"><span class="key">TRN:</span><span class="val">${inv.sellerTRN}</span></div>` : ''}
      ${inv.sellerAddress ? `<div class="row"><span class="key">${isIran?'آدرس':'Address'}:</span><span class="val" style="font-size:10px">${inv.sellerAddress}</span></div>` : ''}
    </div>
    <div class="party buyer">
      <div class="party-label">🏢 ${isIran?'خریدار':'Buyer'}</div>
      <div class="party-name">${inv.buyerName}</div>
      ${isIran && inv.buyerNationalId ? `<div class="row"><span class="key">شناسه ملی:</span><span class="val">${inv.buyerNationalId}</span></div>` : ''}
      ${isIran && inv.buyerEconomicCode ? `<div class="row"><span class="key">کد اقتصادی:</span><span class="val">${inv.buyerEconomicCode}</span></div>` : ''}
      ${isUAE && inv.buyerTRN ? `<div class="row"><span class="key">TRN:</span><span class="val">${inv.buyerTRN}</span></div>` : ''}
      ${inv.buyerAddress ? `<div class="row"><span class="key">${isIran?'آدرس':'Address'}:</span><span class="val" style="font-size:10px">${inv.buyerAddress}</span></div>` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="text-align:right">${isIran?'شرح کالا / خدمت':'Description'}</th>
        <th>${isIran?'تعداد':'Qty'}</th>
        <th>${isIran?'واحد':'Unit'}</th>
        <th>${isIran?'قیمت واحد':'Unit Price'}</th>
        <th>${isIran?'تخفیف':'Discount'}</th>
        <th>${isIran?'مبلغ':'Subtotal'}</th>
        <th>${isIran?'مالیات':'Tax'}</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr class="sum-row"><td colspan="5" style="text-align:right;padding:7px 8px">${isIran?'جمع کل اقلام:':'Subtotal:'}</td><td colspan="2" style="text-align:left;padding:7px 8px;direction:ltr">${inv.subtotal.toLocaleString('fa-IR')} ${inv.currency}</td></tr>
      <tr class="vat-row"><td colspan="5" style="text-align:right;padding:7px 8px">${vatLabel}:</td><td colspan="2" style="text-align:left;padding:7px 8px;direction:ltr">${inv.vatAmount.toLocaleString('fa-IR')} ${inv.currency}</td></tr>
      ${isIran ? `<tr class="tol-row"><td colspan="5" style="text-align:right;padding:7px 8px">${tolLabel}:</td><td colspan="2" style="text-align:left;padding:7px 8px;direction:ltr">${inv.tolAmount.toLocaleString('fa-IR')} ${inv.currency}</td></tr>` : ''}
      <tr class="total-row"><td colspan="5" style="text-align:right;padding:9px 8px;font-size:13px">${isIran?'مبلغ کل قابل پرداخت:':'Grand Total:'}</td><td colspan="2" style="text-align:left;padding:9px 8px;direction:ltr;font-size:14px">${inv.grandTotal.toLocaleString('fa-IR')} ${inv.currency}</td></tr>
    </tfoot>
  </table>

  ${isIran ? `<div class="notice">
    ⚠️ <strong>تذکر مهم:</strong> مودی مالیاتی مکلف است این صورتحساب را در سامانه مودیان (<strong>my.tax.gov.ir</strong>) ثبت و تأیید نماید.
    کد رهگیری: <strong>${inv.modiyanRef || '---'}</strong> | سامانه جامع تجارت: <strong>${inv.samanehRef || '---'}</strong> | سامانه ثامن: <strong>${inv.satpRef || '---'}</strong>
  </div>` : ''}

  ${isUAE ? `<div class="notice" style="background:#f0fdf4;border-color:#bbf7d0;color:#15803d">
    This is a Tax Invoice issued in compliance with UAE Federal Tax Authority (FTA) regulations.
    VAT Registration: <strong>${inv.sellerTRN || '---'}</strong> | Rate: 5% Standard
  </div>` : ''}

  <div class="stamp">
    <div class="stamp-box"><div class="stamp-line"></div><div style="font-size:10px;color:#64748b">${isIran?'مهر و امضای فروشنده':'Seller Signature & Stamp'}</div></div>
    <div class="stamp-box"><div class="stamp-line"></div><div style="font-size:10px;color:#64748b">${isIran?'مهر و امضای خریدار':'Buyer Signature & Stamp'}</div></div>
  </div>

</div></body></html>`;
}
