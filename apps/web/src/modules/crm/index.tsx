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
import { useDeals, useCreateDeal, useUpdateDeal, useDeleteDeal } from '@/hooks/use-crm';

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

// ─── Deal types ───────────────────────────────────────────────────────────────
interface Deal {
  id: string; title: string; titleFa: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  value: number; probability: number; closingDate: string; owner: string; notes?: string;
}

const DEAL_STAGES: { id: Deal['stage']; label: string; labelFa: string; color: string; icon: string }[] = [
  { id: 'lead',        label: 'Lead',        labelFa: 'سرنخ',           color: '#64748b', icon: '🎯' },
  { id: 'qualified',   label: 'Qualified',   labelFa: 'واجد شرایط',    color: '#3b82f6', icon: '✅' },
  { id: 'proposal',    label: 'Proposal',    labelFa: 'پیشنهاد',        color: '#8b5cf6', icon: '📋' },
  { id: 'negotiation', label: 'Negotiation', labelFa: 'مذاکره',         color: '#f59e0b', icon: '🤝' },
  { id: 'won',         label: 'Won',         labelFa: 'برنده',          color: '#10b981', icon: '🏆' },
  { id: 'lost',        label: 'Lost',        labelFa: 'از دست رفته',   color: '#ef4444', icon: '❌' },
];

function makeSampleDeals(companyName: string): Deal[] {
  return [
    { id:'D1', title:'Annual Supply Contract',  titleFa:'قرارداد تامین سالانه',  stage:'negotiation', value:4500000000, probability:70, closingDate:'1403/05/01', owner:'محمد کریمی',  notes:'در مرحله توافق نهایی' },
    { id:'D2', title:'Q3 Bulk Purchase',         titleFa:'خرید انبوه فصل سوم',    stage:'proposal',    value:1800000000, probability:50, closingDate:'1403/04/15', owner:'سارا احمدی',  notes:'پیشنهاد قیمت ارسال شد' },
    { id:'D3', title:'Equipment Procurement',    titleFa:'تامین تجهیزات',          stage:'qualified',   value:600000000,  probability:30, closingDate:'1403/05/30', owner:'علی رضایی',   notes:'نیاز به بررسی فنی' },
    { id:'D4', title:'Distribution Agreement',   titleFa:'قرارداد توزیع',          stage:'won',         value:8200000000, probability:100,closingDate:'1403/02/10', owner:'محمد کریمی',  notes:'امضا شد ✅' },
    { id:'D5', title:'Pilot Import',             titleFa:'واردات آزمایشی',         stage:'lost',        value:250000000,  probability:0,  closingDate:'1403/01/20', owner:'سارا احمدی',  notes:'رقیب برنده شد' },
  ];
}

