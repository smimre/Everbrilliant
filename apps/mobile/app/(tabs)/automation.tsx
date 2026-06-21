import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, TextInput, Modal, Pressable, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocaleStore } from '@/store/locale.store';
import {
  useLetters, useCreateLetter, useArchiveLetter,
  useMeetings, useCreateMeeting,
  useWorkflowRequests, useApproveRequest, useRejectRequest,
  useTasks, useCreateTask, useUpdateTask,
} from '@/hooks/use-automation';
import { Card, StatCard, Button } from '@/components/ui';
import { COLORS, SPACING, RADIUS } from '@/constants/theme';

type AutoTab = 'letters' | 'meetings' | 'tasks' | 'requests';

// ── Mock data ──────────────────────────────────────────────────
const MOCK_LETTERS = [
  { id:'L1', subject:'درخواست پیش‌فاکتور گندم',  subjectEn:'Proforma Request — Wheat',     type:'incoming', priority:'high',   status:'unread',  from:'تجارت نوین UAE',      date:'1403/04/20' },
  { id:'L2', subject:'ارسال نمونه روغن پالم',     subjectEn:'Palm Oil Sample Dispatch',     type:'outgoing', priority:'normal', status:'sent',    to:'گلوبال ترید',            date:'1403/04/18' },
  { id:'L3', subject:'تأیید زمان تحویل کالا',    subjectEn:'Delivery Confirmation',        type:'incoming', priority:'urgent', status:'unread',  from:'ارمغان لجستیک',       date:'1403/04/17' },
  { id:'L4', subject:'مکاتبه با گمرک بندرعباس',  subjectEn:'Customs Correspondence',       type:'outgoing', priority:'high',   status:'read',    to:'گمرک بندرعباس',          date:'1403/04/15' },
  { id:'L5', subject:'دعوت‌نامه جلسه هماهنگی',  subjectEn:'Coordination Meeting Invite', type:'incoming', priority:'normal', status:'read',    from:'شرکت بازرگانی الفا',   date:'1403/04/12' },
];

const MOCK_MEETINGS = [
  { id:'M1', title:'بررسی قرارداد الفا',   titleEn:'Alpha Contract Review',      date:'1403/04/25', time:'10:00', location:'اتاق جلسه A', status:'scheduled', attendees:3, type:'internal' },
  { id:'M2', title:'ویدئوکنفرانس تأمین‌کننده UAE', titleEn:'UAE Supplier VC',   date:'1403/04/28', time:'14:30', location:'Zoom',        status:'scheduled', attendees:2, type:'external' },
  { id:'M3', title:'جلسه هفتگی تیم',      titleEn:'Weekly Team Meeting',        date:'1403/04/08', time:'09:00', location:'دفتر',        status:'done',      attendees:5, type:'internal' },
  { id:'M4', title:'جلسه گمرک و ترخیص',  titleEn:'Customs Clearance Meeting',  date:'1403/04/30', time:'11:00', location:'اداره گمرک',  status:'scheduled', attendees:2, type:'external' },
];

const MOCK_TASKS = [
  { id:'T1', title:'پیگیری پرداخت فاکتور SI-002',  titleEn:'Follow up SI-002 payment',  assignee:'علی رضایی',  due:'1403/04/20', priority:'high',   status:'in_progress', tag:'مالی',      progress:40 },
  { id:'T2', title:'تهیه پیش‌نویس قرارداد گندم',  titleEn:'Draft wheat contract',       assignee:'سارا احمدی', due:'1403/04/25', priority:'urgent', status:'pending',     tag:'قرارداد',   progress:0  },
  { id:'T3', title:'بروزرسانی پروفایل شرکت',       titleEn:'Update company profile',     assignee:'محمد کریمی', due:'1403/04/15', priority:'low',    status:'done',        tag:'اداری',     progress:100},
  { id:'T4', title:'بررسی پیشنهادهای مزایده',      titleEn:'Review tender proposals',    assignee:'محمد کریمی', due:'1403/04/30', priority:'high',   status:'pending',     tag:'مزایده',    progress:10 },
  { id:'T5', title:'ارسال نمونه کالا برای QC',     titleEn:'Send QC samples',            assignee:'علی رضایی',  due:'1403/04/18', priority:'normal', status:'in_progress', tag:'کیفیت',     progress:70 },
];

