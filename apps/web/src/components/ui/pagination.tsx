'use client';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showInfo?: boolean;
  total?: number;
  limit?: number;
}

export function Pagination({ page, totalPages, onPageChange, className, showInfo, total, limit }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | 'ellipsis')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('ellipsis');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
  }

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {showInfo && total && limit && (
        <span className="text-xs text-[hsl(var(--muted-foreground))]">
          {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
        </span>
      )}
      <div className="flex items-center gap-1 ms-auto">
        <Button variant="ghost" size="icon-sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages.map((p, i) => p === 'ellipsis' ? (
          <span key={`e${i}`} className="px-2 text-[hsl(var(--muted-foreground))]"><MoreHorizontal className="h-4 w-4" /></span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={cn(
              'h-7 w-7 rounded-lg text-xs font-medium transition-colors',
              p === page
                ? 'bg-[hsl(var(--primary))] text-white'
                : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
            )}
          >{p}</button>
        ))}
        <Button variant="ghost" size="icon-sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