function DealPipeline({ company, fa }: { company: CRMCompany; fa: boolean }) {
  const { data: apiData, isLoading } = useDeals();
  const createDeal  = useCreateDeal();
  const updateDeal  = useUpdateDeal();
  const deleteDeal  = useDeleteDeal();

  // Normalize API data: stage from API is uppercase (LEAD), frontend uses lowercase (lead)
  const apiDeals: Deal[] = ((apiData as any)?.data ?? []).map((d: any) => ({
    id: String(d.id), title: d.title, titleFa: d.titleFa ?? d.title,
    stage: (d.stage ?? 'LEAD').toLowerCase() as Deal['stage'],
    value: Number(d.valueIRR ?? 0), probability: d.probability ?? 50,
    closingDate: d.closingDate ?? '', owner: d.ownerName ?? '',
    notes: d.notes ?? '',
  }));
  const isMock = apiDeals.length === 0 && !isLoading;
  const [localDeals, setLocalDeals] = useState<Deal[]>(() => makeSampleDeals(company.name));
  const deals = isMock ? localDeals : apiDeals;

  const [showNew, setShowNew] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [form, setForm] = useState({ title:'', titleFa:'', value:'', probability:'50', closingDate:'', owner:'', notes:'' });
  const fmt = (n: number) => n >= 1e9 ? (n/1e9).toFixed(1)+'B' : n >= 1e6 ? (n/1e6).toFixed(0)+'M' : n.toLocaleString();

  const pipelineStages = DEAL_STAGES.filter(s => !['won','lost'].includes(s.id));
  const closedStages   = DEAL_STAGES.filter(s => ['won','lost'].includes(s.id));

  function moveStage(dealId: string, stage: Deal['stage']) {
    if (isMock) {
      setLocalDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage } : d));
    } else {
      updateDeal.mutate({ id: dealId, dto: { stage: stage.toUpperCase() } });
    }
    setDragId(null);
  }

  function addDeal() {
    if (!form.title || !form.value) return;
    if (isMock) {
      setLocalDeals(prev => [...prev, {
        id: 'D' + Date.now(), title: form.title, titleFa: form.titleFa || form.title,
        stage: 'lead', value: parseInt(form.value) || 0,
        probability: parseInt(form.probability) || 50,
        closingDate: form.closingDate, owner: form.owner, notes: form.notes,
      }]);
    } else {
      createDeal.mutate({
        partnerName: company.name,
        title: form.title, titleFa: form.titleFa,
        valueIRR: parseInt(form.value) || 0,
        probability: parseInt(form.probability) || 50,
        closingDate: form.closingDate || null,
        ownerName: form.owner, notes: form.notes,
        stage: 'LEAD',
      });
    }
    setForm({ title:'', titleFa:'', value:'', probability:'50', closingDate:'', owner:'', notes:'' });
    setShowNew(false);
  }

  const pipelineValue = deals.filter(d => !['won','lost'].includes(d.stage)).reduce((s,d) => s + d.value * d.probability/100, 0);
  const wonValue      = deals.filter(d => d.stage === 'won').reduce((s,d) => s + d.value, 0);

  const inp = 'w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-semibold">🎯 {fa ? 'پایپ‌لاین معاملات' : 'Deal Pipeline'}</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {fa ? 'ارزش احتمالی:' : 'Weighted:'} <strong className="text-[hsl(var(--primary))]">{fmt(pipelineValue)}</strong>
            {' · '}{fa ? 'برنده شده:' : 'Won:'} <strong className="text-green-600">{fmt(wonValue)}</strong>
          </span>
          <Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4"/>{fa ? 'معامله جدید' : 'New Deal'}</Button>
        </div>
      </div>

      {/* Kanban board — active stages */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3 min-w-max">
          {pipelineStages.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage.id);
            const stageVal   = stageDeals.reduce((s,d) => s + d.value, 0);
            return (
              <div key={stage.id} className="w-56 shrink-0"
                onDragOver={e => e.preventDefault()}
                onDrop={() => dragId && moveStage(dragId, stage.id)}>
                <div className="rounded-t-xl px-3 py-2.5 font-semibold text-xs flex items-center justify-between"
                  style={{ background: stage.color + '18', color: stage.color, borderBottom: `2px solid ${stage.color}` }}>
                  <span>{stage.icon} {fa ? stage.labelFa : stage.label}</span>
                  <span className="font-normal opacity-80">{stageDeals.length} · {fmt(stageVal)}</span>
                </div>
                <div className="rounded-b-xl border border-t-0 border-[hsl(var(--border))] bg-[hsl(var(--secondary)/0.5)] p-2 space-y-2 min-h-[120px]">
                  {stageDeals.map(deal => (
                    <div key={deal.id} draggable
                      onDragStart={() => setDragId(deal.id)}
                      className="bg-[hsl(var(--background))] rounded-lg border border-[hsl(var(--border))] p-3 shadow-sm cursor-grab hover:shadow-md transition-shadow">
                      <p className="font-semibold text-xs mb-1 leading-snug">{fa ? deal.titleFa : deal.title}</p>
                      <p className="text-[hsl(var(--primary))] font-bold text-xs">{fmt(deal.value)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--muted)/0.5)] me-2">
                          <div className="h-full rounded-full" style={{ width: deal.probability + '%', background: stage.color }}/>
                        </div>
                        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{deal.probability}%</span>
                      </div>
                      {deal.owner && <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">👤 {deal.owner}</p>}
                    </div>
                  ))}
                  {stageDeals.length === 0 && (
                    <p className="text-center text-xs text-[hsl(var(--muted-foreground))] py-4">—</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Won / Lost summary */}
      <div className="grid grid-cols-2 gap-3">
        {closedStages.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage.id);
          const stageVal   = stageDeals.reduce((s,d) => s + d.value, 0);
          return (
            <div key={stage.id} className="rounded-xl border p-4" style={{ borderColor: stage.color + '40', background: stage.color + '08' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm" style={{ color: stage.color }}>{stage.icon} {fa ? stage.labelFa : stage.label}</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">{stageDeals.length} {fa ? 'معامله' : 'deals'}</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: stage.color }}>{fmt(stageVal)}</p>
              <div className="mt-2 space-y-1">
                {stageDeals.slice(0,3).map(d => (
                  <div key={d.id} className="flex justify-between text-xs">
                    <span className="truncate text-[hsl(var(--muted-foreground))]">{fa ? d.titleFa : d.title}</span>
                    <span className="font-medium ms-2 shrink-0">{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* New deal modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">🎯 {fa ? 'معامله جدید' : 'New Deal'}</h3>
              <button onClick={() => setShowNew(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'عنوان *' : 'Title *'}</label>
                <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} className={inp}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'ارزش (ریال) *' : 'Value (IRR) *'}</label>
                  <input type="number" value={form.value} onChange={e=>setForm(f=>({...f,value:e.target.value}))} className={inp}/></div>
                <div><label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'احتمال (%)' : 'Probability (%)'}</label>
                  <input type="number" min={0} max={100} value={form.probability} onChange={e=>setForm(f=>({...f,probability:e.target.value}))} className={inp}/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'تاریخ بسته شدن' : 'Closing Date'}</label>
                  <input value={form.closingDate} onChange={e=>setForm(f=>({...f,closingDate:e.target.value}))} className={inp} placeholder="1403/06/30"/></div>
                <div><label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'مسئول' : 'Owner'}</label>
                  <input value={form.owner} onChange={e=>setForm(f=>({...f,owner:e.target.value}))} className={inp}/></div>
              </div>
              <div><label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{fa ? 'یادداشت' : 'Notes'}</label>
                <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2} className={inp+' resize-none'}/></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNew(false)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button onClick={addDeal} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">✅ {fa?'ذخیره':'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CRMDetail({ company, onBack }: { company: CRMCompany; onBack: () => void }) {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const fmt = (n: number) => new Intl.NumberFormat(fa?'fa-IR':'en-US').format(Math.round(n/1_000_000))+'M';
  const [detailTab, setDetailTab] = useState<'overview' | 'pipeline' | 'contacts'>('overview');

  return (
    <div className="space-y-5">
      <Button variant="ghost" onClick={onBack}>← {fa?'بازگشت':'Back'}</Button>

      {/* Company Header */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5">
        <div className="flex items-start gap-4">
          <Avatar name={company.name} size="xl"/>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant={company.type==='buyer'?'default':company.type==='supplier'?'success':'info'}>
                {fa?{buyer:'خریدار',supplier:'تأمین‌کننده',logistics:'حمل'}[company.type]:company.type}
              </Badge>
              <Badge variant={company.status==='active'?'success':'warning'}>
                {fa?{active:'فعال',prospect:'بالقوه',inactive:'غیرفعال'}[company.status]:company.status}
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
            <Button variant="secondary">{fa?'ویرایش':'Edit'}</Button>
            <Button>{fa?'درخواست جدید':'New Request'}</Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={<Building2 className="h-5 w-5"/>} label={fa?'معاملات':'Deals'} value={company.deals} color="#3b82f6"/>
        <StatCard icon={<TrendingUp className="h-5 w-5"/>} label={fa?'ارزش کل':'Total Value'} value={fmt(company.totalValue)} suffix="IRR" color="#10b981"/>
        <StatCard icon={<Users className="h-5 w-5"/>} label={fa?'مخاطبین':'Contacts'} value={company.contacts} color="#8b5cf6"/>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 bg-[hsl(var(--secondary))] rounded-xl p-1 border border-[hsl(var(--border))]">
        {([
          { id:'overview',  labelFa:'📅 خلاصه',       labelEn:'📅 Overview'  },
          { id:'pipeline',  labelFa:'🎯 پایپ‌لاین',    labelEn:'🎯 Pipeline'  },
          { id:'contacts',  labelFa:'👥 مخاطبین',      labelEn:'👥 Contacts'  },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setDetailTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${detailTab===t.id?'bg-[hsl(var(--primary))] text-white':'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}>
            {fa ? t.labelFa : t.labelEn}
          </button>
        ))}
      </div>

      {/* Overview */}
      {detailTab === 'overview' && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5">
          <h2 className="font-semibold mb-4">📅 {fa?'تاریخچه فعالیت':'Activity Timeline'}</h2>
          <div className="space-y-3">
            {[
              { icon:'📋', text_fa:'درخواست جدید ایجاد شد', text_en:'New request created', date:'1403/02/18', color:'#3b82f6' },
              { icon:'🧾', text_fa:'فاکتور صادر شد',         text_en:'Invoice issued',       date:'1403/02/15', color:'#10b981' },
              { icon:'✍️', text_fa:'قرارداد امضا شد',        text_en:'Contract signed',      date:'1403/02/10', color:'#8b5cf6' },
              { icon:'💬', text_fa:'پیام ارسال شد',           text_en:'Message sent',         date:'1403/02/05', color:'#f59e0b' },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm shrink-0" style={{background:`${a.color}20`,color:a.color}}>{a.icon}</div>
                <div className="flex-1">
                  <p className="text-sm">{fa?a.text_fa:a.text_en}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{a.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pipeline */}
      {detailTab === 'pipeline' && <DealPipeline company={company} fa={fa} />}

      {/* Contacts */}
      {detailTab === 'contacts' && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">👥 {fa?'مخاطبین شرکت':'Company Contacts'}</h2>
            <Button><Plus className="h-4 w-4"/>{fa?'مخاطب جدید':'New Contact'}</Button>
          </div>
          <div className="space-y-3">
            {[
              { name:'علی احمدی', nameEn:'Ali Ahmadi',  role_fa:'مدیر خرید',      role_en:'Purchase Manager', phone:'09121234567', email:'ali@company.ir' },
              { name:'سارا رضایی', nameEn:'Sara Rezaei', role_fa:'کارشناس مالی',   role_en:'Finance Analyst',  phone:'09131234567', email:'sara@company.ir' },
              { name:'محمد کریمی', nameEn:'Mohammad K.', role_fa:'مدیر فروش',      role_en:'Sales Director',   phone:'09141234567', email:'mk@company.ir'   },
            ].slice(0, company.contacts || 2).map((c, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-[hsl(var(--muted)/0.3)]">
                <Avatar name={fa ? c.name : c.nameEn} size="sm"/>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{fa ? c.name : c.nameEn}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{fa ? c.role_fa : c.role_en}</p>
                </div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] space-y-0.5 text-end">
                  <p>{c.phone}</p>
                  <p>{c.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
