'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useRequests, useConfirmReceipt } from '@/hooks/use-trading';
import { useUIStore } from '@/store';

function fmtDate(iso: string) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('fa-IR'); } catch { return iso; }
}
function fmtNum(n: any) {
  try { return Number(n).toLocaleString('fa-IR'); } catch { return n; }
}

export function MyHavaleh() {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';

  const { data: raw, isLoading } = useRequests();
  const requests: any[] = (raw as any)?.data ?? [];
  const confirmReceipt = useConfirmReceipt();

  const [selected, setSelected] = useState<any>(null);

  // Havaleh = requests where buyer, status is ISSUED or COMPLETED
  const havaleh = requests.filter((r: any) =>
    ['ISSUED', 'COMPLETED', 'issued', 'completed'].includes(r.status)
  );

  const issued    = havaleh.filter(r => ['ISSUED', 'issued'].includes(r.status));
  const completed = havaleh.filter(r => ['COMPLETED', 'completed'].includes(r.status));

  const handleConfirm = (r: any) => {
    if (!confirm(fa ? 'دریافت کالا تایید شود؟' : 'Confirm receipt of goods?')) return;
    confirmReceipt.mutate(r.id, {
      onSuccess: () => {
        toast('success', fa ? '🎉 دریافت کالا تایید شد' : '🎉 Receipt confirmed');
        setSelected(null);
      },
      onError: (e: any) => toast('error', e?.message || (fa ? 'خطا' : 'Error')),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">📜 {fa ? 'حواله‌ها' : 'Delivery Notes'}</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {fa ? 'حواله‌های صادر شده و تکمیل شده' : 'Issued and completed delivery notes'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '📜', val: havaleh.length,   label: fa ? 'کل حواله‌ها' : 'Total',     color: '#f59e0b' },
          { icon: '🚚', val: issued.length,    label: fa ? 'در راه'       : 'In Transit', color: '#3b82f6' },
          { icon: '✅', val: completed.length, label: fa ? 'تکمیل شده'   : 'Completed',  color: '#10b981' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alert for pending receipt */}
      {issued.length > 0 && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-600 dark:text-blue-400">
          🚚 <strong>{issued.length} {fa ? 'حواله' : 'delivery note'}</strong>{' '}
          {fa ? 'منتظر تایید دریافت است' : 'awaiting your receipt confirmation'}
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-[hsl(var(--muted)/0.5)] animate-pulse" />)}</div>
      ) : havaleh.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <div className="text-5xl mb-3">📜</div>
          <p className="font-medium">{fa ? 'هنوز حواله‌ای صادر نشده' : 'No delivery notes yet'}</p>
          <p className="text-sm mt-1">{fa ? 'پس از تایید پرداخت، فروشنده حواله صادر می‌کند' : 'After payment approval, the seller will issue a delivery note'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {havaleh.map((r: any) => {
            const isIssued = ['ISSUED', 'issued'].includes(r.status);
            return (
              <div
                key={r.id}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 hover:border-[hsl(var(--primary)/0.3)] transition-colors"
                style={{ borderRight: `4px solid ${isIssued ? '#3b82f6' : '#10b981'}` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Havaleh number */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-sm font-bold" style={{ color: '#f59e0b' }}>
                        {r.havNo || `HAV-${r.id.slice(-4).toUpperCase()}`}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isIssued
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-green-500/10 text-green-600'
                      }`}>
                        {isIssued ? (fa ? '🚚 در راه' : '🚚 In Transit') : (fa ? '✅ تکمیل شده' : '✅ Completed')}
                      </span>
                    </div>

                    <div className="font-semibold text-sm mb-1">{r.product}</div>

                    <div className="flex flex-wrap gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                      {r.sellerCompany?.name && <span>🏭 {r.sellerCompany.name}</span>}
                      {r.amountIRR && (
                        <span className="font-semibold text-amber-500">
                          💰 {fmtNum(r.amountIRR)} IRR
                        </span>
                      )}
                      {r.issuedAt && <span>📅 {fmtDate(r.issuedAt)}</span>}
                      {r.qty && <span>📦 {fmtNum(r.qty)} {r.unit}</span>}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setSelected(r)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]"
                    >
                      {fa ? 'مشاهده' : 'View'}
                    </button>
                    {isIssued && (
                      <button
                        onClick={() => handleConfirm(r)}
                        disabled={confirmReceipt.isPending}
                        className="text-xs px-3 py-1.5 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 disabled:opacity-50"
                      >
                        📦 {fa ? 'تایید دریافت' : 'Confirm Receipt'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            {/* Havaleh header */}
            <div className="text-center mb-5 p-4 rounded-xl border-2 border-dashed border-amber-500/40 bg-amber-500/5">
              <div className="text-4xl mb-2">📜</div>
              <div className="font-mono font-bold text-lg" style={{ color: '#f59e0b' }}>
                {selected.havNo || `HAV-${selected.id.slice(-4).toUpperCase()}`}
              </div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                {selected.issuedAt ? fmtDate(selected.issuedAt) : (fa ? 'تاریخ نامشخص' : 'Date unknown')}
              </div>
            </div>

            <div className="space-y-1 mb-5">
              {[
                [fa ? 'کالا' : 'Product',  selected.product],
                [fa ? 'مقدار' : 'Quantity', selected.qty ? `${fmtNum(selected.qty)} ${selected.unit}` : null],
                [fa ? 'مبلغ' : 'Amount',   selected.amountIRR ? `${fmtNum(selected.amountIRR)} IRR` : null],
                [fa ? 'فروشنده' : 'Seller', selected.sellerCompany?.name],
                [fa ? 'وضعیت' : 'Status',  ['ISSUED','issued'].includes(selected.status) ? (fa ? '🚚 در راه' : '🚚 In Transit') : (fa ? '✅ تکمیل شده' : '✅ Completed')],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={String(k)} className="flex justify-between text-sm py-2 border-b border-[hsl(var(--border)/0.5)]">
                  <span className="text-[hsl(var(--muted-foreground))]">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">
                {fa ? 'بستن' : 'Close'}
              </button>
              {['ISSUED','issued'].includes(selected.status) && (
                <button
                  onClick={() => handleConfirm(selected)}
                  disabled={confirmReceipt.isPending}
                  className="flex-1 py-2 rounded-lg bg-green-500 text-white text-sm font-bold disabled:opacity-50"
                >
                  📦 {fa ? 'تایید دریافت کالا' : 'Confirm Receipt'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
