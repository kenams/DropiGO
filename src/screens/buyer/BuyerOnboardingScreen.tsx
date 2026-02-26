import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { PrimaryButton, GhostButton } from '../../components/Buttons';
import { BackButton } from '../../components/BackButton';
import { Card } from '../../components/Card';
import { Logo } from '../../components/Logo';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { startBuyerVerification } from '../../services/verification';
import { useAppState } from '../../state/AppState';
import { colors, spacing, textStyles } from '../../theme';
import { VerificationCheck } from '../../types';

type Props = { onBack?: () => void };

type BuyerDocField = 'idPhotoUri' | 'kbisPhotoUri';

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

const BuyerOnboardingContent: React.FC<Props> = ({ onBack }) => {
  const {
    role,
    buyerStatus,
    signOut,
    buyerProfile,
    setBuyerProfile,
    submitBuyerVerification,
    buyerVerification,
  } = useAppState();
  const canBuyer = role === 'buyer' || role === 'admin';
  const [showPicker, setShowPicker] = useState(false);
  const [sending, setSending] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    signOut();
  };

  const report = buyerVerification ?? startBuyerVerification();
  const status = statusLabel(buyerStatus);

  const handleAutoFill = () => {
    const profile = {
      ...buyerProfile,
      name: buyerProfile.name || 'Claire Martin',
      company: buyerProfile.company || 'Restaurant La Vague',
      registry: buyerProfile.registry || '55210055400013',
      activity: buyerProfile.activity || 'Restaurant',
      phone: buyerProfile.phone || '+33 6 22 22 22 22',
      email: buyerProfile.email || 'acheteur@dropipeche.demo',
      paymentMethod: buyerProfile.paymentMethod || 'Carte professionnelle',
      idNumber: buyerProfile.idNumber || 'ID-FR-932193',
      address: buyerProfile.address || 'Quai des Pêcheurs, Sète',
    };
    setBuyerProfile(profile);
    return profile;
  };

  const handleSubmit = async () => {
    if (sending) {
      return;
    }
    if (!buyerProfile.idPhotoUri && !buyerProfile.kbisPhotoUri) {
      Alert.alert(
        'Documents manquants',
        'Ajoutez au moins un document avant d’envoyer le dossier.'
      );
      return;
    }
    setSending(true);
    const filledProfile = handleAutoFill();
    await submitBuyerVerification(filledProfile);
    setSending(false);
  };

  const pickFromLibrary = async (field: BuyerDocField) => {
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
      setBuyerProfile({ ...buyerProfile, [field]: result.assets[0].uri });
      setShowPicker(false);
    }
  };

  const takePhoto = async (field: BuyerDocField) => {
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
      setBuyerProfile({ ...buyerProfile, [field]: result.assets[0].uri });
      setShowPicker(false);
    }
  };

  if (!canBuyer) {
    return (
      <Screen scroll>
        {onBack && <BackButton onPress={handleBack} style={styles.back} />}
        <Logo size={72} showWordmark={false} compact />
        <Text style={styles.title}>Dossier acheteur</Text>
        <Text style={styles.subtitle}>
          Vérification automatique France (SIRENE/INSEE + KYC PSP).
        </Text>
        <Card style={styles.card}>
          <Text style={styles.notice}>
            Actions réservées aux acheteurs.
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      {onBack && <BackButton onPress={handleBack} style={styles.back} />}
      <Logo size={72} showWordmark={false} compact />
      <Text style={styles.title}>Dossier acheteur</Text>
      <Text style={styles.subtitle}>
        Vérification automatique France (SIRENE/INSEE + KYC PSP).
      </Text>

      <Card style={styles.card}>
        <PrimaryButton
          label="Scanner documents (auto)"
          onPress={() => setShowPicker(true)}
          disabled={sending}
        />
        <Text style={styles.notice}>
          Choisissez la pièce d’identité ou le Kbis, puis importez ou scannez.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Documents KYC</Text>
        <View style={styles.docRow}>
          <Text style={styles.meta}>Pièce d’identité</Text>
          <Tag
            label={buyerProfile.idPhotoUri ? 'Chargé' : 'Manquant'}
            tone={buyerProfile.idPhotoUri ? 'success' : 'warning'}
          />
        </View>
        <Text style={styles.caption}>Recto/verso, lisible et valide.</Text>
        <View style={styles.docRow}>
          <Text style={styles.meta}>Extrait Kbis</Text>
          <Tag
            label={buyerProfile.kbisPhotoUri ? 'Chargé' : 'Manquant'}
            tone={buyerProfile.kbisPhotoUri ? 'success' : 'warning'}
          />
        </View>
        <Text style={styles.caption}>Dernier document de société.</Text>
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

      {buyerStatus === 'rejected' && report.failureReason && (
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
              <Text style={styles.modalLabel}>Pièce d’identité</Text>
              <Text style={styles.modalHint}>Recto/verso, lisible et valide.</Text>
              <View style={styles.modalActions}>
                <GhostButton
                  label="Importer"
                  onPress={() => pickFromLibrary('idPhotoUri')}
                />
                <GhostButton
                  label="Scanner"
                  onPress={() => takePhoto('idPhotoUri')}
                />
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Extrait Kbis</Text>
              <Text style={styles.modalHint}>Dernier document de société.</Text>
              <View style={styles.modalActions}>
                <GhostButton
                  label="Importer"
                  onPress={() => pickFromLibrary('kbisPhotoUri')}
                />
                <GhostButton
                  label="Scanner"
                  onPress={() => takePhoto('kbisPhotoUri')}
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

export const BuyerOnboardingScreen: React.FC = () => {
  return <BuyerOnboardingContent />;
};

export const BuyerOnboardingStandalone: React.FC<Props> = ({ onBack }) => {
  return <BuyerOnboardingContent onBack={onBack} />;
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
  sectionTitle: {
    ...textStyles.h3,
    marginBottom: spacing.sm,
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
  modalHint: {
    ...textStyles.caption,
    color: colors.muted,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
});
