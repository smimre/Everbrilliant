'use client';
import { useState } from 'react';
import { Search, BookOpen, ShoppingCart, DollarSign, Factory, Truck, Zap, Users, ChevronDown, ChevronUp, PlayCircle, Phone, Mail, MessageCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GuidedTour } from '@/components/help';

/* ── Data ── */
const MODULES = [
  {
    id: 'trading', icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20',
    titleFa: 'بازرگانی', descFa: 'مدیریت درخواست‌های خرید و فروش، قراردادها، مناقصات و اتصالات تجاری',
    features: [
      { titleFa: 'درخواست‌های تجاری', descFa: 'ثبت، پیگیری و مدیریت درخواست‌های خرید و فروش B2B. هر درخواست دارای چرخه کامل از پیشنهاد تا قرارداد است.' },
      { titleFa: 'قراردادها', descFa: 'ایجاد و مدیریت قراردادهای تجاری با امضای دیجیتال، پیگیری وضعیت و تاریخ انقضا.' },
      { titleFa: 'مناقصات', descFa: 'برگزاری مناقصه، دریافت پیشنهادها از تامین‌کنندگان و انتخاب بهترین قیمت.' },
      { titleFa: 'اتصالات تجاری', descFa: 'ارتباط با شرکا، تامین‌کنندگان و مشتریان در شبکه B2B اورتبرلیانت.' },
    ],
    steps: ['درخواست جدید → درخواست‌های من → + درخواست', 'قرارداد جدید → قراردادها → + قرارداد', 'مناقصه جدید → مناقصات → + مناقصه'],
  },
  {
    id: 'finance', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20',
    titleFa: 'مالی و حسابداری', descFa: 'حسابداری کامل، صدور فاکتور، مدیریت انبار، منابع انسانی و گزارشات مالی',
    features: [
      { titleFa: 'حسابداری', descFa: 'سرفصل‌های حسابداری، روزنامه عمومی، دفتر کل و صورت‌های مالی کامل.' },
      { titleFa: 'فاکتورها', descFa: 'صدور فاکتور فروش و خرید، پیگیری پرداخت‌ها و مدیریت بدهکاران و بستانکاران.' },
      { titleFa: 'انبارداری', descFa: 'مدیریت موجودی کالا، ورود و خروج کالا، ارزیابی موجودی و گزارش انبار.' },
      { titleFa: 'منابع انسانی', descFa: 'مدیریت پرسنل، حقوق و دستمزد، مرخصی و گزارشات HR.' },
      { titleFa: 'خزانه‌داری', descFa: 'مدیریت حساب‌های بانکی، چک‌ها و جریان نقدی.' },
    ],
    steps: ['فاکتور جدید → مالی → فاکتورها → + فاکتور', 'ورود انبار → مالی → انبارداری → + ورود کالا', 'حقوق → مالی → پرسنل → محاسبه حقوق'],
  },
  {
    id: 'manufacturing', icon: Factory, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20',
    titleFa: 'تولید', descFa: 'مدیریت دستورات کار، فهرست مواد اولیه، کنترل کیفیت و برنامه‌ریزی تولید',
    features: [
      { titleFa: 'دستورات کار', descFa: 'ایجاد و مدیریت دستورات تولید، پیگیری پیشرفت و هزینه‌های تولید.' },
      { titleFa: 'فهرست مواد (BOM)', descFa: 'تعریف ساختار محصولات، مواد اولیه مورد نیاز و فرآیند تولید.' },
      { titleFa: 'کنترل کیفیت', descFa: 'بازرسی کیفیت در مراحل تولید، ثبت نقص‌ها و گزارش‌های کیفیت.' },
      { titleFa: 'در جریان ساخت (WIP)', descFa: 'پیگیری کالاهای نیمه‌ساخته، ثبت مصرف مواد و زمان کار.' },
    ],
    steps: ['دستور کار → تولید → دستورات کار → + دستور جدید', 'BOM → تولید → فهرست مواد → + قالب جدید'],
  },
  {
    id: 'logistics', icon: Truck, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20',
    titleFa: 'لجستیک', descFa: 'مدیریت محموله‌ها، حمل‌ونقل، گمرک، بیمه و استعلام نرخ حمل',
    features: [
      { titleFa: 'محموله‌ها', descFa: 'ثبت و پیگیری محموله‌های ورودی و خروجی، مراحل حمل و وضعیت تحویل.' },
      { titleFa: 'استعلام نرخ', descFa: 'دریافت نرخ از شرکت‌های حمل‌ونقل و مقایسه قیمت‌ها.' },
      { titleFa: 'گمرک و بیمه', descFa: 'مدیریت اسناد گمرکی، بیمه محموله و هزینه‌های جانبی.' },
    ],
    steps: ['محموله جدید → لجستیک → + محموله جدید', 'استعلام حمل → لجستیک → استعلام نرخ'],
  },
  {
    id: 'automation', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20',
    titleFa: 'اتوماسیون اداری', descFa: 'مکاتبات، درخواست‌های اداری، جلسات، وظایف و گردش‌کار',
    features: [
      { titleFa: 'مکاتبات', descFa: 'ارسال و دریافت نامه‌های رسمی داخلی و خارجی با سیستم ردیابی کامل.' },
      { titleFa: 'درخواست‌های اداری', descFa: 'ثبت و تایید درخواست‌های اداری مانند مرخصی، ماموریت و خرید.' },
      { titleFa: 'جلسات', descFa: 'برنامه‌ریزی جلسات، دعوت‌نامه، صورت‌جلسه و پیگیری مصوبات.' },
      { titleFa: 'گردش‌کار', descFa: 'تعریف فرآیندهای تایید خودکار با چند مرحله و سطوح دسترسی مختلف.' },
    ],
    steps: ['نامه جدید → اتوماسیون → مکاتبات → ورودی/خروجی', 'جلسه → اتوماسیون → جلسات → + جلسه جدید'],
  },
  {
    id: 'crm', icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20',
    titleFa: 'مدیریت مشتریان (CRM)', descFa: 'مدیریت مشتریان، فرصت‌های فروش، پیگیری تماس‌ها و گزارش فروش',
    features: [
      { titleFa: 'پروفایل مشتریان', descFa: 'اطلاعات کامل مشتریان، تاریخچه معاملات و سابقه ارتباطی.' },
      { titleFa: 'فرصت‌های فروش', descFa: 'پیپ‌لاین فروش، پیگیری سرنخ‌ها و پیش‌بینی درآمد.' },
    ],
    steps: ['مشتری جدید → CRM → + مشتری جدید'],
  },
];

