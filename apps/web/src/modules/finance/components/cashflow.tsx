'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useCashFlow } from '@/hooks/use-finance';

// Static fallback — indirect method, shown when no bank data
const OPERATING = [
  { code:'OP-01', name:'Net Profit',             nameFa:'سود خالص دوره',                  amount: 85000000,  type:'in'  },
  { code:'OP-02', name:'Depreciation (+)',        nameFa:'استهلاک (+)',                     amount: 18000000,  type:'in'  },
  { code:'OP-03', name:'↑ Receivables (–)',       nameFa:'افزایش حساب‌های دریافتنی (−)',  amount:-12000000,  type:'out' },
  { code:'OP-04', name:'↓ Inventory (+)',         nameFa:'کاهش موجودی کالا (+)',            amount:  8000000,  type:'in'  },
  { code:'OP-05', name:'↑ Payables (+)',          nameFa:'افزایش حساب‌های پرداختنی (+)',  amount:  6500000,  type:'in'  },
  { code:'OP-06', name:'↑ Prepaid Expenses (–)',  nameFa:'افزایش پیش‌پرداخت‌ها (−)',      amount: -4000000,  type:'out' },
  { code:'OP-07', name:'↑ Accrued Expenses (+)',  nameFa:'افزایش هزینه‌های تعهدی (+)',     amount:  3200000,  type:'in'  },
];
const INVESTING = [
  { code:'IN-01', name:'Purchase of Equipment (–)', nameFa:'خرید تجهیزات (−)',            amount:-35000000,  type:'out' },
  { code:'IN-02', name:'Sale of Investments (+)',   nameFa:'فروش سرمایه‌گذاری (+)',        amount: 12000000,  type:'in'  },
  { code:'IN-03', name:'Purchase of Software (–)',  nameFa:'خرید نرم‌افزار (−)',           amount: -8000000,  type:'out' },
  { code:'IN-04', name:'Asset Sale Proceeds (+)',   nameFa:'عواید فروش دارایی (+)',        amount:  5000000,  type:'in'  },
];
const FINANCING = [
  { code:'FN-01', name:'Bank Loan Received (+)',    nameFa:'دریافت وام بانکی (+)',          amount: 50000000,  type:'in'  },
  { code:'FN-02', name:'Loan Repayment (–)',         nameFa:'بازپرداخت وام (−)',            amount:-25000000,  type:'out' },
  { code:'FN-03', name:'Dividends Paid (–)',         nameFa:'سود تقسیمی پرداختی (−)',      amount:-15000000,  type:'out' },
  { code:'FN-04', name:'New Share Capital (+)',      nameFa:'افزایش سرمایه (+)',            amount: 20000000,  type:'in'  },
];
const OPENING_CASH = 42000000;

type Fmt = (n: number) => string;

function Section({ title, items, total, color, fa, fmt }: {
  title: string; items: { code: string; name: string; nameFa: string; amount: number; type: string }[];
  total: number; color: string; fa: boolean; fmt: Fmt;
}) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: color + '40' }}>
      <div className="px-4 py-3 font-bold text-sm flex justify-between" style={{ background: color + '10', color }}>
        <span>{title}</span>
        <span className={total >= 0 ? 'text-green-600' : 'text-red-500'}>{total >= 0 ? '+' : ''}{fmt(total)}</span>
      </div>
      {items.map(item => (
        <div key={item.code} className="flex justify-between px-4 py-2.5 border-t border-[hsl(var(--border)/0.4)] hover:bg-[hsl(var(--muted)/0.3)] text-sm">
          <span className="text-[hsl(var(--muted-foreground))] flex items-center gap-2">
            <span className="font-mono text-xs w-14">{item.code}</span>
            <span>{fa ? item.nameFa : item.name}</span>
          </span>
          <div className="flex gap-8 font-mono text-xs items-center">
            <span className="w-24 text-end text-green-600">{item.type === 'in'  ? fmt(Math.abs(item.amount)) : ''}</span>
            <span className="w-24 text-end text-red-500"> {item.type === 'out' ? fmt(Math.abs(item.amount)) : ''}</span>
          </div>
        </div>
      ))}
      <div className="flex justify-between px-4 py-2.5 border-t-2 border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.2)] font-bold text-sm">
        <span>{fa ? 'جمع خالص' : 'Net'}</span>
        <span style={{ color: total >= 0 ? '#10b981' : '#ef4444' }}>{total >= 0 ? '+' : ''}{fmt(total)}</span>
      </div>
    </div>
  );
}

