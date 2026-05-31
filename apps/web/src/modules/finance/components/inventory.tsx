'use client';
import { useState } from 'react';
import { useInventory } from '@/hooks/use-finance';
import { useLocaleStore } from '@/store/locale.store';
import { Table, Column } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { InventoryItem } from '@/types';
import { Plus, AlertTriangle } from 'lucide-react';

export function InventoryPage() {
  const { lang } = useLocaleStore();
  const { data, isLoading } = useInventory();
  const fmt = (n: number) => new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(n);

  const columns: Column<InventoryItem>[] = [
    { key: 'product', header: lang === 'fa' ? 'کالا' : 'Product', render: v => <span className="font-semibold">{v as string}</span> },
    { key: 'category', header: lang === 'fa' ? 'دسته‌بندی' : 'Category',
      render: v => v ? <Badge variant="secondary">{v as string}</Badge> : '—' },
    { key: 'qty', header: lang === 'fa' ? 'موجودی' : 'Qty', align: 'end',
      render: (v, row) => (
        <span className={`tabular-nums font-bold ${(v as number) <= row.minQty ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--success))]'}`}>
          {fmt(v as number)}
          {(v as number) <= row.minQty && <AlertTriangle className="inline h-3 w-3 ms-1" />}
        </span>
      )},
    { key: 'unit', header: lang === 'fa' ? 'واحد' : 'Unit' },
    { key: 'minQty', header: lang === 'fa' ? 'حداقل موجودی' : 'Min Qty', align: 'end',
      render: v => <span className="tabular-nums text-[hsl(var(--muted-foreground))]">{fmt(v as number)}</span> },
    { key: 'priceIRR', header: lang === 'fa' ? 'قیمت (ریال)' : 'Price (IRR)', align: 'end',
      render: v => v ? <span className="tabular-nums">{fmt(v as number)}</span> : '—' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📦 {lang === 'fa' ? 'انبارداری' : 'Inventory'}</h1>
        <div className="flex gap-2">
          <Button variant="secondary">{lang === 'fa' ? 'ورود کالا' : 'Stock In'}</Button>
          <Button variant="secondary">{lang === 'fa' ? 'خروج کالا' : 'Stock Out'}</Button>
          <Button><Plus className="h-4 w-4" />{lang === 'fa' ? 'کالای جدید' : 'New Item'}</Button>
        </div>
      </div>
      <Table columns={columns} data={data?.data ?? []} loading={isLoading}
        emptyTitle={lang === 'fa' ? 'انباری پیدا نشد' : 'No inventory items'} emptyIcon="📦" />
    </div>
  );
}
