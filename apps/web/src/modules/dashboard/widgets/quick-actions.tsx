'use client';
import { useRouter } from 'next/navigation';
import { useLocaleStore } from '@/store/locale.store';
import { Plus, FileText, Receipt, Users, Gavel, Mail, LucideIcon } from 'lucide-react';

interface ActionItem {
  icon: LucideIcon;
  label: string;
  color: string;
  href: string;
}

// ── No JSX at module level — only icon references ────────────
const ACTIONS_EN: ActionItem[] = [
  { icon: Plus,     label: 'New Request',  color: '#3b82f6', href: '/dashboard/requests/new' },
  { icon: Receipt,  label: 'New Invoice',  color: '#10b981', href: '/dashboard/finance/invoices/new' },
  { icon: FileText, label: 'New Contract', color: '#8b5cf6', href: '/dashboard/contracts/new' },
  { icon: Gavel,    label: 'New Tender',   color: '#f59e0b', href: '/dashboard/tenders/new' },
  { icon: Users,    label: 'Add Employee', color: '#06b6d4', href: '/dashboard/finance/hr/new' },
  { icon: Mail,     label: 'New Letter',   color: '#ec4899', href: '/dashboard/automation/letters/new' },
];

const ACTIONS_FA: ActionItem[] = [
  { icon: Plus,     label: 'درخواست جدید', color: '#3b82f6', href: '/dashboard/requests/new' },
  { icon: Receipt,  label: 'فاکتور جدید',  color: '#10b981', href: '/dashboard/finance/invoices/new' },
  { icon: FileText, label: 'قرارداد جدید', color: '#8b5cf6', href: '/dashboard/contracts/new' },
  { icon: Gavel,    label: 'مزایده جدید',  color: '#f59e0b', href: '/dashboard/tenders/new' },
  { icon: Users,    label: 'کارمند جدید',  color: '#06b6d4', href: '/dashboard/finance/hr/new' },
  { icon: Mail,     label: 'مکاتبه جدید',  color: '#ec4899', href: '/dashboard/automation/letters/new' },
];

export function QuickActionsWidget() {
  const { lang } = useLocaleStore();
  const router = useRouter();
  const actions = lang === 'fa' ? ACTIONS_FA : ACTIONS_EN;
  const title = lang === 'fa' ? '⚡ دسترسی سریع' : '⚡ Quick Actions';

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
      <h2 className="font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((a, i) => {
          const Icon = a.icon;
          return (
            <button key={i} onClick={() => router.push(a.href)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--muted)/0.5)] transition-all group"
            >
              <div className="rounded-xl p-2 group-hover:scale-110 transition-transform" style={{ background: `${a.color}18`, color: a.color }}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-center leading-tight text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]">
                {a.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
