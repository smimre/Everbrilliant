'use client';
import { useLocaleStore } from '@/store/locale.store';

const ASSETS = [
  { code: '1100', name: 'Cash & Bank', nameFa: 'موجودی نقد و بانک', balance: 170000000 },
  { code: '1300', name: 'Receivables', nameFa: 'حساب‌های دریافتنی', balance: 30000000 },
  { code: '1400', name: 'Inventory', nameFa: 'موجودی کالا', balance: 45000000 },
  { code: '1500', name: 'Fixed Assets', nameFa: 'دارایی‌های ثابت', balance: 200000000 },
];
const LIABILITIES = [
  { code: '2100', name: 'Payables', nameFa: 'حساب‌های پرداختنی', balance: 45000000 },
  { code: '2200', name: 'Bank Loans', nameFa: 'وام بانکی', balance: 100000000 },
  { code: '2300', name: 'Tax Payable', nameFa: 'مالیات پرداختنی', balance: 15000000 },
];
const EQUITY = [
  { code: '3100', name: 'Owner Equity', nameFa: 'سرمایه صاحبان', balance: 200000000 },
  { code: '3200', name: 'Retained Earnings', nameFa: 'سود انباشته', balance: 85000000 },
];

export function BalanceSheet() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const totalAssets = ASSETS.reduce((s, a) => s + a.balance, 0);
  const totalLiab = LIABILITIES.reduce((s, a) => s + a.balance, 0);
  const totalEquity = EQUITY.reduce((s, a) => s + a.balance, 0);
  const balanced = Math.abs(totalAssets - (totalLiab + totalEquity)) < 1;

  const Section = ({ title, items, total, color }: any) => (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: color + '40' }}>
      <div className="px-4 py-3 font-bold text-sm flex justify-between" style={{ background: color + '10', color }}>
        <span>{title}</span>
        <span>{total.toLocaleString('fa-IR')}</span>
      </div>
      {items.map((item: any) => (
        <div key={item.code} className="flex justify-between px-4 py-2.5 border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.3)] text-sm">
          <span className="text-[hsl(var(--muted-foreground))]"><span className="font-mono text-xs me-2">{item.code}</span>{fa ? item.nameFa : item.name}</span>
          <span className="font-medium">{item.balance.toLocaleString('fa-IR')}</span>
        </div>
      ))}
      <div className="flex justify-between px-4 py-2.5 border-t-2 border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.2)] font-bold text-sm">
        <span>{fa ? 'جمع' : 'Total'}</span>
        <span style={{ color }}>{total.toLocaleString('fa-IR')}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">📊 {fa ? 'ترازنامه' : 'Balance Sheet'}</h1>
        <button className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)]">
          🖨️ {fa ? 'چاپ' : 'Print'}
        </button>
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
        <Section title={fa ? '🏛️ دارایی‌ها' : '🏛️ Assets'} items={ASSETS} total={totalAssets} color="#3b82f6" />
        <div className="space-y-4">
          <Section title={fa ? '📤 بدهی‌ها' : '📤 Liabilities'} items={LIABILITIES} total={totalLiab} color="#ef4444" />
          <Section title={fa ? '⚖️ حقوق صاحبان سهام' : '⚖️ Equity'} items={EQUITY} total={totalEquity} color="#8b5cf6" />
        </div>
      </div>

      <div className="rounded-xl border-2 border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.05)] p-4">
        <div className="flex justify-between text-sm font-bold">
          <span>{fa ? '🏛️ جمع دارایی‌ها' : '🏛️ Total Assets'}</span>
          <span className="text-blue-600">{totalAssets.toLocaleString('fa-IR')}</span>
        </div>
        <div className="flex justify-between text-sm font-bold mt-2">
          <span>{fa ? '📤+⚖️ جمع بدهی + حقوق' : '📤+⚖️ Total Liabilities + Equity'}</span>
          <span className="text-purple-600">{(totalLiab + totalEquity).toLocaleString('fa-IR')}</span>
        </div>
      </div>
    </div>
  );
}
