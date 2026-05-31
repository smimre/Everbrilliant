'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

export function Journal() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [entries, setEntries] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [rows, setRows] = useState([{ account: '', debit: '', credit: '', desc: '' }, { account: '', debit: '', credit: '', desc: '' }]);

  const totalDebit = rows.reduce((s, r) => s + (Number(r.debit) || 0), 0);
  const totalCredit = rows.reduce((s, r) => s + (Number(r.credit) || 0), 0);
  const balanced = totalDebit === totalCredit && totalDebit > 0;
  const inp = "w-full px-2 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary)/0.3)]";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">📒 {fa ? 'دفتر روزنامه' : 'Journal'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{entries.length} {fa ? 'سند' : 'entries'}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
          ➕ {fa ? 'سند جدید' : 'New Entry'}
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">📒</div>
          <p className="font-medium">{fa ? 'سندی ثبت نشده' : 'No journal entries'}</p>
          <button onClick={() => setShowNew(true)} className="mt-4 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm">
            {fa ? '+ سند جدید' : '+ New Entry'}
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(var(--muted)/0.5)]">
              <tr>
                {[fa?'شماره':'No.', fa?'تاریخ':'Date', fa?'شرح':'Description', fa?'مرجع':'Ref', fa?'بدهکار':'Debit', fa?'بستانکار':'Credit'].map(h => (
                  <th key={h} className="text-start px-4 py-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e: any, i) => (
                <tr key={i} className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.3)]">
                  <td className="px-4 py-3 font-mono text-xs">{e.number}</td>
                  <td className="px-4 py-3">{e.date}</td>
                  <td className="px-4 py-3">{e.description}</td>
                  <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">{e.ref}</td>
                  <td className="px-4 py-3 text-green-600">{e.debit?.toLocaleString('fa-IR')}</td>
                  <td className="px-4 py-3 text-red-500">{e.credit?.toLocaleString('fa-IR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-2xl p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">📒 {fa ? 'سند حسابداری جدید' : 'New Journal Entry'}</h2>
              <button onClick={() => setShowNew(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'تاریخ *':'Date *'}</label>
                <input className={inp} placeholder="1403/06/15" />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'شرح سند':'Description'}</label>
                <input className={inp} placeholder={fa?'توضیحات...':'Description...'} />
              </div>
            </div>

            {/* Rows */}
            <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden mb-3">
              <table className="w-full text-sm">
                <thead className="bg-[hsl(var(--muted)/0.5)]">
                  <tr>
                    {[fa?'حساب':'Account', fa?'شرح':'Description', fa?'بدهکار':'Debit', fa?'بستانکار':'Credit', ''].map((h, i) => (
                      <th key={i} className="text-start px-3 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-t border-[hsl(var(--border)/0.5)]">
                      <td className="px-2 py-1"><input value={row.account} onChange={e => { const r=[...rows]; r[i].account=e.target.value; setRows(r); }} className={inp} placeholder={fa?'کد حساب':'Account code'} /></td>
                      <td className="px-2 py-1"><input value={row.desc} onChange={e => { const r=[...rows]; r[i].desc=e.target.value; setRows(r); }} className={inp} /></td>
                      <td className="px-2 py-1"><input value={row.debit} type="number" onChange={e => { const r=[...rows]; r[i].debit=e.target.value; r[i].credit=''; setRows(r); }} className={inp} /></td>
                      <td className="px-2 py-1"><input value={row.credit} type="number" onChange={e => { const r=[...rows]; r[i].credit=e.target.value; r[i].debit=''; setRows(r); }} className={inp} /></td>
                      <td className="px-2 py-1"><button onClick={() => setRows(rows.filter((_,j)=>j!==i))} className="text-[hsl(var(--destructive))] hover:opacity-70 px-2">✕</button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[hsl(var(--muted)/0.3)]">
                  <tr>
                    <td colSpan={2} className="px-3 py-2 text-xs font-semibold">{fa?'جمع کل':'Total'}</td>
                    <td className="px-3 py-2 text-sm font-bold text-green-600">{totalDebit.toLocaleString('fa-IR')}</td>
                    <td className="px-3 py-2 text-sm font-bold text-red-500">{totalCredit.toLocaleString('fa-IR')}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            <button onClick={() => setRows([...rows, { account: '', debit: '', credit: '', desc: '' }])}
              className="text-sm text-[hsl(var(--primary))] hover:underline mb-4 block">
              ➕ {fa ? 'افزودن ردیف' : 'Add Row'}
            </button>

            {!balanced && totalDebit > 0 && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-500 mb-3">
                ⚠️ {fa ? 'سند ترازمند نیست! بدهکار و بستانکار باید مساوی باشند.' : 'Entry is not balanced! Debit must equal Credit.'}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button disabled={!balanced} className={`flex-1 px-4 py-2 rounded-lg text-white text-sm font-medium ${balanced ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted))] cursor-not-allowed'}`}>
                ✅ {fa ? 'ثبت سند' : 'Post Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
