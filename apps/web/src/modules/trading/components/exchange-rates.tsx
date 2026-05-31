'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

const CURRENCIES = [
  { code: 'USD', name: 'دلار آمریکا', flag: '🇺🇸', symbol: '$', rateToIRR: 605000 },
  { code: 'EUR', name: 'یورو', flag: '🇪🇺', symbol: '€', rateToIRR: 660000 },
  { code: 'AED', name: 'درهم امارات', flag: '🇦🇪', symbol: 'د.إ', rateToIRR: 164700 },
  { code: 'GBP', name: 'پوند انگلیس', flag: '🇬🇧', symbol: '£', rateToIRR: 765000 },
  { code: 'CNY', name: 'یوان چین', flag: '🇨🇳', symbol: '¥', rateToIRR: 83400 },
  { code: 'TRY', name: 'لیر ترکیه', flag: '🇹🇷', symbol: '₺', rateToIRR: 17800 },
  { code: 'IRR', name: 'ریال ایران', flag: '🇮🇷', symbol: 'ریال', rateToIRR: 1 },
];

const CURRENCY_NAMES_EN: Record<string, string> = {
  USD: 'US Dollar', EUR: 'Euro', AED: 'UAE Dirham',
  GBP: 'British Pound', CNY: 'Chinese Yuan', TRY: 'Turkish Lira', IRR: 'Iranian Rial',
};

const KPI_CURRENCIES = ['USD', 'EUR', 'AED', 'CNY'];
const MOCK_CHANGES: Record<string, number> = {
  USD: 0.8, EUR: -0.3, AED: 0.5, CNY: 1.2, GBP: -0.7, TRY: 2.1,
};

const HISTORY_DATA = [
  { day: 'Mon', rate: 598000 }, { day: 'Tue', rate: 601000 }, { day: 'Wed', rate: 599500 },
  { day: 'Thu', rate: 603000 }, { day: 'Fri', rate: 602000 }, { day: 'Sat', rate: 604000 }, { day: 'Sun', rate: 605000 },
];

function fmtRate(n: number) {
  if (n >= 1000) return n.toLocaleString();
  if (n < 1) return n.toFixed(6);
  return n.toFixed(2);
}

function fmtAmount(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return n.toFixed(2);
}