const FAQS = [
  { q: 'چطور یک درخواست خرید ثبت کنم؟', a: 'از ماژول بازرگانی، درخواست‌های من → + درخواست جدید → فرم را تکمیل و ارسال کنید.' },
  { q: 'چطور فاکتور صادر کنم؟', a: 'ماژول مالی → فاکتورها → فاکتور جدید → اطلاعات مشتری و اقلام را وارد کنید.' },
  { q: 'آیا می‌توانم سطح دسترسی کاربران را تنظیم کنم؟', a: 'بله. از تنظیمات → کاربران، می‌توانید نقش هر کاربر را تعیین کنید.' },
  { q: 'چطور گزارش مالی بگیرم؟', a: 'ماژول مالی → گزارشات → نوع گزارش و بازه زمانی را انتخاب کنید.' },
  { q: 'آیا سیستم از زبان فارسی پشتیبانی می‌کند؟', a: 'بله. سیستم از فارسی، انگلیسی و عربی پشتیبانی می‌کند. از گوشه بالای صفحه زبان را تغییر دهید.' },
  { q: 'چطور قرارداد جدید ثبت کنم؟', a: 'بازرگانی → قراردادها → + قرارداد جدید → اطلاعات طرفین و شرایط را وارد کنید.' },
  { q: 'آیا می‌توانم گردش‌کار تایید تعریف کنم؟', a: 'بله. اتوماسیون → گردش‌کار → + گردش‌کار جدید → مراحل تایید را تعریف کنید.' },
  { q: 'چطور موجودی انبار را مدیریت کنم؟', a: 'مالی → انبارداری → می‌توانید ورود، خروج و انتقال کالا ثبت کنید.' },
];

