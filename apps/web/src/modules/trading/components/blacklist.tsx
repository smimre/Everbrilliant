'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';

interface BlacklistEntry {
  id: string;
  companyName: string;
  companyId: string;
  reason: string;
  reasonFa: string;
  addedBy: string;
  addedAt: string;
  tenderTitle?: string;
  tenderId?: string;
  severity: 'low' | 'medium' | 'high';
  status: 'active' | 'expired' | 'appealing';
}

const MOCK_BLACKLIST: BlacklistEntry[] = [
  { id:'BL-001', companyName:'شرکت ناشناس تجارت', companyId:'ACC-012', reason:'Fraud — forged quality certificate', reasonFa:'کلاهبرداری — گواهی کیفیت جعلی', addedBy:'محمد کریمی', addedAt:'1403/01/15', tenderTitle:'واردات گندم ۱۰۰۰ تن', tenderId:'TND-001', severity:'high', status:'active' },
  { id:'BL-002', companyName:'پارس ترید (معلق)', companyId:'ACC-034', reason:'Non-payment of agreed advance', reasonFa:'عدم پرداخت پیش‌پرداخت توافق شده', addedBy:'علی رضایی', addedAt:'1403/02/05', tenderTitle:'خرید روغن پالم', tenderId:'TND-003', severity:'medium', status:'appealing' },
  { id:'BL-003', companyName:'آلفا ایمپورت',        companyId:'ACC-056', reason:'Repeated delivery delays > 60 days', reasonFa:'تأخیر مکرر تحویل بیش از ۶۰ روز', addedBy:'سارا احمدی', addedAt:'1402/11/20', severity:'low', status:'active' },
  { id:'BL-004', companyName:'گروه بازرگانی ایکس', companyId:'ACC-078', reason:'Contract breach — quality below spec', reasonFa:'نقض قرارداد — کیفیت پایین‌تر از مشخصات', addedBy:'محمد کریمی', addedAt:'1402/09/10', tenderTitle:'تجهیزات صنعتی', tenderId:'TND-005', severity:'high', status:'expired' },
];

const SEV_CFG: Record<string, { label: string; labelFa: string; color: string; bg: string }> = {
  high:   { label:'High',   labelFa:'بالا',    color:'#ef4444', bg:'#ef444415' },
  medium: { label:'Medium', labelFa:'متوسط',  color:'#f59e0b', bg:'#f59e0b15' },
  low:    { label:'Low',    labelFa:'پایین',   color:'#3b82f6', bg:'#3b82f615' },
};

const STA_CFG: Record<string, { label: string; labelFa: string; color: string }> = {
  active:    { label:'Active',    labelFa:'فعال',         color:'#ef4444' },
  expired:   { label:'Expired',   labelFa:'منقضی',        color:'#64748b' },
  appealing: { label:'Appealing', labelFa:'در حال اعتراض', color:'#f59e0b' },
};

const inp = 'w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none';