export function ExchangeRatesPage() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';

  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [baseAmount, setBaseAmount] = useState('1');

  const [manualRates, setManualRates] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    CURRENCIES.filter(c => c.code !== 'IRR').forEach(c => {
      init[c.code] = String(c.rateToIRR);
    });
    return init;
  });
  const [updatedBadge, setUpdatedBadge] = useState<Record<string, boolean>>({});

  const baseC = CURRENCIES.find(c => c.code === baseCurrency)!;
  const parsedAmount = parseFloat(baseAmount) || 1;

  function convertTo(targetCode: string) {
    const targetC = CURRENCIES.find(c => c.code === targetCode)!;
    if (baseCurrency === 'IRR') return parsedAmount / targetC.rateToIRR;
    if (targetCode === 'IRR') return parsedAmount * baseC.rateToIRR;
    return (parsedAmount * baseC.rateToIRR) / targetC.rateToIRR;
  }

  function crossRate(fromCode: string, toCode: string) {
    if (fromCode === toCode) return null;
    const from = CURRENCIES.find(c => c.code === fromCode)!;
    const to = CURRENCIES.find(c => c.code === toCode)!;
    if (fromCode === 'IRR') return 1 / to.rateToIRR;
    if (toCode === 'IRR') return from.rateToIRR;
    return from.rateToIRR / to.rateToIRR;
  }

  function handleManualUpdate(code: string, val: string) {
    setManualRates(prev => ({ ...prev, [code]: val }));
    setUpdatedBadge(prev => ({ ...prev, [code]: false }));
  }

  function handleManualSave(code: string) {
    setUpdatedBadge(prev => ({ ...prev, [code]: true }));
    setTimeout(() => setUpdatedBadge(prev => ({ ...prev, [code]: false })), 3000);
  }

  const matrixCurrencies = CURRENCIES.filter(c => c.code !== 'IRR');
  const maxHistoryRate = Math.max(...HISTORY_DATA.map(d => d.rate));
  const minHistoryRate = Math.min(...HISTORY_DATA.map(d => d.rate));

  const inp = "px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">💱 {fa ? 'نرخ ارز' : 'Exchange Rates'}</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
          {fa ? 'مدیریت و پایش نرخ ارزهای خارجی' : 'Manage and monitor foreign currency rates'}
        </p>
      </div>

      {/* KPI Row: IRR vs USD, EUR, AED, CNY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {KPI_CURRENCIES.map(code => {
          const c = CURRENCIES.find(x => x.code === code)!;
          const change = MOCK_CHANGES[code] ?? 0;
          const isPos = change >= 0;
          return (
            <div key={code} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{c.flag}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{
                    background: isPos ? '#10b98120' : '#ef444420',
                    color: isPos ? '#10b981' : '#ef4444',
                  }}
                >
                  {isPos ? '+' : ''}{change}%
                </span>
              </div>
              <div className="text-lg font-bold text-[hsl(var(--foreground))]">
                {c.rateToIRR.toLocaleString()}
              </div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                {fa ? `ریال / ${code}` : `IRR / ${code}`}
              </div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">
                {fa ? c.name : CURRENCY_NAMES_EN[code]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Currency Converter */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h2 className="font-semibold text-sm mb-4">🔄 {fa ? 'تبدیل ارز' : 'Currency Converter'}</h2>
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="flex gap-2 items-center">
            <select
              value={baseCurrency}
              onChange={e => setBaseCurrency(e.target.value)}
              className={inp + ' min-w-[130px]'}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} — {fa ? c.name : CURRENCY_NAMES_EN[c.code]}
                </option>
              ))}
            </select>
          </div>
          <input
            type="number"
            value={baseAmount}
            onChange={e => setBaseAmount(e.target.value)}
            className={inp + ' w-36'}
            min="0"
            placeholder="1"
          />
          <div className="flex items-center text-sm text-[hsl(var(--muted-foreground))]">
            = {fa ? 'معادل در سایر ارزها' : 'equivalent in other currencies'}
          </div>
        </div>
        <div className="space-y-1.5">
          {CURRENCIES.filter(c => c.code !== baseCurrency).map(c => {
            const converted = convertTo(c.code);
            const unitRate = crossRate(baseCurrency, c.code);
            return (
              <div
                key={c.code}
                className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--muted)/0.2)] hover:bg-[hsl(var(--muted)/0.35)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{c.flag}</span>
                  <div>
                    <div className="text-sm font-semibold">{c.code}</div>
                    <div className="text-[10px] text-[hsl(var(--muted-foreground))]">
                      {fa ? c.name : CURRENCY_NAMES_EN[c.code]}
                    </div>
                  </div>
                </div>
                <div className="text-end">
                  <div className="text-sm font-bold">
                    {c.symbol} {fmtAmount(converted)}
                  </div>
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))]">
                    {fa ? `۱ ${baseCurrency} = ${unitRate !== null ? fmtRate(unitRate) : '—'} ${c.code}` : `1 ${baseCurrency} = ${unitRate !== null ? fmtRate(unitRate) : '—'} ${c.code}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cross-Rate Matrix */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">
        <div className="p-4 border-b border-[hsl(var(--border))]">
          <h2 className="font-semibold text-sm">📊 {fa ? 'جدول نرخ متقاطع' : 'Cross-Rate Matrix'}</h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            {fa ? 'نرخ تبدیل ارزها به یکدیگر (ردیف ÷ ستون)' : 'Currency cross rates (row ÷ column)'}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="p-2 text-center text-[hsl(var(--muted-foreground))] font-medium w-16">
                  {fa ? 'از ↓ به →' : '↓/→'}
                </th>
                {matrixCurrencies.map(c => (
                  <th key={c.code} className="p-2 text-center font-medium">
                    <div>{c.flag}</div>
                    <div>{c.code}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixCurrencies.map(rowC => (
                <tr key={rowC.code} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted)/0.2)]">
                  <td className="p-2 text-center font-semibold">
                    <div>{rowC.flag}</div>
                    <div>{rowC.code}</div>
                  </td>
                  {matrixCurrencies.map(colC => {
                    const rate = crossRate(rowC.code, colC.code);
                    const isDiag = rowC.code === colC.code;
                    return (
                      <td
                        key={colC.code}
                        className="p-2 text-center"
                        style={{
                          background: isDiag ? 'hsl(var(--muted)/0.4)' : undefined,
                          color: isDiag ? 'hsl(var(--muted-foreground))' : undefined,
                        }}
                      >
                        {isDiag ? '—' : fmtRate(rate ?? 0)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Rate Update */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h2 className="font-semibold text-sm mb-4">✏️ {fa ? 'به‌روزرسانی دستی نرخ' : 'Manual Rate Update'}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CURRENCIES.filter(c => c.code !== 'IRR').map(c => (
            <div
              key={c.code}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{c.flag}</span>
                  <span className="font-semibold text-sm">{c.code}</span>
                </div>
                {updatedBadge[c.code] && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-semibold">
                    {fa ? 'به‌روز شد' : 'Updated'}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))] mb-2">
                {fa ? `۱ دلار = X ${c.code}` : `1 USD = X ${c.code}`}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={manualRates[c.code] ?? ''}
                  onChange={e => handleManualUpdate(c.code, e.target.value)}
                  className={inp + ' flex-1 text-xs py-1.5'}
                  placeholder={String(c.rateToIRR)}
                />
                <button
                  onClick={() => handleManualSave(c.code)}
                  className="px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))] text-white text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  {fa ? 'ذخیره' : 'Save'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rate History Chart (IRR/USD, last 7 days) */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h2 className="font-semibold text-sm mb-1">📈 {fa ? 'تاریخچه نرخ دلار (۷ روز گذشته)' : 'USD/IRR Rate History (Last 7 Days)'}</h2>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
          {fa ? 'نمودار تغییرات نرخ ریال در برابر دلار' : 'IRR per 1 USD over last 7 days'}
        </p>
        <div className="relative">
          <svg viewBox="0 0 560 140" className="w-full" style={{ overflow: 'visible' }}>
            {/* Y-axis grid lines */}
            {[0, 25, 50, 75, 100].map(pct => {
              const y = 110 - (pct / 100) * 90;
              return (
                <g key={pct}>
                  <line x1="40" y1={y} x2="545" y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="3 3" />
                  <text x="35" y={y + 4} textAnchor="end" fontSize="8" fill="hsl(var(--muted-foreground))">
                    {((minHistoryRate + (pct / 100) * (maxHistoryRate - minHistoryRate)) / 1000).toFixed(0)}K
                  </text>
                </g>
              );
            })}
            {/* Bars */}
            {HISTORY_DATA.map((d, i) => {
              const barWidth = 54;
              const gap = 20;
              const x = 45 + i * (barWidth + gap);
              const heightPct = (d.rate - minHistoryRate) / (maxHistoryRate - minHistoryRate + 1);
              const barH = Math.max(8, heightPct * 90);
              const y = 110 - barH;
              const isLast = i === HISTORY_DATA.length - 1;
              return (
                <g key={d.day}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barH}
                    rx="4"
                    fill={isLast ? '#3b82f6' : '#3b82f630'}
                    stroke={isLast ? '#3b82f6' : '#3b82f660'}
                    strokeWidth="1"
                  />
                  <text x={x + barWidth / 2} y="125" textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">
                    {d.day}
                  </text>
                  <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fontSize="8" fill={isLast ? '#3b82f6' : 'hsl(var(--muted-foreground))'}>
                    {(d.rate / 1000).toFixed(0)}K
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <p className="text-[10px] text-center text-[hsl(var(--muted-foreground))] mt-2">
          {fa ? '⚠️ داده نمایشی — پس از اتصال API داده واقعی نمایش داده می‌شود' : '⚠️ Demo data — real data after API connection'}
        </p>
      </div>
    </div>
  );
}
