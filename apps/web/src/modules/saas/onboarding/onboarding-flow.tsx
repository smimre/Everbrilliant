'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocaleStore } from '@/store/locale.store';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Building2, Users, Rocket, Check } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

type Step = 'company' | 'team' | 'plan' | 'done';

const steps: Step[] = ['company', 'team', 'plan', 'done'];

const companySchema = z.object({
  name:         z.string().min(2),
  nationalId:   z.string().optional(),
  economicCode: z.string().optional(),
  country:      z.string().default('Iran'),
  size:         z.string(),
});

type CompanyForm = z.infer<typeof companySchema>;

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { lang } = useLocaleStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState<Step>('company');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const isFa = lang === 'fa';

  const stepIndex = steps.indexOf(step);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: { country: 'Iran', size: 'small' },
  });

  const STEPS_META = [
    { key: 'company', icon: <Building2 className="h-5 w-5" />, label: isFa ? 'اطلاعات شرکت' : 'Company Info' },
    { key: 'team',    icon: <Users className="h-5 w-5" />,     label: isFa ? 'تیم' : 'Team' },
    { key: 'plan',    icon: <Rocket className="h-5 w-5" />,    label: isFa ? 'پلن' : 'Plan' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
      <div className="w-full max-w-xl">

        {/* Progress */}
        {step !== 'done' && (
          <div className="flex items-center gap-2 mb-8">
            {STEPS_META.map((s, i) => {
              const done = i < stepIndex;
              const active = s.key === step;
              return (
                <div key={s.key} className="flex items-center flex-1">
                  <div className={cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium flex-1',
                    active ? 'bg-[hsl(var(--primary))] text-white' :
                    done ? 'bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]' :
                    'bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]'
                  )}>
                    {done ? <Check className="h-4 w-4" /> : s.icon}
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < STEPS_META.length - 1 && (
                    <div className={cn('h-0.5 w-4 mx-1', done ? 'bg-[hsl(var(--success))]' : 'bg-[hsl(var(--border))]')} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Step: Company */}
        {step === 'company' && (
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-8 animate-in space-y-5">
            <div>
              <h2 className="text-2xl font-bold">{isFa ? '🏢 اطلاعات شرکت' : '🏢 Company Information'}</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                {isFa ? 'اطلاعات پایه شرکت خود را وارد کنید' : 'Enter your company details'}
              </p>
            </div>
            <form onSubmit={handleSubmit(() => setStep('team'))} className="space-y-4">
              <Input label={isFa ? 'نام شرکت *' : 'Company Name *'} {...register('name')} error={errors.name?.message} />
              <div className="grid grid-cols-2 gap-4">
                <Input label={isFa ? 'شناسه ملی' : 'National ID'} {...register('nationalId')} placeholder="10XXXXXXXXX" />
                <Input label={isFa ? 'کد اقتصادی' : 'Economic Code'} {...register('economicCode')} placeholder="411XXXXXXXXXX" />
              </div>
              <Select
                label={isFa ? 'اندازه شرکت' : 'Company Size'}
                {...register('size')}
                options={[
                  { value: 'solo',   label: isFa ? 'تک‌نفره' : 'Solo (1 person)' },
                  { value: 'small',  label: isFa ? 'کوچک (۲-۱۰)' : 'Small (2-10)' },
                  { value: 'medium', label: isFa ? 'متوسط (۱۱-۵۰)' : 'Medium (11-50)' },
                  { value: 'large',  label: isFa ? 'بزرگ (۵۰+)' : 'Large (50+)' },
                ]}
              />
              <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
                {isFa ? 'ادامه →' : 'Continue →'}
              </Button>
            </form>
          </div>
        )}

        {/* Step: Team */}
        {step === 'team' && (
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-8 animate-in space-y-5">
            <h2 className="text-2xl font-bold">{isFa ? '👥 دعوت تیم' : '👥 Invite Your Team'}</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {isFa ? 'این مرحله را فعلاً رد کنید و بعداً از تنظیمات اضافه کنید' : 'Skip for now and add team members from settings later'}
            </p>
            <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-8 text-center">
              <Users className="h-10 w-10 mx-auto mb-3 text-[hsl(var(--muted-foreground))]" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {isFa ? 'دعوت‌نامه را بعداً از بخش کاربران ارسال کنید' : 'Send invitations later from the Users section'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep('company')}>
                {isFa ? '← قبلی' : '← Back'}
              </Button>
              <Button className="flex-1" onClick={() => setStep('plan')}>
                {isFa ? 'ادامه →' : 'Continue →'}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Plan selection */}
        {step === 'plan' && (
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-8 animate-in space-y-5">
            <h2 className="text-2xl font-bold">{isFa ? '🚀 انتخاب پلن' : '🚀 Choose Your Plan'}</h2>
            <div className="space-y-3">
              {[
                { name: 'free', label: isFa ? 'رایگان — ۰ تومان' : 'Free — ₹0', desc: isFa ? '۲ کاربر | ۲۰ درخواست/ماه' : '2 users | 20 requests/mo' },
                { name: 'starter', label: isFa ? 'استارتر — ۴۹۹,۰۰۰ تومان/ماه' : 'Starter — ~$12/mo', desc: isFa ? '۵ کاربر | ۱۰۰ درخواست | ۱۴ روز رایگان' : '5 users | 100 requests | 14-day trial' },
                { name: 'pro', label: isFa ? 'حرفه‌ای — ۱,۴۹۹,۰۰۰ تومان/ماه' : 'Pro — ~$36/mo', desc: isFa ? '۲۵ کاربر | نامحدود | ۱۴ روز رایگان' : '25 users | advanced features | 14-day trial' },
              ].map(p => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setSelectedPlan(p.name)}
                  className={cn(
                    'w-full text-start rounded-xl border p-4 transition-all',
                    selectedPlan === p.name
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)]'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{p.label}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{p.desc}</p>
                    </div>
                    {selectedPlan === p.name && <Check className="h-5 w-5 text-[hsl(var(--primary))]" />}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep('team')}>
                {isFa ? '← قبلی' : '← Back'}
              </Button>
              <Button className="flex-1" onClick={() => setStep('done')} disabled={!selectedPlan}>
                {isFa ? 'شروع کنید 🎉' : 'Get Started 🎉'}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-8 animate-in text-center space-y-5">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl font-bold">{isFa ? 'آماده‌اید!' : 'You\'re all set!'}</h2>
            <p className="text-[hsl(var(--muted-foreground))]">
              {isFa
                ? `خوش آمدید ${user?.name?.split(' ')[0]}! سامانه برای استفاده آماده است.`
                : `Welcome ${user?.name?.split(' ')[0]}! Your workspace is ready.`}
            </p>
            <Button className="w-full" size="lg" onClick={onComplete}>
              {isFa ? 'ورود به داشبورد →' : 'Go to Dashboard →'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
