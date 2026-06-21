import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl, TextInput, Modal,
  Pressable, ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocaleStore }   from '@/store/locale.store';
import {
  useWorkOrders, useCreateWorkOrder, useUpdateWorkOrder,
  useMaterials, useMfgReports,
} from '@/hooks/use-manufacturing';
import { Button, Card, StatCard } from '@/components/ui';
import { COLORS, SPACING, RADIUS } from '@/constants/theme';

// ── Types ──────────────────────────────────────────────────────
type WOStatus = 'PLANNED' | 'IN_PROGRESS' | 'PAUSED' | 'QC' | 'COMPLETED' | 'CANCELLED';

interface WorkOrder {
  id: string; orderNo: string; productName: string; productNameFa?: string;
  status: WOStatus; priority: string; progress: number;
  qty: number; unit: string; dueDate: string; workcenter?: string;
  bomId?: string; notes?: string;
}

// ── Mock fallback (mirrors web component) ─────────────────────
const MOCK_WOS: WorkOrder[] = [
  { id:'1', orderNo:'WO-2025-001', productName:'Steel Frame Type A', productNameFa:'قاب فولادی نوع الف',
    status:'IN_PROGRESS', priority:'HIGH', progress:65, qty:50, unit:'Pcs', dueDate:'1403/06/15', workcenter:'خط تولید ۱' },
  { id:'2', orderNo:'WO-2025-002', productName:'Steel Frame Type B', productNameFa:'قاب فولادی نوع ب',
    status:'PLANNED', priority:'NORMAL', progress:0, qty:30, unit:'Pcs', dueDate:'1403/06/25', workcenter:'خط تولید ۲' },
  { id:'3', orderNo:'WO-2025-003', productName:'Aluminium Panel', productNameFa:'پانل آلومینیومی',
    status:'QC', priority:'HIGH', progress:90, qty:100, unit:'Pcs', dueDate:'1403/06/10', workcenter:'خط رنگ‌کاری' },
  { id:'4', orderNo:'WO-2025-004', productName:'Galvanised Pipe', productNameFa:'لوله گالوانیزه',
    status:'COMPLETED', priority:'LOW', progress:100, qty:200, unit:'m', dueDate:'1403/05/30', workcenter:'خط تولید ۱' },
];

const MOCK_MATERIALS = [
  { id:'1', code:'MTL-001', material:'ورق فولادی ۲ میل', materialEn:'Steel Sheet 2mm', required:250, available:180, unit:'Kg', unitCostIRR:'85000', supplier:'فولاد مبارکه' },
  { id:'2', code:'MTL-002', material:'الکترود جوشکاری', materialEn:'Welding Rod',      required:25,  available:30,  unit:'Kg', unitCostIRR:'420000',supplier:'لینکلن' },
  { id:'3', code:'MTL-003', material:'رنگ اپوکسی',       materialEn:'Epoxy Paint',      required:10,  available:6,   unit:'Lt', unitCostIRR:'380000',supplier:'ایران آلکید' },
  { id:'4', code:'MTL-004', material:'پیچ و مهره M8',    materialEn:'Bolt & Nut M8',    required:500, available:620, unit:'Pcs',unitCostIRR:'4200',  supplier:'قطعات گلستان' },
];

// ── Status config ──────────────────────────────────────────────
const S_CFG: Record<WOStatus, { color: string; icon: string; fa: string; en: string }> = {
  PLANNED:     { color: '#64748b', icon: '📋', fa: 'برنامه‌ریزی', en: 'Planned'    },
  IN_PROGRESS: { color: '#3b82f6', icon: '🔄', fa: 'در تولید',    en: 'In Progress' },
  PAUSED:      { color: '#f59e0b', icon: '⏸', fa: 'متوقف',       en: 'Paused'     },
  QC:          { color: '#8b5cf6', icon: '🔍', fa: 'کنترل کیفیت', en: 'QC Check'   },
  COMPLETED:   { color: '#10b981', icon: '✅', fa: 'تکمیل شده',   en: 'Completed'  },
  CANCELLED:   { color: '#ef4444', icon: '❌', fa: 'لغو شده',     en: 'Cancelled'  },
};

const P_CFG: Record<string, { color: string; fa: string }> = {
  LOW:    { color: '#64748b', fa: 'پایین'  },
  NORMAL: { color: '#3b82f6', fa: 'عادی'   },
  HIGH:   { color: '#f59e0b', fa: 'بالا'   },
  URGENT: { color: '#ef4444', fa: 'فوری'   },
};