export function Cashflow() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [view, setView] = useState<'statement' | 'chart'>('statement');

  const now = new Date();
  const defaultFrom = `${now.getFullYear()}-01-01`;
  const defaultTo   = now.toISOString().split('T')[0];
  const [from, setFrom] = useState(defaultFrom);
  const [to,   setTo]   = useState(defaultTo);

  const { data: raw, isLoading } = useCashFlow(from, to);

  const hasData = raw && Number((raw as any).totalInflow ?? 0) + Number((raw as any).totalOutflow ?? 0) > 0;

  // API mode: direct method from bank transactions
  const apiInflow   = hasData ? Number((raw as any).totalInflow)  : 0;
  const apiOutflow  = hasData ? Number((raw as any).totalOutflow) : 0;
  const apiNet      = apiInflow - apiOutflow;
  const apiOpening  = hasData ? Number((raw as any).openingCash)  : 0;
  const apiClosing  = hasData ? Number((raw as any).closingCash)  : 0;
  const monthly     = hasData ? ((raw as any).monthlyBreakdown ?? []) : [];

  // Fallback mode: indirect method
  const opNet  = OPERATING.reduce((s, x) => s + x.amount, 0);
  const invNet = INVESTING.reduce((s, x) => s + x.amount, 0);
  const finNet = FINANCING.reduce((s, x) => s + x.amount, 0);
  const fbNet  = opNet + invNet + finNet;
  const closingCash = OPENING_CASH + fbNet;

  const fmt: Fmt = (n) => Math.abs(n).toLocaleString(fa ? 'fa-IR' : 'en-US');

  const kpis = hasData
    ? [
        { icon: '📥', val: apiInflow,  label: fa ? 'کل دریافتی' : 'Total Receipts', color: '#10b981' },
        { icon: '📤', val: -apiOutflow, label: fa ? 'کل پرداختی' : 'Total Payments',  color: '#ef4444' },
        { icon: '💰', val: apiNet,     label: fa ? 'جریان خالص' : 'Net Flow',         color: apiNet >= 0 ? '#10b981' : '#ef4444' },
        { icon: '🏦', val: apiClosing, label: fa ? 'موجودی پایان' : 'Closing Cash',   color: '#3b82f6' },
      ]
    : [
        { icon: '🏭', val: opNet,  label: fa ? 'عملیاتی'       : 'Operating',  color: '#10b981' },
        { icon: '🏗️', val: invNet, label: fa ? 'سرمایه‌گذاری' : 'Investing',  color: '#8b5cf6' },
        { icon: '🏦', val: finNet, label: fa ? 'تأمین مالی'   : 'Financing',  color: '#3b82f6' },
        { icon: '💰', val: fbNet,  label: fa ? 'خالص تغییر'   : 'Net Change', color: fbNet >= 0 ? '#10b981' : '#ef4444' },
      ];

  // Chart data
  const months = fa
    ? ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور']
    : ['Jan','Feb','Mar','Apr','May','Jun'];
  const chartIn  = monthly.length > 0
    ? monthly.slice(-6).map((m: any) => Number(m.inflow))
    : [120,145,98,165,142,178].map(x => x * 1_000_000);
  const chartOut = monthly.length > 0
    ? monthly.slice(-6).map((m: any) => Number(m.outflow))
    : [85,110,72,130,115,145].map(x => x * 1_000_000);
  const chartLabels = monthly.length > 0 ? monthly.slice(-6).map((m: any) => m.month) : months;
  const maxVal = Math.max(...chartIn, ...chartOut, 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold">💸 {fa ? 'صورت جریان وجوه نقد' : 'Cash Flow Statement'}</h1>
        <div className="flex gap-2 flex-wrap items-center">
          {!hasData && !isLoading && (
            <span className="text-xs px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
              {fa ? 'روش غیرمستقیم (نمونه)' : 'Indirect method (sample)'}
            </span>
          )}
          {hasData && (
            <span className="text-xs px-2 py-1 rounded-lg bg-green-500/10 text-green-600 border border-green-500/20">
              {fa ? 'روش مستقیم — داده واقعی' : 'Direct method — live data'}
            </span>
          )}
          <div className="flex bg-[hsl(var(--secondary))] rounded-lg p-0.5 gap-0.5 border border-[hsl(var(--border))]">
            {(['statement','chart'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === v ? 'bg-[hsl(var(--primary))] text-white' : 'text-[hsl(var(--muted-foreground))]'}`}>
                {v === 'statement' ? (fa ? '📋 صورت' : '📋 Statement') : (fa ? '📊 نمودار' : '📊 Chart')}
              </button>
            ))}
          </div>
          <button className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)]">
            🖨️ {fa ? 'چاپ' : 'Print'}
          </button>
        </div>
      </div>

      {/* Date range */}
      <div className="flex gap-3 items-center flex-wrap">
        {[{ label: fa ? 'از' : 'From', val: from, set: setFrom }, { label: fa ? 'تا' : 'To', val: to, set: setTo }].map(f => (
          <div key={f.label} className="flex items-center gap-2">
            <label className="text-[hsl(var(--muted-foreground))] text-xs">{f.label}</label>
            <input type="date" value={f.val} onChange={e => f.set(e.target.value)}
              className="px-2 py-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-sm focus:outline-none" />
          </div>
        ))}
        {isLoading && <span className="text-xs text-[hsl(var(--muted-foreground))]">⏳</span>}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-base font-bold" style={{ color: s.color }}>
              {s.val >= 0 ? '+' : ''}{(Math.abs(s.val) / 1e6).toFixed(1)}M
            </div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {view === 'statement' && (
        <>
          {hasData ? (
            /* Direct Method — real bank data */
            <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
              <div className="px-4 py-3 font-bold text-sm bg-[hsl(var(--muted)/0.4)]">
                🏦 {fa ? 'خلاصه جریان نقدی بانکی' : 'Bank Cash Flow Summary'}
              </div>
              {[
                { label: fa ? 'موجودی ابتدای دوره' : 'Opening Cash Balance',   val: apiOpening, color: '#64748b', indent: false },
                { label: fa ? '(+) کل دریافتی'   : '(+) Total Receipts',       val: apiInflow,  color: '#10b981', indent: true  },
                { label: fa ? '(-) کل پرداختی'   : '(-) Total Payments',        val: -apiOutflow,color: '#ef4444', indent: true  },
                { label: fa ? 'خالص تغییر نقدی'  : 'Net Cash Change',           val: apiNet,     color: apiNet >= 0 ? '#10b981' : '#ef4444', indent: false },
                { label: fa ? 'موجودی پایان دوره' : 'Closing Cash Balance',     val: apiClosing, color: '#3b82f6', indent: false },
              ].map((row, i) => (
                <div key={i} className={`flex justify-between px-4 py-2.5 text-sm border-t border-[hsl(var(--border)/0.4)] ${i === 4 ? 'border-t-2 border-[hsl(var(--border))] font-bold bg-[hsl(var(--muted)/0.2)]' : ''} ${row.indent ? 'hover:bg-[hsl(var(--muted)/0.3)]' : ''}`}>
                  <span className={row.indent ? 'ps-4 text-[hsl(var(--muted-foreground))]' : ''}>{row.label}</span>
                  <span style={{ color: row.color }}>{row.val >= 0 ? '' : '('}{fmt(Math.abs(row.val))}{row.val >= 0 ? '' : ')'}</span>
                </div>
              ))}
            </div>
          ) : (
            /* Indirect Method — fallback statement */
            <>
              <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
                <div className="grid px-4 py-2 bg-[hsl(var(--muted)/0.5)] text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide"
                  style={{ gridTemplateColumns: '1fr auto auto' }}>
                  <span>{fa ? 'شرح' : 'Description'}</span>
                  <span className="w-24 text-end text-green-600">{fa ? 'دریافتی' : 'Receipts'}</span>
                  <span className="w-24 text-end ms-8 text-red-500">{fa ? 'پرداختی' : 'Payments'}</span>
                </div>
              </div>
              <Section title={`🏭 ${fa ? 'فعالیت‌های عملیاتی' : 'Operating Activities'}`}    items={OPERATING} total={opNet}  color="#10b981" fa={fa} fmt={fmt} />
              <Section title={`🏗️ ${fa ? 'فعالیت‌های سرمایه‌گذاری' : 'Investing Activities'}`} items={INVESTING} total={invNet} color="#8b5cf6" fa={fa} fmt={fmt} />
              <Section title={`🏦 ${fa ? 'فعالیت‌های تأمین مالی' : 'Financing Activities'}`}  items={FINANCING} total={finNet} color="#3b82f6" fa={fa} fmt={fmt} />
            </>
          )}

          {/* Reconciliation */}
          <div className="rounded-xl border-2 border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.05)] p-4 space-y-2">
            <h3 className="font-bold text-sm">{fa ? '💳 تطبیق موجودی نقد' : '💳 Cash Reconciliation'}</h3>
            {[
              { label: fa ? 'موجودی اول دوره'  : 'Opening Cash Balance', val: hasData ? apiOpening : OPENING_CASH, color: '#64748b' },
              { label: fa ? 'خالص تغییرات نقد' : 'Net Change in Cash',   val: hasData ? apiNet     : fbNet,        color: (hasData ? apiNet : fbNet) >= 0 ? '#10b981' : '#ef4444' },
              { label: fa ? 'موجودی پایان دوره': 'Closing Cash Balance', val: hasData ? apiClosing : closingCash,  color: '#3b82f6' },
            ].map((r, i) => (
              <div key={i} className={`flex justify-between text-sm py-1.5 ${i === 2 ? 'border-t-2 border-[hsl(var(--border))] font-bold' : 'border-t border-[hsl(var(--border)/0.4)]'}`}>
                <span className={i === 2 ? '' : 'text-[hsl(var(--muted-foreground))]'}>{r.label}</span>
                <span style={{ color: r.color }}>{r.val >= 0 ? '' : '('}{fmt(Math.abs(r.val))}{r.val >= 0 ? '' : ')'}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'chart' && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
          <h3 className="font-semibold mb-4">{fa ? 'نمودار جریان نقدی' : 'Cash Flow Chart'}</h3>
          <div className="flex items-end gap-3" style={{ height: '160px' }}>
            {chartLabels.map((m: string, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-0.5 items-end" style={{ height: '120px' }}>
                  <div className="flex-1 rounded-t-sm" style={{ height: ((chartIn[i] ?? 0) / maxVal * 100) + '%', background: '#10b981', opacity: 0.8 }} />
                  <div className="flex-1 rounded-t-sm" style={{ height: ((chartOut[i] ?? 0) / maxVal * 100) + '%', background: '#ef4444', opacity: 0.8 }} />
                </div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))] text-center truncate w-full">{m}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-xs">
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-500" />{fa ? 'دریافتی' : 'Receipts'}</span>
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500" />{fa ? 'پرداختی' : 'Payments'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
