import React, { useState } from 'react';
import {
  View, TextInput, Text, TouchableOpacity,
  StyleSheet, TextInputProps, ViewStyle,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
  rtl?: boolean;
}

export function Input({ label, error, containerStyle, isPassword, rtl = false, ...props }: Props) {
  const [show, setShow] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrap, error && styles.inputError]}>
        <TextInput
          style={[styles.input, rtl && styles.rtl]}
          placeholderTextColor={COLORS.textFaint}
          secureTextEntry={isPassword && !show}
          textAlign={rtl ? 'right' : 'left'}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShow(s => !s)} style={styles.eyeBtn}>
            <Text style={styles.eye}>{show ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  inputError: { borderColor: COLORS.danger },
  input: {
    flex: 1,
    height: 48,
    color: COLORS.text,
    fontSize: 15,
  },
  rtl: { textAlign: 'right' },
  eyeBtn: { padding: 6 },
  eye: { fontSize: 18 },
  errorText: { fontSize: 12, color: COLORS.danger },
});
