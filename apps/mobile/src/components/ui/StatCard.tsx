import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

interface Props {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
}

export function StatCard({ icon, label, value, color = COLORS.primary, sub }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {sub && <Text style={styles.sub}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
  },
  icon:  { fontSize: 24 },
  value: { fontSize: 22, fontWeight: '800' },
  label: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },
  sub:   { fontSize: 10, color: COLORS.textFaint },
});
