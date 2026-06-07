'use client';
export const dynamic = 'force-dynamic';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useLocaleStore } from '@/store/locale.store';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CountrySelector } from '@/components/ui/country-selector';
import { Eye, EyeOff, Building2, User, ChevronRight, ChevronLeft, ImagePlus, Check } from 'lucide-react';

const T = {
  en: {
    title: 'Everbrilliant',
    subtitle: 'B2B Trading & ERP Platform',
    step1: 'Personal Info',
    step2: 'Company Info',
    step3: 'Branding',
    fname: 'First Name', fnamePh: 'First name',
    lname: 'Last Name',  lnamePh: 'Last name',
    phone: 'Mobile Number', phonePh: 'Phone number',
    password: 'Password', passPh: '••••••••',
    passStrength: ['', 'Weak', 'Fair', 'Strong', 'Very Strong'],
    company: 'Company Name', companyPh: 'Your company name',
    type: 'Business Type',
    country: 'Country',
    email: 'Email', emailPh: 'company@example.com',
    invite: 'Invite Code', invitePh: 'Referral code (optional)',
    logo: 'Company Logo',
    stamp: 'Company Stamp/Seal',
    uploadLogo: 'Upload Logo',
    uploadStamp: 'Upload Stamp',
    skip: 'Skip for now',
    next: 'Next',
    back: 'Back',
    submit: 'Create Account',
    hasAcc: 'Already have an account?',
    login: 'Sign In',
    types: {
      trading: '📊 Trading',
      logistics: '🚛 Logistics',
      manufacturer: '🏭 Manufacturing',
      both: '🔄 Trading + Logistics',
    },
  },
  fa: {
    title: 'سامانه بازرگانی',
    subtitle: 'پلتفرم خرید، فروش و مزایده',
    step1: 'اطلاعات شخصی',
    step2: 'اطلاعات شرکت',
    step3: 'برندینگ',
    fname: 'نام', fnamePh: 'نام',
    lname: 'نام‌خانوادگی', lnamePh: 'نام‌خانوادگی',
    phone: 'شماره موبایل', phonePh: 'شماره موبایل',
    password: 'رمز عبور', passPh: '••••••••',
    passStrength: ['', 'ضعیف', 'متوسط', 'قوی', 'خیلی قوی'],
    company: 'نام شرکت', companyPh: 'نام شرکت یا کسب‌وکار',
    type: 'نوع فعالیت',
    country: 'کشور',
    email: 'ایمیل', emailPh: 'company@example.com',
    invite: 'کد دعوت', invitePh: 'کد معرف (اختیاری)',
    logo: 'لوگوی شرکت',
    stamp: 'مهر / تمبر شرکت',
    uploadLogo: 'آپلود لوگو',
    uploadStamp: 'آپلود مهر',
    skip: 'فعلاً رد شو',
    next: 'بعدی',
    back: 'بازگشت',
    submit: 'ایجاد حساب',
    hasAcc: 'حساب دارید؟',
    login: 'ورود',
    types: {
      trading: '📊 بازرگانی',
      logistics: '🚛 حمل‌ونقل',
      manufacturer: '🏭 تولیدی',
      both: '🔄 بازرگانی + حمل',
    },
  },
  ar: {
    title: 'إيفربريليانت',
    subtitle: 'منصة تجارة B2B',
    step1: 'معلومات شخصية',
    step2: 'معلومات الشركة',
    step3: 'الهوية',
    fname: 'الاسم الأول', fnamePh: 'الاسم الأول',
    lname: 'اسم العائلة', lnamePh: 'اسم العائلة',
    phone: 'رقم الجوال', phonePh: 'رقم الجوال',
    password: 'كلمة المرور', passPh: '••••••••',
    passStrength: ['', 'ضعيف', 'متوسط', 'قوي', 'قوي جداً'],
    company: 'اسم الشركة', companyPh: 'اسم شركتك',
    type: 'نوع النشاط',
    country: 'الدولة',
    email: 'البريد الإلكتروني', emailPh: 'company@example.com',
    invite: 'رمز الدعوة', invitePh: 'رمز الإحالة (اختياري)',
    logo: 'شعار الشركة',
    stamp: 'ختم الشركة',
    uploadLogo: 'رفع الشعار',
    uploadStamp: 'رفع الختم',
    skip: 'تخطي الآن',
    next: 'التالي',
    back: 'رجوع',
    submit: 'إنشاء حساب',
    hasAcc: 'لديك حساب؟',
    login: 'تسجيل الدخول',
    types: {
      trading: '📊 تجارة',
      logistics: '🚛 لوجستيك',
      manufacturer: '🏭 تصنيع',
      both: '🔄 تجارة + لوجستيك',
    },
  },
  hi: {
    title: 'एवरब्रिलियंट',
    subtitle: 'B2B ट्रेडिंग प्लेटफॉर्म',
    step1: 'व्यक्तिगत जानकारी',
    step2: 'कंपनी जानकारी',
    step3: 'ब्रांडिंग',
    fname: 'पहला नाम', fnamePh: 'पहला नाम',
    lname: 'उपनाम', lnamePh: 'उपनाम',
    phone: 'मोबाइल नंबर', phonePh: 'फ़ोन नंबर',
    password: 'पासवर्ड', passPh: '••••••••',
    passStrength: ['', 'कमज़ोर', 'ठीक', 'मज़बूत', 'बहुत मज़बूत'],
    company: 'कंपनी का नाम', companyPh: 'आपकी कंपनी',
    type: 'व्यवसाय प्रकार',
    country: 'देश',
    email: 'ईमेल', emailPh: 'company@example.com',
    invite: 'आमंत्रण कोड', invitePh: 'रेफरल कोड (वैकल्पिक)',
    logo: 'कंपनी लोगो',
    stamp: 'कंपनी मुहर',
    uploadLogo: 'लोगो अपलोड',
    uploadStamp: 'मुहर अपलोड',
    skip: 'अभी छोड़ें',
    next: 'अगला',
    back: 'वापस',
    submit: 'खाता बनाएं',
    hasAcc: 'पहले से खाता है?',
    login: 'साइन इन',
    types: {
      trading: '📊 ट्रेडिंग',
      logistics: '🚛 लॉजिस्टिक्स',
      manufacturer: '🏭 मैन्युफैक्चरिंग',
      both: '🔄 ट्रेडिंग + लॉजिस्टिक्स',
    },
  },
};

