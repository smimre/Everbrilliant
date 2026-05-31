'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useLocaleStore } from '@/store/locale.store';
import { useUIStore } from '@/store/ui.store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Building2, Globe, Palette, Sparkles } from 'lucide-react';

const schema = z.object({
  appName:        z.string().min(2).max(50),
  appNameFa:      z.string().max(50).optional(),
  primaryColor:   z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  domain:         z.string().optional(),
  supportEmail:   z.string().email().optional().or(z.literal('')),
  supportPhone:   z.string().optional(),
  footerText:     z.string().max(200).optional(),
  logoUrl:        z.string().url().optional().or(z.literal('')),
  faviconUrl:     z.string().url().optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export function WhiteLabelSettings() {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const qc = useQueryClient();
  const [preview, setPreview] = useState({ primary: '#3b82f6', secondary: '#8b5cf6' });

  const { data: config } = useQuery({
    queryKey: ['wl-config'],
    queryFn: () => api.get<any>('/saas/white-label/config'),
  });

  const { register, handleSubmit, watch, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      appName: config?.appName || 'Everbrilliant',
      appNameFa: config?.appNameFa || 'سامانه بازرگانی',
      primaryColor: config?.primaryColor || '#3b82f6',
      secondaryColor: config?.secondaryColor || '#8b5cf6',
      domain: config?.domain || '',
      supportEmail: config?.supportEmail || '',
      supportPhone: config?.supportPhone || '',
      footerText: config?.footerText || '',
      logoUrl: config?.logoUrl || '',
      faviconUrl: config?.faviconUrl || '',
    },
  });

  const watchedPrimary = watch('primaryColor');
  const watchedSecondary = watch('secondaryColor');

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data: FormData) => api.patch('/saas/white-label/config', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wl-config'] });
      toast('success', lang === 'fa' ? 'تنظیمات ذخیره شد' : 'Settings saved');
    },
    onError: (err: Error) => toast('error', err.message),
  });

  const isFa = lang === 'fa';

  return (
    <form onSubmit={handleSubmit(data => save(data))} className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-xl font-bold">{isFa ? 'تنظیمات برندینگ' : 'White Label Settings'}</h2>
          <Badge variant="warning">{isFa ? 'سازمانی' : 'Enterprise'}</Badge>
        </div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {isFa ? 'سامانه را با برند اختصاصی خود شخصی‌سازی کنید' : 'Customize the platform with your own branding'}
        </p>
      </div>

      {/* Brand Identity */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <h3 className="font-semibold text-sm">{isFa ? 'هویت برند' : 'Brand Identity'}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label={isFa ? 'نام برنامه (انگلیسی)' : 'App Name (English)'} {...register('appName')} error={errors.appName?.message} />
          <Input label={isFa ? 'نام برنامه (فارسی)' : 'App Name (Farsi)'} {...register('appNameFa')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label={isFa ? 'آدرس لوگو' : 'Logo URL'} {...register('logoUrl')} placeholder="https://..." />
          <Input label={isFa ? 'آدرس فاویکون' : 'Favicon URL'} {...register('faviconUrl')} placeholder="https://..." />
        </div>
      </div>

      {/* Colors */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <h3 className="font-semibold text-sm">{isFa ? 'رنگ‌بندی' : 'Colors'}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input label={isFa ? 'رنگ اصلی' : 'Primary Color'} {...register('primaryColor')} error={errors.primaryColor?.message} />
            <div className="flex items-center gap-2">
              <input type="color" value={watchedPrimary} onChange={e => setPreview(p => ({...p, primary: e.target.value}))} className="h-8 w-16 rounded cursor-pointer border border-[hsl(var(--border))]" />
              <div className="flex-1 h-8 rounded-lg" style={{ background: watchedPrimary || '#3b82f6' }} />
            </div>
          </div>
          <div className="space-y-2">
            <Input label={isFa ? 'رنگ ثانویه' : 'Secondary Color'} {...register('secondaryColor')} error={errors.secondaryColor?.message} />
            <div className="flex items-center gap-2">
              <input type="color" value={watchedSecondary} onChange={e => setPreview(p => ({...p, secondary: e.target.value}))} className="h-8 w-16 rounded cursor-pointer border border-[hsl(var(--border))]" />
              <div className="flex-1 h-8 rounded-lg" style={{ background: watchedSecondary || '#8b5cf6' }} />
            </div>
          </div>
        </div>
        {/* Live preview button */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--muted)/0.5)]">
          <Button type="button" style={{ background: watchedPrimary }}>Primary</Button>
          <Button type="button" style={{ background: watchedSecondary }}>Secondary</Button>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">{isFa ? 'پیش‌نمایش زنده' : 'Live preview'}</span>
        </div>
      </div>

      {/* Domain */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <h3 className="font-semibold text-sm">{isFa ? 'دامنه اختصاصی' : 'Custom Domain'}</h3>
        </div>
        <Input
          label={isFa ? 'دامنه (بدون https://)' : 'Domain (without https://)'}
          placeholder="app.yourcompany.com"
          hint={isFa ? 'پس از ذخیره، DNS خود را به سرور ما اشاره دهید' : 'After saving, point your DNS CNAME to our server'}
          {...register('domain')}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input label={isFa ? 'ایمیل پشتیبانی' : 'Support Email'} type="email" {...register('supportEmail')} error={errors.supportEmail?.message} />
          <Input label={isFa ? 'تلفن پشتیبانی' : 'Support Phone'} {...register('supportPhone')} />
        </div>
        <Input label={isFa ? 'متن فوتر' : 'Footer Text'} {...register('footerText')} placeholder={isFa ? 'Powered by Your Company' : 'Powered by Your Company'} />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary">{isFa ? 'انصراف' : 'Cancel'}</Button>
        <Button type="submit" loading={isPending} disabled={!isDirty}>
          {isFa ? 'ذخیره تنظیمات' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
}
