'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

export function QualityControl() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [inspections] = useState([
    { id:'1', wo:'WO-1403-001', product:fa?'قاب فولادی نوع الف':'Steel Frame A', inspector:fa?'احمد رضایی':'Ahmad Rezaei', date:'1403/06/14', qty:32, passed:30, failed:2, status:'completed' },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">🔍 {fa?'کنترل کیفیت':'Quality Control'}</h1>
        <button className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
          ➕ {fa?'بازرسی جدید':'New Inspection'}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { icon:'🔍', val:inspections.length, label:fa?'بازرسی‌ها':'Inspections', color:'#3b82f6' },
          { icon:'✅', val:inspections.reduce((s,i)=>s+i.passed,0), label:fa?'تأیید شده':'Passed', color:'#10b981' },
          { icon:'❌', val:inspections.reduce((s,i)=>s+i.failed,0), label:fa?'رد شده':'Failed', color:'#ef4444' },
          { icon:'📊', val:inspections.length>0?Math.round(inspections.reduce((s,i)=>s+i.passed,0)/inspections.reduce((s,i)=>s+i.qty,0)*100)+'%':'0%', label:fa?'نرخ قبولی':'Pass Rate', color:'#8b5cf6' },
        ].map((s,i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{color:s.color}}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {inspections.length === 0 ? (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-2">🔍</div>
          <p>{fa?'بازرسی کیفیتی ثبت نشده':'No quality inspections'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inspections.map(ins => (
            <div key={ins.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-[hsl(var(--primary))]">{ins.wo}</span>
                    <span className="font-bold text-sm">{ins.product}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                    <span>👤 {ins.inspector}</span>
                    <span>📅 {ins.date}</span>
                    <span>📦 {ins.qty} {fa?'عدد':'pcs'}</span>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center"><div className="text-lg font-bold text-green-600">{ins.passed}</div><div className="text-xs text-[hsl(var(--muted-foreground))]">{fa?'قبول':'Pass'}</div></div>
                  <div className="text-center"><div className="text-lg font-bold text-red-500">{ins.failed}</div><div className="text-xs text-[hsl(var(--muted-foreground))]">{fa?'رد':'Fail'}</div></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
