// ══════════════════════════════════════════════════════════════
// Pricing Page — public-facing plan comparison
// ══════════════════════════════════════════════════════════════
'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useLocaleStore } from '@/store/locale.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Check, X, Zap } from 'lucide-react';

const T = {
  en: { monthly:'Monthly', annual:'Annual (2 months free)', save:'Save 17%', perMonth:'/mo', perYear:'/yr',
    currentPlan:'Current Plan', upgrade:'Upgrade', startTrial:'Start Free Trial',
    popular:'Most Popular', unlimited:'Unlimited' },
  fa: { monthly:'ماهانه', annual:'سالانه (۲ ماه رایگان)', save:'۱۷٪ صرفه‌جویی', perMonth:'/ ماه', perYear:'/ سال',
    currentPlan:'پلن فعلی', upgrade:'ارتقا', startTrial:'شروع آزمایشی رایگان',
    popular:'محبوب‌ترین', unlimited:'نامحدود' },
};

const FEATURE_LABELS: Record<string, { en: string; fa: string }> = {
  realtime:        { en: 'Real-time notifications', fa: 'اعلان‌های زنده' },
  whiteLabel:      { en: 'White-label branding', fa: 'برندینگ اختصاصی' },
  apiAccess:       { en: 'API access', fa: 'دسترسی API' },
  advancedReports: { en: 'Advanced reports', fa: 'گزارشات پیشرفته' },
  customWorkflow:  { en: 'Custom workflows', fa: 'گردش‌کار سفارشی' },
  multiCurrency:   { en: 'Multi-currency', fa: 'چند ارزه' },
  prioritySupport: { en: 'Priority support', fa: 'پشتیبانی اولویت‌دار' },
  ssoEnabled:      { en: 'SSO / SAML', fa: 'ورود یکپارچه' },
};

const PLAN_COLORS: Record<string, string> = {
  free: 'from-slate-500 to-slate-700',
  starter: 'from-blue-500 to-blue-700',
  pro: 'from-purple-500 to-purple-700',
  enterprise: 'from-amber-500 to-amber-700',
};

interface PricingPageProps {
  currentPlanName?: string;
  onSelectPlan?: (planId: string, cycle: 'MONTHLY' | 'ANNUAL') => void;
}

