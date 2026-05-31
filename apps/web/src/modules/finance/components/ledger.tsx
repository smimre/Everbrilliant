'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

const SAMPLE_ACCOUNTS = [
  { id: '1100', code: '1100', name: 'Cash', nameFa: 'موجودی نقد', type: 'asset' },
  { id: '1200', code: '1200', name: 'Bank', nameFa: 'حساب بانکی', type: 'asset' },
  { id: '1300', code: '1300', name: 'Accounts Receivable', nameFa: 'حساب‌های دریافتنی', type: 'asset' },
  { id: '2100', code: '2100', name: 'Accounts Payable', nameFa: 'حساب‌های پرداختنی', type: 'liability' },
  { id: '3100', code: '3100', name: 'Owner Equity', nameFa: 'سرمایه', type: 'equity' },
  { id: '4100', code: '4100', name: 'Sales Revenue', nameFa: 'درآمد فروش', type: 'revenue' },
  { id: '5100', code: '5100', name: 'Cost of Goods', nameFa: 'بهای تمام شده', type: 'expense' },
  { id: '6100', code: '6100', name: 'Salaries', nameFa: 'حقوق و دستمزد', type: 'expense' },
];

export function Ledger() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [selected, setSelected] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const acc = SAMPLE_ACCOUNTS.find(a => a.id === selected);
  const inp = "px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">📔 {fa ? 'دفتر کل' : 'General Ledger'}</h1>
        <button className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)]">
          🖨️ {fa ? 'چاپ' : 'Print'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={selected} onChange={e => setSelected(e.target.value)} className={inp + " flex-1 min-w-[200px]"}>
          <option value="">{fa ? '-- انتخاب حساب --' : '-- Select Account --'}</option>
          {SAMPLE_ACCOUNTS.map(a => (
            <option key={a.id} value={a.id}>{a.code} — {fa ? a.nameFa : a.name}</option>
          ))}
        </select>
        <input value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={inp} placeholder={fa ? 'از تاریخ' : 'From date'} />
        <input value={dateTo} onChange={e => setDateTo(e.target.value)} className={inp} placeholder={fa ? 'تا تاریخ' : 'To date'} />
      </div>

      {!selected ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">📔</div>
          <p className="font-medium">{fa ? 'یک حساب انتخاب کنید' : 'Select an account to view ledger'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Account Header */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--primary)/0.05)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{acc?.code} — {fa ? acc?.nameFa : acc?.name}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{fa ? 'نوع: ' : 'Type: '}{acc?.type}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'مانده' : 'Balance'}</div>
                <div className="text-xl font-bold text-[hsl(var(--primary))]">0</div>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[hsl(var(--muted)/0.5)]">
                <tr>
                  {[fa?'ردیف':'Row', fa?'تاریخ':'Date', fa?'شرح':'Description', fa?'مرجع':'Ref',
                    fa?'بدهکار':'Debit', fa?'بستانکار':'Credit', fa?'مانده':'Balance'].map(h => (
                    <th key={h} className="text-start px-4 py-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Opening balance row */}
                <tr className="border-t border-[hsl(var(--border)/0.5)] bg-[hsl(var(--muted)/0.2)]">
                  <td className="px-4 py-2 text-xs text-[hsl(var(--muted-foreground))]">—</td>
                  <td className="px-4 py-2 text-xs">—</td>
                  <td className="px-4 py-2 text-xs font-medium">{fa ? 'مانده ابتدای دوره' : 'Opening Balance'}</td>
                  <td className="px-4 py-2 text-xs">—</td>
                  <td className="px-4 py-2 text-xs">—</td>
                  <td className="px-4 py-2 text-xs">—</td>
                  <td className="px-4 py-2 font-bold">0</td>
                </tr>
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[hsl(var(--muted-foreground))] text-sm">
                    {fa ? 'سندی برای این حساب ثبت نشده' : 'No transactions for this account'}
                  </td>
                </tr>
                {/* Closing balance row */}
                <tr className="border-t-2 border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] font-bold">
                  <td colSpan={4} className="px-4 py-3">{fa ? 'جمع و مانده پایان دوره' : 'Totals & Closing Balance'}</td>
                  <td className="px-4 py-3 text-green-600">0</td>
                  <td className="px-4 py-3 text-red-500">0</td>
                  <td className="px-4 py-3 text-[hsl(var(--primary))]">0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
