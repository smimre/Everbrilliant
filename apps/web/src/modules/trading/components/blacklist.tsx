'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useBlacklist, useAddToBlacklist, useAppealBlacklist, useRemoveFromBlacklist } from '@/hooks/use-trading';
import { useUIStore } from '@/store';

const SEV_CFG: Record<string, { label: string; labelFa: string; color: string; bg: string }> = {
  HIGH:   { label: 'High',   labelFa: 'بالا',   color: '#ef4444', bg: '#ef444415' },
  MEDIUM: { label: 'Medium', labelFa: 'متوسط', color: '#f59e0b', bg: '#f59e0b15' },
  LOW:    { label: 'Low',    labelFa: 'پایین',  color: '#3b82f6', bg: '#3b82f615' },
};

const STA_CFG: Record<string, { label: string; labelFa: string; color: string }> = {
  ACTIVE:    { label: 'Active',    labelFa: 'فعال',            color: '#ef4444' },
  EXPIRED:   { label: 'Expired',   labelFa: 'منقضی',           color: '#64748b' },
  APPEALING: { label: 'Appealing', labelFa: 'در حال اعتراض',  color: '#f59e0b' },
};

const inp = 'w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none';

export function TenderBlacklist() {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';

  const [search, setSearch]       = useState('');
  const [sevFilter, setSevFilter] = useState('all');
  const [showAdd, setShowAdd]     = useState(false);
  const [removeTarget, setRemoveTarget] = useState<any>(null);
  const [form, setForm] = useState({ companyName: '', reason: '', reasonFa: '', tenderId: '', tenderTitle: '', severity: 'MEDIUM' });

  const { data: apiData, isLoading } = useBlacklist({
    search: search || undefined,
    severity: sevFilter !== 'all' ? sevFilter : undefined,
  });
  const addMutation    = useAddToBlacklist();
  const appealMutation = useAppealBlacklist();
  const removeMutation = useRemoveFromBlacklist();

  const entries: any[] = (apiData as any)?.data ?? [];

  const filtered = entries.filter(e => {
    const sev = (e.severity || '').toUpperCase();
    const matchSearch = !search ||
      e.companyName.toLowerCase().includes(search.toLowerCase()) ||
      (e.reason || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.reasonFa || '').toLowerCase().includes(search.toLowerCase());
    const matchSev = sevFilter === 'all' || sev === sevFilter;
    return matchSearch && matchSev;
  });

  const active    = entries.filter(e => (e.status || '').toUpperCase() === 'ACTIVE').length;
  const appealing = entries.filter(e => (e.status || '').toUpperCase() === 'APPEALING').length;
  const expired   = entries.filter(e => (e.status || '').toUpperCase() === 'EXPIRED').length;

  function handleAdd() {
    if (!form.companyName || !form.reason) {
      toast('error', fa ? 'نام شرکت و دلیل الزامی است' : 'Company name and reason required');
      return;
    }
    addMutation.mutate(
      {
        companyName: form.companyName,
        reason: form.reason,
        reasonFa: form.reasonFa || undefined,
        severity: form.severity,
        tenderId: form.tenderId || null,
        tenderTitle: form.tenderTitle || null,
      },
      {
        onSuccess: () => {
          toast('success', fa ? 'شرکت به لیست سیاه اضافه شد' : 'Company added to blacklist');
          setForm({ companyName: '', reason: '', reasonFa: '', tenderId: '', tenderTitle: '', severity: 'MEDIUM' });
          setShowAdd(false);
        },
        onError: (err: any) => toast('error', err?.message || (fa ? 'خطا در ثبت' : 'Failed to add')),
      }
    );
  }

  function handleAppeal(id: number) {
    appealMutation.mutate(id, {
      onSuccess: () => toast('success', fa ? 'درخواست اعتراض ثبت شد' : 'Appeal submitted'),
      onError: (err: any) => toast('error', err?.message || (fa ? 'خطا' : 'Failed')),
    });
  }

  function handleRemove(id: number) {
    removeMutation.mutate(id, {
      onSuccess: () => { toast('success', fa ? 'از لیست سیاه حذف شد' : 'Removed from blacklist'); setRemoveTarget(null); },
      onError: (err: any) => toast('error', err?.message || (fa ? 'خطا در حذف' : 'Failed to remove')),
    });
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
          { icon: '🚫', val: active,    label: fa ? 'مسدود فعال' : 'Active Blocks',  color: '#ef4444' },
          { icon: '⚖️', val: appealing, label: fa ? 'در اعتراض' : 'Under Appeal',    color: '#f59e0b' },
          { icon: '✅', val: expired,   label: fa ? 'منقضی شده' : 'Expired',         color: '#64748b' },
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
          {(['all', 'HIGH', 'MEDIUM', 'LOW'] as const).map(s => (
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
              {[fa ? 'شناسه' : 'ID', fa ? 'نام شرکت' : 'Company', fa ? 'دلیل' : 'Reason', fa ? 'شدت' : 'Severity', fa ? 'وضعیت' : 'Status', fa ? 'مزایده' : 'Tender', fa ? 'تاریخ' : 'Date', fa ? 'اقدام' : 'Action'].map(h => (
                <th key={h} className="text-start px-3 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-[hsl(var(--muted-foreground))] text-sm">
                {fa ? 'در حال بارگذاری...' : 'Loading...'}
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8}>
                <div className="text-center py-10 text-[hsl(var(--muted-foreground))]">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-sm">{fa ? 'هیچ شرکتی در لیست سیاه نیست' : 'No companies on the blacklist'}</p>
                </div>
              </td></tr>
            ) : filtered.map(e => {
              const sev = SEV_CFG[(e.severity || '').toUpperCase()] || SEV_CFG.MEDIUM;
              const sta = STA_CFG[(e.status || '').toUpperCase()]   || STA_CFG.ACTIVE;
              const addedAt = e.createdAt ? new Date(e.createdAt).toLocaleDateString('fa-IR') : '—';
              return (
                <tr key={e.id} className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.2)]">
                  <td className="px-3 py-3 font-mono text-xs text-[hsl(var(--primary))]">{e.id}</td>
                  <td className="px-3 py-3">
                    <div className="font-semibold text-sm">{e.companyName}</div>
                    {e.companyCode && <div className="text-xs text-[hsl(var(--muted-foreground))]">{e.companyCode}</div>}
                    {e.addedBy?.name && <div className="text-xs text-[hsl(var(--muted-foreground))]">👤 {e.addedBy.name}</div>}
                  </td>
                  <td className="px-3 py-3 max-w-[200px]">
                    <p className="text-xs leading-snug">{fa ? (e.reasonFa || e.reason) : e.reason}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: sev.bg, color: sev.color }}>
                      {fa ? sev.labelFa : sev.label}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs font-medium" style={{ color: sta.color }}>
                      {fa ? sta.labelFa : sta.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                    {e.tenderTitle ? <span className="truncate block max-w-[120px]">{e.tenderTitle}</span> : '—'}
                  </td>
                  <td className="px-3 py-3 text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">{addedAt}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      {(e.status || '').toUpperCase() === 'ACTIVE' && (
                        <button
                          onClick={() => handleAppeal(Number(e.id))}
                          disabled={appealMutation.isPending}
                          className="text-xs px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 disabled:opacity-50">
                          {fa ? 'اعتراض' : 'Appeal'}
                        </button>
                      )}
                      <button
                        onClick={() => setRemoveTarget(e)}
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
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'نام شرکت *' : 'Company Name *'}</label>
                <input value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} className={inp} />
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'دلیل (فارسی) *' : 'Reason *'}</label>
                <textarea
                  value={fa ? form.reasonFa : form.reason}
                  onChange={e => setForm(f => fa ? { ...f, reasonFa: e.target.value } : { ...f, reason: e.target.value })}
                  rows={2} className={inp + ' resize-none'} />
              </div>
              {fa && (
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">Reason (English) *</label>
                  <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className={inp} />
                </div>
              )}
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'شدت' : 'Severity'}</label>
                <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} className={inp}>
                  <option value="HIGH">{fa ? 'بالا — کلاهبرداری/جعل' : 'High — Fraud/Forgery'}</option>
                  <option value="MEDIUM">{fa ? 'متوسط — نقض قرارداد' : 'Medium — Contract breach'}</option>
                  <option value="LOW">{fa ? 'پایین — تأخیر مکرر' : 'Low — Repeated delays'}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'شناسه مزایده' : 'Tender ID'}</label>
                  <input value={form.tenderId} onChange={e => setForm(f => ({ ...f, tenderId: e.target.value }))} className={inp} placeholder="TND-001" />
                </div>
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'عنوان مزایده' : 'Tender Title'}</label>
                  <input value={form.tenderTitle} onChange={e => setForm(f => ({ ...f, tenderTitle: e.target.value }))} className={inp} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa ? 'انصراف' : 'Cancel'}</button>
              <button onClick={handleAdd} disabled={addMutation.isPending}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium disabled:opacity-50">
                {addMutation.isPending ? (fa ? 'در حال ثبت...' : 'Saving...') : `🚫 ${fa ? 'ثبت در لیست' : 'Add to List'}`}
              </button>
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
              <button onClick={() => handleRemove(Number(removeTarget.id))} disabled={removeMutation.isPending}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium disabled:opacity-50">
                {removeMutation.isPending ? '...' : (fa ? 'حذف' : 'Remove')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
