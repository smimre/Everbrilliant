'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useTrialBalance } from '@/hooks/use-finance';

const SAMPLE_ACCOUNTS = [
  { code: '1100', name: 'Cash',          nameFa: 'موجودی نقد',     type: 'ASSET',     totalDebit: '50000000',  totalCredit: '0',        balance: '50000000'  },
  { code: '1200', name: 'Bank',          nameFa: 'حساب بانکی',     type: 'ASSET',     totalDebit: '120000000', totalCredit: '0',        balance: '120000000' },
  { code: '1300', name: 'Receivables',   nameFa: 'دریافتنی',       type: 'ASSET',     totalDebit: '30000000',  totalCredit: '0',        balance: '30000000'  },
  { code: '2100', name: 'Payables',      nameFa: 'پرداختنی',       type: 'LIABILITY', totalDebit: '0',         totalCredit: '45000000', balance: '45000000'  },
  { code: '3100', name: 'Owner Equity',  nameFa: 'سرمایه',         type: 'EQUITY',    totalDebit: '0',         totalCredit: '100000000',balance: '100000000' },
  { code: '4100', name: 'Sales Revenue', nameFa: 'درآمد فروش',     type: 'REVENUE',   totalDebit: '0',         totalCredit: '80000000', balance: '80000000'  },
  { code: '5100', name: 'COGS',          nameFa: 'بهای تمام شده',  type: 'EXPENSE',   totalDebit: '25000000',  totalCredit: '0',        balance: '25000000'  },
];

const TYPE_COLORS: Record<string, string> = {
  ASSET: '#3b82f6', LIABILITY: '#ef4444', EQUITY: '#8b5cf6',
  REVENUE: '#10b981', EXPENSE: '#f59e0b',
};
const TYPE_FA: Record<string, string> = {
  ASSET: 'دارایی', LIABILITY: 'بدهی', EQUITY: 'حقوق صاحبان', REVENUE: 'درآمد', EXPENSE: 'هزینه',
};

