// ══════════════════════════════════════════════════════════════
// VirtualList — renders only visible rows
// For large datasets (1000+ items)
// ══════════════════════════════════════════════════════════════
'use client';
import { useState, useRef, useCallback, ReactNode, CSSProperties } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight?: number;
  renderItem: (item: T, index: number, style: CSSProperties) => ReactNode;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  estimatedItemHeight?: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight = 600,
  renderItem,
  overscan = 5,
  className = '',
  onEndReached,
  endReachedThreshold = 200,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const endReachedRef = useRef(false);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop: st, scrollHeight, clientHeight } = e.currentTarget;
    setScrollTop(st);

    // End reached callback
    if (onEndReached && !endReachedRef.current) {
      const distanceFromBottom = scrollHeight - st - clientHeight;
      if (distanceFromBottom < endReachedThreshold) {
        endReachedRef.current = true;
        onEndReached();
        setTimeout(() => { endReachedRef.current = false; }, 1000);
      }
    }
  }, [onEndReached, endReachedThreshold]);

  const visibleItems = items.slice(startIndex, endIndex + 1);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-y-auto ${className}`}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, relIndex) => {
          const absIndex = startIndex + relIndex;
          const style: CSSProperties = {
            position: 'absolute',
            top: absIndex * itemHeight,
            left: 0,
            right: 0,
            height: itemHeight,
          };
          return renderItem(item, absIndex, style);
        })}
      </div>
    </div>
  );
}

/** Virtual Table — virtualized rows */
interface VirtualTableProps<T extends { id?: string | number }> {
  columns: Array<{ key: string; header: string; render?: (v: unknown, row: T) => ReactNode; width?: string }>;
  data: T[];
  rowHeight?: number;
  containerHeight?: number;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyTitle?: string;
  className?: string;
}

export function VirtualTable<T extends { id?: string | number }>({
  columns, data, rowHeight = 52, containerHeight = 500,
  onRowClick, loading, emptyTitle = 'No data', className = '',
}: VirtualTableProps<T>) {
  return (
    <div className={`rounded-xl border border-[hsl(var(--border))] overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
        {columns.map(col => (
          <div key={col.key} className={`px-4 py-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider flex-1 ${col.width || ''}`}>
            {col.header}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="py-16 text-center text-sm text-[hsl(var(--muted-foreground))]">{emptyTitle}</div>
      ) : (
        <VirtualList
          items={data}
          itemHeight={rowHeight}
          containerHeight={containerHeight}
          renderItem={(row, i, style) => (
            <div
              key={row.id ?? i}
              style={style}
              onClick={() => onRowClick?.(row)}
              className={`flex items-center border-b border-[hsl(var(--border))] transition-colors ${onRowClick ? 'cursor-pointer hover:bg-[hsl(var(--muted)/0.5)]' : ''} ${i % 2 === 0 ? '' : 'bg-[hsl(var(--muted)/0.15)]'}`}
            >
              {columns.map(col => {
                const val = (row as Record<string, unknown>)[col.key];
                return (
                  <div key={col.key} className={`px-4 py-3 text-sm text-[hsl(var(--foreground))] flex-1 truncate ${col.width || ''}`}>
                    {col.render ? col.render(val, row) : val as ReactNode}
                  </div>
                );
              })}
            </div>
          )}
        />
      )}
    </div>
  );
}
