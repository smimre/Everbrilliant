'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useInvoices, useEmployees, useInventory } from '@/hooks/use-finance';
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
import { HRPage } from './components/hr';
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
  labelHi?: string;
  icon: string;
  section?: string;
}

const NAV: NavItem[] = [
  { id: 'dashboard',         label: 'Dashboard',          labelFa: 'داشبورد',            labelHi: 'डैशबोर्ड',             icon: '📊' },
  // حسابداری
  { id: 'dual-books',        label: 'Dual-Book System',   labelFa: 'سیستم دفتر دوگانه', labelHi: 'दोहरी बही प्रणाली',   icon: '📚', section: 'accounting' },
  { id: 'coa',               label: 'Chart of Accounts',  labelFa: 'سرفصل حساب‌ها',     labelHi: 'खाता चार्ट',           icon: '📋', section: 'accounting' },
  { id: 'journal',           label: 'Journal',            labelFa: 'دفتر روزنامه',       labelHi: 'जर्नल',                icon: '📒', section: 'accounting' },
  { id: 'ledger',            label: 'Ledger',             labelFa: 'دفتر کل',            labelHi: 'खाता बही',             icon: '📔', section: 'accounting' },
  { id: 'trial-balance',     label: 'Trial Balance',      labelFa: 'تراز آزمایشی',       labelHi: 'तलपट',                 icon: '⚖️', section: 'accounting' },
  // فاکتور
  { id: 'invoices',          label: 'Invoices',           labelFa: 'فاکتور فروش',        labelHi: 'बिक्री चालान',         icon: '🧾', section: 'billing' },
  { id: 'purchase-invoices', label: 'Purchase Invoices',  labelFa: 'فاکتور خرید',        labelHi: 'खरीद चालान',           icon: '📥', section: 'billing' },
  // نقد و بانک
  { id: 'treasury',          label: 'Treasury & Bank',    labelFa: 'خزانه و بانک',       labelHi: 'कोषागार और बैंक',      icon: '🏦', section: 'cash' },
  { id: 'checks',            label: 'Checks',             labelFa: 'چک‌ها',              labelHi: 'चेक',                  icon: '🗒️', section: 'cash' },
  { id: 'cashflow',          label: 'Cash Flow',          labelFa: 'جریان نقدی',         labelHi: 'नकद प्रवाह',           icon: '💸', section: 'cash' },
  // منابع انسانی
  { id: 'staff',             label: 'Staff',              labelFa: 'پرسنل',              labelHi: 'कर्मचारी',             icon: '👥', section: 'hr' },
  { id: 'payroll',           label: 'Payroll',            labelFa: 'حقوق و دستمزد',      labelHi: 'वेतन',                 icon: '💰', section: 'hr' },
  // انبار
  { id: 'inventory',         label: 'Inventory',          labelFa: 'انبار',              labelHi: 'इन्वेंटरी',            icon: '📦', section: 'inventory' },
  // گزارشات
  { id: 'balance-sheet',     label: 'Balance Sheet',      labelFa: 'ترازنامه',           labelHi: 'तुलन पत्र',            icon: '📊', section: 'reports' },
  { id: 'income-stmt',       label: 'Income Statement',   labelFa: 'صورت سود و زیان',   labelHi: 'आय विवरण',             icon: '📈', section: 'reports' },
  { id: 'budget',            label: 'Budget',             labelFa: 'بودجه‌بندی',         labelHi: 'बजट',                  icon: '🎯', section: 'reports' },
  { id: 'reports',           label: 'Reports',            labelFa: 'گزارشات مالی',       labelHi: 'वित्तीय रिपोर्ट',     icon: '📋', section: 'reports' },
];

const SECTIONS: Record<string, { label: string; labelFa: string; labelHi?: string }> = {
  accounting: { label: '📚 Accounting',     labelFa: '📚 حسابداری',       labelHi: '📚 लेखांकन' },
  billing:    { label: '🧾 Billing',        labelFa: '🧾 فاکتورها',        labelHi: '🧾 बिलिंग' },
  cash:       { label: '💸 Cash & Bank',    labelFa: '💸 نقد و بانک',      labelHi: '💸 नकद और बैंक' },
  hr:         { label: '👥 HR',             labelFa: '👥 منابع انسانی',    labelHi: '👥 एचआर' },
  inventory:  { label: '📦 Inventory',      labelFa: '📦 انبارداری',        labelHi: '📦 इन्वेंटरी' },
  reports:    { label: '📊 Reports',        labelFa: '📊 گزارشات',          labelHi: '📊 रिपोर्ट' },
};

export function FinanceModule({ initialView }: { initialView?: FinanceView } = {}) {
  const { lang } = useLocaleStore();
  const [view, setView] = useState<FinanceView>(initialView || 'dashboard');
  const fa = lang === 'fa';

  const { data: invoiceData } = useInvoices();
  const { data: employeeData } = useEmployees();
  const { data: inventoryData } = useInventory();

  const invoiceCount = ((invoiceData as any)?.data ?? []).length;
  const staffCount = ((employeeData as any)?.data ?? []).filter((e: any) => e.isActive !== false).length;
  const inventoryCount = ((inventoryData as any)?.data ?? []).length;

  const renderContent = () => {
    switch (view) {
      case 'dashboard':         return <FinanceDashboard onNavigate={setView} invoiceCount={invoiceCount} staffCount={staffCount} inventoryCount={inventoryCount} />;
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
      case 'staff':             return <HRPage />;
      case 'payroll':           return <Payroll />;
      case 'inventory':         return <FinanceInventory />;
      case 'balance-sheet':     return <BalanceSheet />;
      case 'income-stmt':       return <IncomeStatement />;
      case 'budget':            return <Budget />;
      case 'reports':           return <FinanceReports onNavigate={(v) => setView(v as FinanceView)} />;
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
                  {lang === 'fa' ? sec.labelFa : lang === 'hi' ? (sec.labelHi || sec.label) : sec.label}
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
      <span className="truncate">{lang === 'fa' ? item.labelFa : lang === 'hi' ? (item.labelHi || item.label) : item.label}</span>
    </button>
  );
}
