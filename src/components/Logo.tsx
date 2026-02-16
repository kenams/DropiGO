import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, textStyles } from '../theme';

const logoSource = require('../../assets/icon.png');

export const Logo: React.FC<{
  size?: number;
  showWordmark?: boolean;
  compact?: boolean;
}> = ({ size = 96, compact = false }) => {
  return (
    <View style={[styles.wrapper, compact && styles.compact]}>
      <View
        style={[
          styles.logoFrame,
          { width: size, height: size, borderRadius: size * 0.2 },
        ]}
      >
        <View style={styles.logoInner}>
          <Image source={logoSource} style={styles.logoImage} resizeMode="contain" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  compact: {
    marginBottom: 0,
  },
  logoFrame: {
    marginBottom: spacing.sm,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  logoInner: {
    flex: 1,
    padding: spacing.xs,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
});

