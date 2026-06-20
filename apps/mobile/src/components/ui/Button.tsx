import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

interface Props {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  onPress, children, variant = 'primary', size = 'md',
  loading = false, disabled = false, style, textStyle, fullWidth = false,
}: Props) {
  const bg = {
    primary:   COLORS.primary,
    secondary: COLORS.bgMuted,
    ghost:     'transparent',
    danger:    COLORS.danger,
  }[variant];

  const color = variant === 'ghost' ? COLORS.primary : COLORS.white;

  const pad = { sm: SPACING.sm, md: SPACING.md, lg: SPACING.lg }[size];
  const fs  = { sm: 13, md: 15, lg: 17 }[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.base,
        { backgroundColor: bg, paddingVertical: pad * 0.65, paddingHorizontal: pad },
        variant === 'ghost' && styles.ghost,
        disabled && styles.disabled,
        fullWidth && { width: '100%' },
        style,
      ]}>
      {loading
        ? <ActivityIndicator color={color} size="small" />
        : <Text style={[styles.text, { color, fontSize: fs }, textStyle]}>{children}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  ghost: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
