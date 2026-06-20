import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocaleStore } from '@/store/locale.store';
import { useBalanceSheet, useIncomeStatement, useInvoices } from '@/hooks/use-finance';
import { Card, StatCard } from '@/components/ui';
import { COLORS, SPACING } from '@/constants/theme';

export default function FinanceScreen() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';

  const { data: bs,  isRefetching: bsRef,  refetch: bsRefetch  } = useBalanceSheet();
  const { data: is_,  isRefetching: isRef,  refetch: isRefetch  } = useIncomeStatement();
  const { data: inv, isRefetching: invRef, refetch: invRefetch } = useInvoices();

  const bsData  = bs  as any;
  const isData  = is_ as any;
  const invoices: any[] = (inv as any)?.data ?? [];

  const fmtM = (v: string | number | undefined) =>
    v ? (Number(v) / 1_000_000).toFixed(0) + 'M' : '—';

  const refreshing = bsRef || isRef || invRef;
  function onRefresh() { bsRefetch(); isRefetch(); invRefetch(); }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}>

        <Text style={styles.pageTitle}>💰 {fa ? 'گزارشات مالی' : 'Finance Reports'}</Text>

        {/* Balance sheet summary */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>📊 {fa ? 'ترازنامه' : 'Balance Sheet'}</Text>
          {bsData?.isBalanced && (
            <Text style={styles.balanced}>✅ {fa ? 'ترازنامه متعادل است' : 'Balanced'}</Text>
          )}
          <View style={styles.statRow}>
            <StatCard icon="🏛️" label={fa ? 'دارایی‌ها' : 'Assets'}
              value={fmtM(bsData?.totalAssets)} color={COLORS.primary} />
            <StatCard icon="📤" label={fa ? 'بدهی‌ها' : 'Liabilities'}
              value={fmtM(bsData?.totalLiabilities)} color={COLORS.danger} />
            <StatCard icon="⚖️" label={fa ? 'حقوق' : 'Equity'}
              value={fmtM(bsData?.totalEquity)} color={COLORS.secondary} />
          </View>
          {bsData?.assets?.length > 0 && (
            <View style={styles.accountList}>
              {bsData.assets.slice(0, 4).map((a: any) => (
                <View key={a.code} style={styles.accountRow}>
                  <Text style={styles.accountCode}>{a.code}</Text>
                  <Text style={styles.accountName} numberOfLines={1}>{fa ? a.nameFa : a.name}</Text>
                  <Text style={styles.accountBal}>{fmtM(a.balance)}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Income statement summary */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>📈 {fa ? 'سود و زیان' : 'Income Statement'}</Text>
          <View style={styles.statRow}>
            <StatCard icon="📈" label={fa ? 'درآمد' : 'Revenue'}
              value={fmtM(isData?.totalRevenue)} color={COLORS.success} />
            <StatCard icon="📉" label={fa ? 'هزینه' : 'Expenses'}
              value={fmtM(isData?.totalExpenses)} color={COLORS.warning} />
            <StatCard icon="🏆" label={fa ? 'سود خالص' : 'Net Profit'}
              value={fmtM(isData?.netProfit)}
              color={Number(isData?.netProfit ?? 0) >= 0 ? COLORS.success : COLORS.danger} />
          </View>
        </Card>

        {/* Recent invoices */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>🧾 {fa ? 'آخرین فاکتورها' : 'Recent Invoices'}</Text>
          {invoices.slice(0, 6).length === 0
            ? <Text style={styles.empty}>{fa ? 'فاکتوری نیست' : 'No invoices'}</Text>
            : invoices.slice(0, 6).map((inv: any) => (
              <View key={inv.id} style={styles.invRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.invId} numberOfLines={1}>{inv.id}</Text>
                  <Text style={styles.invDate}>{inv.issuedAt}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.invTotal}>{fmtM(inv.total)} IRR</Text>
                  <Text style={[styles.invStatus, {
                    color: inv.status === 'PAID' ? COLORS.success : COLORS.warning,
                  }]}>{inv.status}</Text>
                </View>
              </View>
            ))
          }
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md, gap: SPACING.md, paddingBottom: SPACING.xxl },

  pageTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  card:      { gap: SPACING.sm },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  balanced:  { fontSize: 12, color: COLORS.success },
  statRow:   { flexDirection: 'row', gap: SPACING.sm },

  accountList: { marginTop: 4, gap: 2 },
  accountRow:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: 4 },
  accountCode: { fontFamily: 'monospace', fontSize: 11, color: COLORS.primary, width: 40 },
  accountName: { flex: 1, fontSize: 12, color: COLORS.textMuted },
  accountBal:  { fontSize: 12, fontWeight: '600', color: COLORS.text },

  invRow:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: 6, borderTopWidth: 1, borderTopColor: COLORS.border },
  invId:     { fontSize: 13, fontWeight: '600', color: COLORS.text },
  invDate:   { fontSize: 11, color: COLORS.textFaint },
  invTotal:  { fontSize: 13, fontWeight: '700', color: COLORS.text },
  invStatus: { fontSize: 10, fontWeight: '700' },

  empty: { color: COLORS.textFaint, fontSize: 13, textAlign: 'center', padding: SPACING.md },
});
