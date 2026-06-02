'use client';
import { useLocaleStore } from '@/store/locale.store';
import { useWorkOrders, useMaterials } from '@/hooks/use-manufacturing';

interface Props { onNavigate: (view: any) => void; }

const LINE_EFFICIENCY = [
  { name:'خط تولید ۱', efficiency:87, target:90, color:'#3b82f6' },
  { name:'خط تولید ۲', efficiency:73, target:85, color:'#f59e0b' },
  { name:'خط رنگ‌کاری', efficiency:91, target:88, color:'#10b981' },
];

const MOCK_RECENT_WOS = [
  { no:'WO-1403-005', product:'قاب فولادی نوع الف', progress:65, status:'in-progress', color:'#3b82f6' },
  { no:'WO-1403-006', product:'پانل آلومینیومی',    progress:30, status:'in-progress', color:'#3b82f6' },
  { no:'WO-1403-007', product:'لوله گالوانیزه',     progress:90, status:'qc',          color:'#8b5cf6' },
  { no:'WO-1403-008', product:'قطعات پرس شده',      progress:0,  status:'planned',     color:'#64748b' },
];

const MOCK_MATERIAL_ALERTS = [
  { material:'ورق فولادی ۲ میل', shortage:70, unit:'Kg', color:'#ef4444' },
  { material:'رنگ اپوکسی',        shortage:4,  unit:'Liter', color:'#f59e0b' },
];

