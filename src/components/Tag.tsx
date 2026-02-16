import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, textStyles } from '../theme';

export const Tag: React.FC<{
  label: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}> = ({ label, tone = 'neutral' }) => {
  return (
    <View
      style={[
        styles.tag,
        tone === 'success' && styles.success,
        tone === 'warning' && styles.warning,
        tone === 'danger' && styles.danger,
      ]}
    >
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  success: {
    borderColor: colors.success,
  },
  warning: {
    borderColor: '#C59430',
  },
  danger: {
    borderColor: colors.danger,
  },
  text: {
    ...textStyles.bodyBold,
    fontSize: 11,
    color: colors.primaryDark,
    letterSpacing: 0.2,
  },
});
