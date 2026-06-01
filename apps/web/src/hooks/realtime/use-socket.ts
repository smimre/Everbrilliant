'use client';
import { useCallback } from 'react';
import { socketManager } from '@/lib/socket/socket-client';

// SocketProvider in providers/index.tsx owns connect/disconnect.
// This hook only exposes emit/on for components that need to interact
// with the already-established socket.
export function useSocket() {
  const emit = useCallback((event: string, data?: unknown) => {
    socketManager.emit(event, data);
  }, []);

  const on = useCallback((event: string, handler: Function) => {
    socketManager.on(event, handler);
    return () => socketManager.off(event, handler);
  }, []);

  return { emit, on, isConnected: socketManager.isConnected };
}
