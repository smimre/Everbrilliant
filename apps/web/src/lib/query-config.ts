// ══════════════════════════════════════════════
// React Query configuration and helpers
// ══════════════════════════════════════════════

// Standard stale times
export const STALE_TIME = {
  SHORT: 10_000,    // 10s — high-frequency data (notifications, alerts)
  MEDIUM: 30_000,   // 30s — normal data (requests, invoices)
  LONG: 60_000,     // 1m — slow-changing data (employees, companies)
  STATIC: 5 * 60_000, // 5m — rarely-changing data (roles, permissions)
};

// Standard retry logic
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof Error) {
    if (error.message.includes('Session expired')) return false;
    if (error.message.includes('Not found')) return false;
    if (error.message.includes('Forbidden')) return false;
  }
  return failureCount < 2;
}