export function TenderBlacklist() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [entries, setEntries] = useState<BlacklistEntry[]>(MOCK_BLACKLIST);
  const [search, setSearch] = useState('');
  const [sevFilter, setSevFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<BlacklistEntry | null>(null);
  const [form, setForm] = useState({ companyName:'', reason:'', reasonFa:'', tenderId:'', tenderTitle:'', severity:'medium' as BlacklistEntry['severity'] });

  const filtered = entries.filter(e => {
    const matchSearch = !search || e.companyName.includes(search) || e.companyId.toLowerCase().includes(search.toLowerCase()) || (fa ? e.reasonFa : e.reason).toLowerCase().includes(search.toLowerCase());
    const matchSev    = sevFilter === 'all' || e.severity === sevFilter;
    return matchSearch && matchSev;
  });

  const active    = entries.filter(e => e.status === 'active').length;
  const appealing = entries.filter(e => e.status === 'appealing').length;
  const expired   = entries.filter(e => e.status === 'expired').length;

  function addEntry() {
    if (!form.companyName || !form.reason) return;
    setEntries(prev => [{
      id: 'BL-' + String(prev.length + 1).padStart(3, '0'),
      companyName: form.companyName, companyId: 'ACC-' + Math.floor(Math.random() * 900 + 100),
      reason: form.reason, reasonFa: form.reasonFa || form.reason,
      addedBy: 'کاربر جاری', addedAt: new Date().toLocaleDateString('fa-IR'),
      tenderId: form.tenderId, tenderTitle: form.tenderTitle,
      severity: form.severity, status: 'active',
    }, ...prev]);
    setForm({ companyName:'', reason:'', reasonFa:'', tenderId:'', tenderTitle:'', severity:'medium' });
    setShowAdd(false);
  }

  function removeEntry(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id));
    setRemoveTarget(null);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold">🚫 {fa ? 'لیست سیاه — شرکت‌های مسدود' : 'Blacklist — Blocked Companies'}</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            {fa ? 'شرکت‌هایی که از شرکت در مزایده‌ها محروم شده‌اند' : 'Companies barred from participating in tenders'}
          </p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
          ➕ {fa ? 'افزودن به لیست سیاه' : 'Add to Blacklist'}
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon:'🚫', val:active,    label:fa?'مسدود فعال':'Active Blocks',  color:'#ef4444' },
          { icon:'⚖️', val:appealing, label:fa?'در اعتراض':'Under Appeal',    color:'#f59e0b' },
          { icon:'✅', val:expired,   label:fa?'منقضی شده':'Expired',         color:'#64748b' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={fa ? '🔍 جستجو در نام شرکت یا دلیل...' : '🔍 Search company or reason...'}
          className="flex-1 min-w-48 px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-sm focus:outline-none" />
        <div className="flex gap-1 bg-[hsl(var(--secondary))] rounded-xl p-1 border border-[hsl(var(--border))]">
          {(['all', 'high', 'medium', 'low'] as const).map(s => (
            <button key={s} onClick={() => setSevFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sevFilter === s ? 'bg-[hsl(var(--primary))] text-white' : 'text-[hsl(var(--muted-foreground))]'}`}>
              {s === 'all' ? (fa ? 'همه' : 'All') : (fa ? SEV_CFG[s].labelFa : SEV_CFG[s].label)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--muted)/0.5)]">
            <tr>
              {[fa?'شناسه':'ID', fa?'نام شرکت':'Company', fa?'دلیل':'Reason', fa?'شدت':'Severity', fa?'وضعیت':'Status', fa?'مزایده':'Tender', fa?'تاریخ':'Date', fa?'اقدام':'Action'].map(h => (
                <th key={h} className="text-start px-3 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => {
              const sev = SEV_CFG[e.severity];
              const sta = STA_CFG[e.status];
              return (
                <tr key={e.id} className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.2)]">
                  <td className="px-3 py-3 font-mono text-xs text-[hsl(var(--primary))]">{e.id}</td>
                  <td className="px-3 py-3">
                    <div className="font-semibold text-sm">{e.companyName}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{e.companyId}</div>
                  </td>
                  <td className="px-3 py-3 max-w-[200px]">
                    <p className="text-xs leading-snug">{fa ? e.reasonFa : e.reason}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: sev.bg, color: sev.color }}>
                      {fa ? sev.labelFa : sev.label}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs font-medium" style={{ color: sta.color }}>
                      {fa ? sta.labelFa : sta.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                    {e.tenderTitle ? (
                      <span className="truncate block max-w-[120px]">{e.tenderTitle}</span>
                    ) : '—'}
                  </td>
                  <td className="px-3 py-3 text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">{e.addedAt}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      {e.status === 'active' && (
                        <button onClick={() => setEntries(prev => prev.map(x => x.id === e.id ? {...x, status:'appealing'} : x))}
                          className="text-xs px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20">
                          {fa ? 'اعتراض' : 'Appeal'}
                        </button>
                      )}
                      <button onClick={() => setRemoveTarget(e)}
                        className="text-xs px-2 py-1 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20">
                        {fa ? 'حذف' : 'Remove'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-[hsl(var(--muted-foreground))]">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-sm">{fa ? 'هیچ شرکتی در لیست سیاه نیست' : 'No companies on the blacklist'}</p>
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">🚫 {fa ? 'افزودن به لیست سیاه' : 'Add to Blacklist'}</h2>
              <button onClick={() => setShowAdd(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'نام شرکت *' : 'Company Name *'}</label>
                <input value={form.companyName} onChange={e => setForm(f => ({...f, companyName: e.target.value}))} className={inp} /></div>
              <div><label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'دلیل (فارسی) *' : 'Reason *'}</label>
                <textarea value={fa ? form.reasonFa : form.reason}
                  onChange={e => setForm(f => fa ? {...f, reasonFa: e.target.value} : {...f, reason: e.target.value})}
                  rows={2} className={inp + ' resize-none'} /></div>
              {fa && <div><label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">Reason (English)</label>
                <input value={form.reason} onChange={e => setForm(f => ({...f, reason: e.target.value}))} className={inp} /></div>}
              <div><label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'شدت' : 'Severity'}</label>
                <select value={form.severity} onChange={e => setForm(f => ({...f, severity: e.target.value as any}))} className={inp}>
                  <option value="high">{fa ? 'بالا — کلاهبرداری/جعل' : 'High — Fraud/Forgery'}</option>
                  <option value="medium">{fa ? 'متوسط — نقض قرارداد' : 'Medium — Contract breach'}</option>
                  <option value="low">{fa ? 'پایین — تأخیر مکرر' : 'Low — Repeated delays'}</option>
                </select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'شناسه مزایده' : 'Tender ID'}</label>
                  <input value={form.tenderId} onChange={e => setForm(f => ({...f, tenderId: e.target.value}))} className={inp} placeholder="TND-001" /></div>
                <div><label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'عنوان مزایده' : 'Tender Title'}</label>
                  <input value={form.tenderTitle} onChange={e => setForm(f => ({...f, tenderTitle: e.target.value}))} className={inp} /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
              <button onClick={addEntry} className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium">🚫 {fa ? 'ثبت در لیست' : 'Add to List'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Remove confirm */}
      {removeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-sm p-6 shadow-2xl">
            <h2 className="font-bold text-lg mb-2">⚠️ {fa ? 'تأیید حذف' : 'Confirm Removal'}</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
              {fa ? `آیا می‌خواهید ${removeTarget.companyName} را از لیست سیاه حذف کنید؟` : `Remove ${removeTarget.companyName} from the blacklist?`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRemoveTarget(null)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
              <button onClick={() => removeEntry(removeTarget.id)} className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium">{fa ? 'حذف' : 'Remove'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
