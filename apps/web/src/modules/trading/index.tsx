'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useRequests, useConnections } from '@/hooks/use-trading';
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
import { PartnerProfilePage } from './components/partner-profile';
import { MyPayments } from './components/my-payments';
import { MyInvoices } from './components/my-invoices';
import { MyHavaleh } from './components/my-havaleh';
import { MyQuotes } from './components/my-quotes';
import { RequestTemplates } from './components/request-templates';
import { LetterheadPage } from './components/letterhead';
import { TenderBlacklist } from './components/blacklist';

type TradingView =
  | 'dashboard' | 'my-requests' | 'incoming-req' | 'my-quotes'
  | 'my-contracts' | 'tender-browse' | 'tender-manage' | 'tender-new' | 'my-tender-keys'
  | 'connections' | 'crm' | 'reports' | 'sales-report'
  | 'manaqeseh' | 'my-manaqeseh' | 'quality-checks'
  | 'disputes' | 'inventory'
  | 'logistics' | 'exchange-rates' | 'approval-workflows' | 'partner-profile'
  | 'my-payments' | 'my-invoices' | 'my-havaleh' | 'req-templates' | 'letterhead' | 'blacklist';

interface NavItem {
  id: TradingView;
  label: string;
  labelFa: string;
  labelAr?: string;
  labelHi?: string;
  icon: string;
  section?: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  // اصلی
  { id: 'dashboard',     label: 'Dashboard',        labelFa: 'داشبورد',            labelAr: 'لوحة القيادة',        labelHi: 'डैशबोर्ड',          icon: '📊' },
  // درخواست‌ها
  { id: 'my-requests',   label: 'My Requests',       labelFa: 'درخواست‌های من',     labelAr: 'طلباتي',              labelHi: 'मेरे अनुरोध',        icon: '📋', section: 'requests' },
  { id: 'incoming-req',  label: 'Incoming',          labelFa: 'درخواست‌های ورودی',  labelAr: 'الطلبات الواردة',     labelHi: 'आने वाले',           icon: '📥', section: 'requests' },
  { id: 'my-quotes',     label: 'My Quotes',         labelFa: 'پیشنهادهای من',      labelAr: 'عروضي',               labelHi: 'मेरे उद्धरण',        icon: '💬', section: 'requests' },
  { id: 'my-payments',   label: 'My Payments',       labelFa: 'پرداخت‌های من',      labelAr: 'مدفوعاتي',            labelHi: 'मेरे भुगतान',        icon: '💳', section: 'requests' },
  { id: 'my-invoices',   label: 'My Invoices',       labelFa: 'فاکتورهای من',       labelAr: 'فواتيري',             labelHi: 'मेरे चालान',          icon: '🧾', section: 'requests' },
  { id: 'req-templates', label: 'Order Templates',   labelFa: 'الگوهای سفارش',      labelAr: 'قوالب الطلبات',       labelHi: 'ऑर्डर टेम्पलेट',    icon: '🔁', section: 'requests' },
  // قراردادها
  { id: 'my-contracts',  label: 'Contracts',         labelFa: 'قراردادها',           labelAr: 'العقود',              labelHi: 'अनुबंध',             icon: '📄', section: 'contracts' },
  { id: 'inventory',     label: 'Inventory',         labelFa: 'موجودی کالا',         labelAr: 'المخزون',             labelHi: 'इन्वेंटरी',          icon: '📦', section: 'contracts' },
  // مناقصات
  { id: 'tender-browse', label: 'Browse Tenders',    labelFa: 'مزایده‌های فعال',    labelAr: 'تصفح المزايدات',      labelHi: 'निविदाएं ब्राउज़ करें', icon: '🏷️', section: 'tenders' },
  { id: 'tender-manage', label: 'My Tenders',        labelFa: 'مزایده‌های من',      labelAr: 'مزايداتي',            labelHi: 'मेरी निविदाएं',       icon: '🏆', section: 'tenders' },
  { id: 'my-tender-keys',label: 'My Tender Keys',    labelFa: 'کلیدهای مزایده‌ها',  labelAr: 'مفاتيح المزايدات',    labelHi: 'मेरी निविदा कुंजियां', icon: '🗝️', section: 'tenders' },
  { id: 'manaqeseh',     label: 'Manaqeseh',         labelFa: 'مناقصه‌ها',          labelAr: 'المناقصات',           labelHi: 'मनाकसेह',            icon: '📋', section: 'tenders' },
  { id: 'my-manaqeseh',  label: 'My Manaqeseh',      labelFa: 'مناقصه‌های من',      labelAr: 'مناقصاتي',            labelHi: 'मेरी मनाकसेह',       icon: '📝', section: 'tenders' },
  // ارتباطات
  { id: 'connections',   label: 'Connections',       labelFa: 'اتصالات',             labelAr: 'الاتصالات',           labelHi: 'कनेक्शन',            icon: '🔗', section: 'network' },
  { id: 'crm',           label: 'CRM',               labelFa: 'مدیریت مشتریان',     labelAr: 'إدارة العملاء',       labelHi: 'सीआरएम',             icon: '🎯', section: 'network' },
  // گزارشات
  { id: 'reports',       label: 'Reports',           labelFa: 'گزارشات',             labelAr: 'التقارير',            labelHi: 'रिपोर्ट',            icon: '📊', section: 'reports' },
  { id: 'quality-checks',label: 'Quality Checks',    labelFa: 'کنترل کیفیت',        labelAr: 'فحص الجودة',          labelHi: 'गुणवत्ता जांच',      icon: '✅', section: 'reports' },
  { id: 'disputes',      label: 'Disputes',          labelFa: 'اختلافات',            labelAr: 'النزاعات',            labelHi: 'विवाद',              icon: '⚖️', section: 'reports' },
  { id: 'blacklist',     label: 'Blacklist',         labelFa: 'لیست سیاه',           labelAr: 'القائمة السوداء',     labelHi: 'ब्लैकलिस्ट',         icon: '🚫', section: 'reports' },
  // عملیات
  { id: 'logistics',          label: 'Logistics',       labelFa: 'لجستیک و حمل',       labelAr: 'اللوجستية',          labelHi: 'लॉजिस्टिक्स',       icon: '🚛', section: 'operations' },
  { id: 'exchange-rates',     label: 'Exchange Rates',  labelFa: 'نرخ ارز',             labelAr: 'أسعار الصرف',        labelHi: 'विनिमय दर',          icon: '💱', section: 'operations' },
  { id: 'approval-workflows', label: 'Approvals',       labelFa: 'گردش‌کار تأیید',     labelAr: 'الموافقات',          labelHi: 'अनुमोदन',            icon: '⚙️', section: 'operations' },
  { id: 'partner-profile',    label: 'Partner Profile', labelFa: 'پروفایل شرکاء',       labelAr: 'ملف الشريك',         labelHi: 'साझेदार प्रोफाइल',  icon: '🤝', section: 'network' },
  { id: 'letterhead',         label: 'Letterhead',      labelFa: 'سربرگ دیجیتال',      labelAr: 'الرأسية الرقمية',    labelHi: 'लेटरहेड',            icon: '📄', section: 'operations' },
];

