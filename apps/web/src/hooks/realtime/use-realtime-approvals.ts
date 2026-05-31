'use client';
import { useEffect, useCallback } from 'react';
import { useSocket } from './use-socket';
import { useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/store/ui.store';
import { useLocaleStore } from '@/store/locale.store';
import { WS_EVENTS } from '@/lib/socket/socket-client';

export function useRealtimeApprovals() {
  const { on } = useSocket();
  const qc = useQueryClient();
  const { toast } = useUIStore();
  const { lang } = useLocaleStore();

  useEffect(() => {
    const cleanup = on(WS_EVENTS.APPROVAL_UPDATE, (data: any) => {
      // Invalidate relevant queries
      qc.invalidateQueries({ queryKey: ['automation'] });

      if (data.action === 'required') {
        toast('warning', lang === 'fa' ? 'نیاز به تأیید شما دارید' : 'You have a pending approval');
      } else if (data.action === 'approved') {
        toast('success', lang === 'fa' ? 'درخواست تأیید شد' : 'Request approved');
        qc.invalidateQueries({ queryKey: ['workflow'] });
      } else if (data.action === 'rejected') {
        toast('error', lang === 'fa' ? 'درخواست رد شد' : 'Request rejected');
      }
    });

    return cleanup;
  }, [on, qc, toast, lang]);
}
