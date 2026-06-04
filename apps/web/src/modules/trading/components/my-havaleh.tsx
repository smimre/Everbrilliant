'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useRequests, useConfirmReceipt } from '@/hooks/use-trading';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store';

function fmtNum(n: any) {
  try { return Number(n).toLocaleString('fa-IR'); } catch { return n; }
}
function fmtDate(iso: string) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('fa-IR'); } catch { return iso; }
}

export function MyHavaleh() {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const { user } = useAuthStore();
  const fa = lang === 'fa';

  const { data: raw, isLoading } = useRequests();
  const allRequests: any[] = (raw as any)?.data ?? [];
  const confirmReceipt = useConfirmReceipt();

  const [selected, setSelected] = useState<any>(null);

  // Spec: buyer's requests with status issued or completed
  const havaleh = allRequests.filter((r: any) => {
    const st = (r.status || '').toUpperCase();
    const isBuyer = r.buyerCompanyId === user?.companyId;
    return isBuyer && (st === 'ISSUED' || st === 'COMPLETED');
  });

  const handleConfirm = (r: any) => {
    confirmReceipt.mutate(r.id, {
      onSuccess: () => {
        toast('success', fa ? '🎉 سفارش تکمیل شد!' : '🎉 Order completed!');
        setSelected(null);
      },
      onError: (e: any) => toast('error', e?.message || (fa ? 'خطا' : 'Error')),
    });
  };

  const havNo = (r: any) => r.havNo || `HAV-${r.id.slice(-3).toUpperCase()}`;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
          <h2 className="font-bold">📜 {fa ? 'حواله‌ها' : 'Delivery Notes'}</h2>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-10 rounded-lg bg-[hsl(var(--muted)/0.5)] animate-pulse" />)}
          </div>
        ) : havaleh.length === 0 ? (
          <div className="py-16 text-center text-[hsl(var(--muted-foreground))]">
            <div className="text-5xl mb-3">📜</div>
            <p>{fa ? 'حواله‌ای ثبت نشده' : 'No delivery notes yet'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))] uppercase">
                  <th className="px-4 py-3 text-right font-semibold">{fa ? 'حواله' : 'Note'}</th>
                  <th className="px-4 py-3 text-right font-semibold">{fa ? 'کالا' : 'Product'}</th>
                  <th className="px-4 py-3 text-right font-semibold">{fa ? 'فروشنده' : 'Seller'}</th>
                  <th className="px-4 py-3 text-right font-semibold">{fa ? 'مبلغ' : 'Amount'}</th>
                  <th className="px-4 py-3 text-right font-semibold">{fa ? 'وضعیت' : 'Status'}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {havaleh.map((r: any) => {
                  const isIssued = (r.status || '').toUpperCase() === 'ISSUED';
                  return (
                    <tr key={r.id} className="border-b border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                      <td className="px-4 py-3 font-mono font-bold" style={{ color: '#f59e0b' }}>
                        {havNo(r)}
                      </td>
                      <td className="px-4 py-3 font-medium">{r.product}</td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                        {r.sellerCompany?.name || '—'}
                      </td>
                      <td className="px-4 py-3 font-bold" style={{ color: '#f59e0b' }}>
                        {r.amountIRR ? fmtNum(r.amountIRR) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          isIssued
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-green-500/10 text-green-600'
                        }`}>
                          {isIssued
                            ? (fa ? '📜 صادر' : '📜 Issued')
                            : (fa ? '✔️ تکمیل' : '✔️ Completed')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setSelected(r)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)] transition-colors"
                          >
                            {fa ? 'مشاهده' : 'View'}
                          </button>
                          {isIssued && (
                            <button
                              onClick={() => handleConfirm(r)}
                              disabled={confirmReceipt.isPending}
                              className="text-xs px-3 py-1.5 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 disabled:opacity-50 transition-colors"
                            >
                              📦 {fa ? 'دریافت' : 'Receive'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal — matches showHav spec */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            <h2 className="font-bold mb-4">📜 {fa ? 'حواله' : 'Delivery Note'}</h2>

            {/* Gold dashed havaleh card */}
            <div className="rounded-xl border-2 border-dashed p-5 mb-5" style={{ borderColor: '#f59e0b40', background: '#f59e0b08' }}>
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">📜</div>
                <div className="font-mono font-bold text-lg" style={{ color: '#f59e0b' }}>
                  {havNo(selected)}-0001
                </div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  {fmtDate(selected.issuedAt)}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  [fa ? 'کالا' : 'Product',  selected.product],
                  [fa ? 'مبلغ' : 'Amount',   selected.amountIRR ? fmtNum(selected.amountIRR) + ' IRR' : null],
                  [fa ? 'خریدار' : 'Buyer',  selected.buyerCompany?.name],
                  [fa ? 'فروشنده' : 'Seller', selected.sellerCompany?.name],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={String(k)} className="flex items-center justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">{k}:</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)] transition-colors"
              >
                {fa ? 'بستن' : 'Close'}
              </button>
              {(selected.status || '').toUpperCase() === 'ISSUED' && (
                <button
                  onClick={() => handleConfirm(selected)}
                  disabled={confirmReceipt.isPending}
                  className="flex-1 py-2 rounded-lg bg-green-500 text-white text-sm font-bold hover:bg-green-600 disabled:opacity-50 transition-colors"
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
