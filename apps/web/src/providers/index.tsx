'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect, type ReactNode } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { ToastContainer } from '@/components/ui/toast';
import { useRealtimeNotifications } from '@/hooks/realtime/use-realtime-notifications';
import { useRealtimeApprovals } from '@/hooks/realtime/use-realtime-approvals';
import { socketManager } from '@/lib/socket/socket-client';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: (count, error: unknown) => {
          if (error instanceof Error && error.message.includes('Session expired')) return false;
          return count < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: { retry: 0 },
    },
  });
}

let browserClient: QueryClient | undefined;
function getClient() {
  if (typeof window === 'undefined') return makeQueryClient();
  if (!browserClient) browserClient = makeQueryClient();
  return browserClient;
}

function DOMSync() {
  const { lang, dir, setLocale } = useLocaleStore();
  const { theme } = useUIStore();
  const { setIsMobile } = useUIStore();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    setLocale(lang);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return null;
}

function AuthWatcher() {
  const { clearAuth } = useAuthStore();
  useEffect(() => {
    const h = () => clearAuth();
    window.addEventListener('auth:expired', h);
    return () => window.removeEventListener('auth:expired', h);
  }, [clearAuth]);
  return null;
}

function SocketProvider() {
  const { accessToken, isAuthenticated } = useAuthStore();
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      socketManager.connect(accessToken);
    } else {
      socketManager.disconnect();
    }
  }, [isAuthenticated, accessToken]);
  return null;
}

// Realtime event handlers — only mount when authenticated
function RealtimeHandlers() {
  useRealtimeNotifications();
  useRealtimeApprovals();
  return null;
}

function AuthenticatedProviders() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return null;
  return <RealtimeHandlers />;
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => getClient());
  return (
    <QueryClientProvider client={client}>
      <DOMSync />
      <AuthWatcher />
      <SocketProvider />
      <AuthenticatedProviders />
      {children}
      <ToastContainer />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
