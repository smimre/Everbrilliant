'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { StatCard } from '@/components/dashboard/stat-card';
import { Table, Column } from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';
import { useCRMConnections } from '@/hooks/use-crm';
import { Plus, Search, Building2, Star, TrendingUp, Users } from 'lucide-react';

interface CRMCompany {
  id: number; name: string; type: string; country: string;
  contacts: number; deals: number; totalValue: number;
  rating: number; status: 'active'|'inactive'|'prospect';
  lastActivity: string;
}

const MOCK_COMPANIES: CRMCompany[] = [
  { id:1, name:'شرکت بازرگانی الفا', type:'buyer', country:'Iran', contacts:3, deals:12, totalValue:8500000000, rating:5, status:'active', lastActivity:'1403/02/18' },
  { id:2, name:'مهر پارس', type:'supplier', country:'Iran', contacts:2, deals:7, totalValue:3200000000, rating:4, status:'active', lastActivity:'1403/02/15' },
  { id:3, name:'ارمغان لجستیک', type:'logistics', country:'Iran', contacts:1, deals:20, totalValue:1500000000, rating:5, status:'active', lastActivity:'1403/02/10' },
  { id:4, name:'تجارت نوین', type:'buyer', country:'UAE', contacts:2, deals:3, totalValue:900000000, rating:3, status:'prospect', lastActivity:'1403/01/25' },
  { id:5, name:'گلوبال ترید', type:'supplier', country:'Turkey', contacts:4, deals:0, totalValue:0, rating:0, status:'prospect', lastActivity:'1403/02/01' },
];

type CRMView = 'list' | 'detail';

export function CRMModule() {
  const [view, setView] = useState<CRMView>('list');
  const [selected, setSelected] = useState<CRMCompany | null>(null);

  if (view === 'detail' && selected) {
    return <CRMDetail company={selected} onBack={() => setView('list')} />;
  }
  return <CRMList onSelect={(c) => { setSelected(c); setView('detail'); }} />;
}

function normalizeConnection(raw: any): CRMCompany {
  return {
    id: raw.id || raw._id || Math.random(),
    name: raw.name || raw.companyName || raw.partnerName || '—',
    type: raw.type || raw.businessType || raw.role || 'buyer',
    country: raw.country || raw.countryCode || '—',
    contacts: raw.contactCount || raw.contacts || 0,
    deals: raw.dealCount || raw.deals || 0,
    totalValue: raw.totalValue || raw.tradingVolume || 0,
    rating: raw.rating || 0,
    status: raw.status || 'active',
    lastActivity: raw.lastActivity || raw.updatedAt
      ? new Date(raw.lastActivity || raw.updatedAt).toLocaleDateString('fa-IR')
      : '—',
  };
}

