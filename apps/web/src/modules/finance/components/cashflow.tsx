'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

export function Cashflow() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const months = fa
    ? ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور']
    : ['Jan','Feb','Mar','Apr','May','Jun'];
  const inData =  [120,145,98,165,142,178].map(x => x * 1_000_000);
  const outData = [85,110,72,130,115,145].map(x => x * 1_000_000);
  const netData = inData.map((v, i) => v - outData[i]);
  const maxVal = Math.max(...inData, ...outData);

  const totalIn = inData.reduce((a, b) => a + b, 0);
  const totalOut = outData.reduce((a, b) => a + b, 0);
  const netFlow = totalIn - totalOut;

  const categories = [
    { icon: '🏭', label: fa?'جریان عملیاتی':'Operating Activities', amount: netFlow * 0.7, color: '#10b981' },
    { icon: '🏗️', label: fa?'جریان سرمایه‌گذاری':'Investing Activities', amount: -netFlow * 0.2, color: '#ef4444' },
    { icon: '🏦', label: fa?'جریان تأمین مالی':'Financing Activities', amount: netFlow * 0.1, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">💸 {fa ? 'جریان نقدی' : 'Cash Flow'}</h1>
        <button className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)]">
          🖨️ {fa ? 'چاپ' : 'Print'}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '📥', val: totalIn,  label: fa?'کل ورودی':'Total Inflow',  color: '#10b981' },
          { icon: '📤', val: totalOut, label: fa?'کل خروجی':'Total Outflow', color: '#ef4444' },
          { icon: '💰', val: netFlow,  label: fa?'جریان خالص':'Net Flow',     color: netFlow >= 0 ? '#10b981' : '#ef4444' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>
              {s.val >= 0 ? '' : '('}{Math.abs(s.val / 1_000_000).toFixed(0)}M{s.val >= 0 ? '' : ')'}
            </div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h3 className="font-semibold mb-4">{fa ? 'نمودار ۶ ماهه' : '6-Month Chart'}</h3>
        <div className="flex items-end gap-3 h-40">
          {months.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5 items-end" style={{ height: '120px' }}>
                <div className="flex-1 rounded-t-sm transition-all" title={`In: ${(inData[i]/1e6).toFixed(0)}M`}
                  style={{ height: (inData[i] / maxVal * 100) + '%', background: '#10b981', opacity: 0.8 }} />
                <div className="flex-1 rounded-t-sm transition-all" title={`Out: ${(outData[i]/1e6).toFixed(0)}M`}
                  style={{ height: (outData[i] / maxVal * 100) + '%', background: '#ef4444', opacity: 0.8 }} />
              </div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))] text-center">{m}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ background: '#10b981' }} /> {fa ? 'ورودی' : 'Inflow'}</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ background: '#ef4444' }} /> {fa ? 'خروجی' : 'Outflow'}</span>
        </div>
      </div>

      {/* Categories */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h3 className="font-semibold mb-4">{fa ? 'تفکیک بر اساس فعالیت' : 'By Activity'}</h3>
        <div className="space-y-3">
          {categories.map((c, i) => {
            const pct = Math.round(Math.abs(c.amount) / totalIn * 100);
            return (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{c.icon} {c.label}</span>
                  <span className="font-medium" style={{ color: c.color }}>
                    {c.amount >= 0 ? '+' : ''}{(c.amount / 1e6).toFixed(1)}M
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[hsl(var(--muted)/0.5)]">
                  <div className="h-2 rounded-full transition-all" style={{ width: pct + '%', background: c.color, opacity: 0.8 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
