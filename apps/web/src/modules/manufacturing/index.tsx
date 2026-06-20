'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { ManufacturingDashboard } from './components/manufacturing-dashboard';
import { BOM } from './components/bom';
import { WorkOrders } from './components/work-orders';
import { WIPTracking } from './components/wip';
import { ProductCosting } from './components/costing';
import { QualityControl } from './components/quality-control';
import { MaterialsPlanning } from './components/materials-planning';
import { ManufacturingReports } from './components/manufacturing-reports';

type MfgView = 'dashboard'|'work-orders'|'bom'|'materials'|'wip'|'costing'|'qc'|'reports';

const NAV = [
  { id:'dashboard',   label:'Dashboard',    labelFa:'داشبورد',          labelHi:'डैशबोर्ड',            icon:'📊' },
  { id:'work-orders', label:'Work Orders',  labelFa:'دستورات کار',      labelHi:'कार्य आदेश',          icon:'🏭', section:'production' },
  { id:'bom',         label:'BOM',          labelFa:'فهرست مواد (BOM)', labelHi:'सामग्री सूची (BOM)',  icon:'🧾', section:'production' },
  { id:'materials',   label:'Materials MRP',labelFa:'برنامه‌ریزی مواد', labelHi:'सामग्री योजना',       icon:'📦', section:'production' },
  { id:'wip',         label:'WIP',          labelFa:'در جریان ساخت',    labelHi:'निर्माण प्रगति',       icon:'🔄', section:'tracking' },
  { id:'qc',          label:'Quality Control',labelFa:'کنترل کیفیت',   labelHi:'गुणवत्ता नियंत्रण',  icon:'🔍', section:'tracking' },
  { id:'costing',     label:'Product Costing',labelFa:'هزینه‌یابی',    labelHi:'उत्पाद लागत',         icon:'💰', section:'finance' },
  { id:'reports',     label:'Reports',      labelFa:'گزارشات',          labelHi:'रिपोर्ट',             icon:'📊', section:'finance' },
];

const SECTIONS: Record<string, { label: string; labelFa: string; labelHi?: string }> = {
  production: { label: '🏭 Production',     labelFa: '🏭 تولید',          labelHi: '🏭 उत्पादन' },
  tracking:   { label: '🔄 Tracking',       labelFa: '🔄 پیگیری',         labelHi: '🔄 ट्रैकिंग' },
  finance:    { label: '💰 Cost & Reports', labelFa: '💰 هزینه و گزارش', labelHi: '💰 लागत और रिपोर्ट' },
};

export function ManufacturingModule({ initialView }: { initialView?: MfgView } = {}) {
  const { lang } = useLocaleStore();
  const [view, setView] = useState<MfgView>(initialView || 'dashboard');
  const fa = lang === 'fa';

  const renderContent = () => {
    switch (view) {
      case 'dashboard':   return <ManufacturingDashboard onNavigate={setView} />;
      case 'work-orders': return <WorkOrders />;
      case 'bom':         return <BOM />;
      case 'materials':   return <MaterialsPlanning />;
      case 'wip':         return <WIPTracking />;
      case 'qc':          return <QualityControl />;
      case 'costing':     return <ProductCosting />;
      case 'reports':     return <ManufacturingReports />;
      default:            return <ManufacturingDashboard onNavigate={setView} />;
    }
  };

  const grouped: Record<string, typeof NAV> = { main: [] };
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
            <NavBtn key={item.id} item={item} active={view === item.id as MfgView} lang={lang} onClick={() => setView(item.id as MfgView)} />
          ))}
          {Object.entries(SECTIONS).map(([secId, sec]) => grouped[secId]?.length ? (
            <div key={secId}>
              <div className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] px-2 pt-3 pb-1 uppercase tracking-wider">
                {lang === 'fa' ? sec.labelFa : lang === 'hi' ? (sec.labelHi || sec.label) : sec.label}
              </div>
              {grouped[secId].map(item => (
                <NavBtn key={item.id} item={item} active={view === item.id as MfgView} lang={lang} onClick={() => setView(item.id as MfgView)} />
              ))}
            </div>
          ) : null)}
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
    </div>
  );
}

function NavBtn({ item, active, lang, onClick }: { item: any; active: boolean; lang: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-start ${
        active ? 'bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]'
               : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted)/0.5)] hover:text-[hsl(var(--foreground))]'
      }`}>
      <span>{item.icon}</span>
      <span className="truncate">{lang === 'fa' ? item.labelFa : lang === 'hi' ? (item.labelHi || item.label) : item.label}</span>
    </button>
  );
}
