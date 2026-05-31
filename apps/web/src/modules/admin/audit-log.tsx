'use client';
import { useState, useMemo } from 'react';
import { useLocaleStore } from '@/store/locale.store';

interface AuditEntry {
  id: string; ts: string; action: string; detail: string;
  name: string; entityId: string; acc: string;
}

const ACTION_META: Record<string,{label:string;labelEn:string;icon:string;color:string}> = {
  login:            { label:'ورود',              labelEn:'Login',             icon:'🔑', color:'#10b981' },
  logout:           { label:'خروج',              labelEn:'Logout',            icon:'🚪', color:'#64748b' },
  password_changed: { label:'تغییر رمز',         labelEn:'Password Changed',  icon:'🔐', color:'#f59e0b' },
  request_created:  { label:'درخواست ایجاد شد',  labelEn:'Request Created',   icon:'📋', color:'#3b82f6' },
  request_updated:  { label:'درخواست بروزرسانی', labelEn:'Request Updated',   icon:'✏️', color:'#8b5cf6' },
  contract_signed:  { label:'قرارداد امضا شد',  labelEn:'Contract Signed',   icon:'📄', color:'#10b981' },
  invoice_paid:     { label:'فاکتور پرداخت شد', labelEn:'Invoice Paid',      icon:'💰', color:'#10b981' },
  invoice_created:  { label:'فاکتور ایجاد شد',  labelEn:'Invoice Created',   icon:'🧾', color:'#3b82f6' },
  shipment_updated: { label:'محموله بروزرسانی',  labelEn:'Shipment Updated',  icon:'🚛', color:'#06b6d4' },
  settings_changed: { label:'تنظیمات تغییر کرد',labelEn:'Settings Changed',  icon:'⚙️', color:'#f59e0b' },
  user_invited:     { label:'کاربر دعوت شد',    labelEn:'User Invited',      icon:'👤', color:'#8b5cf6' },
  api_key_created:  { label:'API Key ایجاد شد', labelEn:'API Key Created',   icon:'🔌', color:'#06b6d4' },
};

const MOCK_LOGS: AuditEntry[] = [
  { id:'L-001', ts:'۱۴۰۳/۰۴/۱۵ — ۰۹:۱۲', action:'login',            detail:'ورود موفق از IP 185.12.34.56', name:'احمد رضایی',  entityId:'u1',       acc:'a1' },
  { id:'L-002', ts:'۱۴۰۳/۰۴/۱۵ — ۰۹:۱۵', action:'request_created',  detail:'درخواست خرید گندم ۵۰۰ تن',    name:'احمد رضایی',  entityId:'REQ-009',  acc:'a1' },
  { id:'L-003', ts:'۱۴۰۳/۰۴/۱۵ — ۱۰:۳۰', action:'invoice_created',  detail:'فاکتور SI-003 ایجاد شد',       name:'سارا احمدی',  entityId:'SI-003',   acc:'a1' },
  { id:'L-004', ts:'۱۴۰۳/۰۴/۱۴ — ۱۶:۴۵', action:'contract_signed',  detail:'قرارداد الفا امضا شد',          name:'محمد کریمی',  entityId:'CNT-001',  acc:'a1' },
  { id:'L-005', ts:'۱۴۰۳/۰۴/۱۴ — ۱۵:۲۰', action:'shipment_updated', detail:'وضعیت EB-TRK-10023 به customs تغییر یافت', name:'علی رضایی', entityId:'SHP-001', acc:'a1' },
  { id:'L-006', ts:'۱۴۰۳/۰۴/۱۴ — ۱۴:۰۰', action:'login',            detail:'ورود موفق از IP 188.22.11.33', name:'سارا احمدی',  entityId:'u2',       acc:'a1' },
  { id:'L-007', ts:'۱۴۰۳/۰۴/۱۳ — ۱۱:۳۵', action:'password_changed', detail:'رمز عبور تغییر یافت',           name:'محمد کریمی',  entityId:'u3',       acc:'a1' },
  { id:'L-008', ts:'۱۴۰۳/۰۴/۱۳ — ۱۰:۰۵', action:'settings_changed', detail:'تنظیمات اعلان‌ها بروزرسانی شد', name:'احمد رضایی',  entityId:'settings', acc:'a1' },
  { id:'L-009', ts:'۱۴۰۳/۰۴/۱۲ — ۱۷:۵۰', action:'invoice_paid',     detail:'فاکتور SI-002 پرداخت شد',       name:'علی رضایی',   entityId:'SI-002',   acc:'a1' },
  { id:'L-010', ts:'۱۴۰۳/۰۴/۱۲ — ۱۶:۱۰', action:'request_updated',  detail:'وضعیت REQ-008 به approved تغییر یافت', name:'سارا احمدی', entityId:'REQ-008', acc:'a1' },
  { id:'L-011', ts:'۱۴۰۳/۰۴/۱۲ — ۰۸:۳۰', action:'login',            detail:'ورود موفق از IP 192.168.1.5',  name:'محمد کریمی',  entityId:'u3',       acc:'a1' },
  { id:'L-012', ts:'۱۴۰۳/۰۴/۱۱ — ۱۴:۲۵', action:'user_invited',     detail:'کاربر جدید ali@example.com دعوت شد', name:'احمد رضایی', entityId:'u5',   acc:'a1' },
  { id:'L-013', ts:'۱۴۰۳/۰۴/۱۱ — ۱۲:۰۰', action:'api_key_created',  detail:'API Key جدید "ERP Connection" ایجاد شد', name:'احمد رضایی', entityId:'AK-001', acc:'a1' },
  { id:'L-014', ts:'۱۴۰۳/۰۴/۱۰ — ۱۱:۴۵', action:'contract_signed',  detail:'قرارداد مهر پارس امضا شد',     name:'احمد رضایی',  entityId:'CNT-002',  acc:'a1' },
  { id:'L-015', ts:'۱۴۰۳/۰۴/۱۰ — ۰۹:۰۰', action:'login',            detail:'ورود موفق از IP 5.62.44.12',   name:'علی رضایی',   entityId:'u4',       acc:'a1' },
];