export function ManufacturingDashboard({ onNavigate }: Props) {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';

  const { data: woData } = useWorkOrders();
  const { data: matData } = useMaterials();
  const allWOs: any[] = (woData as any)?.data ?? [];
  const allMaterials: any[] = (matData as any)?.data ?? [];

  const active    = allWOs.filter((o:any) => o.status === 'in-progress').length || 5;
  const planned   = allWOs.filter((o:any) => o.status === 'planned').length || 3;
  const qc        = allWOs.filter((o:any) => o.status === 'qc').length || 2;
  const completed = allWOs.filter((o:any) => o.status === 'completed').length || 12;
  const shortage  = allMaterials.filter((m:any) => (m.available ?? 0) < (m.required ?? 0)).length || 2;

  const recentWOs = allWOs.length > 0
    ? allWOs.slice(0,4).map((o:any) => ({
        no: o.no ?? 'WO-???', product: o.productNameFa ?? o.productName ?? '',
        progress: o.progress ?? 0, status: o.status,
        color: o.status==='in-progress'?'#3b82f6':o.status==='qc'?'#8b5cf6':'#64748b',
      }))
    : MOCK_RECENT_WOS;

  const materialAlerts = allMaterials.length > 0
    ? allMaterials.filter((m:any) => (m.available ?? 0) < (m.required ?? 0)).slice(0,3).map((m:any) => ({
        material: m.material ?? m.name, shortage: (m.required - m.available), unit: m.unit,
        color: '#ef4444',
      }))
    : MOCK_MATERIAL_ALERTS;

  const stats = [
    { icon:'🏭', val:active,   label:fa?'دستور کار فعال':'Active Work Orders', color:'#3b82f6', view:'work-orders' },
    { icon:'📋', val:planned,  label:fa?'برنامه‌ریزی شده':'Planned',            color:'#64748b', view:'work-orders' },
    { icon:'🔍', val:qc,       label:fa?'در کنترل کیفیت':'In QC',              color:'#8b5cf6', view:'qc' },
    { icon:'⚠️', val:shortage, label:fa?'کمبود مواد':'Material Shortage',      color:'#ef4444', view:'materials' },
    { icon:'✅', val:completed, label:fa?'تکمیل شده (ماه)':'Completed (Month)', color:'#10b981', view:'work-orders' },
    { icon:'💰', val:'24.5M',  label:fa?'هزینه تولید (روز)':'Today Cost',      color:'#06b6d4', view:'costing' },
  ];

  const quickActions = [
    { icon:'📋', label:fa?'دستور کار جدید':'New Work Order', view:'work-orders', color:'#3b82f6' },
    { icon:'🧾', label:fa?'BOM جدید':'New BOM',              view:'bom',         color:'#8b5cf6' },
    { icon:'📦', label:fa?'رسید مواد':'Material Receipt',   view:'materials',   color:'#10b981' },
    { icon:'🔍', label:fa?'بازرسی کیفی':'QC Inspection',   view:'qc',          color:'#8b5cf6' },
    { icon:'💰', label:fa?'هزینه‌یابی':'Costing',           view:'costing',     color:'#06b6d4' },
    { icon:'📊', label:fa?'گزارشات':'Reports',               view:'reports',     color:'#ec4899' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">🏭 {fa?'داشبورد تولید':'Manufacturing Dashboard'}</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{fa?'مدیریت فرآیند تولید، هزینه‌یابی و کنترل کیفیت':'Production process, costing & quality control'}</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {stats.map((s,i) => (
          <button key={i} onClick={() => onNavigate(s.view)}
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 text-start hover:border-[hsl(var(--primary)/0.3)] transition-all group">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold group-hover:scale-110 transition-transform origin-left" style={{color:s.color}}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Material alerts */}
      {materialAlerts.length > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <h2 className="font-semibold text-sm text-red-500 mb-2">⚠️ {fa?'هشدار کمبود مواد':'Material Shortage Alerts'}</h2>
          <div className="space-y-1">
            {materialAlerts.map((a,i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span>{a.material}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{background:a.color+'20',color:a.color}}>
                  -{a.shortage} {a.unit}
                </span>
              </div>
            ))}
          </div>
          <button onClick={()=>onNavigate('materials')} className="mt-2 text-xs text-red-500 hover:underline">
            {fa?'مشاهده برنامه‌ریزی مواد ←':'View Material Planning →'}
          </button>
        </div>
      )}

      {/* Recent work orders */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">🏭 {fa?'دستورات کار فعال':'Active Work Orders'}</h2>
          <button onClick={()=>onNavigate('work-orders')} className="text-xs text-[hsl(var(--primary))] hover:underline">{fa?'همه':'All'}</button>
        </div>
        <div className="space-y-2">
          {recentWOs.map((wo,i) => (
            <div key={i} className="p-3 rounded-lg bg-[hsl(var(--muted)/0.3)]">
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <span className="font-mono text-xs text-[hsl(var(--primary))]">{wo.no}</span>
                  <span className="text-sm font-medium mx-2">{wo.product}</span>
                </div>
                <span className="text-xs font-bold" style={{color:wo.color}}>{wo.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[hsl(var(--muted))]">
                <div className="h-full rounded-full transition-all" style={{width:`${wo.progress}%`,background:wo.color}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Line efficiency */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h2 className="font-semibold text-sm mb-3">📊 {fa?'بهره‌وری خطوط تولید':'Line Efficiency'}</h2>
        <div className="space-y-3">
          {LINE_EFFICIENCY.map((line,i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>{line.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[hsl(var(--muted-foreground))] text-xs">{fa?'هدف:':'Target:'} {line.target}%</span>
                  <span className="font-bold" style={{color:line.efficiency>=line.target?'#10b981':'#f59e0b'}}>{line.efficiency}%</span>
                </div>
              </div>
              <div className="relative h-2 rounded-full bg-[hsl(var(--muted))]">
                <div className="h-full rounded-full transition-all" style={{width:`${line.efficiency}%`,background:line.efficiency>=line.target?'#10b981':'#f59e0b'}}/>
                <div className="absolute top-0 h-full w-0.5 bg-white/60" style={{left:`${line.target}%`}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Production Flow */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h2 className="font-semibold text-sm mb-3">🔄 {fa?'فرآیند تولید':'Production Flow'}</h2>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {[
            { icon:'📦', label:fa?'انبار مواد':'Raw Materials', val:'۱۸ قلم', color:'#3b82f6' },
            { arrow:true },
            { icon:'🔄', label:fa?'در جریان ساخت':'WIP', val:`${active} دستور`, color:'#f59e0b' },
            { arrow:true },
            { icon:'🔍', label:fa?'کنترل کیفیت':'QC Check', val:`${qc} واحد`, color:'#8b5cf6' },
            { arrow:true },
            { icon:'🏪', label:fa?'انبار محصول':'Finished Goods', val:`${completed} تکمیل`, color:'#10b981' },
          ].map((step:'any'|any, i) => (
            step.arrow
              ? <span key={i} className="text-xl text-[hsl(var(--muted-foreground))] shrink-0">→</span>
              : (
                <div key={i} className="flex flex-col items-center gap-1 min-w-[90px] text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{background:step.color+'15',color:step.color}}>
                    {step.icon}
                  </div>
                  <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))]">{step.label}</span>
                  <span className="text-[10px] font-bold" style={{color:step.color}}>{step.val}</span>
                </div>
              )
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h2 className="font-semibold text-sm mb-3">⚡ {fa?'دسترسی سریع':'Quick Actions'}</h2>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((a,i) => (
            <button key={i} onClick={() => onNavigate(a.view)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--muted)/0.5)] transition-all group">
              <div className="rounded-xl p-2 text-xl group-hover:scale-110 transition-transform" style={{background:a.color+'18',color:a.color}}>{a.icon}</div>
              <span className="text-[10px] font-medium text-center leading-tight">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
