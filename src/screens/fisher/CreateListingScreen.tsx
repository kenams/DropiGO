import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { PrimaryButton, GhostButton } from '../../components/Buttons';
import { Field } from '../../components/Field';
import { Screen } from '../../components/Screen';
import { MapPreview } from '../../components/MapPreview';
import { useAppState } from '../../state/AppState';
import { colors, radius, spacing } from '../../theme';

export const CreateListingScreen: React.FC = () => {
  const { addListing } = useAppState();
  const [title, setTitle] = useState('');
  const [variety, setVariety] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [stockKg, setStockKg] = useState('');
  const [location, setLocation] = useState('');
  const [pickupWindow, setPickupWindow] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [notice, setNotice] = useState('');

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
    addListing({
      title,
      variety,
      pricePerKg: price,
      stockKg: stock,
      location,
      pickupWindow,
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
    setImageUri(undefined);
    setCoords(null);
    setNotice('Annonce publiée.');
  };

  return (
    <Screen scroll>
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
      <Field label="Lieu" value={location} onChangeText={setLocation} />
      <Field
        label="Créneau de retrait"
        value={pickupWindow}
        onChangeText={setPickupWindow}
      />

      {notice.length > 0 && <Text style={styles.notice}>{notice}</Text>}

      <PrimaryButton label="Publier" onPress={handleSubmit} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
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
    color: colors.muted,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
});
