import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, textStyles } from '../theme';

type ButtonTone = 'primary' | 'danger' | 'accent';

const toneToLabelColor = (tone: ButtonTone) => {
  if (tone === 'danger') {
    return colors.danger;
  }
  if (tone === 'accent') {
    return colors.accent;
  }
  return colors.primaryDark;
};

export const PrimaryButton: React.FC<{
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  tone?: ButtonTone;
}> = ({ label, onPress, style, disabled, tone = 'primary' }) => {
  const labelColor = toneToLabelColor(tone);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.buttonOuter,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabledOuter,
        style,
      ]}
    >
      <View style={styles.button}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      </View>
    </Pressable>
  );
};

export const GhostButton: React.FC<{
  label: string;
  onPress: () => void;
}> = ({ label, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.ghost, pressed && styles.ghostPressed]}
    >
      <Text style={styles.ghostLabel}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonOuter: {
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  button: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  disabledOuter: {
    opacity: 0.7,
  },
  label: {
    ...textStyles.bodyBold,
    fontSize: 16,
    letterSpacing: 0.6,
  },
  ghost: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  ghostPressed: {
    opacity: 0.85,
  },
  ghostLabel: {
    ...textStyles.bodyBold,
    color: colors.primary,
    fontSize: 13,
  },
});
