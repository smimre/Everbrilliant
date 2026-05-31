'use client';
import { useState } from 'react';
import { useEmployees } from '@/hooks/use-finance';
import { useLocaleStore } from '@/store/locale.store';
import { Table, Column } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import type { Employee } from '@/types';
import { Plus, Search } from 'lucide-react';

export function HRPage() {
  const { lang } = useLocaleStore();
  const [search, setSearch] = useState('');
  const d = useDebounce(search);
  const { data, isLoading } = useEmployees({ search: d || undefined });
  const fmt = (n: number) => new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(n);

  const columns: Column<Employee>[] = [
    { key: 'staffCode', header: lang === 'fa' ? 'کد' : 'Code', render: v => <span className="font-mono text-xs font-bold text-[hsl(var(--primary))]">{v as string}</span> },
    { key: 'name', header: lang === 'fa' ? 'نام' : 'Name', render: v => <span className="font-semibold">{v as string}</span> },
    { key: 'department', header: lang === 'fa' ? 'دپارتمان' : 'Department' },
    { key: 'jobTitle', header: lang === 'fa' ? 'سمت' : 'Job Title', render: v => <span className="text-[hsl(var(--muted-foreground))]">{v as string}</span> },
    { key: 'baseSalary', header: lang === 'fa' ? 'حقوق پایه' : 'Base Salary', align: 'end',
      render: v => <span className="tabular-nums font-semibold">{fmt(v as number)} ریال</span> },
    { key: 'isActive', header: lang === 'fa' ? 'وضعیت' : 'Status',
      render: v => <Badge variant={v ? 'success' : 'secondary'}>{v ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Inactive')}</Badge> },
    { key: 'hireDate', header: lang === 'fa' ? 'تاریخ استخدام' : 'Hire Date',
      render: v => <span className="text-xs text-[hsl(var(--muted-foreground))]">{v as string}</span> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">👥 {lang === 'fa' ? 'پرسنل' : 'HR & Employees'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{data?.total ?? 0} {lang === 'fa' ? 'کارمند' : 'employees'}</p>
        </div>
        <Button><Plus className="h-4 w-4" />{lang === 'fa' ? 'کارمند جدید' : 'New Employee'}</Button>
      </div>
      <Input placeholder={lang === 'fa' ? 'جستجو...' : 'Search employees...'} value={search}
        onChange={e => setSearch(e.target.value)} prefix={<Search className="h-4 w-4"/>} className="w-64" />
      <Table columns={columns} data={data?.data ?? []} loading={isLoading}
        emptyTitle={lang === 'fa' ? 'کارمندی یافت نشد' : 'No employees found'} emptyIcon="👥" />
    </div>
  );
}
