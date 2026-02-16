import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, textStyles } from '../theme';

export const PortSuggestions: React.FC<{
  query: string;
  ports: string[];
  onSelect: (port: string) => void;
  label?: string;
}> = ({ query, ports, onSelect, label = 'Ports suggérés' }) => {
  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = normalized
      ? ports.filter((port) => port.toLowerCase().includes(normalized))
      : ports;
    return filtered.slice(0, 10);
  }, [ports, query]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {suggestions.map((port) => (
          <Pressable
            key={port}
            onPress={() => onSelect(port)}
            style={styles.chip}
          >
            <Text style={styles.chipText}>{port}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    ...textStyles.label,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  chipText: {
    ...textStyles.caption,
    color: colors.primaryDark,
  },
});

