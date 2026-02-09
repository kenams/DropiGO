import React from 'react';
import { NativeModules, Platform, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { colors, radius, spacing } from '../theme';

let MapView: any = null;
let Marker: any = null;

const isExpoGo = Constants.appOwnership === 'expo';
const hasNativeModule =
  Platform.OS === 'android'
    ? Boolean(NativeModules.RNMapsAirModule)
    : Boolean(NativeModules.AIRMapManager || NativeModules.RNMapsAirModule);

if (!isExpoGo && hasNativeModule) {
  try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
  } catch {
    // ignore
  }
}

export const MapPreview: React.FC<{
  latitude: number;
  longitude: number;
}> = ({ latitude, longitude }) => {
  if (!MapView || !Marker) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.title}>Carte indisponible</Text>
        <Text style={styles.subtitle}>
          Ouvrez l'app avec un client de dev pour afficher la carte.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.mapWrap}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
      >
        <Marker coordinate={{ latitude, longitude }} />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapWrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  map: {
    width: '100%',
    height: 200,
  },
  fallback: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
  },
});
