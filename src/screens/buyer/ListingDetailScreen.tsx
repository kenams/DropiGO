import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/Buttons';
import { Card } from '../../components/Card';
import { Field } from '../../components/Field';
import { Screen } from '../../components/Screen';
import { MapPreview } from '../../components/MapPreview';
import { useAppState } from '../../state/AppState';
import { colors, spacing } from '../../theme';
import { BuyerStackParamList } from '../../navigation/types';

type NavProp = NativeStackNavigationProp<BuyerStackParamList, 'ListingDetail'>;

type RouteProps = RouteProp<BuyerStackParamList, 'ListingDetail'>;

export const ListingDetailScreen: React.FC = () => {
  const { listings, createReservation, favorites, toggleFavorite } = useAppState();
  const navigation = useNavigation<NavProp>();
  const { params } = useRoute<RouteProps>();
  const [qtyKg, setQtyKg] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  const listing = useMemo(
    () => listings.find((item) => item.id === params.listingId),
    [listings, params.listingId]
  );

  if (!listing) {
    return (
      <Screen style={styles.container}>
        <Text style={styles.title}>Annonce introuvable</Text>
      </Screen>
    );
  }

  const handleReserve = () => {
    const qty = Number(qtyKg.replace(',', '.'));
    if (!qty || !pickupTime) {
      return;
    }
    createReservation(listing.id, qty, pickupTime);
    navigation.goBack();
  };

  const isFavorite = favorites.includes(listing.id);

  return (
    <Screen scroll>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{listing.title}</Text>
        <Pressable
          onPress={() => toggleFavorite(listing.id)}
          style={styles.favoriteButton}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={isFavorite ? colors.danger : colors.muted}
          />
        </Pressable>
      </View>
      <Text style={styles.subtitle}>Pêcheur : {listing.fisherName}</Text>
      <Card style={styles.card}>
        {listing.imageUri && (
          <Image source={{ uri: listing.imageUri }} style={styles.image} />
        )}
        <Text style={styles.cardText}>{listing.variety}</Text>
        <Text style={styles.cardText}>{listing.pricePerKg} € / kg</Text>
        <Text style={styles.cardText}>Stock : {listing.stockKg} kg</Text>
        <Text style={styles.cardMuted}>{listing.location}</Text>
        <Text style={styles.cardMuted}>{listing.pickupWindow}</Text>
      </Card>

      {listing.latitude !== undefined && listing.longitude !== undefined && (
        <MapPreview latitude={listing.latitude} longitude={listing.longitude} />
      )}

      <Text style={styles.sectionTitle}>Réserver</Text>
      <Field
        label="Quantité (kg)"
        value={qtyKg}
        onChangeText={setQtyKg}
        keyboardType="numeric"
      />
      <Field
        label="Heure de retrait"
        value={pickupTime}
        onChangeText={setPickupTime}
        placeholder="Ex: Aujourd'hui 18:30"
      />
      <PrimaryButton label="Confirmer la réservation" onPress={handleReserve} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    flex: 1,
  },
  favoriteButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  subtitle: {
    color: colors.muted,
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.lg,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  cardText: {
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardMuted: {
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
});
