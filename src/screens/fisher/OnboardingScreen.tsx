import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { PrimaryButton, GhostButton } from '../../components/Buttons';
import { BackButton } from '../../components/BackButton';
import { Card } from '../../components/Card';
import { Field } from '../../components/Field';
import { Logo } from '../../components/Logo';
import { PortSuggestions } from '../../components/PortSuggestions';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { startFisherVerification } from '../../services/verification';
import { useAppState } from '../../state/AppState';
import { colors, spacing, textStyles } from '../../theme';
import { VerificationCheck } from '../../types';

type Props = { onBack?: () => void };

type FisherDocField =
  | 'licensePhotoUri'
  | 'boatPhotoUri'
  | 'insurancePhotoUri'
  | 'ribPhotoUri';

const statusLabel = (status: 'draft' | 'pending' | 'verified' | 'rejected') => {
  if (status === 'verified') {
    return { label: 'Vérifié', tone: 'success' as const };
  }
  if (status === 'rejected') {
    return { label: 'Refusé', tone: 'danger' as const };
  }
  if (status === 'pending') {
    return { label: 'En attente', tone: 'warning' as const };
  }
  return { label: 'À compléter', tone: 'warning' as const };
};

const checkTone = (check: VerificationCheck) => {
  if (check.status === 'passed') {
    return 'success' as const;
  }
  if (check.status === 'failed') {
    return 'danger' as const;
  }
  return 'warning' as const;
};

const checkLabel = (check: VerificationCheck) => {
  if (check.status === 'passed') {
    return 'OK';
  }
  if (check.status === 'failed') {
    return 'KO';
  }
  return 'En attente';
};

