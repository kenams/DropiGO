import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, GhostButton } from '../../components/Buttons';
import { Card } from '../../components/Card';
import { Field } from '../../components/Field';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { useAppState } from '../../state/AppState';
import { colors, spacing } from '../../theme';

export const OnboardingScreen: React.FC = () => {
  const {
    fisherStatus,
    setFisherStatus,
    setRole,
    fisherProfile,
    setFisherProfile,
  } = useAppState();

  const updateField = (key: keyof typeof fisherProfile) => (value: string) => {
    setFisherProfile({ ...fisherProfile, [key]: value });
  };

  const isComplete = Object.values(fisherProfile).every(
    (value) => value.trim().length > 0
  );
  const canSubmit = fisherStatus === 'draft' && isComplete;

  return (
    <Screen scroll>
      <Text style={styles.title}>Dossier pêcheur</Text>
      <Text style={styles.subtitle}>
        Renseignez vos informations légales pour être validé.
      </Text>

      <Card style={styles.card}>
        <Field
          label="Nom et prénom"
          value={fisherProfile.name}
          onChangeText={updateField('name')}
        />
        <Field
          label="N° permis de pêche"
          value={fisherProfile.permit}
          onChangeText={updateField('permit')}
        />
        <Field
          label="Bateau / Chalutier"
          value={fisherProfile.boat}
          onChangeText={updateField('boat')}
        />
        <Field
          label="Immatriculation"
          value={fisherProfile.registration}
          onChangeText={updateField('registration')}
        />
        <Field
          label="Port d\'attache"
          value={fisherProfile.port}
          onChangeText={updateField('port')}
        />

        {!isComplete && (
          <Text style={styles.notice}>Complétez tous les champs pour soumettre.</Text>
        )}

        <PrimaryButton
          label={
            fisherStatus === 'draft'
              ? 'Soumettre le dossier'
              : fisherStatus === 'pending'
              ? 'Dossier envoyé'
              : 'Validé'
          }
          onPress={() => setFisherStatus('pending')}
          disabled={!canSubmit}
        />
      </Card>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Statut :</Text>
        {fisherStatus === 'draft' ? (
          <Tag label="À compléter" tone="warning" />
        ) : fisherStatus === 'pending' ? (
          <Tag label="En attente" tone="warning" />
        ) : (
          <Tag label="Validé" tone="success" />
        )}
      </View>

      <GhostButton
        label="Simuler validation admin"
        onPress={() => setFisherStatus('approved')}
      />
      <View style={styles.spacer} />
      <GhostButton label="Changer de rôle" onPress={() => setRole(null)} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.muted,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.lg,
  },
  notice: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statusLabel: {
    color: colors.muted,
    fontSize: 14,
  },
  spacer: {
    height: spacing.sm,
  },
});
