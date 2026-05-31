'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { TradingDashboard } from './components/trading-dashboard';
import { MyRequests } from './components/my-requests';
import { IncomingRequests } from './components/incoming-requests';
import { MyContracts } from './components/my-contracts';
import { TenderBrowse } from './components/tender-browse';
import { TenderManage } from './components/tender-manage';
import { TenderNew } from './components/tender-new';
import { Connections } from './components/connections';
import { CRMPage } from './components/crm';
import { ReportsPage } from './components/reports';
import { ManaqesehBrowse } from './components/manaqeseh-browse';
import { MyManaqeseh } from './components/my-manaqeseh';
import { QualityChecks } from './components/quality-checks';
import { Disputes } from './components/disputes';
import { InventoryPage } from './components/inventory';
import { LogisticsPage } from './components/logistics';
import { ExchangeRatesPage } from './components/exchange-rates';
import { ApprovalWorkflowsPage } from './components/approval-workflows';

type TradingView =
  | 'dashboard' | 'my-requests' | 'incoming-req' | 'my-quotes'
  | 'my-contracts' | 'tender-browse' | 'tender-manage' | 'tender-new'
  | 'connections' | 'crm' | 'reports' | 'sales-report'
  | 'manaqeseh' | 'my-manaqeseh' | 'quality-checks'
  | 'disputes' | 'inventory'
  | 'logistics' | 'exchange-rates' | 'approval-workflows';

interface NavItem {
  id: TradingView;
  label: string;
  labelFa: string;
  icon: string;
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  // اصلی
  { id: 'dashboard',     label: 'Dashboard',        labelFa: 'داشبورد',            icon: '📊' },
  // درخواست‌ها
  { id: 'my-requests',   label: 'My Requests',       labelFa: 'درخواست‌های من',     icon: '📋', section: 'requests' },
  { id: 'incoming-req',  label: 'Incoming',          labelFa: 'درخواست‌های ورودی',  icon: '📥', section: 'requests' },
  { id: 'my-quotes',     label: 'My Quotes',         labelFa: 'پیشنهادهای من',      icon: '💬', section: 'requests' },
  // قراردادها
  { id: 'my-contracts',  label: 'Contracts',         labelFa: 'قراردادها',           icon: '📄', section: 'contracts' },
  { id: 'inventory',     label: 'Inventory',         labelFa: 'موجودی کالا',         icon: '📦', section: 'contracts' },
  // مناقصات
  { id: 'tender-browse', label: 'Browse Tenders',    labelFa: 'مزایده‌های فعال',    icon: '🏷️', section: 'tenders' },
  { id: 'tender-manage', label: 'My Tenders',        labelFa: 'مزایده‌های من',      icon: '🏆', section: 'tenders' },
  { id: 'manaqeseh',     label: 'Manaqeseh',         labelFa: 'مناقصه‌ها',          icon: '📋', section: 'tenders' },
  { id: 'my-manaqeseh',  label: 'My Manaqeseh',      labelFa: 'مناقصه‌های من',      icon: '📝', section: 'tenders' },
  // ارتباطات
  { id: 'connections',   label: 'Connections',       labelFa: 'اتصالات',             icon: '🔗', section: 'network' },
  { id: 'crm',           label: 'CRM',               labelFa: 'مدیریت مشتریان',     icon: '🎯', section: 'network' },
  // گزارشات
  { id: 'reports',       label: 'Reports',           labelFa: 'گزارشات',             icon: '📊', section: 'reports' },
  { id: 'quality-checks',label: 'Quality Checks',    labelFa: 'کنترل کیفیت',        icon: '✅', section: 'reports' },
  { id: 'disputes',      label: 'Disputes',          labelFa: 'اختلافات',            icon: '⚖️', section: 'reports' },
  // عملیات
  { id: 'logistics',          label: 'Logistics',       labelFa: 'لجستیک و حمل',       icon: '🚛', section: 'operations' },
  { id: 'exchange-rates',     label: 'Exchange Rates',  labelFa: 'نرخ ارز',             icon: '💱', section: 'operations' },
  { id: 'approval-workflows', label: 'Approvals',       labelFa: 'گردش‌کار تأیید',     icon: '⚙️', section: 'operations' },
];