export function PricingPage({ currentPlanName, onSelectPlan }: PricingPageProps) {
  const { lang } = useLocaleStore();
  const [cycle, setCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const t = T[lang as keyof typeof T] || T.en;

  const { data: plans, isLoading } = useQuery({
    queryKey: ['saas', 'plans', lang],
    queryFn: () => api.get<any[]>('/saas/plans', { lang }),
    staleTime: 60 * 60 * 1000,
  });

  const fmt = (n: number) => {
    if (n === 0) return lang === 'fa' ? 'رایگان' : 'Free';
    return new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(Math.round(n / 1000)) + 'K';
  };

  return (
    <div className="py-12 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">
          {lang === 'fa' ? 'پلن‌های اشتراک' : 'Subscription Plans'}
        </h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          {lang === 'fa' ? 'برای هر اندازه کسب‌وکار' : 'For every business size'}
        </p>

        {/* Billing cycle toggle */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setCycle('MONTHLY')}
            className={cn('px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
              cycle === 'MONTHLY' ? 'bg-[hsl(var(--primary))] text-white' : 'text-[hsl(var(--muted-foreground))]'
            )}
          >
            {t.monthly}
          </button>
          <button
            onClick={() => setCycle('ANNUAL')}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
              cycle === 'ANNUAL' ? 'bg-[hsl(var(--primary))] text-white' : 'text-[hsl(var(--muted-foreground))]'
            )}
          >
            {t.annual}
            <Badge variant="success" className="text-[10px]">{t.save}</Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {(isLoading ? Array.from({length:4}) : plans || []).map((plan: any, i: number) => {
          if (isLoading) return (
            <div key={i} className="rounded-2xl border border-[hsl(var(--border))] p-6 animate-pulse h-96 bg-[hsl(var(--muted))]" />
          );

          const isCurrent = plan.name === currentPlanName;
          const isPopular = plan.name === 'pro';
          const price = cycle === 'ANNUAL' ? plan.priceAnnual : plan.priceMonthly;
          const features = plan.features || {};
          const limits = plan.limits || {};
          const gradient = PLAN_COLORS[plan.name] || PLAN_COLORS.free;

          return (
            <div key={plan.id}
              className={cn(
                'relative rounded-2xl border overflow-hidden transition-all duration-200',
                isPopular
                  ? 'border-[hsl(var(--primary))] shadow-xl shadow-[hsl(var(--primary)/0.15)] scale-[1.02]'
                  : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] hover:shadow-lg'
              )}
            >
              {/* Popular badge */}
              {isPopular && (
                <div className="absolute top-0 inset-x-0 bg-[hsl(var(--primary))] text-white text-xs font-bold text-center py-1.5 flex items-center justify-center gap-1">
                  <Zap className="h-3 w-3" /> {t.popular}
                </div>
              )}

              <div className={cn('p-6 bg-gradient-to-br text-white', gradient, isPopular && 'mt-7')}>
                <h3 className="font-bold text-lg">{lang === 'fa' ? (plan.nameFa || plan.name) : plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">{fmt(price)}</span>
                  {price > 0 && <span className="text-sm opacity-80">{cycle === 'ANNUAL' ? t.perYear : t.perMonth}</span>}
                </div>
                {plan.trialDays > 0 && !isCurrent && (
                  <p className="text-xs mt-1 opacity-80">
                    {plan.trialDays} {lang === 'fa' ? 'روز رایگان' : 'days free trial'}
                  </p>
                )}
              </div>

              <div className="p-5 bg-[hsl(var(--secondary))] flex-1 space-y-4">
                {/* Limits */}
                <div className="space-y-1.5 text-sm">
                  {[
                    { key: 'maxUsers',       fa: 'کاربر', en: 'Users' },
                    { key: 'maxRequests',    fa: 'درخواست/ماه', en: 'Requests/mo' },
                    { key: 'maxInvoices',    fa: 'فاکتور/ماه', en: 'Invoices/mo' },
                    { key: 'maxTenders',     fa: 'مزایده', en: 'Tenders' },
                  ].map(l => {
                    const v = limits[l.key];
                    return (
                      <div key={l.key} className="flex justify-between">
                        <span className="text-[hsl(var(--muted-foreground))]">{lang === 'fa' ? l.fa : l.en}</span>
                        <span className="font-semibold">
                          {v === -1 ? (lang === 'fa' ? 'نامحدود ∞' : 'Unlimited ∞')
                            : new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(v)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-[hsl(var(--border))]" />

                {/* Features */}
                <div className="space-y-1.5">
                  {Object.entries(FEATURE_LABELS).map(([key, labels]) => {
                    const has = !!features[key];
                    return (
                      <div key={key} className={cn('flex items-center gap-2 text-xs', !has && 'opacity-40')}>
                        {has
                          ? <Check className="h-3.5 w-3.5 text-[hsl(var(--success))] shrink-0" />
                          : <X className="h-3.5 w-3.5 shrink-0" />
                        }
                        <span>{lang === 'fa' ? labels.fa : labels.en}</span>
                      </div>
                    );
                  })}
                </div>

                {/* CTA */}
                <div className="pt-2">
                  {isCurrent ? (
                    <Button variant="secondary" className="w-full" disabled>
                      {t.currentPlan}
                    </Button>
                  ) : plan.trialDays > 0 ? (
                    <Button className="w-full" onClick={() => onSelectPlan?.(plan.id, cycle)}>
                      {t.startTrial}
                    </Button>
                  ) : (
                    <Button
                      variant={isPopular ? 'default' : 'secondary'}
                      className="w-full"
                      onClick={() => onSelectPlan?.(plan.id, cycle)}
                    >
                      {t.upgrade}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
