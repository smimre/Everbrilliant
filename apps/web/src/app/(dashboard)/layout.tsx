'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useLocaleStore } from '@/store/locale.store';
import { useUIStore } from '@/store/ui.store';
import { Topbar } from '@/components/layout/topbar';
import { Sidebar } from '@/components/layout/sidebar';
import { ToastContainer } from '@/components/ui/toast';
import { HelpWidget } from '@/components/help';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const { dir, lang } = useLocaleStore();
  const { sidebarOpen } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) router.replace('/login');
  }, [_hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  if (!_hasHydrated) return null;
  if (!isAuthenticated) return null;

  return (
    <div className="h-screen flex flex-col bg-[hsl(var(--background))] overflow-hidden">
      <div data-tour="topbar">
        <Topbar />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div data-tour="sidebar">
          <Sidebar />
        </div>
        <main className={cn(
          'flex-1 overflow-y-auto p-6 transition-all duration-300',
          'bg-[hsl(var(--background))]'
        )}>
          <div className="max-w-7xl mx-auto animate-in" data-tour="dashboard">
            {children}
          </div>
        </main>
      </div>
      <ToastContainer />
      <HelpWidget />
    </div>
  );
}
