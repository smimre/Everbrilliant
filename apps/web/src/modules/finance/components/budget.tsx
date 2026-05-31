'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

interface BudgetItem {
  id: string;
  name: string;
  nameFa: string;
  type: 'revenue' | 'expense';
  budgeted: number;
  actual: number;
  monthly: number[];
}

const DEFAULT_ITEMS: BudgetItem[] = [
  { id: '1', name: 'Sales Revenue', nameFa: 'درآمد فروش', type: 'revenue', budgeted: 500000000, actual: 350000000, monthly: [40,45,35,55,50,60,45,50,40,35,45,50] },
  { id: '2', name: 'Service Revenue', nameFa: 'درآمد خدمات', type: 'revenue', budgeted: 120000000, actual: 80000000, monthly: [8,10,9,11,10,12,9,10,8,7,9,10] },
  { id: '3', name: 'Salaries', nameFa: 'حقوق و دستمزد', type: 'expense', budgeted: 240000000, actual: 170000000, monthly: [20,20,20,20,20,20,20,20,20,20,20,20] },
  { id: '4', name: 'Rent', nameFa: 'اجاره', type: 'expense', budgeted: 60000000, actual: 42000000, monthly: [5,5,5,5,5,5,5,5,5,5,5,5] },
  { id: '5', name: 'Marketing', nameFa: 'بازاریابی', type: 'expense', budgeted: 48000000, actual: 28000000, monthly: [3,4,3,5,4,5,4,4,3,4,4,5] },
  { id: '6', name: 'Other Expenses', nameFa: 'سایر هزینه‌ها', type: 'expense', budgeted: 36000000, actual: 22000000, monthly: [3,3,3,3,3,3,3,3,3,3,3,3] },
];