// ── Main screen ────────────────────────────────────────────────
export default function ManufacturingScreen() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';

  const [statusFilter, setStatusFilter] = useState<'all' | WOStatus>('all');
  const [selected, setSelected] = useState<WorkOrder | null>(null);
  const [showNew,  setShowNew]  = useState(false);
  const [form, setForm] = useState({
    productName: '', qty: '', unit: 'Pcs', dueDate: '', priority: 'NORMAL', workcenter: '', notes: '',
  });

  const { data: woData,  isLoading, isRefetching, refetch } = useWorkOrders(
    statusFilter !== 'all' ? { status: statusFilter } : {}
  );
  const { data: matData }  = useMaterials();
  const { data: rptData }  = useMfgReports();
  const createWO = useCreateWorkOrder();
  const updateWO = useUpdateWorkOrder();

  // Normalise API data → WorkOrder shape, fallback to mock
  const apiWOs: WorkOrder[] = ((woData as any)?.data ?? []).map((o: any) => ({
    id: String(o.id), orderNo: o.orderNo ?? 'WO-???',
    productName: o.productName ?? '', productNameFa: o.productNameFa ?? o.productName ?? '',
    status: (o.status ?? 'PLANNED') as WOStatus,
    priority: o.priority ?? 'NORMAL', progress: o.progress ?? 0,
    qty: Number(o.qty ?? 0), unit: o.unit ?? 'Pcs',
    dueDate: o.dueDate ? new Date(o.dueDate).toLocaleDateString('fa-IR') : '—',
    workcenter: o.workcenter ?? '', notes: o.notes,
  }));
  const isMock = apiWOs.length === 0 && !isLoading;
  const allWOs  = isMock ? MOCK_WOS : apiWOs;

  const apiMats = ((matData as any)?.data ?? []);
  const materials = apiMats.length > 0 ? apiMats : MOCK_MATERIALS;
  const shortages = materials.filter((m: any) => Number(m.available) < Number(m.required));

  const rpt = rptData as any;
  const statActive    = rpt?.activeWorkOrders     ?? allWOs.filter(w => w.status === 'IN_PROGRESS').length;
  const statPlanned   = rpt?.plannedWorkOrders    ?? allWOs.filter(w => w.status === 'PLANNED').length;
  const statQC        = rpt?.inQCWorkOrders       ?? allWOs.filter(w => w.status === 'QC').length;
  const statCompleted = rpt?.completedThisMonth   ?? allWOs.filter(w => w.status === 'COMPLETED').length;

  const displayed = statusFilter === 'all'
    ? allWOs
    : allWOs.filter(w => w.status === statusFilter);

  const FILTERS: { id: 'all' | WOStatus; labelFa: string; labelEn: string }[] = [
    { id: 'all',         labelFa: 'همه',          labelEn: 'All'         },
    { id: 'PLANNED',     labelFa: 'برنامه‌ریزی',  labelEn: 'Planned'    },
    { id: 'IN_PROGRESS', labelFa: 'در تولید',     labelEn: 'In Progress' },
    { id: 'QC',          labelFa: 'کنترل کیفیت', labelEn: 'QC'          },
    { id: 'COMPLETED',   labelFa: 'تکمیل شده',   labelEn: 'Completed'   },
  ];

  async function submitNew() {
    if (!form.productName || !form.qty || !form.dueDate) return;
    await createWO.mutateAsync({
      productName: form.productName, qty: parseFloat(form.qty),
      unit: form.unit, dueDate: form.dueDate,
      priority: form.priority, workcenter: form.workcenter, notes: form.notes,
    });
    setForm({ productName: '', qty: '', unit: 'Pcs', dueDate: '', priority: 'NORMAL', workcenter: '', notes: '' });
    setShowNew(false);
  }

  function advance(wo: WorkOrder) {
    const next: Record<WOStatus, WOStatus | null> = {
      PLANNED: 'IN_PROGRESS', IN_PROGRESS: 'QC', QC: 'COMPLETED',
      COMPLETED: null, PAUSED: 'IN_PROGRESS', CANCELLED: null,
    };
    const n = next[wo.status];
    if (!n) return;
    if (!isMock) updateWO.mutate({ id: wo.id, dto: { status: n } });
    setSelected(null);
  }

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}>

        {/* Header */}
        <View style={s.headerRow}>
          <Text style={s.title}>🏭 {fa ? 'دستورات کار' : 'Work Orders'}</Text>
          <Button size="sm" onPress={() => setShowNew(p => !p)}>
            {showNew ? (fa ? 'بستن' : 'Close') : (fa ? '+ جدید' : '+ New')}
          </Button>
        </View>

        {isMock && (
          <View style={s.mockBanner}>
            <Text style={s.mockText}>{fa ? '📋 داده نمونه — API موجود نیست' : '📋 Sample data — API not connected'}</Text>
          </View>
        )}

        {/* KPIs */}
        <View style={s.stats}>
          <StatCard icon="🔄" label={fa ? 'فعال'       : 'Active'}    value={statActive}    color={COLORS.primary}  />
          <StatCard icon="📋" label={fa ? 'برنامه‌ریزی': 'Planned'}   value={statPlanned}   color="#64748b"         />
          <StatCard icon="🔍" label={fa ? 'کنترل کیفیت': 'QC'}        value={statQC}        color={COLORS.secondary}/>
          <StatCard icon="✅" label={fa ? 'تکمیل (ماه)': 'Completed'} value={statCompleted} color={COLORS.success}  />
        </View>

        {/* Material shortage alert */}
        {shortages.length > 0 && (
          <View style={s.alertBox}>
            <Text style={s.alertTitle}>⚠️ {fa ? `${shortages.length} کمبود مواد` : `${shortages.length} material shortage${shortages.length > 1 ? 's' : ''}`}</Text>
            {shortages.slice(0, 2).map((m: any, i: number) => (
              <Text key={i} style={s.alertRow}>
                • {fa ? m.material : m.materialEn ?? m.material}
                {' — '}<Text style={{ color: COLORS.danger }}>
                  -{Math.max(0, Number(m.required) - Number(m.available))} {m.unit}
                </Text>
              </Text>
            ))}
          </View>
        )}

        {/* New WO form */}
        {showNew && (
          <Card style={s.form}>
            <Text style={s.formTitle}>{fa ? '🏭 دستور کار جدید' : '🏭 New Work Order'}</Text>
            <TextInput
              placeholder={fa ? 'نام محصول *' : 'Product name *'}
              value={form.productName}
              onChangeText={v => setForm(f => ({ ...f, productName: v }))}
              style={s.input} placeholderTextColor={COLORS.textFaint}
            />
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              <TextInput
                placeholder={fa ? 'مقدار *' : 'Qty *'}
                value={form.qty} keyboardType="numeric"
                onChangeText={v => setForm(f => ({ ...f, qty: v }))}
                style={[s.input, { flex: 1 }]} placeholderTextColor={COLORS.textFaint}
              />
              <TextInput
                placeholder="Unit"
                value={form.unit}
                onChangeText={v => setForm(f => ({ ...f, unit: v }))}
                style={[s.input, { flex: 0.8 }]} placeholderTextColor={COLORS.textFaint}
              />
            </View>
            <TextInput
              placeholder={fa ? 'تاریخ تحویل *' : 'Due date * (YYYY-MM-DD)'}
              value={form.dueDate}
              onChangeText={v => setForm(f => ({ ...f, dueDate: v }))}
              style={s.input} placeholderTextColor={COLORS.textFaint}
            />
            <TextInput
              placeholder={fa ? 'مرکز کار' : 'Work center'}
              value={form.workcenter}
              onChangeText={v => setForm(f => ({ ...f, workcenter: v }))}
              style={s.input} placeholderTextColor={COLORS.textFaint}
            />
            <Button onPress={submitNew} loading={createWO.isPending} fullWidth>
              {fa ? 'صدور دستور کار' : 'Issue Work Order'}
            </Button>
          </Card>
        )}

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -SPACING.md }}>
          <View style={s.filters}>
            {FILTERS.map(f => (
              <TouchableOpacity key={f.id} onPress={() => setStatusFilter(f.id)}
                style={[s.chip, statusFilter === f.id && s.chipActive]}>
                <Text style={[s.chipText, statusFilter === f.id && s.chipTextActive]}>
                  {fa ? f.labelFa : f.labelEn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* List */}
        {isLoading && <Text style={s.empty}>⏳ {fa ? 'در حال بارگذاری...' : 'Loading...'}</Text>}
        {!isLoading && displayed.length === 0 && (
          <Text style={s.empty}>{fa ? 'دستور کاری یافت نشد' : 'No work orders found'}</Text>
        )}
        {displayed.map(wo => {
          const sc = S_CFG[wo.status];
          const pc = P_CFG[wo.priority] ?? P_CFG.NORMAL;
          return (
            <TouchableOpacity key={wo.id} onPress={() => setSelected(wo)} activeOpacity={0.85}>
              <Card style={StyleSheet.flatten([s.woCard, { borderLeftColor: sc.color, borderLeftWidth: 3 }]) as ViewStyle}>
                {/* Header row */}
                <View style={s.woTop}>
                  <Text style={[s.woNo, { color: COLORS.primary }]}>{wo.orderNo}</Text>
                  <View style={[s.badge, { backgroundColor: sc.color + '22' }]}>
                    <Text style={[s.badgeText, { color: sc.color }]}>
                      {sc.icon} {fa ? sc.fa : sc.en}
                    </Text>
                  </View>
                </View>
                <Text style={s.woProduct} numberOfLines={1}>
                  {fa ? (wo.productNameFa ?? wo.productName) : wo.productName}
                </Text>
                {/* Meta */}
                <View style={s.woMeta}>
                  <Text style={s.metaChip}>📦 {wo.qty} {wo.unit}</Text>
                  {wo.workcenter ? <Text style={s.metaChip}>🏭 {wo.workcenter}</Text> : null}
                  <Text style={s.metaChip}>📅 {wo.dueDate}</Text>
                  <View style={[s.priorityPill, { backgroundColor: pc.color + '22' }]}>
                    <Text style={[s.priorityText, { color: pc.color }]}>
                      {fa ? pc.fa : wo.priority}
                    </Text>
                  </View>
                </View>
                {/* Progress bar */}
                <View style={s.progressWrap}>
                  <View style={s.progressTrack}>
                    <View style={[s.progressFill, { width: `${wo.progress}%` as any, backgroundColor: sc.color }]} />
                  </View>
                  <Text style={[s.progressPct, { color: sc.color }]}>{wo.progress}%</Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}

        {/* Materials section */}
        <Card style={{ gap: SPACING.sm }}>
          <Text style={s.sectionTitle}>📦 {fa ? 'وضعیت مواد اولیه' : 'Raw Materials Status'}</Text>
          {materials.slice(0, 5).map((m: any) => {
            const avail    = Number(m.available);
            const required = Number(m.required);
            const isShort  = avail < required;
            const pct      = required > 0 ? Math.min(100, Math.round(avail / required * 100)) : 100;
            return (
              <View key={m.id ?? m.code} style={s.matRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.matName} numberOfLines={1}>
                    {fa ? m.material : (m.materialEn ?? m.material)}
                  </Text>
                  <Text style={s.matSub}>{m.code} · {m.supplier ?? '—'}</Text>
                </View>
                <View style={s.matRight}>
                  <Text style={[s.matQty, { color: isShort ? COLORS.danger : COLORS.success }]}>
                    {avail}/{required} {m.unit}
                  </Text>
                  <View style={s.miniTrack}>
                    <View style={[s.miniFill, { width: `${pct}%` as any, backgroundColor: isShort ? COLORS.danger : COLORS.success }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </Card>
      </ScrollView>

      {/* Work order detail modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <Pressable style={s.overlay} onPress={() => setSelected(null)}>
          <Pressable style={s.sheet} onPress={() => {}}>
            {selected && <WODetail wo={selected} fa={fa} onClose={() => setSelected(null)} onAdvance={() => advance(selected)} />}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ── Detail bottom sheet ────────────────────────────────────────
function WODetail({ wo, fa, onClose, onAdvance }: {
  wo: WorkOrder; fa: boolean; onClose: () => void; onAdvance: () => void;
}) {
  const sc = S_CFG[wo.status];
  const NEXT_LABEL: Partial<Record<WOStatus, string>> = {
    PLANNED: fa ? '▶️ شروع تولید' : '▶️ Start Production',
    IN_PROGRESS: fa ? '🔍 ارسال به QC' : '🔍 Send to QC',
    QC: fa ? '✅ تأیید کیفیت' : '✅ Approve QC',
  };

  return (
    <View style={d.container}>
      <View style={d.handle} />
      <View style={d.header}>
        <View>
          <Text style={d.orderNo}>{wo.orderNo}</Text>
          <Text style={d.product}>{fa ? (wo.productNameFa ?? wo.productName) : wo.productName}</Text>
        </View>
        <TouchableOpacity onPress={onClose}><Text style={d.close}>✕</Text></TouchableOpacity>
      </View>
      {/* Status badge */}
      <View style={[d.statusRow, { backgroundColor: sc.color + '18' }]}>
        <Text style={[d.statusLabel, { color: sc.color }]}>{sc.icon} {fa ? sc.fa : sc.en}</Text>
        <Text style={d.progress}>{wo.progress}%</Text>
      </View>
      {/* Progress bar */}
      <View style={d.progTrack}>
        <View style={[d.progFill, { width: `${wo.progress}%` as any, backgroundColor: sc.color }]} />
      </View>
      {/* Detail rows */}
      {[
        [fa ? 'مقدار' : 'Quantity',   `${wo.qty} ${wo.unit}`],
        [fa ? 'مرکز کار' : 'Work Center', wo.workcenter || '—'],
        [fa ? 'تاریخ تحویل' : 'Due Date', wo.dueDate],
        [fa ? 'اولویت' : 'Priority', wo.priority],
      ].map(([k, v]) => (
        <View key={k} style={d.row}>
          <Text style={d.rowKey}>{k}</Text>
          <Text style={d.rowVal}>{v}</Text>
        </View>
      ))}
      {wo.notes && <Text style={d.notes}>{wo.notes}</Text>}
      {/* Advance button */}
      {NEXT_LABEL[wo.status] && (
        <Button onPress={onAdvance} fullWidth style={{ marginTop: SPACING.md }}>
          {NEXT_LABEL[wo.status]!}
        </Button>
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg },
  scroll:  { flex: 1 },
  content: { padding: SPACING.md, gap: SPACING.md, paddingBottom: 80 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title:     { fontSize: 18, fontWeight: '800', color: COLORS.text },

  mockBanner: { backgroundColor: COLORS.warning + '15', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.warning + '40', padding: SPACING.sm },
  mockText:   { fontSize: 12, color: COLORS.warning, textAlign: 'center' },

  stats: { flexDirection: 'row', gap: SPACING.xs },

  alertBox: { backgroundColor: COLORS.danger + '12', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.danger + '40', padding: SPACING.md, gap: 4 },
  alertTitle:{ fontSize: 13, fontWeight: '700', color: COLORS.danger },
  alertRow:  { fontSize: 12, color: COLORS.textMuted },

  form:       { gap: SPACING.sm },
  formTitle:  { fontSize: 15, fontWeight: '700', color: COLORS.text },
  input: {
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, padding: SPACING.sm, color: COLORS.text, fontSize: 14,
  },

  filters: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.md },
  chip:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border },
  chipActive:     { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:       { fontSize: 12, color: COLORS.textMuted },
  chipTextActive: { color: COLORS.white, fontWeight: '600' },

  woCard:    { gap: SPACING.xs, padding: SPACING.md },
  woTop:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  woNo:      { fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] as any },
  badge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  badgeText: { fontSize: 10, fontWeight: '700' },
  woProduct: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  woMeta:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaChip:  { fontSize: 11, color: COLORS.textMuted },
  priorityPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.full },
  priorityText: { fontSize: 10, fontWeight: '700' },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  progressTrack:{ flex: 1, height: 6, borderRadius: 3, backgroundColor: COLORS.bgMuted, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressPct:  { fontSize: 11, fontWeight: '700', width: 32, textAlign: 'right' },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  matRow:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: 4, borderTopWidth: 1, borderTopColor: COLORS.border + '60' },
  matName:  { fontSize: 13, fontWeight: '600', color: COLORS.text },
  matSub:   { fontSize: 11, color: COLORS.textFaint },
  matRight: { alignItems: 'flex-end', gap: 4 },
  matQty:   { fontSize: 12, fontWeight: '700' },
  miniTrack:{ width: 60, height: 4, borderRadius: 2, backgroundColor: COLORS.bgMuted, overflow: 'hidden' },
  miniFill: { height: '100%', borderRadius: 2 },

  empty: { textAlign: 'center', color: COLORS.textFaint, fontSize: 14, padding: SPACING.xl },

  overlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: COLORS.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.lg, paddingBottom: 40 },
});

const d = StyleSheet.create({
  container: { gap: SPACING.sm },
  handle:    { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: SPACING.sm },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderNo:   { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  product:   { fontSize: 18, fontWeight: '800', color: COLORS.text },
  close:     { fontSize: 20, color: COLORS.textFaint, padding: 4 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', padding: SPACING.sm, borderRadius: RADIUS.md },
  statusLabel:{ fontSize: 13, fontWeight: '700' },
  progress:  { fontSize: 20, fontWeight: '900', color: COLORS.text },
  progTrack: { height: 8, borderRadius: 4, backgroundColor: COLORS.bgMuted, overflow: 'hidden', marginVertical: SPACING.xs },
  progFill:  { height: '100%', borderRadius: 4 },
  row:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: COLORS.border + '60' },
  rowKey:    { fontSize: 13, color: COLORS.textMuted },
  rowVal:    { fontSize: 13, fontWeight: '600', color: COLORS.text },
  notes:     { fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic', paddingTop: SPACING.sm },
});
