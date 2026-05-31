'use client';
// ══════════════════════════════════════════════════════════════
// EVERBRILLIANT — Lazy Module Loading
// Dynamic imports for heavy modules
// ══════════════════════════════════════════════════════════════
import dynamic from 'next/dynamic';
import { SkeletonCard, SkeletonTable } from '@/components/ui/skeleton';

// ── Loading fallbacks ─────────────────────────────────────────
const PageLoader = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 w-48 rounded-lg bg-[hsl(var(--muted))]" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({length:4}).map((_,i) => <SkeletonCard key={i}/>)}
    </div>
    <SkeletonTable rows={8} cols={5} />
  </div>
);

const ChartLoader = () => (
  <div className="h-64 rounded-xl bg-[hsl(var(--muted))] animate-pulse flex items-center justify-center">
    <span className="text-[hsl(var(--muted-foreground))] text-sm">Loading chart…</span>
  </div>
);

// ── Lazy modules ──────────────────────────────────────────────

/** Finance module — heavy (invoices, charts, HR) */
export const LazyFinanceModule = dynamic(
  () => import('@/modules/finance').then(m => ({ default: m.FinanceModule })),
  { loading: PageLoader, ssr: false }
);

/** Trading module */
export const LazyTradingModule = dynamic(
  () => import('@/modules/trading').then(m => ({ default: m.TradingModule })),
  { loading: PageLoader, ssr: false }
);

/** Automation module */
export const LazyAutomationModule = dynamic(
  () => import('@/modules/automation').then(m => ({ default: m.AutomationModule })),
  { loading: PageLoader, ssr: false }
);

/** CRM module */
export const LazyCRMModule = dynamic(
  () => import('@/modules/crm').then(m => ({ default: m.CRMModule })),
  { loading: PageLoader, ssr: false }
);

/** Live Bidding Panel — only load in tender pages */
export const LazyLiveBiddingPanel = dynamic(
  () => import('@/components/realtime/live-bidding-panel').then(m => ({ default: m.LiveBiddingPanel })),
  { loading: () => <div className="h-48 rounded-xl bg-[hsl(var(--muted))] animate-pulse" />, ssr: false }
);

/** Charts — placeholder until chart components are added */
export const LazyRevenueChart = dynamic(
  () => Promise.resolve({ default: () => <ChartLoader /> }),
  { loading: ChartLoader, ssr: false }
);

export const LazyPieChart = dynamic(
  () => Promise.resolve({ default: () => <ChartLoader /> }),
  { loading: ChartLoader, ssr: false }
);

/** PDF Viewer — placeholder until pdf component is added */
export const LazyPDFViewer = dynamic(
  () => Promise.resolve({ default: () => <div className="h-32 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">PDF Viewer</div> }),
  { loading: () => <div className="h-32 animate-pulse bg-[hsl(var(--muted))] rounded-xl" />, ssr: false }
);
