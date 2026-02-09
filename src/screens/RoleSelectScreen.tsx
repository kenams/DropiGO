import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { PrimaryButton } from '../components/Buttons';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { colors, spacing } from '../theme';
import { useAppState } from '../state/AppState';

export const RoleSelectScreen: React.FC = () => {
  const { setRole } = useAppState();

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Bienvenue sur DropiGO</Text>
      <Text style={styles.subtitle}>Choisissez votre profil pour commencer.</Text>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Je suis pêcheur</Text>
        <Text style={styles.cardBody}>
          Publiez votre pêche du jour et recevez des réservations directes.
        </Text>
        <PrimaryButton label="Continuer" onPress={() => setRole('fisher')} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Je suis acheteur</Text>
        <Text style={styles.cardBody}>
          Réservez en direct des produits frais, sans intermédiaires.
        </Text>
        <PrimaryButton label="Continuer" onPress={() => setRole('buyer')} />
      </Card>

      <Text style={styles.footer}>
        Paiement au pickup • Validation manuelle des pêcheurs
      </Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.muted,
    marginBottom: spacing.lg,
    fontSize: 15,
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  cardBody: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    color: colors.muted,
    lineHeight: 20,
  },
  footer: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 12,
  },
});