const SECTIONS: Record<string, { label: string; labelFa: string; labelAr?: string; labelHi?: string }> = {
  requests:  { label: 'Requests',     labelFa: '📋 درخواست‌ها',         labelAr: '📋 الطلبات',              labelHi: '📋 अनुरोध' },
  contracts: { label: 'Contracts',    labelFa: '📄 قراردادها',           labelAr: '📄 العقود',               labelHi: '📄 अनुबंध' },
  tenders:   { label: 'Tenders',      labelFa: '🏷️ مزایده و مناقصه',   labelAr: '🏷️ المزايدات والمناقصات', labelHi: '🏷️ निविदाएं' },
  network:   { label: 'Network',      labelFa: '🔗 شبکه تجاری',         labelAr: '🔗 شبكة الأعمال',         labelHi: '🔗 नेटवर्क' },
  reports:    { label: 'Reports',     labelFa: '📊 گزارش و کیفیت',      labelAr: '📊 التقارير',             labelHi: '📊 रिपोर्ट' },
  operations: { label: 'Operations', labelFa: '⚙️ عملیات',              labelAr: '⚙️ العمليات',             labelHi: '⚙️ संचालन' },
};

export function TradingModule({ initialView }: { initialView?: string } = {}) {
  const { lang } = useLocaleStore();
  const [view, setView] = useState<TradingView>((initialView as TradingView) || 'dashboard');
  const isRTL = lang === 'fa' || lang === 'ar';

  const { data: reqData } = useRequests();
  const { data: connData } = useConnections();
  const pendingCount = ((reqData as any)?.data ?? []).filter((r: any) => r.status === 'pending').length;
  const connCount = ((connData as any)?.data ?? []).length;

  const renderContent = () => {
    switch (view) {
      case 'dashboard':      return <TradingDashboard onNavigate={setView} />;
      case 'my-requests':    return <MyRequests />;
      case 'incoming-req':   return <IncomingRequests />;
      case 'my-quotes':      return <MyQuotes />;
      case 'my-contracts':   return <MyContracts />;
      case 'inventory':      return <InventoryPage />;
      case 'tender-browse':   return <TenderBrowse />;
      case 'tender-manage':   return <TenderManage />;
      case 'tender-new':      return <TenderNew />;
      case 'my-tender-keys':  return <TenderKeysHub lang={lang} onNavigate={setView} />;
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
      case 'partner-profile':     return <PartnerProfilePage />;
      case 'my-payments':         return <MyPayments />;
      case 'my-invoices':         return <MyInvoices />;
      case 'req-templates':       return <RequestTemplates />;
      case 'letterhead':          return <LetterheadPage />;
      case 'blacklist':           return <TenderBlacklist />;
      default:               return <TradingDashboard onNavigate={setView} />;
    }
  };

  const BADGES: Partial<Record<TradingView, number>> = {
    'my-requests': pendingCount || undefined,
    'connections': connCount || undefined,
  };

  const grouped: Record<string, NavItem[]> = { main: [] };
  NAV_ITEMS.forEach(item => {
    const sec = item.section || 'main';
    if (!grouped[sec]) grouped[sec] = [];
    grouped[sec].push({ ...item, badge: BADGES[item.id] });
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
                  {lang === 'fa' ? sec.labelFa : lang === 'ar' ? (sec.labelAr || sec.label) : lang === 'hi' ? (sec.labelHi || sec.label) : sec.label}
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
      <span className="truncate flex-1">{lang === 'fa' ? item.labelFa : lang === 'ar' ? (item.labelAr || item.label) : lang === 'hi' ? (item.labelHi || item.label) : item.label}</span>
      {item.badge ? (
        <span className="text-[10px] font-bold bg-[hsl(var(--primary))] text-white rounded-full px-1.5 py-0.5 leading-none">
          {item.badge}
        </span>
      ) : null}
    </button>
  );
}

function TenderKeysHub({ lang, onNavigate }: { lang: string; onNavigate: (v: TradingView) => void }) {
  const fa = lang === 'fa';
  const sections = [
    {
      icon: '🏆', title: fa ? 'کلیدهای مزایده (Auction)' : 'Auction Keys',
      desc: fa ? 'کلیدهای پاکت مزایده‌های شما. هر نفر رمز اختصاصی خود را تنظیم می‌کند.' : 'Your auction envelope keys. Each holder sets their own private password.',
      btn: fa ? 'رفتن به مزایده‌های من' : 'Go to My Auctions',
      view: 'tender-manage' as TradingView,
      color: '#f59e0b',
    },
    {
      icon: '📝', title: fa ? 'کلیدهای مناقصه (Tender)' : 'Tender Keys',
      desc: fa ? 'کلیدهای پاکت مناقصه‌های شما. برای باز کردن پیشنهادها نیاز به تایید همه کلیدداران است.' : 'Your tender proposal keys. All key holders must confirm before opening proposals.',
      btn: fa ? 'رفتن به مناقصه‌های من' : 'Go to My Tenders',
      view: 'my-manaqeseh' as TradingView,
      color: '#8b5cf6',
    },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold mb-1">🗝️ {fa ? 'کلیدهای مزایده و مناقصه' : 'Auction & Tender Keys'}</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {fa ? 'سیستم چند کلیده: پاکت تنها با تایید همزمان همه دارندگان کلید باز می‌شود.' : 'Multi-key system: the envelope opens only when all key holders confirm simultaneously.'}
        </p>
      </div>
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5">
        <h2 className="font-bold text-sm mb-3">🔐 {fa ? 'چگونه کار می‌کند؟' : 'How it works'}</h2>
        <div className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
          {(fa ? [
            '۱. ادمین تعداد کلیدداران (۲ تا ۱۰ نفر) و اشخاص را تعیین می‌کند',
            '۲. هر نفر رمز اختصاصی خود را (فقط یک بار) تنظیم می‌کند',
            '۳. برای باز کردن پاکت، همه کلیدداران باید رمز خود را همزمان وارد کنند',
            '۴. پس از تایید همه رمزها، پاکت باز و نتایج نمایش داده می‌شود',
          ] : [
            '1. Admin sets the number of key holders (2–10) and assigns them',
            '2. Each key holder sets their own private password (only once)',
            '3. To open the envelope, all key holders must enter their passwords',
            '4. Once all confirmed, the envelope opens and results are revealed',
          ]).map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-amber-500 font-bold shrink-0">🗝️</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5">
            <div className="text-3xl mb-3">{s.icon}</div>
            <h3 className="font-bold mb-2">{s.title}</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">{s.desc}</p>
            <button onClick={() => onNavigate(s.view)}
              className="w-full py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ background: s.color }}>
              {s.btn} →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
