import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl, Modal, Pressable, ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocaleStore } from '@/store/locale.store';
import { useShipments }   from '@/hooks/use-logistics';
import { Card, StatCard } from '@/components/ui';
import { COLORS, SPACING, RADIUS } from '@/constants/theme';

// ── Types ──────────────────────────────────────────────────────
type ShipStatus = 'booked' | 'picked_up' | 'in_transit' | 'customs' | 'delivered' | 'cancelled';

interface Shipment {
  id: string; trackingCode: string; cargo: string;
  type: 'domestic' | 'international' | 'air';
  status: ShipStatus; origin: string; destination: string;
  weight: number; weightUnit: string; cost: number; costPaid: boolean;
  sellerName: string; buyerName: string; waybillNo?: string;
  createdAt: string;
  stages: { key: string; label: string; labelFa: string; done: boolean; date?: string }[];
  insurance?: { company: string; amount: number; policyNo: string };
  customsStatus?: string;
}

// ── Mock fallback ──────────────────────────────────────────────
const MOCK: Shipment[] = [
  {
    id:'SHP-001', trackingCode:'EB-TRK-48271', cargo:'گندم — ۵۰۰ تن',
    type:'international', status:'in_transit',
    origin:'بندر شانگهای، چین', destination:'بندر شهید رجایی، بندرعباس',
    weight:500, weightUnit:'تن', cost:18500000000, costPaid:false,
    sellerName:'Shanghai Grain Co.', buyerName:'گروه تجاری رضایی',
    waybillNo:'EB-WB-10043', createdAt:'1403/02/01',
    stages:[
      { key:'booked',     label:'Booked',     labelFa:'ثبت',        done:true,  date:'1403/02/01' },
      { key:'picked_up',  label:'Picked Up',  labelFa:'تحویل',      done:true,  date:'1403/02/05' },
      { key:'in_transit', label:'In Transit', labelFa:'حمل',        done:false },
      { key:'customs',    label:'Customs',    labelFa:'گمرک',       done:false },
      { key:'delivered',  label:'Delivered',  labelFa:'تحویل نهایی',done:false },
    ],
    customsStatus:'pending',
  },
  {
    id:'SHP-002', trackingCode:'EB-TRK-39412', cargo:'روغن پالم — ۲۰۰ تن',
    type:'international', status:'customs',
    origin:'کوالالامپور، مالزی', destination:'تهران، ایران',
    weight:200, weightUnit:'تن', cost:9800000000, costPaid:true,
    sellerName:'Palm Oil Sdn Bhd', buyerName:'شرکت بازرگانی الفا',
    waybillNo:'EB-WB-10044', createdAt:'1403/01/20',
    stages:[
      { key:'booked',     label:'Booked',     labelFa:'ثبت',        done:true, date:'1403/01/20' },
      { key:'picked_up',  label:'Picked Up',  labelFa:'تحویل',      done:true, date:'1403/01/25' },
      { key:'in_transit', label:'In Transit', labelFa:'حمل',        done:true, date:'1403/02/01' },
      { key:'customs',    label:'Customs',    labelFa:'گمرک',       done:false },
      { key:'delivered',  label:'Delivered',  labelFa:'تحویل نهایی',done:false },
    ],
    customsStatus:'clearing',
    insurance:{ company:'بیمه آسیا', amount:5000000000, policyNo:'INS-7734-A' },
  },
  {
    id:'SHP-003', trackingCode:'EB-TRK-29104', cargo:'چای سیلان — ۵۰ تن',
    type:'international', status:'delivered',
    origin:'کلمبو، سریلانکا', destination:'بندر امام خمینی',
    weight:50, weightUnit:'تن', cost:2100000000, costPaid:true,
    sellerName:'Ceylon Tea Ltd', buyerName:'گروه تجاری رضایی',
    waybillNo:'EB-WB-10041', createdAt:'1402/12/15',
    stages:[
      { key:'booked',     label:'Booked',     labelFa:'ثبت',        done:true, date:'1402/12/15' },
      { key:'picked_up',  label:'Picked Up',  labelFa:'تحویل',      done:true, date:'1402/12/20' },
      { key:'in_transit', label:'In Transit', labelFa:'حمل',        done:true, date:'1402/12/25' },
      { key:'customs',    label:'Customs',    labelFa:'گمرک',       done:true, date:'1403/01/05' },
      { key:'delivered',  label:'Delivered',  labelFa:'تحویل نهایی',done:true, date:'1403/01/10' },
    ],
    insurance:{ company:'بیمه ملت', amount:1200000000, policyNo:'INS-3321-B' },
  },
];

