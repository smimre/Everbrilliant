'use client';
import { useInvoices } from '@/hooks/use-finance';
import { useLocaleStore } from '@/store/locale.store';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { SkeletonTable } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { Invoice } from '@/types';
import { ArrowRight } from 'lucide-react';

const LABELS = {
  en: { title:'Recent Invoices', id:'Invoice #', party:'Party', total:'Total', status:'Status', viewAll:'View All' },
  fa: { title:'فاکتورهای اخیر', id:'شماره فاکتور', party:'طرف', total:'مبلغ کل', status:'وضعیت', viewAll:'مشاهده همه' },
  ar: { title:'الفواتير الأخيرة', id:'رقم الفاتورة', party:'الطرف', total:'الإجمالي', status:'الحالة', viewAll:'عرض الكل' },
};

export function InvoiceSummaryWidget() {
  const { lang } = useLocaleStore();
  const { data, isLoading } = useInvoices({ limit: 5 });
  const router = useRouter();
  const l = LABELS[lang as keyof typeof LABELS] || LABELS.en;

  const fmt = (n: number) => new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(Math.round(n / 1_000_000)) + 'M';

  if (isLoading) return <SkeletonTable rows={4} cols={4} />;

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
        <h2 className="font-semibold">{l.title}</h2>
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/finance/invoices')}>
          {l.viewAll} <ArrowRight className="h-3.5 w-3.5 ms-1" />
        </Button>
      </div>
      <div className="divide-y divide-[hsl(var(--border))]">
        {(data?.data ?? []).length === 0 ? (
          <div className="py-12 text-center text-[hsl(var(--muted-foreground))] text-sm">
            {lang === 'fa' ? 'هنوز فاکتوری ندارید' : 'No invoices yet'}
          </div>
        ) : (data?.data ?? []).map((inv: Invoice) => (
          <div key={inv.id}
            onClick={() => router.push(`/dashboard/finance/invoices/${inv.id}`)}
            className="flex items-center gap-3 px-5 py-3 hover:bg-[hsl(var(--muted)/0.4)] cursor-pointer transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold font-mono text-[hsl(var(--primary))]">{inv.id}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{inv.issuedAt}</p>
            </div>
            <div className="text-end shrink-0">
              <p className="text-sm font-bold tabular-nums">{fmt(inv.total)}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">IRR</p>
            </div>
            <StatusBadge status={inv.status} lang={lang} />
          </div>
        ))}
      </div>
    </div>
  );
}
