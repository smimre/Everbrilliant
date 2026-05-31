'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

export function ProductCosting() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [selectedProduct, setSelectedProduct] = useState('1');

  const products = [
    { id:'1', name:'Steel Frame A', nameFa:'قاب فولادی نوع الف', matCost:425000, laborCost:100000, overhead:131250, total:656250 },
    { id:'2', name:'Steel Frame B', nameFa:'قاب فولادی نوع ب', matCost:380000, laborCost:90000, overhead:117500, total:587500 },
  ];

  const p = products.find(x=>x.id===selectedProduct)!;
  const items = [
    { label:fa?'مواد مستقیم':'Direct Materials', value:p.matCost, color:'#3b82f6', pct:Math.round(p.matCost/p.total*100) },
    { label:fa?'دستمزد مستقیم':'Direct Labor', value:p.laborCost, color:'#8b5cf6', pct:Math.round(p.laborCost/p.total*100) },
    { label:fa?'سربار تولید':'Manufacturing Overhead', value:p.overhead, color:'#f59e0b', pct:Math.round(p.overhead/p.total*100) },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">💰 {fa?'هزینه‌یابی محصول':'Product Costing'}</h1>

      <div>
        <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'انتخاب محصول':'Select Product'}</label>
        <select value={selectedProduct} onChange={e=>setSelectedProduct(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-sm focus:outline-none">
          {products.map(prod => <option key={prod.id} value={prod.id}>{fa?prod.nameFa:prod.name}</option>)}
        </select>
      </div>

      {/* Total Cost */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 p-5 text-white">
        <div className="text-sm opacity-80 mb-1">{fa?'بهای تمام‌شده هر واحد':'Cost Per Unit'}</div>
        <div className="text-3xl font-bold">{p.total.toLocaleString('fa-IR')}</div>
        <div className="text-sm opacity-70 mt-1">{fa?'ریال':'IRR'} | {fa?'بر اساس آخرین BOM':'Based on latest BOM'}</div>
      </div>

      {/* Cost Breakdown */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h3 className="font-semibold mb-4">{fa?'تجزیه هزینه':'Cost Breakdown'}</h3>
        <div className="space-y-3">
          {items.map((item,i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span>{item.label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold" style={{color:item.color}}>{item.value.toLocaleString('fa-IR')}</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{item.pct}%</span>
                </div>
              </div>
              <div className="h-2.5 rounded-full bg-[hsl(var(--muted)/0.5)]">
                <div className="h-2.5 rounded-full" style={{width:item.pct+'%',background:item.color,opacity:0.85}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accounting Entries */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h3 className="font-semibold mb-3">📒 {fa?'ثبت حسابداری تولید':'Manufacturing Journal Entries'}</h3>
        <div className="space-y-2 text-xs">
          {[
            { dr:fa?'کالای در جریان ساخت (WIP)':'WIP', cr:fa?'موجودی مواد اولیه':'Raw Material Inventory', amount:p.matCost, label:fa?'مصرف مواد':'Material Consumption' },
            { dr:fa?'کالای در جریان ساخت (WIP)':'WIP', cr:fa?'حقوق و دستمزد':'Wages Payable', amount:p.laborCost, label:fa?'دستمزد مستقیم':'Direct Labor' },
            { dr:fa?'کالای در جریان ساخت (WIP)':'WIP', cr:fa?'کنترل سربار':'Overhead Control', amount:p.overhead, label:fa?'اعمال سربار':'Overhead Applied' },
            { dr:fa?'موجودی کالای ساخته شده':'Finished Goods', cr:fa?'کالای در جریان ساخت (WIP)':'WIP', amount:p.total, label:fa?'انتقال به انبار محصول':'Transfer to FG Inventory' },
          ].map((entry,i) => (
            <div key={i} className="rounded-lg border border-[hsl(var(--border)/0.5)] p-2 bg-[hsl(var(--background))]">
              <div className="font-medium mb-1 text-[hsl(var(--muted-foreground))]">{entry.label}</div>
              <div className="flex justify-between">
                <div className="space-y-0.5">
                  <div className="text-green-600">Dr: {entry.dr}</div>
                  <div className="text-red-500 ps-4">Cr: {entry.cr}</div>
                </div>
                <div className="font-bold text-sm">{entry.amount.toLocaleString('fa-IR')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
