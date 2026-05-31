'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

const SAMPLE_ACCOUNTS = [
  { code: '1100', name: 'Cash', nameFa: 'موجودی نقد', type: 'asset', normal: 'debit', balance: 50000000 },
  { code: '1200', name: 'Bank', nameFa: 'حساب بانکی', type: 'asset', normal: 'debit', balance: 120000000 },
  { code: '1300', name: 'Receivables', nameFa: 'دریافتنی', type: 'asset', normal: 'debit', balance: 30000000 },
  { code: '2100', name: 'Payables', nameFa: 'پرداختنی', type: 'liability', normal: 'credit', balance: 45000000 },
  { code: '3100', name: 'Owner Equity', nameFa: 'سرمایه', type: 'equity', normal: 'credit', balance: 100000000 },
  { code: '4100', name: 'Sales Revenue', nameFa: 'درآمد فروش', type: 'revenue', normal: 'credit', balance: 80000000 },
  { code: '5100', name: 'COGS', nameFa: 'بهای تمام شده', type: 'expense', normal: 'debit', balance: 25000000 },
];

export function TrialBalance() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [showZero, setShowZero] = useState(false);

  const accounts = showZero ? SAMPLE_ACCOUNTS : SAMPLE_ACCOUNTS.filter(a => a.balance !== 0);
  const totalDr = accounts.filter(a => a.normal === 'debit' && a.balance > 0).reduce((s, a) => s + a.balance, 0)
    + accounts.filter(a => a.normal === 'credit' && a.balance < 0).reduce((s, a) => s + Math.abs(a.balance), 0);
  const totalCr = accounts.filter(a => a.normal === 'credit' && a.balance > 0).reduce((s, a) => s + a.balance, 0)
    + accounts.filter(a => a.normal === 'debit' && a.balance < 0).reduce((s, a) => s + Math.abs(a.balance), 0);
  const balanced = Math.abs(totalDr - totalCr) < 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">⚖️ {fa ? 'تراز آزمایشی' : 'Trial Balance'}</h1>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={showZero} onChange={e => setShowZero(e.target.checked)} className="w-4 h-4" />
            {fa ? 'نمایش صفر' : 'Show zero'}
          </label>
          <button className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)]">
            🖨️ {fa ? 'چاپ' : 'Print'}
          </button>
        </div>
      </div>

      {balanced ? (
        <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-3 text-sm text-green-600 flex items-center gap-2">
          ✅ <strong>{fa ? 'حساب‌ها تراز است' : 'Accounts are balanced'}</strong>
          <span className="text-xs opacity-70">{fa ? `مجموع بدهکار = مجموع بستانکار = ${totalDr.toLocaleString('fa-IR')} ریال` : `Total Debit = Total Credit = ${totalDr.toLocaleString()}`}</span>
        </div>
      ) : (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-500 flex items-center gap-2">
          ❌ <strong>{fa ? 'حساب‌ها تراز نیست!' : 'Accounts are NOT balanced!'}</strong>
          <span className="text-xs">{fa ? `اختلاف: ${Math.abs(totalDr - totalCr).toLocaleString('fa-IR')} ریال` : `Difference: ${Math.abs(totalDr - totalCr).toLocaleString()}`}</span>
        </div>
      )}

      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--muted)/0.5)]">
            <tr>
              {[fa?'کد':'Code', fa?'نام حساب':'Account Name', fa?'نوع':'Type',
                fa?'بدهکار':'Debit', fa?'بستانکار':'Credit'].map(h => (
                <th key={h} className="text-start px-4 py-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {accounts.map(a => {
              const isDebit = (a.normal === 'debit' && a.balance > 0) || (a.normal === 'credit' && a.balance < 0);
              return (
                <tr key={a.code} className="border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.3)]">
                  <td className="px-4 py-3 font-mono text-xs font-bold">{a.code}</td>
                  <td className="px-4 py-3 font-medium">{fa ? a.nameFa : a.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--muted)/0.5)]">{a.type}</span>
                  </td>
                  <td className="px-4 py-3 text-green-600 font-medium">
                    {isDebit ? Math.abs(a.balance).toLocaleString('fa-IR') : '—'}
                  </td>
                  <td className="px-4 py-3 text-red-500 font-medium">
                    {!isDebit ? Math.abs(a.balance).toLocaleString('fa-IR') : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-[hsl(var(--muted)/0.3)] font-bold border-t-2 border-[hsl(var(--border))]">
            <tr>
              <td colSpan={3} className="px-4 py-3">{fa ? 'جمع کل' : 'Total'}</td>
              <td className="px-4 py-3 text-green-600 text-base">{totalDr.toLocaleString('fa-IR')}</td>
              <td className="px-4 py-3 text-red-500 text-base">{totalCr.toLocaleString('fa-IR')}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
