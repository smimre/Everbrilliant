'use client';
import { useState } from 'react';
import { useInvoices } from '@/hooks/use-finance';
import { useLocaleStore } from '@/store/locale.store';
import { Table, Column } from '@/components/ui/table';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce';
import type { Invoice } from '@/types';
import { Plus, Search, Printer } from 'lucide-react';

const T = {
  en: { title:'Invoices', create:'New Invoice', search:'Search invoices...', all:'All Status',
    id:'Invoice #', type:'Type', party:'Buyer', total:'Total', paid:'Paid', status:'Status', date:'Issued', actions:'Actions' },
  fa: { title:'فاکتورها', create:'فاکتور جدید', search:'جستجو...', all:'همه وضعیت‌ها',
    id:'شماره فاکتور', type:'نوع', party:'خریدار', total:'مبلغ کل', paid:'پرداختی', status:'وضعیت', date:'تاریخ صدور', actions:'عملیات' },
  ar: { title:'الفواتير', create:'فاتورة جديدة', search:'بحث...', all:'كل الحالات',
    id:'رقم الفاتورة', type:'النوع', party:'المشتري', total:'الإجمالي', paid:'المدفوع', status:'الحالة', date:'تاريخ الإصدار', actions:'إجراءات' },
};

const STATUS_OPTIONS = [
  { value: '', label_en: 'All Status', label_fa: 'همه وضعیت‌ها' },
  { value: 'draft', label_en: 'Draft', label_fa: 'پیش‌نویس' },
  { value: 'sent', label_en: 'Sent', label_fa: 'ارسال شده' },
  { value: 'paid', label_en: 'Paid', label_fa: 'پرداخت شده' },
  { value: 'overdue', label_en: 'Overdue', label_fa: 'معوق' },
  { value: 'cancelled', label_en: 'Cancelled', label_fa: 'لغو شده' },
];

interface InvoiceListProps { onSelect: (id: string) => void; onCreate: () => void; }

export function InvoiceListPage({ onSelect, onCreate }: InvoiceListProps) {
  const { lang } = useLocaleStore();
  const t = T[lang as keyof typeof T] || T.en;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useInvoices({ page, limit: 15, search: debouncedSearch || undefined, status: status || undefined });

  const fmt = (n: number) => new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(Math.round(n / 1_000_000)) + 'M';

  const columns: Column<Invoice>[] = [
    { key: 'id', header: t.id, render: (v) => <span className="font-mono text-xs font-bold text-[hsl(var(--primary))]">{v as string}</span> },
    { key: 'invoiceType', header: t.type, render: (v) => <Badge variant="secondary">{v as string}</Badge> },
    { key: 'total', header: t.total, align: 'end', render: (v) => <span className="font-bold tabular-nums">{fmt(v as number)}</span> },
    { key: 'paid', header: t.paid, align: 'end', render: (v, row) => (
      <span className={`tabular-nums text-sm ${(v as number) >= row.total ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--warning))]'}`}>
        {fmt(v as number)}
      </span>
    )},
    { key: 'status', header: t.status, render: (v) => <StatusBadge status={v as string} lang={lang} /> },
    { key: 'issuedAt', header: t.date, render: (v) => <span className="text-xs text-[hsl(var(--muted-foreground))]">{v as string}</span> },
    { key: 'id', header: t.actions, render: (v) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); window.print(); }}>
          <Printer className="h-3.5 w-3.5" />
        </Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">🧾 {t.title}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {data?.total ?? 0} {lang === 'fa' ? 'فاکتور' : 'invoices'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {/* Cross-module: link to trading contracts */}
          <a href="/trading"
            className="text-xs px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
            📊 {lang === 'fa' ? 'قراردادهای بازرگانی' : 'Trading Contracts'}
          </a>
          <Button onClick={onCreate}><Plus className="h-4 w-4" />{t.create}</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input placeholder={t.search} value={search} onChange={(e) => setSearch(e.target.value)}
          prefix={<Search className="h-4 w-4" />} className="w-64" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)}
          options={STATUS_OPTIONS.map(s => ({ value: s.value, label: lang === 'fa' ? s.label_fa : s.label_en }))}
          className="w-48"
        />
      </div>

      {/* Table */}
      <Table columns={columns} data={data?.data ?? []} loading={isLoading}
        onRowClick={(row) => onSelect(row.id)}
        emptyTitle={lang === 'fa' ? 'فاکتوری پیدا نشد' : 'No invoices found'}
        emptyIcon="🧾"
      />

      {/* Pagination */}
      <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage}
        showInfo total={data?.total} limit={15}
      />
    </div>
  );
}