export function TrialBalance() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [showZero, setShowZero]   = useState(false);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch]         = useState('');

  const { data: raw, isLoading } = useTrialBalance();

  const apiAccounts: typeof SAMPLE_ACCOUNTS = ((raw as any)?.accounts ?? []).map((a: any) => ({
    code:        a.code,
    name:        a.name,
    nameFa:      a.nameFa ?? a.name,
    type:        a.type,
    totalDebit:  String(a.totalDebit  ?? '0'),
    totalCredit: String(a.totalCredit ?? '0'),
    balance:     String(a.balance     ?? '0'),
  }));

  const isMock    = apiAccounts.length === 0;
  const source    = isMock ? SAMPLE_ACCOUNTS : apiAccounts;

  const filtered = source.filter(a => {
    if (!showZero && Number(a.balance) === 0) return false;
    if (typeFilter !== 'ALL' && a.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.code.includes(q) || a.name.toLowerCase().includes(q) || (a.nameFa ?? '').includes(q);
    }
    return true;
  });

  const totalDr = filtered.reduce((s, a) => s + Number(a.totalDebit),  0);
  const totalCr = filtered.reduce((s, a) => s + Number(a.totalCredit), 0);

  const apiTotalDr  = Number((raw as any)?.totalDebit  ?? 0);
  const apiTotalCr  = Number((raw as any)?.totalCredit ?? 0);
  const isBalanced  = isMock
    ? Math.abs(totalDr - totalCr) < 1
    : ((raw as any)?.isBalanced ?? Math.abs(apiTotalDr - apiTotalCr) < 1);

  const n = (v: string | number) => Number(v).toLocaleString(fa ? 'fa-IR' : 'en-US');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold">⚖️ {fa ? 'تراز آزمایشی' : 'Trial Balance'}</h1>
        <div className="flex gap-2 items-center flex-wrap">
          {isMock && !isLoading && (
            <span className="text-xs px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
              {fa ? 'داده نمونه — سرفصل‌ها ثبت نشده' : 'Sample data — no chart of accounts yet'}
            </span>
          )}
          {!isMock && (
            <span className="text-xs px-2 py-1 rounded-lg bg-green-500/10 text-green-600 border border-green-500/20">
              {fa ? `${apiAccounts.length} حساب واقعی` : `${apiAccounts.length} live accounts`}
            </span>
          )}
          {isLoading && <span className="text-xs text-[hsl(var(--muted-foreground))]">⏳</span>}
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input type="checkbox" checked={showZero} onChange={e => setShowZero(e.target.checked)} className="w-4 h-4 accent-[hsl(var(--primary))]" />
            {fa ? 'نمایش صفر' : 'Show zero'}
          </label>
          <button className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)]">
            🖨️ {fa ? 'چاپ' : 'Print'}
          </button>
        </div>
      </div>

      {/* Balance status */}
      {isBalanced ? (
        <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-3 text-sm text-green-600 flex items-center gap-2 flex-wrap">
          ✅ <strong>{fa ? 'حساب‌ها تراز است' : 'Accounts are balanced'}</strong>
          <span className="text-xs opacity-70">
            {fa
              ? `جمع بدهکار = جمع بستانکار = ${n(isMock ? totalDr : apiTotalDr)} ریال`
              : `Total Debit = Total Credit = ${n(isMock ? totalDr : apiTotalDr)}`}
          </span>
        </div>
      ) : (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-500 flex items-center gap-2 flex-wrap">
          ❌ <strong>{fa ? 'حساب‌ها تراز نیست!' : 'Accounts are NOT balanced!'}</strong>
          <span className="text-xs">
            {fa
              ? `اختلاف: ${n(Math.abs(apiTotalDr - apiTotalCr))} ریال`
              : `Difference: ${n(Math.abs(apiTotalDr - apiTotalCr))}`}
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={fa ? '🔍 جستجو کد یا نام...' : '🔍 Search code or name...'}
          className="flex-1 min-w-48 px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-sm focus:outline-none" />
        <div className="flex gap-1 bg-[hsl(var(--secondary))] rounded-xl p-1 border border-[hsl(var(--border))] flex-wrap">
          {['ALL','ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                typeFilter === t
                  ? 'bg-[hsl(var(--primary))] text-white'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
              }`}
              style={typeFilter === t || t === 'ALL' ? {} : { color: TYPE_COLORS[t] }}>
              {t === 'ALL' ? (fa ? 'همه' : 'All') : (fa ? TYPE_FA[t] : t)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--muted)/0.5)]">
            <tr>
              {[
                { label: fa ? 'کد'        : 'Code',    cls: 'w-24'   },
                { label: fa ? 'نام حساب'  : 'Account', cls: ''       },
                { label: fa ? 'نوع'       : 'Type',    cls: 'w-28'   },
                { label: fa ? 'بدهکار'    : 'Debit',   cls: 'w-36 text-end' },
                { label: fa ? 'بستانکار'  : 'Credit',  cls: 'w-36 text-end' },
              ].map(h => (
                <th key={h.label} className={`text-start px-4 py-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] ${h.cls}`}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                  <div className="text-3xl mb-2">⚖️</div>
                  <p className="text-sm">{fa ? 'حسابی پیدا نشد' : 'No accounts found'}</p>
                </td>
              </tr>
            ) : (
              filtered.map(a => {
                const dr = Number(a.totalDebit);
                const cr = Number(a.totalCredit);
                const color = TYPE_COLORS[a.type] ?? '#64748b';
                return (
                  <tr key={a.code} className="border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.3)]">
                    <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color }}>{a.code}</td>
                    <td className="px-4 py-3 font-medium">{fa ? a.nameFa : a.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: color + '18', color }}>
                        {fa ? TYPE_FA[a.type] ?? a.type : a.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end font-mono text-xs">
                      {dr > 0 ? <span className="text-green-600 font-medium">{n(dr)}</span> : <span className="text-[hsl(var(--muted-foreground))]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-end font-mono text-xs">
                      {cr > 0 ? <span className="text-red-500 font-medium">{n(cr)}</span> : <span className="text-[hsl(var(--muted-foreground))]">—</span>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot className="bg-[hsl(var(--muted)/0.3)] font-bold border-t-2 border-[hsl(var(--border))]">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-sm">{fa ? 'جمع کل' : 'Total'}</td>
              <td className="px-4 py-3 text-end font-mono text-green-600">{n(totalDr)}</td>
              <td className="px-4 py-3 text-end font-mono text-red-500">{n(totalCr)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(['ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE'] as const).map(t => {
          const accounts = filtered.filter(a => a.type === t);
          const total = accounts.reduce((s, a) => s + Number(a.balance), 0);
          const color = TYPE_COLORS[t];
          return (
            <div key={t} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
              <div className="text-xs font-semibold mb-1" style={{ color }}>{fa ? TYPE_FA[t] : t}</div>
              <div className="text-sm font-bold" style={{ color }}>{n(total)}</div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">{accounts.length} {fa ? 'حساب' : 'accts'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
