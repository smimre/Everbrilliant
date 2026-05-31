'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

export function Payroll() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [runs, setRuns] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">💰 {fa ? 'حقوق و دستمزد' : 'Payroll'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{runs.length} {fa ? 'دوره پرداخت' : 'pay runs'}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
          ▶️ {fa ? 'اجرای حقوق' : 'Run Payroll'}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: '💰', val: '0', label: fa?'حقوق این ماه':'This Month', color: '#10b981' },
          { icon: '👥', val: '0', label: fa?'تعداد پرسنل':'Employees', color: '#3b82f6' },
          { icon: '🏦', val: '0', label: fa?'بیمه کارفرما':'Employer Insurance', color: '#8b5cf6' },
          { icon: '📊', val: '0', label: fa?'مالیات حقوق':'Payroll Tax', color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {runs.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">💰</div>
          <p className="font-medium">{fa ? 'هنوز حقوقی پردازش نشده' : 'No payroll runs yet'}</p>
          <button onClick={() => setShowNew(true)} className="mt-4 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm">
            {fa ? '▶️ اجرای اول حقوق' : '▶️ Run First Payroll'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map((run: any) => (
            <div key={run.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{run.period}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">{run.employeeCount} {fa?'نفر':'employees'}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{run.total?.toLocaleString('fa-IR')}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${run.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {run.status === 'paid' ? (fa?'پرداخت شده':'Paid') : (fa?'در انتظار':'Pending')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">▶️ {fa ? 'اجرای حقوق' : 'Run Payroll'}</h2>
              <button onClick={() => setShowNew(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'دوره مالی':'Pay Period'}</label>
                  <select className={inp}>
                    {['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'].map((m,i) => (
                      <option key={i} value={i+1}>{m} ۱۴۰۳</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'تاریخ پرداخت':'Payment Date'}</label>
                  <input className={inp} placeholder="1403/06/31" />
                </div>
              </div>
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-700 space-y-1">
                <div className="font-semibold mb-1">⚙️ {fa?'تنظیمات محاسبه':'Calculation Settings'}</div>
                <div>✅ {fa?'بیمه تأمین اجتماعی کارمند: ۷٪':'Employee Social Security: 7%'}</div>
                <div>✅ {fa?'بیمه تأمین اجتماعی کارفرما: ۲۳٪':'Employer Social Security: 23%'}</div>
                <div>✅ {fa?'مالیات حقوق (جدول ماده ۸۴)':'Payroll Tax (Article 84 Table)'}</div>
                <div>✅ {fa?'بیمه بیکاری: ۱٪':'Unemployment Insurance: 1%'}</div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">▶️ {fa?'محاسبه و اجرا':'Calculate & Run'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
