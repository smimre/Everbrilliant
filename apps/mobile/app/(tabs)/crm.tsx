import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, TextInput, Modal, Pressable, ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocaleStore }  from '@/store/locale.store';
import {
  useCRMConnections, useDeals, useDealStats,
  useCreateDeal, useUpdateDeal, useSearchCompanies,
} from '@/hooks/use-crm';
import { Card, StatCard, Button } from '@/components/ui';
import { COLORS, SPACING, RADIUS } from '@/constants/theme';

// ── Types ──────────────────────────────────────────────────────
type CRMTab   = 'companies' | 'deals' | 'search';
type DealStage = 'LEAD' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';

// ── Mock fallbacks ─────────────────────────────────────────────
const MOCK_COMPANIES = [
  { id:1, name:'شرکت بازرگانی الفا', type:'buyer',    country:'Iran',   deals:12, totalValue:8500000000, rating:5, status:'active',   lastActivity:'1403/02/18' },
  { id:2, name:'مهر پارس',           type:'supplier', country:'Iran',   deals:7,  totalValue:3200000000, rating:4, status:'active',   lastActivity:'1403/02/15' },
  { id:3, name:'ارمغان لجستیک',     type:'logistics',country:'Iran',   deals:20, totalValue:1500000000, rating:5, status:'active',   lastActivity:'1403/02/10' },
  { id:4, name:'تجارت نوین',         type:'buyer',    country:'UAE',    deals:3,  totalValue:900000000,  rating:3, status:'prospect', lastActivity:'1403/01/25' },
  { id:5, name:'گلوبال ترید',        type:'supplier', country:'Turkey', deals:0,  totalValue:0,          rating:0, status:'prospect', lastActivity:'1403/02/01' },
];

const MOCK_DEALS = [
  { id:'D1', title:'قرارداد تامین سالانه', partnerName:'شرکت بازرگانی الفا', stage:'NEGOTIATION' as DealStage, valueIRR:4500000000, probability:70, closingDate:'1403/05/01', ownerName:'محمد کریمی' },
  { id:'D2', title:'خرید انبوه فصل سوم',   partnerName:'مهر پارس',           stage:'PROPOSAL'     as DealStage, valueIRR:1800000000, probability:50, closingDate:'1403/04/15', ownerName:'سارا احمدی' },
  { id:'D3', title:'تامین تجهیزات',        partnerName:'تجارت نوین',         stage:'QUALIFIED'    as DealStage, valueIRR:600000000,  probability:30, closingDate:'1403/05/30', ownerName:'علی رضایی' },
  { id:'D4', title:'قرارداد توزیع',         partnerName:'شرکت بازرگانی الفا', stage:'WON'          as DealStage, valueIRR:8200000000, probability:100,closingDate:'1403/02/10', ownerName:'محمد کریمی' },
  { id:'D5', title:'واردات آزمایشی',       partnerName:'گلوبال ترید',        stage:'LOST'         as DealStage, valueIRR:250000000,  probability:0,  closingDate:'1403/01/20', ownerName:'سارا احمدی' },
  { id:'D6', title:'سرنخ جدید صادرات',    partnerName:'ارمغان لجستیک',     stage:'LEAD'         as DealStage, valueIRR:500000000,  probability:20, closingDate:'1403/06/01', ownerName:'علی رضایی' },
];

// ── Stage config ───────────────────────────────────────────────
const STAGE_CFG: Record<DealStage, { fa: string; color: string; icon: string }> = {
  LEAD:        { fa:'سرنخ',          color:'#64748b', icon:'🎯' },
  QUALIFIED:   { fa:'واجد شرایط',   color:'#3b82f6', icon:'✅' },
  PROPOSAL:    { fa:'پیشنهاد',       color:'#8b5cf6', icon:'📋' },
  NEGOTIATION: { fa:'مذاکره',        color:'#f59e0b', icon:'🤝' },
  WON:         { fa:'برنده',         color:'#10b981', icon:'🏆' },
  LOST:        { fa:'از دست رفته',  color:'#ef4444', icon:'❌' },
};

const TYPE_CFG: Record<string, { fa: string; color: string }> = {
  buyer:    { fa:'خریدار',         color:'#3b82f6' },
  supplier: { fa:'تأمین‌کننده',   color:'#10b981' },
  logistics:{ fa:'حمل',            color:'#f59e0b' },
};
const STATUS_CFG: Record<string, { fa: string; color: string }> = {
  active:   { fa:'فعال',    color:'#10b981' },
  prospect: { fa:'بالقوه', color:'#f59e0b' },
  inactive: { fa:'غیرفعال',color:'#64748b' },
};

