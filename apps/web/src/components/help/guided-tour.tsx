'use client';
import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  target: string;
  titleFa: string;
  descFa: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  { target: '[data-tour="topbar"]',     titleFa: 'نوار بالا',         descFa: 'از اینجا می‌توانید بین ماژول‌های مختلف سیستم جابه‌جا شوید، زبان، تم و اعلان‌ها را مدیریت کنید.', position: 'bottom' },
  { target: '[data-tour="modules"]',    titleFa: 'ماژول‌های سیستم',   descFa: 'سیستم دارای ۶ ماژول اصلی است: بازرگانی، مالی، تولید، لجستیک، اتوماسیون و CRM. روی هر کدام کلیک کنید تا وارد شوید.', position: 'bottom' },
  { target: '[data-tour="sidebar"]',    titleFa: 'منوی کناری',         descFa: 'منوی ناوبری هر ماژول از اینجا در دسترس است. می‌توانید آن را باز یا بسته کنید.', position: 'right' },
  { target: '[data-tour="dashboard"]',  titleFa: 'داشبورد',            descFa: 'خلاصه‌ای از وضعیت کسب‌وکار شما اینجا نمایش داده می‌شود: درخواست‌های در انتظار، قراردادها، فاکتورها و گزارش‌های مالی.', position: 'top' },
  { target: '[data-tour="quick-actions"]', titleFa: 'اقدامات سریع',   descFa: 'از این بخش می‌توانید به سرعت درخواست جدید، فاکتور، قرارداد یا مناقصه ایجاد کنید.', position: 'left' },
  { target: '[data-tour="help-btn"]',   titleFa: 'مرکز راهنما',       descFa: 'در هر لحظه می‌توانید با کلیک روی این دکمه به راهنمای کامل سیستم، سوالات متداول و این تور دسترسی داشته باشید.', position: 'top' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function GuidedTour({ isOpen, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const currentStep = TOUR_STEPS[step];

  const updateRect = useCallback(() => {
    if (!isOpen) return;
    const el = document.querySelector(currentStep.target);
    if (el) setRect(el.getBoundingClientRect());
    else setRect(null);
  }, [isOpen, currentStep?.target]);

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [updateRect]);

  useEffect(() => { if (isOpen) setStep(0); }, [isOpen]);

  if (!isOpen) return null;

  const next = () => { if (step < TOUR_STEPS.length - 1) setStep(s => s + 1); else onClose(); };
  const prev = () => { if (step > 0) setStep(s => s - 1); };

  const tooltipStyle = (): React.CSSProperties => {
    if (!rect) return { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' };
    const pos = currentStep.position || 'bottom';
    const gap = 12;
    if (pos === 'bottom') return { top: rect.bottom + gap, left: rect.left + rect.width / 2, transform: 'translateX(-50%)' };
    if (pos === 'top')    return { top: rect.top - gap, left: rect.left + rect.width / 2, transform: 'translate(-50%,-100%)' };
    if (pos === 'right')  return { top: rect.top + rect.height / 2, left: rect.right + gap, transform: 'translateY(-50%)' };
    return                       { top: rect.top + rect.height / 2, left: rect.left - gap, transform: 'translate(-100%,-50%)' };
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 pointer-events-auto" onClick={onClose} />

      {/* Highlight box */}
      {rect && (
        <div
          className="absolute rounded-lg ring-2 ring-[hsl(var(--primary))] ring-offset-2 ring-offset-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
          style={{ top: rect.top - 4, left: rect.left - 4, width: rect.width + 8, height: rect.height + 8 }}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute pointer-events-auto w-72 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl shadow-xl p-4 z-10"
        style={tooltipStyle()}
      >
        <button onClick={onClose} className="absolute top-3 end-3 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
          <X className="h-4 w-4" />
        </button>
        <div className="mb-1 text-xs font-medium text-[hsl(var(--primary))]">
          گام {step + 1} از {TOUR_STEPS.length}
        </div>
        <h3 className="font-bold text-[hsl(var(--foreground))] mb-1.5" dir="rtl">{currentStep.titleFa}</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed" dir="rtl">{currentStep.descFa}</p>

        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center my-3">
          {TOUR_STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={cn('h-1.5 rounded-full transition-all', i === step ? 'w-4 bg-[hsl(var(--primary))]' : 'w-1.5 bg-[hsl(var(--border))]')} />
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={prev} disabled={step === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronRight className="h-3.5 w-3.5" /> قبلی
          </button>
          <button onClick={next}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-[hsl(var(--primary))] text-white hover:opacity-90 transition-opacity font-medium">
            {step === TOUR_STEPS.length - 1 ? 'پایان' : 'بعدی'} {step < TOUR_STEPS.length - 1 && <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
