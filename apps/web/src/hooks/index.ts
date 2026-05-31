// ═══════════════════════════════════════
// Hooks — Central Export
// ═══════════════════════════════════════

// Auth
export { useLogin, useRegister, useLogout } from './use-auth';

// Trading
export {
  useRequests, useCreateRequest,
  useContracts,
  useTenders, useCreateTender,
  useConnections,
} from './use-trading';

// Finance
export {
  useInvoices, useInvoice, useCreateInvoice,
  useEmployees, useInventory,
} from './use-finance';

// Notifications
export {
  useNotifications, useUnreadCount, useMarkRead, useMarkAllRead,
} from './use-notifications';

// Realtime
export { useSocket }                    from './realtime/use-socket';
export { useRealtimeNotifications }     from './realtime/use-realtime-notifications';
export { useRealtimeApprovals }         from './realtime/use-realtime-approvals';
export { useLiveBidding }               from './realtime/use-live-bidding';
export { usePresence }                  from './realtime/use-presence';

// Performance
export { useInfiniteList }              from './perf/use-infinite-scroll';
export { useOptimisticMutation }        from './perf/use-optimistic';
export { usePrefetch, usePrefetchOnHover } from './perf/use-prefetch';

// Utilities
export { useDebounce }                  from './use-debounce';
export { useToast }                     from './use-toast';
