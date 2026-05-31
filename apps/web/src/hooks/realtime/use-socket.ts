'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { socketManager, WS_EVENTS } from '@/lib/socket/socket-client';

export function useSocket() {
  const { accessToken, isAuthenticated } = useAuthStore();
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      socketManager.disconnect();
      connectedRef.current = false;
      return;
    }

    if (!connectedRef.current) {
      socketManager.connect(accessToken);
      connectedRef.current = true;
    }

    return () => {
      // Don't disconnect on component unmount — keep connection alive
    };
  }, [isAuthenticated, accessToken]);

  const emit = useCallback((event: string, data?: unknown) => {
    socketManager.emit(event, data);
  }, []);

  const on = useCallback((event: string, handler: Function) => {
    socketManager.on(event, handler);
    return () => socketManager.off(event, handler);
  }, []);

  return { emit, on, isConnected: socketManager.isConnected };
}
