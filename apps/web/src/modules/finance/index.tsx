'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { FinanceDashboard } from './components/finance-dashboard';
import { DualLedgerSystem } from './components/dual-ledger-system';
import { ChartOfAccounts } from './components/coa';
import { Journal } from './components/journal';
import { Ledger } from './components/ledger';
import { TrialBalance } from './components/trial-balance';
import { Invoices } from './components/invoices';
import { Treasury } from './components/treasury';
import { Checks } from './components/checks';
import { Cashflow } from './components/cashflow';
import { Staff } from './components/staff';
import { Payroll } from './components/payroll';
import { FinanceInventory } from './components/finance-inventory';
import { BalanceSheet } from './components/balance-sheet';
import { IncomeStatement } from './components/income-statement';
import { Budget } from './components/budget';
import { FinanceReports } from './components/finance-reports';

type FinanceView =
  | 'dashboard' | 'dual-books' | 'coa' | 'journal' | 'ledger' | 'trial-balance'
  | 'invoices' | 'purchase-invoices' | 'treasury' | 'checks' | 'cashflow'
  | 'staff' | 'payroll' | 'inventory' | 'balance-sheet' | 'income-stmt'
  | 'budget' | 'reports';

interface NavItem {
  id: FinanceView;
  label: string;
  labelFa: string;
  icon: string;
  section?: string;
}

const NAV: NavItem[] = [
  { id: 'dashboard',         label: 'Dashboard',          labelFa: 'داشبورد',            icon: '📊' },
  // حسابداری
  { id: 'dual-books',        label: 'Dual-Book System',   labelFa: 'سیستم دفتر دوگانه', icon: '📚', section: 'accounting' },
  { id: 'coa',               label: 'Chart of Accounts',  labelFa: 'سرفصل حساب‌ها',     icon: '📋', section: 'accounting' },
  { id: 'journal',           label: 'Journal',            labelFa: 'دفتر روزنامه',       icon: '📒', section: 'accounting' },
  { id: 'ledger',            label: 'Ledger',             labelFa: 'دفتر کل',            icon: '📔', section: 'accounting' },
  { id: 'trial-balance',     label: 'Trial Balance',      labelFa: 'تراز آزمایشی',       icon: '⚖️', section: 'accounting' },
  // فاکتور
  { id: 'invoices',          label: 'Invoices',           labelFa: 'فاکتور فروش',        icon: '🧾', section: 'billing' },
  { id: 'purchase-invoices', label: 'Purchase Invoices',  labelFa: 'فاکتور خرید',        icon: '📥', section: 'billing' },
  // نقد و بانک
  { id: 'treasury',          label: 'Treasury & Bank',    labelFa: 'خزانه و بانک',       icon: '🏦', section: 'cash' },
  { id: 'checks',            label: 'Checks',             labelFa: 'چک‌ها',              icon: '🗒️', section: 'cash' },
  { id: 'cashflow',          label: 'Cash Flow',          labelFa: 'جریان نقدی',         icon: '💸', section: 'cash' },
  // منابع انسانی
  { id: 'staff',             label: 'Staff',              labelFa: 'پرسنل',              icon: '👥', section: 'hr' },
  { id: 'payroll',           label: 'Payroll',            labelFa: 'حقوق و دستمزد',      icon: '💰', section: 'hr' },
  // انبار
  { id: 'inventory',         label: 'Inventory',          labelFa: 'انبار',              icon: '📦', section: 'inventory' },
  // گزارشات
  { id: 'balance-sheet',     label: 'Balance Sheet',      labelFa: 'ترازنامه',           icon: '📊', section: 'reports' },
  { id: 'income-stmt',       label: 'Income Statement',   labelFa: 'صورت سود و زیان',   icon: '📈', section: 'reports' },
  { id: 'budget',            label: 'Budget',             labelFa: 'بودجه‌بندی',         icon: '🎯', section: 'reports' },
  { id: 'reports',           label: 'Reports',            labelFa: 'گزارشات مالی',       icon: '📋', section: 'reports' },
];

const SECTIONS: Record<string, { label: string; labelFa: string }> = {
  accounting: { label: '📚 Accounting',     labelFa: '📚 حسابداری' },
  billing:    { label: '🧾 Billing',        labelFa: '🧾 فاکتورها' },
  cash:       { label: '💸 Cash & Bank',    labelFa: '💸 نقد و بانک' },
  hr:         { label: '👥 HR',             labelFa: '👥 منابع انسانی' },
  inventory:  { label: '📦 Inventory',      labelFa: '📦 انبارداری' },
  reports:    { label: '📊 Reports',        labelFa: '📊 گزارشات' },
};

export function FinanceModule() {
  const { lang } = useLocaleStore();
  const [view, setView] = useState<FinanceView>('dashboard');
  const fa = lang === 'fa';

  const renderContent = () => {
    switch (view) {
      case 'dashboard':         return <FinanceDashboard onNavigate={setView} />;
      case 'dual-books':        return <DualLedgerSystem />;
      case 'coa':               return <ChartOfAccounts />;
      case 'journal':           return <Journal />;
      case 'ledger':            return <Ledger />;
      case 'trial-balance':     return <TrialBalance />;
      case 'invoices':          return <Invoices />;
      case 'purchase-invoices': return <Invoices isPurchase />;
      case 'treasury':          return <Treasury />;
      case 'checks':            return <Checks />;
      case 'cashflow':          return <Cashflow />;
      case 'staff':             return <Staff />;
      case 'payroll':           return <Payroll />;
      case 'inventory':         return <FinanceInventory />;
      case 'balance-sheet':     return <BalanceSheet />;
      case 'income-stmt':       return <IncomeStatement />;
      case 'budget':            return <Budget />;
      case 'reports':           return <FinanceReports />;
      default:                  return <FinanceDashboard onNavigate={setView} />;
    }
  };

  const grouped: Record<string, NavItem[]> = { main: [] };
  NAV.forEach(item => {
    const sec = item.section || 'main';
    if (!grouped[sec]) grouped[sec] = [];
    grouped[sec].push(item);
  });

  return (
    <div className="flex gap-0 h-full -m-6">
      <aside className="w-52 shrink-0 bg-[hsl(var(--secondary))] border-e border-[hsl(var(--border))] overflow-y-auto">
        <div className="p-3 space-y-0.5">
          {grouped.main.map(item => (
            <NavBtn key={item.id} item={item} active={view === item.id} lang={lang} onClick={() => setView(item.id)} />
          ))}
          {Object.entries(SECTIONS).map(([secId, sec]) =>
            grouped[secId]?.length ? (
              <div key={secId}>
                <div className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] px-2 pt-3 pb-1 uppercase tracking-wider">
                  {fa ? sec.labelFa : sec.label}
                </div>
                {grouped[secId].map(item => (
                  <NavBtn key={item.id} item={item} active={view === item.id} lang={lang} onClick={() => setView(item.id)} />
                ))}
              </div>
            ) : null
          )}
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
    </div>
  );
}

function NavBtn({ item, active, lang, onClick }: {
  item: NavItem; active: boolean; lang: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-start ${
        active
          ? 'bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]'
          : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted)/0.5)] hover:text-[hsl(var(--foreground))]'
      }`}>
      <span>{item.icon}</span>
      <span className="truncate">{lang === 'fa' ? item.labelFa : item.label}</span>
    </button>
  );
}
