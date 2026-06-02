'use client';
import { useLocaleStore } from '@/store/locale.store';
import { useBalanceSheet } from '@/hooks/use-finance';

// Static fallback when no chart-of-accounts data exists yet
const FALLBACK = {
  assets: [
    { code: '1100', name: 'Cash & Bank',   nameFa: 'موجودی نقد و بانک',      balance: '170000000' },
    { code: '1300', name: 'Receivables',   nameFa: 'حساب‌های دریافتنی',      balance: '30000000'  },
    { code: '1400', name: 'Inventory',     nameFa: 'موجودی کالا',             balance: '45000000'  },
    { code: '1500', name: 'Fixed Assets',  nameFa: 'دارایی‌های ثابت',        balance: '200000000' },
  ],
  liabilities: [
    { code: '2100', name: 'Payables',      nameFa: 'حساب‌های پرداختنی',      balance: '45000000'  },
    { code: '2200', name: 'Bank Loans',    nameFa: 'وام بانکی',               balance: '100000000' },
    { code: '2300', name: 'Tax Payable',   nameFa: 'مالیات پرداختنی',        balance: '15000000'  },
  ],
  equity: [
    { code: '3100', name: 'Owner Equity',       nameFa: 'سرمایه صاحبان',     balance: '200000000' },
    { code: '3200', name: 'Retained Earnings',  nameFa: 'سود انباشته',        balance: '85000000'  },
  ],
  totalAssets: '445000000',
  totalLiabilities: '160000000',
  totalEquity: '285000000',
  isBalanced: true,
};

export function BalanceSheet() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const { data: raw, isLoading } = useBalanceSheet();

  const d = (raw && (raw as any).assets?.length > 0) ? raw as typeof FALLBACK : FALLBACK;
  const isMock = !raw || !(raw as any).assets?.length;

  const n = (v: string | number | bigint) => Number(v).toLocaleString(fa ? 'fa-IR' : 'en-US');

  const totalA = Number(d.totalAssets);
  const totalL = Number(d.totalLiabilities);
  const totalE = Number(d.totalEquity);
  const balanced = d.isBalanced ?? Math.abs(totalA - (totalL + totalE)) < 1;

  const Section = ({ title, items, total, color }: {
    title: string; items: typeof FALLBACK.assets; total: number; color: string;
  }) => (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: color + '40' }}>
      <div className="px-4 py-3 font-bold text-sm flex justify-between" style={{ background: color + '10', color }}>
        <span>{title}</span>
        <span>{n(total)}</span>
      </div>
      {items.map(item => (
        <div key={item.code} className="flex justify-between px-4 py-2.5 border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.3)] text-sm">
          <span className="text-[hsl(var(--muted-foreground))]">
            <span className="font-mono text-xs me-2">{item.code}</span>
            {fa ? item.nameFa : item.name}
          </span>
          <span className="font-medium">{n(item.balance)}</span>
        </div>
      ))}
      <div className="flex justify-between px-4 py-2.5 border-t-2 border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.2)] font-bold text-sm">
        <span>{fa ? 'جمع' : 'Total'}</span>
        <span style={{ color }}>{n(total)}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold">📊 {fa ? 'ترازنامه' : 'Balance Sheet'}</h1>
        <div className="flex gap-2 items-center">
          {isMock && !isLoading && (
            <span className="text-xs px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
              {fa ? 'داده نمونه — سرفصل‌ها را ثبت کنید' : 'Sample data — add chart of accounts'}
            </span>
          )}
          {isLoading && <span className="text-xs text-[hsl(var(--muted-foreground))]">⏳ {fa ? 'در حال بارگذاری...' : 'Loading...'}</span>}
          <button className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)]">
            🖨️ {fa ? 'چاپ' : 'Print'}
          </button>
        </div>
      </div>

      {balanced ? (
        <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-3 text-sm text-green-600">
          ✅ {fa ? 'ترازنامه متعادل است — دارایی‌ها = بدهی‌ها + حقوق صاحبان سهام' : 'Balanced — Assets = Liabilities + Equity'}
        </div>
      ) : (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-500">
          ❌ {fa ? 'ترازنامه متعادل نیست!' : 'Balance sheet is NOT balanced!'}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title={fa ? '🏛️ دارایی‌ها' : '🏛️ Assets'}
          items={d.assets} total={totalA} color="#3b82f6" />
        <div className="space-y-4">
          <Section title={fa ? '📤 بدهی‌ها' : '📤 Liabilities'}
            items={d.liabilities} total={totalL} color="#ef4444" />
          <Section title={fa ? '⚖️ حقوق صاحبان سهام' : '⚖️ Equity'}
            items={d.equity} total={totalE} color="#8b5cf6" />
        </div>
      </div>

      <div className="rounded-xl border-2 border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.05)] p-4 space-y-2">
        <div className="flex justify-between text-sm font-bold">
          <span>{fa ? '🏛️ جمع دارایی‌ها' : '🏛️ Total Assets'}</span>
          <span className="text-blue-600">{n(totalA)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold border-t border-[hsl(var(--border)/0.4)] pt-2">
          <span>{fa ? '📤+⚖️ جمع بدهی + حقوق' : '📤+⚖️ Total Liabilities + Equity'}</span>
          <span className="text-purple-600">{n(totalL + totalE)}</span>
        </div>
      </div>
    </div>
  );
}