function CRMList({ onSelect }: { onSelect: (c: CRMCompany) => void }) {
  const { lang } = useLocaleStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all'|'buyer'|'supplier'|'logistics'>('all');
  const d = useDebounce(search);

  const { data: apiData, isLoading: apiLoading } = useCRMConnections();
  const apiConnections: any[] = (apiData as any)?.data ?? (Array.isArray(apiData) ? apiData : []);
  const useMock = apiConnections.length === 0 && !apiLoading;
  const companies: CRMCompany[] = useMock
    ? MOCK_COMPANIES
    : apiConnections.map(normalizeConnection);

  const filtered = companies.filter(c =>
    (filter === 'all' || c.type === filter) &&
    (!d || c.name.toLowerCase().includes(d.toLowerCase()))
  );

  const fmt = (n: number) => new Intl.NumberFormat(lang==='fa'?'fa-IR':'en-US').format(Math.round(n/1_000_000))+'M';

  const columns: Column<CRMCompany>[] = [
    { key:'name', header: lang==='fa'?'شرکت':'Company',
      render: (v, row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={v as string} size="sm" />
          <div>
            <p className="font-semibold text-sm">{v as string}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{row.country}</p>
          </div>
        </div>
      )},
    { key:'type', header: lang==='fa'?'نوع':'Type',
      render: v => <Badge variant={v==='buyer'?'default':v==='supplier'?'success':'info'}>
        {lang==='fa'?{buyer:'خریدار',supplier:'تأمین‌کننده',logistics:'حمل'}[v as string]||v as string:v as string}
      </Badge>},
    { key:'deals', header: lang==='fa'?'معاملات':'Deals', align:'center',
      render: v => <span className="font-bold tabular-nums">{v as number}</span>},
    { key:'totalValue', header: lang==='fa'?'ارزش کل':'Total Value', align:'end',
      render: v => <span className="font-semibold tabular-nums">{fmt(v as number)} IRR</span>},
    { key:'rating', header: lang==='fa'?'امتیاز':'Rating', align:'center',
      render: v => (
        <div className="flex items-center justify-center gap-0.5">
          {Array.from({length:5}).map((_,i) => (
            <Star key={i} className={`h-3 w-3 ${i < (v as number) ? 'text-yellow-400 fill-yellow-400' : 'text-[hsl(var(--border))]'}`} />
          ))}
        </div>
      )},
    { key:'status', header: lang==='fa'?'وضعیت':'Status',
      render: v => <Badge variant={v==='active'?'success':v==='prospect'?'warning':'secondary'}>
        {lang==='fa'?{active:'فعال',inactive:'غیرفعال',prospect:'بالقوه'}[v as string]||v as string:v as string}
      </Badge>},
    { key:'lastActivity', header: lang==='fa'?'آخرین فعالیت':'Last Activity',
      render: v => <span className="text-xs text-[hsl(var(--muted-foreground))]">{v as string}</span>},
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🏢 {lang==='fa'?'مدیریت مشتریان (CRM)':'CRM'}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{filtered.length} {lang==='fa'?'شرکت':'companies'}</p>
        </div>
        <Button><Plus className="h-4 w-4"/>{lang==='fa'?'شرکت جدید':'New Company'}</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Building2 className="h-5 w-5"/>} label={lang==='fa'?'کل شرکت‌ها':'Total Companies'} value={companies.length} color="#3b82f6"/>
        <StatCard icon={<Users className="h-5 w-5"/>} label={lang==='fa'?'مشتریان فعال':'Active'} value={companies.filter(c=>c.status==='active').length} color="#10b981"/>
        <StatCard icon={<TrendingUp className="h-5 w-5"/>} label={lang==='fa'?'بالقوه':'Prospects'} value={companies.filter(c=>c.status==='prospect').length} color="#f59e0b"/>
        <StatCard icon={<Star className="h-5 w-5"/>} label={lang==='fa'?'میانگین امتیاز':'Avg Rating'} value={companies.length ? (companies.reduce((s,c)=>s+(c.rating||0),0)/companies.length).toFixed(1) : '0'} color="#8b5cf6"/>
      </div>
      {useMock && !apiLoading && (
        <div className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 inline-block">
          {lang==='fa'?'داده نمونه — اتصالات واقعی بعد از ثبت شرکت نمایش داده می‌شود':'Sample data — real connections appear after company setup'}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input placeholder={lang==='fa'?'جستجو...':'Search...'} value={search}
          onChange={e=>setSearch(e.target.value)} prefix={<Search className="h-4 w-4"/>} className="w-64"/>
        <div className="flex gap-1 bg-[hsl(var(--muted)/0.4)] rounded-xl p-1">
          {(['all','buyer','supplier','logistics'] as const).map(f => (
            <button key={f} onClick={()=>setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter===f?'bg-[hsl(var(--primary))] text-white':'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}>
              {lang==='fa'?{all:'همه',buyer:'خریدار',supplier:'تأمین‌کننده',logistics:'حمل'}[f]:f}
            </button>
          ))}
        </div>
      </div>

      <Table columns={columns} data={filtered} onRowClick={onSelect} loading={apiLoading}
        emptyTitle={lang==='fa'?'شرکتی پیدا نشد':'No companies found'} emptyIcon="🏢"/>
    </div>
  );
}

function CRMDetail({ company, onBack }: { company: CRMCompany; onBack: () => void }) {
  const { lang } = useLocaleStore();
  const fmt = (n: number) => new Intl.NumberFormat(lang==='fa'?'fa-IR':'en-US').format(Math.round(n/1_000_000))+'M';

  return (
    <div className="space-y-5">
      <Button variant="ghost" onClick={onBack}>← {lang==='fa'?'بازگشت':'Back'}</Button>

      {/* Company Header */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5">
        <div className="flex items-start gap-4">
          <Avatar name={company.name} size="xl"/>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant={company.type==='buyer'?'default':company.type==='supplier'?'success':'info'}>
                {lang==='fa'?{buyer:'خریدار',supplier:'تأمین‌کننده',logistics:'حمل'}[company.type]:company.type}
              </Badge>
              <Badge variant={company.status==='active'?'success':'warning'}>
                {lang==='fa'?{active:'فعال',prospect:'بالقوه',inactive:'غیرفعال'}[company.status]:company.status}
              </Badge>
              <span className="text-sm text-[hsl(var(--muted-foreground))]">🌍 {company.country}</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {Array.from({length:5}).map((_,i) => (
                <Star key={i} className={`h-4 w-4 ${i<company.rating?'text-yellow-400 fill-yellow-400':'text-[hsl(var(--border))]'}`}/>
              ))}
              <span className="text-sm text-[hsl(var(--muted-foreground))] ms-1">({company.rating}/5)</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">{lang==='fa'?'ویرایش':'Edit'}</Button>
            <Button>{lang==='fa'?'درخواست جدید':'New Request'}</Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={<Building2 className="h-5 w-5"/>} label={lang==='fa'?'معاملات':'Deals'} value={company.deals} color="#3b82f6"/>
        <StatCard icon={<TrendingUp className="h-5 w-5"/>} label={lang==='fa'?'ارزش کل':'Total Value'} value={fmt(company.totalValue)} suffix="IRR" color="#10b981"/>
        <StatCard icon={<Users className="h-5 w-5"/>} label={lang==='fa'?'مخاطبین':'Contacts'} value={company.contacts} color="#8b5cf6"/>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5">
        <h2 className="font-semibold mb-4">📅 {lang==='fa'?'تاریخچه فعالیت':'Activity Timeline'}</h2>
        <div className="space-y-3">
          {[
            { icon:'📋', text_fa:'درخواست جدید ایجاد شد', text_en:'New request created', date:'1403/02/18', color:'#3b82f6' },
            { icon:'🧾', text_fa:'فاکتور صادر شد', text_en:'Invoice issued', date:'1403/02/15', color:'#10b981' },
            { icon:'✍️', text_fa:'قرارداد امضا شد', text_en:'Contract signed', date:'1403/02/10', color:'#8b5cf6' },
            { icon:'💬', text_fa:'پیام ارسال شد', text_en:'Message sent', date:'1403/02/05', color:'#f59e0b' },
          ].map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm shrink-0" style={{background:`${a.color}20`,color:a.color}}>{a.icon}</div>
              <div className="flex-1">
                <p className="text-sm">{lang==='fa'?a.text_fa:a.text_en}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{a.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
