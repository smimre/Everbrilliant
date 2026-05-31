'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

export function WIPTracking() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';

  const wipItems = [
    { id:'1', wo:'WO-1403-001', product:fa?'قاب فولادی نوع الف':'Steel Frame A', stage:fa?'مرحله جوشکاری':'Welding', qty:50, done:32, unit:'Pcs', startDate:'1403/06/01', estimatedCost:45000000, actualCost:29000000 },
    { id:'2', wo:'WO-1403-002', product:fa?'قاب فولادی نوع ب':'Steel Frame B', stage:fa?'مرحله رنگ‌کاری':'Painting', qty:30, done:18, unit:'Pcs', startDate:'1403/06/05', estimatedCost:27000000, actualCost:16200000 },
  ];

  const totalEstimated = wipItems.reduce((s,i)=>s+i.estimatedCost,0);
  const totalActual = wipItems.reduce((s,i)=>s+i.actualCost,0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">🔄 {fa?'کالای در جریان ساخت (WIP)':'Work In Progress (WIP)'}</h1>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon:'🔄', val:wipItems.length, label:fa?'دستور کار فعال':'Active Orders', color:'#3b82f6' },
          { icon:'📊', val:(totalEstimated/1e6).toFixed(0)+'M', label:fa?'هزینه برآورد شده':'Estimated Cost', color:'#f59e0b' },
          { icon:'💰', val:(totalActual/1e6).toFixed(0)+'M', label:fa?'هزینه واقعی تاکنون':'Actual Cost YTD', color:'#10b981' },
        ].map((s,i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 text-center">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-xl font-bold" style={{color:s.color}}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {wipItems.map(item => {
          const pct = Math.round(item.done/item.qty*100);
          const costPct = Math.round(item.actualCost/item.estimatedCost*100);
          return (
            <div key={item.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-[hsl(var(--primary))]">{item.wo}</span>
                    <span className="font-bold text-sm">{item.product}</span>
                  </div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">🏭 {fa?'مرحله فعلی:':'Current Stage:'} <span className="font-medium text-amber-600">{item.stage}</span></div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-bold text-2xl text-[hsl(var(--primary))]">{pct}%</div>
                  <div className="text-[hsl(var(--muted-foreground))]">{item.done}/{item.qty} {item.unit}</div>
                </div>
              </div>

              {/* Physical Progress */}
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[hsl(var(--muted-foreground))]">{fa?'پیشرفت فیزیکی':'Physical Progress'}</span>
                  <span>{item.done}/{item.qty} {item.unit}</span>
                </div>
                <div className="h-2 rounded-full bg-[hsl(var(--muted)/0.5)]">
                  <div className="h-2 rounded-full bg-blue-500" style={{width:pct+'%'}}/>
                </div>
              </div>

              {/* Cost Progress */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[hsl(var(--muted-foreground))]">{fa?'مصرف بودجه':'Budget Usage'}</span>
                  <span className={costPct>100?'text-red-500':''}>{costPct}% ({item.actualCost.toLocaleString('fa-IR')} / {item.estimatedCost.toLocaleString('fa-IR')})</span>
                </div>
                <div className="h-2 rounded-full bg-[hsl(var(--muted)/0.5)]">
                  <div className="h-2 rounded-full" style={{width:Math.min(costPct,100)+'%',background:costPct>100?'#ef4444':'#10b981'}}/>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
