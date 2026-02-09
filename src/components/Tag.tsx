import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

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
    backgroundColor: '#E6F3F6',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  success: {
    backgroundColor: '#DDF3EA',
  },
  warning: {
    backgroundColor: '#FFF0D4',
  },
  danger: {
    backgroundColor: '#F9D6D1',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
  },
});
