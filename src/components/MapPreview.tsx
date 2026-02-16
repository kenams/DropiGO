import React from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, textStyles } from '../theme';
import { GhostButton } from './Buttons';

export const MapPreview: React.FC<{
  latitude: number;
  longitude: number;
}> = ({ latitude, longitude }) => {
  const handleOpen = () => {
    const lat = latitude.toFixed(6);
    const lng = longitude.toFixed(6);
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?ll=${lat},${lng}`
        : `geo:${lat},${lng}?q=${lat},${lng}`;
    Linking.openURL(url).catch(() => undefined);
  };

  return (
    <View style={styles.fallback}>
      <Text style={styles.title}>Point de rendez-vous</Text>
      <Text style={styles.subtitle}>
        Carte indisponible dans Expo Go. Ouvrez l&apos;itineraire dans
        l&apos;application Maps.
      </Text>
      <GhostButton label="Ouvrir dans Maps" onPress={handleOpen} />
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  title: {
    ...textStyles.bodyBold,
    fontSize: 14,
  },
  subtitle: {
    ...textStyles.caption,
  },
});
