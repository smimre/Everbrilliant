'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HelpCircle, X, BookOpen, MessageCircle, PlayCircle, ChevronDown, ChevronUp, Phone, Mail, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GuidedTour } from './guided-tour';

const FAQS = [
  { q: 'چطور یک درخواست خرید جدید ثبت کنم؟', a: 'از منوی بازرگانی، روی "درخواست‌های من" کلیک کرده و سپس دکمه "+ درخواست جدید" را بزنید. فرم مربوطه را تکمیل و ارسال کنید.' },
  { q: 'چطور فاکتور صادر کنم؟', a: 'در ماژول مالی، بخش "فاکتورها" را انتخاب کرده و روی "فاکتور جدید" کلیک کنید. اطلاعات مشتری، محصولات و مبالغ را وارد کنید.' },
  { q: 'چطور یک مناقصه ایجاد کنم؟', a: 'از ماژول بازرگانی، بخش "مناقصات" را انتخاب کنید. دکمه "مناقصه جدید" را بزنید و اطلاعات مناقصه را تکمیل کنید.' },
  { q: 'چطور کاربر جدید اضافه کنم؟', a: 'در منوی تنظیمات (آیکون چرخ‌دنده)، بخش "کاربران" را انتخاب کنید و روی "کاربر جدید" کلیک کنید.' },
  { q: 'چطور گزارش مالی بگیرم؟', a: 'در ماژول مالی، بخش "گزارشات" را انتخاب کنید. می‌توانید فیلترهای بازه زمانی و نوع گزارش را تنظیم کنید.' },
  { q: 'چطور قرارداد ثبت کنم؟', a: 'از منوی بازرگانی، روی "قراردادها" کلیک کنید. دکمه "+ قرارداد جدید" را بزنید و اطلاعات طرفین و شرایط قرارداد را وارد کنید.' },
];

interface Props {
  className?: string;
}

export function HelpWidget({ className }: Props) {
  const [open, setOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [tourOpen, setTourOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <GuidedTour isOpen={tourOpen} onClose={() => setTourOpen(false)} />

      {/* Floating button */}
      <div className={cn('fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3', className)} data-tour="help-btn">
        {/* Panel */}
        {open && (
          <div className="w-80 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-[hsl(var(--primary))] px-4 py-3 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-sm">مرکز راهنما</h2>
                <p className="text-white/70 text-xs">چطور می‌توانیم کمک کنیم؟</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 space-y-2 max-h-[70vh] overflow-y-auto">
              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { router.push('/help'); setOpen(false); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)] hover:border-[hsl(var(--primary)/0.4)] transition-all group">
                  <BookOpen className="h-5 w-5 text-[hsl(var(--primary))] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-[hsl(var(--foreground))]">مستندات</span>
                </button>
                <button onClick={() => { setTourOpen(true); setOpen(false); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)] hover:border-[hsl(var(--primary)/0.4)] transition-all group">
                  <PlayCircle className="h-5 w-5 text-[hsl(var(--success))] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-[hsl(var(--foreground))]">تور راهنما</span>
                </button>
              </div>

              {/* FAQ */}
              <div className="border border-[hsl(var(--border))] rounded-xl overflow-hidden">
                <div className="px-3 py-2 bg-[hsl(var(--muted)/0.4)] border-b border-[hsl(var(--border))]">
                  <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">سوالات متداول</span>
                </div>
                {FAQS.map((faq, i) => (
                  <div key={i} className="border-b border-[hsl(var(--border))] last:border-0">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-right hover:bg-[hsl(var(--muted)/0.3)] transition-colors gap-2">
                      <span className="text-xs font-medium text-[hsl(var(--foreground))] flex-1 text-right" dir="rtl">{faq.q}</span>
                      {openFaq === i ? <ChevronUp className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))]" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))]" />}
                    </button>
                    {openFaq === i && (
                      <div className="px-3 pb-3 text-xs text-[hsl(var(--muted-foreground))] leading-relaxed" dir="rtl">{faq.a}</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Contact */}
              <div className="border border-[hsl(var(--border))] rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">پشتیبانی</p>
                <a href="tel:+982100000000" className="flex items-center gap-2 text-xs text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors" dir="rtl">
                  <Phone className="h-3.5 w-3.5 text-[hsl(var(--primary))]" /> ۰۲۱-۰۰۰۰-۰۰۰۰
                </a>
                <a href="mailto:support@everbrilliant.com" className="flex items-center gap-2 text-xs text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors" dir="rtl">
                  <Mail className="h-3.5 w-3.5 text-[hsl(var(--primary))]" /> support@everbrilliant.com
                </a>
              </div>

              <button onClick={() => { router.push('/help'); setOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.08)] transition-colors border border-[hsl(var(--primary)/0.3)]">
                <ExternalLink className="h-3.5 w-3.5" /> مشاهده راهنمای کامل
              </button>
            </div>
          </div>
        )}

        {/* Toggle button */}
        <button onClick={() => setOpen(!open)}
          className={cn(
            'h-12 w-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300',
            open
              ? 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rotate-90'
              : 'bg-[hsl(var(--primary))] text-white hover:scale-110'
          )}>
          {open ? <X className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
        </button>
      </div>
    </>
  );
}
