'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useLocaleStore } from '@/store/locale.store';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { roleLabel } from '@/types';
import {
  LayoutDashboard, Inbox, ClipboardList, FileText, Building2,
  TrendingUp, Gavel, Link2, Settings, LogOut,
  BookOpen, Receipt, Package, Users, Landmark, BarChart3,
  Mail, CheckSquare, Calendar, Archive, GitBranch, ChevronDown,
  Plus, Shield, LucideIcon, CreditCard, RefreshCw,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  labelFa?: string;
  labelAr?: string;
  icon: LucideIcon;
  href?: string;
  badge?: number;
  children?: NavItem[];
}

// ── Nav definitions (NO JSX at module level) ─────────────────
const TRADING_NAV: NavItem[] = [
  { label: 'Dashboard',         labelFa: 'داشبورد',           icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Inbox',             labelFa: 'صندوق ورودی',       icon: Inbox,           href: '/inbox',       badge: 3 },
  { label: 'My Requests',       labelFa: 'درخواست‌های من',    icon: ClipboardList,   href: '/requests' },
  { label: 'My Payments',       labelFa: 'پرداخت‌های من',     icon: CreditCard,      href: '/trading/my-payments' },
  { label: 'My Invoices',       labelFa: 'فاکتورهای من',      icon: Receipt,         href: '/trading/my-invoices' },
  { label: 'Order Templates',   labelFa: 'الگوهای سفارش',     icon: RefreshCw,       href: '/trading/request-templates' },
  { label: 'Contracts',         labelFa: 'قراردادها',          icon: FileText,        href: '/contracts' },
  { label: 'CRM',               labelFa: 'مشتریان',            icon: Building2,       href: '/crm' },
  { label: 'Tenders',           labelFa: 'مناقصات',            icon: Gavel,           href: '/tenders' },
  { label: 'Reports',           labelFa: 'گزارشات',            icon: TrendingUp,      href: '/reports' },
  { label: 'Connections',       labelFa: 'اتصالات',            icon: Link2,           href: '/connections' },
  { label: 'Letterhead',        labelFa: 'سربرگ دیجیتال',     icon: FileText,        href: '/trading/letterhead' },
];

const FINANCE_NAV: NavItem[] = [
  { label: 'Overview',     labelFa: 'خلاصه',              icon: LayoutDashboard, href: '/finance' },
  {
    label: 'Accounting', labelFa: 'حسابداری', icon: BookOpen,
    children: [
      { label: 'Chart of Accounts', labelFa: 'سرفصل‌ها', icon: ChevronDown, href: '/finance/coa' },
      { label: 'Journal',           labelFa: 'روزنامه',   icon: ChevronDown, href: '/finance/journal' },
      { label: 'Ledger',            labelFa: 'دفتر کل',   icon: ChevronDown, href: '/finance/ledger' },
    ],
  },
  { label: 'Invoices',     labelFa: 'فاکتورها',           icon: Receipt,         href: '/finance/invoices' },
  { label: 'Inventory',    labelFa: 'انبارداری',           icon: Package,         href: '/finance/inventory' },
  { label: 'HR / Payroll', labelFa: 'پرسنل',              icon: Users,           href: '/finance/hr' },
  { label: 'Treasury',     labelFa: 'خزانه',              icon: Landmark,        href: '/finance/treasury' },
  { label: 'Reports',      labelFa: 'گزارشات',            icon: BarChart3,       href: '/finance/reports' },
];

const AUTOMATION_NAV: NavItem[] = [
  { label: 'Dashboard',    labelFa: 'داشبورد',            icon: LayoutDashboard, href: '/automation' },
  {
    label: 'Correspondence', labelFa: 'مکاتبات', icon: Mail,
    children: [
      { label: 'Inbox',  labelFa: 'ورودی',  icon: ChevronDown, href: '/automation/inbox' },
      { label: 'Outbox', labelFa: 'خروجی', icon: ChevronDown, href: '/automation/outbox' },
    ],
  },
  { label: 'Requests',     labelFa: 'درخواست‌ها',         icon: CheckSquare,     href: '/automation/requests' },
  { label: 'Meetings',     labelFa: 'جلسات',              icon: Calendar,        href: '/automation/meetings' },
  { label: 'Tasks',        labelFa: 'وظایف',              icon: CheckSquare,     href: '/automation/tasks' },
  { label: 'Archive',      labelFa: 'آرشیو',              icon: Archive,         href: '/automation/archive' },
  { label: 'Workflows',    labelFa: 'گردش‌کار',           icon: GitBranch,       href: '/automation/workflows' },
];


const MANUFACTURING_NAV: NavItem[] = [
  { label: 'Dashboard', labelFa: 'داشبورد', icon: LayoutDashboard, href: '/manufacturing' },
  { label: 'Work Orders', labelFa: 'دستورات کار', icon: Package, href: '/manufacturing/work-orders' },
  { label: 'BOM', labelFa: 'فهرست مواد', icon: GitBranch, href: '/manufacturing/bom' },
  { label: 'Materials MRP', labelFa: 'برنامه ریزی مواد', icon: Archive, href: '/manufacturing/materials' },
  { label: 'WIP', labelFa: 'در جریان ساخت', icon: Landmark, href: '/manufacturing/wip' },
  { label: 'Quality Control', labelFa: 'کنترل کیفیت', icon: CheckSquare, href: '/manufacturing/qc' },
  { label: 'Product Costing', labelFa: 'هزینه یابی', icon: Receipt, href: '/manufacturing/costing' },
  { label: 'Reports', labelFa: 'گزارشات', icon: BarChart3, href: '/manufacturing/reports' },
];

const LOGISTICS_NAV: NavItem[] = [
  { label: 'Dashboard',    labelFa: 'داشبورد',         icon: LayoutDashboard, href: '/logistics' },
  { label: 'Shipments',    labelFa: 'محموله‌ها',        icon: Package,         href: '/logistics' },
  { label: 'New Shipment', labelFa: 'محموله جدید',     icon: Plus,            href: '/logistics' },
  { label: 'Customs',      labelFa: 'گمرک',             icon: Landmark,        href: '/logistics' },
  { label: 'Insurance',    labelFa: 'بیمه',             icon: Shield,          href: '/logistics' },
  { label: 'Quotes',       labelFa: 'استعلام حمل',     icon: Receipt,         href: '/logistics' },
  { label: 'Finance',      labelFa: 'مالی لجستیک',     icon: BarChart3,       href: '/logistics' },
];

const MODULE_NAV: Record<string, NavItem[]> = {
  trading:       TRADING_NAV,
  finance:       FINANCE_NAV,
  automation:    AUTOMATION_NAV,
  manufacturing: MANUFACTURING_NAV,
  logistics:     LOGISTICS_NAV,
};

// ── NavItem Component ─────────────────────────────────────────
function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang } = useLocaleStore();
  const [expanded, setExpanded] = useState(false);

  const label = lang === 'fa'
    ? (item.labelFa || item.label)
    : lang === 'ar'
    ? (item.labelAr || item.label)
    : item.label;

  const isActive = item.href
    ? pathname === item.href || pathname.startsWith(item.href + '/')
    : false;

  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          else if (item.href) router.push(item.href);
        }}
        className={cn(
          'relative w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
          depth > 0 && 'ps-7 py-1.5 text-xs',
          isActive
            ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-semibold'
            : 'font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.4)]'
        )}
      >
        {/* Active left indicator */}
        {isActive && depth === 0 && (
          <span className="absolute start-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-[hsl(var(--primary))]" />
        )}
        <span className={cn('shrink-0', isActive ? 'text-[hsl(var(--primary))]' : 'opacity-50')}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="flex-1 truncate text-start">{label}</span>
        {item.badge !== undefined && item.badge > 0 && (
          <span className="rounded-full bg-[hsl(var(--primary))] text-white text-[10px] px-1.5 py-px min-w-[18px] text-center leading-tight font-bold">
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
        {hasChildren && (
          <ChevronDown className={cn('h-3.5 w-3.5 opacity-40 transition-transform shrink-0', expanded && 'rotate-180')} />
        )}
      </button>
      {hasChildren && expanded && (
        <div className="mt-0.5 space-y-0.5">
          {item.children!.map((child, i) => (
            <NavItemComponent key={i} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────
export function Sidebar() {
  const { sidebarOpen, activeModule } = useUIStore();
  const { user, clearAuth } = useAuthStore();
  const { lang } = useLocaleStore();
  const router = useRouter();

  const navItems = MODULE_NAV[activeModule] || TRADING_NAV;

  const handleLogout = () => {
    clearAuth();
    router.replace('/login');
  };

  return (
    <aside className={cn(
      'flex flex-col h-full bg-[hsl(var(--secondary))] border-e border-[hsl(var(--border))]',
      'transition-all duration-300 shrink-0',
      sidebarOpen ? 'w-60' : 'w-0 overflow-hidden'
    )}>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item, i) => <NavItemComponent key={i} item={item} />)}
      </nav>

      {user && (
        <div className="border-t border-[hsl(var(--border))] p-3">
          <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[hsl(var(--muted)/0.5)] group cursor-pointer">
            <Avatar name={user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">{user.name}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{roleLabel(user.role)}</p>
            </div>
          </div>
          <div className="flex gap-1 mt-1">
            <button
              onClick={() => router.push('/settings')}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] rounded-lg hover:bg-[hsl(var(--muted)/0.5)] transition-colors"
            >
              <Settings className="h-3.5 w-3.5" />
              {lang === 'fa' ? 'تنظیمات' : 'Settings'}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.08)] rounded-lg transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              {lang === 'fa' ? 'خروج' : 'Logout'}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
