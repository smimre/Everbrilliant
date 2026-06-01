'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useConnections } from '@/hooks/use-trading';
import { useAuthStore } from '@/store/auth.store';

const CONN_COLORS = ['#3b82f6','#8b5cf6','#f59e0b','#10b981','#ef4444','#06b6d4'];

const MOCK_PARTNERS = [
  { id:'acc2', name:'شرکت بازرگانی الفا', country:'Iran', type:'buyer', transactions:12, value:8500000000, status:'active', initials:'ب', color:'#3b82f6' },
  { id:'acc3', name:'مهر پارس', country:'Iran', type:'supplier', transactions:7, value:3200000000, status:'active', initials:'م', color:'#8b5cf6' },
  { id:'acc4', name:'ارمغان لجستیک', country:'Iran', type:'logistics', transactions:20, value:1500000000, status:'active', initials:'ا', color:'#f59e0b' },
  { id:'acc5', name:'تجارت نوین', country:'UAE', type:'buyer', transactions:3, value:900000000, status:'inactive', initials:'ت', color:'#10b981' },
];
function fmt(n: number){ return n>=1e9?(n/1e9).toFixed(1)+'B IRR':n>=1e6?(n/1e6).toFixed(0)+'M IRR':n.toLocaleString(); }
function genCode(){ return 'EB-'+Math.random().toString(36).substring(2,8).toUpperCase(); }

export function Connections() {
  const { lang } = useLocaleStore();
  const { user } = useAuthStore();
  const fa = lang === 'fa';
  const [tab, setTab] = useState<'my'|'invite'>('my');
  const [myCode] = useState(genCode);
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState('');

  const { data: rawConnections } = useConnections();
  const apiConns: any[] = (rawConnections as any)?.data ?? [];
  const partners = apiConns.length > 0
    ? apiConns.map((c: any, i: number) => {
        const p = c.companyAId === user?.companyId ? c.companyB : c.companyA;
        return {
          id: String(p?.id ?? c.id),
          name: p?.name ?? '',
          country: p?.country ?? '',
          type: 'buyer',
          transactions: 0,
          value: 0,
          status: 'active',
          initials: (p?.name ?? '?')[0],
          color: CONN_COLORS[i % CONN_COLORS.length],
        };
      })
    : MOCK_PARTNERS;

  const copyCode = () => { navigator.clipboard.writeText(myCode).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); }); };
  const filtered = partners.filter(p=>!filter||p.name.includes(filter)||p.country.includes(filter));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{fa?'🔗 اتصالات تجاری':'🔗 Business Connections'}</h1>
        <span className="text-sm text-[hsl(var(--muted-foreground))]">{partners.length} {fa?'شریک':'partners'}</span>
      </div>
      <div className="flex gap-2 bg-[hsl(var(--secondary))] rounded-xl p-1">
        {(['my','invite'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab===t?'bg-[hsl(var(--primary))] text-white':'text-[hsl(var(--muted-foreground))]'}`}>
            {t==='my'?(fa?'👥 شرکای من':'👥 My Partners'):(fa?'🔗 دعوت همکار':'🔗 Invite')}
          </button>
        ))}
      </div>
      {tab==='invite'&&(
        <div className="space-y-4">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5">
            <h3 className="font-bold text-sm mb-1">🔑 {fa?'کد دعوت من':'My Invite Code'}</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3">{fa?'این کد را به شریک تجاری خود بدهید.':'Share this code with your partner.'}</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg px-4 py-3 font-mono text-lg font-bold tracking-widest text-center text-[hsl(var(--primary))]">{myCode}</div>
              <button onClick={copyCode} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${copied?'bg-green-500 text-white':'bg-[hsl(var(--primary))] text-white'}`}>{copied?'✅':(fa?'کپی':'Copy')}</button>
            </div>
          </div>
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5">
            <h3 className="font-bold text-sm mb-1">🔗 {fa?'وارد کردن کد دعوت':'Enter Partner Code'}</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3">{fa?'کد دعوت شریک تجاری خود را وارد کنید.':'Enter the invite code from your partner.'}</p>
            <div className="flex gap-2">
              <input value={inviteCode} onChange={e=>setInviteCode(e.target.value.toUpperCase())} placeholder="EB-XXXXXX" className="flex-1 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg px-4 py-2.5 font-mono text-sm outline-none"/>
              <button onClick={()=>{ if(inviteCode.length>=6){ alert(fa?'درخواست اتصال ارسال شد ✅':'Connection request sent ✅'); setInviteCode(''); }}} className="px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-sm font-bold">{fa?'اتصال':'Connect'}</button>
            </div>
          </div>
        </div>
      )}
      {tab==='my'&&(
        <div className="space-y-3">
          <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder={fa?'🔍 جستجو در شرکاء...':'🔍 Search partners...'} className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"/>
          {filtered.map(p=>(
            <div key={p.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{background:p.color}}>{p.initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{p.name}</div>
                  <div className="flex gap-2 text-xs text-[hsl(var(--muted-foreground))] mt-0.5 flex-wrap">
                    <span>🌍 {p.country}</span>
                    <span>{p.type==='buyer'?'🛒':p.type==='supplier'?'🏭':'🚛'} {fa?(p.type==='buyer'?'خریدار':p.type==='supplier'?'تأمین‌کننده':'حمل'):p.type}</span>
                    <span>📊 {p.transactions} {fa?'معامله':'deals'}</span>
                    <span className="text-[hsl(var(--primary))] font-semibold">{fmt(p.value)}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${p.status==='active'?'bg-green-500/10 text-green-500':'bg-gray-500/10 text-gray-400'}`}>{p.status==='active'?(fa?'فعال':'Active'):(fa?'بالقوه':'Inactive')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
