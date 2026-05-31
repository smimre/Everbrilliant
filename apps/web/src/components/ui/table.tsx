'use client';
import { ReactNode } from 'react';
import { Loader2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: unknown, row: T, index: number) => ReactNode;
  width?: string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  className?: string;
}

interface TableProps<T extends { id?: string | number }> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  onRowClick?: (row: T) => void;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  className?: string;
  stickyHeader?: boolean;
}

export function Table<T extends { id?: string | number }>({
  columns, data, loading, emptyTitle = 'No data', emptyDescription,
  emptyIcon, onRowClick, sortKey, sortDir, onSort, className, stickyHeader,
}: TableProps<T>) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-[hsl(var(--border))]', className)}>
      <table className="w-full text-sm border-collapse">
        <thead className={cn('bg-[hsl(var(--muted)/0.5)]', stickyHeader && 'sticky top-0 z-10')}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key as string}
                onClick={() => col.sortable && onSort?.(col.key as string)}
                className={cn(
                  'px-4 py-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider',
                  'border-b border-[hsl(var(--border))]',
                  col.align === 'center' ? 'text-center' : col.align === 'end' ? 'text-end' : 'text-start',
                  col.sortable && 'cursor-pointer hover:text-[hsl(var(--foreground))] select-none',
                  col.width, col.className
                )}
              >
                <div className={cn('flex items-center gap-1', col.align === 'center' && 'justify-center', col.align === 'end' && 'justify-end')}>
                  {col.header}
                  {col.sortable && (
                    <span className="text-[hsl(var(--muted-foreground))]">
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      ) : <ChevronsUpDown className="h-3 w-3 opacity-40" />}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-[hsl(var(--primary))]" />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center">
                {emptyIcon && <div className="text-4xl mb-3 opacity-50">{emptyIcon}</div>}
                <p className="font-medium text-[hsl(var(--foreground))]">{emptyTitle}</p>
                {emptyDescription && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{emptyDescription}</p>}
              </td>
            </tr>
          ) : data.map((row, i) => (
            <tr
              key={row.id ?? i}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'border-b border-[hsl(var(--border))] last:border-0 transition-colors',
                onRowClick ? 'cursor-pointer hover:bg-[hsl(var(--muted)/0.5)]' : 'hover:bg-[hsl(var(--muted)/0.2)]',
                i % 2 === 0 ? '' : 'bg-[hsl(var(--muted)/0.15)]'
              )}
            >
              {columns.map((col) => {
                const val = (row as Record<string, unknown>)[col.key as string];
                return (
                  <td
                    key={col.key as string}
                    className={cn(
                      'px-4 py-3 text-[hsl(var(--foreground))]',
                      col.align === 'center' ? 'text-center' : col.align === 'end' ? 'text-end' : 'text-start',
                      col.className
                    )}
                  >
                    {col.render ? col.render(val, row, i) : val as ReactNode}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