const MOCK_REQUESTS = [
  { id:'R1', title:'درخواست مرخصی — علی رضایی',    titleEn:'Leave — Ali Rezaei',       type:'leave',    submitter:'علی رضایی',  status:'pending',  step:'تأیید سرپرست',   date:'1403/04/18' },
  { id:'R2', title:'درخواست خرید لپ‌تاپ',          titleEn:'Laptop Purchase Request',  type:'purchase', submitter:'سارا احمدی', status:'approved', step:'تصویب مدیر',     date:'1403/04/15' },
  { id:'R3', title:'درخواست پرداخت پیش‌فاکتور',   titleEn:'Proforma Payment',         type:'payment',  submitter:'محمد کریمی', status:'pending',  step:'تأیید مالی',     date:'1403/04/20' },
  { id:'R4', title:'درخواست اضافه‌کاری — فروردین', titleEn:'Overtime Request',          type:'overtime', submitter:'علی رضایی',  status:'rejected', step:'رد شده',         date:'1403/01/30' },
];

// ── Status / priority configs ──────────────────────────────────
const LETTER_PRIORITY: Record<string, string> = { urgent:'#ef4444', high:'#f59e0b', normal:'#64748b', low:'#94a3b8' };
const LETTER_TYPE:     Record<string, { fa: string; color: string; icon: string }> = {
  incoming: { fa:'ورودی',  color:'#3b82f6', icon:'📥' },
  outgoing: { fa:'خروجی', color:'#10b981', icon:'📤' },
};

const MTG_STATUS: Record<string, { fa: string; color: string; icon: string }> = {
  scheduled: { fa:'برنامه‌ریزی', color:'#3b82f6', icon:'📅' },
  done:      { fa:'برگزار شده', color:'#10b981', icon:'✅' },
  cancelled: { fa:'لغو شده',   color:'#ef4444', icon:'❌' },
};
const MTG_TYPE: Record<string, { fa: string; color: string }> = {
  internal: { fa:'داخلی',  color:'#8b5cf6' },
  external: { fa:'خارجی', color:'#f59e0b' },
};

const TASK_PRIORITY: Record<string, { fa: string; color: string }> = {
  urgent:{ fa:'فوری',  color:'#ef4444' },
  high:  { fa:'بالا',  color:'#f59e0b' },
  normal:{ fa:'عادی',  color:'#3b82f6' },
  low:   { fa:'پایین', color:'#64748b' },
};
const TASK_STATUS: Record<string, { fa: string; color: string; icon: string }> = {
  pending:    { fa:'در انتظار', color:'#f59e0b', icon:'⏳' },
  in_progress:{ fa:'در جریان', color:'#3b82f6', icon:'🔄' },
  done:       { fa:'انجام شده',color:'#10b981', icon:'✅' },
  cancelled:  { fa:'لغو',      color:'#ef4444', icon:'❌' },
};

const REQ_STATUS: Record<string, { fa: string; color: string }> = {
  pending: { fa:'در انتظار', color:'#f59e0b' },
  approved:{ fa:'تایید شده',color:'#10b981' },
  rejected:{ fa:'رد شده',   color:'#ef4444' },
};
const REQ_TYPE_ICON: Record<string, string> = {
  leave:'🏖️', purchase:'🛒', payment:'💰', overtime:'⏰', contract:'📄',
};

const inp = {
  backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
  borderRadius: RADIUS.md, padding: SPACING.sm, color: COLORS.text, fontSize: 14,
} as const;

// ── Main screen ────────────────────────────────────────────────
export default function AutomationScreen() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [tab, setTab] = useState<AutoTab>('letters');

  const TABS: { id: AutoTab; fa: string; en: string; icon: string }[] = [
    { id:'letters',  fa:'مکاتبات', en:'Letters',  icon:'✉️' },
    { id:'meetings', fa:'جلسات',   en:'Meetings', icon:'📅' },
    { id:'tasks',    fa:'وظایف',   en:'Tasks',    icon:'✅' },
    { id:'requests', fa:'درخواست', en:'Requests', icon:'📋' },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <View style={s.header}>
        <Text style={s.title}>🤖 {fa ? 'اتوماسیون اداری' : 'Automation'}</Text>
      </View>

      {/* Tab switcher */}
      <View style={s.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id} onPress={() => setTab(t.id)}
            style={[s.tabBtn, tab === t.id && s.tabActive]}>
            <Text style={{ fontSize: 14 }}>{t.icon}</Text>
            <Text style={[s.tabText, tab === t.id && s.tabTextActive]}>
              {fa ? t.fa : t.en}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'letters'  && <LettersTab  fa={fa} />}
      {tab === 'meetings' && <MeetingsTab fa={fa} />}
      {tab === 'tasks'    && <TasksTab    fa={fa} />}
      {tab === 'requests' && <RequestsTab fa={fa} />}
    </SafeAreaView>
  );
}

