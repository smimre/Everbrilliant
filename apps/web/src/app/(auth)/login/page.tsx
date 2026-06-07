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
import { Eye, EyeOff, Loader2 } from 'lucide-react';

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
    forgot: 'Forgot password?',
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
    forgot: 'رمز عبور را فراموش کردید؟',
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
    forgot: 'نسيت كلمة المرور؟',
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
    forgot: 'पासवर्ड भूल गए?',
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
    <div className="w-full animate-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">{t.submit}</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{t.subtitle}</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl bg-[hsl(var(--destructive)/0.08)] border border-[hsl(var(--destructive)/0.25)] text-[hsl(var(--destructive))] px-4 py-3 text-sm flex items-center gap-2">
          <span className="text-base">⚠️</span> {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Input
          id="mobile-or-username"
          label={t.phone}
          placeholder={t.phonePh}
          error={errors.phone?.message}
          autoComplete="username"
          inputMode="tel"
          {...register('phone')}
        />

        <div>
          <Input
            id="password"
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
          <div className="flex justify-end mt-1.5">
            <a href="/forgot-password" className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">
              {t.forgot}
            </a>
          </div>
        </div>

        <Button type="submit" className="w-full h-11 text-sm font-semibold" loading={isSubmitting} size="lg">
          {!isSubmitting && <span className="me-1.5">🔑</span>}
          {t.submit}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[hsl(var(--border))]" />
        <span className="text-xs text-[hsl(var(--muted-foreground))]">{t.noAcc}</span>
        <div className="flex-1 h-px bg-[hsl(var(--border))]" />
      </div>

      {/* Register link */}
      <a href="/register"
        className="flex items-center justify-center w-full h-11 rounded-xl border border-[hsl(var(--border))] text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)] hover:border-[hsl(var(--primary)/0.4)] transition-all">
        {t.register} →
      </a>
    </div>
  );
}
