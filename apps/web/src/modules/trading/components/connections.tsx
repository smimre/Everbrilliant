'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useConnections } from '@/hooks/use-trading';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store';

const CONN_COLORS = ['#3b82f6','#8b5cf6','#f59e0b','#10b981','#ef4444','#06b6d4'];

const TYPE_ICON: Record<string, string> = {
  buyer: '🛒', supplier: '🏭', logistics: '🚛',
  partner: '🤝', distributor: '📦', agent: '👤',
};
const TYPE_LABEL: Record<string, { fa: string; en: string }> = {
  buyer:       { fa: 'خریدار',        en: 'Buyer' },
  supplier:    { fa: 'تأمین‌کننده',   en: 'Supplier' },
  logistics:   { fa: 'حمل‌ونقل',     en: 'Logistics' },
  partner:     { fa: 'شریک',          en: 'Partner' },
  distributor: { fa: 'توزیع‌کننده',  en: 'Distributor' },
  agent:       { fa: 'نماینده',       en: 'Agent' },
};

function fmtDate(iso: string) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('fa-IR'); } catch { return iso; }
}

function genCode() { return 'EB-' + Math.random().toString(36).substring(2, 8).toUpperCase(); }

export function Connections() {
  const { lang } = useLocaleStore();
  const { user } = useAuthStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const [tab, setTab] = useState<'my' | 'invite'>('my');
  const [myCode] = useState(genCode);
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState('');

  const { data: rawConnections, isLoading } = useConnections();
  const apiConns: any[] = (rawConnections as any)?.data ?? [];

  const partners = apiConns.map((c: any, i: number) => {
    const isA = c.companyAId === user?.companyId;
    const peer = isA ? c.companyB : c.companyA;
    return {
      id: String(c.id),
      name: peer?.name ?? '',
      country: peer?.country ?? '',
      type: (c.type || 'partner').toLowerCase(),
      status: (c.status || 'active').toLowerCase(),
      connectedAt: c.connectedAt,
      rating: c.rating,
      notes: c.notes,
      initials: (peer?.name ?? '?').slice(0, 2),
      color: CONN_COLORS[i % CONN_COLORS.length],
    };
  });

  const copyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(myCode)
        .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
        .catch(() => {});
    } else {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }
  };

  const filtered = partners.filter(p =>
    !filter || p.name.includes(filter) || p.country.includes(filter) || p.type.includes(filter)
  );

  const activeCount   = partners.filter(p => p.status === 'active').length;
  const inactiveCount = partners.filter(p => p.status !== 'active').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{fa ? '🔗 اتصالات تجاری' : '🔗 Business Connections'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{partners.length} {fa ? 'شریک' : 'partners'}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '🔗', val: partners.length,  label: fa ? 'کل اتصالات' : 'Total',    color: '#3b82f6' },
          { icon: '🟢', val: activeCount,       label: fa ? 'فعال' : 'Active',          color: '#10b981' },
          { icon: '⏸️', val: inactiveCount,    label: fa ? 'غیرفعال' : 'Inactive',     color: '#94a3b8' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-[hsl(var(--secondary))] rounded-xl p-1">
        {(['my', 'invite'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === t ? 'bg-[hsl(var(--primary))] text-white' : 'text-[hsl(var(--muted-foreground))]'}`}>
            {t === 'my' ? (fa ? '👥 شرکای من' : '👥 My Partners') : (fa ? '🔗 دعوت همکار' : '🔗 Invite')}
          </button>
        ))}
      </div>

      {/* Invite tab */}
      {tab === 'invite' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5">
            <h3 className="font-bold text-sm mb-1">🔑 {fa ? 'کد دعوت من' : 'My Invite Code'}</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3">{fa ? 'این کد را به شریک تجاری خود بدهید.' : 'Share this code with your partner.'}</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg px-4 py-3 font-mono text-lg font-bold tracking-widest text-center text-[hsl(var(--primary))]">{myCode}</div>
              <button onClick={copyCode} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-[hsl(var(--primary))] text-white'}`}>
                {copied ? '✅' : (fa ? 'کپی' : 'Copy')}
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5">
            <h3 className="font-bold text-sm mb-1">🔗 {fa ? 'وارد کردن کد دعوت' : 'Enter Partner Code'}</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3">{fa ? 'کد دعوت شریک تجاری خود را وارد کنید.' : 'Enter the invite code from your partner.'}</p>
            <div className="flex gap-2">
              <input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder="EB-XXXXXX"
                className="flex-1 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg px-4 py-2.5 font-mono text-sm outline-none" />
              <button
                onClick={() => {
                  if (inviteCode.length >= 6) {
                    toast('success', fa ? 'درخواست اتصال ارسال شد' : 'Connection request sent');
                    setInviteCode('');
                  }
                }}
                className="px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-sm font-bold">
                {fa ? 'اتصال' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partners tab */}
      {tab === 'my' && (
        <div className="space-y-3">
          <input value={filter} onChange={e => setFilter(e.target.value)}
            placeholder={fa ? '🔍 جستجو در شرکاء...' : '🔍 Search partners...'}
            className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none" />

          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-[hsl(var(--muted)/0.5)] animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
              <div className="text-4xl mb-3">🔗</div>
              <p className="font-medium">{fa ? 'اتصالی یافت نشد' : 'No connections found'}</p>
              <button onClick={() => setTab('invite')} className="mt-4 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm">
                {fa ? '+ دعوت شریک جدید' : '+ Invite a partner'}
              </button>
            </div>
          ) : (
            filtered.map(p => {
              const typeIcon  = TYPE_ICON[p.type]  ?? '🤝';
              const typeLabel = TYPE_LABEL[p.type]  ?? { fa: p.type, en: p.type };
              return (
                <div key={p.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm" style={{ background: p.color }}>
                      {p.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm">{p.name}</div>
                      <div className="flex gap-3 text-xs text-[hsl(var(--muted-foreground))] mt-0.5 flex-wrap">
                        {p.country && <span>🌍 {p.country}</span>}
                        <span>{typeIcon} {fa ? typeLabel.fa : typeLabel.en}</span>
                        {p.connectedAt && <span>📅 {fmtDate(p.connectedAt)}</span>}
                        {p.rating && <span>⭐ {p.rating}</span>}
                      </div>
                      {p.notes && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 line-clamp-1">{p.notes}</p>}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${p.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-400'}`}>
                      {p.status === 'active' ? (fa ? 'فعال' : 'Active') : (fa ? 'غیرفعال' : 'Inactive')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
