'use client';
import { useState, useMemo } from 'react';
import { useLocaleStore } from '@/store/locale.store';

const CURRENCIES = [
  { code:'USD', name:'دلار آمریکا',    nameEn:'US Dollar',      flag:'🇺🇸', symbol:'$',    rateToIRR:605000 },
  { code:'EUR', name:'یورو',           nameEn:'Euro',           flag:'🇪🇺', symbol:'€',    rateToIRR:660000 },
  { code:'AED', name:'درهم امارات',    nameEn:'UAE Dirham',     flag:'🇦🇪', symbol:'د.إ', rateToIRR:164700 },
  { code:'GBP', name:'پوند انگلیس',   nameEn:'British Pound',  flag:'🇬🇧', symbol:'£',    rateToIRR:765000 },
  { code:'CNY', name:'یوان چین',       nameEn:'Chinese Yuan',   flag:'🇨🇳', symbol:'¥',    rateToIRR:83400  },
  { code:'TRY', name:'لیر ترکیه',     nameEn:'Turkish Lira',   flag:'🇹🇷', symbol:'₺',   rateToIRR:17800  },
  { code:'IRR', name:'ریال ایران',     nameEn:'Iranian Rial',   flag:'🇮🇷', symbol:'﷼',  rateToIRR:1      },
];

const MOCK_CHANGES: Record<string,number> = { USD:0.8, EUR:-0.3, AED:0.5, CNY:1.2, GBP:-0.7, TRY:2.1, IRR:0 };

function fmt(n: number, decimals = 0) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toLocaleString('en', { maximumFractionDigits: decimals });
}

const inp = 'w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none';

