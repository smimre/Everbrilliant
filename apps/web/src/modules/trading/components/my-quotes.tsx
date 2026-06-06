'use client';
import { useLocaleStore } from '@/store/locale.store';
import { useAuthStore } from '@/store/auth.store';
import { useRequests } from '@/hooks/use-trading';

function fmt(n: any) {
  try { return Number(n).toLocaleString('fa-IR'); } catch { return String(n); }
}
function fmtDate(iso: string) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('fa-IR'); } catch { return iso; }
}

// Spec badge map (request status labels on seller side)
const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: '⏳',            color: '#f59e0b', bg: '#f59e0b20' },
  QUOTED:    { label: '💬 قیمت‌دهی',  color: '#3b82f6', bg: '#3b82f620' },
  APPROVED:  { label: '✅ تایید',      color: '#10b981', bg: '#10b98120' },
  PAID:      { label: '💳 پرداخت',    color: '#10b981', bg: '#10b98120' },
  ISSUED:    { label: '📜 صادر',      color: '#8b5cf6', bg: '#8b5cf620' },
  COMPLETED: { label: '✔️ تکمیل',    color: '#10b981', bg: '#10b98120' },
  REJECTED:  { label: '❌ رد',        color: '#ef4444', bg: '#ef444420' },
  CANCELLED: { label: '🚫 لغو',      color: '#94a3b8', bg: '#94a3b820' },
};

export function MyQuotes() {
  const { lang } = useLocaleStore();
  const { user } = useAuthStore();
  const fa = lang === 'fa';

  const { data: rawRequests, isLoading } = useRequests();
  const allRequests: any[] = rawRequests?.data ?? [];

  // Spec: seller's requests — r.sellerAcc===curAcc.id
  const reqs = allRequests.filter((r: any) => r.sellerCompanyId === user?.companyId);

  // quoted = those with an amountIRR (seller submitted a price)
  const quoted = reqs.filter((r: any) => r.amountIRR);

  // won = paid / completed / issued
  const won = reqs.filter((r: any) =>
    ['PAID', 'COMPLETED', 'ISSUED'].includes((r.status || '').toUpperCase())
  );

  const totalQuoted = quoted.reduce((s: number, r: any) => s + Number(r.amountIRR ?? 0), 0);

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">💬 {fa ? 'قیمت‌های من' : 'My Quotes'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">{reqs.length} {fa ? 'درخواست دریافتی' : 'requests received'}</p>
        </div>
      </div>

      {/* 4-col stats matching spec */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: '📤', val: reqs.length,    label: fa ? 'کل درخواست‌های دریافتی' : 'Total Requests', color: '#3b82f6' },
          { icon: '💬', val: quoted.length,  label: fa ? 'قیمت‌دهی شده'           : 'Quoted',          color: '#f59e0b' },
          { icon: '🏆', val: won.length,     label: fa ? 'برنده شده'               : 'Won',             color: '#10b981' },
          { icon: '💰', val: fmt(totalQuoted), label: fa ? 'ارزش قیمت‌های داده‌شده' : 'Total Quoted Value', color: '#8b5cf6' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 text-center relative overflow-hidden group hover:scale-[1.03] hover:shadow-md transition-all duration-200">
            <div className="absolute top-0 inset-x-0 h-1 rounded-t-xl" style={{ background: s.color }} />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-200 pointer-events-none" style={{ background: s.color }} />
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-xl font-bold leading-none" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">
        <div className="px-5 py-4 border-b border-[hsl(var(--border))]">
          <h2 className="font-bold">
            💬 {fa ? `قیمت‌های اعلام‌شده (${quoted.length})` : `Submitted Quotes (${quoted.length})`}
          </h2>
        </div>

        {isLoading ? (
          <div className="py-12 px-5 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-10 rounded-lg bg-[hsl(var(--muted)/0.5)] animate-pulse" />)}
          </div>
        ) : quoted.length === 0 ? (
          <div className="py-16 text-center text-[hsl(var(--muted-foreground))]">
            <div className="text-5xl mb-3">💬</div>
            <p>{fa ? 'قیمتی اعلام نشده' : 'No quotes submitted yet'}</p>
            <p className="text-xs mt-1 opacity-60">{fa ? 'وقتی خریداران از شما قیمت بخواهند اینجا نمایش داده می‌شود' : 'Quotes will appear here when buyers request pricing from you'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))] uppercase">
                  <th className="px-4 py-3 text-right font-semibold">{fa ? 'شناسه' : 'ID'}</th>
                  <th className="px-4 py-3 text-right font-semibold">{fa ? 'محصول' : 'Product'}</th>
                  <th className="px-4 py-3 text-right font-semibold">{fa ? 'خریدار' : 'Buyer'}</th>
                  <th className="px-4 py-3 text-right font-semibold">{fa ? 'تاریخ' : 'Date'}</th>
                  <th className="px-4 py-3 text-right font-semibold">{fa ? 'قیمت اعلامی' : 'Quoted Price'}</th>
                  <th className="px-4 py-3 text-right font-semibold">{fa ? 'وضعیت' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {quoted.map((r: any) => {
                  const st = (r.status || '').toUpperCase();
                  const badge = STATUS_BADGE[st] ?? { label: r.status, color: '#94a3b8', bg: '#94a3b820' };
                  return (
                    <tr key={r.id} className="border-b border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'hsl(var(--primary))' }}>
                        {r.id}
                      </td>
                      <td className="px-4 py-3 font-semibold">{r.product}</td>
                      <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                        {r.buyerCompany?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                        {fmtDate(r.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-bold" style={{ color: '#f59e0b' }}>
                        {fmt(r.amountIRR)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: badge.bg, color: badge.color }}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
