'use client';
import { useInvoice } from '@/hooks/use-finance';
import { useLocaleStore } from '@/store/locale.store';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Printer, Download } from 'lucide-react';

interface InvoiceDetailProps { invoiceId: string; onBack: () => void; }

export function InvoiceDetailPage({ invoiceId, onBack }: InvoiceDetailProps) {
  const { lang } = useLocaleStore();
  const { data: invoice, isLoading, error } = useInvoice(invoiceId);

  const fmt = (n: number) => new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(n);
  const dir = lang === 'fa' || lang === 'ar' ? 'rtl' : 'ltr';

  if (isLoading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );

  if (error || !invoice) return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4" />Back</Button>
      <Alert type="error">{error?.message || 'Invoice not found'}</Alert>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4" />{lang === 'fa' ? 'بازگشت' : 'Back'}</Button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.print()}><Printer className="h-4 w-4" />{lang === 'fa' ? 'چاپ' : 'Print'}</Button>
          <Button variant="secondary"><Download className="h-4 w-4" />PDF</Button>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden print:shadow-none" dir={dir}>
        {/* Header */}
        <div className="p-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--primary)/0.05)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--primary))]">
                {lang === 'fa' ? 'صورتحساب فروش' : 'INVOICE'}
              </h1>
              <p className="font-mono text-lg font-semibold mt-1">{invoice.id}</p>
              {invoice.taxSerial && (
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  {lang === 'fa' ? 'شماره سریال مالیاتی:' : 'Tax Serial:'} {invoice.taxSerial}
                </p>
              )}
            </div>
            <div className="text-end">
              <StatusBadge status={invoice.status} lang={lang} />
              <p className="text-sm mt-2">
                <span className="text-[hsl(var(--muted-foreground))]">{lang === 'fa' ? 'تاریخ صدور:' : 'Issued:'} </span>
                <span className="font-semibold">{invoice.issuedAt}</span>
              </p>
              {invoice.dueAt && (
                <p className="text-sm mt-1">
                  <span className="text-[hsl(var(--muted-foreground))]">{lang === 'fa' ? 'سررسید:' : 'Due:'} </span>
                  <span className="font-semibold">{invoice.dueAt}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="p-6">
          <div className="overflow-x-auto rounded-lg border border-[hsl(var(--border))]">
            <table className="w-full text-sm">
              <thead className="bg-[hsl(var(--muted)/0.5)]">
                <tr>
                  {['#', lang === 'fa' ? 'شرح کالا' : 'Description', lang === 'fa' ? 'تعداد' : 'Qty', lang === 'fa' ? 'واحد' : 'Unit',
                    lang === 'fa' ? 'قیمت واحد' : 'Unit Price', lang === 'fa' ? 'تخفیف' : 'Discount',
                    lang === 'fa' ? 'جمع' : 'Subtotal', lang === 'fa' ? 'م.ا.ا ۱۰٪' : 'VAT 10%', lang === 'fa' ? 'جمع کل' : 'Total'].map(h => (
                    <th key={h} className="px-3 py-2 text-start text-xs font-semibold text-[hsl(var(--muted-foreground))] border-b border-[hsl(var(--border))]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} className="border-b border-[hsl(var(--border))] last:border-0">
                    <td className="px-3 py-2.5 text-[hsl(var(--muted-foreground))]">{item.row}</td>
                    <td className="px-3 py-2.5 font-medium">{item.desc}</td>
                    <td className="px-3 py-2.5 tabular-nums">{fmt(item.qty)}</td>
                    <td className="px-3 py-2.5 text-[hsl(var(--muted-foreground))]">{item.unit}</td>
                    <td className="px-3 py-2.5 tabular-nums text-end">{fmt(item.unitPrice)}</td>
                    <td className="px-3 py-2.5 tabular-nums text-end text-[hsl(var(--success))]">{item.discount > 0 ? `-${fmt(item.discount)}` : '—'}</td>
                    <td className="px-3 py-2.5 tabular-nums text-end font-semibold">{fmt(item.subtotalRow)}</td>
                    <td className="px-3 py-2.5 tabular-nums text-end text-[hsl(var(--warning))]">{fmt(item.taxAmount)}</td>
                    <td className="px-3 py-2.5 tabular-nums text-end font-bold">{fmt(item.totalRow)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mt-4">
            <div className="w-64 space-y-2 bg-[hsl(var(--muted)/0.3)] rounded-xl p-4">
              {[
                { label: lang === 'fa' ? 'جمع کالا' : 'Subtotal', value: invoice.subtotal, bold: false },
                { label: lang === 'fa' ? 'تخفیف' : 'Discount', value: -invoice.discountTotal, bold: false, color: 'text-[hsl(var(--success))]' },
                { label: lang === 'fa' ? 'مالیات (۹٪)' : 'VAT (9%)', value: invoice.vatAmount, bold: false, color: 'text-[hsl(var(--warning))]' },
                { label: lang === 'fa' ? 'عوارض (۱٪)' : 'TOL (1%)', value: invoice.tolAmount, bold: false, color: 'text-[hsl(var(--warning))]' },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-[hsl(var(--muted-foreground))]">{row.label}</span>
                  <span className={`tabular-nums ${row.color || ''}`}>{fmt(Math.abs(row.value))} ریال</span>
                </div>
              ))}
              <div className="border-t border-[hsl(var(--border))] pt-2 flex justify-between font-bold text-base">
                <span>{lang === 'fa' ? 'مبلغ قابل پرداخت' : 'Total Due'}</span>
                <span className="tabular-nums text-[hsl(var(--primary))]">{fmt(invoice.total)} ریال</span>
              </div>
              {invoice.paid > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[hsl(var(--muted-foreground))]">{lang === 'fa' ? 'پرداخت شده' : 'Paid'}</span>
                  <span className="tabular-nums text-[hsl(var(--success))]">{fmt(invoice.paid)} ریال</span>
                </div>
              )}
              {invoice.total - invoice.paid > 0 && (
                <div className="flex justify-between text-sm font-semibold text-[hsl(var(--destructive))]">
                  <span>{lang === 'fa' ? 'مانده' : 'Remaining'}</span>
                  <span className="tabular-nums">{fmt(invoice.total - invoice.paid)} ریال</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