// ── Letters tab ────────────────────────────────────────────────
function LettersTab({ fa }: { fa: boolean }) {
  const [typeFilter, setTypeFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const { data, isLoading, isRefetching, refetch } = useLetters(
    typeFilter !== 'all' ? { type: typeFilter } : {}
  );
  const archive = useArchiveLetter();

  const apiList: any[] = ((data as any)?.data ?? (Array.isArray(data) ? data : []));
  const isMock  = apiList.length === 0 && !isLoading;
  const letters = isMock ? MOCK_LETTERS : apiList.map((l: any) => ({
    id: String(l.id), subject: l.subject ?? l.title ?? '—',
    subjectEn: l.subjectEn ?? l.subject ?? '—',
    type: l.type ?? 'incoming', priority: l.priority ?? 'normal',
    status: l.status ?? 'read', from: l.fromName ?? l.senderName ?? '—',
    to: l.toName ?? l.recipientName ?? '—',
    date: l.createdAt ? new Date(l.createdAt).toLocaleDateString('fa-IR') : '—',
  }));

  const incoming = letters.filter((l: any) => l.type === 'incoming').length;
  const outgoing = letters.filter((l: any) => l.type === 'outgoing').length;
  const unread   = letters.filter((l: any) => l.status === 'unread').length;

  const displayed = typeFilter === 'all' ? letters : letters.filter((l: any) => l.type === typeFilter);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}>

      {isMock && <View style={s.mockBanner}><Text style={s.mockText}>{fa ? '📋 داده نمونه' : '📋 Sample data'}</Text></View>}
      <View style={s.stats}>
        <StatCard icon="📥" label={fa ? 'ورودی'    : 'Inbox'}   value={incoming} color={COLORS.primary}  />
        <StatCard icon="📤" label={fa ? 'خروجی'   : 'Outbox'}  value={outgoing} color={COLORS.success}  />
        <StatCard icon="🔴" label={fa ? 'خوانده نشده':'Unread'} value={unread}   color={COLORS.danger}   />
      </View>

      {/* Filter */}
      <View style={s.filterRow}>
        {(['all','incoming','outgoing'] as const).map(f => {
          const tc = LETTER_TYPE[f];
          return (
            <TouchableOpacity key={f} onPress={() => setTypeFilter(f)}
              style={[s.chip, typeFilter === f && s.chipActive]}>
              <Text style={[s.chipText, typeFilter === f && s.chipTextActive]}>
                {tc?.icon} {f === 'all' ? (fa ? 'همه' : 'All') : (fa ? tc.fa : f)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading && <Text style={s.empty}>⏳</Text>}
      {displayed.map((l: any) => {
        const tc = LETTER_TYPE[l.type] ?? LETTER_TYPE.incoming;
        const pc = LETTER_PRIORITY[l.priority] ?? '#64748b';
        return (
          <Card key={l.id} style={StyleSheet.flatten([s.letterCard, l.status === 'unread' && s.letterUnread]) as any}>
            <View style={s.letterTop}>
              <Text style={{ fontSize: 18 }}>{tc.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.letterSubject, l.status === 'unread' && { fontWeight: '800' as any }]} numberOfLines={1}>
                  {fa ? l.subject : l.subjectEn}
                </Text>
                <Text style={s.letterMeta}>
                  {l.type === 'incoming' ? (fa ? `از: ${l.from}` : `From: ${l.from}`) : (fa ? `به: ${l.to}` : `To: ${l.to}`)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <View style={[s.dot, { backgroundColor: pc }]} />
                <Text style={s.letterDate}>{l.date}</Text>
              </View>
            </View>
            <View style={s.letterActions}>
              <View style={[s.pill, { backgroundColor: tc.color + '18' }]}>
                <Text style={[s.pillText, { color: tc.color }]}>{fa ? tc.fa : l.type}</Text>
              </View>
              {!isMock && l.status !== 'archived' && (
                <TouchableOpacity onPress={() => archive.mutate(l.id)}>
                  <Text style={s.archiveBtn}>{fa ? '📁 آرشیو' : '📁 Archive'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

// ── Meetings tab ───────────────────────────────────────────────
function MeetingsTab({ fa }: { fa: boolean }) {
  const [showNew,  setShowNew]  = useState(false);
  const [form, setForm] = useState({ title:'', date:'', time:'', location:'' });
  const { data, isLoading, isRefetching, refetch } = useMeetings();
  const createMeeting = useCreateMeeting();

  const apiList: any[] = ((data as any)?.data ?? (Array.isArray(data) ? data : []));
  const isMock    = apiList.length === 0 && !isLoading;
  const meetings  = isMock ? MOCK_MEETINGS : apiList.map((m: any) => ({
    id: String(m.id), title: m.title ?? '—', titleEn: m.title ?? '—',
    date: m.date ?? '—', time: m.time ?? '—', location: m.location ?? '—',
    status: m.status ?? 'scheduled', attendees: m.attendees?.length ?? 0, type: m.type ?? 'internal',
  }));

  const scheduled = meetings.filter((m: any) => m.status === 'scheduled').length;
  const done      = meetings.filter((m: any) => m.status === 'done').length;

  async function submitMeeting() {
    if (!form.title || !form.date) return;
    await createMeeting.mutateAsync({ title: form.title, date: form.date, time: form.time, location: form.location });
    setForm({ title:'', date:'', time:'', location:'' });
    setShowNew(false);
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}>

      {isMock && <View style={s.mockBanner}><Text style={s.mockText}>{fa ? '📋 داده نمونه' : '📋 Sample data'}</Text></View>}
      <View style={s.stats}>
        <StatCard icon="📅" label={fa ? 'برنامه‌ریزی':'Scheduled'} value={scheduled} color={COLORS.primary} />
        <StatCard icon="✅" label={fa ? 'برگزار شده':'Held'}        value={done}      color={COLORS.success} />
        <StatCard icon="📋" label={fa ? 'کل جلسات':'Total'}         value={meetings.length} color={COLORS.secondary}/>
      </View>

      <View style={s.headerRow}>
        <Text style={s.sectionTitle}>📅 {fa ? 'جلسات' : 'Meetings'}</Text>
        <Button size="sm" onPress={() => setShowNew(p => !p)}>
          {showNew ? (fa ? 'بستن' : 'Close') : (fa ? '+ جلسه' : '+ New')}
        </Button>
      </View>
      {showNew && (
        <Card style={s.form}>
          {[
            { key:'title',    ph: fa ? 'عنوان جلسه *' : 'Meeting title *' },
            { key:'date',     ph: fa ? 'تاریخ (YYYY-MM-DD) *' : 'Date *' },
            { key:'time',     ph: fa ? 'ساعت (HH:MM)' : 'Time (HH:MM)' },
            { key:'location', ph: fa ? 'محل' : 'Location' },
          ].map(({ key, ph }) => (
            <TextInput key={key} placeholder={ph} value={(form as any)[key]}
              onChangeText={v => setForm(f => ({ ...f, [key]: v }))}
              style={inp as any} placeholderTextColor={COLORS.textFaint} />
          ))}
          <Button onPress={submitMeeting} loading={createMeeting.isPending} fullWidth>
            {fa ? 'ثبت جلسه' : 'Schedule Meeting'}
          </Button>
        </Card>
      )}

      {isLoading && <Text style={s.empty}>⏳</Text>}
      {meetings.map((m: any) => {
        const sc = MTG_STATUS[m.status] ?? MTG_STATUS.scheduled;
        const tc = MTG_TYPE[m.type]   ?? MTG_TYPE.internal;
        return (
          <Card key={m.id} style={StyleSheet.flatten([s.meetCard, { borderLeftColor: sc.color, borderLeftWidth: 3 }]) as any}>
            <View style={s.meetTop}>
              <Text style={s.meetTitle} numberOfLines={1}>{fa ? m.title : (m.titleEn ?? m.title)}</Text>
              <View style={[s.pill, { backgroundColor: sc.color + '20' }]}>
                <Text style={[s.pillText, { color: sc.color }]}>{sc.icon} {fa ? sc.fa : m.status}</Text>
              </View>
            </View>
            <View style={s.meetMeta}>
              <Text style={s.metaText}>📅 {m.date}  🕐 {m.time}</Text>
              <Text style={s.metaText}>📍 {m.location}</Text>
              <Text style={s.metaText}>👥 {m.attendees} {fa ? 'نفر' : 'attendees'}</Text>
              <View style={[s.pill, { backgroundColor: tc.color + '18' }]}>
                <Text style={[s.pillText, { color: tc.color }]}>{fa ? tc.fa : m.type}</Text>
              </View>
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

// ── Tasks tab ──────────────────────────────────────────────────
function TasksTab({ fa }: { fa: boolean }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const { data, isLoading, isRefetching, refetch } = useTasks(
    statusFilter !== 'all' ? { status: statusFilter } : {}
  );
  const updateTask = useUpdateTask();

  const apiList: any[] = ((data as any)?.data ?? (Array.isArray(data) ? data : []));
  const isMock  = apiList.length === 0 && !isLoading;
  const tasks   = isMock ? MOCK_TASKS : apiList.map((t: any) => ({
    id: String(t.id), title: t.title ?? '—', titleEn: t.title ?? '—',
    assignee: t.assignee ?? '—', due: t.dueDate ?? t.due ?? '—',
    priority: t.priority ?? 'normal', status: t.status ?? 'pending',
    tag: t.tag ?? t.category ?? '', progress: t.progress ?? 0,
  }));

  const pending    = tasks.filter((t: any) => t.status === 'pending').length;
  const inProgress = tasks.filter((t: any) => t.status === 'in_progress').length;
  const done       = tasks.filter((t: any) => t.status === 'done').length;

  const STATUS_FILTERS = [
    { id:'all',         fa:'همه',       en:'All'         },
    { id:'pending',     fa:'در انتظار', en:'Pending'     },
    { id:'in_progress', fa:'در جریان',  en:'In Progress' },
    { id:'done',        fa:'انجام شده', en:'Done'        },
  ];
  const displayed = statusFilter === 'all' ? tasks : tasks.filter((t: any) => t.status === statusFilter);

  function markDone(t: any) {
    if (!isMock) updateTask.mutate({ id: t.id, dto: { status: 'done', progress: 100 } });
    Alert.alert(fa ? 'تکمیل شد ✅' : 'Marked done ✅', fa ? t.title : (t.titleEn ?? t.title));
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}>

      {isMock && <View style={s.mockBanner}><Text style={s.mockText}>{fa ? '📋 داده نمونه' : '📋 Sample data'}</Text></View>}
      <View style={s.stats}>
        <StatCard icon="⏳" label={fa ? 'در انتظار':'Pending'}     value={pending}    color={COLORS.warning}   />
        <StatCard icon="🔄" label={fa ? 'در جریان':'In Progress'}  value={inProgress} color={COLORS.primary}   />
        <StatCard icon="✅" label={fa ? 'انجام شده':'Done'}         value={done}       color={COLORS.success}   />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -SPACING.md }}>
        <View style={s.filters}>
          {STATUS_FILTERS.map(f => (
            <TouchableOpacity key={f.id} onPress={() => setStatusFilter(f.id)}
              style={[s.chip, statusFilter === f.id && s.chipActive]}>
              <Text style={[s.chipText, statusFilter === f.id && s.chipTextActive]}>
                {fa ? f.fa : f.en}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {isLoading && <Text style={s.empty}>⏳</Text>}
      {!isLoading && displayed.length === 0 && (
        <Text style={s.empty}>{fa ? 'وظیفه‌ای یافت نشد' : 'No tasks found'}</Text>
      )}
      {displayed.map((t: any) => {
        const pc = TASK_PRIORITY[t.priority] ?? TASK_PRIORITY.normal;
        const sc = TASK_STATUS[t.status]     ?? TASK_STATUS.pending;
        return (
          <Card key={t.id} style={StyleSheet.flatten([s.taskCard, { borderLeftColor: pc.color, borderLeftWidth: 3 }]) as any}>
            <View style={s.taskTop}>
              <Text style={s.taskTitle} numberOfLines={1}>{fa ? t.title : (t.titleEn ?? t.title)}</Text>
              <Text style={{ fontSize: 16 }}>{sc.icon}</Text>
            </View>
            <View style={s.taskMeta}>
              <Text style={s.metaText}>👤 {t.assignee}</Text>
              <Text style={s.metaText}>📅 {t.due}</Text>
              {t.tag ? (
                <View style={[s.pill, { backgroundColor: COLORS.secondary + '18' }]}>
                  <Text style={[s.pillText, { color: COLORS.secondary }]}>{t.tag}</Text>
                </View>
              ) : null}
              <View style={[s.pill, { backgroundColor: pc.color + '18' }]}>
                <Text style={[s.pillText, { color: pc.color }]}>{fa ? pc.fa : t.priority}</Text>
              </View>
            </View>
            {/* Progress bar */}
            <View style={s.taskProgress}>
              <View style={s.progTrack}>
                <View style={[s.progFill, { width: `${t.progress}%` as any, backgroundColor: sc.color }]} />
              </View>
              <Text style={[s.progPct, { color: sc.color }]}>{t.progress}%</Text>
            </View>
            {t.status !== 'done' && (
              <TouchableOpacity onPress={() => markDone(t)} style={s.doneBtn}>
                <Text style={s.doneBtnText}>{fa ? '✅ تکمیل' : '✅ Mark done'}</Text>
              </TouchableOpacity>
            )}
          </Card>
        );
      })}
    </ScrollView>
  );
}

// ── Requests tab ───────────────────────────────────────────────
function RequestsTab({ fa }: { fa: boolean }) {
  const { data, isLoading, isRefetching, refetch } = useWorkflowRequests();
  const approve = useApproveRequest();
  const reject  = useRejectRequest();

  const apiList: any[] = ((data as any)?.data ?? (Array.isArray(data) ? data : []));
  const isMock    = apiList.length === 0 && !isLoading;
  const requests  = isMock ? MOCK_REQUESTS : apiList.map((r: any) => ({
    id: String(r.id), title: r.title ?? '—', titleEn: r.title ?? '—',
    type: r.type ?? 'general', submitter: r.submitterName ?? r.submitter ?? '—',
    status: r.status ?? 'pending', step: r.currentStep ?? '—', date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('fa-IR') : '—',
  }));

  const pending  = requests.filter((r: any) => r.status === 'pending').length;
  const approved = requests.filter((r: any) => r.status === 'approved').length;
  const rejected = requests.filter((r: any) => r.status === 'rejected').length;

  function handleApprove(r: any) {
    if (!isMock) {
      approve.mutate({ id: r.id });
    } else {
      Alert.alert('✅', fa ? 'تأیید شد' : 'Approved');
    }
  }
  function handleReject(r: any) {
    if (!isMock) {
      reject.mutate({ id: r.id });
    } else {
      Alert.alert('❌', fa ? 'رد شد' : 'Rejected');
    }
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}>

      {isMock && <View style={s.mockBanner}><Text style={s.mockText}>{fa ? '📋 داده نمونه' : '📋 Sample data'}</Text></View>}
      <View style={s.stats}>
        <StatCard icon="⏳" label={fa ? 'در انتظار':'Pending'}  value={pending}  color={COLORS.warning} />
        <StatCard icon="✅" label={fa ? 'تایید شده':'Approved'} value={approved} color={COLORS.success} />
        <StatCard icon="❌" label={fa ? 'رد شده':'Rejected'}    value={rejected} color={COLORS.danger}  />
      </View>

      {isLoading && <Text style={s.empty}>⏳</Text>}
      {!isLoading && requests.length === 0 && (
        <Text style={s.empty}>{fa ? 'درخواستی یافت نشد' : 'No requests found'}</Text>
      )}
      {requests.map((r: any) => {
        const sc = REQ_STATUS[r.status] ?? REQ_STATUS.pending;
        const typeIcon = REQ_TYPE_ICON[r.type] ?? '📋';
        return (
          <Card key={r.id} style={s.reqCard}>
            <View style={s.reqTop}>
              <Text style={s.reqIcon}>{typeIcon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.reqTitle} numberOfLines={1}>{fa ? r.title : (r.titleEn ?? r.title)}</Text>
                <Text style={s.reqMeta}>👤 {r.submitter}  ·  📅 {r.date}</Text>
              </View>
              <View style={[s.pill, { backgroundColor: sc.color + '20' }]}>
                <Text style={[s.pillText, { color: sc.color }]}>{fa ? sc.fa : r.status}</Text>
              </View>
            </View>
            <Text style={[s.reqStep, { color: COLORS.primary }]}>
              ▶️ {fa ? `مرحله: ${r.step}` : `Step: ${r.step}`}
            </Text>
            {r.status === 'pending' && (
              <View style={s.reqActions}>
                <TouchableOpacity onPress={() => handleApprove(r)}
                  style={[s.actionBtn, { backgroundColor: COLORS.success + '20', borderColor: COLORS.success + '40' }]}>
                  <Text style={[s.actionText, { color: COLORS.success }]}>✅ {fa ? 'تأیید' : 'Approve'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleReject(r)}
                  style={[s.actionBtn, { backgroundColor: COLORS.danger + '20', borderColor: COLORS.danger + '40' }]}>
                  <Text style={[s.actionText, { color: COLORS.danger }]}>❌ {fa ? 'رد' : 'Reject'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        );
      })}
    </ScrollView>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg },
  header:  { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.xs },
  title:   { fontSize: 18, fontWeight: '800', color: COLORS.text },
  content: { padding: SPACING.md, gap: SPACING.md, paddingBottom: 80 },

  tabRow:       { flexDirection: 'row', marginHorizontal: SPACING.md, marginBottom: SPACING.sm,
    backgroundColor: COLORS.bgMuted, borderRadius: RADIUS.lg, padding: 3 },
  tabBtn:       { flex: 1, paddingVertical: 7, borderRadius: RADIUS.md, alignItems: 'center', gap: 2 },
  tabActive:    { backgroundColor: COLORS.bgCard, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText:      { fontSize: 10, color: COLORS.textFaint, fontWeight: '500' },
  tabTextActive:{ color: COLORS.text, fontWeight: '700' },

  mockBanner: { backgroundColor: COLORS.warning + '15', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.warning + '40', padding: SPACING.sm },
  mockText:   { fontSize: 12, color: COLORS.warning, textAlign: 'center' },

  stats:     { flexDirection: 'row', gap: SPACING.xs },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  filterRow: { flexDirection: 'row', gap: SPACING.sm },
  filters:   { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.md },
  chip:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border },
  chipActive:     { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:       { fontSize: 12, color: COLORS.textMuted },
  chipTextActive: { color: COLORS.white, fontWeight: '600' },
  pill:      { paddingHorizontal: 7, paddingVertical: 2, borderRadius: RADIUS.full },
  pillText:  { fontSize: 10, fontWeight: '700' },
  form:      { gap: SPACING.sm },
  metaText:  { fontSize: 12, color: COLORS.textMuted },

  // Letter
  letterCard:   { gap: SPACING.xs, padding: SPACING.md },
  letterUnread: { borderColor: COLORS.primary, borderWidth: 1 },
  letterTop:    { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  letterSubject:{ fontSize: 14, fontWeight: '600', color: COLORS.text },
  letterMeta:   { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  letterDate:   { fontSize: 10, color: COLORS.textFaint },
  letterActions:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  archiveBtn:   { fontSize: 12, color: COLORS.textMuted },
  dot:          { width: 8, height: 8, borderRadius: 4 },

  // Meeting
  meetCard: { gap: SPACING.xs, padding: SPACING.md },
  meetTop:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meetTitle:{ flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.text, marginRight: 8 },
  meetMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  // Task
  taskCard:    { gap: SPACING.xs, padding: SPACING.md },
  taskTop:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  taskTitle:   { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.text },
  taskMeta:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  taskProgress:{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  progTrack:   { flex: 1, height: 5, borderRadius: 3, backgroundColor: COLORS.bgMuted, overflow: 'hidden' },
  progFill:    { height: '100%', borderRadius: 3 },
  progPct:     { fontSize: 11, fontWeight: '700', width: 32, textAlign: 'right' },
  doneBtn:     { alignSelf: 'flex-end', paddingHorizontal: SPACING.sm, paddingVertical: 4,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.success + '40',
    backgroundColor: COLORS.success + '10' },
  doneBtnText: { fontSize: 12, color: COLORS.success, fontWeight: '600' },

  // Request
  reqCard:    { gap: SPACING.xs, padding: SPACING.md },
  reqTop:     { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  reqIcon:    { fontSize: 22, lineHeight: 28 },
  reqTitle:   { fontSize: 14, fontWeight: '700', color: COLORS.text },
  reqMeta:    { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  reqStep:    { fontSize: 12, fontWeight: '600' },
  reqActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  actionBtn:  { flex: 1, paddingVertical: 8, borderRadius: RADIUS.md, borderWidth: 1, alignItems: 'center' },
  actionText: { fontSize: 13, fontWeight: '700' },

  empty: { textAlign: 'center', color: COLORS.textFaint, fontSize: 14, padding: SPACING.xl },
});
