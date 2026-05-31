'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useLocaleStore } from '@/store/locale.store';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageSelector } from '@/components/layout/language-selector';
import { Eye, EyeOff, Loader2, Building2 } from 'lucide-react';

const loginSchema = z.object({
  phone: z.string().min(1, 'Required'),
  password: z.string().min(6, 'Min 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const TRANSLATIONS = {
  en: {
    title: 'Everbrilliant',
    subtitle: 'B2B Trading & ERP Platform',
    phone: 'Mobile or Username',
    phonePh: 'Phone number or username',
    password: 'Password',
    passPh: '••••••••',
    submit: 'Sign In',
    noAcc: "Don't have an account?",
    register: 'Register',
  },
  fa: {
    title: 'سامانه بازرگانی',
    subtitle: 'پلتفرم خرید، فروش و مزایده',
    phone: 'موبایل یا نام کاربری',
    phonePh: 'شماره موبایل یا نام کاربری',
    password: 'رمز عبور',
    passPh: '••••••••',
    submit: 'ورود به سیستم',
    noAcc: 'حساب ندارید؟',
    register: 'ثبت‌نام',
  },
  ar: {
    title: 'إيفربريليانت',
    subtitle: 'منصة تجارة B2B',
    phone: 'الجوال أو اسم المستخدم',
    phonePh: 'رقم الجوال',
    password: 'كلمة المرور',
    passPh: '••••••••',
    submit: 'تسجيل الدخول',
    noAcc: 'ليس لديك حساب؟',
    register: 'التسجيل',
  },
  hi: {
    title: 'एवरब्रिलियंट',
    subtitle: 'B2B ट्रेडिंग प्लेटफॉर्म',
    phone: 'मोबाइल या यूज़रनेम',
    phonePh: 'फ़ोन नंबर',
    password: 'पासवर्ड',
    passPh: '••••••••',
    submit: 'साइन इन',
    noAcc: "खाता नहीं है?",
    register: 'रजिस्टर',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { lang } = useLocaleStore();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      const result = await authService.login({ phone: data.phone, password: data.password });
      setAuth(result.user, result.accessToken);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    }
  };

  return (
    <div className="w-full max-w-sm mx-4 animate-in">

      {/* Language selector */}
      <div className="flex justify-end mb-6">
        <LanguageSelector />
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-8 shadow-[var(--shadow-xl)]">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center shadow-lg shadow-[hsl(var(--primary)/0.3)]">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">{t.title}</h1>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{t.subtitle}</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))] px-3 py-2 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label={t.phone}
            placeholder={t.phonePh}
            error={errors.phone?.message}
            autoComplete="username"
            inputMode="tel"
            {...register('phone')}
          />

          <Input
            label={t.password}
            placeholder={t.passPh}
            type={showPass ? 'text' : 'password'}
            error={errors.password?.message}
            autoComplete="current-password"
            suffix={
              <button type="button" onClick={() => setShowPass(!showPass)} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            {...register('password')}
          />

          <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
            {!isSubmitting && <span className="me-1">🔑</span>}
            {t.submit}
          </Button>
        </form>

        {/* Register link */}
        <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-6">
          {t.noAcc}{' '}
          <a href="/register" className="text-[hsl(var(--primary))] hover:underline font-medium">
            {t.register}
          </a>
        </p>
      </div>
    </div>
  );
}
