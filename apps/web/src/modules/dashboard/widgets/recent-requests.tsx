'use client';
import { useRequests } from '@/hooks/use-trading';
import { useLocaleStore } from '@/store/locale.store';
import { Table, Column } from '@/components/ui/table';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkeletonTable } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import type { TradeRequest } from '@/types';
import { ArrowRight } from 'lucide-react';

const LABELS = {
  en: { title:'Recent Requests', id:'ID', product:'Product', amount:'Amount', status:'Status', date:'Date', viewAll:'View All' },
  fa: { title:'درخواست‌های اخیر', id:'شناسه', product:'کالا', amount:'مبلغ', status:'وضعیت', date:'تاریخ', viewAll:'مشاهده همه' },
  ar: { title:'الطلبات الأخيرة', id:'المعرف', product:'المنتج', amount:'المبلغ', status:'الحالة', date:'التاريخ', viewAll:'عرض الكل' },
};

export function RecentRequestsWidget() {
  const { lang } = useLocaleStore();
  const { data, isLoading } = useRequests({ limit: 5 });
  const router = useRouter();
  const l = LABELS[lang as keyof typeof LABELS] || LABELS.en;

  const columns: Column<TradeRequest>[] = [
    {
      key: 'id', header: l.id,
      render: (v) => <span className="font-mono text-xs font-semibold text-[hsl(var(--primary))]">{(v as string).slice(0, 10)}…</span>
    },
    { key: 'product', header: l.product,
      render: (v) => <span className="font-medium">{v as string}</span>
    },
    {
      key: 'amountIRR', header: l.amount, align: 'end',
      render: (v) => v ? (
        <span className="tabular-nums text-xs">
          {new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(Number(v) / 1_000_000)}M
        </span>
      ) : '—'
    },
    {
      key: 'status', header: l.status,
      render: (v) => <StatusBadge status={v as string} lang={lang} />
    },
    {
      key: 'createdAt', header: l.date,
      render: (v) => <span className="text-[hsl(var(--muted-foreground))] text-xs">
        {new Date(v as string).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}
      </span>
    },
  ];

  if (isLoading) return <SkeletonTable rows={5} cols={5} />;

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
        <h2 className="font-semibold text-[hsl(var(--foreground))]">{l.title}</h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{data?.total ?? 0}</Badge>
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/requests')}>
            {l.viewAll} <ArrowRight className="h-3.5 w-3.5 ms-1" />
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        data={data?.data ?? []}
        onRowClick={(r) => router.push(`/dashboard/requests/${r.id}`)}
        emptyTitle={lang === 'fa' ? 'هنوز درخواستی ندارید' : 'No requests yet'}
        emptyIcon="📋"
      />
    </div>
  );
}
