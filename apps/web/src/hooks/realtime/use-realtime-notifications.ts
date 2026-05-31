'use client';
import { useEffect } from 'react';
import { useSocket } from './use-socket';
import { useNotificationStore } from '@/store/notification.store';
import { useUIStore } from '@/store/ui.store';
import { useLocaleStore } from '@/store/locale.store';
import { WS_EVENTS } from '@/lib/socket/socket-client';
import type { AppNotification } from '@/types';

export function useRealtimeNotifications() {
  const { on } = useSocket();
  const { addRealtime } = useNotificationStore();
  const { toast } = useUIStore();
  const { lang } = useLocaleStore();

  useEffect(() => {
    const cleanup = on(WS_EVENTS.NOTIFICATION, (data: any) => {
      const notification: AppNotification = {
        id: data.id || Math.random().toString(36).slice(2),
        userId: 0,
        type: data.type?.toLowerCase() || 'info',
        title: lang === 'fa' && data.titleFa ? data.titleFa : data.title,
        message: lang === 'fa' && data.messageFa ? data.messageFa : data.message,
        link: data.link,
        isRead: false,
        createdAt: data.createdAt || new Date().toISOString(),
      };

      addRealtime(notification);

      // Also show as toast
      const toastType = ['success', 'error', 'warning', 'info'].includes(data.type?.toLowerCase())
        ? data.type.toLowerCase() as any : 'info';
      toast(toastType, notification.title);
    });

    return cleanup;
  }, [on, addRealtime, toast, lang]);
}
