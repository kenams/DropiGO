import React from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../theme';

const trawlerSource = require('../../assets/chalutier-bg.jpg');

export const Screen: React.FC<{
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scroll?: boolean;
}> = ({ children, style, scroll }) => {
  if (scroll) {
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
        <SafeAreaView style={styles.safe}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, style]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    );
  }

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
      <SafeAreaView style={[styles.safe, style]}>{children}</SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  trawlerImage: {
    opacity: 0.9,
  },
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
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
});