function fmtB(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(0) + 'M';
  return n.toLocaleString();
}

const inp = {
  backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
  borderRadius: RADIUS.md, padding: SPACING.sm, color: COLORS.text, fontSize: 14,
};

// ── Main screen ────────────────────────────────────────────────
export default function CRMScreen() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [tab, setTab] = useState<CRMTab>('companies');

  const TABS: { id: CRMTab; fa: string; en: string }[] = [
    { id:'companies', fa:'شرکت‌ها',  en:'Companies' },
    { id:'deals',     fa:'معاملات',  en:'Deals'     },
    { id:'search',    fa:'جستجو',    en:'Search'    },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>🏢 {fa ? 'مدیریت مشتریان' : 'CRM'}</Text>
      </View>

      {/* Tab switcher */}
      <View style={s.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id} onPress={() => setTab(t.id)}
            style={[s.tabBtn, tab === t.id && s.tabActive]}>
            <Text style={[s.tabText, tab === t.id && s.tabTextActive]}>
              {fa ? t.fa : t.en}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'companies' && <CompaniesTab fa={fa} />}
      {tab === 'deals'     && <DealsTab     fa={fa} />}
      {tab === 'search'    && <SearchTab    fa={fa} />}
    </SafeAreaView>
  );
}

// ── Companies tab ──────────────────────────────────────────────
function CompaniesTab({ fa }: { fa: boolean }) {
  const [typeFilter, setTypeFilter] = useState('all');
  const { data, isLoading, isRefetching, refetch } = useCRMConnections();

  const apiList: any[] = ((data as any)?.data ?? []).map((c: any) => {
    const partner = c.companyA ?? c.companyB ?? c;
    return { id: partner.id, name: partner.name ?? '—', type: partner.type ?? 'buyer',
      country: partner.country ?? '—', deals: 0, totalValue: 0,
      rating: partner.rating ?? 0, status: c.status ?? 'active', lastActivity: '—' };
  });
  const isMock   = apiList.length === 0 && !isLoading;
  const companies = isMock ? MOCK_COMPANIES : apiList;

  const TYPE_FILTERS = [
    { id:'all',      fa:'همه',            en:'All'      },
    { id:'buyer',    fa:'خریداران',       en:'Buyers'   },
    { id:'supplier', fa:'تأمین‌کنندگان', en:'Suppliers'},
    { id:'logistics',fa:'حمل',            en:'Logistics'},
  ];
  const displayed = typeFilter === 'all' ? companies : companies.filter((c: any) => c.type === typeFilter);

  const active   = companies.filter((c: any) => c.status === 'active').length;
  const prospect = companies.filter((c: any) => c.status === 'prospect').length;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}>

      {isMock && <View style={s.mockBanner}><Text style={s.mockText}>{fa ? '📋 داده نمونه' : '📋 Sample data'}</Text></View>}

      {/* KPIs */}
      <View style={s.stats}>
        <StatCard icon="🏢" label={fa ? 'کل'      : 'Total'}    value={companies.length} color={COLORS.primary}  />
        <StatCard icon="✅" label={fa ? 'فعال'    : 'Active'}   value={active}           color={COLORS.success}  />
        <StatCard icon="🎯" label={fa ? 'بالقوه' : 'Prospects'} value={prospect}         color={COLORS.warning}  />
      </View>

      {/* Type filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -SPACING.md }}>
        <View style={s.filters}>
          {TYPE_FILTERS.map(f => (
            <TouchableOpacity key={f.id} onPress={() => setTypeFilter(f.id)}
              style={[s.chip, typeFilter === f.id && s.chipActive]}>
              <Text style={[s.chipText, typeFilter === f.id && s.chipTextActive]}>
                {fa ? f.fa : f.en}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Company cards */}
      {isLoading && <Text style={s.empty}>⏳ {fa ? 'در حال بارگذاری...' : 'Loading...'}</Text>}
      {displayed.map((c: any) => {
        const tc = TYPE_CFG[c.type]   ?? TYPE_CFG.buyer;
        const sc = STATUS_CFG[c.status] ?? STATUS_CFG.active;
        return (
          <Card key={c.id} style={s.companyCard}>
            <View style={s.companyTop}>
              {/* Avatar */}
              <View style={[s.avatar, { backgroundColor: tc.color + '22' }]}>
                <Text style={[s.avatarText, { color: tc.color }]}>
                  {(c.name ?? '?')[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.companyName} numberOfLines={1}>{c.name}</Text>
                <View style={s.companyMeta}>
                  <View style={[s.pill, { backgroundColor: tc.color + '18' }]}>
                    <Text style={[s.pillText, { color: tc.color }]}>
                      {fa ? tc.fa : c.type}
                    </Text>
                  </View>
                  <Text style={s.metaText}>🌍 {c.country}</Text>
                  <View style={[s.pill, { backgroundColor: sc.color + '18' }]}>
                    <Text style={[s.pillText, { color: sc.color }]}>
                      {fa ? sc.fa : c.status}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            {/* Stats row */}
            <View style={s.companyStats}>
              <Text style={s.statItem}>📊 {c.deals} {fa ? 'معامله' : 'deals'}</Text>
              {c.totalValue > 0 && (
                <Text style={s.statItem}>💰 {fmtB(c.totalValue)} IRR</Text>
              )}
              {c.rating > 0 && (
                <Text style={s.statItem}>
                  {'⭐'.repeat(Math.min(c.rating, 5))} {c.rating}/5
                </Text>
              )}
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

// ── Deals tab ──────────────────────────────────────────────────
function DealsTab({ fa }: { fa: boolean }) {
  const [stageFilter, setStageFilter] = useState<'all' | DealStage>('all');
  const [showNew,     setShowNew]     = useState(false);
  const [form, setForm] = useState({ title:'', partnerName:'', valueIRR:'', probability:'50', closingDate:'', ownerName:'' });

  const { data, isLoading, isRefetching, refetch } = useDeals(
    stageFilter !== 'all' ? { stage: stageFilter } : {}
  );
  const { data: statsData } = useDealStats();
  const createDeal  = useCreateDeal();
  const updateDeal  = useUpdateDeal();

  const apiDeals: any[] = ((data as any)?.data ?? []).map((d: any) => ({
    id: String(d.id), title: d.title, partnerName: d.partnerName ?? '—',
    stage: (d.stage ?? 'LEAD') as DealStage,
    valueIRR: Number(d.valueIRR ?? 0), probability: d.probability ?? 50,
    closingDate: d.closingDate ? new Date(d.closingDate).toLocaleDateString('fa-IR') : '—',
    ownerName: d.ownerName ?? '—',
  }));
  const isMock  = apiDeals.length === 0 && !isLoading;
  const deals   = isMock ? MOCK_DEALS : apiDeals;

  const stats  = statsData as any;
  const wonVal = stats?.wonValue ?? deals.filter((d: any) => d.stage === 'WON').reduce((s: number, d: any) => s + Number(d.valueIRR), 0);
  const pipVal = stats?.pipelineValue ?? deals.filter((d: any) => !['WON','LOST'].includes(d.stage)).reduce((s: number, d: any) => s + Number(d.valueIRR) * d.probability / 100, 0);

  const STAGE_FILTERS: { id: 'all' | DealStage; fa: string; en: string }[] = [
    { id:'all',         fa:'همه',         en:'All'         },
    { id:'LEAD',        fa:'سرنخ',        en:'Lead'        },
    { id:'QUALIFIED',   fa:'واجد شرایط', en:'Qualified'   },
    { id:'PROPOSAL',    fa:'پیشنهاد',     en:'Proposal'    },
    { id:'NEGOTIATION', fa:'مذاکره',      en:'Negotiation' },
    { id:'WON',         fa:'برنده',       en:'Won'         },
    { id:'LOST',        fa:'از دست رفته',en:'Lost'        },
  ];

  const displayed = stageFilter === 'all' ? deals : deals.filter((d: any) => d.stage === stageFilter);

  async function submitDeal() {
    if (!form.title || !form.partnerName) return;
    await createDeal.mutateAsync({
      title: form.title, partnerName: form.partnerName,
      valueIRR: parseInt(form.valueIRR) || 0,
      probability: parseInt(form.probability) || 50,
      closingDate: form.closingDate || null,
      ownerName: form.ownerName, stage: 'LEAD',
    });
    setForm({ title:'', partnerName:'', valueIRR:'', probability:'50', closingDate:'', ownerName:'' });
    setShowNew(false);
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}>

      {isMock && <View style={s.mockBanner}><Text style={s.mockText}>{fa ? '📋 داده نمونه' : '📋 Sample data'}</Text></View>}

      {/* Pipeline summary */}
      <View style={s.stats}>
        <StatCard icon="🏆" label={fa ? 'ارزش برنده'   : 'Won Value'}     value={fmtB(wonVal)} color={COLORS.success} />
        <StatCard icon="🎯" label={fa ? 'ارزش احتمالی' : 'Pipeline Value'} value={fmtB(pipVal)} color={COLORS.primary} />
        <StatCard icon="📋" label={fa ? 'کل معاملات'  : 'Total Deals'}    value={deals.length} color={COLORS.secondary}/>
      </View>

      {/* New deal */}
      <View style={s.headerRow}>
        <Text style={s.sectionTitle}>📊 {fa ? 'پایپ‌لاین' : 'Pipeline'}</Text>
        <Button size="sm" onPress={() => setShowNew(p => !p)}>
          {showNew ? (fa ? 'بستن' : 'Close') : (fa ? '+ معامله' : '+ Deal')}
        </Button>
      </View>
      {showNew && (
        <Card style={s.form}>
          <Text style={s.formTitle}>{fa ? '🎯 معامله جدید' : '🎯 New Deal'}</Text>
          {[
            { key:'title',       ph: fa ? 'عنوان *' : 'Title *' },
            { key:'partnerName', ph: fa ? 'نام شریک *' : 'Partner *' },
            { key:'valueIRR',    ph: fa ? 'ارزش (ریال)' : 'Value (IRR)', num: true },
            { key:'probability', ph: fa ? 'احتمال % (0-100)' : 'Probability %', num: true },
            { key:'closingDate', ph: fa ? 'تاریخ بسته شدن (YYYY-MM-DD)' : 'Closing date' },
            { key:'ownerName',   ph: fa ? 'مسئول' : 'Owner' },
          ].map(({ key, ph, num }) => (
            <TextInput
              key={key}
              placeholder={ph}
              value={(form as any)[key]}
              onChangeText={v => setForm(f => ({ ...f, [key]: v }))}
              keyboardType={num ? 'numeric' : 'default'}
              style={inp as any}
              placeholderTextColor={COLORS.textFaint}
            />
          ))}
          <Button onPress={submitDeal} loading={createDeal.isPending} fullWidth>
            {fa ? 'ثبت معامله' : 'Save Deal'}
          </Button>
        </Card>
      )}

      {/* Stage filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -SPACING.md }}>
        <View style={s.filters}>
          {STAGE_FILTERS.map(f => {
            const sc = STAGE_CFG[f.id as DealStage];
            return (
              <TouchableOpacity key={f.id} onPress={() => setStageFilter(f.id)}
                style={[s.chip, stageFilter === f.id && { backgroundColor: sc?.color ?? COLORS.primary, borderColor: sc?.color ?? COLORS.primary }]}>
                <Text style={[s.chipText, stageFilter === f.id && { color: COLORS.white, fontWeight: '600' as any }]}>
                  {sc?.icon} {fa ? f.fa : f.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Deal list */}
      {isLoading && <Text style={s.empty}>⏳</Text>}
      {!isLoading && displayed.length === 0 && (
        <Text style={s.empty}>{fa ? 'معامله‌ای یافت نشد' : 'No deals found'}</Text>
      )}
      {displayed.map((d: any) => {
        const sc = STAGE_CFG[d.stage as DealStage] ?? STAGE_CFG.LEAD;
        return (
          <Card key={d.id} style={StyleSheet.flatten([s.dealCard, { borderLeftColor: sc.color, borderLeftWidth: 3 }]) as ViewStyle}>
            <View style={s.dealTop}>
              <Text style={s.dealTitle} numberOfLines={1}>{d.title}</Text>
              <View style={[s.pill, { backgroundColor: sc.color + '20' }]}>
                <Text style={[s.pillText, { color: sc.color }]}>{sc.icon} {fa ? sc.fa : d.stage}</Text>
              </View>
            </View>
            <Text style={s.dealPartner}>🏢 {d.partnerName}</Text>
            <View style={s.dealMeta}>
              {Number(d.valueIRR) > 0 && (
                <Text style={[s.metaText, { color: sc.color, fontWeight: '700' as any }]}>
                  {fmtB(Number(d.valueIRR))} IRR
                </Text>
              )}
              <Text style={s.metaText}>📊 {d.probability}%</Text>
              {d.closingDate !== '—' && <Text style={s.metaText}>📅 {d.closingDate}</Text>}
              {d.ownerName !== '—' && <Text style={s.metaText}>👤 {d.ownerName}</Text>}
            </View>
            {/* Probability bar */}
            <View style={s.probWrap}>
              <View style={s.probTrack}>
                <View style={[s.probFill, { width: `${d.probability}%` as any, backgroundColor: sc.color }]} />
              </View>
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

// ── Search tab ─────────────────────────────────────────────────
function SearchTab({ fa }: { fa: boolean }) {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useSearchCompanies(query);
  const results: any[] = Array.isArray(data) ? data : (data as any)?.data ?? [];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <TextInput
        placeholder={fa ? '🔍 نام شرکت یا کد ملی...' : '🔍 Company name or national ID...'}
        value={query}
        onChangeText={setQuery}
        style={[inp, { fontSize: 15, padding: SPACING.md }] as any}
        placeholderTextColor={COLORS.textFaint}
        autoFocus
      />
      {query.length > 0 && query.length < 2 && (
        <Text style={s.searchHint}>{fa ? 'حداقل ۲ کاراکتر وارد کنید' : 'Enter at least 2 characters'}</Text>
      )}
      {isLoading && <Text style={s.empty}>⏳</Text>}
      {results.map((r: any) => (
        <Card key={r.id} style={s.searchResult}>
          <View style={[s.avatar, { backgroundColor: COLORS.primary + '20', width: 36, height: 36, borderRadius: 18 }]}>
            <Text style={[s.avatarText, { color: COLORS.primary, fontSize: 16 }]}>{(r.name ?? '?')[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.companyName}>{r.name}</Text>
            {r.country && <Text style={s.metaText}>🌍 {r.country}</Text>}
          </View>
        </Card>
      ))}
      {!isLoading && query.length >= 2 && results.length === 0 && (
        <Text style={s.empty}>{fa ? 'شرکتی پیدا نشد' : 'No companies found'}</Text>
      )}
    </ScrollView>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.bg },
  header:    { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.xs },
  title:     { fontSize: 18, fontWeight: '800', color: COLORS.text },
  content:   { padding: SPACING.md, gap: SPACING.md, paddingBottom: 80 },

  tabRow: { flexDirection: 'row', marginHorizontal: SPACING.md, marginBottom: SPACING.sm,
    backgroundColor: COLORS.bgMuted, borderRadius: RADIUS.lg, padding: 3 },
  tabBtn:       { flex: 1, paddingVertical: 8, borderRadius: RADIUS.md, alignItems: 'center' },
  tabActive:    { backgroundColor: COLORS.bgCard, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText:      { fontSize: 13, color: COLORS.textFaint, fontWeight: '500' },
  tabTextActive:{ color: COLORS.text, fontWeight: '700' },

  mockBanner: { backgroundColor: COLORS.warning + '15', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.warning + '40', padding: SPACING.sm },
  mockText:   { fontSize: 12, color: COLORS.warning, textAlign: 'center' },

  stats:   { flexDirection: 'row', gap: SPACING.xs },
  filters: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.md },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border },
  chipActive:     { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:       { fontSize: 12, color: COLORS.textMuted },
  chipTextActive: { color: COLORS.white, fontWeight: '600' },

  // Company card
  companyCard:  { gap: SPACING.xs, padding: SPACING.md },
  companyTop:   { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start' },
  avatar:       { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { fontSize: 20, fontWeight: '800' },
  companyName:  { fontSize: 15, fontWeight: '700', color: COLORS.text },
  companyMeta:  { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 2 },
  pill:         { paddingHorizontal: 7, paddingVertical: 2, borderRadius: RADIUS.full },
  pillText:     { fontSize: 10, fontWeight: '700' },
  companyStats: { flexDirection: 'row', gap: SPACING.md, flexWrap: 'wrap' },
  statItem:     { fontSize: 12, color: COLORS.textMuted },
  metaText:     { fontSize: 12, color: COLORS.textMuted },

  // Deal card
  headerRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  form:         { gap: SPACING.sm },
  formTitle:    { fontSize: 14, fontWeight: '700', color: COLORS.text },
  dealCard:     { gap: SPACING.xs, padding: SPACING.md },
  dealTop:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dealTitle:    { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.text, marginRight: 8 },
  dealPartner:  { fontSize: 12, color: COLORS.textMuted },
  dealMeta:     { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  probWrap:     { marginTop: 2 },
  probTrack:    { height: 4, borderRadius: 2, backgroundColor: COLORS.bgMuted, overflow: 'hidden' },
  probFill:     { height: '100%', borderRadius: 2 },

  // Search
  searchHint:   { textAlign: 'center', color: COLORS.textFaint, fontSize: 13, padding: SPACING.md },
  searchResult: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md },

  empty: { textAlign: 'center', color: COLORS.textFaint, fontSize: 14, padding: SPACING.xl },
});
