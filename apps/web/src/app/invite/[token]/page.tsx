'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { Building2, Eye, EyeOff, CheckCircle, Lock, Gavel, Link2, ShieldCheck } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://187.127.88.138.nip.io/api';

async function fetchInvite(token: string) {
  const res = await fetch(`${API}/trading/invites/${token}`);
  if (!res.ok) throw new Error('لینک دعوت معتبر نیست یا منقضی شده');
  return res.json();
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { setAuth, isAuthenticated } = useAuthStore();

  const [invite, setInvite] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'landing' | 'register' | 'login'>('landing');
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({ name: '', phone: '', password: '', companyName: '' });

  useEffect(() => {
    fetchInvite(token)
      .then(setInvite)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && invite) {
      router.replace(`/tenders?inviteToken=${token}`);
    }
  }, [isAuthenticated, invite]);

  const handleRegister = async () => {
    if (!form.name || !form.phone || !form.password || !form.companyName) {
      setError('همه فیلدها الزامی است'); return;
    }
    if (form.password.length < 6) { setError('رمز عبور حداقل ۶ کاراکتر'); return; }
    try {
      setSubmitting(true); setError('');
      const result = await authService.register({
        name: form.name, phone: form.phone,
        password: form.password, companyName: form.companyName,
      });
      setAuth(result.user as any, result.accessToken);
      router.replace(`/tenders?inviteToken=${token}`);
    } catch (e: any) {
      setError(e.message || 'خطا در ثبت‌نام');
    } finally { setSubmitting(false); }
  };

  const handleLogin = async () => {
    if (!form.phone || !form.password) { setError('شماره موبایل و رمز الزامی است'); return; }
    try {
      setSubmitting(true); setError('');
      const result = await authService.login({ phone: form.phone, password: form.password });
      setAuth(result.user as any, result.accessToken);
      router.replace(`/tenders?inviteToken=${token}`);
    } catch (e: any) {
      setError(e.message || 'اطلاعات ورود اشتباه است');
    } finally { setSubmitting(false); }
  };

  const inp = "w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error && !invite) return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
      <div className="max-w-sm w-full text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2">لینک معتبر نیست</h2>
        <p className="text-[hsl(var(--muted-foreground))] text-sm">{error}</p>
      </div>
    </div>
  );

  const tender = invite?.tender;
  const inviterCompany = invite?.inviterCompany;
  const endDate = tender?.endDate ? new Date(tender.endDate).toLocaleDateString('fa-IR') : '';

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))] px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-sm">Everbrilliant</span>
        <span className="text-xs text-[hsl(var(--muted-foreground))] ms-auto">پلتفرم B2B بازرگانی</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg">

          {/* Landing */}
          {mode === 'landing' && (
            <div className="space-y-6 text-center" dir="rtl">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 text-xs font-medium mb-4">
                  <Gavel className="w-3.5 h-3.5" />
                  دعوت به شرکت در مناقصه/مزایده
                </div>
                <h1 className="text-2xl font-bold mb-2">
                  {inviterCompany?.name} شما را دعوت کرده
                </h1>
                <p className="text-[hsl(var(--muted-foreground))] text-sm">
                  برای شرکت در مناقصه زیر، ثبت‌نام کنید یا وارد شوید
                </p>
              </div>

              {/* Tender card */}
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5 text-start">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="font-bold text-base">{tender?.title}</div>
                    {tender?.description && (
                      <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{tender.description}</div>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                    tender?.status === 'OPEN' ? 'bg-green-500/10 text-green-600' : 'bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]'
                  }`}>
                    {tender?.status === 'OPEN' ? '🟢 باز' : '🔒 بسته'}
                  </span>
                </div>
                {endDate && (
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">📅 مهلت: <span className="font-medium text-[hsl(var(--foreground))]">{endDate}</span></div>
                )}
              </div>

              {/* Free features */}
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5 text-start">
                <div className="font-semibold text-sm mb-3">✅ دسترسی رایگان شما شامل:</div>
                <div className="space-y-2">
                  {[
                    { icon: <Gavel className="w-4 h-4 text-blue-500" />, text: 'شرکت در مناقصه و مزایده' },
                    { icon: <Link2 className="w-4 h-4 text-green-500" />, text: 'اتصال با شرکت دعوت‌کننده' },
                    { icon: <ShieldCheck className="w-4 h-4 text-orange-500" />, text: 'مشاهده بلک‌لیست بازرگانی' },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm">
                      {f.icon}
                      <span>{f.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))]">
                  <Lock className="w-3.5 h-3.5 inline me-1" />
                  سایر ماژول‌ها (مالی، تولید، ...) پس از تهیه اشتراک فعال می‌شود
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={() => setMode('register')}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors">
                  ثبت‌نام و شرکت در مناقصه
                </button>
                <button onClick={() => setMode('login')}
                  className="w-full py-3 rounded-xl border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.4)] transition-colors">
                  قبلاً حساب دارم — ورود
                </button>
              </div>
            </div>
          )}

          {/* Register */}
          {mode === 'register' && (
            <div dir="rtl" className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-6">
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => { setMode('landing'); setError(''); }} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">→</button>
                <h2 className="font-bold">ثبت‌نام در Everbrilliant</h2>
              </div>
              {error && <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 px-3 py-2 text-sm">{error}</div>}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">نام و نام‌خانوادگی *</label>
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className={inp} placeholder="نام کامل" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">نام شرکت *</label>
                  <input value={form.companyName} onChange={e => setForm(f => ({...f, companyName: e.target.value}))} className={inp} placeholder="نام شرکت یا کسب‌وکار" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">شماره موبایل *</label>
                  <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className={inp} placeholder="09..." inputMode="tel" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">رمز عبور *</label>
                  <div className="relative">
                    <input value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
                      type={showPass ? 'text' : 'password'} className={inp + ' pe-10'} placeholder="حداقل ۶ کاراکتر" />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute inset-y-0 end-3 flex items-center text-[hsl(var(--muted-foreground))]">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={handleRegister} disabled={submitting}
                className="w-full mt-5 py-3 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-50 hover:bg-blue-700 transition-colors">
                {submitting ? 'در حال ثبت‌نام...' : '🚀 ثبت‌نام و شرکت در مناقصه'}
              </button>
              <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-3">
                حساب دارید؟{' '}
                <button onClick={() => { setMode('login'); setError(''); }} className="text-blue-500 hover:underline">ورود</button>
              </p>
            </div>
          )}

          {/* Login */}
          {mode === 'login' && (
            <div dir="rtl" className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-6">
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => { setMode('landing'); setError(''); }} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">→</button>
                <h2 className="font-bold">ورود به Everbrilliant</h2>
              </div>
              {error && <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 px-3 py-2 text-sm">{error}</div>}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">شماره موبایل</label>
                  <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className={inp} placeholder="09..." inputMode="tel" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">رمز عبور</label>
                  <div className="relative">
                    <input value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
                      type={showPass ? 'text' : 'password'} className={inp + ' pe-10'} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute inset-y-0 end-3 flex items-center text-[hsl(var(--muted-foreground))]">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={handleLogin} disabled={submitting}
                className="w-full mt-5 py-3 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-50 hover:bg-blue-700 transition-colors">
                {submitting ? 'در حال ورود...' : 'ورود و شرکت در مناقصه'}
              </button>
              <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-3">
                حساب ندارید؟{' '}
                <button onClick={() => { setMode('register'); setError(''); }} className="text-blue-500 hover:underline">ثبت‌نام</button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
