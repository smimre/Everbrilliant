'use client';
import { useAuthStore } from '@/store/auth.store';
import { useLocaleStore } from '@/store/locale.store';
import { StatCard } from '@/components/dashboard/stat-card';
import { RecentRequestsWidget } from './widgets/recent-requests';
import { InvoiceSummaryWidget } from './widgets/invoice-summary';
import { ActivityFeedWidget } from './widgets/activity-feed';
import { QuickActionsWidget } from './widgets/quick-actions';
import { useRequests } from '@/hooks/use-trading';
import { useInvoices } from '@/hooks/use-finance';
import { ClipboardList, FileText, Receipt, AlertTriangle, TrendingUp, Users } from 'lucide-react';

const T = {
  en: { greeting_morning:'Good morning', greeting_afternoon:'Good afternoon', greeting_evening:'Good evening',
    welcome:'Welcome back to Everbrilliant',
    pendingReqs:'Pending Requests', activeContracts:'Active Contracts',
    unpaidInvoices:'Unpaid Invoices', overdueItems:'Overdue Items',
    totalRevenue:'Total Revenue (MTD)', activeConnections:'Active Connections' },
  fa: { greeting_morning:'صبح بخیر', greeting_afternoon:'عصر بخیر', greeting_evening:'شب بخیر',
    welcome:'به سامانه بازرگانی خوش آمدید',
    pendingReqs:'درخواست در انتظار', activeContracts:'قرارداد فعال',
    unpaidInvoices:'فاکتور پرداخت‌نشده', overdueItems:'موارد سررسید گذشته',
    totalRevenue:'درآمد ماه جاری', activeConnections:'اتصال فعال' },
  ar: { greeting_morning:'صباح الخير', greeting_afternoon:'مساء الخير', greeting_evening:'مساء الخير',
    welcome:'مرحباً بك في إيفربريليانت',
    pendingReqs:'طلبات معلقة', activeContracts:'عقود نشطة',
    unpaidInvoices:'فواتير غير مدفوعة', overdueItems:'بنود متأخرة',
    totalRevenue:'الإيرادات (الشهر الحالي)', activeConnections:'اتصالات نشطة' },
};

export function DashboardModule() {
  const { user } = useAuthStore();
  const { lang } = useLocaleStore();
  const t = T[lang as keyof typeof T] || T.en;

  const { data: requests, isLoading: reqLoading } = useRequests({ limit: 5 });
  const { data: invoices, isLoading: invLoading } = useInvoices({ limit: 5 });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.greeting_morning : hour < 18 ? t.greeting_afternoon : t.greeting_evening;

  const pendingCount   = requests?.data?.filter(r => r.status === 'pending').length ?? 0;
  const unpaidAmount   = invoices?.data?.filter(i => ['sent','partial','overdue'].includes(i.status))
    .reduce((s, i) => s + (i.total - i.paid), 0) ?? 0;
  const overdueCount   = invoices?.data?.filter(i => i.status === 'overdue').length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{t.welcome}</p>
        </div>
        <div className="text-xs text-[hsl(var(--muted-foreground))] text-end">
          <div className="font-medium">{new Date().toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', { weekday:'long', month:'long', day:'numeric' })}</div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={<ClipboardList className="h-5 w-5"/>}
          label={t.pendingReqs} value={pendingCount}
          change={reqLoading ? '...' : `${requests?.total ?? 0} total`}
          changeType="neutral" color="#3b82f6" loading={reqLoading}
        />
        <StatCard
          icon={<FileText className="h-5 w-5"/>}
          label={t.activeContracts} value="5"
          change="2 expiring soon" changeType="neutral" color="#8b5cf6"
        />
        <StatCard
          icon={<Receipt className="h-5 w-5"/>}
          label={t.unpaidInvoices}
          value={new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(Math.round(unpaidAmount / 1_000_000)) + 'M'}
          change={`${invoices?.data?.filter(i => i.status !== 'paid').length ?? 0} invoices`}
          changeType="down" color="#f59e0b" loading={invLoading}
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5"/>}
          label={t.overdueItems} value={overdueCount}
          change={overdueCount > 0 ? 'Needs attention' : 'All clear'}
          changeType={overdueCount > 0 ? 'down' : 'up'} color="#ef4444"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5"/>}
          label={t.totalRevenue} value="12.4B"
          change="+18% vs last month" changeType="up" color="#10b981" suffix="IRR"
        />
        <StatCard
          icon={<Users className="h-5 w-5"/>}
          label={t.activeConnections} value="8"
          change="3 new this month" changeType="up" color="#06b6d4"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <RecentRequestsWidget />
          <InvoiceSummaryWidget />
        </div>
        <div className="space-y-6">
          <QuickActionsWidget />
          <ActivityFeedWidget />
        </div>
      </div>
    </div>
  );
}
