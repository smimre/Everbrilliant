import { ScrollView, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore }   from '@/store/auth.store';
import { useLocaleStore } from '@/store/locale.store';
import { useRequests }    from '@/hooks/use-trading';
import { useInvoices }    from '@/hooks/use-finance';
import { StatCard, Card } from '@/components/ui';
import { COLORS, SPACING, RADIUS } from '@/constants/theme';

export default function DashboardScreen() {
  const { user }  = useAuthStore();
  const { lang }  = useLocaleStore();
  const fa = lang === 'fa';

  const { data: reqData, isRefetching: rRef, refetch: rRefetch }  = useRequests({ page: 1 });
  const { data: invData, isRefetching: iRef, refetch: iRefetch }  = useInvoices({ page: 1 });

  const requests  = (reqData as any)?.data ?? [];
  const invoices  = (invData as any)?.data ?? [];
  const pending   = requests.filter((r: any) => r.status === 'PENDING').length;
  const approved  = requests.filter((r: any) => r.status === 'APPROVED').length;
  const paidInv   = invoices.filter((i: any) => i.status === 'PAID').length;

  const greeting = fa
    ? `سلام، ${user?.name ?? 'کاربر'} 👋`
    : `Hello, ${user?.name ?? 'User'} 👋`;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={rRef || iRef}
            onRefresh={() => { rRefetch(); iRefetch(); }}
            tintColor={COLORS.primary}
          />
        }>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetText}>{greeting}</Text>
          <Text style={styles.greetSub}>
            {fa ? 'اینجا خلاصه فعالیت‌های شما است' : 'Here is your activity summary'}
          </Text>
        </View>

        {/* KPI stats */}
        <View style={styles.stats}>
          <StatCard icon="📋" label={fa ? 'در انتظار' : 'Pending'}  value={pending}  color={COLORS.warning}  />
          <StatCard icon="✅" label={fa ? 'تایید شده' : 'Approved'} value={approved} color={COLORS.success}  />
          <StatCard icon="🧾" label={fa ? 'پرداخت شده' : 'Paid'}   value={paidInv}  color={COLORS.primary}  />
        </View>

        {/* Recent requests */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>
            {fa ? '📋 آخرین درخواست‌ها' : '📋 Recent Requests'}
          </Text>
          {requests.slice(0, 5).length === 0 ? (
            <Text style={styles.empty}>{fa ? 'درخواستی وجود ندارد' : 'No requests yet'}</Text>
          ) : (
            requests.slice(0, 5).map((r: any) => (
              <View key={r.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{r.product}</Text>
                  <Text style={styles.rowSub}>{r.qty} {r.unit}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: STATUS_BG[r.status] ?? COLORS.bgMuted }]}>
                  <Text style={[styles.statusText, { color: STATUS_FG[r.status] ?? COLORS.textMuted }]}>
                    {r.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>

        {/* Recent invoices */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>
            {fa ? '🧾 آخرین فاکتورها' : '🧾 Recent Invoices'}
          </Text>
          {invoices.slice(0, 5).length === 0 ? (
            <Text style={styles.empty}>{fa ? 'فاکتوری وجود ندارد' : 'No invoices yet'}</Text>
          ) : (
            invoices.slice(0, 5).map((inv: any) => (
              <View key={inv.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{inv.id}</Text>
                  <Text style={styles.rowSub}>{inv.issuedAt}</Text>
                </View>
                <Text style={[styles.amount, { color: COLORS.success }]}>
                  {(Number(inv.total) / 1_000_000).toFixed(1)}M
                </Text>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const STATUS_BG: Record<string, string> = {
  PENDING:   COLORS.warning + '20',
  APPROVED:  COLORS.success + '20',
  REJECTED:  COLORS.danger  + '20',
  PAID:      COLORS.primary + '20',
  COMPLETED: COLORS.success + '20',
};
const STATUS_FG: Record<string, string> = {
  PENDING:   COLORS.warning,
  APPROVED:  COLORS.success,
  REJECTED:  COLORS.danger,
  PAID:      COLORS.primary,
  COMPLETED: COLORS.success,
};

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg },
  scroll:  { flex: 1 },
  content: { padding: SPACING.md, gap: SPACING.md, paddingBottom: SPACING.xxl },

  greeting: { gap: 4 },
  greetText: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  greetSub:  { fontSize: 13, color: COLORS.textMuted },

  stats: { flexDirection: 'row', gap: SPACING.sm },

  card: { gap: SPACING.sm },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 4 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  rowTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  rowSub:   { fontSize: 12, color: COLORS.textMuted },
  amount:   { fontSize: 14, fontWeight: '700' },

  statusPill: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  empty: { color: COLORS.textFaint, fontSize: 13, textAlign: 'center', padding: SPACING.md },
});
