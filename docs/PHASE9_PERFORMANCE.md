# Phase 9 — Performance Optimization

## Backend Optimizations

### 1. Redis Caching Strategy
| Layer | TTL | Cache Key Pattern |
|-------|-----|------------------|
| Requests list | 30s | `v2:req:{companyId}:{page}:{status}` |
| Invoice list  | 30s | `v2:inv:{companyId}:{page}:{status}` |
| Employees     | 5m  | `v2:emp:{companyId}:{page}` |
| Inventory     | 30s | `v2:inv_items:{companyId}:{page}` |
| Tenders       | 60s | `v2:tenders:{page}:{type}` |
| Finance KPI   | 60s | `v2:fin_summary:{companyId}` |

### 2. Pagination Pipe
- Validates page/limit (max 100)
- Returns `PaginationParams` + `skip`
- Standard `paginated()` response with `meta`

### 3. Query Builder
- Fluent API: `.forCompany().search().filter().dateRange().build()`
- `forBuyerOrSeller()` for trading entities
- `buildOrderBy()` helper

### 4. SQL Indexes (Migration 002)
- Composite: `(company_id, status, created_at DESC)`
- Partial: unread notifications, active sessions, open tenders
- GIN trigram: product names, company names
- Materialized view: `company_dashboard_stats`
- Cleanup functions: expired sessions, old notifications

### 5. Global Exception Filter
- Prisma errors → HTTP codes (P2002 → 409, P2025 → 404)
- Structured error response
- Server error logging

## Frontend Optimizations

### 1. useInfiniteScroll
- `useInfiniteQuery` with `getNextPageParam`
- `IntersectionObserver` sentinel for auto-load
- Flattens pages into single array

### 2. useOptimisticMutation
- Updates UI immediately before server confirms
- Rolls back on error
- Cache invalidation on settle

### 3. usePrefetch / usePrefetchOnHover
- Preloads data on hover/focus
- Reduces perceived latency on navigation

### 4. OptimizedDataTable
- `memo(Row)` — prevents unnecessary re-renders
- Auto-virtualization for > 200 rows
- Infinite scroll sentinel support
- Sortable headers

### 5. PageSkeleton / DashboardSkeleton
- Instant skeleton on navigation
- Prevents layout shift (CLS)

## Benchmark Targets

| Metric | Before | Target |
|--------|--------|--------|
| API response (cached) | 200ms | < 10ms |
| API response (DB) | 300ms | < 100ms |
| Table render (1000 rows) | 2s | < 100ms |
| Bundle size (JS) | ~800KB | < 350KB |
| First contentful paint | 3s | < 1s |
| Cache hit rate | 0% | > 70% |
