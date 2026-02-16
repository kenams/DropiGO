import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../components/Buttons';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { Screen } from '../components/Screen';
import { colors, spacing, textStyles } from '../theme';
import { useAppState } from '../state/AppState';

export const RoleSelectScreen: React.FC<{ onBack?: () => void }> = ({
  onBack,
}) => {
  const { setRole } = useAppState();

  return (
    <Screen scroll style={styles.container}>
      {onBack && (
        <View style={styles.backRow}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={18} color={colors.primaryDark} />
            <Text style={styles.backLabel}>Retour</Text>
          </Pressable>
        </View>
      )}
      <Logo size={120} />
      <Text style={styles.subtitle}>
        Mise en relation directe avec paiement séquestré sécurisé.
      </Text>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Je suis pêcheur</Text>
        <Text style={styles.cardBody}>
          Publiez votre pêche du jour et recevez des réservations directes.
        </Text>
        <PrimaryButton
          label="Continuer"
          tone="accent"
          onPress={() => setRole('fisher')}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Je suis acheteur</Text>
        <Text style={styles.cardBody}>
          Réservez en direct des produits frais, sans intermédiaires.
        </Text>
        <PrimaryButton label="Continuer" onPress={() => setRole('buyer')} />
      </Card>

      <Text style={styles.footer}>
        Paiement séquestré • Validation KYC pêcheurs & acheteurs
      </Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  backRow: {
    marginBottom: spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  backLabel: {
    ...textStyles.caption,
    color: colors.primaryDark,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.muted,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...textStyles.h3,
  },
  cardBody: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    ...textStyles.body,
    color: colors.muted,
    lineHeight: 20,
  },
  footer: {
    textAlign: 'center',
    ...textStyles.caption,
  },
});

