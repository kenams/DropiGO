import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GhostButton } from '../components/Buttons';
import { Logo } from '../components/Logo';
import { Screen } from '../components/Screen';
import { colors, spacing, textStyles } from '../theme';

export const WelcomeScreen: React.FC<{ onContinue: () => void }> = ({
  onContinue,
}) => {
  return (
    <Screen scroll style={styles.container}>
      <Logo size={160} />
      <Text style={styles.subtitle}>
        Le marché direct de la pêche, avec paiement séquestré sécurisé.
      </Text>
      <Text style={styles.caption}>
        DroPiPêche agit comme mandataire-acheteur-vendeur virtuel.
      </Text>
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Ionicons name="fish" size={16} color={colors.primaryDark} />
          <Text style={styles.badgeText}>Pêche du jour</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="cart" size={16} color={colors.primaryDark} />
          <Text style={styles.badgeText}>Achat direct</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="location" size={16} color={colors.primaryDark} />
          <Text style={styles.badgeText}>Retrait au quai</Text>
        </View>
      </View>
      <GhostButton label="Commencer" onPress={onContinue} />
      <Text style={styles.footer}>
        Paiement séquestré • Validation conjointe pêcheur & acheteur
      </Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  caption: {
    ...textStyles.caption,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  badgeText: {
    ...textStyles.caption,
    color: colors.primaryDark,
  },
  footer: {
    ...textStyles.caption,
    color: colors.muted,
    textAlign: 'center',
  },
});
