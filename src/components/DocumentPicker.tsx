import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { GhostButton } from './Buttons';
import { colors, radius, spacing, textStyles } from '../theme';

type Props = {
  label: string;
  value?: string;
  onChange: (uri: string) => void;
  hint?: string;
};

export const DocumentPicker: React.FC<Props> = ({
  label,
  value,
  onChange,
  hint,
}) => {
  const [error, setError] = useState('');

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError("Autorisez l'accès aux photos pour importer un document.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      onChange(result.assets[0].uri);
      setError('');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Autorisez la caméra pour capturer un document.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });
    if (!result.canceled) {
      onChange(result.assets[0].uri);
      setError('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {hint && <Text style={styles.hint}>{hint}</Text>}
      <Text style={styles.status}>
        {value ? 'Document chargé' : 'Aucun document'}
      </Text>
      <View style={styles.actions}>
        <GhostButton label="Importer" onPress={pickFromLibrary} />
        <GhostButton label="Scanner" onPress={takePhoto} />
      </View>
      {error.length > 0 && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: spacing.sm,
  },
  label: {
    ...textStyles.bodyBold,
    marginBottom: spacing.xs,
  },
  hint: {
    ...textStyles.caption,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  status: {
    ...textStyles.caption,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  error: {
    ...textStyles.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
