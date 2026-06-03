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
  useBlacklist, useAddToBlacklist, useAppealBlacklist, useRemoveFromBlacklist,
} from './use-trading';

// Finance
export {
  useInvoices, useInvoice, useCreateInvoice,
  useEmployees, useInventory,
  useBalanceSheet, useIncomeStatement, useCashFlow, useTrialBalance,
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
export {
  useCRMConnections, useAddCRMConnection, useSearchCompanies,
  useDeals, useDealStats, useCreateDeal, useUpdateDeal, useDeleteDeal,
} from './use-crm';

// Notifications
export {
  useNotifications, useUnreadCount, useMarkRead, useMarkAllRead, useDeleteNotification,
} from './use-notifications';

// Company
export {
  useMyCompany, useUpdateMyCompany,
  useCompanyConnections, useAddCompanyConnection, useRemoveCompanyConnection,
  useSearchCompany,
} from './use-company';

// Logistics
export * from './use-logistics';

// Tasks / Documents / Workflows (automation extras)
export {
  useTasks, useCreateTask, useUpdateTask,
  useDocuments, useCreateDocument,
  useWorkflowTemplates, useCreateWorkflowTemplate,
  useStartWorkflowInstance, useApproveWorkflowStep,
} from './use-automation';

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
