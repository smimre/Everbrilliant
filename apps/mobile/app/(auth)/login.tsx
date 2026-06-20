import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, Image, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth.store';
import { useLocaleStore } from '@/store/locale.store';
import { Button } from '@/components/ui/Button';
import { Input  } from '@/components/ui/Input';
import { COLORS, SPACING, RADIUS } from '@/constants/theme';

const LABELS: Record<string, Record<string, string>> = {
  title:       { fa: 'ورود به حساب',       en: 'Sign in to your account' },
  subtitle:    { fa: 'پلتفرم تجاری ایورتریدینگ', en: 'Everbrilliant ERP Platform' },
  phone:       { fa: 'شماره موبایل',         en: 'Phone number' },
  password:    { fa: 'رمز عبور',             en: 'Password' },
  login:       { fa: 'ورود',                 en: 'Sign in' },
  register:    { fa: 'ثبت‌نام',              en: 'Register' },
  noAccount:   { fa: 'حساب ندارید؟',         en: "Don't have an account?" },
  phonePH:     { fa: '09xxxxxxxxx',           en: '09xxxxxxxxx' },
  passwordPH:  { fa: 'رمز عبور',             en: 'Password' },
};

export default function LoginScreen() {
  const { lang, isRTL } = useLocaleStore();
  const { login, isLoading, error, clearError } = useAuthStore();
  const l = (k: string) => LABELS[k]?.[lang] ?? LABELS[k]?.en ?? k;

  const [phone, setPhone]     = useState('');
  const [password, setPass]   = useState('');
  const [fieldErr, setFieldErr] = useState({ phone: '', password: '' });

  function validate() {
    const e = { phone: '', password: '' };
    if (!phone.match(/^09\d{9}$/)) e.phone = lang === 'fa' ? 'شماره معتبر وارد کنید' : 'Enter a valid phone';
    if (password.length < 6)       e.password = lang === 'fa' ? 'رمز حداقل ۶ کاراکتر' : 'Min 6 characters';
    setFieldErr(e);
    return !e.phone && !e.password;
  }

  async function handleLogin() {
    clearError();
    if (!validate()) return;
    try {
      await login(phone, password);
      router.replace('/(tabs)/dashboard');
    } catch {
      // error handled in store
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">

          {/* Logo + header */}
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>EB</Text>
            </View>
            <Text style={[styles.title, isRTL && styles.rtl]}>{l('title')}</Text>
            <Text style={[styles.subtitle, isRTL && styles.rtl]}>{l('subtitle')}</Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            {/* API error */}
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠️ {error}</Text>
              </View>
            )}

            <Input
              label={l('phone')}
              placeholder={l('phonePH')}
              value={phone}
              onChangeText={t => { setPhone(t); clearError(); }}
              keyboardType="phone-pad"
              autoComplete="tel"
              error={fieldErr.phone}
              rtl={isRTL}
            />

            <Input
              label={l('password')}
              placeholder={l('passwordPH')}
              value={password}
              onChangeText={t => { setPass(t); clearError(); }}
              isPassword
              error={fieldErr.password}
              rtl={isRTL}
              style={{ marginTop: SPACING.sm }}
            />

            <Button
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              style={{ marginTop: SPACING.lg }}>
              {l('login')}
            </Button>

            {/* Register link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>{l('noAccount')} </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.registerLink}>{l('register')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lang switcher */}
          <LangSwitcher />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function LangSwitcher() {
  const { lang, setLang } = useLocaleStore();
  const LANGS: { id: 'fa' | 'en' | 'ar'; label: string }[] = [
    { id: 'fa', label: 'فارسی' },
    { id: 'en', label: 'English' },
    { id: 'ar', label: 'العربية' },
  ];
  return (
    <View style={ls.row}>
      {LANGS.map(({ id, label }) => (
        <TouchableOpacity key={id} onPress={() => setLang(id)} style={[ls.btn, lang === id && ls.active]}>
          <Text style={[ls.text, lang === id && ls.activeText]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const ls = StyleSheet.create({
  row:        { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: SPACING.lg },
  btn:        { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border },
  active:     { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  text:       { fontSize: 12, color: COLORS.textMuted },
  activeText: { color: COLORS.white, fontWeight: '600' },
});

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: SPACING.lg, gap: SPACING.lg },

  header: { alignItems: 'center', gap: SPACING.sm },
  logoBox: {
    width: 72, height: 72, borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  logoText:  { color: COLORS.white, fontSize: 28, fontWeight: '900' },
  title:     { fontSize: 22, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  subtitle:  { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
  rtl:       { textAlign: 'right', writingDirection: 'rtl' },

  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },

  errorBanner: {
    backgroundColor: COLORS.danger + '20',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.danger + '40',
  },
  errorBannerText: { color: COLORS.danger, fontSize: 13, textAlign: 'center' },

  registerRow:  { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.md },
  registerText: { color: COLORS.textMuted, fontSize: 14 },
  registerLink: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});
