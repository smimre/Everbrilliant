import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth.store';
import { useLocaleStore } from '@/store/locale.store';
import { Button } from '@/components/ui/Button';
import { Input  } from '@/components/ui/Input';
import { COLORS, SPACING, RADIUS } from '@/constants/theme';
import { api } from '@/api/client';

export default function RegisterScreen() {
  const { lang, isRTL } = useLocaleStore();
  const { setAuth } = useAuthStore();
  const fa = lang === 'fa';

  const [form, setForm] = useState({
    name: '', phone: '', password: '', companyName: '',
  });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim())             e.name        = fa ? 'نام الزامی است'                  : 'Name is required';
    if (!form.phone.match(/^09\d{9}$/)) e.phone      = fa ? 'شماره معتبر وارد کنید'           : 'Enter a valid phone';
    if (form.password.length < 8)       e.password   = fa ? 'رمز حداقل ۸ کاراکتر'            : 'Min 8 characters';
    if (!form.companyName.trim())       e.companyName = fa ? 'نام شرکت الزامی است'            : 'Company name required';
    setFieldErr(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true); setError('');
    try {
      const res = await api.post<{ accessToken: string; user: any }>('/auth/register', {
        name: form.name, phone: form.phone, password: form.password,
        companyName: form.companyName,
      });
      await setAuth(res.user, res.accessToken);
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? (fa ? 'خطا در ثبت‌نام' : 'Registration failed');
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <View style={styles.header}>
            <Text style={[styles.title, isRTL && { textAlign: 'right' }]}>
              {fa ? '🏢 ثبت‌نام شرکت' : '🏢 Company Registration'}
            </Text>
            <Text style={[styles.subtitle, isRTL && { textAlign: 'right' }]}>
              {fa ? 'اطلاعات خود را برای ساخت حساب وارد کنید' : 'Enter your details to create an account'}
            </Text>
          </View>

          <View style={styles.card}>
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            <Input label={fa ? 'نام کامل *' : 'Full Name *'} placeholder={fa ? 'علی رضایی' : 'Ali Rezaei'}
              value={form.name} onChangeText={v => set('name', v)} error={fieldErr.name} rtl={isRTL} />
            <Input label={fa ? 'شماره موبایل *' : 'Phone *'} placeholder="09xxxxxxxxx"
              value={form.phone} onChangeText={v => set('phone', v)} keyboardType="phone-pad"
              error={fieldErr.phone} rtl={isRTL} />
            <Input label={fa ? 'نام شرکت *' : 'Company Name *'} placeholder={fa ? 'شرکت نمونه' : 'Example Co.'}
              value={form.companyName} onChangeText={v => set('companyName', v)} error={fieldErr.companyName} rtl={isRTL} />
            <Input label={fa ? 'رمز عبور *' : 'Password *'} value={form.password}
              onChangeText={v => set('password', v)} isPassword error={fieldErr.password} rtl={isRTL} />

            <Button onPress={handleRegister} loading={loading} fullWidth style={{ marginTop: SPACING.sm }}>
              {fa ? 'ایجاد حساب' : 'Create Account'}
            </Button>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>{fa ? 'حساب دارید؟ ' : 'Have an account? '}</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>{fa ? 'ورود' : 'Sign in'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: COLORS.bg },
  scroll:      { flexGrow: 1, justifyContent: 'center', padding: SPACING.lg, gap: SPACING.lg },
  header:      { gap: 6 },
  title:       { fontSize: 22, fontWeight: '800', color: COLORS.text },
  subtitle:    { fontSize: 14, color: COLORS.textMuted },
  card: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border, padding: SPACING.lg, gap: SPACING.sm,
  },
  errorBanner: {
    backgroundColor: COLORS.danger + '20', borderRadius: RADIUS.md,
    padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.danger + '40',
  },
  errorText:   { color: COLORS.danger, fontSize: 13, textAlign: 'center' },
  loginRow:    { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.md },
  loginText:   { color: COLORS.textMuted, fontSize: 14 },
  loginLink:   { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});