export function ExchangeRatesPage() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';

  const [baseCur, setBaseCur]   = useState('USD');
  const [amount, setAmount]     = useState(1);
  const [rates, setRates]       = useState(() =>
    Object.fromEntries(CURRENCIES.map(c => [c.code, c.rateToIRR]))
  );
  const [lastUpdated, setLastUpdated] = useState('۱۴۰۳/۰۴/۱۵ — ۱۰:۳۰');
  const [converting, setConverting]   = useState({ from:'USD', to:'EUR', amount:'1', result:'' });

  const baseRate = rates[baseCur] ?? 1;

  const converted = useMemo(() =>
    CURRENCIES.filter(c => c.code !== baseCur).map(c => {
      const rate = baseRate / (rates[c.code] ?? 1);
      const val  = amount * rate;
      return { ...c, rate, val };
    }),
    [baseCur, amount, rates, baseRate]
  );

  function updateRate(code: string, ratePerUsd: number) {
    if (ratePerUsd <= 0) return;
    setRates(prev => ({ ...prev, [code]: 1 / (ratePerUsd / (rates['USD'] ?? 605000)) * (rates['USD'] ?? 605000) }));
    setLastUpdated('۱۴۰۳/۰۴/۱۵ — دستی');
  }

  function calcConvert() {
    const fromRate = rates[converting.from] ?? 1;
    const toRate   = rates[converting.to]   ?? 1;
    const val      = parseFloat(converting.amount) || 0;
    const res      = val * (fromRate / toRate);
    setConverting(p => ({ ...p, result: res.toLocaleString('en', { maximumFractionDigits: 4 }) }));
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">💱 {fa ? 'نرخ ارز' : 'Exchange Rates'}</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
          🕐 {lastUpdated} · {fa ? 'منبع: بانک مرکزی' : 'Source: Central Bank'}
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CURRENCIES.filter(c => ['USD','EUR','AED','GBP'].includes(c.code)).map(c => {
          const chg = MOCK_CHANGES[c.code] ?? 0;
          const accentColor = chg >= 0 ? '#10b981' : '#ef4444';
          return (
            <div key={c.code} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center relative overflow-hidden group hover:scale-[1.03] hover:shadow-md transition-all duration-200">
              <div className="absolute top-0 inset-x-0 h-1 rounded-t-xl" style={{ background: accentColor }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-200 pointer-events-none" style={{ background: accentColor }} />
              <div className="text-2xl mb-2">{c.flag}</div>
              <div className="font-bold text-base leading-none">{c.symbol} {(rates[c.code] ?? 1).toLocaleString('en')}</div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">{c.code} / IRR</div>
              <div className={`text-[10px] mt-1 font-semibold ${chg >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {chg >= 0 ? '▲' : '▼'} {Math.abs(chg)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Converter */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h2 className="font-semibold text-sm mb-3">🔄 {fa ? 'ماشین‌حساب تبدیل' : 'Currency Converter'}</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[100px]">
            <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'مبلغ' : 'Amount'}</label>
            <input type="number" value={converting.amount}
              onChange={e => setConverting(p => ({ ...p, amount: e.target.value, result: '' }))}
              className={inp}/>
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'از' : 'From'}</label>
            <select value={converting.from}
              onChange={e => setConverting(p => ({ ...p, from: e.target.value, result: '' }))}
              className={inp}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'به' : 'To'}</label>
            <select value={converting.to}
              onChange={e => setConverting(p => ({ ...p, to: e.target.value, result: '' }))}
              className={inp}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
            </select>
          </div>
          <button onClick={calcConvert}
            className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium whitespace-nowrap">
            {fa ? 'تبدیل' : 'Convert'}
          </button>
        </div>
        {converting.result && (
          <div className="mt-3 p-3 rounded-lg bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--primary)/0.2)] text-center">
            <span className="font-mono text-lg font-bold text-[hsl(var(--primary))]">
              {converting.amount} {converting.from} = {converting.result} {converting.to}
            </span>
          </div>
        )}
      </div>

      {/* Rate table with base selector */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h2 className="font-semibold text-sm">📊 {fa ? 'جدول نرخ‌ها' : 'Rate Table'}</h2>
          <div className="flex items-center gap-2">
            <label className="text-xs text-[hsl(var(--muted-foreground))]">{fa ? 'مبنا:' : 'Base:'}</label>
            <select value={baseCur} onChange={e => setBaseCur(e.target.value)}
              className="text-sm border border-[hsl(var(--border))] bg-[hsl(var(--background))] rounded-lg px-2 py-1 outline-none">
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
            </select>
            <input type="number" value={amount} min={0} step="any"
              onChange={e => setAmount(parseFloat(e.target.value) || 1)}
              className="w-24 text-sm border border-[hsl(var(--border))] bg-[hsl(var(--background))] rounded-lg px-2 py-1 outline-none"/>
          </div>
        </div>
        <div className="space-y-2">
          {converted.map(c => (
            <div key={c.code} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--muted)/0.3)]">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.flag}</span>
                <div>
                  <div className="font-semibold text-sm">{fa ? c.name : c.nameEn}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">{c.code}</div>
                </div>
              </div>
              <div className="text-end">
                <div className="font-bold text-base">{c.symbol}{c.val.toLocaleString('en', { maximumFractionDigits: c.val >= 1 ? 2 : 6 })}</div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))]">1 {baseCur} = {c.rate.toLocaleString('en', { maximumFractionDigits: 4 })} {c.code}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-rate matrix */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h2 className="font-semibold text-sm mb-3">📋 {fa ? 'جدول تبدیل متقاطع' : 'Cross-Rate Matrix'}</h2>
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse w-full">
            <thead>
              <tr>
                <th className="p-2 border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] text-center">—</th>
                {CURRENCIES.map(c => (
                  <th key={c.code} className="p-2 border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] text-center whitespace-nowrap">
                    {c.flag} {c.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CURRENCIES.map(row => (
                <tr key={row.code}>
                  <td className="p-2 border border-[hsl(var(--border))] font-bold bg-[hsl(var(--muted)/0.3)] whitespace-nowrap">
                    {row.flag} {row.code}
                  </td>
                  {CURRENCIES.map(col => {
                    if (row.code === col.code) return <td key={col.code} className="p-2 border border-[hsl(var(--border))] text-center text-[hsl(var(--muted-foreground))]">—</td>;
                    const val = (rates[row.code] ?? 1) / (rates[col.code] ?? 1);
                    return (
                      <td key={col.code} className="p-2 border border-[hsl(var(--border))] text-center font-mono">
                        {val >= 1 ? val.toLocaleString('en', { maximumFractionDigits: 2 }) : val.toFixed(4)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual rate update */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h2 className="font-semibold text-sm mb-3">✏️ {fa ? 'بروزرسانی دستی نرخ‌ها' : 'Manual Rate Update'}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CURRENCIES.filter(c => c.code !== 'IRR').map(c => (
            <div key={c.code} className="p-3 rounded-lg bg-[hsl(var(--muted)/0.3)]">
              <div className="text-xs font-bold mb-2">{c.flag} {c.code} — {fa ? c.name : c.nameEn}</div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[hsl(var(--muted-foreground))] shrink-0">1 USD =</span>
                <input
                  type="number"
                  defaultValue={+(rates['USD'] ?? 605000) / (rates[c.code] ?? 1) > 1
                    ? ((rates['USD'] ?? 605000) / (rates[c.code] ?? 1)).toFixed(2)
                    : ((rates['USD'] ?? 605000) / (rates[c.code] ?? 1)).toFixed(4)}
                  onBlur={e => updateRate(c.code, parseFloat(e.target.value))}
                  className="flex-1 px-2 py-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs outline-none font-mono"/>
                <span className="text-[10px] text-[hsl(var(--muted-foreground))] shrink-0">{c.code}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-3">
          💡 {fa ? 'نرخ‌ها به صورت دستی قابل تنظیم هستند.' : 'Rates can be adjusted manually.'}
        </p>
      </div>
    </div>
  );
}
