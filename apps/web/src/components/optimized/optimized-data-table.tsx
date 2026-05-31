// ══════════════════════════════════════════════════════════════
// OptimizedDataTable — combines Table + Virtualization + Infinite scroll
// Auto-switches between paginated and virtualized based on data size
// ══════════════════════════════════════════════════════════════
'use client';
import { useRef, useCallback, ReactNode, memo, useMemo } from 'react';
import { Loader2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DataColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (value: unknown, row: T, index: number) => ReactNode;
  width?: string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  sticky?: boolean;
}

interface OptimizedDataTableProps<T extends { id?: string | number }> {
  columns: DataColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyIcon?: string;
  onRowClick?: (row: T) => void;
  // Sorting
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  // Virtualization
  virtualize?: boolean;
  rowHeight?: number;
  containerHeight?: number;
  // Infinite scroll
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  sentinelRef?: (node: HTMLDivElement | null) => void;
  className?: string;
}

// ── Memoized Row ──────────────────────────────────────────────
interface RowProps<T> {
  row: T;
  index: number;
  columns: DataColumn<T>[];
  onClick?: (row: T) => void;
}

function Row<T extends { id?: string | number }>({ row, index, columns, onClick }: RowProps<T>) {
  return (
    <div
      role="row"
      onClick={() => onClick?.(row)}
      className={cn(
        'flex items-stretch border-b border-[hsl(var(--border))] last:border-0',
        'transition-colors duration-100',
        onClick ? 'cursor-pointer hover:bg-[hsl(var(--muted)/0.5)]' : '',
        index % 2 !== 0 ? 'bg-[hsl(var(--muted)/0.1)]' : '',
      )}
    >
      {columns.map(col => {
        const val = (row as Record<string, unknown>)[col.key as string];
        return (
          <div
            key={col.key as string}
            className={cn(
              'px-4 py-3 text-sm text-[hsl(var(--foreground))] flex items-center min-w-0',
              col.align === 'center' ? 'justify-center' : col.align === 'end' ? 'justify-end' : '',
              col.width || 'flex-1',
            )}
          >
            <span className="truncate">
              {col.render ? col.render(val, row, index) : val as ReactNode}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const MemoRow = memo(Row) as typeof Row;

// ── Main Component ─────────────────────────────────────────────
export function OptimizedDataTable<T extends { id?: string | number }>({
  columns, data, loading, emptyTitle = 'No data', emptyIcon = '📋',
  onRowClick, sortKey, sortDir, onSort,
  virtualize = false, rowHeight = 56, containerHeight = 500,
  hasMore, loadingMore, onLoadMore, sentinelRef,
  className,
}: OptimizedDataTableProps<T>) {

  // Auto-virtualize for large datasets
  const shouldVirtualize = virtualize || data.length > 200;

  const VISIBLE_ROWS = Math.ceil(containerHeight / rowHeight) + 5;
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTop = useRef(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    scrollTop.current = e.currentTarget.scrollTop;
  }, []);

  // Compute visible range for virtualization
  const { startIndex, endIndex } = useMemo(() => {
    if (!shouldVirtualize) return { startIndex: 0, endIndex: data.length - 1 };
    const start = Math.max(0, Math.floor(scrollTop.current / rowHeight) - 3);
    const end = Math.min(data.length - 1, start + VISIBLE_ROWS);
    return { startIndex: start, endIndex: end };
  }, [shouldVirtualize, data.length, rowHeight, VISIBLE_ROWS]);

  return (
    <div className={cn('rounded-xl border border-[hsl(var(--border))] overflow-hidden', className)}>

      {/* Header */}
      <div role="row" className="flex bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))] sticky top-0 z-10">
        {columns.map(col => (
          <div
            key={col.key as string}
            role="columnheader"
            onClick={() => col.sortable && onSort?.(col.key as string)}
            className={cn(
              'px-4 py-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider',
              'flex items-center gap-1 select-none',
              col.align === 'center' ? 'justify-center' : col.align === 'end' ? 'justify-end' : '',
              col.sortable ? 'cursor-pointer hover:text-[hsl(var(--foreground))]' : '',
              col.width || 'flex-1',
            )}
          >
            {col.header}
            {col.sortable && (
              sortKey === col.key
                ? sortDir === 'asc'
                  ? <ChevronUp className="h-3 w-3 text-[hsl(var(--primary))]" />
                  : <ChevronDown className="h-3 w-3 text-[hsl(var(--primary))]" />
                : <ChevronsUpDown className="h-3 w-3 opacity-30" />
            )}
          </div>
        ))}
      </div>

      {/* Body */}
      {loading && data.length === 0 ? (
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
        </div>
      ) : data.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-3xl mb-3">{emptyIcon}</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{emptyTitle}</p>
        </div>
      ) : shouldVirtualize ? (
        /* Virtualized body */
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{ height: containerHeight, overflowY: 'auto' }}
        >
          <div style={{ height: data.length * rowHeight, position: 'relative' }}>
            {data.slice(startIndex, endIndex + 1).map((row, relIdx) => {
              const absIdx = startIndex + relIdx;
              return (
                <div key={row.id ?? absIdx} style={{ position: 'absolute', top: absIdx * rowHeight, left: 0, right: 0, height: rowHeight }}>
                  <MemoRow row={row} index={absIdx} columns={columns} onClick={onRowClick} />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Normal scrollable body */
        <div className="overflow-y-auto" style={{ maxHeight: containerHeight }}>
          {data.map((row, i) => (
            <MemoRow key={row.id ?? i} row={row} index={i} columns={columns} onClick={onRowClick} />
          ))}

          {/* Infinite scroll sentinel */}
          {sentinelRef && (
            <div ref={sentinelRef} className="py-2 text-center">
              {loadingMore && (
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-[hsl(var(--muted-foreground))]" />
              )}
            </div>
          )}
        </div>
      )}

      {/* Load more */}
      {hasMore && !sentinelRef && onLoadMore && (
        <div className="p-3 border-t border-[hsl(var(--border))] text-center">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="text-sm text-[hsl(var(--primary))] hover:underline disabled:opacity-50"
          >
            {loadingMore
              ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Loading…</span>
              : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
