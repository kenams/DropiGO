import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, textStyles } from '../theme';
import { GhostButton } from './Buttons';
import { openNavigationApp } from '../utils/geo';

export const MapPreview: React.FC<{
  latitude: number;
  longitude: number;
}> = ({ latitude, longitude }) => {
  const [hasError, setHasError] = useState(false);
  const handleOpen = () => {
    openNavigationApp(Number(latitude.toFixed(6)), Number(longitude.toFixed(6)));
  };
  const staticMapUrl = useMemo(() => {
    const lat = Number(latitude.toFixed(6));
    const lng = Number(longitude.toFixed(6));
    const center = `${lat},${lng}`;
    const marker = `${lat},${lng},red-pushpin`;
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${encodeURIComponent(
      center
    )}&zoom=13&size=640x280&markers=${encodeURIComponent(marker)}`;
  }, [latitude, longitude]);

  return (
    <View style={styles.fallback}>
      <Text style={styles.title}>Point de rendez-vous</Text>
      {!hasError && (
        <Image
          source={{ uri: staticMapUrl }}
          style={styles.map}
          resizeMode="cover"
          onError={() => setHasError(true)}
        />
      )}
      {hasError && (
        <View style={styles.mapFallback}>
          <Text style={styles.mapFallbackText}>Carte légère indisponible</Text>
        </View>
      )}
      <Text style={styles.subtitle}>
        Carte légère OpenStreetMap + ouverture Waze si disponible, sinon Google Maps.
      </Text>
      <GhostButton label="Ouvrir l'itinéraire" onPress={handleOpen} />
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
  map: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapFallback: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceWarm,
  },
  mapFallbackText: {
    ...textStyles.caption,
    color: colors.muted,
  },
  title: {
    ...textStyles.bodyBold,
    fontSize: 14,
  },
  subtitle: {
    ...textStyles.caption,
  },
});
