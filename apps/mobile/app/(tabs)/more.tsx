import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore }   from '@/store/auth.store';
import { useLocaleStore } from '@/store/locale.store';
import { Card } from '@/components/ui';
import { COLORS, SPACING, RADIUS } from '@/constants/theme';

interface MenuItem {
  icon: string; label: string; labelFa: string;
  onPress: () => void; color?: string; danger?: boolean;
}

export default function MoreScreen() {
  const { user, logout }    = useAuthStore();
  const { lang, setLang }   = useLocaleStore();
  const fa = lang === 'fa';

  function confirmLogout() {
    Alert.alert(
      fa ? 'خروج' : 'Sign out',
      fa ? 'آیا می‌خواهید خارج شوید؟' : 'Are you sure you want to sign out?',
      [
        { text: fa ? 'انصراف' : 'Cancel', style: 'cancel' },
        { text: fa ? 'خروج' : 'Sign out', style: 'destructive', onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        }},
      ]
    );
  }

  const MENU: MenuItem[] = [
    { icon: '🚢', label: 'Logistics',     labelFa: 'لجستیک',     onPress: () => router.push('/(tabs)/logistics' as any) },
    { icon: '🤖', label: 'Automation',    labelFa: 'اتوماسیون',  onPress: () => Alert.alert('Automation', 'Coming soon in Phase 3') },
    { icon: '🏢', label: 'CRM',           labelFa: 'مشتریان',    onPress: () => Alert.alert('CRM', 'Coming soon in Phase 3') },
    { icon: '🔗', label: 'Connections',   labelFa: 'اتصالات',    onPress: () => Alert.alert('Connections', 'Coming soon in Phase 3') },
    { icon: '⚙️', label: 'Settings',     labelFa: 'تنظیمات',    onPress: () => Alert.alert('Settings', 'Coming soon in Phase 3') },
    { icon: '🔴', label: 'Sign out',      labelFa: 'خروج',        onPress: confirmLogout, danger: true },
  ];

  const LANGS: { id: 'fa' | 'en' | 'ar'; label: string }[] = [
    { id: 'fa', label: 'فارسی' },
    { id: 'en', label: 'English' },
    { id: 'ar', label: 'العربية' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* User card */}
        <Card style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name ?? 'U')[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.name ?? '—'}</Text>
            <Text style={styles.userPhone}>{user?.phone ?? '—'}</Text>
          </View>
          <View style={styles.adminBadge}>
            <Text style={styles.adminText}>{user?.isCompanyAdmin ? (fa ? 'ادمین' : 'Admin') : (fa ? 'کاربر' : 'User')}</Text>
          </View>
        </Card>

        {/* Language switcher */}
        <Card style={styles.langCard}>
          <Text style={styles.sectionLabel}>{fa ? 'زبان' : 'Language'}</Text>
          <View style={styles.langRow}>
            {LANGS.map(({ id, label }) => (
              <TouchableOpacity key={id} onPress={() => setLang(id)}
                style={[styles.langBtn, lang === id && styles.langActive]}>
                <Text style={[styles.langText, lang === id && styles.langTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Menu items */}
        <Card>
          {MENU.map((item, i) => (
            <TouchableOpacity key={i} onPress={item.onPress}
              style={[styles.menuItem, i > 0 && { borderTopWidth: 1, borderTopColor: COLORS.border }]}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[styles.menuLabel, item.danger && { color: COLORS.danger }]}>
                {fa ? item.labelFa : item.label}
              </Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </Card>

        <Text style={styles.version}>Everbrilliant v1.0.0 · Mobile</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md, gap: SPACING.md, paddingBottom: SPACING.xxl },

  userCard:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  avatar:      { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontSize: 22, fontWeight: '800', color: COLORS.white },
  userName:    { fontSize: 16, fontWeight: '700', color: COLORS.text },
  userPhone:   { fontSize: 13, color: COLORS.textMuted },
  adminBadge:  { backgroundColor: COLORS.primary + '20', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
  adminText:   { fontSize: 12, color: COLORS.primary, fontWeight: '600' },

  langCard:    { gap: SPACING.sm },
  sectionLabel:{ fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  langRow:     { flexDirection: 'row', gap: SPACING.sm },
  langBtn:     { flex: 1, paddingVertical: 8, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  langActive:  { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  langText:    { fontSize: 13, color: COLORS.textMuted },
  langTextActive: { color: COLORS.white, fontWeight: '600' },

  menuItem:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.md },
  menuIcon:    { fontSize: 20, width: 28 },
  menuLabel:   { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500' },
  menuChevron: { fontSize: 20, color: COLORS.textFaint },

  version:     { textAlign: 'center', color: COLORS.textFaint, fontSize: 12 },
});