const OnboardingContent: React.FC<Props> = ({ onBack }) => {
  const {
    role,
    fisherStatus,
    signOut,
    fisherProfile,
    setFisherProfile,
    knownPorts,
    registerPort,
    submitFisherVerification,
    fisherVerification,
  } = useAppState();
  const canFisher = role === 'fisher' || role === 'admin';
  const [showPicker, setShowPicker] = useState(false);
  const [sending, setSending] = useState(false);

  const updateField = (key: keyof typeof fisherProfile) => (value: string) => {
    setFisherProfile({ ...fisherProfile, [key]: value });
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    signOut();
  };

  const report = fisherVerification ?? startFisherVerification();
  const status = statusLabel(fisherStatus);

  const handleAutoFill = () => {
    const profile = {
      ...fisherProfile,
      name: fisherProfile.name || 'Loïc Martin',
      permit: fisherProfile.permit || 'FR-PECH-9821',
      boat: fisherProfile.boat || 'L’Étoile Marine',
      registration: fisherProfile.registration || 'SE-4592',
      port: fisherProfile.port || 'Port de Sète',
      insurance: fisherProfile.insurance || 'Assurance Maritime AXA',
      bankAccount:
        fisherProfile.bankAccount || 'FR76 3000 6000 0112 3456 7890 189',
      phone: fisherProfile.phone || '+33 6 11 11 11 11',
      email: fisherProfile.email || 'pecheur@dropipeche.demo',
      idNumber: fisherProfile.idNumber || 'ID-FR-125971',
    };
    setFisherProfile(profile);
    return profile;
  };

  const handleSubmit = async () => {
    if (sending) {
      return;
    }
    if (
      !fisherProfile.licensePhotoUri &&
      !fisherProfile.boatPhotoUri &&
      !fisherProfile.insurancePhotoUri &&
      !fisherProfile.ribPhotoUri
    ) {
      Alert.alert(
        'Documents manquants',
        'Ajoutez au moins un document avant d’envoyer le dossier.'
      );
      return;
    }
    setSending(true);
    const filledProfile = handleAutoFill();
    await submitFisherVerification(filledProfile);
    setSending(false);
  };

  const pickFromLibrary = async (field: FisherDocField) => {
    const { status: permission } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission !== 'granted') {
      Alert.alert(
        'Autorisation requise',
        'Autorisez l’accès aux photos pour importer un document.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setFisherProfile({ ...fisherProfile, [field]: result.assets[0].uri });
      setShowPicker(false);
    }
  };

  const takePhoto = async (field: FisherDocField) => {
    const { status: permission } =
      await ImagePicker.requestCameraPermissionsAsync();
    if (permission !== 'granted') {
      Alert.alert(
        'Autorisation requise',
        'Autorisez la caméra pour capturer un document.'
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });
    if (!result.canceled) {
      setFisherProfile({ ...fisherProfile, [field]: result.assets[0].uri });
      setShowPicker(false);
    }
  };

  if (!canFisher) {
    return (
      <Screen scroll>
        {onBack && <BackButton onPress={handleBack} style={styles.back} />}
        <Logo size={72} showWordmark={false} compact />
        <Text style={styles.title}>Dossier pêcheur</Text>
        <Text style={styles.subtitle}>
          Vérification automatique France (registre navires + PSP KYC).
        </Text>
        <Card style={styles.card}>
          <Text style={styles.notice}>
            Actions réservées aux pêcheurs.
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      {onBack && <BackButton onPress={handleBack} style={styles.back} />}
      <Logo size={72} showWordmark={false} compact />
      <Text style={styles.title}>Dossier pêcheur</Text>
      <Text style={styles.subtitle}>
        Vérification automatique France (registre navires + PSP KYC).
      </Text>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Informations bateau</Text>
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
      </Card>

      <Card style={styles.card}>
        <PrimaryButton
          label="Scanner documents (auto)"
          onPress={() => setShowPicker(true)}
          disabled={sending}
        />
        <Text style={styles.notice}>
          Choisissez un document, puis importez ou scannez.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Documents KYC</Text>
        <View style={styles.docRow}>
          <Text style={styles.meta}>Licence</Text>
          <Tag
            label={fisherProfile.licensePhotoUri ? 'Chargé' : 'Manquant'}
            tone={fisherProfile.licensePhotoUri ? 'success' : 'warning'}
          />
        </View>
        <View style={styles.docRow}>
          <Text style={styles.meta}>Bateau</Text>
          <Tag
            label={fisherProfile.boatPhotoUri ? 'Chargé' : 'Manquant'}
            tone={fisherProfile.boatPhotoUri ? 'success' : 'warning'}
          />
        </View>
        <View style={styles.docRow}>
          <Text style={styles.meta}>Assurance</Text>
          <Tag
            label={fisherProfile.insurancePhotoUri ? 'Chargé' : 'Manquant'}
            tone={fisherProfile.insurancePhotoUri ? 'success' : 'warning'}
          />
        </View>
        <View style={styles.docRow}>
          <Text style={styles.meta}>RIB</Text>
          <Tag
            label={fisherProfile.ribPhotoUri ? 'Chargé' : 'Manquant'}
            tone={fisherProfile.ribPhotoUri ? 'success' : 'warning'}
          />
        </View>
        <View style={styles.actions}>
          <PrimaryButton
            label={sending ? 'Envoi en cours...' : 'Envoyer le dossier'}
            onPress={handleSubmit}
            disabled={sending}
          />
        </View>
      </Card>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Statut :</Text>
        <Tag label={status.label} tone={status.tone} />
      </View>

      {fisherStatus === 'rejected' && report.failureReason && (
        <Text style={styles.notice}>Motif : {report.failureReason}</Text>
      )}

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Contrôles automatiques</Text>
        {report.checks.map((check) => (
          <View key={check.id} style={styles.checkRow}>
            <View style={styles.checkText}>
              <Text style={styles.meta}>{check.label}</Text>
              {check.detail && <Text style={styles.caption}>{check.detail}</Text>}
            </View>
            <Tag label={checkLabel(check)} tone={checkTone(check)} />
          </View>
        ))}
      </Card>

      <GhostButton label="Changer de compte" onPress={signOut} />

      <Modal transparent visible={showPicker} animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPicker(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => null}>
            <Text style={styles.modalTitle}>Ajouter un document</Text>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Licence</Text>
              <View style={styles.modalActions}>
                <GhostButton
                  label="Importer"
                  onPress={() => pickFromLibrary('licensePhotoUri')}
                />
                <GhostButton
                  label="Scanner"
                  onPress={() => takePhoto('licensePhotoUri')}
                />
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Bateau</Text>
              <View style={styles.modalActions}>
                <GhostButton
                  label="Importer"
                  onPress={() => pickFromLibrary('boatPhotoUri')}
                />
                <GhostButton
                  label="Scanner"
                  onPress={() => takePhoto('boatPhotoUri')}
                />
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Assurance</Text>
              <View style={styles.modalActions}>
                <GhostButton
                  label="Importer"
                  onPress={() => pickFromLibrary('insurancePhotoUri')}
                />
                <GhostButton
                  label="Scanner"
                  onPress={() => takePhoto('insurancePhotoUri')}
                />
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>RIB</Text>
              <View style={styles.modalActions}>
                <GhostButton
                  label="Importer"
                  onPress={() => pickFromLibrary('ribPhotoUri')}
                />
                <GhostButton
                  label="Scanner"
                  onPress={() => takePhoto('ribPhotoUri')}
                />
              </View>
            </View>

            <GhostButton label="Fermer" onPress={() => setShowPicker(false)} />
          </Pressable>
        </Pressable>
      </Modal>
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
  },
  title: {
    ...textStyles.h2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...textStyles.caption,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...textStyles.h3,
    marginBottom: spacing.sm,
  },
  notice: {
    ...textStyles.caption,
    marginBottom: spacing.sm,
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statusLabel: {
    ...textStyles.bodyBold,
    color: colors.muted,
    fontSize: 13,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  checkText: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  meta: {
    ...textStyles.body,
    fontSize: 13,
  },
  caption: {
    ...textStyles.caption,
    color: colors.muted,
  },
  actions: {
    marginTop: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 10, 16, 0.4)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  modalTitle: {
    ...textStyles.h3,
  },
  modalSection: {
    gap: spacing.xs,
  },
  modalLabel: {
    ...textStyles.bodyBold,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
});
