import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, textStyles } from '../theme';

export const BackButton: React.FC<{
  onPress: () => void;
  label?: string;
  style?: ViewStyle;
}> = ({ onPress, label = 'Retour', style }) => {
  return (
    <Pressable onPress={onPress} style={[styles.backButton, style]}>
      <Ionicons name="arrow-back" size={18} color={colors.primaryDark} />
      <Text style={styles.backLabel}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  backLabel: {
    ...textStyles.caption,
    color: colors.primaryDark,
  },
});
