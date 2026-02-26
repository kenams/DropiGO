import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { PrimaryButton, GhostButton } from '../../components/Buttons';
import { BackButton } from '../../components/BackButton';
import { Field } from '../../components/Field';
import { PortSuggestions } from '../../components/PortSuggestions';
import { Screen } from '../../components/Screen';
import { MapPreview } from '../../components/MapPreview';
import { useAppState } from '../../state/AppState';
import { colors, radius, spacing, textStyles } from '../../theme';

type Props = { onBack?: () => void };

const CreateListingContent: React.FC<Props> = ({ onBack }) => {
  const { addListing, knownPorts, registerPort, role } = useAppState();
  const canFisher = role === 'fisher' || role === 'admin';
  const [title, setTitle] = useState('');
  const [variety, setVariety] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [stockKg, setStockKg] = useState('');
  const [location, setLocation] = useState('');
  const [pickupWindow, setPickupWindow] = useState('');
  const [pickupSlotsRaw, setPickupSlotsRaw] = useState('');
  const [catchDate, setCatchDate] = useState('');
  const [method, setMethod] = useState('');
  const [sizeGrade, setSizeGrade] = useState('');
  const [qualityTags, setQualityTags] = useState<string[]>([]);
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [notice, setNotice] = useState('');
  const qualityOptions = ['Ultra frais', 'Pêche durable', 'Glace à bord', 'Tri premium', 'Local'];

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setNotice('Autorisez l\'accès aux photos pour ajouter une image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setNotice('');
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setNotice('Autorisez la caméra pour prendre une photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setNotice('');
    }
  };

  const useCurrentLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      setNotice('Autorisez la localisation pour proposer un point de rendez-vous.');
      return;
    }
    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const latitude = current.coords.latitude;
    const longitude = current.coords.longitude;
    setCoords({ latitude, longitude });
    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (place) {
      const label = [place.city, place.region].filter(Boolean).join(', ');
      if (label) {
        setLocation(label);
      }
    }
    setNotice('');
  };

  const handleSubmit = () => {
    const price = Number(pricePerKg.replace(',', '.'));
    const stock = Number(stockKg.replace(',', '.'));
    if (!title || !variety || !price || !stock || !location || !pickupWindow) {
      setNotice('Complétez tous les champs avant de publier.');
      return;
    }
    registerPort(location);
    const pickupSlots = pickupSlotsRaw
      .split(',')
      .map((slot) => slot.trim())
      .filter(Boolean);
    addListing({
      title,
      variety,
      pricePerKg: price,
      stockKg: stock,
      location,
      pickupWindow,
      pickupSlots: pickupSlots.length > 0 ? pickupSlots : undefined,
      catchDate: catchDate || 'Aujourd\'hui',
      method: method || 'Non précisée',
      sizeGrade: sizeGrade || 'Standard',
      qualityTags: qualityTags.length > 0 ? qualityTags : ['Frais'],
      imageUri,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
    });
    setTitle('');
    setVariety('');
    setPricePerKg('');
    setStockKg('');
    setLocation('');
    setPickupWindow('');
    setPickupSlotsRaw('');
    setCatchDate('');
    setMethod('');
    setSizeGrade('');
    setQualityTags([]);
    setImageUri(undefined);
    setCoords(null);
    setNotice('Annonce publiée.');
  };

  const toggleQuality = (value: string) => {
    setQualityTags((prev) =>
      prev.includes(value)
        ? prev.filter((tag) => tag !== value)
        : [...prev, value]
    );
  };

  if (!canFisher) {
    return (
      <Screen scroll>
        {onBack && <BackButton onPress={onBack} style={styles.back} />}
        <Text style={styles.title}>Nouvelle pêche</Text>
        <Text style={styles.subtitle}>
          Publiez votre pêche du jour pour recevoir des réservations.
        </Text>
        <View style={styles.noticeCard}>
          <Text style={styles.noticeText}>
            Actions réservées aux pêcheurs.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      {onBack && <BackButton onPress={onBack} style={styles.back} />}
      <Text style={styles.title}>Nouvelle pêche</Text>
      <Text style={styles.subtitle}>
        Publiez votre pêche du jour pour recevoir des réservations.
      </Text>

      <View style={styles.actionRow}>
        <GhostButton label="Choisir une photo" onPress={pickImage} />
        <View style={styles.actionSpacer} />
        <GhostButton label="Prendre une photo" onPress={takePhoto} />
      </View>
      <View style={styles.actionRow}>
        <GhostButton label="Utiliser ma position" onPress={useCurrentLocation} />
      </View>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.image} />
      )}

      {coords && (
        <MapPreview latitude={coords.latitude} longitude={coords.longitude} />
      )}

      <Field label="Titre" value={title} onChangeText={setTitle} />
      <Field label="Variété" value={variety} onChangeText={setVariety} />
      <Field
        label="Prix par kg"
        value={pricePerKg}
        onChangeText={setPricePerKg}
        keyboardType="numeric"
      />
      <Field
        label="Stock (kg)"
        value={stockKg}
        onChangeText={setStockKg}
        keyboardType="numeric"
      />
      <Field
        label="Lieu"
        value={location}
        onChangeText={setLocation}
        onEndEditing={() => registerPort(location)}
      />
      <PortSuggestions
        query={location}
        ports={knownPorts}
        label="Ports suggérés"
        onSelect={(port) => {
          setLocation(port);
          registerPort(port);
        }}
      />
      <Field
        label="Date/heure de pêche"
        value={catchDate}
        onChangeText={setCatchDate}
        placeholder="Ex: Aujourd'hui 05:00"
      />
      <Field
        label="Méthode de pêche"
        value={method}
        onChangeText={setMethod}
        placeholder="Ex: Ligne, senne..."
      />
      <Field
        label="Calibre / taille"
        value={sizeGrade}
        onChangeText={setSizeGrade}
        placeholder="Ex: Calibre 3 (300-500g)"
      />
      <Field
        label="Créneau de retrait"
        value={pickupWindow}
        onChangeText={setPickupWindow}
      />
      <Field
        label="Créneaux précis (séparés par virgule)"
        value={pickupSlotsRaw}
        onChangeText={setPickupSlotsRaw}
        placeholder="Ex: Aujourd'hui 17:30, Aujourd'hui 18:00"
      />

      <Text style={styles.sectionTitle}>Qualité & traçabilité</Text>
      <View style={styles.chipRow}>
        {qualityOptions.map((option) => {
          const active = qualityTags.includes(option);
          return (
            <Pressable
              key={option}
              onPress={() => toggleQuality(option)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {notice.length > 0 && <Text style={styles.notice}>{notice}</Text>}

      <PrimaryButton label="Publier" onPress={handleSubmit} />
    </Screen>
  );
};

export const CreateListingScreen: React.FC = () => {
  return <CreateListingContent />;
};

export const CreateListingStandalone: React.FC<Props> = ({ onBack }) => {
  return <CreateListingContent onBack={onBack} />;
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  actionSpacer: {
    width: spacing.sm,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  notice: {
    ...textStyles.caption,
    marginBottom: spacing.sm,
  },
  noticeCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  noticeText: {
    ...textStyles.caption,
    color: colors.muted,
  },
  sectionTitle: {
    ...textStyles.h3,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: 'transparent',
  },
  chipText: {
    ...textStyles.caption,
    color: colors.muted,
  },
  chipTextActive: {
    color: colors.primaryDark,
    fontFamily: textStyles.bodyBold.fontFamily,
  },
});
