'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

interface Check {
  id: string;
  type: 'recv' | 'issued';
  checkNo: string;
  bankName: string;
  amount: number;
  currency: string;
  dueDate: string;
  payee: string;
  status: 'pending' | 'passed' | 'bounced' | 'transferred';
  notes?: string;
}

export function Checks() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [checks, setChecks] = useState<Check[]>([]);
  const [tab, setTab] = useState<'recv'|'issued'>('recv');
  const [showNew, setShowNew] = useState(false);
  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  const recvChecks = checks.filter(c => c.type === 'recv');
  const issuedChecks = checks.filter(c => c.type === 'issued');
  const displayed = tab === 'recv' ? recvChecks : issuedChecks;

  const recvPending = recvChecks.filter(c => c.status === 'pending').reduce((s,c) => s+c.amount, 0);
  const issuedPending = issuedChecks.filter(c => c.status === 'pending').reduce((s,c) => s+c.amount, 0);

  const statusColors: Record<string,string> = { pending:'#f59e0b', passed:'#10b981', bounced:'#ef4444', transferred:'#3b82f6' };
  const statusLabels: Record<string,string> = {
    pending: fa?'در جریان':'Pending',
    passed: fa?'وصول شده':'Passed',
    bounced: fa?'برگشت خورده':'Bounced',
    transferred: fa?'منتقل شده':'Transferred',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">🧾 {fa ? 'مدیریت چک' : 'Check Management'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{checks.length} {fa ? 'چک' : 'checks'}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
          ➕ {fa ? 'ثبت چک' : 'New Check'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: '📥', val: recvChecks.length, label: fa?'چک دریافتی':'Received Checks', color: '#10b981' },
          { icon: '💵', val: recvPending>0?(recvPending/1000000).toFixed(0)+'M':'0', label: fa?'در انتظار وصول':'Pending Receipt', color: '#f59e0b' },
          { icon: '📤', val: issuedChecks.length, label: fa?'چک صادره':'Issued Checks', color: '#3b82f6' },
          { icon: '💸', val: issuedPending>0?(issuedPending/1000000).toFixed(0)+'M':'0', label: fa?'در انتظار پرداخت':'Pending Payment', color: '#ef4444' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[hsl(var(--border))]">
        {[{ id: 'recv', label: fa?'📥 چک دریافتی':'📥 Received' }, { id: 'issued', label: fa?'📤 چک صادره':'📤 Issued' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]' : 'border-transparent text-[hsl(var(--muted-foreground))]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-3">🧾</div>
          <p className="font-medium">{fa ? 'چکی ثبت نشده' : 'No checks'}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(var(--muted)/0.5)]">
              <tr>
                {[fa?'شماره چک':'Check No.', fa?'بانک':'Bank', fa?'مبلغ':'Amount', fa?'سررسید':'Due Date', fa?'طرف':'Party', fa?'وضعیت':'Status', ''].map(h => (
                  <th key={h} className="text-start px-4 py-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map(c => (
                <tr key={c.id} className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.3)]">
                  <td className="px-4 py-3 font-mono font-bold">{c.checkNo}</td>
                  <td className="px-4 py-3">{c.bankName}</td>
                  <td className="px-4 py-3 font-bold">{c.amount.toLocaleString('fa-IR')} {c.currency}</td>
                  <td className="px-4 py-3">{c.dueDate}</td>
                  <td className="px-4 py-3">{c.payee}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: statusColors[c.status]+'20', color: statusColors[c.status] }}>
                      {statusLabels[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select className="text-xs px-2 py-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
                      <option>{fa?'تغییر وضعیت':'Change Status'}</option>
                      <option value="passed">{fa?'وصول شد':'Passed'}</option>
                      <option value="bounced">{fa?'برگشت خورد':'Bounced'}</option>
                      <option value="transferred">{fa?'منتقل شد':'Transferred'}</option>
                    </select>
                  </td>
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
              <h2 className="font-bold text-lg">🧾 {fa ? 'ثبت چک جدید' : 'New Check'}</h2>
              <button onClick={() => setShowNew(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نوع چک':'Type'}</label>
                  <select className={inp}>
                    <option value="recv">📥 {fa?'دریافتی':'Received'}</option>
                    <option value="issued">📤 {fa?'صادره':'Issued'}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'شماره چک *':'Check No. *'}</label>
                  <input className={inp} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نام بانک':'Bank Name'}</label>
                <input className={inp} placeholder={fa?'بانک ملت، ملی...':'Bank name'} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'مبلغ *':'Amount *'}</label>
                  <input type="number" className={inp} />
                </div>
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'تاریخ سررسید *':'Due Date *'}</label>
                  <input className={inp} placeholder="1403/09/01" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'ذینفع / پرداخت‌کننده':'Payee / Payer'}</label>
                <input className={inp} />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'توضیحات':'Notes'}</label>
                <input className={inp} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">✅ {fa?'ثبت چک':'Save Check'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
