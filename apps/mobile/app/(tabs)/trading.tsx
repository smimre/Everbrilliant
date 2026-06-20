import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocaleStore } from '@/store/locale.store';
import { useRequests, useCreateRequest } from '@/hooks/use-trading';
import { Button, Card } from '@/components/ui';
import { COLORS, SPACING, RADIUS } from '@/constants/theme';

const STATUS_COLOR: Record<string, string> = {
  PENDING: COLORS.warning, APPROVED: COLORS.success,
  REJECTED: COLORS.danger, PAID: COLORS.primary, COMPLETED: COLORS.success,
};

export default function TradingScreen() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';
  const [filter, setFilter]   = useState('all');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ product: '', qty: '', unit: 'Ton', currency: 'USD' });

  const { data, isLoading, isRefetching, refetch } = useRequests(
    filter !== 'all' ? { status: filter } : {}
  );
  const createReq = useCreateRequest();
  const requests: any[] = (data as any)?.data ?? [];

  const FILTERS = [
    { id: 'all', label: fa ? 'همه' : 'All' },
    { id: 'PENDING', label: fa ? 'در انتظار' : 'Pending' },
    { id: 'APPROVED', label: fa ? 'تایید' : 'Approved' },
    { id: 'PAID', label: fa ? 'پرداخت' : 'Paid' },
  ];

  async function submitRequest() {
    if (!form.product || !form.qty) return;
    await createReq.mutateAsync({ product: form.product, qty: parseFloat(form.qty), unit: form.unit, currency: form.currency });
    setForm({ product: '', qty: '', unit: 'Ton', currency: 'USD' });
    setShowNew(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}>

        <View style={styles.headerRow}>
          <Text style={styles.title}>🛒 {fa ? 'درخواست‌ها' : 'Trade Requests'}</Text>
          <Button size="sm" onPress={() => setShowNew(s => !s)}>
            {showNew ? (fa ? 'بستن' : 'Close') : (fa ? '+ جدید' : '+ New')}
          </Button>
        </View>

        {/* New request form */}
        {showNew && (
          <Card style={styles.newCard}>
            <Text style={styles.cardTitle}>{fa ? 'درخواست جدید' : 'New Request'}</Text>
            <TextInput
              placeholder={fa ? 'نام کالا *' : 'Product name *'}
              value={form.product}
              onChangeText={v => setForm(f => ({ ...f, product: v }))}
              style={styles.textInput}
              placeholderTextColor={COLORS.textFaint}
            />
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              <TextInput
                placeholder={fa ? 'مقدار *' : 'Qty *'}
                value={form.qty}
                onChangeText={v => setForm(f => ({ ...f, qty: v }))}
                keyboardType="numeric"
                style={[styles.textInput, { flex: 1 }]}
                placeholderTextColor={COLORS.textFaint}
              />
              <TextInput
                placeholder="Unit"
                value={form.unit}
                onChangeText={v => setForm(f => ({ ...f, unit: v }))}
                style={[styles.textInput, { flex: 1 }]}
                placeholderTextColor={COLORS.textFaint}
              />
            </View>
            <Button onPress={submitRequest} loading={createReq.isPending} fullWidth>
              {fa ? 'ارسال' : 'Submit'}
            </Button>
          </Card>
        )}

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -SPACING.md }}>
          <View style={styles.filters}>
            {FILTERS.map(f => (
              <TouchableOpacity key={f.id} onPress={() => setFilter(f.id)}
                style={[styles.filterBtn, filter === f.id && styles.filterActive]}>
                <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* List */}
        {isLoading && <Text style={styles.empty}>⏳ {fa ? 'در حال بارگذاری...' : 'Loading...'}</Text>}
        {!isLoading && requests.length === 0 && (
          <Text style={styles.empty}>{fa ? 'درخواستی پیدا نشد' : 'No requests found'}</Text>
        )}
        {requests.map((r: any) => (
          <Card key={r.id} style={styles.reqCard}>
            <View style={styles.reqHeader}>
              <Text style={styles.reqProduct} numberOfLines={1}>{r.product}</Text>
              <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLOR[r.status] ?? COLORS.textFaint) + '20' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLOR[r.status] ?? COLORS.textFaint }]}>
                  {r.status}
                </Text>
              </View>
            </View>
            <View style={styles.reqMeta}>
              <Text style={styles.metaText}>📦 {r.qty} {r.unit}</Text>
              {r.buyerCompany && <Text style={styles.metaText}>🏢 {r.buyerCompany.name}</Text>}
              {r.deadline && <Text style={styles.metaText}>📅 {new Date(r.deadline).toLocaleDateString('fa-IR')}</Text>}
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg },
  scroll:  { flex: 1 },
  content: { padding: SPACING.md, gap: SPACING.md, paddingBottom: SPACING.xxl },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title:     { fontSize: 18, fontWeight: '800', color: COLORS.text },

  newCard:   { gap: SPACING.sm },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  textInput: {
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, padding: SPACING.sm, color: COLORS.text, fontSize: 14,
  },

  filters: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.md },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
  },
  filterActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText:   { fontSize: 13, color: COLORS.textMuted },
  filterTextActive: { color: COLORS.white, fontWeight: '600' },

  reqCard:    { gap: SPACING.xs },
  reqHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reqProduct: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.text, marginRight: 8 },
  statusBadge:{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  statusText: { fontSize: 10, fontWeight: '700' },
  reqMeta:    { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  metaText:   { fontSize: 12, color: COLORS.textMuted },

  empty: { textAlign: 'center', color: COLORS.textFaint, fontSize: 14, padding: SPACING.xl },
});
