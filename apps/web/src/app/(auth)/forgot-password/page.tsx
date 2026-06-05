'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageSelector } from '@/components/layout/language-selector';
import { useLocaleStore } from '@/store/locale.store';
import { Building2, ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const requestSchema = z.object({
  identifier: z.string().min(1, 'Required'),
});

const resetSchema = z.object({
  token: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Digits only'),
  password: z.string().min(6, 'Min 6 characters'),
  confirm: z.string().min(6, 'Min 6 characters'),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

type RequestForm = z.infer<typeof requestSchema>;
type ResetForm = z.infer<typeof resetSchema>;

const T = {
  en: {
    title: 'Reset Password',
    subtitle: 'Enter your phone number or email to receive a reset code',
    identifier: 'Phone or Email',
    identifierPh: 'Phone number or email address',
    send: 'Send Code',
    codeTitle: 'Enter Reset Code',
    codeSubtitle: 'A 6-digit code was sent to your phone or email',
    code: 'Reset Code',
    codePh: '6-digit code',
    newPass: 'New Password',
    confirmPass: 'Confirm Password',
    passPh: '••••••••',
    reset: 'Reset Password',
    back: 'Back to Login',
    tryAnother: 'Try another',
    doneTitle: 'Password Reset',
    doneMsg: 'Your password has been reset. You can now sign in.',
    signIn: 'Sign In',
  },
  fa: {
    title: 'بازیابی رمز عبور',
    subtitle: 'شماره موبایل یا ایمیل خود را وارد کنید',
    identifier: 'موبایل یا ایمیل',
    identifierPh: 'شماره موبایل یا آدرس ایمیل',
    send: 'ارسال کد',
    codeTitle: 'کد بازیابی را وارد کنید',
    codeSubtitle: 'کد ۶ رقمی به موبایل یا ایمیل شما ارسال شد',
    code: 'کد بازیابی',
    codePh: 'کد ۶ رقمی',
    newPass: 'رمز عبور جدید',
    confirmPass: 'تکرار رمز عبور',
    passPh: '••••••••',
    reset: 'تغییر رمز عبور',
    back: 'بازگشت به ورود',
    tryAnother: 'تلاش مجدد',
    doneTitle: 'رمز عبور تغییر کرد',
    doneMsg: 'رمز عبور شما با موفقیت تغییر کرد.',
    signIn: 'ورود به سیستم',
  },
  ar: {
    title: 'استعادة كلمة المرور',
    subtitle: 'أدخل رقم هاتفك أو بريدك لتلقي رمز إعادة التعيين',
    identifier: 'الجوال أو البريد',
    identifierPh: 'رقم الجوال أو البريد الإلكتروني',
    send: 'إرسال الرمز',
    codeTitle: 'أدخل رمز إعادة التعيين',
    codeSubtitle: 'تم إرسال رمز مكون من 6 أرقام إلى هاتفك أو بريدك',
    code: 'رمز إعادة التعيين',
    codePh: 'رمز 6 أرقام',
    newPass: 'كلمة المرور الجديدة',
    confirmPass: 'تأكيد كلمة المرور',
    passPh: '••••••••',
    reset: 'إعادة تعيين كلمة المرور',
    back: 'العودة لتسجيل الدخول',
    tryAnother: 'حاول مرة أخرى',
    doneTitle: 'تم إعادة التعيين',
    doneMsg: 'تم إعادة تعيين كلمة المرور بنجاح.',
    signIn: 'تسجيل الدخول',
  },
  hi: {
    title: 'पासवर्ड रीसेट',
    subtitle: 'रीसेट कोड पाने के लिए फोन या ईमेल दर्ज करें',
    identifier: 'फोन या ईमेल',
    identifierPh: 'फोन नंबर या ईमेल पता',
    send: 'कोड भेजें',
    codeTitle: 'रीसेट कोड दर्ज करें',
    codeSubtitle: '6 अंकों का कोड आपके फोन या ईमेल पर भेजा गया',
    code: 'रीसेट कोड',
    codePh: '6 अंकों का कोड',
    newPass: 'नया पासवर्ड',
    confirmPass: 'पासवर्ड की पुष्टि करें',
    passPh: '••••••••',
    reset: 'पासवर्ड रीसेट करें',
    back: 'लॉगिन पर वापस',
    tryAnother: 'फिर कोशिश करें',
    doneTitle: 'पासवर्ड रीसेट',
    doneMsg: 'आपका पासवर्ड रीसेट हो गया। अब साइन इन करें।',
    signIn: 'साइन इन',
  },
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { lang } = useLocaleStore();
  const t = T[lang as keyof typeof T] || T.en;

  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const requestForm = useForm<RequestForm>({ resolver: zodResolver(requestSchema) });
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  const onRequest = async (data: RequestForm) => {
    try {
      setError('');
      await authService.forgotPassword(data.identifier);
      setIdentifier(data.identifier);
      setStep('reset');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  const onReset = async (data: ResetForm) => {
    try {
      setError('');
      await authService.resetPassword(data.token, data.password);
      setStep('done');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code');
    }
  };

  return (
    <div className="w-full max-w-sm mx-4 animate-in">
      <div className="flex justify-end mb-6">
        <LanguageSelector />
      </div>

      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-8 shadow-[var(--shadow-xl)]">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center shadow-lg shadow-[hsl(var(--primary)/0.3)]">
            <Building2 className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* ── Step: request ── */}
        {step === 'request' && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">{t.title}</h1>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{t.subtitle}</p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))] px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={requestForm.handleSubmit(onRequest)} noValidate className="space-y-4">
              <Input
                label={t.identifier}
                placeholder={t.identifierPh}
                error={requestForm.formState.errors.identifier?.message}
                autoComplete="username"
                {...requestForm.register('identifier')}
              />
              <Button type="submit" className="w-full" loading={requestForm.formState.isSubmitting} size="lg">
                {t.send}
              </Button>
            </form>

            <p className="text-center mt-6">
              <Link href="/login" className="text-sm text-[hsl(var(--primary))] hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                {t.back}
              </Link>
            </p>
          </>
        )}

        {/* ── Step: reset ── */}
        {step === 'reset' && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">{t.codeTitle}</h1>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{t.codeSubtitle}</p>
              <p className="text-xs font-medium text-[hsl(var(--foreground))] mt-1 truncate">{identifier}</p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))] px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={resetForm.handleSubmit(onReset)} noValidate className="space-y-4">
              <Input
                label={t.code}
                placeholder={t.codePh}
                inputMode="numeric"
                maxLength={6}
                error={resetForm.formState.errors.token?.message}
                autoComplete="one-time-code"
                {...resetForm.register('token')}
              />
              <Input
                label={t.newPass}
                placeholder={t.passPh}
                type={showPass ? 'text' : 'password'}
                error={resetForm.formState.errors.password?.message}
                autoComplete="new-password"
                suffix={
                  <button type="button" onClick={() => setShowPass(!showPass)} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                {...resetForm.register('password')}
              />
              <Input
                label={t.confirmPass}
                placeholder={t.passPh}
                type={showConfirm ? 'text' : 'password'}
                error={resetForm.formState.errors.confirm?.message}
                autoComplete="new-password"
                suffix={
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                {...resetForm.register('confirm')}
              />
              <Button type="submit" className="w-full" loading={resetForm.formState.isSubmitting} size="lg">
                {t.reset}
              </Button>
            </form>

            <button
              onClick={() => { setStep('request'); setError(''); }}
              className="text-center w-full mt-4 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              {t.tryAnother}
            </button>
          </>
        )}

        {/* ── Step: done ── */}
        {step === 'done' && (
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">{t.doneTitle}</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">{t.doneMsg}</p>
            <Button onClick={() => router.push('/login')} className="w-full" size="lg">
              {t.signIn}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
