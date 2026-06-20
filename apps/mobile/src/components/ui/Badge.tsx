import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '@/constants/theme';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';

const BG: Record<Variant, string> = {
  default:   COLORS.primary  + '20',
  success:   COLORS.success  + '20',
  warning:   COLORS.warning  + '20',
  danger:    COLORS.danger   + '20',
  info:      COLORS.info     + '20',
  secondary: COLORS.bgMuted,
};
const FG: Record<Variant, string> = {
  default:   COLORS.primary,
  success:   COLORS.success,
  warning:   COLORS.warning,
  danger:    COLORS.danger,
  info:      COLORS.info,
  secondary: COLORS.textMuted,
};

interface Props {
  variant?: Variant;
  children: React.ReactNode;
}

export function Badge({ variant = 'default', children }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: BG[variant] }]}>
      <Text style={[styles.text, { color: FG[variant] }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '600' },
});
