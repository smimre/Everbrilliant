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
import { Eye, EyeOff, Building2 } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Min 2 characters'),
  phone: z.string().min(1, 'Required'),
  password: z.string().min(6, 'Min 6 characters'),
  companyName: z.string().optional(),
  inviteCode: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

const TRANSLATIONS = {
  en: {
    title: 'Everbrilliant',
    subtitle: 'B2B Trading & ERP Platform',
    name: 'Full Name',
    namePh: 'Your full name',
    phone: 'Mobile Number',
    phonePh: 'Phone number',
    password: 'Password',
    passPh: '••••••••',
    company: 'Company Name',
    companyPh: 'Your company (optional)',
    invite: 'Invite Code',
    invitePh: 'Referral code (optional)',
    submit: 'Create Account',
    hasAcc: 'Already have an account?',
    login: 'Sign In',
  },
  fa: {
    title: 'سامانه بازرگانی',
    subtitle: 'پلتفرم خرید، فروش و مزایده',
    name: 'نام و نام‌خانوادگی',
    namePh: 'نام کامل',
    phone: 'شماره موبایل',
    phonePh: 'شماره موبایل',
    password: 'رمز عبور',
    passPh: '••••••••',
    company: 'نام شرکت',
    companyPh: 'نام شرکت (اختیاری)',
    invite: 'کد دعوت',
    invitePh: 'کد معرف (اختیاری)',
    submit: 'ایجاد حساب',
    hasAcc: 'حساب دارید؟',
    login: 'ورود',
  },
  ar: {
    title: 'إيفربريليانت',
    subtitle: 'منصة تجارة B2B',
    name: 'الاسم الكامل',
    namePh: 'اسمك الكامل',
    phone: 'رقم الجوال',
    phonePh: 'رقم الجوال',
    password: 'كلمة المرور',
    passPh: '••••••••',
    company: 'اسم الشركة',
    companyPh: 'اسم الشركة (اختياري)',
    invite: 'رمز الدعوة',
    invitePh: 'رمز الإحالة (اختياري)',
    submit: 'إنشاء حساب',
    hasAcc: 'لديك حساب؟',
    login: 'تسجيل الدخول',
  },
  hi: {
    title: 'एवरब्रिलियंट',
    subtitle: 'B2B ट्रेडिंग प्लेटफॉर्म',
    name: 'पूरा नाम',
    namePh: 'आपका पूरा नाम',
    phone: 'मोबाइल नंबर',
    phonePh: 'फ़ोन नंबर',
    password: 'पासवर्ड',
    passPh: '••••••••',
    company: 'कंपनी का नाम',
    companyPh: 'कंपनी (वैकल्पिक)',
    invite: 'आमंत्रण कोड',
    invitePh: 'रेफरल कोड (वैकल्पिक)',
    submit: 'खाता बनाएं',
    hasAcc: 'पहले से खाता है?',
    login: 'साइन इन',
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { lang } = useLocaleStore();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError('');
      const result = await authService.register(data);
      // Store the token first so the api client can use it for me()
      setAuth(result.user as any, result.accessToken);
      // Fetch full user profile (register response only returns id/name/phone)
      const fullUser = await authService.me();
      setAuth(fullUser, result.accessToken);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="w-full max-w-sm mx-4 animate-in">

      <div className="flex justify-end mb-6">
        <LanguageSelector />
      </div>

      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-8 shadow-[var(--shadow-xl)]">

        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center shadow-lg shadow-[hsl(var(--primary)/0.3)]">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">{t.title}</h1>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{t.subtitle}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))] px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label={t.name}
            placeholder={t.namePh}
            error={errors.name?.message}
            autoComplete="name"
            {...register('name')}
          />

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
            autoComplete="new-password"
            suffix={
              <button type="button" onClick={() => setShowPass(!showPass)} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            {...register('password')}
          />

          <Input
            label={t.company}
            placeholder={t.companyPh}
            error={errors.companyName?.message}
            {...register('companyName')}
          />

          <Input
            label={t.invite}
            placeholder={t.invitePh}
            error={errors.inviteCode?.message}
            {...register('inviteCode')}
          />

          <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
            {!isSubmitting && <span className="me-1">🏢</span>}
            {t.submit}
          </Button>
        </form>

        <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-6">
          {t.hasAcc}{' '}
          <a href="/login" className="text-[hsl(var(--primary))] hover:underline font-medium">
            {t.login}
          </a>
        </p>
      </div>
    </div>
  );
}
