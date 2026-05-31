import { useUIStore } from '@/store/ui.store';

export function useToast() {
  const { toast } = useUIStore();
  return {
    success: (msg: string) => toast('success', msg),
    error: (msg: string) => toast('error', msg),
    warning: (msg: string) => toast('warning', msg),
    info: (msg: string) => toast('info', msg),
  };
}