/* ── Component ── */
export default function HelpPage() {
  const [search, setSearch] = useState('');
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [tourOpen, setTourOpen] = useState(false);

  const filteredModules = MODULES.filter(m =>
    !search || m.titleFa.includes(search) ||
    m.features.some(f => f.titleFa.includes(search) || f.descFa.includes(search))
  );

  const filteredFaqs = FAQS.filter(f => !search || f.q.includes(search) || f.a.includes(search));

  return (
    <div className="min-h-full bg-[hsl(var(--background))] p-6" dir="rtl">
      <GuidedTour isOpen={tourOpen} onClose={() => setTourOpen(false)} />

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[hsl(var(--primary)/0.1)] mb-4">
          <BookOpen className="h-8 w-8 text-[hsl(var(--primary))]" />
        </div>
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">مرکز راهنما</h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-6">راهنمای جامع استفاده از سیستم اورتبرلیانت</p>

        {/* Search */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="جستجو در راهنما..."
            className="w-full pr-11 pl-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.5)] text-sm"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">

        {/* Getting Started */}
        {!search && (
          <section>
            <h2 className="text-lg font-bold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
              <span className="h-6 w-1 rounded-full bg-[hsl(var(--primary))] inline-block" />
              شروع سریع
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={() => setTourOpen(true)}
                className="flex flex-col items-start gap-3 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary)/0.05)] transition-all group text-right">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PlayCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-[hsl(var(--foreground))] text-sm">تور راهنمای گام‌به‌گام</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">آشنایی با سیستم در چند دقیقه</p>
                </div>
              </button>
              <div className="flex flex-col items-start gap-3 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-right">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-[hsl(var(--foreground))] text-sm">اولین درخواست تجاری</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">بازرگانی ← درخواست‌های من ← + درخواست</p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-right">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <ArrowRight className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-[hsl(var(--foreground))] text-sm">مستندات ماژول‌ها</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">راهنمای کامل هر بخش را ببینید</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Modules */}
        <section>
          <h2 className="text-lg font-bold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
            <span className="h-6 w-1 rounded-full bg-[hsl(var(--primary))] inline-block" />
            راهنمای ماژول‌ها
          </h2>
          <div className="space-y-3">
            {filteredModules.map(mod => {
              const Icon = mod.icon;
              const isOpen = openModule === mod.id;
              return (
                <div key={mod.id} className={cn('border rounded-xl overflow-hidden transition-all', mod.border, 'bg-[hsl(var(--secondary))]')}>
                  <button onClick={() => setOpenModule(isOpen ? null : mod.id)}
                    className="w-full flex items-center gap-4 p-4 text-right hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                    <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center shrink-0', mod.bg)}>
                      <Icon className={cn('h-5 w-5', mod.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[hsl(var(--foreground))]">{mod.titleFa}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 truncate">{mod.descFa}</p>
                    </div>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-[hsl(var(--muted-foreground))] shrink-0" /> : <ChevronDown className="h-4 w-4 text-[hsl(var(--muted-foreground))] shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="border-t border-[hsl(var(--border))] p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {mod.features.map((f, i) => (
                          <div key={i} className="p-3 rounded-lg bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border))]">
                            <p className="font-medium text-sm text-[hsl(var(--foreground))] mb-1">{f.titleFa}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">{f.descFa}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.2)] rounded-lg p-3">
                        <p className="text-xs font-semibold text-[hsl(var(--primary))] mb-2">دسترسی سریع</p>
                        {mod.steps.map((s, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-[hsl(var(--muted-foreground))] mb-1">
                            <span className="text-[hsl(var(--primary))] font-bold shrink-0">{i + 1}.</span> {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-lg font-bold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
            <span className="h-6 w-1 rounded-full bg-[hsl(var(--primary))] inline-block" />
            سوالات متداول
          </h2>
          <div className="border border-[hsl(var(--border))] rounded-xl overflow-hidden bg-[hsl(var(--secondary))]">
            {filteredFaqs.map((faq, i) => (
              <div key={i} className="border-b border-[hsl(var(--border))] last:border-0">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-right hover:bg-[hsl(var(--muted)/0.3)] transition-colors gap-3">
                  <span className="font-medium text-sm text-[hsl(var(--foreground))]">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="h-4 w-4 shrink-0 text-[hsl(var(--primary))]" /> : <ChevronDown className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed border-t border-[hsl(var(--border))] pt-3 bg-[hsl(var(--muted)/0.2)]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
            {filteredFaqs.length === 0 && (
              <div className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">نتیجه‌ای یافت نشد</div>
            )}
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-lg font-bold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
            <span className="h-6 w-1 rounded-full bg-[hsl(var(--primary))] inline-block" />
            تماس با پشتیبانی
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Phone, titleFa: 'تلفن', valueFa: '۰۲۱-۰۰۰۰-۰۰۰۰', href: 'tel:+982100000000', color: 'text-green-400', bg: 'bg-green-500/10' },
              { icon: Mail, titleFa: 'ایمیل', valueFa: 'support@everbrilliant.com', href: 'mailto:support@everbrilliant.com', color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { icon: MessageCircle, titleFa: 'چت آنلاین', valueFa: 'پشتیبانی ۲۴/۷', href: '#', color: 'text-purple-400', bg: 'bg-purple-500/10' },
            ].map((c, i) => (
              <a key={i} href={c.href} className="flex items-center gap-3 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] hover:border-[hsl(var(--primary)/0.4)] transition-all">
                <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center shrink-0', c.bg)}>
                  <c.icon className={cn('h-5 w-5', c.color)} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[hsl(var(--foreground))]">{c.titleFa}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{c.valueFa}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