function passStrength(p: string): number {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p) || /[a-z]/.test(p)) s += 0.5;
  if (/[0-9]/.test(p)) s += 0.5;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(4, Math.round(s));
}

const STRENGTH_COLORS = ['', '#ef4444', '#f59e0b', '#10b981', '#06b6d4'];

function ImageUploadBox({
  label, hint, value, onChange,
}: { label: string; hint: string; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{label}</label>
      <div
        onClick={() => ref.current?.click()}
        className="relative border-2 border-dashed border-[hsl(var(--border))] rounded-xl p-4 text-center cursor-pointer hover:border-[hsl(var(--primary)/0.5)] transition-colors group"
      >
        {value ? (
          <div className="flex flex-col items-center gap-2">
            <img src={value} alt="preview" className="h-16 object-contain rounded-lg"/>
            <span className="text-xs text-[hsl(var(--primary))]">{label}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <ImagePlus className="w-8 h-8 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors"/>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">{hint}</span>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile}/>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { lang } = useLocaleStore();
  const t = (T as any)[lang] || T.en;

  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Step 2
  const [companyName, setCompanyName] = useState('');
  const [bizType, setBizType] = useState('trading');
  const [country, setCountry] = useState('IR');
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  // Step 3
  const [logo, setLogo] = useState('');
  const [stamp, setStamp] = useState('');

  const strength = passStrength(password);

  const validateStep1 = () => {
    if (!fname.trim()) return t.fname + ' ' + (lang === 'fa' ? 'الزامی است' : 'is required');
    if (!phone.trim()) return t.phone + ' ' + (lang === 'fa' ? 'الزامی است' : 'is required');
    if (password.length < 6) return lang === 'fa' ? 'رمز عبور حداقل ۶ کاراکتر' : 'Password must be at least 6 chars';
    return '';
  };

  const validateStep2 = () => {
    if (!companyName.trim()) return t.company + ' ' + (lang === 'fa' ? 'الزامی است' : 'is required');
    return '';
  };

  const onNext = () => {
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    }
    if (step === 2) {
      const err = validateStep2();
      if (err) { setError(err); return; }
    }
    setError('');
    setStep(s => s + 1);
  };

  const onSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      const name = [fname.trim(), lname.trim()].filter(Boolean).join(' ');
      const result = await authService.register({
        name,
        phone,
        password,
        companyName,
        inviteCode: inviteCode || undefined,
        // Extra fields stored in user profile
        ...(email && { email }),
        ...(country && { country }),
        ...(bizType && { businessType: bizType }),
        ...(logo && { logoUrl: logo }),
        ...(stamp && { stampUrl: stamp }),
      } as any);
      setAuth(result.user as any, result.accessToken);
      const fullUser = await authService.me();
      setAuth(fullUser, result.accessToken);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || (lang === 'fa' ? 'ثبت‌نام ناموفق' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const STEPS = [t.step1, t.step2, t.step3];

  return (
    <div className="w-full max-w-md mx-4 animate-in">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-6 shadow-[var(--shadow-xl)]">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-5">
          <div className="w-11 h-11 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center shadow-lg shadow-[hsl(var(--primary)/0.3)]">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold">{t.title}</h1>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{t.subtitle}</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-5">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all shrink-0 ${
                step > i + 1 ? 'bg-[hsl(var(--primary))] text-white' :
                step === i + 1 ? 'bg-[hsl(var(--primary))] text-white' :
                'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
              }`}>
                {step > i + 1 ? <Check className="w-3.5 h-3.5"/> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-1">
                  <div className={`h-1 rounded-full transition-all ${step > i + 1 ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted))]'}`}/>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-sm font-semibold mb-4">{STEPS[step - 1]}</p>

        {error && (
          <div className="mb-3 rounded-lg bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))] px-3 py-2 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label={t.fname} placeholder={t.fnamePh} value={fname} onChange={e => setFname(e.target.value)} autoComplete="given-name"/>
              <Input label={t.lname} placeholder={t.lnamePh} value={lname} onChange={e => setLname(e.target.value)} autoComplete="family-name"/>
            </div>
            <Input
              label={t.phone} placeholder={t.phonePh}
              value={phone} onChange={e => setPhone(e.target.value)}
              autoComplete="username" inputMode="tel"
            />
            <div>
              <Input
                label={t.password} placeholder={t.passPh}
                type={showPass ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                suffix={
                  <button type="button" onClick={() => setShowPass(!showPass)} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                    {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                }
              />
              {password && (
                <div className="mt-1.5">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all"
                        style={{ background: strength >= i ? STRENGTH_COLORS[strength] : 'hsl(var(--muted))' }}/>
                    ))}
                  </div>
                  <p className="text-[10px]" style={{ color: STRENGTH_COLORS[strength] }}>
                    {t.passStrength[strength]}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Company Info */}
        {step === 2 && (
          <div className="space-y-3">
            <Input
              label={t.company + ' *'} placeholder={t.companyPh}
              value={companyName} onChange={e => setCompanyName(e.target.value)}
            />
            <div>
              <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{t.type}</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(t.types).map(([k, v]) => (
                  <button key={k} type="button" onClick={() => setBizType(k)}
                    className={`text-xs px-3 py-2 rounded-lg border transition-all text-start ${
                      bizType === k
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]'
                    }`}>
                    {v as string}
                  </button>
                ))}
              </div>
            </div>
            <CountrySelector
              label={t.country}
              value={country}
              onChange={setCountry}
            />
            <Input
              label={t.email} placeholder={t.emailPh} type="email"
              value={email} onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
            <div className="bg-[hsl(var(--background))] rounded-lg p-3">
              <label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1.5">
                🔗 {t.invite}
              </label>
              <input
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder={t.invitePh}
                className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none font-mono tracking-wider"
              />
            </div>
          </div>
        )}

        {/* Step 3: Branding */}
        {step === 3 && (
          <div className="space-y-4">
            <ImageUploadBox
              label={t.logo}
              hint={lang === 'fa' ? 'کلیک برای آپلود لوگو (PNG/JPG)' : 'Click to upload logo (PNG/JPG)'}
              value={logo}
              onChange={setLogo}
            />
            <ImageUploadBox
              label={t.stamp}
              hint={lang === 'fa' ? 'کلیک برای آپلود مهر (PNG با پس‌زمینه شفاف بهتر است)' : 'Click to upload stamp (PNG transparent preferred)'}
              value={stamp}
              onChange={setStamp}
            />
          </div>
        )}

        {/* Navigation */}
        <div className={`flex gap-2 mt-5 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => { setError(''); setStep(s => s - 1); }}>
              {lang === 'fa' || lang === 'ar' ? <ChevronLeft className="w-4 h-4 me-1"/> : <ChevronRight className="w-4 h-4 me-1"/>}
              {t.back}
            </Button>
          )}
          {step < 3 ? (
            <Button type="button" onClick={onNext}>
              {t.next}
              {lang === 'fa' || lang === 'ar' ? <ChevronRight className="w-4 h-4 ms-1"/> : <ChevronLeft className="w-4 h-4 ms-1"/>}
            </Button>
          ) : (
            <div className="flex gap-2 flex-1 justify-end">
              {(logo || stamp) ? null : (
                <Button type="button" variant="outline" onClick={onSubmit} loading={loading}>
                  {t.skip}
                </Button>
              )}
              <Button type="button" onClick={onSubmit} loading={loading} className="whitespace-nowrap">
                🏢 {t.submit}
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-4">
          {t.hasAcc}{' '}
          <a href="/login" className="text-[hsl(var(--primary))] hover:underline font-medium">{t.login}</a>
        </p>
      </div>
    </div>
  );
}
