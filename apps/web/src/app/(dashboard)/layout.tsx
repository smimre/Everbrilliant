'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useLocaleStore } from '@/store/locale.store';
import { useUIStore } from '@/store/ui.store';
import { Topbar } from '@/components/layout/topbar';
import { Sidebar } from '@/components/layout/sidebar';
import { ToastContainer } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const { dir, lang } = useLocaleStore();
  const { sidebarOpen } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen flex flex-col bg-[hsl(var(--background))] overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className={cn(
          'flex-1 overflow-y-auto p-6 transition-all duration-300',
          'bg-[hsl(var(--background))]'
        )}>
          <div className="max-w-7xl mx-auto animate-in">
            {children}
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
