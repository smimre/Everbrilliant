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

// Spec badge map: {pending:'⏳ در انتظار', quoted:'💬 قیمت‌دهی', approved:'✅ تایید', paid:'💳 پرداخت', completed:'✔️ تکمیل'}
const STATUS_BADGE: Record<string, { fa: string; en: string; color: string }> = {
  PENDING:   { fa: '⏳ در انتظار', en: '⏳ Pending',   color: '#f59e0b' },
  QUOTED:    { fa: '💬 قیمت‌دهی', en: '💬 Quoted',    color: '#3b82f6' },
  APPROVED:  { fa: '✅ تایید',     en: '✅ Approved',  color: '#10b981' },
  PAID:      { fa: '💳 پرداخت',   en: '💳 Paid',      color: '#06b6d4' },
  ISSUED:    { fa: '📜 صادر',     en: '📜 Issued',    color: '#8b5cf6' },
  COMPLETED: { fa: '✔️ تکمیل',   en: '✔️ Completed', color: '#10b981' },
  CANCELLED: { fa: '🚫 لغو',     en: '🚫 Cancelled', color: '#94a3b8' },
  REJECTED:  { fa: '❌ رد',       en: '❌ Rejected',  color: '#ef4444' },
};

export function MyPayments() {
  const { lang } = useLocaleStore();
  const { user } = useAuthStore();
  const fa = lang === 'fa';

  const { data: rawRequests, isLoading } = useRequests();
  const allRequests: any[] = rawRequests?.data ?? [];

  // Spec: buyer's requests that have an amount — r.buyerAcc===curAcc.id && r.amountIRR
  const reqs = allRequests.filter((r: any) =>
    r.buyerCompanyId === user?.companyId && r.amountIRR
  );

  const paid    = reqs.filter((r: any) => ['PAID', 'COMPLETED'].includes((r.status || '').toUpperCase()));
  const pending = reqs.filter((r: any) => ['QUOTED', 'APPROVED'].includes((r.status || '').toUpperCase()));

  const totalPaid    = paid.reduce((s: number, r: any) => s + Number(r.amountIRR ?? 0), 0);
  const totalPending = pending.reduce((s: number, r: any) => s + Number(r.amountIRR ?? 0), 0);
  const uniqueSellers = new Set(reqs.map((r: any) => r.sellerCompanyId).filter(Boolean)).size;

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">💳 {fa ? 'پرداخت‌های من' : 'My Payments'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">{reqs.length} {fa ? 'فاکتور' : 'invoices'}</p>
        </div>
      </div>

      {/* 4-col stats matching spec */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: '✅', val: fmt(totalPaid),    label: fa ? 'پرداخت شده'         : 'Paid',          color: '#10b981' },
          { icon: '⏳', val: fmt(totalPending), label: fa ? 'در انتظار پرداخت'  : 'Pending Payment',color: '#f59e0b' },
          { icon: '📋', val: reqs.length,       label: fa ? 'کل فاکتورها'        : 'Total Invoices', color: '#3b82f6' },
          { icon: '🏢', val: uniqueSellers,     label: fa ? 'تامین‌کننده'         : 'Suppliers',     color: '#8b5cf6' },
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
          <h2 className="font-bold">
            💳 {fa ? `پرداخت‌ها (${reqs.length})` : `Payments (${reqs.length})`}
          </h2>
        </div>

        {isLoading ? (
          <div className="py-12 px-5 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-10 rounded-lg bg-[hsl(var(--muted)/0.5)] animate-pulse" />)}
          </div>
        ) : reqs.length === 0 ? (
          <div className="py-16 text-center text-[hsl(var(--muted-foreground))]">
            <div className="text-5xl mb-3">💳</div>
            <p>{fa ? 'پرداختی ثبت نشده' : 'No payments yet'}</p>
            <p className="text-xs mt-1 opacity-60">{fa ? 'پس از تایید قیمت، پرداخت‌ها اینجا ثبت می‌شوند' : 'Payments appear here once quotes are approved'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))] uppercase">
                  <th className="px-4 py-3 text-right font-semibold">{fa ? 'شناسه' : 'ID'}</th>
                  <th className="px-4 py-3 text-right font-semibold">{fa ? 'محصول' : 'Product'}</th>
                  <th className="px-4 py-3 text-right font-semibold">{fa ? 'فروشنده' : 'Seller'}</th>
                  <th className="px-4 py-3 text-right font-semibold">{fa ? 'تاریخ' : 'Date'}</th>
                  <th className="px-4 py-3 text-right font-semibold">{fa ? 'مبلغ' : 'Amount'}</th>
                  <th className="px-4 py-3 text-right font-semibold">{fa ? 'وضعیت' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {reqs.map((r: any) => {
                  const st = (r.status || '').toUpperCase();
                  const badge = STATUS_BADGE[st] ?? { fa: r.status, en: r.status, color: '#94a3b8' };
                  return (
                    <tr key={r.id} className="border-b border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'hsl(var(--primary))' }}>
                        {r.id}
                      </td>
                      <td className="px-4 py-3 font-semibold">{r.product}</td>
                      <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                        {r.sellerCompany?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                        {fmtDate(r.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-bold" style={{ color: '#f59e0b' }}>
                        {fmt(r.amountIRR)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: badge.color + '20', color: badge.color }}>
                          {fa ? badge.fa : badge.en}
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