const SECTIONS: Record<string, { label: string; labelFa: string }> = {
  requests:  { label: 'Requests',     labelFa: '📋 درخواست‌ها' },
  contracts: { label: 'Contracts',    labelFa: '📄 قراردادها' },
  tenders:   { label: 'Tenders',      labelFa: '🏷️ مزایده و مناقصه' },
  network:   { label: 'Network',      labelFa: '🔗 شبکه تجاری' },
  reports:    { label: 'Reports',     labelFa: '📊 گزارش و کیفیت' },
  operations: { label: 'Operations', labelFa: '⚙️ عملیات' },
};

export function TradingModule({ initialView }: { initialView?: string } = {}) {
  const { lang } = useLocaleStore();
  const [view, setView] = useState<TradingView>((initialView as TradingView) || 'dashboard');
  const isRTL = lang === 'fa' || lang === 'ar';

  const renderContent = () => {
    switch (view) {
      case 'dashboard':      return <TradingDashboard onNavigate={setView} />;
      case 'my-requests':    return <MyRequests />;
      case 'incoming-req':   return <IncomingRequests />;
      case 'my-quotes':      return <IncomingRequests showQuotes />;
      case 'my-contracts':   return <MyContracts />;
      case 'inventory':      return <InventoryPage />;
      case 'tender-browse':  return <TenderBrowse />;
      case 'tender-manage':  return <TenderManage />;
    case 'tender-new':      return <TenderNew />;
      case 'manaqeseh':      return <ManaqesehBrowse />;
      case 'my-manaqeseh':   return <MyManaqeseh />;
      case 'connections':    return <Connections />;
      case 'crm':            return <CRMPage />;
      case 'reports':        return <ReportsPage />;
      case 'sales-report':   return <ReportsPage showSales />;
      case 'quality-checks': return <QualityChecks />;
      case 'disputes':            return <Disputes />;
      case 'logistics':           return <LogisticsPage />;
      case 'exchange-rates':      return <ExchangeRatesPage />;
      case 'approval-workflows':  return <ApprovalWorkflowsPage />;
      default:               return <TradingDashboard onNavigate={setView} />;
    }
  };

  // Group nav items by section
  const grouped: Record<string, NavItem[]> = { main: [] };
  NAV_ITEMS.forEach(item => {
    const sec = item.section || 'main';
    if (!grouped[sec]) grouped[sec] = [];
    grouped[sec].push(item);
  });

  return (
    <div className="flex gap-0 h-full -m-6">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 bg-[hsl(var(--secondary))] border-e border-[hsl(var(--border))] overflow-y-auto">
        <div className="p-3 space-y-1">
          {/* Main */}
          {grouped.main.map(item => (
            <NavBtn key={item.id} item={item} active={view === item.id} lang={lang} onClick={() => setView(item.id)} />
          ))}
          {/* Sections */}
          {Object.entries(SECTIONS).map(([secId, sec]) => (
            grouped[secId]?.length ? (
              <div key={secId}>
                <div className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] px-2 pt-3 pb-1 uppercase tracking-wider">
                  {lang === 'fa' ? sec.labelFa : sec.label}
                </div>
                {grouped[secId].map(item => (
                  <NavBtn key={item.id} item={item} active={view === item.id} lang={lang} onClick={() => setView(item.id)} />
                ))}
              </div>
            ) : null
          ))}
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {renderContent()}
      </main>
    </div>
  );
}

function NavBtn({ item, active, lang, onClick }: {
  item: NavItem; active: boolean; lang: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-start ${
        active
          ? 'bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]'
          : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted)/0.5)] hover:text-[hsl(var(--foreground))]'
      }`}
    >
      <span>{item.icon}</span>
      <span className="truncate">{lang === 'fa' ? item.labelFa : item.label}</span>
    </button>
  );
}
