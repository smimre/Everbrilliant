'use client';
import { Skeleton, SkeletonCard, SkeletonTable } from '@/components/ui/skeleton';

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({length:4}).map((_,i) => <SkeletonCard key={i}/>)}
      </div>
      {/* Table */}
      <SkeletonTable rows={8} cols={5}/>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-48"/>
        <Skeleton className="h-4 w-64"/>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {Array.from({length:6}).map((_,i)=><SkeletonCard key={i}/>)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <Skeleton className="h-64 rounded-xl"/>
          <Skeleton className="h-48 rounded-xl"/>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-xl"/>
          <Skeleton className="h-64 rounded-xl"/>
        </div>
      </div>
    </div>
  );
}
