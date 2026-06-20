import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { COLORS } from '@/constants/theme';

interface Props { message?: string }

export function LoadingOverlay({ message }: Props) {
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {message && <Text style={styles.msg}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.bg + 'cc',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 999,
  },
  msg: { color: COLORS.textMuted, fontSize: 14 },
});