export function Budget() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [items, setItems] = useState<BudgetItem[]>(DEFAULT_ITEMS);
  const [showNew, setShowNew] = useState(false);
  const [tab, setTab] = useState<'summary'|'detail'|'monthly'>('summary');
  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  const revItems = items.filter(i => i.type === 'revenue');
  const expItems = items.filter(i => i.type === 'expense');
  const totalBudgetRev = revItems.reduce((s, i) => s + i.budgeted, 0);
  const totalActualRev = revItems.reduce((s, i) => s + i.actual, 0);
  const totalBudgetExp = expItems.reduce((s, i) => s + i.budgeted, 0);
  const totalActualExp = expItems.reduce((s, i) => s + i.actual, 0);
  const budgetedProfit = totalBudgetRev - totalBudgetExp;
  const actualProfit = totalActualRev - totalActualExp;

  const months = fa ? ['فر','ارد','خر','تیر','مر','شه','مه','آب','آذ','دی','به','اس'] : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">🎯 {fa ? 'بودجه‌بندی' : 'Budget'}</h1>
        <button onClick={() => setShowNew(true)} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
          ➕ {fa ? 'آیتم بودجه' : 'Add Item'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: '📈', label: fa?'بودجه درآمد':'Budget Revenue', budget: totalBudgetRev, actual: totalActualRev, color: '#10b981' },
          { icon: '📉', label: fa?'بودجه هزینه':'Budget Expense', budget: totalBudgetExp, actual: totalActualExp, color: '#ef4444' },
          { icon: '💰', label: fa?'سود بودجه شده':'Budgeted Profit', budget: budgetedProfit, actual: actualProfit, color: '#3b82f6' },
          { icon: '📊', label: fa?'اجرای بودجه':'Budget Execution', budget: 100, actual: Math.round(totalActualRev / totalBudgetRev * 100), color: '#8b5cf6', isPct: true },
        ].map((s, i) => {
          const pct = s.isPct ? s.actual : Math.round(s.actual / s.budget * 100);
          const over = pct > 100;
          return (
            <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{s.icon}</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</span>
              </div>
              <div className="text-lg font-bold" style={{ color: s.color }}>
                {s.isPct ? pct + '%' : (s.actual / 1_000_000).toFixed(0) + 'M'}
              </div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                {fa ? 'بودجه: ' : 'Budget: '}{s.isPct ? '100%' : (s.budget / 1_000_000).toFixed(0) + 'M'}
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-[hsl(var(--muted)/0.5)]">
                <div className="h-1.5 rounded-full transition-all" style={{ width: Math.min(pct, 100) + '%', background: over ? '#ef4444' : s.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[hsl(var(--border))]">
        {[
          { id: 'summary', label: fa?'خلاصه':'Summary' },
          { id: 'detail',  label: fa?'جزئیات':'Detail' },
          { id: 'monthly', label: fa?'ماهانه':'Monthly' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]' : 'border-transparent text-[hsl(var(--muted-foreground))]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'summary' && (
        <div className="space-y-4">
          {[
            { title: fa?'📈 درآمدها':'📈 Revenue', items: revItems, color: '#10b981' },
            { title: fa?'📉 هزینه‌ها':'📉 Expenses', items: expItems, color: '#ef4444' },
          ].map(group => (
            <div key={group.title} className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
              <div className="px-4 py-3 font-semibold text-sm" style={{ background: group.color + '10', color: group.color }}>{group.title}</div>
              {group.items.map(item => {
                const pct = item.budgeted ? Math.round(item.actual / item.budgeted * 100) : 0;
                const over = item.type === 'expense' ? pct > 100 : false;
                return (
                  <div key={item.id} className="px-4 py-3 border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.3)]">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{fa ? item.nameFa : item.name}</span>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[hsl(var(--muted-foreground))]">{fa?'بودجه:':'Budget:'} {(item.budgeted/1e6).toFixed(0)}M</span>
                        <span className="font-bold" style={{ color: over ? '#ef4444' : group.color }}>{fa?'واقعی:':'Actual:'} {(item.actual/1e6).toFixed(0)}M</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${over ? 'bg-red-100 text-red-600' : pct >= 90 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-700'}`}>{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-[hsl(var(--muted)/0.5)]">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: Math.min(pct, 100) + '%', background: over ? '#ef4444' : group.color, opacity: 0.8 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {tab === 'detail' && (
        <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(var(--muted)/0.5)]">
              <tr>
                {[fa?'ردیف':'Item', fa?'نوع':'Type', fa?'بودجه سالانه':'Annual Budget',
                  fa?'تحقق تاکنون':'YTD Actual', fa?'مانده':'Remaining', fa?'%':'%'].map(h => (
                  <th key={h} className="text-start px-4 py-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const remaining = item.budgeted - item.actual;
                const pct = Math.round(item.actual / item.budgeted * 100);
                const over = item.type === 'expense' && pct > 100;
                return (
                  <tr key={item.id} className="border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.3)]">
                    <td className="px-4 py-3 font-medium">{fa ? item.nameFa : item.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${item.type === 'revenue' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {item.type === 'revenue' ? (fa?'درآمد':'Revenue') : (fa?'هزینه':'Expense')}
                      </span>
                    </td>
                    <td className="px-4 py-3">{item.budgeted.toLocaleString('fa-IR')}</td>
                    <td className="px-4 py-3 font-medium">{item.actual.toLocaleString('fa-IR')}</td>
                    <td className={`px-4 py-3 font-medium ${remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {remaining >= 0 ? '' : '('}{Math.abs(remaining).toLocaleString('fa-IR')}{remaining < 0 ? ')' : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${over ? 'bg-red-100 text-red-600' : pct >= 90 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-700'}`}>
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'monthly' && (
        <div className="rounded-xl border border-[hsl(var(--border))] overflow-x-auto">
          <table className="w-full text-xs min-w-[800px]">
            <thead className="bg-[hsl(var(--muted)/0.5)]">
              <tr>
                <th className="text-start px-4 py-3 font-semibold sticky left-0 bg-[hsl(var(--muted)/0.5)]">{fa?'ردیف':'Item'}</th>
                {months.map(m => <th key={m} className="px-3 py-3 font-semibold text-center min-w-[60px]">{m}</th>)}
                <th className="px-4 py-3 font-semibold text-center">{fa?'جمع':'Total'}</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-t border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.3)]">
                  <td className="px-4 py-2.5 font-medium sticky left-0 bg-[hsl(var(--secondary))]">{fa ? item.nameFa : item.name}</td>
                  {item.monthly.map((v, i) => (
                    <td key={i} className="px-3 py-2.5 text-center">{(v * 1_000_000 / 1_000_000).toFixed(0)}M</td>
                  ))}
                  <td className="px-4 py-2.5 text-center font-bold">{(item.budgeted / 1_000_000).toFixed(0)}M</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">➕ {fa?'آیتم بودجه جدید':'New Budget Item'}</h2>
              <button onClick={() => setShowNew(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'عنوان فارسی *':'Name (FA) *'}</label><input className={inp} /></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نوع':'Type'}</label>
                <select className={inp}><option value="revenue">{fa?'درآمد':'Revenue'}</option><option value="expense">{fa?'هزینه':'Expense'}</option></select>
              </div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'مبلغ بودجه سالانه (ریال)':'Annual Budget (IRR)'}</label><input type="number" className={inp} /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">✅ {fa?'ذخیره':'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
