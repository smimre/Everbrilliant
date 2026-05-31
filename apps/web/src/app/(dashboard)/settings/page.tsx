
'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, User, Bell, Palette, Shield, Globe, Users, Building2, Key, UserCog, Plus, Trash2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type SettingsTab = 'profile'|'appearance'|'notifications'|'security'|'language'|'users'|'company'|'roles'|'admin';

const ALL_PERMS: Record<string,{label:string;group:string}> = {
  req_approve:     {label:'تایید قیمت',      group:'خریدار'},
  havaleh_view:    {label:'مشاهده حواله',    group:'خریدار'},
  tender_bid:      {label:'شرکت در مزایده', group:'خریدار'},
  quote_view:      {label:'مشاهده درخواست', group:'فروشنده'},
  quote_give:      {label:'اعلام قیمت',     group:'فروشنده'},
  havaleh_issue:   {label:'صدور حواله',     group:'فروشنده'},
  tender_create:   {label:'ایجاد مزایده',   group:'فروشنده'},
  tender_open:     {label:'باز کردن پاکت',  group:'فروشنده'},
  pay_view:        {label:'مشاهده پرداخت',  group:'مالی'},
  pay_confirm:     {label:'تایید پرداخت',   group:'مالی'},
  conn_manage:     {label:'مدیریت اتصالات', group:'عمومی'},
  report_view:     {label:'مشاهده گزارش',   group:'عمومی'},
  user_manage:     {label:'مدیریت کاربران', group:'عمومی'},
  shipment_view:   {label:'مشاهده محموله',  group:'حمل'},
  shipment_update: {label:'آپدیت حمل',      group:'حمل'},
};

const PRESET_ROLES: Record<string,{label:string;color:string;perms:string[]}> = {
  company_admin: {label:'ادمین شرکت',   color:'#f59e0b', perms:Object.keys(ALL_PERMS)},
  finance:       {label:'مدیر مالی',    color:'#3b82f6', perms:['pay_view','pay_confirm','havaleh_view','report_view','quote_view']},
  purchase:      {label:'کارشناس خرید', color:'#10b981', perms:['quote_view','tender_bid','conn_manage','havaleh_view']},
  viewer:        {label:'ناظر',         color:'#6b7280', perms:['quote_view','havaleh_view','pay_view','report_view']},
  custom:        {label:'سفارشی',       color:'#8b5cf6', perms:[]},
};

type SubUser = {id:string;name:string;phone:string;role:string;title:string;department:string;perms:string[];active:boolean;isAdmin:boolean};

const INIT_USERS: SubUser[] = [
  {id:'u1',name:'احمد رضایی', phone:'09121111111',role:'company_admin',title:'مدیرعامل',     department:'مدیریت',  perms:Object.keys(ALL_PERMS) as string[],active:true, isAdmin:true},
  {id:'u2',name:'مریم احمدی', phone:'09129991111',role:'finance',      title:'مدیر مالی',   department:'مالی',    perms:['pay_view','pay_confirm','havaleh_view','report_view'],active:true, isAdmin:false},
  {id:'u3',name:'رضا کریمی',  phone:'09125551111',role:'purchase',     title:'کارشناس خرید',department:'بازرگانی',perms:['quote_view','tender_bid','conn_manage'],active:true, isAdmin:false},
  {id:'u4',name:'سارا محمدی', phone:'09128881111',role:'viewer',       title:'ناظر عملیات', department:'بازرگانی',perms:['quote_view','havaleh_view'],active:false,isAdmin:false},
];

