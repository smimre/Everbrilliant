'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

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

const PRODUCT_COSTS = [
  { product:'قاب فولادی نوع الف', produced:47, cost:656250, total:30843750, color:'#3b82f6' },
  { product:'پانل آلومینیومی',    produced:30, cost:445000, total:13350000, color:'#8b5cf6' },
  { product:'لوله گالوانیزه',     produced:100,cost:182000, total:18200000, color:'#10b981' },
  { product:'قطعات پرس شده',     produced:85, cost:298000, total:25330000, color:'#f59e0b' },
];

const QC_DATA = [
  { product:'قاب فولادی نوع الف', passRate:94, total:50 },
  { product:'پانل آلومینیومی',    passRate:100,total:30 },
  { product:'لوله گالوانیزه',     passRate:94, total:100},
];

export function ManufacturingReports() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [activeReport, setActiveReport] = useState<string|null>(null);

  const maxProd = Math.max(...MONTHLY_DATA.map(d=>Math.max(d.production,d.target)));

  const reports = [
    { id:'production', icon:'🏭', title:fa?'گزارش تولید':'Production Report',      desc:fa?'خلاصه دستورات کار و پیشرفت':'Work Orders Summary', color:'#3b82f6' },
    { id:'costing',    icon:'💰', title:fa?'هزینه‌یابی':'Cost Analysis',             desc:fa?'بهای تمام‌شده محصولات':'Product Cost Analysis', color:'#10b981' },
    { id:'quality',    icon:'🔍', title:fa?'کنترل کیفیت':'QC Report',               desc:fa?'نرخ قبولی و رد محصولات':'Pass/Fail Rates',       color:'#8b5cf6' },
    { id:'materials',  icon:'⚠️', title:fa?'نیاز به مواد':'Material Requirements',  desc:fa?'MRP و کمبود مواد':'MRP & Shortages',             color:'#f59e0b' },
    { id:'efficiency', icon:'📊', title:fa?'بهره‌وری':'Line Efficiency',              desc:fa?'کارایی ماشین‌آلات':'Machine Efficiency',          color:'#06b6d4' },
    { id:'wip',        icon:'🔄', title:fa?'گزارش WIP':'WIP Report',                 desc:fa?'کالای در جریان ساخت':'Work In Progress',          color:'#ec4899' },
  ];

  const totalProduction = MONTHLY_DATA.reduce((s,d)=>s+d.production,0);
  const totalCost       = MONTHLY_DATA.reduce((s,d)=>s+d.cost,0);
  const avgQuality      = Math.round(MONTHLY_DATA.reduce((s,d)=>s+d.quality,0)/MONTHLY_DATA.length);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">📊 {fa?'گزارشات تولید':'Manufacturing Reports'}</h1>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon:'🏭', val:totalProduction, label:fa?'کل تولید (۵ ماه)':'Total Production', color:'#3b82f6', unit:fa?'واحد':'units' },
          { icon:'💰', val:(totalCost/1e9).toFixed(1)+'B', label:fa?'هزینه کل (ریال)':'Total Cost (IRR)', color:'#f59e0b', unit:'' },
          { icon:'📊', val:avgQuality+'%', label:fa?'میانگین نرخ قبولی':'Avg Pass Rate', color:'#10b981', unit:'' },
          { icon:'⚡', val:'87%', label:fa?'میانگین بهره‌وری':'Avg Efficiency', color:'#8b5cf6', unit:'' },
        ].map((s,i)=>(
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{color:s.color}}>{s.val} <span className="text-xs">{s.unit}</span></div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Monthly production bar chart */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h2 className="font-semibold text-sm mb-4">📈 {fa?'تولید ماهانه':'Monthly Production'}</h2>
        <div className="flex items-end gap-3 h-36">
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
      </div>

      {/* Product cost breakdown */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h2 className="font-semibold text-sm mb-3">💰 {fa?'هزینه‌یابی محصولات':'Product Cost Breakdown'}</h2>
        <div className="space-y-3">
          {PRODUCT_COSTS.map((p,i) => {
            const totalAll = PRODUCT_COSTS.reduce((s,x)=>s+x.total,0);
            const pct = Math.round(p.total/totalAll*100);
            return (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{background:p.color}}/>
                    <span>{p.product}</span>
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))]">({p.produced} {fa?'واحد':'units'})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{p.cost.toLocaleString('fa-IR')} ﷼/{fa?'واحد':'unit'}</span>
                    <span className="font-bold text-xs">{pct}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-[hsl(var(--muted))]">
                  <div className="h-full rounded-full" style={{width:`${pct}%`,background:p.color}}/>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-[hsl(var(--border)/0.5)] flex justify-between text-sm">
          <span className="text-[hsl(var(--muted-foreground))]">{fa?'جمع کل هزینه تولید:':'Total Production Cost:'}</span>
          <span className="font-bold">{PRODUCT_COSTS.reduce((s,p)=>s+p.total,0).toLocaleString('fa-IR')} ﷼</span>
        </div>
      </div>

      {/* QC pass rates */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h2 className="font-semibold text-sm mb-3">🔍 {fa?'نرخ قبولی کیفیت':'Quality Pass Rates'}</h2>
        <div className="space-y-3">
          {QC_DATA.map((q,i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span>{q.product}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{q.total} {fa?'عدد':'pcs'}</span>
                  <span className="font-bold" style={{color:q.passRate>=95?'#10b981':q.passRate>=85?'#f59e0b':'#ef4444'}}>{q.passRate}%</span>
                </div>
              </div>
              <div className="h-2.5 rounded-full bg-[hsl(var(--muted))]">
                <div className="h-full rounded-full" style={{width:`${q.passRate}%`,background:q.passRate>=95?'#10b981':q.passRate>=85?'#f59e0b':'#ef4444'}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report cards */}
      <div>
        <h2 className="font-semibold text-sm mb-3">📥 {fa?'دانلود گزارشات':'Download Reports'}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {reports.map((r,i) => (
            <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 cursor-pointer hover:border-[hsl(var(--primary)/0.3)] transition-all group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform" style={{background:r.color+'15',color:r.color}}>{r.icon}</div>
              <div className="font-semibold text-sm mb-1">{r.title}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] mb-3">{r.desc}</div>
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
