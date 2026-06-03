'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { Check, Zap, Building2, Star, Crown, Phone } from 'lucide-react';
import { useUIStore } from '@/store';

interface Plan {
  id: string;
  name: { fa: string; en: string };
  icon: string;
  color: string;
  priceMonthly: number;
  priceAnnual: number;
  period: { fa: string; en: string };
  limits: { requests: number; users: number; storage: string; contracts: number };
  features: { fa: string; en: string }[];
  popular?: boolean;
  enterprise?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: { fa: 'رایگان', en: 'Free' },
    icon: '🆓',
    color: '#6b7280',
    priceMonthly: 0,
    priceAnnual: 0,
    period: { fa: 'ماهانه', en: 'monthly' },
    limits: { requests: 10, users: 2, storage: '100MB', contracts: 3 },
    features: [
      { fa: 'درخواست خرید/فروش', en: 'Buy/Sell requests' },
      { fa: 'پیام‌رسانی', en: 'Messaging' },
      { fa: 'یک کاربر', en: 'Single user' },
      { fa: 'گزارش پایه', en: 'Basic reports' },
    ],
  },
  {
    id: 'basic',
    name: { fa: 'پایه', en: 'Basic' },
    icon: '⭐',
    color: '#3b82f6',
    priceMonthly: 490000,
    priceAnnual: 408000,
    period: { fa: 'ماهانه', en: 'monthly' },
    limits: { requests: 100, users: 5, storage: '1GB', contracts: 50 },
    features: [
      { fa: 'همه ماژول بازرگانی', en: 'All trading modules' },
      { fa: 'لجستیک پایه', en: 'Basic logistics' },
      { fa: 'تا ۵ کاربر', en: 'Up to 5 users' },
      { fa: 'گزارش‌های کامل', en: 'Full reports' },
      { fa: 'پشتیبانی ایمیل', en: 'Email support' },
    ],
  },
  {
    id: 'pro',
    name: { fa: 'حرفه‌ای', en: 'Pro' },
    icon: '💎',
    color: '#7c3aed',
    priceMonthly: 990000,
    priceAnnual: 825000,
    period: { fa: 'ماهانه', en: 'monthly' },
    limits: { requests: -1, users: 20, storage: '10GB', contracts: -1 },
    features: [
      { fa: 'همه ماژول‌ها', en: 'All modules' },
      { fa: 'دسترسی API', en: 'API access' },
      { fa: 'تا ۲۰ کاربر', en: 'Up to 20 users' },
      { fa: 'گمرک پیشرفته', en: 'Advanced customs' },
      { fa: 'نوتیفیکیشن SMS', en: 'SMS notifications' },
      { fa: 'پشتیبانی تلفنی', en: 'Phone support' },
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: { fa: 'سازمانی', en: 'Enterprise' },
    icon: '🏢',
    color: '#d97706',
    priceMonthly: -1,
    priceAnnual: -1,
    period: { fa: 'سفارشی', en: 'custom' },
    limits: { requests: -1, users: -1, storage: 'نامحدود / Unlimited', contracts: -1 },
    features: [
      { fa: 'همه امکانات Pro', en: 'All Pro features' },
      { fa: 'نصب روی سرور اختصاصی', en: 'Private server install' },
      { fa: 'API اختصاصی', en: 'Dedicated API' },
      { fa: 'آموزش تیم', en: 'Team training' },
      { fa: 'SLA اختصاصی', en: 'Custom SLA' },
      { fa: 'پنل مدیریت اختصاصی', en: 'Dedicated admin panel' },
    ],
    enterprise: true,
  },
];

function fmt(n: number, fa: boolean) {
  if (n === 0)  return fa ? 'رایگان' : 'Free';
  if (n === -1) return fa ? 'تماس بگیرید' : 'Contact Us';
  return new Intl.NumberFormat(fa ? 'fa-IR' : 'en-US').format(n) + (fa ? ' ریال' : ' IRR');
}

function LimitRow({ label, value, fa }: { label: string; value: number | string; fa: boolean }) {
  const display = value === -1 ? (fa ? '∞ نامحدود' : '∞ Unlimited') : String(value);
  return (
    <div className="flex justify-between text-xs py-1">
      <span className="text-[hsl(var(--muted-foreground))]">{label}</span>
      <span className="font-semibold">{display}</span>
    </div>
  );
}

