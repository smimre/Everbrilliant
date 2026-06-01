'use client';
import { useAuthStore } from '@/store/auth.store';
import { useLocaleStore } from '@/store/locale.store';
import { StatCard } from '@/components/dashboard/stat-card';
import { RecentRequestsWidget } from './widgets/recent-requests';
import { InvoiceSummaryWidget } from './widgets/invoice-summary';
import { ActivityFeedWidget } from './widgets/activity-feed';
import { QuickActionsWidget } from './widgets/quick-actions';
import { useDashboardStats } from '@/hooks/use-dashboard';
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

  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.greeting_morning : hour < 18 ? t.greeting_afternoon : t.greeting_evening;

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
          label={t.pendingReqs} value={stats?.pendingRequests ?? 0}
          change={statsLoading ? '...' : `${(stats?.pendingRequests ?? 0)} pending`}
          changeType="neutral" color="#3b82f6" loading={statsLoading}
        />
        <StatCard
          icon={<FileText className="h-5 w-5"/>}
          label={t.activeContracts} value={stats?.activeContracts ?? 0}
          change={statsLoading ? '...' : `${stats?.activeContracts ?? 0} active`}
          changeType="neutral" color="#8b5cf6" loading={statsLoading}
        />
        <StatCard
          icon={<Receipt className="h-5 w-5"/>}
          label={t.unpaidInvoices}
          value={new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(Math.round((stats?.unpaidAmount ?? 0) / 1_000_000)) + 'M'}
          change={`${stats?.unpaidInvoicesCount ?? 0} invoices`}
          changeType="down" color="#f59e0b" loading={statsLoading}
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5"/>}
          label={t.overdueItems} value={stats?.overdueCount ?? 0}
          change={(stats?.overdueCount ?? 0) > 0 ? 'Needs attention' : 'All clear'}
          changeType={(stats?.overdueCount ?? 0) > 0 ? 'down' : 'up'} color="#ef4444" loading={statsLoading}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5"/>}
          label={t.totalRevenue}
          value={new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(Math.round((stats?.totalRevenueMTD ?? 0) / 1_000_000_000) ) + 'B'}
          change="MTD" changeType="up" color="#10b981" suffix="IRR" loading={statsLoading}
        />
        <StatCard
          icon={<Users className="h-5 w-5"/>}
          label={t.activeConnections} value={stats?.activeConnections ?? 0}
          change={statsLoading ? '...' : `${stats?.activeConnections ?? 0} partners`}
          changeType="up" color="#06b6d4" loading={statsLoading}
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
