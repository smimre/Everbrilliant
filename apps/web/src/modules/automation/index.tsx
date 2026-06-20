'use client';
import { useState } from 'react';
import { useLocaleStore } from '@/store/locale.store';
import { useLetters, useCreateLetter, useArchiveLetter, useMeetings, useCreateMeeting, useWorkflowRequests, useApproveRequest, useRejectRequest, useTasks, useCreateTask, useUpdateTask, useDocuments, useCreateDocument, useWorkflowTemplates, useCreateWorkflowTemplate, useStartWorkflowInstance, useApproveWorkflowStep } from '@/hooks/use-automation';
import { useUIStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Table, Column } from '@/components/ui/table';
import type { Letter, WorkflowRequest } from '@/types';
import { Plus, Mail, CheckSquare, Calendar, Archive, GitBranch } from 'lucide-react';

type AutoView = 'dashboard'|'letters'|'requests'|'meetings'|'tasks'|'archive'|'workflows';
type LetterFilter = 'all'|'incoming'|'outgoing';
interface AutomationModuleProps { initialView?: AutoView; initialLetterFilter?: LetterFilter; }

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_MEETINGS = [
  { id:'MTG-001', title:'جلسه بررسی قرارداد الفا', date:'۱۴۰۳/۰۴/۱۵', time:'10:00', location:'اتاق جلسه A', attendees:['علی رضایی','محمد کریمی','سارا احمدی'], status:'scheduled', type:'internal', notes:'بررسی شرایط قرارداد خرید روغن پالم', agenda:['بررسی پیش‌نویس قرارداد','تعیین شرایط پرداخت','تصمیم‌گیری درباره ضمانت‌نامه'], minutes:'' },
  { id:'MTG-002', title:'ویدئوکنفرانس با تأمین‌کننده UAE', date:'۱۴۰۳/۰۴/۱۸', time:'14:30', location:'آنلاین - Zoom', attendees:['محمد کریمی','تجارت نوین UAE'], status:'scheduled', type:'external', notes:'مذاکره قرارداد واردات گندم', agenda:['معرفی طرفین','بررسی قیمت پیشنهادی','تعیین شرایط حمل‌ونقل'], minutes:'' },
  { id:'MTG-003', title:'جلسه هفتگی تیم بازرگانی', date:'۱۴۰۳/۰۴/۰۸', time:'09:00', location:'دفتر مرکزی', attendees:['همه تیم'], status:'done', type:'internal', notes:'گزارش هفتگی و برنامه‌ریزی', agenda:['گزارش هفته گذشته','برنامه هفته جاری','مشکلات و موانع'], minutes:'جلسه با حضور همه اعضا برگزار شد. گزارش فروش هفتگی ارائه شد. برنامه هفته آینده تصویب گردید.' },
  { id:'MTG-004', title:'جلسه گمرک و ترخیص', date:'۱۴۰۳/۰۴/۲۲', time:'11:00', location:'اداره گمرک بندر', attendees:['علی رضایی','کارشناس گمرک'], status:'scheduled', type:'external', notes:'پیگیری ترخیص محموله شماره EB-TRK-10023', agenda:['بررسی مدارک','پرداخت عوارض گمرکی','دریافت پروانه ترخیص'], minutes:'' },
  { id:'MTG-005', title:'جلسه ارزیابی تأمین‌کنندگان', date:'۱۴۰۳/۰۳/۲۵', time:'15:00', location:'اتاق جلسه B', attendees:['محمد کریمی','سارا احمدی'], status:'cancelled', type:'internal', notes:'لغو به دلیل تغییر برنامه', agenda:[], minutes:'' },
];

const MOCK_TASKS = [
  { id:'TSK-001', title:'پیگیری پرداخت فاکتور SI-002', assignee:'علی رضایی', due:'۱۴۰۳/۰۴/۲۰', priority:'high', status:'in_progress', tag:'مالی', description:'پرداخت فاکتور مهر پارس مانده است.', progress:40 },
  { id:'TSK-002', title:'تهیه پیش‌نویس قرارداد گندم', assignee:'سارا احمدی', due:'۱۴۰۳/۰۴/۲۵', priority:'urgent', status:'pending', tag:'قرارداد', description:'قرارداد واردات ۱۰۰۰ تن گندم از UAE', progress:0 },
  { id:'TSK-003', title:'بروزرسانی پروفایل شرکت', assignee:'محمد کریمی', due:'۱۴۰۳/۰۴/۱۵', priority:'low', status:'done', tag:'اداری', description:'تکمیل اطلاعات در سامانه', progress:100 },
  { id:'TSK-004', title:'بررسی پیشنهادهای مزایده TND-MY-001', assignee:'محمد کریمی', due:'۱۴۰۳/۰۴/۳۰', priority:'high', status:'pending', tag:'مزایده', description:'۳ پیشنهاد دریافت شده، نیاز به ارزیابی', progress:10 },
  { id:'TSK-005', title:'ارسال نمونه کالا برای کیفیت‌سنجی', assignee:'علی رضایی', due:'۱۴۰۳/۰۴/۱۸', priority:'normal', status:'in_progress', tag:'کیفیت', description:'ارسال نمونه روغن پالم به آزمایشگاه', progress:70 },
  { id:'TSK-006', title:'گزارش ماهانه بازرگانی', assignee:'سارا احمدی', due:'۱۴۰۳/۰۴/۳۱', priority:'normal', status:'pending', tag:'گزارش', description:'جمع‌آوری آمار فروش و خرید ماه', progress:0 },
];

const MOCK_DOCUMENTS = [
  { id:'DOC-001', title:'قرارداد خرید روغن پالم ۱۴۰۲', type:'pdf', date:'۱۴۰۲/۱۲/۱۰', size:'۲.۴ MB', category:'قراردادها', version:'1.0', confidential:false, tags:['قرارداد','خرید'], description:'قرارداد بلندمدت خرید روغن پالم از مالزی', uploader:'علی رضایی' },
  { id:'DOC-002', title:'گزارش مالی سالانه ۱۴۰۲', type:'xlsx', date:'۱۴۰۳/۰۱/۱۵', size:'۵.۱ MB', category:'گزارشات', version:'2.1', confidential:true, tags:['مالی','سالانه'], description:'گزارش جامع مالی شرکت برای سال ۱۴۰۲', uploader:'سارا احمدی' },
  { id:'DOC-003', title:'مکاتبات تأمین‌کننده UAE', type:'pdf', date:'۱۴۰۳/۰۲/۲۰', size:'۱.۲ MB', category:'مکاتبات', version:'1.0', confidential:false, tags:['مکاتبات','UAE'], description:'مجموعه نامه‌های رسمی با تأمین‌کننده', uploader:'محمد کریمی' },
  { id:'DOC-004', title:'بارنامه EB-WB-20230', type:'pdf', date:'۱۴۰۳/۰۳/۰۵', size:'۰.۸ MB', category:'لجستیک', version:'1.0', confidential:false, tags:['بارنامه','حمل'], description:'بارنامه حمل دریایی محموله گندم', uploader:'علی رضایی' },
  { id:'DOC-005', title:'گواهی کیفیت روغن پالم QC-001', type:'pdf', date:'۱۴۰۳/۰۳/۱۵', size:'۰.۵ MB', category:'کیفیت', version:'1.0', confidential:false, tags:['کیفیت','آزمایشگاه'], description:'گواهینامه کیفیت صادره از آزمایشگاه معتبر', uploader:'محمد کریمی' },
  { id:'DOC-006', title:'آئین‌نامه داخلی شرکت', type:'docx', date:'۱۴۰۳/۰۱/۰۱', size:'۱.۸ MB', category:'اداری', version:'3.0', confidential:false, tags:['آئین‌نامه','داخلی'], description:'آئین‌نامه رفتاری و اداری اعضای شرکت', uploader:'سارا احمدی' },
];