const INIT_COMPANIES = [
  {id:'c1',name:'شرکت بازرگانی الفا',phone:'09122222222',country:'Iran',type:'trading',  users:3,active:true, code:'ALFA-001'},
  {id:'c2',name:'مهر پارس',          phone:'09123333333',country:'Iran',type:'supplier', users:2,active:true, code:'MEHR-002'},
  {id:'c3',name:'ارمغان لجستیک',     phone:'09124444444',country:'Iran',type:'logistics',users:4,active:true, code:'ARMG-003'},
  {id:'c4',name:'تجارت نوین',        phone:'09125555555',country:'UAE', type:'trading',  users:1,active:false,code:'TRNW-004'},
];
function Avatar({name, color='#3b82f6'}: {name:string;color?:string}) {
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{background:color}}>
      {name?.[0]?.toUpperCase()||'U'}
    </div>
  );
}

function UserRow({u,fa,onToggle,onDelete}: {u:SubUser;fa:boolean;onToggle:()=>void;onDelete:()=>void}) {
  const role = PRESET_ROLES[u.role];
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
      <Avatar name={u.name} color={role?.color}/>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm">{u.name}</span>
          {u.isAdmin && <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-full">{fa?'ادمین':'Admin'}</span>}
          {role && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{background:role.color+'22',color:role.color}}>{role.label}</span>}
        </div>
        <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{u.title}{u.department?' | '+u.department:''} | {u.phone}</div>
        <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{u.perms.length}/{Object.keys(ALL_PERMS).length} {fa?'دسترسی':'perms'}</div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={'text-[10px] px-1.5 py-0.5 rounded-full '+(u.active?'bg-green-500/10 text-green-500':'bg-gray-500/10 text-gray-400')}>
          {u.active?(fa?'فعال':'Active'):(fa?'غیرفعال':'Inactive')}
        </span>
        {!u.isAdmin && <>
          <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted)/0.5)]">
            {u.active ? <X className="w-3.5 h-3.5"/> : <Check className="w-3.5 h-3.5"/>}
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 className="w-3.5 h-3.5"/></button>
        </>}
      </div>
    </div>
  );
}

function AddUserModal({fa,onClose,onSave}: {fa:boolean;onClose:()=>void;onSave:(u:SubUser)=>void}) {
  const [form,setForm] = useState({name:'',phone:'',title:'',department:'',role:'purchase'});
  const set = (k:string) => (e:any) => setForm(f=>({...f,[k]:e.target.value}));
  const role = PRESET_ROLES[form.role];
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[hsl(var(--background))] rounded-2xl p-6 w-full max-w-lg border border-[hsl(var(--border))] max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-lg mb-4">{fa?'کاربر جدید':'New User'}</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa?'نام':'Name'} *</label>
              <input value={form.name} onChange={set('name')} className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"/></div>
            <div><label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa?'موبایل':'Phone'} *</label>
              <input value={form.phone} onChange={set('phone')} className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"/></div>
            <div><label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa?'عنوان شغلی':'Title'} *</label>
              <input value={form.title} onChange={set('title')} className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"/></div>
            <div><label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa?'دپارتمان':'Dept'}</label>
              <input value={form.department} onChange={set('department')} className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"/></div>
          </div>
          <div><label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa?'نقش':'Role'}</label>
            <select value={form.role} onChange={set('role')} className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none">
              {Object.entries(PRESET_ROLES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select></div>
          {role && <div className="bg-[hsl(var(--secondary))] rounded-lg p-3">
            <p className="text-xs font-semibold mb-1.5">{fa?'دسترسی‌های این نقش:':'Permissions:'}</p>
            <div className="flex flex-wrap gap-1">{role.perms.length===0?<span className="text-xs text-[hsl(var(--muted-foreground))]">{fa?'بدون دسترسی':'None'}</span>:role.perms.map(p=><span key={p} className="text-[10px] bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded px-1.5 py-0.5">{ALL_PERMS[p]?.label}</span>)}</div>
          </div>}
        </div>
        <div className="flex gap-2 mt-4 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
          <button onClick={()=>{
            if(!form.name||!form.phone||!form.title){alert(fa?'فیلدهای الزامی':'Required');return;}
            onSave({...form,id:'u'+Date.now(),perms:PRESET_ROLES[form.role]?.perms||[],active:true,isAdmin:false});
          }} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-bold">{fa?'ثبت کاربر':'Add'}</button>
        </div>
      </div>
    </div>
  );
}