const PAGE_SIZE = 10;

export function AuditLogPage() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MOCK_LOGS.filter(l => {
      const matchSearch = !q || l.detail.toLowerCase().includes(q) || l.name.toLowerCase().includes(q) || l.action.includes(q);
      const matchAction = !filterAction || l.action === filterAction;
      return matchSearch && matchAction;
    });
  }, [search, filterAction]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const stats = {
    total:   MOCK_LOGS.length,
    logins:  MOCK_LOGS.filter(l=>l.action==='login').length,
    changes: MOCK_LOGS.filter(l=>l.action.includes('created')||l.action.includes('updated')||l.action.includes('signed')).length,
    pwdChg:  MOCK_LOGS.filter(l=>l.action==='password_changed').length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">📋 {fa?'تاریخچه رویدادها':'Audit Log'}</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{fa?'تمام فعالیت‌های سیستم به صورت کامل ثبت می‌شود':'All system activities are fully recorded'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon:'📋', val:stats.total,   label:fa?'کل رویدادها':'Total Events', color:'#3b82f6' },
          { icon:'🔑', val:stats.logins,  label:fa?'ورودها':'Logins',            color:'#10b981' },
          { icon:'✏️', val:stats.changes, label:fa?'تغییرات':'Changes',          color:'#f59e0b' },
          { icon:'🔐', val:stats.pwdChg,  label:fa?'تغییر رمز':'Pwd Changes',   color:'#8b5cf6' },
        ].map((s,i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold" style={{color:s.color}}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
          placeholder={fa?'🔍 جستجو...':'🔍 Search...'}
          className="flex-1 min-w-[180px] px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-sm focus:outline-none"/>
        <select value={filterAction} onChange={e=>{setFilterAction(e.target.value);setPage(1);}}
          className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-sm focus:outline-none">
          <option value="">{fa?'همه رویدادها':'All Events'}</option>
          {Object.entries(ACTION_META).map(([k,v])=>(<option key={k} value={k}>{fa?v.label:v.labelEn}</option>))}
        </select>
        <button onClick={()=>{ const data = JSON.stringify(filtered,null,2); const b=new Blob([data],{type:'application/json'}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download='audit-log.json'; a.click(); }}
          className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-sm hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
          📥 {fa?'خروجی':'Export'}
        </button>
      </div>

      {/* Log list */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">
        {paged.length === 0 ? (
          <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm">{fa?'رویدادی یافت نشد':'No events found'}</p>
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {paged.map(l => {
              const meta = ACTION_META[l.action] || { label:l.action, labelEn:l.action, icon:'📌', color:'#64748b' };
              return (
                <div key={l.id} className="flex gap-3 p-4 items-start hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
                    style={{background:meta.color+'18', border:`1px solid ${meta.color}30`}}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-bold text-sm" style={{color:meta.color}}>
                        {fa ? meta.label : meta.labelEn}
                      </span>
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))] shrink-0">{l.ts}</span>
                    </div>
                    <div className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">{l.detail}</div>
                    <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1 flex gap-2">
                      <span>👤 {l.name}</span>
                      {l.entityId && <span>🆔 {l.entityId}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[hsl(var(--muted-foreground))]">
            {fa?`${filtered.length} رویداد — صفحه ${page} از ${totalPages}`:`${filtered.length} events — page ${page} of ${totalPages}`}
          </span>
          <div className="flex gap-2">
            <button disabled={page===1} onClick={()=>setPage(p=>p-1)}
              className="px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] disabled:opacity-40 hover:bg-[hsl(var(--muted)/0.5)]">
              {fa?'قبلی':'Prev'}
            </button>
            <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}
              className="px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] disabled:opacity-40 hover:bg-[hsl(var(--muted)/0.5)]">
              {fa?'بعدی':'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
