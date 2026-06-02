// ═══════════════════════════════════════
// Hooks — Central Export
// ═══════════════════════════════════════

// Auth
export { useLogin, useRegister, useLogout } from './use-auth';

// Trading
export {
  useRequests, useCreateRequest,
  useContracts, useSignContract,
  useTenders, useCreateTender,
  useConnections,
  useQuotesForRequest, useCreateQuote, useAcceptQuote,
} from './use-trading';

// Finance
export {
  useInvoices, useInvoice, useCreateInvoice,
  useEmployees, useInventory,
} from './use-finance';

// Automation
export {
  useLetters, useCreateLetter, useArchiveLetter,
  useMeetings, useCreateMeeting, useAddMinutes,
  useWorkflowRequests, useCreateWorkflowRequest, useApproveRequest, useRejectRequest,
} from './use-automation';

// Manufacturing
export {
  useWorkOrders, useCreateWorkOrder, useUpdateWorkOrder,
  useBOMs, useMaterials, useCreateMaterialPO,
  useWIP, useQualityChecks, useMfgReports,
} from './use-manufacturing';

// CRM
export { useCRMConnections, useAddCRMConnection, useSearchCompanies } from './use-crm';

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