const MOCK_WORKFLOWS = [
  { id:'WF-001', title:'صدور قرارداد', icon:'📜', mode:'sequential', active:true,
    steps:[
      { name:'تهیه پیش‌نویس', user:'علی رضایی', status:'done', date:'۱۴۰۳/۰۲/۱۰' },
      { name:'بررسی حقوقی', user:'سارا احمدی', status:'done', date:'۱۴۰۳/۰۲/۱۲' },
      { name:'تایید مالی', user:'محمد کریمی', status:'active', date:null },
      { name:'امضای مدیرعامل', user:'علی رضایی', status:'wait', date:null },
    ],
    instances:[
      { id:'WFI-001', title:'قرارداد الفا ۱۴۰۳', startDate:'۱۴۰۳/۰۲/۱۰', status:'inprog', currentStep:2 },
      { id:'WFI-002', title:'قرارداد مهر پارس', startDate:'۱۴۰۳/۰۲/۰۵', status:'done', currentStep:4 },
    ] },
  { id:'WF-002', title:'پرداخت فاکتور', icon:'💰', mode:'parallel', active:true,
    steps:[
      { name:'ثبت فاکتور', user:'سارا احمدی', status:'done', date:'۱۴۰۳/۰۲/۱۱' },
      { name:'تایید خرید', user:'محمد کریمی', status:'active', date:null },
      { name:'تایید مالی', user:'علی رضایی', status:'active', date:null },
      { name:'تصویب مدیر', user:'علی رضایی', status:'wait', date:null },
    ],
    instances:[
      { id:'WFI-003', title:'فاکتور تأمین‌کننده الفا', startDate:'۱۴۰۳/۰۲/۱۱', status:'inprog', currentStep:1 },
    ] },
  { id:'WF-003', title:'درخواست مرخصی', icon:'🏖️', mode:'simple', active:false,
    steps:[
      { name:'تایید سرپرست', user:'محمد کریمی', status:'active', date:null },
    ],
    instances:[
      { id:'WFI-004', title:'مرخصی علی رضایی', startDate:'۱۴۰۳/۰۲/۱۲', status:'inprog', currentStep:0 },
    ] },
  { id:'WF-004', title:'خرید تجهیزات', icon:'🛒', mode:'sequential', active:true,
    steps:[
      { name:'درخواست خرید', user:'سارا احمدی', status:'done', date:'۱۴۰۳/۰۲/۰۵' },
      { name:'استعلام قیمت', user:'محمد کریمی', status:'done', date:'۱۴۰۳/۰۲/۰۶' },
      { name:'تایید بودجه', user:'علی رضایی', status:'done', date:'۱۴۰۳/۰۲/۰۷' },
    ],
    instances:[
      { id:'WFI-005', title:'خرید تجهیزات IT', startDate:'۱۴۰۳/۰۲/۰۵', status:'done', currentStep:3 },
    ] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PRIORITY_COLORS: Record<string,string> = { urgent:'#ef4444', high:'#f59e0b', normal:'#3b82f6', low:'#64748b' };
const PRIORITY_FA: Record<string,string>     = { urgent:'فوری', high:'بالا', normal:'معمولی', low:'پایین' };
const STATUS_COLORS: Record<string,string>   = { pending:'#f59e0b', in_progress:'#3b82f6', done:'#10b981', cancelled:'#ef4444' };
const STATUS_FA: Record<string,string>       = { pending:'در انتظار', in_progress:'در جریان', done:'انجام شده', cancelled:'لغو شده' };
const MTG_STATUS_COLORS: Record<string,string> = { scheduled:'#3b82f6', done:'#10b981', cancelled:'#ef4444' };

const FILE_ICONS: Record<string,string>  = { pdf:'📄', xlsx:'📊', docx:'📝', ppt:'📋', jpg:'🖼️', png:'🖼️', zip:'📦' };
const FILE_COLORS: Record<string,string> = { pdf:'#ef4444', xlsx:'#10b981', docx:'#3b82f6', ppt:'#f59e0b', jpg:'#8b5cf6', png:'#8b5cf6', zip:'#64748b' };
const STEP_STATUS_COLORS: Record<string,string> = { done:'#10b981', active:'#3b82f6', wait:'#64748b', rejected:'#ef4444' };
const STEP_STATUS_ICONS: Record<string,string>  = { done:'✅', active:'🔵', wait:'⏸', rejected:'❌' };

const inp = "w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]";

// ─── Main Module ──────────────────────────────────────────────────────────────
export function AutomationModule({ initialView = 'dashboard', initialLetterFilter = 'all' }: AutomationModuleProps) {
  const [view, setView] = useState<AutoView>(initialView);
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const { toast } = useUIStore();
  const { data: lettersData, isLoading: lettersLoading } = useLetters();
  const { data: meetingsData, isLoading: meetingsLoading } = useMeetings();
  const { data: wfRequestsData, isLoading: wfLoading } = useWorkflowRequests();
  const createLetter = useCreateLetter();
  const archiveLetter = useArchiveLetter();
  const createMeeting = useCreateMeeting();
  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();

  const { data: tasksData }     = useTasks();
  const { data: docsData }      = useDocuments();
  const { data: workflowsData } = useWorkflowTemplates();
  const createTaskMut           = useCreateTask();
  const updateTaskMut           = useUpdateTask();
  const createDocumentMut       = useCreateDocument();
  const createWorkflowMut       = useCreateWorkflowTemplate();
  const startInstanceMut        = useStartWorkflowInstance();
  const approveStepMut          = useApproveWorkflowStep();

  const letters: any[]    = (lettersData as any)?.data ?? lettersData ?? [];
  const meetings: any[]   = (meetingsData as any)?.data ?? meetingsData ?? [];
  const wfRequests: any[] = (wfRequestsData as any)?.data ?? wfRequestsData ?? [];
  const apiTasks: any[]     = (tasksData as any)?.data ?? [];
  const apiDocs: any[]      = (docsData as any)?.data ?? [];
  const apiWorkflows: any[] = Array.isArray(workflowsData) ? workflowsData : [];

  const useLiveData = apiTasks.length > 0 || apiWorkflows.length > 0;
  const dashTasks  = useLiveData ? apiTasks : MOCK_TASKS;
  const dashWfs    = useLiveData ? apiWorkflows : MOCK_WORKFLOWS;

  const pendingTasks = dashTasks.filter((t: any) => t.status === 'pending').length;
  const todayMeetings  = meetings.filter((m: any) => m.status === 'scheduled').length;

  if (view !== 'dashboard') {
    return (
      <div className="space-y-5">
        <button onClick={() => setView('dashboard')} className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
          ← {lang === 'fa' ? 'داشبورد اتوماسیون' : lang === 'ar' ? 'لوحة الأتمتة' : lang === 'hi' ? 'स्वचालन डैशबोर्ड' : 'Automation Dashboard'}
        </button>
        {view === 'letters'   && <LettersPage defaultFilter={initialLetterFilter} letters={letters} lettersLoading={lettersLoading} createLetter={createLetter} archiveLetter={archiveLetter} toast={toast} />}
        {view === 'requests'  && <WorkflowPage wfRequests={wfRequests} wfLoading={wfLoading} approveMutation={approveMutation} rejectMutation={rejectMutation} toast={toast} />}
        {view === 'meetings'  && <MeetingsPage meetings={meetings} meetingsLoading={meetingsLoading} createMeeting={createMeeting} toast={toast} />}
        {view === 'tasks'     && <TasksPage apiTasks={apiTasks} createTask={createTaskMut} updateTask={updateTaskMut} />}
        {view === 'archive'   && <ArchivePage apiDocs={apiDocs} createDocument={createDocumentMut} />}
        {view === 'workflows' && <WorkflowsPage apiWorkflows={apiWorkflows} createWorkflow={createWorkflowMut} startInstance={startInstanceMut} approveStep={approveStepMut} />}
      </div>
    );
  }

  const navItems = [
    { icon:<Mail className="h-6 w-6"/>, label_fa:'مکاتبات', label_ar:'المراسلات', label_en:'Correspondence', label_hi:'पत्राचार', view:'letters' as AutoView, color:'#3b82f6', count:2 },
    { icon:<CheckSquare className="h-6 w-6"/>, label_fa:'درخواست‌های اداری', label_ar:'الطلبات الإدارية', label_en:'Admin Requests', label_hi:'प्रशासनिक अनुरोध', view:'requests' as AutoView, color:'#8b5cf6', count:2 },
    { icon:<Calendar className="h-6 w-6"/>, label_fa:'جلسات', label_ar:'الاجتماعات', label_en:'Meetings', label_hi:'बैठकें', view:'meetings' as AutoView, color:'#10b981', count:todayMeetings },
    { icon:<CheckSquare className="h-6 w-6"/>, label_fa:'وظایف', label_ar:'المهام', label_en:'Tasks', label_hi:'कार्य', view:'tasks' as AutoView, color:'#f59e0b', count:pendingTasks },
    { icon:<Archive className="h-6 w-6"/>, label_fa:'آرشیو اسناد', label_ar:'أرشيف الوثائق', label_en:'Document Archive', label_hi:'दस्तावेज़ संग्रह', view:'archive' as AutoView, color:'#06b6d4', count:MOCK_DOCUMENTS.length },
    { icon:<GitBranch className="h-6 w-6"/>, label_fa:'گردش‌کارها', label_ar:'سير العمل', label_en:'Workflows', label_hi:'कार्यप्रवाह', view:'workflows' as AutoView, color:'#ec4899', count:dashWfs.filter((w:any)=>w.active).length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">⚙️ {lang === 'fa' ? 'اتوماسیون اداری' : lang === 'ar' ? 'الأتمتة المكتبية' : lang === 'hi' ? 'कार्यालय स्वचालन' : 'Office Automation'}</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{lang === 'fa' ? 'مدیریت مکاتبات، جلسات، وظایف و گردش‌کار' : lang === 'ar' ? 'إدارة المراسلات والاجتماعات والمهام وسير العمل' : lang === 'hi' ? 'पत्राचार, बैठकें, कार्य और कार्यप्रवाह प्रबंधित करें' : 'Manage correspondence, meetings, tasks & workflows'}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon:'✅', val:pendingTasks, label:lang==='fa'?'وظیفه در انتظار':lang==='hi'?'लंबित कार्य':'Pending Tasks', color:'#f59e0b' },
          { icon:'📅', val:todayMeetings, label:lang==='fa'?'جلسه برنامه‌ریزی شده':lang==='hi'?'निर्धारित बैठकें':'Scheduled Meetings', color:'#10b981' },
          { icon:'✉️', val:2, label:lang==='fa'?'نامه ورودی':lang==='hi'?'आने वाले पत्र':'Incoming Letters', color:'#3b82f6' },
          { icon:'📋', val:dashWfs.filter((w:any)=>w.active).length, label:lang==='fa'?'گردش‌کار فعال':lang==='hi'?'सक्रिय कार्यप्रवाह':'Active Workflows', color:'#8b5cf6' },
        ].map((s,i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold" style={{color:s.color}}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {navItems.map(item => (
          <button key={item.view} onClick={() => setView(item.view)}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--muted)/0.4)] transition-all group relative">
            {item.count > 0 && (
              <span className="absolute top-3 right-3 min-w-[20px] h-5 rounded-full text-[10px] font-bold flex items-center justify-center px-1"
                style={{ background:item.color+'25', color:item.color }}>{item.count}</span>
            )}
            <div className="rounded-xl p-3 group-hover:scale-110 transition-transform" style={{ background:`${item.color}18`, color:item.color }}>
              {item.icon}
            </div>
            <span className="font-semibold text-sm">{lang === 'fa' ? item.label_fa : lang === 'ar' ? (item.label_ar || item.label_en) : lang === 'hi' ? (item.label_hi || item.label_en) : item.label_en}</span>
          </button>
        ))}
      </div>

      {/* Pending tasks preview */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">✅ {fa?'وظایف در انتظار':'Pending Tasks'}</h2>
          <button onClick={() => setView('tasks')} className="text-xs text-[hsl(var(--primary))] hover:underline">{fa?'همه':'All'}</button>
        </div>
        <div className="space-y-2">
          {dashTasks.filter((t: any) => t.status !== 'done').slice(0,3).map((t: any) => (
            <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[hsl(var(--muted)/0.3)]">
              <div className="w-2 h-2 rounded-full shrink-0" style={{background:PRIORITY_COLORS[t.priority]}} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{t.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--muted))]">
                    <div className="h-full rounded-full bg-[hsl(var(--primary))]" style={{width:`${t.progress}%`}} />
                  </div>
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{t.progress}%</span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{background:PRIORITY_COLORS[t.priority]+'20',color:PRIORITY_COLORS[t.priority]}}>
                {PRIORITY_FA[t.priority]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming meetings preview */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">📅 {fa?'جلسات پیش رو':'Upcoming Meetings'}</h2>
          <button onClick={() => setView('meetings')} className="text-xs text-[hsl(var(--primary))] hover:underline">{fa?'همه':'All'}</button>
        </div>
        <div className="space-y-2">
          {meetings.filter((m: any) => m.status === 'scheduled').slice(0,2).map((m: any) => (
            <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[hsl(var(--muted)/0.3)]">
              <div className="text-xl shrink-0">📅</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{m.title}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">🕐 {m.date} — {m.time} · 📍 {m.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Letters ──────────────────────────────────────────────────────────────────
interface LettersPageProps {
  defaultFilter?: 'all'|'incoming'|'outgoing';
  letters: any[];
  lettersLoading: boolean;
  createLetter: any;
  archiveLetter: any;
  toast: (type: 'success'|'error'|'warning'|'info', message: string) => void;
}
function LettersPage({ defaultFilter = 'all', letters, lettersLoading, createLetter, archiveLetter, toast }: LettersPageProps) {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState<'all'|'incoming'|'outgoing'>(defaultFilter);
  const [letterForm, setLetterForm] = useState({ title:'', letterNo:'', from:'', to:'', body:'' });
  const filtered = letters.filter((l: any) => filter === 'all' || l.type === filter);
  const columns: Column<Letter>[] = [
    { key:'letterNo', header:fa?'شماره نامه':'Letter #', render:v => <span className="font-mono text-xs font-bold text-[hsl(var(--primary))]">{v as string}</span> },
    { key:'title', header:fa?'موضوع':'Subject', render:v => <span className="font-semibold">{v as string}</span> },
    { key:'type', header:fa?'نوع':'Type', render:v => <Badge variant={v==='incoming'?'default':v==='outgoing'?'success':'secondary'}>{fa?{incoming:'ورودی',outgoing:'خروجی',internal:'داخلی'}[v as string]||String(v):String(v)}</Badge> },
    { key:'from', header:fa?'از':'From' },
    { key:'to', header:fa?'به':'To' },
    { key:'priority', header:fa?'اولویت':'Priority', render:v => <Badge variant={v==='urgent'?'destructive':v==='high'?'warning':'secondary'}>{fa?{urgent:'فوری',high:'بالا',normal:'معمولی',low:'پایین'}[v as string]||String(v):String(v)}</Badge> },
    { key:'status', header:fa?'وضعیت':'Status', render:v => <StatusBadge status={v as string} lang={lang}/> },
    { key:'date', header:fa?'تاریخ':'Date', render:v => <span className="text-xs text-[hsl(var(--muted-foreground))]">{v as string}</span> },
  ];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">✉️ {fa?'مکاتبات':'Correspondence'}</h1>
        <Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4 mr-1"/>{fa?'نامه جدید':'New Letter'}</Button>
      </div>
      <div className="flex gap-2">
        {(['all','incoming','outgoing'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter===f?'bg-[hsl(var(--primary))] text-white':'bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'}`}>
            {f==='all'?(fa?'همه':'All'):f==='incoming'?(fa?'ورودی':'Incoming'):(fa?'خروجی':'Outgoing')}
          </button>
        ))}
      </div>
      {lettersLoading ? (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-12 text-center text-[hsl(var(--muted-foreground))]">
          <div className="text-3xl mb-2">⏳</div>
          <p className="text-sm">{fa?'در حال بارگذاری...':'Loading...'}</p>
        </div>
      ) : (
        <Table columns={columns} data={filtered} emptyTitle={fa?'نامه‌ای پیدا نشد':'No letters yet'} emptyIcon="✉️"/>
      )}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">✉️ {fa?'نامه جدید':'New Letter'}</h2>
              <button onClick={() => setShowNew(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'موضوع نامه *':'Subject *'}</label>
                <input value={letterForm.title} onChange={e=>setLetterForm({...letterForm,title:e.target.value})} className={inp}/></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'شماره نامه':'Letter No'}</label>
                <input value={letterForm.letterNo} onChange={e=>setLetterForm({...letterForm,letterNo:e.target.value})} className={inp}/></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'از':'From'}</label>
                <input value={letterForm.from} onChange={e=>setLetterForm({...letterForm,from:e.target.value})} className={inp}/></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'به':'To'}</label>
                <input value={letterForm.to} onChange={e=>setLetterForm({...letterForm,to:e.target.value})} className={inp}/></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'متن نامه':'Body'}</label>
                <textarea value={letterForm.body} onChange={e=>setLetterForm({...letterForm,body:e.target.value})} rows={4} className={inp+' resize-none'}/></div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowNew(false)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button onClick={async () => {
                if (!letterForm.title) { toast('error', fa?'موضوع الزامی است':'Subject required'); return; }
                try {
                  await createLetter.mutateAsync({ ...letterForm, type:'outgoing' });
                  toast('success', fa?'نامه با موفقیت ارسال شد':'Letter sent successfully');
                  setLetterForm({ title:'', letterNo:'', from:'', to:'', body:'' });
                  setShowNew(false);
                } catch (err: any) { toast('error', err?.message || (fa?'خطا در ارسال نامه':'Failed to send letter')); }
              }} disabled={createLetter.isPending} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium disabled:opacity-60">
                {createLetter.isPending ? '...' : '✅ '+(fa?'ارسال':'Send')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Admin Workflow Requests ──────────────────────────────────────────────────
interface WorkflowPageProps {
  wfRequests: any[];
  wfLoading: boolean;
  approveMutation: any;
  rejectMutation: any;
  toast: (type: 'success'|'error'|'warning'|'info', message: string) => void;
}
function WorkflowPage({ wfRequests, wfLoading, approveMutation, rejectMutation, toast }: WorkflowPageProps) {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [filter, setFilter] = useState('all');
  const [commentInput, setCommentInput] = useState('');
  const filtered = wfRequests.filter((r: any) => filter === 'all' || r.status === filter);
  const TYPE_FA: Record<string,string> = { leave:'مرخصی', advance:'پیش‌پرداخت', purchase:'خرید', travel:'سفر اداری', overtime:'اضافه‌کاری', other:'سایر' };
  const columns: Column<any>[] = [
    { key:'id', header:'ID', render:v => <span className="font-mono text-xs font-bold text-[hsl(var(--primary))]">{v as string}</span> },
    { key:'title', header:fa?'عنوان':'Title', render:v => <span className="font-semibold">{v as string}</span> },
    { key:'type', header:fa?'نوع':'Type', render:v => <Badge variant="secondary">{fa?TYPE_FA[v as string]||String(v):String(v)}</Badge> },
    { key:'amount', header:fa?'مبلغ':'Amount', render:v => v ? <span className="text-amber-500 font-semibold text-xs">{Number(v).toLocaleString('fa-IR')} IRR</span> : <span className="text-[hsl(var(--muted-foreground))]">—</span> },
    { key:'status', header:fa?'وضعیت':'Status', render:v => <StatusBadge status={v as string} lang={lang}/> },
    { key:'startDate', header:fa?'از تاریخ':'From', render:v => <span className="text-xs">{v as string||'—'}</span> },
    { key:'id', header:fa?'اقدام':'Action', render:(_v, row: any) => row.status === 'pending' ? (
      <div className="flex gap-1">
        <button onClick={async () => {
          try { await approveMutation.mutateAsync({ id: row.id, comment: commentInput }); toast('success', fa?'تایید شد':'Approved'); }
          catch (err: any) { toast('error', err?.message || 'Error'); }
        }} disabled={approveMutation.isPending} className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/30 hover:bg-green-500/20 disabled:opacity-60">
          ✅ {fa?'تایید':'Approve'}
        </button>
        <button onClick={async () => {
          try { await rejectMutation.mutateAsync({ id: row.id, comment: commentInput }); toast('success', fa?'رد شد':'Rejected'); }
          catch (err: any) { toast('error', err?.message || 'Error'); }
        }} disabled={rejectMutation.isPending} className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 disabled:opacity-60">
          ✕ {fa?'رد':'Reject'}
        </button>
      </div>
    ) : null },
  ];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📋 {fa?'درخواست‌های اداری':'Admin Requests'}</h1>
        <Button><Plus className="h-4 w-4 mr-1"/>{fa?'درخواست جدید':'New Request'}</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {(['all','pending','approved'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter===f?'bg-[hsl(var(--primary))] text-white':'bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'}`}>
            {f==='all'?(fa?'همه':'All'):f==='pending'?(fa?'در انتظار':'Pending'):(fa?'تایید شده':'Approved')}
          </button>
        ))}
      </div>
      {wfLoading ? (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-12 text-center text-[hsl(var(--muted-foreground))]">
          <div className="text-3xl mb-2">⏳</div>
          <p className="text-sm">{fa?'در حال بارگذاری...':'Loading...'}</p>
        </div>
      ) : (
        <Table columns={columns} data={filtered} emptyTitle={fa?'درخواستی پیدا نشد':'No requests'} emptyIcon="📋"/>
      )}
    </div>
  );
}

// ─── Meetings ─────────────────────────────────────────────────────────────────
interface MeetingsPageProps {
  meetings: any[];
  meetingsLoading: boolean;
  createMeeting: any;
  toast: (type: 'success'|'error'|'warning'|'info', message: string) => void;
}
function MeetingsPage({ meetings, meetingsLoading, createMeeting, toast }: MeetingsPageProps) {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [minutesInput, setMinutesInput] = useState('');
  const [form, setForm] = useState({ title:'', date:'', time:'09:00', location:'', attendees:'', type:'internal', notes:'', agendaText:'' });

  const scheduled = meetings.filter((m: any) => m.status === 'scheduled');
  const done = meetings.filter((m: any) => m.status === 'done');

  const handleSubmit = async () => {
    if (!form.title || !form.date) { toast('error', fa?'عنوان و تاریخ الزامی است':'Title and date required'); return; }
    const agenda = form.agendaText.split('\n').filter((s: string) => s.trim());
    try {
      await createMeeting.mutateAsync({ ...form, attendees: form.attendees.split('،').map((s: string) => s.trim()).filter(Boolean), agenda });
      toast('success', fa?'جلسه ثبت شد':'Meeting created');
      setForm({ title:'', date:'', time:'09:00', location:'', attendees:'', type:'internal', notes:'', agendaText:'' });
      setShowNew(false);
    } catch (err: any) { toast('error', err?.message || (fa?'خطا در ثبت جلسه':'Failed to create meeting')); }
  };

  const markDone = (_id: string) => { /* optimistic UI disabled; refetch handles it */ };

  const saveMinutes = (_id: string) => {
    if (!minutesInput.trim()) { toast('error', fa?'صورتجلسه را وارد کنید':'Enter meeting minutes'); return; }
    setMinutesInput('');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📅 {fa?'جلسات':'Meetings'}</h1>
        <Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4 mr-1"/>{fa?'جلسه جدید':'New Meeting'}</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon:'📅', val:scheduled.length, label:fa?'برنامه‌ریزی شده':'Scheduled', color:'#3b82f6' },
          { icon:'✅', val:done.length, label:fa?'برگزار شده':'Done', color:'#10b981' },
          { icon:'❌', val:meetings.filter(m=>m.status==='cancelled').length, label:fa?'لغو شده':'Cancelled', color:'#ef4444' },
        ].map((s,i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{color:s.color}}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming */}
      {scheduled.length > 0 && (
        <div>
          <h2 className="font-semibold text-sm mb-2">📅 {fa?'جلسات پیش رو':'Upcoming'}</h2>
          <div className="space-y-2">
            {scheduled.map(m => (
              <div key={m.id} onClick={() => { setSelected(m); setMinutesInput(''); }}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4 cursor-pointer hover:border-[hsl(var(--primary)/0.3)] transition-colors"
                style={{ borderRight:'4px solid #3b82f6' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{m.title}</div>
                    <div className="flex gap-3 text-xs text-[hsl(var(--muted-foreground))] mt-1 flex-wrap">
                      <span>📅 {m.date}</span><span>🕐 {m.time}</span><span>📍 {m.location}</span>
                      <span>👥 {m.attendees.length} {fa?'نفر':'attendees'}</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500">{m.type==='internal'?(fa?'داخلی':'Internal'):(fa?'خارجی':'External')}</span>
                    </div>
                    {m.agenda.length > 0 && <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1.5">📌 {m.agenda.length} {fa?'آیتم دستور جلسه':'agenda items'}</div>}
                  </div>
                  <button onClick={e => { e.stopPropagation(); markDone(m.id); }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 border border-green-500/30 hover:bg-green-500/20 shrink-0">
                    ✓ {fa?'برگزار شد':'Done'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Done */}
      {done.length > 0 && (
        <div>
          <h2 className="font-semibold text-sm mb-2">✅ {fa?'برگزار شده':'Completed'}</h2>
          <div className="space-y-2">
            {done.map(m => (
              <div key={m.id} onClick={() => { setSelected(m); setMinutesInput(''); }}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 cursor-pointer hover:border-[hsl(var(--primary)/0.3)] opacity-80"
                style={{ borderRight:'4px solid #10b981' }}>
                <div className="font-medium text-sm">{m.title}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1 flex gap-2">
                  <span>📅 {m.date} · 📍 {m.location}</span>
                  {m.minutes ? <span className="text-green-500">✅ {fa?'صورتجلسه ثبت شده':'Minutes recorded'}</span>
                    : <span className="text-amber-500">⏳ {fa?'صورتجلسه ندارد':'No minutes'}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Meeting Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">📅 {fa?'جلسه جدید':'New Meeting'}</h2>
              <button onClick={() => setShowNew(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'عنوان جلسه *':'Title *'}</label>
                <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className={inp} placeholder={fa?'مثال: جلسه بررسی قرارداد':'e.g. Contract Review Meeting'}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">📅 {fa?'تاریخ *':'Date *'}</label>
                  <input value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className={inp} placeholder="۱۴۰۳/۰۴/۱۵"/></div>
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">🕐 {fa?'ساعت':'Time'}</label>
                  <input value={form.time} onChange={e=>setForm({...form,time:e.target.value})} type="time" className={inp}/></div>
              </div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">📍 {fa?'مکان':'Location'}</label>
                <input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} className={inp} placeholder={fa?'اتاق جلسه / آنلاین':'Meeting room / Online'}/></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نوع':'Type'}</label>
                <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className={inp}>
                  <option value="internal">{fa?'داخلی':'Internal'}</option>
                  <option value="external">{fa?'خارجی':'External'}</option>
                </select></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">👥 {fa?'شرکت‌کنندگان (با ، جدا کنید)':'Attendees (comma-separated)'}</label>
                <input value={form.attendees} onChange={e=>setForm({...form,attendees:e.target.value})} className={inp}/></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">📌 {fa?'دستور جلسه (هر خط یک آیتم)':'Agenda (one per line)'}</label>
                <textarea value={form.agendaText} onChange={e=>setForm({...form,agendaText:e.target.value})} rows={3} className={inp+' resize-none'} placeholder={fa?'بررسی قراردادها\nتصمیم‌گیری درباره بودجه':'Review contracts\nBudget decisions'}/></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNew(false)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button onClick={handleSubmit} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">📅 {fa?'ثبت جلسه':'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">📅 {selected.title}</h2>
              <button onClick={() => setSelected(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            {[
              [fa?'تاریخ':'Date', `${selected.date} — ${selected.time}`],
              [fa?'مکان':'Location', selected.location],
              [fa?'نوع':'Type', selected.type==='internal'?(fa?'داخلی':'Internal'):(fa?'خارجی':'External')],
              [fa?'شرکت‌کنندگان':'Attendees', Array.isArray(selected.attendees)?selected.attendees.join('، '):selected.attendees],
            ].map(([k,v]) => v && (
              <div key={k} className="flex justify-between text-sm py-2 border-b border-[hsl(var(--border)/0.5)]">
                <span className="text-[hsl(var(--muted-foreground))]">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}

            {/* Agenda */}
            {selected.agenda?.length > 0 && (
              <div className="mt-3">
                <div className="font-semibold text-xs text-[hsl(var(--muted-foreground))] mb-2">📌 {fa?'دستور جلسه':'Agenda'}</div>
                <div className="space-y-1">
                  {selected.agenda.map((a: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm p-2 bg-[hsl(var(--muted)/0.3)] rounded-lg">
                      <span className="text-[hsl(var(--primary))] font-bold shrink-0">{i+1}.</span>
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Minutes - if done */}
            {selected.status === 'done' && (
              <div className="mt-3">
                <div className="font-semibold text-xs text-[hsl(var(--muted-foreground))] mb-2">📝 {fa?'صورتجلسه':'Meeting Minutes'}</div>
                {selected.minutes ? (
                  <div className="text-sm p-3 bg-[hsl(var(--muted)/0.3)] rounded-lg leading-relaxed">{selected.minutes}</div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs text-amber-500 p-2 bg-amber-500/10 rounded-lg">⚠️ {fa?'صورتجلسه هنوز ثبت نشده':'Minutes not recorded yet'}</div>
                    <textarea value={minutesInput} onChange={e=>setMinutesInput(e.target.value)} rows={3}
                      className={inp+' resize-none'} placeholder={fa?'خلاصه مذاکرات و مصوبات...':'Summary of discussions and decisions...'}/>
                    <button onClick={() => saveMinutes(selected.id)} className="w-full py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">
                      💾 {fa?'ذخیره صورتجلسه':'Save Minutes'}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              {selected.status === 'scheduled' && (
                <button onClick={() => { markDone(selected.id); setSelected(null); }}
                  className="flex-1 py-2 rounded-lg bg-green-500/10 text-green-500 border border-green-500/30 text-sm">
                  ✓ {fa?'جلسه برگزار شد':'Mark Done'}
                </button>
              )}
              <button onClick={() => setSelected(null)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'بستن':'Close'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
function TasksPage({ apiTasks, createTask, updateTask }: { apiTasks: any[]; createTask: any; updateTask: any }) {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const usingApi = apiTasks.length > 0;
  const [localTasks, setLocalTasks] = useState(MOCK_TASKS);
  const tasks = usingApi ? apiTasks.map((t: any) => ({
    id: t.id, title: t.title, assignee: t.assigneeName || '', due: t.dueStr || '',
    priority: t.priority || 'normal', status: t.status || 'pending',
    tag: t.tag || '', description: t.description || '', progress: t.progress ?? 0,
  })) : localTasks;

  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [progressVal, setProgressVal] = useState(0);
  const [viewMode, setViewMode] = useState<'kanban'|'list'>('kanban');
  const [form, setForm] = useState({ title:'', assignee:'', due:'', priority:'normal', tag:'', description:'' });

  const columns = ['pending','in_progress','done'] as const;
  const COLUMN_LABELS = { pending:fa?'در انتظار':'Pending', in_progress:fa?'در جریان':'In Progress', done:fa?'انجام شده':'Done' };

  const moveTask = (id: string, newStatus: string) => {
    const progress = newStatus==='done' ? 100 : newStatus==='pending' ? 0 : Math.max(tasks.find((t:any)=>t.id===id)?.progress||0, 10);
    if (usingApi) {
      updateTask.mutate({ id, dto: { status: newStatus, progress } });
    } else {
      setLocalTasks(prev => prev.map(t => t.id===id ? {...t, status:newStatus, progress} : t));
    }
  };

  const handleSubmit = () => {
    if (!form.title) { toast('error', fa?'عنوان الزامی است':'Title required'); return; }
    if (usingApi) {
      createTask.mutate({ ...form }, { onSuccess: () => { setForm({ title:'', assignee:'', due:'', priority:'normal', tag:'', description:'' }); setShowNew(false); } });
    } else {
      setLocalTasks(prev => [...prev, { id:`TSK-${Date.now()}`, ...form, status:'pending', progress:0 }]);
      setForm({ title:'', assignee:'', due:'', priority:'normal', tag:'', description:'' });
      setShowNew(false);
    }
  };

  const saveProgress = (id: string) => {
    const newStatus = progressVal===100?'done':progressVal>0?'in_progress':'pending';
    if (usingApi) {
      updateTask.mutate({ id, dto: { progress: progressVal, status: newStatus } });
    } else {
      setLocalTasks(prev => prev.map(t => t.id===id ? {...t, progress:progressVal, status:newStatus} : t));
    }
    setSelected(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">✅ {fa?'وظایف':'Tasks'}</h1>
        <div className="flex gap-2">
          <div className="flex bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg p-1 gap-1">
            {(['kanban','list'] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${viewMode===m?'bg-[hsl(var(--primary))] text-white':''}`}>
                {m==='kanban'?'⬛ Kanban':'≡ '+(fa?'لیست':'List')}
              </button>
            ))}
          </div>
          <Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4 mr-1"/>{fa?'وظیفه جدید':'New Task'}</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[['pending','#f59e0b',fa?'در انتظار':'Pending'],['in_progress','#3b82f6',fa?'در جریان':'In Progress'],['done','#10b981',fa?'انجام شده':'Done'],['all','#64748b',fa?'کل':'Total']] .map(([s,c,l]) => (
          <div key={s} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-2.5 text-center">
            <div className="text-lg font-bold" style={{color:c as string}}>{s==='all'?tasks.length:tasks.filter(t=>t.status===s).length}</div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{l}</div>
          </div>
        ))}
      </div>

      {/* Kanban */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {columns.map(col => (
            <div key={col} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">
              <div className="px-3 py-2.5 font-semibold text-sm border-b border-[hsl(var(--border))]"
                style={{background:STATUS_COLORS[col]+'10', color:STATUS_COLORS[col]}}>
                {COLUMN_LABELS[col]} ({tasks.filter(t=>t.status===col).length})
              </div>
              <div className="p-2 space-y-2 min-h-[120px]">
                {tasks.filter(t => t.status === col).map(t => (
                  <div key={t.id} onClick={() => { setSelected(t); setProgressVal(t.progress); }}
                    className="bg-[hsl(var(--background))] rounded-lg border border-[hsl(var(--border))] p-3 cursor-pointer hover:border-[hsl(var(--primary)/0.3)]">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold leading-tight">{t.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0" style={{background:PRIORITY_COLORS[t.priority]+'20',color:PRIORITY_COLORS[t.priority]}}>
                        {PRIORITY_FA[t.priority]}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="h-1.5 rounded-full bg-[hsl(var(--muted))]">
                        <div className="h-full rounded-full transition-all" style={{width:`${t.progress}%`,background:t.progress===100?'#10b981':'#3b82f6'}} />
                      </div>
                      <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">{t.progress}%</div>
                    </div>
                    <div className="text-[10px] text-[hsl(var(--muted-foreground))] flex flex-wrap gap-1.5">
                      {t.assignee && <span>👤 {t.assignee}</span>}
                      {t.due && <span>📅 {t.due}</span>}
                      {t.tag && <span className="px-1.5 py-0.5 rounded-full bg-[hsl(var(--muted)/0.5)]">{t.tag}</span>}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {col === 'pending' && <button onClick={e=>{e.stopPropagation();moveTask(t.id,'in_progress')}} className="text-[10px] px-2 py-0.5 rounded border border-blue-500/30 text-blue-500 hover:bg-blue-500/10">→ {fa?'شروع':'Start'}</button>}
                      {col === 'in_progress' && <button onClick={e=>{e.stopPropagation();moveTask(t.id,'done')}} className="text-[10px] px-2 py-0.5 rounded border border-green-500/30 text-green-500 hover:bg-green-500/10">✓ {fa?'انجام شد':'Done'}</button>}
                      {col === 'done' && <button onClick={e=>{e.stopPropagation();moveTask(t.id,'pending')}} className="text-[10px] px-2 py-0.5 rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]">{fa?'بازگشت':'Undo'}</button>}
                    </div>
                  </div>
                ))}
                {tasks.filter(t=>t.status===col).length === 0 && (
                  <div className="text-center py-4 text-xs text-[hsl(var(--muted-foreground))]">{fa?'موردی نیست':'Empty'}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {tasks.map(t => (
            <div key={t.id} onClick={() => { setSelected(t); setProgressVal(t.progress); }}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 cursor-pointer hover:border-[hsl(var(--primary)/0.3)]"
              style={{ borderRight:`3px solid ${STATUS_COLORS[t.status]}` }}>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={t.status==='done'} onChange={e=>{e.stopPropagation();moveTask(t.id,t.status==='done'?'pending':'done')}} className="w-4 h-4 shrink-0"/>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${t.status==='done'?'line-through text-[hsl(var(--muted-foreground))]':''}`}>{t.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--muted))]">
                      <div className="h-full rounded-full" style={{width:`${t.progress}%`,background:t.progress===100?'#10b981':'#3b82f6'}} />
                    </div>
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{t.progress}%</span>
                  </div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] flex gap-2 flex-wrap mt-0.5">
                    {t.assignee && <span>👤 {t.assignee}</span>}
                    {t.due && <span>📅 {t.due}</span>}
                    {t.tag && <span className="px-1.5 py-0.5 rounded-full bg-[hsl(var(--muted)/0.5)]">{t.tag}</span>}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{background:PRIORITY_COLORS[t.priority]+'20',color:PRIORITY_COLORS[t.priority]}}>{PRIORITY_FA[t.priority]}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">✅ {selected.title}</h2>
              <button onClick={() => setSelected(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            {[
              [fa?'مسئول':'Assignee', '👤 '+selected.assignee],
              [fa?'اولویت':'Priority', PRIORITY_FA[selected.priority]],
              [fa?'مهلت':'Due', selected.due],
              [fa?'برچسب':'Tag', selected.tag],
            ].filter(([,v])=>v).map(([k,v])=>(
              <div key={k} className="flex justify-between text-sm py-2 border-b border-[hsl(var(--border)/0.5)]">
                <span className="text-[hsl(var(--muted-foreground))]">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
            {selected.description && <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))] p-3 bg-[hsl(var(--muted)/0.3)] rounded-lg">{selected.description}</p>}
            {/* Progress slider */}
            <div className="mt-4">
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>{fa?'پیشرفت':'Progress'}</span>
                <span style={{color:'#3b82f6'}}>{progressVal}%</span>
              </div>
              <input type="range" value={progressVal} min={0} max={100} step={10}
                onChange={e => setProgressVal(Number(e.target.value))}
                className="w-full accent-[hsl(var(--primary))]"/>
              <div className="h-2 rounded-full bg-[hsl(var(--muted))] mt-2">
                <div className="h-full rounded-full transition-all" style={{width:`${progressVal}%`,background:progressVal===100?'#10b981':'#3b82f6'}} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { moveTask(selected.id,'done'); setSelected(null); }} className="flex-1 py-2 rounded-lg bg-green-500/10 text-green-500 border border-green-500/30 text-sm">✅ {fa?'تکمیل':'Complete'}</button>
              <button onClick={() => saveProgress(selected.id)} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">💾 {fa?'ذخیره':'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">✅ {fa?'وظیفه جدید':'New Task'}</h2>
              <button onClick={() => setShowNew(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'عنوان *':'Title *'}</label>
                <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className={inp}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'مسئول':'Assignee'}</label>
                  <input value={form.assignee} onChange={e=>setForm({...form,assignee:e.target.value})} className={inp}/></div>
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'مهلت':'Due'}</label>
                  <input value={form.due} onChange={e=>setForm({...form,due:e.target.value})} className={inp} placeholder="۱۴۰۳/۰۴/۳۰"/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'اولویت':'Priority'}</label>
                  <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} className={inp}>
                    <option value="urgent">{fa?'فوری':'Urgent'}</option>
                    <option value="high">{fa?'بالا':'High'}</option>
                    <option value="normal">{fa?'معمولی':'Normal'}</option>
                    <option value="low">{fa?'پایین':'Low'}</option>
                  </select></div>
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'برچسب':'Tag'}</label>
                  <input value={form.tag} onChange={e=>setForm({...form,tag:e.target.value})} className={inp}/></div>
              </div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'توضیحات':'Description'}</label>
                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={2} className={inp+' resize-none'}/></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNew(false)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button onClick={handleSubmit} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">✅ {fa?'ثبت':'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Archive ──────────────────────────────────────────────────────────────────
function ArchivePage({ apiDocs, createDocument }: { apiDocs: any[]; createDocument: any }) {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const usingApi = apiDocs.length > 0;
  const [localDocs, setLocalDocs] = useState(MOCK_DOCUMENTS);
  const docs = usingApi ? apiDocs.map((d: any) => ({
    id: d.id, title: d.title, type: d.type || 'pdf',
    date: d.createdAt ? new Date(d.createdAt).toLocaleDateString('fa-IR') : '',
    size: d.fileSize || '—', category: d.category || 'سایر',
    version: d.version || '1.0', confidential: d.confidential || false,
    tags: d.tags || [], description: d.content || '', uploader: d.uploaderName || '',
  })) : localDocs;

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title:'', category:'قراردادها', version:'1.0', description:'', tags:'', confidential:false });

  const cats = [...new Set(docs.map((d: any) => d.category))];
  const filtered = docs.filter((d: any) => {
    const matchSearch = !search || (d.title+d.description+(d.tags||[]).join('')).toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || d.category === catFilter;
    return matchSearch && matchCat;
  });

  const handleUpload = () => {
    if (!uploadForm.title) { toast('error', fa?'عنوان الزامی است':'Title required'); return; }
    if (usingApi) {
      createDocument.mutate(
        { title: uploadForm.title, type: 'pdf', category: uploadForm.category, version: uploadForm.version, confidential: uploadForm.confidential, tags: uploadForm.tags.split(',').map((t: string)=>t.trim()).filter(Boolean), content: uploadForm.description },
        { onSuccess: () => { setUploadForm({ title:'', category:'قراردادها', version:'1.0', description:'', tags:'', confidential:false }); setShowUpload(false); } }
      );
    } else {
      const newDoc = {
        id:`DOC-${Date.now()}`, title:uploadForm.title, type:'pdf', date:'۱۴۰۳/۰۴/۱۵',
        size:'—', category:uploadForm.category, version:uploadForm.version,
        confidential:uploadForm.confidential, tags:uploadForm.tags.split(',').map((t: string)=>t.trim()).filter(Boolean),
        description:uploadForm.description, uploader:'کاربر فعلی',
      };
      setLocalDocs(prev => [newDoc, ...prev]);
      setUploadForm({ title:'', category:'قراردادها', version:'1.0', description:'', tags:'', confidential:false });
      setShowUpload(false);
    }
  };

  const shareDoc = (id: string) => {
    navigator.clipboard?.writeText(`internal://docs/${id}`).catch(()=>{});
    toast('info', fa?'لینک کپی شد':'Link copied!');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📁 {fa?'آرشیو اسناد':'Document Archive'}</h1>
        <Button onClick={() => setShowUpload(true)}><Plus className="h-4 w-4 mr-1"/>{fa?'آپلود سند':'Upload'}</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon:'📄', val:docs.length, label:fa?'کل اسناد':'Total Docs', color:'#3b82f6' },
          { icon:'🔒', val:docs.filter(d=>d.confidential).length, label:fa?'محرمانه':'Confidential', color:'#8b5cf6' },
          { icon:'📁', val:cats.length, label:fa?'دسته‌بندی':'Categories', color:'#10b981' },
          { icon:'📅', val:'۱۴۰۳', label:fa?'سال جاری':'Current Year', color:'#f59e0b' },
        ].map((s,i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{color:s.color}}>{s.val}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder={fa?'🔍 جستجو در اسناد...':'🔍 Search documents...'}
          className="flex-1 px-4 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-sm focus:outline-none"/>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-sm focus:outline-none">
          <option value="">{fa?'همه دسته‌ها':'All Categories'}</option>
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Doc Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-12 text-center text-[hsl(var(--muted-foreground))]">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm">{fa?'سندی یافت نشد':'No documents found'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(d => (
            <div key={d.id} onClick={() => setSelected(d)}
              className="flex items-center gap-3 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] cursor-pointer hover:border-[hsl(var(--primary)/0.3)] transition-colors">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{background:(FILE_COLORS[d.type]||'#64748b')+'20'}}>
                {FILE_ICONS[d.type]||'📄'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{d.title}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{d.category} · v{d.version}</div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {d.tags.slice(0,2).map((t: string) => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--muted)/0.5)]">{t}</span>)}
                  {d.confidential && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500">🔒 {fa?'محرمانه':'Confidential'}</span>}
                </div>
              </div>
              <div className="text-end shrink-0">
                <div className="text-xs text-[hsl(var(--muted-foreground))]">{d.size}</div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{d.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Doc Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">{FILE_ICONS[selected.type]||'📄'} {selected.title}</h2>
              <button onClick={() => setSelected(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            {[
              [fa?'دسته‌بندی':'Category', selected.category],
              [fa?'نوع':'Type', selected.type?.toUpperCase()],
              [fa?'حجم':'Size', selected.size],
              [fa?'نسخه':'Version', `v${selected.version}`],
              [fa?'تاریخ':'Date', selected.date],
              [fa?'آپلودکننده':'Uploader', selected.uploader],
              [fa?'محرمانه':'Confidential', selected.confidential?(fa?'🔒 بله':'🔒 Yes'):(fa?'خیر':'No')],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between text-sm py-2 border-b border-[hsl(var(--border)/0.5)]">
                <span className="text-[hsl(var(--muted-foreground))]">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
            {selected.description && <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))] p-3 bg-[hsl(var(--muted)/0.3)] rounded-lg">{selected.description}</p>}
            {selected.tags?.length > 0 && (
              <div className="flex gap-1 mt-3 flex-wrap">
                {selected.tags.map((t: string) => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--muted)/0.5)]">{t}</span>)}
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm text-center">📥 {fa?'دانلود':'Download'}</button>
              <button onClick={() => shareDoc(selected.id)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm text-center">🔗 {fa?'اشتراک':'Share'}</button>
              <button onClick={() => setSelected(null)} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">{fa?'بستن':'Close'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">📎 {fa?'آپلود سند جدید':'Upload Document'}</h2>
              <button onClick={() => setShowUpload(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="border-2 border-dashed border-[hsl(var(--border))] rounded-xl p-8 text-center mb-4">
              <div className="text-4xl mb-2">📁</div>
              <div className="text-sm font-medium">{fa?'فایل را اینجا بکشید یا کلیک کنید':'Drag & drop or click'}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">PDF, DOCX, XLSX | {fa?'حداکثر ۲۰MB':'Max 20MB'}</div>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'عنوان سند *':'Title *'}</label>
                <input value={uploadForm.title} onChange={e=>setUploadForm({...uploadForm,title:e.target.value})} className={inp}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'دسته‌بندی':'Category'}</label>
                  <select value={uploadForm.category} onChange={e=>setUploadForm({...uploadForm,category:e.target.value})} className={inp}>
                    {['قراردادها','گزارشات','مکاتبات','لجستیک','کیفیت','اداری','حقوقی','سایر'].map(c=><option key={c}>{c}</option>)}
                  </select></div>
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نسخه':'Version'}</label>
                  <input value={uploadForm.version} onChange={e=>setUploadForm({...uploadForm,version:e.target.value})} className={inp} placeholder="1.0"/></div>
              </div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'توضیحات':'Description'}</label>
                <textarea value={uploadForm.description} onChange={e=>setUploadForm({...uploadForm,description:e.target.value})} rows={2} className={inp+' resize-none'}/></div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'برچسب‌ها (با , جدا کنید)':'Tags (comma-separated)'}</label>
                <input value={uploadForm.tags} onChange={e=>setUploadForm({...uploadForm,tags:e.target.value})} className={inp} placeholder={fa?'مثال: قرارداد، مالی':'e.g. contract, finance'}/></div>
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg bg-[hsl(var(--muted)/0.3)]">
                <input type="checkbox" checked={uploadForm.confidential} onChange={e=>setUploadForm({...uploadForm,confidential:e.target.checked})} className="w-4 h-4"/>
                <span className="text-sm">🔒 {fa?'سند محرمانه':'Confidential Document'}</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowUpload(false)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button onClick={handleUpload} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">📎 {fa?'ثبت سند':'Upload'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Workflows ────────────────────────────────────────────────────────────────
function WorkflowsPage({ apiWorkflows, createWorkflow, startInstance: startInstanceMut, approveStep: approveStepMut }: { apiWorkflows: any[]; createWorkflow: any; startInstance: any; approveStep: any }) {
  const { lang } = useLocaleStore();
  const { toast } = useUIStore();
  const fa = lang === 'fa';
  const usingApi = apiWorkflows.length > 0;

  // Normalise API data shape to match what the UI expects
  const apiNormalised = apiWorkflows.map((w: any) => ({
    id: w.id, title: w.title, icon: w.icon || '⚙️', mode: w.mode || 'sequential', active: w.active,
    steps: (w.steps || []).map((s: any) => ({ name: s.name, user: s.assigneeName || '', status: 'wait', date: null })),
    instances: (w.instances || []).map((i: any) => ({ id: i.id, title: i.title, startDate: i.startDate || '', status: i.status, currentStep: i.currentStep })),
  }));

  const [localWorkflows, setLocalWorkflows] = useState(MOCK_WORKFLOWS);
  const workflows = usingApi ? apiNormalised : localWorkflows;

  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [selectedInst, setSelectedInst] = useState<any>(null);
  const [showStartInst, setShowStartInst] = useState<any>(null);
  const [instTitle, setInstTitle] = useState('');
  const [newWfForm, setNewWfForm] = useState({ title:'', icon:'⚙️', mode:'sequential', steps:[{name:'',user:''}] });

  const allInst = workflows.flatMap((w: any) => (w.instances||[]).map((i: any) => ({...i, wf:w})));
  const inprog = allInst.filter((i: any) => i.status==='inprog').length;
  const done = allInst.filter((i: any) => i.status==='done').length;

  const approveStep = (wfId: string, instId: string) => {
    if (usingApi) {
      approveStepMut.mutate(instId);
    } else {
      setLocalWorkflows(prev => prev.map(w => {
        if (w.id !== wfId) return w;
        return { ...w, instances: (w.instances||[]).map((inst: any) => {
          if (inst.id !== instId) return inst;
          const nextStep = inst.currentStep + 1;
          const isDone = nextStep >= w.steps.length;
          return { ...inst, currentStep:isDone?inst.currentStep:nextStep, status:isDone?'done':'inprog' };
        })};
      }));
    }
  };

  const startInstance = () => {
    if (!instTitle || !showStartInst) return;
    if (usingApi) {
      startInstanceMut.mutate(
        { templateId: showStartInst.id, title: instTitle },
        { onSuccess: () => { setInstTitle(''); setShowStartInst(null); } }
      );
    } else {
      setLocalWorkflows(prev => prev.map((w: any) => w.id===showStartInst.id ? {
        ...w, instances:[...(w.instances||[]), { id:`WFI-${Date.now()}`, title:instTitle, startDate:'۱۴۰۳/۰۴/۱۵', status:'inprog', currentStep:0 }]
      } : w));
      setInstTitle('');
      setShowStartInst(null);
    }
  };

  const addStep = () => setNewWfForm(f => ({...f, steps:[...f.steps,{name:'',user:''}]}));
  const setStep = (i: number, k: string, v: string) => setNewWfForm(f => ({...f, steps:f.steps.map((s,idx)=>idx===i?{...s,[k]:v}:s)}));
  const removeStep = (i: number) => setNewWfForm(f => ({...f, steps:f.steps.filter((_,idx)=>idx!==i)}));

  const handleNewWf = () => {
    if (!newWfForm.title) { toast('error', fa?'عنوان الزامی':'Title required'); return; }
    if (usingApi) {
      createWorkflow.mutate(
        { title: newWfForm.title, icon: newWfForm.icon, mode: newWfForm.mode, steps: newWfForm.steps },
        { onSuccess: () => { setNewWfForm({ title:'', icon:'⚙️', mode:'sequential', steps:[{name:'',user:''}] }); setShowNew(false); } }
      );
    } else {
      setLocalWorkflows(prev => [...prev, {
        id:`WF-${Date.now()}`, title:newWfForm.title, icon:newWfForm.icon, mode:newWfForm.mode, active:true,
        steps: newWfForm.steps.map((s,i) => ({name:s.name||`مرحله ${i+1}`, user:s.user, status:i===0?'active':'wait', date:null})),
        instances:[],
      }]);
      setNewWfForm({ title:'', icon:'⚙️', mode:'sequential', steps:[{name:'',user:''}] });
      setShowNew(false);
    }
  };

  const MODE_LABELS: Record<string,{label:string,icon:string,color:string}> = {
    sequential:{label:fa?'زنجیره‌ای':'Sequential', icon:'🔗', color:'#3b82f6'},
    parallel:{label:fa?'موازی':'Parallel', icon:'⚡', color:'#f59e0b'},
    simple:{label:fa?'ساده':'Simple', icon:'✅', color:'#10b981'},
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">⚙️ {fa?'گردش‌کارهای تأیید':'Approval Workflows'}</h1>
        <Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4 mr-1"/>{fa?'قالب جدید':'New Template'}</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          ['📋', workflows.length, fa?'قالب‌ها':'Templates', '#3b82f6'],
          ['🔄', allInst.length, fa?'کل موارد':'Total Cases', '#f59e0b'],
          ['⚡', inprog, fa?'در جریان':'In Progress', '#8b5cf6'],
          ['✅', done, fa?'تکمیل شده':'Completed', '#10b981'],
        ].map(([icon,val,label,color]) => (
          <div key={label as string} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 text-center">
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-xl font-bold" style={{color:color as string}}>{val}</div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{label}</div>
          </div>
        ))}
      </div>

      {/* Workflow templates */}
      <div className="space-y-4">
        {workflows.map(wf => {
          const mode = MODE_LABELS[wf.mode] || MODE_LABELS.sequential;
          const activeInst = (wf.instances||[]).filter((i: any)=>i.status==='inprog');
          return (
            <div key={wf.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{wf.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{wf.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${wf.active?'bg-green-500/10 text-green-500':'bg-gray-500/10 text-gray-400'}`}>
                        {wf.active?(fa?'فعال':'Active'):(fa?'غیرفعال':'Inactive')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:mode.color+'20',color:mode.color}}>
                        {mode.icon} {mode.label}
                      </span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">{wf.steps.length} {fa?'مرحله':'steps'}</span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">{(wf.instances||[]).length} {fa?'مورد':'cases'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setShowStartInst(wf)} className="text-xs px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))] text-white">▶ {fa?'شروع':'Start'}</button>
                  <button onClick={() => { setSelected(wf); setSelectedInst(null); }} className="text-xs px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.5)]">📋 {fa?'جزئیات':'Details'}</button>
                </div>
              </div>

              {/* Flow visualization */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 flex-nowrap mb-3">
                {wf.steps.map((step: any, i: number) => {
                  const sc = STEP_STATUS_COLORS[step.status||'wait'];
                  const si = STEP_STATUS_ICONS[step.status||'wait'];
                  return (
                    <div key={i} className="flex items-center gap-1 shrink-0">
                      {i > 0 && <span className="text-[hsl(var(--muted-foreground))] text-sm px-1">→</span>}
                      <div className="text-center min-w-[72px]">
                        <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-base mx-auto mb-1"
                          style={{borderColor:sc, background:sc+'15'}}>
                          {si}
                        </div>
                        <div className="text-[9px] font-semibold leading-tight" style={{color:sc}}>{step.name}</div>
                        {step.user && <div className="text-[9px] text-[hsl(var(--muted-foreground))] mt-0.5 truncate max-w-[72px]">👤 {step.user.split(' ')[0]}</div>}
                        {step.date && <div className="text-[9px] text-[hsl(var(--muted-foreground))]">{step.date}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active instances */}
              {activeInst.length > 0 && (
                <div className="border-t border-[hsl(var(--border))] pt-3 space-y-2">
                  <div className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">{fa?'موارد فعال':'Active Cases'}</div>
                  {activeInst.slice(0,2).map((inst: any) => {
                    const pct = Math.round((inst.currentStep/wf.steps.length)*100);
                    const curStep = wf.steps[inst.currentStep];
                    return (
                      <div key={inst.id} onClick={() => { setSelected(wf); setSelectedInst(inst); }}
                        className="p-3 rounded-lg bg-[hsl(var(--muted)/0.3)] cursor-pointer hover:bg-[hsl(var(--muted)/0.5)] border-r-2 border-amber-400">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold">{inst.title}</span>
                          <button onClick={e=>{e.stopPropagation();approveStep(wf.id,inst.id)}}
                            className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/30 hover:bg-green-500/20">
                            ✅ {fa?'تایید سریع':'Quick Approve'}
                          </button>
                        </div>
                        <div className="h-1.5 rounded-full bg-[hsl(var(--muted))] mb-1">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{width:`${pct}%`,transition:'width .5s'}} />
                        </div>
                        <div className="flex justify-between text-[10px] text-[hsl(var(--muted-foreground))]">
                          <span>⏳ {curStep?.name}</span>
                          <span>{fa?'مرحله':'Step'} {inst.currentStep+1}/{wf.steps.length} — {pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                  {activeInst.length > 2 && <div className="text-xs text-center text-[hsl(var(--muted-foreground))]">+{activeInst.length-2} {fa?'مورد دیگر':'more'}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-lg p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">{selected.icon} {selected.title} {selectedInst?`— ${selectedInst.title}`:''}</h2>
              <button onClick={() => { setSelected(null); setSelectedInst(null); }} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            {selectedInst && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[hsl(var(--muted-foreground))]">{fa?'پیشرفت کل':'Overall Progress'}</span>
                  <span className="font-bold text-[hsl(var(--primary))]">{Math.round((selectedInst.currentStep/selected.steps.length)*100)}%</span>
                </div>
                <div className="h-3 rounded-full bg-[hsl(var(--muted))]">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                    style={{width:`${Math.round((selectedInst.currentStep/selected.steps.length)*100)}%`}} />
                </div>
              </div>
            )}
            <div className="space-y-2 mb-4">
              <div className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-2">{fa?'مراحل گردش کار':'Workflow Steps'}</div>
              {selected.steps.map((step: any, i: number) => {
                const sc = STEP_STATUS_COLORS[step.status||'wait'];
                const si = STEP_STATUS_ICONS[step.status||'wait'];
                const isActive = selectedInst ? selectedInst.currentStep===i : step.status==='active';
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{background:sc+'10',border:`1px solid ${sc}30`}}>
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm shrink-0" style={{borderColor:sc,background:sc+'20'}}>
                      {si}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold" style={{color:sc}}>{i+1}. {step.name}</span>
                        {isActive && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500">{fa?'نوبت تایید':'Awaiting'}</span>}
                      </div>
                      {step.user && <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">👤 {step.user}</div>}
                      {step.date && <div className="text-[10px] text-[hsl(var(--muted-foreground))]">📅 {step.date}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* All instances */}
            {!selectedInst && (selected.instances||[]).length > 0 && (
              <div className="border-t border-[hsl(var(--border))] pt-4">
                <div className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-2">{fa?'موارد':'Cases'} ({(selected.instances||[]).length})</div>
                <div className="space-y-1">
                  {(selected.instances||[]).map((inst: any) => (
                    <div key={inst.id} className="flex items-center justify-between p-2 rounded-lg bg-[hsl(var(--muted)/0.3)] text-xs">
                      <span className="font-medium">{inst.title}</span>
                      <div className="flex items-center gap-2">
                        <span style={{color:inst.status==='done'?'#10b981':inst.status==='inprog'?'#3b82f6':'#64748b'}}>
                          {inst.status==='done'?'✅'+'تکمیل':inst.status==='inprog'?'⚡'+`مرحله ${inst.currentStep+1}/${selected.steps.length}`:'—'}
                        </span>
                        {inst.status==='inprog' && (
                          <button onClick={()=>approveStep(selected.id,inst.id)} className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/30">✅ {fa?'تایید':'Approve'}</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              {selectedInst?.status==='inprog' && (
                <button onClick={() => { approveStep(selected.id, selectedInst.id); setSelected(null); setSelectedInst(null); }}
                  className="flex-1 py-2 rounded-lg bg-green-500/10 text-green-500 border border-green-500/30 text-sm">✅ {fa?'تایید این مرحله':'Approve Step'}</button>
              )}
              <button onClick={() => { setSelected(null); setSelectedInst(null); }} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'بستن':'Close'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Start Instance Modal */}
      {showStartInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">▶ {fa?'شروع مورد جدید':'Start New Case'}</h2>
              <button onClick={() => setShowStartInst(null)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="text-sm text-[hsl(var(--muted-foreground))] mb-3">
              {showStartInst.icon} {showStartInst.title}
            </div>
            <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'عنوان مورد *':'Case Title *'}</label>
              <input value={instTitle} onChange={e=>setInstTitle(e.target.value)} className={inp}
                placeholder={fa?'مثال: قرارداد شرکت بتا':'e.g. Beta Corp Contract'}/></div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowStartInst(null)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button onClick={startInstance} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">▶ {fa?'شروع':'Start'}</button>
            </div>
          </div>
        </div>
      )}

      {/* New Workflow Template Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] w-full max-w-md p-6 shadow-2xl my-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">⚙️ {fa?'قالب گردش‌کار جدید':'New Workflow Template'}</h2>
              <button onClick={() => setShowNew(false)} className="text-xl text-[hsl(var(--muted-foreground))]">✕</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2"><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'عنوان *':'Title *'}</label>
                  <input value={newWfForm.title} onChange={e=>setNewWfForm({...newWfForm,title:e.target.value})} className={inp}/></div>
                <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'آیکون':'Icon'}</label>
                  <input value={newWfForm.icon} onChange={e=>setNewWfForm({...newWfForm,icon:e.target.value})} className={inp+' text-center text-lg'} maxLength={2}/></div>
              </div>
              <div><label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{fa?'نوع':'Mode'}</label>
                <select value={newWfForm.mode} onChange={e=>setNewWfForm({...newWfForm,mode:e.target.value})} className={inp}>
                  <option value="sequential">{fa?'🔗 زنجیره‌ای — مراحل یکی پس از دیگری':'🔗 Sequential'}</option>
                  <option value="parallel">{fa?'⚡ موازی — همه همزمان':'⚡ Parallel'}</option>
                  <option value="simple">{fa?'✅ ساده — یک‌مرحله‌ای':'✅ Simple'}</option>
                </select></div>
              <div className="rounded-xl border border-[hsl(var(--border))] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">{fa?'مراحل تأیید':'Approval Steps'}</span>
                  <button onClick={addStep} className="text-xs text-[hsl(var(--primary))] hover:underline">+ {fa?'مرحله':'Step'}</button>
                </div>
                {newWfForm.steps.map((step, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-xs text-[hsl(var(--muted-foreground))] w-5 shrink-0 font-bold">{i+1}.</span>
                    <input value={step.name} onChange={e=>setStep(i,'name',e.target.value)} className={inp} placeholder={fa?'عنوان مرحله':'Step name'}/>
                    <input value={step.user} onChange={e=>setStep(i,'user',e.target.value)} className={inp} placeholder={fa?'مسئول':'Assignee'}/>
                    {newWfForm.steps.length > 1 && <button onClick={() => removeStep(i)} className="text-red-400 text-sm shrink-0">✕</button>}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNew(false)} className="flex-1 py-2 rounded-lg border border-[hsl(var(--border))] text-sm">{fa?'انصراف':'Cancel'}</button>
              <button onClick={handleNewWf} className="flex-1 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium">💾 {fa?'ذخیره':'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
