// ══════════════════════════════════════════════════════════════
// useOptimisticMutation — update UI before server confirms
// ══════════════════════════════════════════════════════════════
'use client';
import { useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { useUIStore } from '@/store/ui.store';

interface OptimisticConfig<TData, TUpdate> {
  queryKey: QueryKey;
  mutationFn: (update: TUpdate) => Promise<TData>;
  updateFn: (old: TData[] | undefined, update: TUpdate) => TData[];
  successMsg?: string;
  errorMsg?: string;
}

export function useOptimisticMutation<TData, TUpdate>({
  queryKey, mutationFn, updateFn, successMsg, errorMsg,
}: OptimisticConfig<TData, TUpdate>) {
  const qc = useQueryClient();
  const { toast } = useUIStore();

  return useMutation({
    mutationFn,

    onMutate: async (update) => {
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData(queryKey);
      qc.setQueryData(queryKey, (old: any) => updateFn(old?.data ?? old, update));
      return { previous };
    },

    onError: (err, _, context) => {
      qc.setQueryData(queryKey, context?.previous);
      toast('error', errorMsg || (err as Error).message);
    },

    onSuccess: () => {
      if (successMsg) toast('success', successMsg);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey });
    },
  });
}