// ── Status config ──────────────────────────────────────────────
const S_CFG: Record<ShipStatus, { color: string; icon: string; fa: string; en: string }> = {
  booked:     { color: '#64748b', icon: '📋', fa: 'ثبت شده',    en: 'Booked'    },
  picked_up:  { color: '#3b82f6', icon: '🚛', fa: 'تحویل گرفته', en: 'Picked Up' },
  in_transit: { color: '#f59e0b', icon: '🚢', fa: 'در راه',      en: 'In Transit' },
  customs:    { color: '#8b5cf6', icon: '🏛️', fa: 'گمرک',       en: 'Customs'   },
  delivered:  { color: '#10b981', icon: '✅', fa: 'تحویل داده', en: 'Delivered'  },
  cancelled:  { color: '#ef4444', icon: '❌', fa: 'لغو شده',    en: 'Cancelled'  },
};

function fmtCost(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(0) + 'M';
  return n.toLocaleString();
}

// ── Main screen ────────────────────────────────────────────────
export default function LogisticsScreen() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [statusFilter, setStatusFilter] = useState<'all' | ShipStatus>('all');
  const [selected, setSelected] = useState<Shipment | null>(null);

  const { data: apiData, isLoading, isRefetching, refetch } = useShipments();
  const apiShipments: Shipment[] = ((apiData as any)?.data ?? []).map((s: any) => ({
    id: String(s.id), trackingCode: s.trackingCode ?? s.id,
    cargo: s.cargo ?? s.product ?? '—', type: s.type ?? 'international',
    status: (s.status ?? 'booked').toLowerCase() as ShipStatus,
    origin: s.origin ?? '—', destination: s.destination ?? '—',
    weight: Number(s.weight ?? 0), weightUnit: s.weightUnit ?? 'تن',
    cost: Number(s.cost ?? 0), costPaid: !!s.costPaid,
    sellerName: s.sellerName ?? s.sellerCompany?.name ?? '—',
    buyerName: s.buyerName ?? s.buyerCompany?.name ?? '—',
    waybillNo: s.waybillNo, createdAt: s.createdAt ?? '',
    stages: s.stages ?? [],
  }));

  const isMock      = apiShipments.length === 0 && !isLoading;
  const shipments   = isMock ? MOCK : apiShipments;
  const displayed   = statusFilter === 'all'
    ? shipments
    : shipments.filter(sh => sh.status === statusFilter);

  const active       = shipments.filter(sh => !['delivered','cancelled'].includes(sh.status)).length;
  const customsCount = shipments.filter(sh => sh.status === 'customs').length;
  const delivered    = shipments.filter(sh => sh.status === 'delivered').length;
  const unpaid       = shipments.filter(sh => !sh.costPaid && sh.status !== 'cancelled').length;

  const FILTERS: { id: 'all' | ShipStatus; labelFa: string; labelEn: string }[] = [
    { id:'all',        labelFa:'همه',         labelEn:'All'        },
    { id:'in_transit', labelFa:'در راه',      labelEn:'In Transit' },
    { id:'customs',    labelFa:'گمرک',        labelEn:'Customs'    },
    { id:'delivered',  labelFa:'تحویل داده', labelEn:'Delivered'  },
    { id:'booked',     labelFa:'ثبت شده',    labelEn:'Booked'     },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}>

        <Text style={s.title}>🚢 {fa ? 'مدیریت لجستیک' : 'Logistics & Shipping'}</Text>

        {isMock && (
          <View style={s.mockBanner}>
            <Text style={s.mockText}>{fa ? '📋 داده نمونه' : '📋 Sample data — no API yet'}</Text>
          </View>
        )}

        {/* KPIs */}
        <View style={s.stats}>
          <StatCard icon="🚢" label={fa ? 'فعال'     : 'Active'}  value={active}       color={COLORS.primary}  />
          <StatCard icon="🏛️" label={fa ? 'گمرک'     : 'Customs'} value={customsCount} color={COLORS.secondary}/>
          <StatCard icon="✅" label={fa ? 'تحویل'    : 'Delivered'}value={delivered}    color={COLORS.success}  />
          <StatCard icon="💸" label={fa ? 'پرداخت نشده':'Unpaid'} value={unpaid}       color={COLORS.danger}   />
        </View>

        {/* Customs alert */}
        {customsCount > 0 && (
          <View style={s.alertBox}>
            <Text style={s.alertText}>
              🏛️ {fa
                ? `${customsCount} محموله در انتظار ترخیص گمرک`
                : `${customsCount} shipment${customsCount > 1 ? 's' : ''} pending customs clearance`}
            </Text>
          </View>
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

        {/* Shipment list */}
        {isLoading && <Text style={s.empty}>⏳ {fa ? 'در حال بارگذاری...' : 'Loading...'}</Text>}
        {!isLoading && displayed.length === 0 && (
          <Text style={s.empty}>{fa ? 'محموله‌ای یافت نشد' : 'No shipments found'}</Text>
        )}
        {displayed.map(sh => {
          const sc   = S_CFG[sh.status];
          const done = sh.stages.filter(st => st.done).length;
          const pct  = sh.stages.length ? Math.round(done / sh.stages.length * 100) : 0;
          return (
            <TouchableOpacity key={sh.id} onPress={() => setSelected(sh)} activeOpacity={0.85}>
              <Card style={StyleSheet.flatten([s.shipCard, { borderLeftColor: sc.color, borderLeftWidth: 3 }]) as ViewStyle}>
                {/* Header */}
                <View style={s.shipTop}>
                  <Text style={s.trackCode}>{sh.trackingCode}</Text>
                  <View style={[s.badge, { backgroundColor: sc.color + '22' }]}>
                    <Text style={[s.badgeText, { color: sc.color }]}>{sc.icon} {fa ? sc.fa : sc.en}</Text>
                  </View>
                </View>
                <Text style={s.cargo} numberOfLines={1}>{sh.cargo}</Text>
                {/* Route */}
                <View style={s.routeRow}>
                  <Text style={s.routeCity} numberOfLines={1}>{sh.origin}</Text>
                  <Text style={s.routeArrow}>→</Text>
                  <Text style={s.routeCity} numberOfLines={1}>{sh.destination}</Text>
                </View>
                {/* Meta */}
                <View style={s.metaRow}>
                  <Text style={s.metaChip}>⚖️ {sh.weight} {sh.weightUnit}</Text>
                  {sh.waybillNo && <Text style={s.metaChip}>📄 {sh.waybillNo}</Text>}
                  <Text style={[s.metaChip, { color: sh.costPaid ? COLORS.success : COLORS.danger }]}>
                    {sh.costPaid ? (fa ? '✅ پرداخت شده' : '✅ Paid') : (fa ? '⚠️ پرداخت نشده' : '⚠️ Unpaid')}
                  </Text>
                </View>
                {/* Stage progress */}
                <View style={s.stageRow}>
                  {sh.stages.map((st, i) => (
                    <View key={i} style={s.stageStep}>
                      <View style={[s.stageDot, { backgroundColor: st.done ? sc.color : COLORS.bgMuted }]} />
                      {i < sh.stages.length - 1 && (
                        <View style={[s.stageLine, { backgroundColor: sh.stages[i + 1]?.done ? sc.color : COLORS.bgMuted }]} />
                      )}
                    </View>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={s.metaChip}>
                    {done}/{sh.stages.length} {fa ? 'مرحله' : 'stages'} ({pct}%)
                  </Text>
                  <Text style={s.metaChip}>💰 {fmtCost(sh.cost)} IRR</Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Detail modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <Pressable style={s.overlay} onPress={() => setSelected(null)}>
          <Pressable style={s.sheet} onPress={() => {}}>
            {selected && <ShipDetail ship={selected} fa={fa} onClose={() => setSelected(null)} />}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ── Shipment detail sheet ──────────────────────────────────────
function ShipDetail({ ship, fa, onClose }: { ship: Shipment; fa: boolean; onClose: () => void }) {
  const sc = S_CFG[ship.status];
  return (
    <ScrollView style={{ maxHeight: 520 }} showsVerticalScrollIndicator={false}>
      <View style={d.container}>
        <View style={d.handle} />
        <View style={d.headerRow}>
          <View>
            <Text style={d.trackCode}>{ship.trackingCode}</Text>
            <Text style={d.cargo}>{ship.cargo}</Text>
          </View>
          <TouchableOpacity onPress={onClose}><Text style={d.close}>✕</Text></TouchableOpacity>
        </View>
        {/* Status */}
        <View style={[d.statusPill, { backgroundColor: sc.color + '18' }]}>
          <Text style={[d.statusText, { color: sc.color }]}>{sc.icon} {fa ? sc.fa : sc.en}</Text>
        </View>
        {/* Route */}
        <View style={d.routeCard}>
          <View style={{ flex: 1 }}>
            <Text style={d.routeLabel}>{fa ? 'مبدأ' : 'Origin'}</Text>
            <Text style={d.routeVal}>{ship.origin}</Text>
          </View>
          <Text style={d.arrow}>→</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={d.routeLabel}>{fa ? 'مقصد' : 'Destination'}</Text>
            <Text style={d.routeVal}>{ship.destination}</Text>
          </View>
        </View>
        {/* Details */}
        {[
          [fa ? 'فروشنده' : 'Seller',      ship.sellerName],
          [fa ? 'خریدار'  : 'Buyer',       ship.buyerName],
          [fa ? 'وزن'     : 'Weight',      `${ship.weight} ${ship.weightUnit}`],
          [fa ? 'بارنامه' : 'Waybill No',  ship.waybillNo ?? '—'],
          [fa ? 'هزینه'   : 'Cost',        `${fmtCost(ship.cost)} IRR`],
          [fa ? 'پرداخت'  : 'Payment',     ship.costPaid ? (fa ? 'پرداخت شده ✅' : 'Paid ✅') : (fa ? 'پرداخت نشده ⚠️' : 'Unpaid ⚠️')],
        ].map(([k, v]) => (
          <View key={k} style={d.row}>
            <Text style={d.key}>{k}</Text>
            <Text style={d.val}>{v}</Text>
          </View>
        ))}
        {/* Insurance */}
        {ship.insurance && (
          <View style={d.insBox}>
            <Text style={d.insTitle}>🛡️ {fa ? 'بیمه' : 'Insurance'}</Text>
            <Text style={d.insDetail}>{ship.insurance.company} · {ship.insurance.policyNo}</Text>
            <Text style={d.insDetail}>{fmtCost(ship.insurance.amount)} IRR</Text>
          </View>
        )}
        {/* Stages timeline */}
        <Text style={d.stageTitle}>📍 {fa ? 'مراحل محموله' : 'Shipment Stages'}</Text>
        {ship.stages.map((st, i) => (
          <View key={i} style={d.stageRow}>
            <View style={[d.stageDot, { backgroundColor: st.done ? sc.color : COLORS.bgMuted }]} />
            <View style={{ flex: 1 }}>
              <Text style={[d.stageName, !st.done && { color: COLORS.textFaint }]}>
                {fa ? st.labelFa : st.label}
              </Text>
              {st.date && <Text style={d.stageDate}>{st.date}</Text>}
            </View>
            <Text style={{ fontSize: 16 }}>{st.done ? '✅' : '⏸'}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg },
  scroll:  { flex: 1 },
  content: { padding: SPACING.md, gap: SPACING.md, paddingBottom: 80 },
  title:   { fontSize: 18, fontWeight: '800', color: COLORS.text },

  mockBanner: { backgroundColor: COLORS.warning + '15', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.warning + '40', padding: SPACING.sm },
  mockText:   { fontSize: 12, color: COLORS.warning, textAlign: 'center' },

  stats: { flexDirection: 'row', gap: SPACING.xs },

  alertBox: { backgroundColor: COLORS.secondary + '18', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.secondary + '40', padding: SPACING.md },
  alertText:{ fontSize: 13, color: COLORS.secondary, fontWeight: '600' },

  filters: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.md },
  chip:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border },
  chipActive:     { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:       { fontSize: 12, color: COLORS.textMuted },
  chipTextActive: { color: COLORS.white, fontWeight: '600' },

  shipCard: { gap: SPACING.xs, padding: SPACING.md },
  shipTop:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  trackCode:{ fontSize: 12, fontWeight: '700', color: COLORS.primary },
  badge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  badgeText:{ fontSize: 10, fontWeight: '700' },
  cargo:    { fontSize: 15, fontWeight: '700', color: COLORS.text },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  routeCity:{ flex: 1, fontSize: 11, color: COLORS.textMuted },
  routeArrow:{ fontSize: 12, color: COLORS.textFaint },
  metaRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaChip: { fontSize: 11, color: COLORS.textMuted },
  stageRow: { flexDirection: 'row', alignItems: 'center' },
  stageStep:{ flexDirection: 'row', alignItems: 'center', flex: 1 },
  stageDot: { width: 10, height: 10, borderRadius: 5 },
  stageLine:{ flex: 1, height: 2 },

  empty:   { textAlign: 'center', color: COLORS.textFaint, fontSize: 14, padding: SPACING.xl },
  overlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: COLORS.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.lg, paddingBottom: 40 },
});

const d = StyleSheet.create({
  container:  { gap: SPACING.sm, paddingBottom: SPACING.sm },
  handle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: SPACING.sm },
  headerRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  trackCode:  { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  cargo:      { fontSize: 18, fontWeight: '800', color: COLORS.text },
  close:      { fontSize: 20, color: COLORS.textFaint, padding: 4 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full, alignSelf: 'flex-start' },
  statusText: { fontSize: 13, fontWeight: '700' },
  routeCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg, borderRadius: RADIUS.md, padding: SPACING.md, gap: SPACING.sm },
  routeLabel: { fontSize: 10, color: COLORS.textFaint, marginBottom: 2 },
  routeVal:   { fontSize: 13, fontWeight: '600', color: COLORS.text },
  arrow:      { fontSize: 20, color: COLORS.textFaint },
  row:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: COLORS.border + '60' },
  key:        { fontSize: 13, color: COLORS.textMuted },
  val:        { fontSize: 13, fontWeight: '600', color: COLORS.text, maxWidth: '60%', textAlign: 'right' },
  insBox:     { backgroundColor: COLORS.info + '12', borderRadius: RADIUS.md, padding: SPACING.sm, gap: 2, borderWidth: 1, borderColor: COLORS.info + '30' },
  insTitle:   { fontSize: 13, fontWeight: '700', color: COLORS.info },
  insDetail:  { fontSize: 12, color: COLORS.textMuted },
  stageTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginTop: SPACING.sm },
  stageRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, paddingVertical: 6 },
  stageDot:   { width: 12, height: 12, borderRadius: 6, marginTop: 2 },
  stageName:  { fontSize: 14, fontWeight: '600', color: COLORS.text },
  stageDate:  { fontSize: 11, color: COLORS.textFaint },
});
