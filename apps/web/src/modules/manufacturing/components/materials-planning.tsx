'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

export function MaterialsPlanning() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';

  const requirements = [
    { material:fa?'ورق فولادی ۲ میل':'Steel Sheet 2mm', code:'MTL-001', required:250, available:180, shortage:70, unit:'Kg', dueDate:'1403/06/15', color:'#ef4444' },
    { material:fa?'الکترود جوشکاری':'Welding Rod', code:'MTL-002', required:25, available:30, shortage:0, unit:'Kg', dueDate:'1403/06/15', color:'#10b981' },
    { material:fa?'رنگ':'Paint', code:'MTL-003', required:10, available:6, shortage:4, unit:'Liter', dueDate:'1403/06/20', color:'#f59e0b' },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">📦 {fa?'برنامه‌ریزی مواد (MRP)':'Material Requirements Planning (MRP)'}</h1>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon:'📦', val:requirements.length, label:fa?'اقلام مورد نیاز':'Required Items', color:'#3b82f6' },
          { icon:'⚠️', val:requirements.filter(r=>r.shortage>0).length, label:fa?'کمبود مواد':'Shortages', color:'#ef4444' },
          { icon:'✅', val:requirements.filter(r=>r.shortage===0).length, label:fa?'موجودی کافی':'Sufficient Stock', color:'#10b981' },
        ].map((s,i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{color:s.color}}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--muted)/0.5)]">
            <tr>
              {[fa?'کد':'Code', fa?'نام ماده':'Material', fa?'نیاز':'Required', fa?'موجود':'Available', fa?'کمبود':'Shortage', fa?'واحد':'Unit', fa?'تاریخ نیاز':'Due Date', fa?'اقدام':'Action'].map(h=>(
                <th key={h} className="text-start px-4 py-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requirements.map((r,i) => (
              <tr key={i} className="border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.3)]">
                <td className="px-4 py-3 font-mono text-xs">{r.code}</td>
                <td className="px-4 py-3 font-medium">{r.material}</td>
                <td className="px-4 py-3">{r.required} {r.unit}</td>
                <td className={`px-4 py-3 font-medium ${r.available>=r.required?'text-green-600':'text-amber-600'}`}>{r.available} {r.unit}</td>
                <td className="px-4 py-3">
                  {r.shortage > 0 ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-bold">-{r.shortage} {r.unit}</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">✅ {fa?'کافی':'OK'}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{r.unit}</td>
                <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{r.dueDate}</td>
                <td className="px-4 py-3">
                  {r.shortage > 0 && (
                    <button className="text-xs px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))] text-white hover:opacity-90">
                      {fa?'سفارش خرید':'Purchase Order'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