function AddCompanyModal({fa,onClose,onSave}: {fa:boolean;onClose:()=>void;onSave:(c:any)=>void}) {
  const [form,setForm] = useState({name:'',phone:'',country:'Iran',type:'trading',adminName:'',adminPhone:''});
  const set = (k:string) => (e:any) => setForm(f=>({...f,[k]:e.target.value}));
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[hsl(var(--background))] rounded-2xl p-6 w-full max-w-lg border border-[hsl(var(--border))]">
        <h3 className="font-bold text-lg mb-4">{fa?'ایجاد شرکت جدید':'New Company'}</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa?'نام شرکت':'Name'} *</label>
              <input value={form.name} onChange={set('name')} className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"/></div>
            <div><label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa?'تلفن':'Phone'} *</label>
              <input value={form.phone} onChange={set('phone')} className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"/></div>
            <div><label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa?'کشور':'Country'}</label>
              <select value={form.country} onChange={set('country')} className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none">
                {['Iran','UAE','Turkey','China','India','Germany'].map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa?'نوع':'Type'}</label>
              <select value={form.type} onChange={set('type')} className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none">
                <option value="trading">{fa?'بازرگانی':'Trading'}</option>
                <option value="supplier">{fa?'تامین‌کننده':'Supplier'}</option>
                <option value="logistics">{fa?'حمل و نقل':'Logistics'}</option>
                <option value="manufacturer">{fa?'تولیدی':'Manufacturer'}</option>
              </select></div>
          </div>
          <div className="border-t border-[hsl(var(--border))] pt-3">
            <p className="text-xs font-semibold mb-2">{fa?'ادمین شرکت':'Company Admin'}</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa?'نام ادمین':'Admin Name'} *</label>
                <input value={form.adminName} onChange={set('adminName')} className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"/></div>
              <div><label className="text-xs text-[hsl(var(--muted-foreground))] block mb-1">{fa?'موبایل ادمین':'Admin Phone'} *</label>
                <input value={form.adminPhone} onChange={set('adminPhone')} className="w-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"/></div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
          <button onClick={()=>{
            if(!form.name||!form.phone||!form.adminName||!form.adminPhone){alert(fa?'فیلدهای الزامی':'Required');return;}
            onSave({...form,id:'c'+Date.now(),users:1,active:true,code:form.name.slice(0,4).toUpperCase()+'-'+Date.now().toString().slice(-3)});
          }} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-bold">{fa?'ایجاد شرکت':'Create'}</button>
        </div>
      </div>
    </div>
  );
}
export default function SettingsPage() {
  const { lang, setLocale } = useLocaleStore();
  const { user } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const fa = lang === 'fa';
  const [tab, setTab] = useState<SettingsTab>('profile');
  const [users, setUsers] = useState<SubUser[]>(INIT_USERS);
  const [companies, setCompanies] = useState(INIT_COMPANIES);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [userFilter, setUserFilter] = useState('');

  const tabs = [
    {id:'profile',      icon:<User className="h-4 w-4"/>,      fa:'پروفایل',        en:'Profile'},
    {id:'appearance',   icon:<Palette className="h-4 w-4"/>,   fa:'ظاهر',           en:'Appearance'},
    {id:'language',     icon:<Globe className="h-4 w-4"/>,     fa:'زبان',           en:'Language'},
    {id:'security',     icon:<Shield className="h-4 w-4"/>,    fa:'امنیت',          en:'Security'},
    {id:'notifications',icon:<Bell className="h-4 w-4"/>,      fa:'اعلان‌ها',       en:'Notifications'},
    {id:'users',        icon:<Users className="h-4 w-4"/>,     fa:'کاربران شرکت',   en:'Company Users'},
    {id:'roles',        icon:<Key className="h-4 w-4"/>,       fa:'نقش‌ها',         en:'Roles'},
    {id:'company',      icon:<Building2 className="h-4 w-4"/>, fa:'اطلاعات شرکت',  en:'Company Info'},
    {id:'admin',        icon:<UserCog className="h-4 w-4"/>,   fa:'مدیریت سیستم',  en:'System Admin'},
  ];

  const filteredUsers = users.filter(u => !userFilter || u.name.includes(userFilter) || u.phone.includes(userFilter));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Settings className="h-6 w-6 text-[hsl(var(--primary))]"/>
        {fa ? 'تنظیمات' : 'Settings'}
      </h1>
      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="w-full lg:w-52 shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id as SettingsTab)}
                className={cn('flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                  tab===t.id ? 'bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted)/0.5)]')}>
                {t.icon}{fa ? t.fa : t.en}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-6">

          {tab==='profile' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">{fa?'اطلاعات پروفایل':'Profile Info'}</h2>
              <div className="flex items-center gap-4 p-4 bg-[hsl(var(--background))] rounded-xl border border-[hsl(var(--border))]">
                <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary)/0.15)] flex items-center justify-center text-2xl font-bold text-[hsl(var(--primary))]">
                  {user?.name?.[0] || 'S'}
                </div>
                <div>
                  <div className="font-bold text-lg">{user?.name || 'Super Admin'}</div>
                  <div className="text-sm text-[hsl(var(--muted-foreground))]">{user?.phone}</div>
                  <span className="text-xs mt-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 inline-block">{fa?'ادمین کل':'System Admin'}</span>
                </div>
              </div>
              <Input label={fa?'نام':'Name'} defaultValue={user?.name}/>
              <Input label={fa?'موبایل':'Phone'} defaultValue={user?.phone} disabled/>
              <Input label={fa?'ایمیل':'Email'} type="email" placeholder="example@company.com"/>
              <Button>{fa?'ذخیره':'Save'}</Button>
            </div>
          )}

          {tab==='appearance' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">{fa?'تنظیمات ظاهری':'Appearance'}</h2>
              <div className="grid grid-cols-2 gap-3">
                {(['light','dark'] as const).map(t => (
                  <button key={t} onClick={()=>setTheme(t)}
                    className={cn('p-6 rounded-xl border transition-all text-center',theme===t?'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)]':'border-[hsl(var(--border))]')}>
                    <p className="text-3xl mb-2">{t==='dark'?'🌙':'☀️'}</p>
                    <p className="font-medium">{t==='dark'?(fa?'تیره':'Dark'):(fa?'روشن':'Light')}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab==='language' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">{fa?'تنظیمات زبان':'Language'}</h2>
              <div className="grid grid-cols-2 gap-3">
                {[{code:'fa',label:'فارسی',flag:'🇮🇷'},{code:'en',label:'English',flag:'🇬🇧'},{code:'ar',label:'العربية',flag:'🇸🇦'},{code:'hi',label:'हिन्दी',flag:'🇮🇳'}].map(l=>(
                  <button key={l.code} onClick={()=>setLocale(l.code as any)}
                    className={cn('flex items-center gap-3 p-4 rounded-xl border transition-all',lang===l.code?'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)]':'border-[hsl(var(--border))]')}>
                    <span className="text-2xl">{l.flag}</span><span className="font-medium">{l.label}</span>
                    {lang===l.code && <Check className="w-4 h-4 text-[hsl(var(--primary))] ml-auto"/>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab==='security' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">{fa?'تنظیمات امنیتی':'Security'}</h2>
              <Input label={fa?'رمز فعلی':'Current Password'} type="password"/>
              <Input label={fa?'رمز جدید':'New Password'} type="password"/>
              <Input label={fa?'تکرار رمز':'Confirm'} type="password"/>
              <Button>{fa?'تغییر رمز':'Change Password'}</Button>
            </div>
          )}

          {tab==='notifications' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">{fa?'اعلان‌ها':'Notifications'}</h2>
              {[{k:'req',l:fa?'درخواست جدید':'New Request'},{k:'quote',l:fa?'قیمت جدید':'New Quote'},{k:'pay',l:fa?'پرداخت':'Payment'},{k:'tender',l:fa?'مزایده':'Tender'}].map(n=>(
                <div key={n.k} className="flex items-center justify-between py-2 border-b border-[hsl(var(--border))] last:border-0">
                  <span className="text-sm">{n.l}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer"/>
                    <div className="w-9 h-5 bg-[hsl(var(--muted))] rounded-full peer peer-checked:bg-[hsl(var(--primary))] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {tab==='users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="font-semibold text-lg">{fa?'کاربران شرکت':'Company Users'}</h2>
                <button onClick={()=>setShowAddUser(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-sm font-bold">
                  <Plus className="w-4 h-4"/> {fa?'کاربر جدید':'New User'}
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[{l:fa?'کل':'Total',v:users.length,c:'#3b82f6'},{l:fa?'فعال':'Active',v:users.filter(u=>u.active).length,c:'#10b981'},{l:fa?'ادمین':'Admins',v:users.filter(u=>u.isAdmin).length,c:'#f59e0b'},{l:fa?'دپارتمان':'Depts',v:new Set(users.map(u=>u.department).filter(Boolean)).size,c:'#8b5cf6'}].map((s,i)=>(
                  <div key={i} className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl p-3 text-center">
                    <div className="text-xl font-bold" style={{color:s.c}}>{s.v}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.l}</div>
                  </div>
                ))}
              </div>
              <input value={userFilter} onChange={e=>setUserFilter(e.target.value)} placeholder={fa?'جستجو...':'Search...'}
                className="w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-sm outline-none"/>
              <div className="space-y-2">
                {filteredUsers.map(u=>(
                  <UserRow key={u.id} u={u} fa={fa}
                    onToggle={()=>setUsers(us=>us.map(x=>x.id===u.id?{...x,active:!x.active}:x))}
                    onDelete={()=>{if(confirm(fa?'حذف شود؟':'Delete?'))setUsers(us=>us.filter(x=>x.id!==u.id));}}
                  />
                ))}
              </div>
            </div>
          )}

          {tab==='roles' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">{fa?'نقش‌ها و دسترسی‌ها':'Roles'}</h2>
              <div className="space-y-3">
                {Object.entries(PRESET_ROLES).map(([key,role])=>(
                  <div key={key} className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold px-2 py-0.5 rounded-full" style={{background:role.color+'22',color:role.color}}>{role.label}</span>
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">{users.filter(u=>u.role===key).length} {fa?'کاربر':'users'}</span>
                      </div>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">{role.perms.length}/{Object.keys(ALL_PERMS).length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {role.perms.length===0?<span className="text-xs text-[hsl(var(--muted-foreground))]">{fa?'سفارشی':'Custom'}</span>
                        :role.perms.map(p=><span key={p} className="text-[10px] bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded px-1.5 py-0.5">{ALL_PERMS[p]?.label}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==='company' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">{fa?'اطلاعات شرکت':'Company Info'}</h2>
              <div className="grid grid-cols-2 gap-3">
                <Input label={fa?'نام شرکت':'Name'} defaultValue="شرکت ایورتریدینگ"/>
                <Input label={fa?'شناسه ملی':'National ID'} defaultValue="14005678901"/>
                <Input label={fa?'کد اقتصادی':'Economic Code'} defaultValue="411234567890"/>
                <Input label={fa?'شماره ثبت':'Reg No'} defaultValue="12345"/>
                <Input label={fa?'تلفن':'Phone'} defaultValue="02112345678"/>
                <Input label={fa?'ایمیل':'Email'} defaultValue="info@everbrilliant.com"/>
              </div>
              <Input label={fa?'آدرس':'Address'} defaultValue="تهران، خیابان ولیعصر"/>
              <Button>{fa?'ذخیره':'Save'}</Button>
            </div>
          )}

          {tab==='admin' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="font-semibold text-lg">{fa?'مدیریت سیستم':'System Admin'}</h2>
                <button onClick={()=>setShowAddCompany(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-sm font-bold">
                  <Plus className="w-4 h-4"/> {fa?'شرکت جدید':'New Company'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[{l:fa?'شرکت‌ها':'Companies',v:companies.length,c:'#3b82f6'},{l:fa?'فعال':'Active',v:companies.filter(c=>c.active).length,c:'#10b981'},{l:fa?'کاربران':'Users',v:companies.reduce((s,c)=>s+c.users,0),c:'#8b5cf6'},{l:fa?'کشورها':'Countries',v:new Set(companies.map(c=>c.country)).size,c:'#f59e0b'}].map((s,i)=>(
                  <div key={i} className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold" style={{color:s.c}}>{s.v}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
                <div className="p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{fa?'لیست شرکت‌ها':'Companies'}</h3>
                </div>
                <div className="divide-y divide-[hsl(var(--border))]">
                  {companies.map(c=>(
                    <div key={c.id} className="flex items-center gap-3 p-4">
                      <Avatar name={c.name} color="#3b82f6"/>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{c.name}</span>
                          <span className="text-[10px] font-mono bg-[hsl(var(--secondary))] px-1.5 py-0.5 rounded">{c.code}</span>
                        </div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">{c.country} | {c.users} {fa?'کاربر':'users'} | {c.type}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={'text-[10px] px-1.5 py-0.5 rounded-full '+(c.active?'bg-green-500/10 text-green-500':'bg-red-500/10 text-red-400')}>
                          {c.active?(fa?'فعال':'Active'):(fa?'غیرفعال':'Inactive')}
                        </span>
                        <button onClick={()=>alert(fa?'ورود به: '+c.name:'Login: '+c.name)} className="text-xs px-2 py-1 bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] rounded-lg">{fa?'ورود':'Login'}</button>
                        <button onClick={()=>setCompanies(cs=>cs.map(x=>x.id===c.id?{...x,active:!x.active}:x))} className="text-xs px-2 py-1 border border-[hsl(var(--border))] rounded-lg">{c.active?(fa?'تعلیق':'Suspend'):(fa?'فعال':'Activate')}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[{icon:'📊',l:fa?'گزارش سیستم':'Report',c:'#3b82f6'},{icon:'💾',l:fa?'بکاپ':'Backup',c:'#10b981'},{icon:'📋',l:fa?'لاگ سیستم':'Logs',c:'#06b6d4'},{icon:'⚙️',l:fa?'تنظیمات':'Config',c:'#8b5cf6'},{icon:'📧',l:fa?'ارسال انبوه':'Mass Email',c:'#f59e0b'},{icon:'🔄',l:fa?'ریست کش':'Clear Cache',c:'#ef4444'}].map((a,i)=>(
                  <button key={i} className="flex items-center gap-3 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--secondary))] transition-colors">
                    <span className="text-2xl">{a.icon}</span>
                    <span className="text-sm font-medium" style={{color:a.c}}>{a.l}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      {showAddUser && <AddUserModal fa={fa} onClose={()=>setShowAddUser(false)} onSave={u=>{setUsers(us=>[...us,u]);setShowAddUser(false);alert(fa?'کاربر اضافه شد':'User added');}}/>}
      {showAddCompany && <AddCompanyModal fa={fa} onClose={()=>setShowAddCompany(false)} onSave={c=>{setCompanies(cs=>[...cs,c]);setShowAddCompany(false);alert(fa?'شرکت ایجاد شد':'Company created');}}/>}
    </div>
  );
}
