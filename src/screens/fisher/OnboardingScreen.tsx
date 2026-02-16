import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { PrimaryButton, GhostButton } from '../../components/Buttons';
import { BackButton } from '../../components/BackButton';
import { Card } from '../../components/Card';
import { Field } from '../../components/Field';
import { Logo } from '../../components/Logo';
import { PortSuggestions } from '../../components/PortSuggestions';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { useAppState } from '../../state/AppState';
import { colors, radius, spacing, textStyles } from '../../theme';

type Props = { onBack?: () => void };

const OnboardingContent: React.FC<Props> = ({ onBack }) => {
  const {
    fisherStatus,
    setFisherStatus,
    signOut,
    fisherProfile,
    setFisherProfile,
    knownPorts,
    registerPort,
  } = useAppState();

  const updateField = (key: keyof typeof fisherProfile) => (value: string) => {
    setFisherProfile({ ...fisherProfile, [key]: value });
  };

  const pickDocument = async (
    key: 'licensePhotoUri' | 'boatPhotoUri' | 'insurancePhotoUri' | 'ribPhotoUri'
  ) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setFisherProfile({ ...fisherProfile, [key]: result.assets[0].uri });
    }
  };

  const requiredFields = [
    fisherProfile.name,
    fisherProfile.permit,
    fisherProfile.boat,
    fisherProfile.registration,
    fisherProfile.port,
    fisherProfile.insurance,
    fisherProfile.bankAccount,
    fisherProfile.phone,
    fisherProfile.email,
    fisherProfile.idNumber,
  ];
  const isComplete = requiredFields.every((value) => value.trim().length > 0);
  const progress = Math.round(
    (requiredFields.filter((value) => value.trim().length > 0).length /
      requiredFields.length) *
      100
  );
  const canSubmit = fisherStatus === 'draft' && isComplete;

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
      <Text style={styles.title}>Dossier pêcheur</Text>
      <Text style={styles.subtitle}>
        Renseignez vos informations légales pour être validé.
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
          label="Assurance"
          value={fisherProfile.insurance}
          onChangeText={updateField('insurance')}
        />
        <Field
          label="RIB / Compte bancaire"
          value={fisherProfile.bankAccount}
          onChangeText={updateField('bankAccount')}
        />
        <Field
          label="Port d'attache"
          value={fisherProfile.port}
          onChangeText={updateField('port')}
          onEndEditing={() => registerPort(fisherProfile.port)}
        />
        <PortSuggestions
          query={fisherProfile.port}
          ports={knownPorts}
          onSelect={(port) => {
            setFisherProfile({ ...fisherProfile, port });
            registerPort(port);
          }}
        />
        <Field
          label="Téléphone"
          value={fisherProfile.phone}
          onChangeText={updateField('phone')}
          keyboardType="phone-pad"
        />
        <Field
          label="Email"
          value={fisherProfile.email}
          onChangeText={updateField('email')}
          keyboardType="email-address"
        />
        <Field
          label="Pièce d'identité (N°)"
          value={fisherProfile.idNumber}
          onChangeText={updateField('idNumber')}
        />

        <Text style={styles.sectionTitle}>Justificatifs</Text>
        <View style={styles.docRow}>
          <Pressable
            style={styles.docButton}
            onPress={() => pickDocument('licensePhotoUri')}
          >
            <Text style={styles.docButtonText}>
              {fisherProfile.licensePhotoUri
                ? 'Permis ajouté'
                : 'Ajouter permis'}
            </Text>
          </Pressable>
          <Pressable
            style={styles.docButton}
            onPress={() => pickDocument('boatPhotoUri')}
          >
            <Text style={styles.docButtonText}>
              {fisherProfile.boatPhotoUri ? 'Bateau ajouté' : 'Ajouter bateau'}
            </Text>
          </Pressable>
        </View>
        <View style={styles.docRow}>
          <Pressable
            style={styles.docButton}
            onPress={() => pickDocument('insurancePhotoUri')}
          >
            <Text style={styles.docButtonText}>
              {fisherProfile.insurancePhotoUri
                ? 'Assurance ajoutée'
                : 'Ajouter assurance'}
            </Text>
          </Pressable>
          <Pressable
            style={styles.docButton}
            onPress={() => pickDocument('ribPhotoUri')}
          >
            <Text style={styles.docButtonText}>
              {fisherProfile.ribPhotoUri ? 'RIB ajouté' : 'Ajouter RIB'}
            </Text>
          </Pressable>
        </View>
        <View style={styles.docPreviewRow}>
          {fisherProfile.licensePhotoUri && (
            <Image
              source={{ uri: fisherProfile.licensePhotoUri }}
              style={styles.docPreview}
            />
          )}
          {fisherProfile.boatPhotoUri && (
            <Image
              source={{ uri: fisherProfile.boatPhotoUri }}
              style={styles.docPreview}
            />
          )}
          {fisherProfile.insurancePhotoUri && (
            <Image
              source={{ uri: fisherProfile.insurancePhotoUri }}
              style={styles.docPreview}
            />
          )}
          {fisherProfile.ribPhotoUri && (
            <Image
              source={{ uri: fisherProfile.ribPhotoUri }}
              style={styles.docPreview}
            />
          )}
        </View>

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
          onPress={() => {
            registerPort(fisherProfile.port);
            setFisherStatus('pending');
          }}
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
      <GhostButton label="Changer de compte" onPress={signOut} />
    </Screen>
  );
};

export const OnboardingScreen: React.FC = () => {
  return <OnboardingContent />;
};

export const OnboardingStandalone: React.FC<Props> = ({ onBack }) => {
  return <OnboardingContent onBack={onBack} />;
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
  sectionTitle: {
    ...textStyles.h3,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  docRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  docButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  docButtonText: {
    ...textStyles.bodyBold,
    color: colors.primary,
    fontSize: 13,
  },
  docPreviewRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  docPreview: {
    width: 120,
    height: 80,
    borderRadius: radius.sm,
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
