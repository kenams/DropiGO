import React from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Logo } from '../components/Logo';
import { colors, spacing, textStyles } from '../theme';

const trawlerSource = require('../../assets/chalutier-bg.jpg');

export const LoadingScreen: React.FC = () => {
  return (
    <ImageBackground
      source={trawlerSource}
      style={styles.root}
      imageStyle={styles.trawlerImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={[colors.backgroundOverlayTop, colors.backgroundOverlayBottom]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.sun} />
      <View style={styles.wave} />
      <Logo size={90} showWordmark={false} compact />
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>Chargement de DroPiPêche…</Text>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  trawlerImage: {
    opacity: 0.9,
  },
  sun: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.sunGlow,
  },
  wave: {
    position: 'absolute',
    bottom: -80,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.seaGlow,
  },
  text: {
    marginTop: spacing.md,
    ...textStyles.bodyBold,
    color: colors.primaryDark,
  },
});

