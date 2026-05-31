'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useLocaleStore } from '@/store/locale.store';

export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const { dir, lang } = useLocaleStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, router]);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 20% 50%, hsl(217 91% 60% / 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, hsl(270 91% 60% / 0.06) 0%, transparent 40%)
        `,
      }}
    >
      {children}
    </div>
  );
}
