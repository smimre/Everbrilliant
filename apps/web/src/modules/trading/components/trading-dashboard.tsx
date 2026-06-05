'use client';
import { useLocaleStore } from '@/store/locale.store';
import { useRequests, useContracts, useTenders, useConnections } from '@/hooks/use-trading';

interface Props { onNavigate: (view: any) => void; }

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', quoted: '#3b82f6', approved: '#10b981',
  paid: '#06b6d4', issued: '#8b5cf6', completed: '#10b981', rejected: '#ef4444',
};
const STATUS_LABELS_FA: Record<string, string> = {
  pending: 'در انتظار', quoted: 'قیمت داده', approved: 'تایید شده',
  paid: 'پرداخت شده', issued: 'صادر شده', completed: 'تکمیل', rejected: 'رد شده',
};

export function TradingDashboard({ onNavigate }: Props) {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const { data: rawReqs } = useRequests();
  const { data: rawContracts } = useContracts();
  const { data: rawTenders } = useTenders();
  const { data: rawConns } = useConnections();

  const requests: any[] = Array.isArray(rawReqs) ? rawReqs : (rawReqs as any)?.data ?? [];
  const contracts: any[] = Array.isArray(rawContracts) ? rawContracts : (rawContracts as any)?.data ?? [];
  const tenders: any[] = Array.isArray(rawTenders) ? rawTenders : (rawTenders as any)?.data ?? [];
  const connections: any[] = Array.isArray(rawConns) ? rawConns : (rawConns as any)?.data ?? [];

  const pending = requests.filter((r) => r.status === 'pending');
  const quoted = requests.filter((r) => r.status === 'quoted');
  const approved = requests.filter((r) => ['approved','paid','completed'].includes(r.status));
  const rejected = requests.filter((r) => r.status === 'rejected');

  const unsignedContracts = contracts.filter((c) => c.status === 'draft');
  const activeContracts = contracts.filter((c) => c.status === 'active' || c.status === 'signed');

  const openTenders = tenders.filter((t) => t.status === 'open');
  const totalTradeValue = requests.reduce((s: number, r: any) => s + (r.amountIRR || 0), 0);

  const quickStats = [
    { icon: '📋', val: pending.length, label: fa ? 'درخواست در انتظار' : 'Pending Requests', color: '#f59e0b', view: 'my-requests' },
    { icon: '✍️', val: unsignedContracts.length, label: fa ? 'قرارداد بی‌امضا' : 'Unsigned Contracts', color: unsignedContracts.length > 0 ? '#ef4444' : '#10b981', view: 'my-contracts' },
    { icon: '💰', val: 0, label: fa ? 'فاکتور معوق' : 'Overdue Invoices', color: '#ef4444', view: 'reports' },
    { icon: '🔔', val: quoted.length, label: fa ? 'پیگیری CRM' : 'CRM Follow-ups', color: '#3b82f6', view: 'crm' },
    { icon: '✉️', val: 0, label: fa ? 'پیام جدید' : 'New Messages', color: '#8b5cf6', view: 'connections' },
  ];

  const mainStats = [
    { icon: '📋', val: requests.length, label: fa ? 'کل درخواست‌ها' : 'Total Requests', sub: `${pending.length} ${fa ? 'در انتظار' : 'pending'}`, color: '#3b82f6' },
    { icon: '💰', val: totalTradeValue > 0 ? `${(totalTradeValue / 1e9).toFixed(1)}B` : '0', label: fa ? 'ارزش تجاری' : 'Trade Value', sub: 'IRR', color: '#10b981' },
    { icon: '🔗', val: connections.length, label: fa ? 'اتصالات فعال' : 'Active Connections', sub: fa ? 'شریک تجاری' : 'partners', color: '#8b5cf6' },
    { icon: '🏷️', val: tenders.length, label: fa ? 'مزایده‌های من' : 'My Auctions', sub: `${openTenders.length} ${fa ? 'باز' : 'open'}`, color: '#f59e0b' },
  ];

  const quickActions = [
    { icon: '➕', label: fa ? 'درخواست جدید' : 'New Request', view: 'my-requests', color: '#3b82f6' },
    { icon: '📄', label: fa ? 'قراردادها' : 'Contracts', view: 'my-contracts', color: '#10b981' },
    { icon: '🔔', label: fa ? 'پیگیری‌ها' : 'Follow-ups', view: 'crm', color: '#f59e0b' },
    { icon: '📋', label: fa ? 'مناقصه‌ها' : 'Tenders', view: 'manaqeseh', color: '#8b5cf6' },
    { icon: '🏷️', label: fa ? 'مزایده‌ها' : 'Auctions', view: 'tender-browse', color: '#06b6d4' },
  ];

  // Notifications
  const notifications: { color: string; text: string; view: any }[] = [];
  if (pending.length > 0) notifications.push({ color: '#f59e0b', text: `${pending.length} ${fa ? 'درخواست در انتظار پاسخ' : 'requests awaiting response'}`, view: 'my-requests' });
  if (quoted.length > 0) notifications.push({ color: '#3b82f6', text: `${quoted.length} ${fa ? 'پیشنهاد قیمت دریافت شده' : 'quotes received — review needed'}`, view: 'my-requests' });
  if (openTenders.length > 0) notifications.push({ color: '#10b981', text: `${openTenders.length} ${fa ? 'مزایده باز با پیشنهاد' : 'open auctions with bids'}`, view: 'tender-manage' });
  if (unsignedContracts.length > 0) notifications.push({ color: '#ef4444', text: `${unsignedContracts.length} ${fa ? 'قرارداد منتظر امضا' : 'contracts awaiting signature'}`, view: 'my-contracts' });

  const recentRequests = requests.slice(0, 5);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{fa ? '📊 داشبورد بازرگانی' : '📊 Trading Dashboard'}</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{fa ? 'خلاصه فعالیت‌های تجاری شما' : 'Overview of your trading activity'}</p>
      </div>

      {/* Quick Stats (5 col, alerts) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {quickStats.map((s, i) => (
          <button
            key={i}
            onClick={() => onNavigate(s.view)}
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center hover:border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--muted)/0.3)] transition-all group"
          >
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold group-hover:scale-105 transition-transform" style={{ color: s.color }}>{s.val}</div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))] leading-tight mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h2 className="font-semibold text-sm mb-3">⚡ {fa ? 'دسترسی سریع' : 'Quick Actions'}</h2>
        <div className="flex gap-2 flex-wrap">
          {quickActions.map((a, i) => (
            <button
              key={i}
              onClick={() => onNavigate(a.view)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-sm font-medium hover:border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--muted)/0.3)] transition-all"
              style={{ color: a.color }}
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {mainStats.map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-sm text-[hsl(var(--muted-foreground))]">{s.label}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Two-column: Notifications + Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Notifications */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
          <h2 className="font-semibold text-sm mb-3">🔔 {fa ? 'اعلان‌ها' : 'Notifications'}</h2>
          {notifications.length === 0 ? (
            <div className="text-center py-6 text-[hsl(var(--muted-foreground))]">
              <div className="text-2xl mb-1">✅</div>
              <p className="text-xs">{fa ? 'همه چیز آرام است!' : 'All clear!'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate(n.view)}
                  className="w-full text-start flex items-center gap-3 p-2.5 rounded-lg hover:bg-[hsl(var(--muted)/0.3)] transition-colors"
                  style={{ borderRight: `3px solid ${n.color}` }}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: n.color }} />
                  <span className="text-xs">{n.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Requests */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">📋 {fa ? 'آخرین درخواست‌ها' : 'Recent Requests'}</h2>
            <button onClick={() => onNavigate('my-requests')} className="text-xs text-[hsl(var(--primary))] hover:underline">
              {fa ? 'مشاهده همه' : 'View all'}
            </button>
          </div>
          {recentRequests.length === 0 ? (
            <div className="text-center py-6 text-[hsl(var(--muted-foreground))]">
              <div className="text-2xl mb-1">📭</div>
              <p className="text-xs">{fa ? 'درخواستی ثبت نشده' : 'No requests yet'}</p>
              <button onClick={() => onNavigate('my-requests')} className="mt-2 px-3 py-1 rounded-lg bg-[hsl(var(--primary))] text-white text-xs">
                {fa ? '+ درخواست جدید' : '+ New Request'}
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentRequests.map((r: any) => {
                const color = STATUS_COLORS[r.status] || '#64748b';
                const label = fa ? (STATUS_LABELS_FA[r.status] || r.status) : r.status;
                return (
                  <div key={r.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[hsl(var(--muted)/0.2)] hover:bg-[hsl(var(--muted)/0.4)] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{r.productName || r.title}</div>
                      <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{r.createdAt}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full ml-2 shrink-0" style={{ background: color + '20', color }}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Auctions */}
      {tenders.length > 0 && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">🏷️ {fa ? 'مزایده‌های اخیر' : 'Recent Auctions'}</h2>
            <button onClick={() => onNavigate('tender-manage')} className="text-xs text-[hsl(var(--primary))] hover:underline">
              {fa ? 'مشاهده همه' : 'View all'}
            </button>
          </div>
          <div className="space-y-2">
            {(tenders as any[]).slice(0, 3).map((t: any) => {
              const isOpen = t.status === 'open';
              return (
                <div key={t.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[hsl(var(--muted)/0.2)]">
                  <div>
                    <div className="text-xs font-medium">{t.title}</div>
                    <div className="text-[10px] text-[hsl(var(--muted-foreground))]">
                      🏆 {(t.bids || []).length} {fa ? 'پیشنهاد' : 'bids'} · {t.deadline}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${isOpen ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-400'}`}>
                    {isOpen ? (fa ? 'باز' : 'Open') : (fa ? 'بسته' : 'Closed')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Request Pipeline Summary */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <h2 className="font-semibold text-sm mb-3">📊 {fa ? 'وضعیت درخواست‌ها' : 'Request Pipeline'}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: fa ? 'در انتظار' : 'Pending', val: pending.length, color: '#f59e0b' },
            { label: fa ? 'قیمت داده' : 'Quoted', val: quoted.length, color: '#3b82f6' },
            { label: fa ? 'تایید شده' : 'Approved', val: approved.length, color: '#10b981' },
            { label: fa ? 'رد شده' : 'Rejected', val: rejected.length, color: '#ef4444' },
          ].map((s, i) => (
            <div key={i} className="p-3 rounded-lg" style={{ background: s.color + '10', border: `1px solid ${s.color}30` }}>
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
