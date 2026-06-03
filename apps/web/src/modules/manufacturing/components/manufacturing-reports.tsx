'use client';
import { useLocaleStore } from '@/store/locale.store';
import { useMfgReports } from '@/hooks/use-manufacturing';

const MONTHLY_DATA = [
  { month:fa_month(6), production:142, target:150, cost:312000000, quality:94 },
  { month:fa_month(5), production:138, target:150, cost:298000000, quality:96 },
  { month:fa_month(4), production:155, target:150, cost:327000000, quality:92 },
  { month:fa_month(3), production:121, target:140, cost:265000000, quality:91 },
  { month:fa_month(2), production:148, target:145, cost:318000000, quality:95 },
];

function fa_month(n: number) {
  return ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور'][n-1] || `ماه ${n}`;
}

const REPORT_CARDS = [
  { id:'production', icon:'🏭', title:'گزارش تولید',    titleEn:'Production Report',     desc:'خلاصه دستورات کار',         descEn:'Work Orders Summary',      color:'#3b82f6' },
  { id:'costing',    icon:'💰', title:'هزینه‌یابی',      titleEn:'Cost Analysis',          desc:'بهای تمام‌شده محصولات',      descEn:'Product Cost Analysis',   color:'#10b981' },
  { id:'quality',    icon:'🔍', title:'کنترل کیفیت',     titleEn:'QC Report',              desc:'نرخ قبولی و رد محصولات',     descEn:'Pass/Fail Rates',          color:'#8b5cf6' },
  { id:'materials',  icon:'⚠️', title:'نیاز به مواد',    titleEn:'Material Requirements',  desc:'MRP و کمبود مواد',          descEn:'MRP & Shortages',          color:'#f59e0b' },
  { id:'efficiency', icon:'📊', title:'بهره‌وری',         titleEn:'Line Efficiency',         desc:'کارایی ماشین‌آلات',         descEn:'Machine Efficiency',       color:'#06b6d4' },
  { id:'wip',        icon:'🔄', title:'گزارش WIP',       titleEn:'WIP Report',             desc:'کالای در جریان ساخت',       descEn:'Work In Progress',         color:'#ec4899' },
];

export function ManufacturingReports() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const { data: reports } = useMfgReports();
  const r = reports as any;

  const active     = r?.activeWorkOrders ?? 0;
  const planned    = r?.plannedWorkOrders ?? 0;
  const inQC       = r?.inQCWorkOrders ?? 0;
  const completed  = r?.completedThisMonth ?? 0;
  const shortages  = r?.materialShortages ?? 0;
  const totalCost  = r?.totalEstimatedCostIRR ? Number(r.totalEstimatedCostIRR) : 0;

  const maxProd = Math.max(...MONTHLY_DATA.map(d => Math.max(d.production, d.target)));
  const totalProduction = MONTHLY_DATA.reduce((s, d) => s + d.production, 0);
  const totalMonthlyCost = MONTHLY_DATA.reduce((s, d) => s + d.cost, 0);
  const avgQuality = Math.round(MONTHLY_DATA.reduce((s, d) => s + d.quality, 0) / MONTHLY_DATA.length);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">📊 {fa?'گزارشات تولید':'Manufacturing Reports'}</h1>

      {/* Live KPIs from API */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { icon:'🔄', val:active,    label:fa?'دستور کار فعال':'Active WOs',        color:'#3b82f6' },
          { icon:'📋', val:planned,   label:fa?'برنامه‌ریزی شده':'Planned WOs',      color:'#64748b' },
          { icon:'🔍', val:inQC,      label:fa?'در کنترل کیفیت':'In QC',             color:'#8b5cf6' },
          { icon:'✅', val:completed, label:fa?'تکمیل شده (ماه)':'Completed (Month)',color:'#10b981' },
          { icon:'⚠️', val:shortages, label:fa?'کمبود مواد':'Material Shortages',    color:'#ef4444' },
          { icon:'💰', val:totalCost > 0 ? (totalCost/1e9).toFixed(1)+'B' : '—', label:fa?'هزینه کل برآورد':'Total Est. Cost', color:'#f59e0b' },
        ].map((s,i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{color:s.color}}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Historical monthly production */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-sm">📈 {fa?'تولید ماهانه (تاریخی)':'Monthly Production (Historical)'}</h2>
          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{fa?'داده نمونه':'Sample data'}</span>
        </div>
        <div className="flex items-end gap-3 h-36 mt-4">
          {MONTHLY_DATA.map((d,i) => {
            const prodPct = Math.round(d.production/maxProd*100);
            const tgtPct  = Math.round(d.target/maxProd*100);
            const metTarget = d.production >= d.target;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] font-bold" style={{color:metTarget?'#10b981':'#ef4444'}}>{d.production}</div>
                <div className="w-full flex gap-0.5 items-end" style={{height:'100px'}}>
                  <div className="flex-1 rounded-t transition-all" style={{height:`${prodPct}%`,background:metTarget?'#3b82f6':'#f59e0b'}}/>
                  <div className="flex-1 rounded-t bg-[hsl(var(--muted)/0.5)] border border-dashed border-[hsl(var(--border))]" style={{height:`${tgtPct}%`}}/>
                </div>
                <div className="text-[9px] text-[hsl(var(--muted-foreground))] text-center">{d.month}</div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-xs"><div className="w-3 h-3 rounded bg-blue-500"/>{fa?'واقعی':'Actual'}</div>
          <div className="flex items-center gap-1.5 text-xs"><div className="w-3 h-3 rounded border border-dashed border-[hsl(var(--muted-foreground))]"/>{fa?'هدف':'Target'}</div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[hsl(var(--border)/0.5)] text-xs text-center">
          <div><div className="font-bold text-blue-600">{totalProduction}</div><div className="text-[hsl(var(--muted-foreground))]">{fa?'کل تولید':'Total Units'}</div></div>
          <div><div className="font-bold text-amber-600">{(totalMonthlyCost/1e9).toFixed(1)}B</div><div className="text-[hsl(var(--muted-foreground))]">{fa?'هزینه کل':'Total Cost'}</div></div>
          <div><div className="font-bold text-green-600">{avgQuality}%</div><div className="text-[hsl(var(--muted-foreground))]">{fa?'میانگین کیفیت':'Avg Quality'}</div></div>
        </div>
      </div>

      {/* Report cards */}
      <div>
        <h2 className="font-semibold text-sm mb-3">📥 {fa?'دانلود گزارشات':'Download Reports'}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORT_CARDS.map((r,i) => (
            <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 cursor-pointer hover:border-[hsl(var(--primary)/0.3)] transition-all group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform" style={{background:r.color+'15',color:r.color}}>{r.icon}</div>
              <div className="font-semibold text-sm mb-1">{fa?r.title:r.titleEn}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] mb-3">{fa?r.desc:r.descEn}</div>
              <div className="flex gap-2">
                <button className="text-xs font-medium hover:underline" style={{color:r.color}}>{fa?'مشاهده':'View →'}</button>
                <button className="text-xs px-2 py-1 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]">📥 Excel</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
