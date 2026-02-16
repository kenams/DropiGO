import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, GhostButton } from '../../components/Buttons';
import { BackButton } from '../../components/BackButton';
import { Card } from '../../components/Card';
import { Field } from '../../components/Field';
import { Logo } from '../../components/Logo';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { useAppState } from '../../state/AppState';
import { colors, spacing, textStyles } from '../../theme';

type Props = { onBack?: () => void };

const BuyerOnboardingContent: React.FC<Props> = ({ onBack }) => {
  const { buyerStatus, setBuyerStatus, signOut, buyerProfile, setBuyerProfile } =
    useAppState();

  const updateField = (key: keyof typeof buyerProfile) => (value: string) => {
    setBuyerProfile({ ...buyerProfile, [key]: value });
  };

  const requiredFields = [
    buyerProfile.name,
    buyerProfile.company,
    buyerProfile.registry,
    buyerProfile.activity,
    buyerProfile.phone,
    buyerProfile.email,
    buyerProfile.paymentMethod,
    buyerProfile.idNumber,
    buyerProfile.address,
  ];
  const isComplete = requiredFields.every((value) => value.trim().length > 0);
  const progress = Math.round(
    (requiredFields.filter((value) => value.trim().length > 0).length /
      requiredFields.length) *
      100
  );
  const canSubmit = buyerStatus === 'draft' && isComplete;

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    signOut();
  };

  return (
    <Screen scroll>
      {onBack && <BackButton onPress={handleBack} style={styles.back} />}
      <Logo size={72} showWordmark={false} compact />
      <Text style={styles.title}>Dossier acheteur</Text>
      <Text style={styles.subtitle}>
        Vérifiez vos informations pour activer les achats.
      </Text>

      <Card style={styles.card}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Dossier complet</Text>
          <Text style={styles.progressValue}>{progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Field
          label="Nom et prénom"
          value={buyerProfile.name}
          onChangeText={updateField('name')}
        />
        <Field
          label="Société"
          value={buyerProfile.company}
          onChangeText={updateField('company')}
        />
        <Field
          label="Registre de commerce"
          value={buyerProfile.registry}
          onChangeText={updateField('registry')}
        />
        <Field
          label="Activité"
          value={buyerProfile.activity}
          onChangeText={updateField('activity')}
        />
        <Field
          label="Moyen de paiement"
          value={buyerProfile.paymentMethod}
          onChangeText={updateField('paymentMethod')}
          placeholder="Ex: Carte pro, virement"
        />
        <Field
          label="Téléphone"
          value={buyerProfile.phone}
          onChangeText={updateField('phone')}
          keyboardType="phone-pad"
        />
        <Field
          label="Email"
          value={buyerProfile.email}
          onChangeText={updateField('email')}
          keyboardType="email-address"
        />
        <Field
          label="Pièce d'identité (N°)"
          value={buyerProfile.idNumber}
          onChangeText={updateField('idNumber')}
        />
        <Field
          label="Adresse"
          value={buyerProfile.address}
          onChangeText={updateField('address')}
        />

        {!isComplete && (
          <Text style={styles.notice}>Complétez tous les champs pour soumettre.</Text>
        )}

        <PrimaryButton
          label={
            buyerStatus === 'draft'
              ? 'Soumettre le dossier'
              : buyerStatus === 'pending'
              ? 'Dossier envoyé'
              : 'Validé'
          }
          onPress={() => setBuyerStatus('pending')}
          disabled={!canSubmit}
        />
      </Card>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Statut :</Text>
        {buyerStatus === 'draft' ? (
          <Tag label="À compléter" tone="warning" />
        ) : buyerStatus === 'pending' ? (
          <Tag label="En attente" tone="warning" />
        ) : (
          <Tag label="Validé" tone="success" />
        )}
      </View>

      <GhostButton
        label="Simuler validation admin"
        onPress={() => setBuyerStatus('approved')}
      />
      <View style={styles.spacer} />
      <GhostButton label="Changer de compte" onPress={signOut} />
    </Screen>
  );
};

export const BuyerOnboardingScreen: React.FC = () => {
  return <BuyerOnboardingContent />;
};

export const BuyerOnboardingStandalone: React.FC<Props> = ({ onBack }) => {
  return <BuyerOnboardingContent onBack={onBack} />;
};

const styles = StyleSheet.create({
  back: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  title: {
    ...textStyles.h2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.muted,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    ...textStyles.caption,
  },
  progressValue: {
    ...textStyles.bodyBold,
  },
  progressBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  notice: {
    ...textStyles.caption,
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statusLabel: {
    ...textStyles.bodyBold,
    color: colors.muted,
    fontSize: 13,
  },
  spacer: {
    height: spacing.sm,
  },
});