export function PricingPlansPage() {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('monthly');
  const [currentPlan] = useState('basic');
  const [showContact, setShowContact] = useState(false);

  const selectPlan = (plan: Plan) => {
    if (plan.enterprise) { setShowContact(true); return; }
    if (plan.id === currentPlan) return;
    toast('info', fa
      ? `پلن "${plan.name.fa}" انتخاب شد — در حالت واقعی به درگاه پرداخت منتقل می‌شوید`
      : `Plan "${plan.name.en}" selected — in production you would be redirected to payment`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          {fa ? '💎 پلن‌های اشتراک' : '💎 Subscription Plans'}
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] text-sm">
          {fa ? 'پلن مناسب کسب‌وکار خود را انتخاب کنید' : 'Choose the right plan for your business'}
        </p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-1 bg-[hsl(var(--secondary))] rounded-xl p-1 w-fit mx-auto mt-4">
          <button onClick={() => setCycle('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${cycle === 'monthly' ? 'bg-[hsl(var(--primary))] text-white' : 'text-[hsl(var(--muted-foreground))]'}`}>
            {fa ? 'ماهانه' : 'Monthly'}
          </button>
          <button onClick={() => setCycle('annual')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${cycle === 'annual' ? 'bg-[hsl(var(--primary))] text-white' : 'text-[hsl(var(--muted-foreground))]'}`}>
            {fa ? 'سالانه' : 'Annual'}
            <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full">
              {fa ? '۱۷٪ تخفیف' : '17% off'}
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {PLANS.map(plan => {
          const isCurrent = plan.id === currentPlan;
          const price = cycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;

          return (
            <div key={plan.id}
              className={`relative rounded-2xl border overflow-hidden transition-all duration-200 ${
                plan.popular
                  ? 'border-[hsl(var(--primary))] shadow-xl shadow-[hsl(var(--primary)/0.15)] scale-[1.02]'
                  : isCurrent
                  ? `border-2 shadow-lg`
                  : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] hover:shadow-md'
              }`}
              style={isCurrent ? { borderColor: plan.color } : {}}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-0 inset-x-0 py-1.5 text-white text-xs font-bold text-center flex items-center justify-center gap-1"
                  style={{ background: plan.color }}>
                  <Zap className="w-3 h-3"/> {fa ? '⭐ محبوب‌ترین' : '⭐ Most Popular'}
                </div>
              )}

              {/* Header */}
              <div className={`p-5 text-white ${plan.popular ? 'pt-8' : ''}`}
                style={{ background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)` }}>
                <div className="text-3xl mb-2">{plan.icon}</div>
                <h3 className="font-bold text-lg">{fa ? plan.name.fa : plan.name.en}</h3>
                <div className="mt-3">
                  {plan.priceMonthly === -1 ? (
                    <div className="text-xl font-bold">{fa ? 'تماس بگیرید' : 'Contact Us'}</div>
                  ) : plan.priceMonthly === 0 ? (
                    <div className="text-2xl font-black">{fa ? 'رایگان' : 'Free'}</div>
                  ) : (
                    <>
                      <div className="text-2xl font-black">{new Intl.NumberFormat(fa ? 'fa-IR' : 'en-US').format(price)}</div>
                      <div className="text-xs opacity-80">{fa ? 'ریال / ماه' : 'IRR / mo'}</div>
                    </>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 bg-[hsl(var(--secondary))] space-y-3">
                {/* Limits */}
                <div className="bg-[hsl(var(--background))] rounded-lg p-3 space-y-1">
                  <LimitRow label={fa ? 'درخواست/ماه' : 'Requests/mo'} value={plan.limits.requests} fa={fa}/>
                  <LimitRow label={fa ? 'کاربران' : 'Users'} value={plan.limits.users} fa={fa}/>
                  <LimitRow label={fa ? 'فضای ذخیره' : 'Storage'} value={plan.limits.storage} fa={fa}/>
                  <LimitRow label={fa ? 'قراردادها' : 'Contracts'} value={plan.limits.contracts} fa={fa}/>
                </div>

                <div className="border-t border-[hsl(var(--border))]"/>

                {/* Features */}
                <div className="space-y-1.5">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 shrink-0" style={{ color: plan.color }}/>
                      <span>{fa ? f.fa : f.en}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="pt-2">
                  {isCurrent ? (
                    <button disabled
                      className="w-full py-2 rounded-xl text-sm font-bold border-2 cursor-default"
                      style={{ borderColor: plan.color, color: plan.color, background: plan.color + '15' }}>
                      ✅ {fa ? 'پلن فعلی شما' : 'Current Plan'}
                    </button>
                  ) : plan.enterprise ? (
                    <button onClick={() => selectPlan(plan)}
                      className="w-full py-2 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1.5"
                      style={{ background: plan.color }}>
                      <Phone className="w-3.5 h-3.5"/> {fa ? 'تماس بگیرید' : 'Contact Us'}
                    </button>
                  ) : (
                    <button onClick={() => selectPlan(plan)}
                      className="w-full py-2 rounded-xl text-sm font-bold text-white"
                      style={{ background: plan.color }}>
                      {fa ? 'انتخاب پلن' : 'Choose Plan'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current plan info */}
      <div className="text-center text-sm text-[hsl(var(--muted-foreground))]">
        {fa
          ? <>پلن فعلی شما: <strong className="text-[hsl(var(--foreground))]">پایه</strong> | تمدید خودکار: فعال</>
          : <>Current plan: <strong className="text-[hsl(var(--foreground))]">Basic</strong> | Auto-renewal: Active</>}
      </div>

      {/* Enterprise Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(var(--background))] rounded-2xl p-8 w-full max-w-sm border border-[hsl(var(--border))] text-center">
            <div className="text-5xl mb-4">🏢</div>
            <h3 className="font-bold text-lg mb-2">{fa ? 'پلن سازمانی' : 'Enterprise Plan'}</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
              {fa ? 'برای دریافت قیمت سفارشی با ما تماس بگیرید' : 'Contact us for custom pricing'}
            </p>
            <div className="space-y-2 text-sm mb-6">
              <div className="text-[hsl(var(--primary))]">📧 info@everbrilliant.ir</div>
              <div className="text-[hsl(var(--primary))]">📞 ۰۲۱-۱۲۳۴-۵۶۷۸</div>
            </div>
            <button onClick={() => setShowContact(false)}
              className="px-6 py-2 bg-[hsl(var(--primary))] text-white rounded-xl text-sm font-bold">
              {fa ? 'باشه' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
