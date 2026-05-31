'use client';
import { useState, useMemo } from 'react';
import { useLocaleStore } from '@/store/locale.store';

// ── Types ─────────────────────────────────────────────────────
type AccType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
type AccNormal = 'debit' | 'credit';
type AccLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface Account {
  id: string;
  code: string;
  name: string;
  nameFa: string;
  type: AccType;
  normal: AccNormal;
  level: AccLevel;
  parentId: string | null;
  isGroup: boolean;         // گروه حساب (سطح ۱)
  isMoein: boolean;         // کل/معین (سطح ۲-۳)
  isTafzili: boolean;       // تفصیلی (سطح ۴-۵)
  isActive: boolean;
  hasChildren: boolean;
  balance: number;
  // تفصیلی شناور
  costCenter?: string;      // مرکز هزینه
  project?: string;         // پروژه
  description?: string;
}

// ── Default Chart of Accounts (استاندارد ایران) ───────────────
const DEFAULT_ACCOUNTS: Account[] = [
  // ════════════════════════════════════════════════════
  // گروه ۱ — دارایی‌ها
  // ════════════════════════════════════════════════════
  { id:'1', code:'1', name:'Assets', nameFa:'دارایی‌ها', type:'asset', normal:'debit', level:1, parentId:null, isGroup:true, isMoein:false, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  // کل
  { id:'11', code:'11', name:'Current Assets', nameFa:'دارایی‌های جاری', type:'asset', normal:'debit', level:2, parentId:'1', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  // معین
  { id:'111', code:'111', name:'Cash', nameFa:'موجودی نقد', type:'asset', normal:'debit', level:3, parentId:'11', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  // تفصیلی
  { id:'1111', code:'1111', name:'Petty Cash', nameFa:'تنخواه‌گردان', type:'asset', normal:'debit', level:4, parentId:'111', isGroup:false, isMoein:false, isTafzili:true, isActive:true, hasChildren:false, balance:5000000 },
  { id:'1112', code:'1112', name:'Main Cashbox', nameFa:'صندوق اصلی', type:'asset', normal:'debit', level:4, parentId:'111', isGroup:false, isMoein:false, isTafzili:true, isActive:true, hasChildren:false, balance:12000000 },
  // معین — بانک
  { id:'112', code:'112', name:'Bank Accounts', nameFa:'حساب‌های بانکی', type:'asset', normal:'debit', level:3, parentId:'11', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  // تفصیلی — بانک‌ها
  { id:'1121', code:'1121', name:'Bank Mellat', nameFa:'بانک ملت', type:'asset', normal:'debit', level:4, parentId:'112', isGroup:false, isMoein:false, isTafzili:true, isActive:true, hasChildren:false, balance:85000000 },
  { id:'1122', code:'1122', name:'Bank Melli', nameFa:'بانک ملی', type:'asset', normal:'debit', level:4, parentId:'112', isGroup:false, isMoein:false, isTafzili:true, isActive:true, hasChildren:false, balance:45000000 },
  // معین — دریافتنی
  { id:'113', code:'113', name:'Receivables', nameFa:'حساب‌های دریافتنی', type:'asset', normal:'debit', level:3, parentId:'11', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'1131', code:'1131', name:'Trade Receivables', nameFa:'بدهکاران تجاری', type:'asset', normal:'debit', level:4, parentId:'113', isGroup:false, isMoein:false, isTafzili:true, isActive:true, hasChildren:true, balance:30000000 },
  { id:'1132', code:'1132', name:'Other Receivables', nameFa:'سایر بدهکاران', type:'asset', normal:'debit', level:4, parentId:'113', isGroup:false, isMoein:false, isTafzili:true, isActive:true, hasChildren:false, balance:8000000 },
  // کل — دارایی ثابت
  { id:'12', code:'12', name:'Fixed Assets', nameFa:'دارایی‌های ثابت', type:'asset', normal:'debit', level:2, parentId:'1', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'121', code:'121', name:'Tangible Assets', nameFa:'دارایی‌های مشهود', type:'asset', normal:'debit', level:3, parentId:'12', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'1211', code:'1211', name:'Machinery', nameFa:'ماشین‌آلات', type:'asset', normal:'debit', level:4, parentId:'121', isGroup:false, isMoein:false, isTafzili:true, isActive:true, hasChildren:false, balance:200000000 },
  { id:'1212', code:'1212', name:'Vehicles', nameFa:'وسایل نقلیه', type:'asset', normal:'debit', level:4, parentId:'121', isGroup:false, isMoein:false, isTafzili:true, isActive:true, hasChildren:false, balance:120000000 },
  // ════════════════════════════════════════════════════
  // گروه ۲ — بدهی‌ها
  // ════════════════════════════════════════════════════
  { id:'2', code:'2', name:'Liabilities', nameFa:'بدهی‌ها', type:'liability', normal:'credit', level:1, parentId:null, isGroup:true, isMoein:false, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'21', code:'21', name:'Current Liabilities', nameFa:'بدهی‌های جاری', type:'liability', normal:'credit', level:2, parentId:'2', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'211', code:'211', name:'Payables', nameFa:'حساب‌های پرداختنی', type:'liability', normal:'credit', level:3, parentId:'21', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'2111', code:'2111', name:'Trade Payables', nameFa:'بستانکاران تجاری', type:'liability', normal:'credit', level:4, parentId:'211', isGroup:false, isMoein:false, isTafzili:true, isActive:true, hasChildren:false, balance:45000000 },
  { id:'212', code:'212', name:'Tax Payable', nameFa:'مالیات پرداختنی', type:'liability', normal:'credit', level:3, parentId:'21', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'2121', code:'2121', name:'Income Tax', nameFa:'مالیات بر درآمد', type:'liability', normal:'credit', level:4, parentId:'212', isGroup:false, isMoein:false, isTafzili:true, isActive:true, hasChildren:false, balance:15000000 },
  { id:'2122', code:'2122', name:'VAT Payable', nameFa:'مالیات ارزش افزوده', type:'liability', normal:'credit', level:4, parentId:'212', isGroup:false, isMoein:false, isTafzili:true, isActive:true, hasChildren:false, balance:9000000 },
  // ════════════════════════════════════════════════════
  // گروه ۳ — حقوق صاحبان سهام
  // ════════════════════════════════════════════════════
  { id:'3', code:'3', name:'Equity', nameFa:'حقوق صاحبان سهام', type:'equity', normal:'credit', level:1, parentId:null, isGroup:true, isMoein:false, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'31', code:'31', name:'Capital', nameFa:'سرمایه', type:'equity', normal:'credit', level:2, parentId:'3', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'311', code:'311', name:'Paid-in Capital', nameFa:'سرمایه پرداخت شده', type:'equity', normal:'credit', level:3, parentId:'31', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'3111', code:'3111', name:'Owner Capital', nameFa:'سرمایه صاحب', type:'equity', normal:'credit', level:4, parentId:'311', isGroup:false, isMoein:false, isTafzili:true, isActive:true, hasChildren:false, balance:200000000 },
  { id:'32', code:'32', name:'Retained Earnings', nameFa:'سود و زیان انباشته', type:'equity', normal:'credit', level:2, parentId:'3', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'321', code:'321', name:'Retained Earnings', nameFa:'سود انباشته', type:'equity', normal:'credit', level:3, parentId:'32', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'3211', code:'3211', name:'Current Year Profit', nameFa:'سود سال جاری', type:'equity', normal:'credit', level:4, parentId:'321', isGroup:false, isMoein:false, isTafzili:true, isActive:true, hasChildren:false, balance:85000000 },
  // ════════════════════════════════════════════════════
  // گروه ۴ — درآمدها
  // ════════════════════════════════════════════════════
  { id:'4', code:'4', name:'Revenue', nameFa:'درآمدها', type:'revenue', normal:'credit', level:1, parentId:null, isGroup:true, isMoein:false, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'41', code:'41', name:'Operating Revenue', nameFa:'درآمد عملیاتی', type:'revenue', normal:'credit', level:2, parentId:'4', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'411', code:'411', name:'Sales Revenue', nameFa:'درآمد فروش کالا', type:'revenue', normal:'credit', level:3, parentId:'41', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'4111', code:'4111', name:'Domestic Sales', nameFa:'فروش داخلی', type:'revenue', normal:'credit', level:4, parentId:'411', isGroup:false, isMoein:false, isTafzili:true, isActive:true, hasChildren:false, balance:280000000 },
  { id:'4112', code:'4112', name:'Export Sales', nameFa:'فروش صادراتی', type:'revenue', normal:'credit', level:4, parentId:'411', isGroup:false, isMoein:false, isTafzili:true, isActive:true, hasChildren:false, balance:70000000 },
  { id:'412', code:'412', name:'Service Revenue', nameFa:'درآمد خدمات', type:'revenue', normal:'credit', level:3, parentId:'41', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'4121', code:'4121', name:'Technical Services', nameFa:'خدمات فنی', type:'revenue', normal:'credit', level:4, parentId:'412', isGroup:false, isMoein:false, isTafzili:true, isActive:true, hasChildren:false, balance:50000000 },
  // ════════════════════════════════════════════════════
  // گروه ۵/۶ — هزینه‌ها
  // ════════════════════════════════════════════════════
  { id:'5', code:'5', name:'Cost of Goods', nameFa:'بهای تمام‌شده', type:'expense', normal:'debit', level:1, parentId:null, isGroup:true, isMoein:false, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'51', code:'51', name:'COGS', nameFa:'بهای تمام‌شده کالای فروش‌رفته', type:'expense', normal:'debit', level:2, parentId:'5', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'511', code:'511', name:'Direct Materials', nameFa:'مواد مستقیم', type:'expense', normal:'debit', level:3, parentId:'51', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'5111', code:'5111', name:'Raw Materials', nameFa:'مواد اولیه', type:'expense', normal:'debit', level:4, parentId:'511', isGroup:false, isMoein:false, isTafzili:true, isActive:true, hasChildren:false, balance:120000000 },
  { id:'6', code:'6', name:'Operating Expenses', nameFa:'هزینه‌های عملیاتی', type:'expense', normal:'debit', level:1, parentId:null, isGroup:true, isMoein:false, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'61', code:'61', name:'Personnel Costs', nameFa:'هزینه‌های پرسنلی', type:'expense', normal:'debit', level:2, parentId:'6', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'611', code:'611', name:'Salaries', nameFa:'حقوق و دستمزد', type:'expense', normal:'debit', level:3, parentId:'61', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'6111', code:'6111', name:'Basic Salary', nameFa:'حقوق پایه', type:'expense', normal:'debit', level:4, parentId:'611', isGroup:false, isMoein:false, isTafzili:true, isActive:true, hasChildren:false, balance:60000000 },
  { id:'6112', code:'6112', name:'Overtime', nameFa:'اضافه‌کاری', type:'expense', normal:'debit', level:4, parentId:'611', isGroup:false, isMoein:false, isTafzili:true, isActive:true, hasChildren:false, balance:8000000 },
  { id:'612', code:'612', name:'Social Security', nameFa:'بیمه تأمین اجتماعی', type:'expense', normal:'debit', level:3, parentId:'61', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'6121', code:'6121', name:"Employer's Share", nameFa:'سهم کارفرما (۲۳٪)', type:'expense', normal:'debit', level:4, parentId:'612', isGroup:false, isMoein:false, isTafzili:true, isActive:true, hasChildren:false, balance:16000000 },
  { id:'62', code:'62', name:'General Expenses', nameFa:'هزینه‌های عمومی', type:'expense', normal:'debit', level:2, parentId:'6', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'621', code:'621', name:'Rent & Utilities', nameFa:'اجاره و آب و برق', type:'expense', normal:'debit', level:3, parentId:'62', isGroup:false, isMoein:true, isTafzili:false, isActive:true, hasChildren:true, balance:0 },
  { id:'6211', code:'6211', name:'Office Rent', nameFa:'اجاره دفتر', type:'expense', normal:'debit', level:4, parentId:'621', isGroup:false, isMoein:false, isTafzili:true, isActive:true, hasChildren:false, balance:24000000 },
];

const TYPE_CONFIG: Record<AccType, { color: string; icon: string; labelFa: string; label: string }> = {
  asset:    { color: '#3b82f6', icon: '🏛️', labelFa: 'دارایی',          label: 'Asset' },
  liability:{ color: '#ef4444', icon: '📤', labelFa: 'بدهی',            label: 'Liability' },
  equity:   { color: '#8b5cf6', icon: '⚖️', labelFa: 'حقوق صاحبان',    label: 'Equity' },
  revenue:  { color: '#10b981', icon: '📈', labelFa: 'درآمد',           label: 'Revenue' },
  expense:  { color: '#f59e0b', icon: '📉', labelFa: 'هزینه',           label: 'Expense' },
};

const LEVEL_CONFIG: Record<AccLevel, { labelFa: string; label: string; badge: string }> = {
  1: { labelFa: 'گروه',        label: 'Group',       badge: 'bg-gray-700 text-white' },
  2: { labelFa: 'کل',          label: 'General',     badge: 'bg-blue-600 text-white' },
  3: { labelFa: 'معین',        label: 'Subsidiary',  badge: 'bg-purple-500 text-white' },
  4: { labelFa: 'تفصیلی',     label: 'Detail',      badge: 'bg-green-500 text-white' },
  5: { labelFa: 'تفصیلی شناور',label: 'Float Detail',badge: 'bg-amber-500 text-white' },
  6: { labelFa: 'شناسه/قرارداد', label: 'ID / Contract',  badge: 'bg-rose-500 text-white' },
};

export function ChartOfAccounts() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['1','2','3','4','5','6']));
  const [tab, setTab] = useState<'tree'|'tafzili'|'cost-center'|'report'>('tree');
  const [showNew, setShowNew] = useState(false);
  const [filterType, setFilterType] = useState<AccType|'all'>('all');
  const [filterLevel, setFilterLevel] = useState<AccLevel|0>(0);
  const [searchQuery, setSearchQuery] = useState('');

  // New account form
  const [form, setForm] = useState({
    code: '', name: '', nameFa: '',
    type: 'asset' as AccType,
    normal: 'debit' as AccNormal,
    level: 4 as AccLevel,
    parentId: '',
    costCenter: '',
    project: '',
    description: '',
  });

  const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

  const toggle = (id: string) => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };

  // Build tree
  const rootAccounts = accounts.filter(a => a.parentId === null);
  const getChildren = (parentId: string) => accounts.filter(a => a.parentId === parentId);

  const totalBalance = (id: string): number => {
    const acc = accounts.find(a => a.id === id);
    if (!acc) return 0;
    const children = getChildren(id);
    if (children.length === 0) return acc.balance;
    return children.reduce((s, c) => s + totalBalance(c.id), 0);
  };

  // Summary by type
  const summaryByType = Object.keys(TYPE_CONFIG).map(t => ({
    type: t as AccType,
    total: accounts.filter(a => a.type === t && !a.hasChildren).reduce((s, a) => s + a.balance, 0),
    count: accounts.filter(a => a.type === t).length,
  }));

  // Tafzili accounts
  const tafziliAccounts = accounts.filter(a => a.isTafzili || a.level >= 4);
  const filteredTafzili = tafziliAccounts.filter(a => {
    const matchType = filterType === 'all' || a.type === filterType;
    const matchLevel = filterLevel === 0 || a.level === filterLevel;
    const matchSearch = !searchQuery || a.code.includes(searchQuery) || a.nameFa.includes(searchQuery) || a.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchLevel && matchSearch;
  });

  // Cost centers
  const costCenters = [...new Set(accounts.filter(a => a.costCenter).map(a => a.costCenter!))];

  const handleAddAccount = () => {
    const newAcc: Account = {
      id: Date.now().toString(),
      code: form.code,
      name: form.name || form.nameFa,
      nameFa: form.nameFa,
      type: form.type,
      normal: form.normal,
      level: form.level,
      parentId: form.parentId || null,
      isGroup: form.level === 1,
      isMoein: form.level <= 3,
      isTafzili: form.level >= 4,
      isActive: true,
      hasChildren: false,
      balance: 0,
      costCenter: form.costCenter || undefined,
      project: form.project || undefined,
      description: form.description || undefined,
    };
    if (form.parentId) {
      setAccounts(prev => prev.map(a => a.id === form.parentId ? { ...a, hasChildren: true } : a));
    }
    setAccounts(prev => [...prev, newAcc]);
    setShowNew(false);
    setForm({ code:'', name:'', nameFa:'', type:'asset', normal:'debit', level:4, parentId:'', costCenter:'', project:'', description:'' });
  };

  const AccountRow = ({ acc, depth = 0 }: { acc: Account; depth?: number }) => {
    const children = getChildren(acc.id);
    const isOpen = expanded.has(acc.id);
    const bal = totalBalance(acc.id);
    const tc = TYPE_CONFIG[acc.type];
    const lc = LEVEL_CONFIG[acc.level];

    return (
      <>
        <tr className={`border-t border-[hsl(var(--border)/0.4)] hover:bg-[hsl(var(--muted)/0.3)] transition-colors ${acc.isGroup ? 'bg-[hsl(var(--muted)/0.2)]' : ''}`}>
          {/* Code */}
          <td className="px-3 py-2.5" style={{ paddingInlineStart: `${depth * 20 + 12}px` }}>
            <div className="flex items-center gap-2">
              {children.length > 0 ? (
                <button onClick={() => toggle(acc.id)} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] w-4 h-4 flex items-center justify-center shrink-0">
                  {isOpen ? '▼' : '▶'}
                </button>
              ) : <span className="w-4 h-4 shrink-0" />}
              <span className={`font-mono text-xs font-bold ${acc.isGroup ? 'text-base' : ''}`} style={{ color: tc.color }}>
                {acc.code}
              </span>
            </div>
          </td>
          {/* Name */}
          <td className="px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className={`font-medium text-sm ${acc.isGroup ? 'font-bold text-base' : ''}`}>
                {fa ? acc.nameFa : acc.name}
              </span>
              {!acc.isActive && <span className="text-xs text-[hsl(var(--muted-foreground))] line-through">{fa?'غیرفعال':'Inactive'}</span>}
            </div>
            {acc.description && <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{acc.description}</div>}
            {acc.costCenter && <div className="text-xs text-amber-600 mt-0.5">🏭 {acc.costCenter}</div>}
            {acc.project && <div className="text-xs text-blue-600 mt-0.5">📁 {acc.project}</div>}
          </td>
          {/* Level */}
          <td className="px-3 py-2.5">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${lc.badge}`}>
              {fa ? lc.labelFa : lc.label}
            </span>
          </td>
          {/* Type */}
          <td className="px-3 py-2.5">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: tc.color + '15', color: tc.color }}>
              {tc.icon} {fa ? tc.labelFa : tc.label}
            </span>
          </td>
          {/* Normal */}
          <td className="px-3 py-2.5 text-xs text-[hsl(var(--muted-foreground))]">
            {acc.normal === 'debit' ? (fa ? 'بدهکار' : 'Dr') : (fa ? 'بستانکار' : 'Cr')}
          </td>
          {/* Balance */}
          <td className="px-3 py-2.5 text-end">
            {bal !== 0 && (
              <span className={`text-sm font-bold ${bal > 0 ? '' : 'text-red-500'}`}>
                {Math.abs(bal).toLocaleString('fa-IR')}
              </span>
            )}
          </td>
          {/* Actions */}
          <td className="px-3 py-2.5">
            <div className="flex gap-1">
              <button title={fa?'افزودن زیرحساب':'Add sub-account'}
                onClick={() => { setForm(f=>({...f, parentId: acc.id, level: Math.min(acc.level + 1, 6) as AccLevel, type: acc.type, normal: acc.normal})); setShowNew(true); }}
                className="text-xs px-1.5 py-1 rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--primary)/0.1)] hover:border-[hsl(var(--primary)/0.3)] text-[hsl(var(--muted-foreground))]">
                ➕
              </button>
              <button title={fa?'ویرایش':'Edit'} className="text-xs px-1.5 py-1 rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]">
                ✏️
              </button>
            </div>
          </td>
        </tr>
        {isOpen && children.map(child => <AccountRow key={child.id} acc={child} depth={depth + 1} />)}
      </>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">📋 {fa ? 'سرفصل حساب‌ها (پلان حساب)' : 'Chart of Accounts'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {accounts.length} {fa ? 'حساب' : 'accounts'} — {fa ? 'درختواره ۵ سطحی استاندارد ایران' : '5-level standard hierarchy'}
          </p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90">
          ➕ {fa ? 'حساب جدید' : 'New Account'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-2">
        {summaryByType.map(s => {
          const tc = TYPE_CONFIG[s.type];
          return (
            <div key={s.type} className="rounded-xl border p-3 text-center cursor-pointer hover:opacity-80"
              style={{ borderColor: tc.color + '40', background: tc.color + '08' }}
              onClick={() => setFilterType(filterType === s.type ? 'all' : s.type)}>
              <div className="text-xl mb-1">{tc.icon}</div>
              <div className="text-xs font-bold" style={{ color: tc.color }}>{fa ? tc.labelFa : tc.label}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{s.count} {fa?'حساب':'acc'}</div>
              <div className="text-xs font-bold mt-0.5" style={{ color: tc.color }}>
                {(s.total / 1e6).toFixed(0)}M
              </div>
            </div>
          );
        })}
      </div>

      {/* Level Legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="font-medium text-[hsl(var(--muted-foreground))]">{fa?'سطوح:':'Levels:'}</span>
        {Object.entries(LEVEL_CONFIG).map(([lvl, cfg]) => (
          <button key={lvl} onClick={() => setFilterLevel(filterLevel === Number(lvl) ? 0 : Number(lvl) as AccLevel)}
            className={`px-2.5 py-1 rounded-full font-bold transition-all ${filterLevel === Number(lvl) ? 'ring-2 ring-offset-1 ring-[hsl(var(--primary))]' : ''} ${cfg.badge}`}>
            {fa ? cfg.labelFa : cfg.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[hsl(var(--border))]">
        {[
          { id:'tree', label: fa?'🌳 درختواره':'🌳 Tree View' },
          { id:'tafzili', label: fa?'🔍 تفصیلی‌ها':'🔍 Detail Accounts' },
          { id:'cost-center', label: fa?'🏭 مراکز هزینه':'🏭 Cost Centers' },
          { id:'report', label: fa?'📊 گزارش':'📊 Report' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab===t.id?'border-[hsl(var(--primary))] text-[hsl(var(--primary))]':'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tree View ── */}
      {tab === 'tree' && (
        <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(var(--muted)/0.5)]">
              <tr>
                {[fa?'کد':'Code', fa?'نام حساب':'Account Name', fa?'سطح':'Level',
                  fa?'نوع':'Type', fa?'ماهیت':'Normal', fa?'مانده':'Balance', ''].map(h => (
                  <th key={h} className="text-start px-3 py-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rootAccounts
                .filter(a => filterType === 'all' || a.type === filterType)
                .map(root => <AccountRow key={root.id} acc={root} depth={0} />)}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tafzili Tab ── */}
      {tab === 'tafzili' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder={fa ? 'جستجو در تفصیلی‌ها...' : 'Search detail accounts...'}
              className={inp + " flex-1"} />
            <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-sm">
              <option value="all">{fa?'همه نوع‌ها':'All Types'}</option>
              {Object.entries(TYPE_CONFIG).map(([t, c]) => <option key={t} value={t}>{fa?c.labelFa:c.label}</option>)}
            </select>
          </div>

          <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))] px-1">
            <span>{filteredTafzili.length} {fa?'حساب تفصیلی':'detail accounts'}</span>
            <button onClick={() => setShowNew(true)} className="text-[hsl(var(--primary))] hover:underline font-medium">
              ➕ {fa?'افزودن تفصیلی جدید':'Add New Detail Account'}
            </button>
          </div>

          <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[hsl(var(--muted)/0.5)]">
                <tr>
                  {[fa?'کد':'Code', fa?'نام':'Name', fa?'سطح':'Level', fa?'نوع':'Type',
                    fa?'مرکز هزینه':'Cost Center', fa?'پروژه':'Project', fa?'مانده':'Balance'].map(h => (
                    <th key={h} className="text-start px-4 py-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTafzili.map(acc => {
                  const tc = TYPE_CONFIG[acc.type];
                  const lc = LEVEL_CONFIG[acc.level];
                  return (
                    <tr key={acc.id} className="border-t border-[hsl(var(--border)/0.4)] hover:bg-[hsl(var(--muted)/0.3)]">
                      <td className="px-4 py-2.5 font-mono text-xs font-bold" style={{ color: tc.color }}>{acc.code}</td>
                      <td className="px-4 py-2.5 font-medium">{fa ? acc.nameFa : acc.name}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${lc.badge}`}>{fa?lc.labelFa:lc.label}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: tc.color+'15', color: tc.color }}>{tc.icon} {fa?tc.labelFa:tc.label}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-amber-600">{acc.costCenter || '—'}</td>
                      <td className="px-4 py-2.5 text-xs text-blue-600">{acc.project || '—'}</td>
                      <td className="px-4 py-2.5 font-bold text-end">{acc.balance.toLocaleString('fa-IR')}</td>
                    </tr>
                  );
                })}
                {filteredTafzili.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-[hsl(var(--muted-foreground))]">{fa?'حساب تفصیلی یافت نشد':'No detail accounts found'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Cost Centers ── */}
      {tab === 'cost-center' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{fa?'مراکز هزینه و پروژه‌ها':'Cost Centers & Projects'}</p>
            <button className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm">
              ➕ {fa?'مرکز هزینه جدید':'New Cost Center'}
            </button>
          </div>
          {costCenters.length === 0 ? (
            <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
              <div className="text-4xl mb-3">🏭</div>
              <p className="font-medium">{fa?'مرکز هزینه‌ای تعریف نشده':'No cost centers defined'}</p>
              <p className="text-sm mt-1">{fa?'هنگام افزودن حساب تفصیلی، مرکز هزینه را مشخص کنید':'Specify cost center when adding detail accounts'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {costCenters.map(cc => {
                const ccAccounts = accounts.filter(a => a.costCenter === cc);
                const ccBalance = ccAccounts.reduce((s, a) => s + a.balance, 0);
                return (
                  <div key={cc} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🏭</span>
                      <span className="font-semibold">{cc}</span>
                    </div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{ccAccounts.length} {fa?'حساب':'accounts'}</div>
                    <div className="text-lg font-bold mt-1">{ccBalance.toLocaleString('fa-IR')}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Report Tab ── */}
      {tab === 'report' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
            <h3 className="font-semibold mb-4">📊 {fa?'گزارش‌گیری بر اساس':'Report By'}</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نوع گزارش':'Report Type'}</label>
                <select className={inp}>
                  <option>{fa?'تراز حساب‌ها':'Account Balances'}</option>
                  <option>{fa?'گردش حساب':'Account Turnover'}</option>
                  <option>{fa?'بر اساس مرکز هزینه':'By Cost Center'}</option>
                  <option>{fa?'بر اساس پروژه':'By Project'}</option>
                  <option>{fa?'بر اساس سطح':'By Level'}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'سطح':'Level Filter'}</label>
                <select className={inp}>
                  <option value="0">{fa?'همه سطوح':'All Levels'}</option>
                  <option value="1">{fa?'فقط گروه':'Group Only'}</option>
                  <option value="2">{fa?'گروه + کل':'Group + General'}</option>
                  <option value="3">{fa?'تا سطح معین':'Up to Subsidiary'}</option>
                  <option value="4">{fa?'تا تفصیلی':'Up to Detail'}</option>
                  <option value="5">{fa?'همه سطوح':'All Levels'}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'از تاریخ':'From Date'}</label>
                <input className={inp} placeholder="1403/01/01" />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'تا تاریخ':'To Date'}</label>
                <input className={inp} placeholder="1403/12/29" />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
                📊 {fa?'تولید گزارش':'Generate Report'}
              </button>
              <button className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)]">
                🖨️ {fa?'چاپ':'Print'}
              </button>
              <button className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted)/0.5)]">
                📥 Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Account Modal ── */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">➕ {fa?'حساب جدید':'New Account'}</h2>
              <button onClick={() => setShowNew(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>

            <div className="space-y-3">
              {/* Level & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'سطح حساب *':'Account Level *'}</label>
                  <select value={form.level} onChange={e => setForm(f=>({...f, level: Number(e.target.value) as AccLevel}))} className={inp}>
                    {Object.entries(LEVEL_CONFIG).map(([lvl, cfg]) => (
                      <option key={lvl} value={lvl}>سطح {lvl} — {fa?cfg.labelFa:cfg.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نوع حساب *':'Account Type *'}</label>
                  <select value={form.type} onChange={e => setForm(f=>({...f, type: e.target.value as AccType, normal: ['asset','expense'].includes(e.target.value)?'debit':'credit'}))} className={inp}>
                    {Object.entries(TYPE_CONFIG).map(([t, c]) => (
                      <option key={t} value={t}>{c.icon} {fa?c.labelFa:c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Parent */}
              <div>
                <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'حساب والد (زیرمجموعه چه حسابی؟)':'Parent Account'}</label>
                <select value={form.parentId} onChange={e => setForm(f=>({...f, parentId: e.target.value}))} className={inp}>
                  <option value="">{fa?'— بدون والد (سطح گروه) —':'— No Parent (Group Level) —'}</option>
                  {accounts.filter(a => a.level < form.level).map(a => (
                    <option key={a.id} value={a.id}>
                      {'  '.repeat(a.level - 1)}{a.code} — {fa?a.nameFa:a.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Code */}
              <div>
                <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1 block">
                  {fa?'کد حساب *':'Account Code *'}
                  <span className="font-normal ms-2 text-[hsl(var(--primary))]">
                    {form.level === 1 ? fa?'(۱ رقم)':'(1 digit)' : form.level === 2 ? fa?'(۲ رقم)':'(2 digits)' : form.level === 3 ? fa?'(۳ رقم)':'(3 digits)' : form.level === 4 ? fa?'(۴ رقم)':'(4 digits)' : fa?'(۵+ رقم)':'(5+ digits)'}
                  </span>
                </label>
                <input value={form.code} onChange={e => setForm(f=>({...f, code: e.target.value}))} className={inp}
                  placeholder={form.level === 1 ? '1' : form.level === 2 ? '11' : form.level === 3 ? '111' : form.level === 4 ? '1111' : form.level === 5 ? '11111' : '111111'} />
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1 block">نام فارسی *</label>
                  <input value={form.nameFa} onChange={e => setForm(f=>({...f, nameFa: e.target.value}))} className={inp} placeholder={fa?'نام حساب به فارسی':'نام حساب به فارسی'} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1 block">Account Name (EN)</label>
                  <input value={form.name} onChange={e => setForm(f=>({...f, name: e.target.value}))} className={inp} placeholder="Account name" />
                </div>
              </div>

              {/* Normal Balance */}
              <div>
                <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'ماهیت حساب':'Normal Balance'}</label>
                <div className="flex gap-2">
                  {(['debit','credit'] as AccNormal[]).map(n => (
                    <button key={n} onClick={() => setForm(f=>({...f, normal: n}))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${form.normal===n?'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]':'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]'}`}>
                      {n==='debit' ? (fa?'بدهکار':'Debit') : (fa?'بستانکار':'Credit')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tafzili options — only for level 4-5 */}
              {form.level >= 4 && (
                <div className="rounded-xl border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.05)] p-3 space-y-3">
                  <div className="text-xs font-bold text-[hsl(var(--primary))]">
                    🔍 {fa?`تنظیمات سطح ${form.level} — ${form.level>=6?'شناسه/قرارداد':form.level===5?'تفصیلی شناور':'تفصیلی'}`:`Level ${form.level} — ${form.level>=6?'ID/Contract':form.level===5?'Floating Detail':'Detail'} Settings`}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">🏭 {fa?'مرکز هزینه':'Cost Center'}</label>
                      <input value={form.costCenter} onChange={e => setForm(f=>({...f, costCenter: e.target.value}))} className={inp} placeholder={fa?'مثال: واحد تولید':'e.g. Production Unit'} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">📁 {fa?'پروژه':'Project'}</label>
                      <input value={form.project} onChange={e => setForm(f=>({...f, project: e.target.value}))} className={inp} placeholder={fa?'کد یا نام پروژه':'Project code/name'} />
                    </div>
                  </div>
                  {form.level >= 6 && (
                    <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-600 space-y-1">
                      <div className="font-bold">🔖 {fa?'سطح ۶ — شناسه / قرارداد':'Level 6 — ID / Contract'}</div>
                      <div>{fa?'این سطح برای ردیابی دقیق هر شخص، قرارداد یا پروژه به صورت مجزا استفاده می‌شود.':'Use this level to track individual persons, contracts or projects separately.'}</div>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'توضیحات':'Description'}</label>
                    <input value={form.description} onChange={e => setForm(f=>({...f, description: e.target.value}))} className={inp} placeholder={fa?'توضیحات اختیاری':'Optional description'} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button onClick={handleAddAccount} disabled={!form.code || !form.nameFa}
                className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium disabled:opacity-50">
                ✅ {fa?'افزودن حساب':'Add Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
