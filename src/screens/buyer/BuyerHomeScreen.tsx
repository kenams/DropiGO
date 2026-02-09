import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { GhostButton, PrimaryButton } from '../../components/Buttons';
import { Card } from '../../components/Card';
import { Field } from '../../components/Field';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { useAppState } from '../../state/AppState';
import { colors, radius, spacing } from '../../theme';
import { BuyerStackParamList } from '../../navigation/types';
import { getDistanceKm } from '../../utils/geo';
import { Listing } from '../../types';

type NavProp = NativeStackNavigationProp<BuyerStackParamList, 'BuyerHome'>;

type Coords = { latitude: number; longitude: number };

type ListingWithDistance = {
  item: Listing;
  distance: number | null;
};

type SortMode = 'recent' | 'price_low' | 'price_high' | 'distance';

const sortOptions: { key: SortMode; label: string }[] = [
  { key: 'recent', label: 'Plus récent' },
  { key: 'price_low', label: 'Prix bas' },
  { key: 'price_high', label: 'Prix haut' },
  { key: 'distance', label: 'Distance' },
];

export const BuyerHomeScreen: React.FC = () => {
  const { listings, favorites, toggleFavorite } = useAppState();
  const navigation = useNavigation<NavProp>();
  const [buyerLocation, setBuyerLocation] = useState<Coords | null>(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [maxDistance, setMaxDistance] = useState('');
  const [notice, setNotice] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const maxDistanceKm = Number(maxDistance.replace(',', '.'));
  const filterActive = Number.isFinite(maxDistanceKm) && maxDistanceKm > 0;
  const hasFilters =
    buyerLocation !== null || maxDistance.length > 0 || showFavoritesOnly;

  const distanceSortUnavailable = sortMode === 'distance' && !buyerLocation;
  const effectiveSort: SortMode = distanceSortUnavailable ? 'recent' : sortMode;

  const listingItems: ListingWithDistance[] = useMemo(() => {
    const base = listings.map((item) => {
      if (buyerLocation && item.latitude !== undefined && item.longitude !== undefined) {
        return {
          item,
          distance: getDistanceKm(
            buyerLocation.latitude,
            buyerLocation.longitude,
            item.latitude,
            item.longitude
          ),
        };
      }
      return { item, distance: null };
    });

    let filtered = base;
    if (showFavoritesOnly) {
      filtered = filtered.filter(({ item }) => favorites.includes(item.id));
    }

    if (filterActive && buyerLocation) {
      filtered = filtered.filter(
        ({ distance }) => distance !== null && distance <= maxDistanceKm
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      if (effectiveSort === 'price_low') {
        return a.item.pricePerKg - b.item.pricePerKg;
      }
      if (effectiveSort === 'price_high') {
        return b.item.pricePerKg - a.item.pricePerKg;
      }
      if (effectiveSort === 'distance') {
        if (a.distance === null && b.distance === null) {
          return 0;
        }
        if (a.distance === null) {
          return 1;
        }
        if (b.distance === null) {
          return -1;
        }
        return a.distance - b.distance;
      }
      return (
        new Date(b.item.createdAt).getTime() -
        new Date(a.item.createdAt).getTime()
      );
    });

    return sorted;
  }, [
    listings,
    buyerLocation,
    filterActive,
    maxDistanceKm,
    favorites,
    showFavoritesOnly,
    effectiveSort,
  ]);

  const useCurrentLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      setNotice('Autorisez la localisation pour filtrer par distance.');
      return;
    }
    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const coords = {
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    };
    setBuyerLocation(coords);
    const [place] = await Location.reverseGeocodeAsync(coords);
    if (place) {
      const label = [place.city, place.region].filter(Boolean).join(', ');
      setLocationLabel(label);
    }
    setNotice('');
  };

  const resetFilters = () => {
    setBuyerLocation(null);
    setLocationLabel('');
    setMaxDistance('');
    setShowFavoritesOnly(false);
    setSortMode('recent');
    setNotice('');
  };

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Pêches disponibles</Text>

      <Card style={styles.filterCard}>
        <Text style={styles.filterTitle}>Filtrer par distance</Text>
        <View style={styles.filterActions}>
          <GhostButton label="Utiliser ma position" onPress={useCurrentLocation} />
          {hasFilters && (
            <GhostButton label="Réinitialiser" onPress={resetFilters} />
          )}
        </View>
        {locationLabel.length > 0 && (
          <Text style={styles.filterMeta}>Position : {locationLabel}</Text>
        )}
        <Field
          label="Distance max (km)"
          value={maxDistance}
          onChangeText={setMaxDistance}
          keyboardType="numeric"
          placeholder="Ex: 20"
        />
        {filterActive && !buyerLocation && (
          <Text style={styles.notice}>Activez la position pour appliquer le filtre.</Text>
        )}
        {notice.length > 0 && <Text style={styles.notice}>{notice}</Text>}

        <View style={styles.filterRow}>
          <Pressable
            style={[
              styles.favoriteToggle,
              showFavoritesOnly && styles.favoriteToggleActive,
            ]}
            onPress={() => setShowFavoritesOnly((prev) => !prev)}
          >
            <Ionicons
              name={showFavoritesOnly ? 'heart' : 'heart-outline'}
              size={16}
              color={showFavoritesOnly ? colors.danger : colors.muted}
            />
            <Text style={styles.favoriteToggleText}>Favoris uniquement</Text>
          </Pressable>
        </View>

        <Text style={styles.filterTitle}>Trier par</Text>
        <View style={styles.sortRow}>
          {sortOptions.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => setSortMode(option.key)}
              style={[
                styles.sortChip,
                sortMode === option.key && styles.sortChipActive,
              ]}
            >
              <Text
                style={[
                  styles.sortChipText,
                  sortMode === option.key && styles.sortChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
        {distanceSortUnavailable && (
          <Text style={styles.notice}>Activez la position pour trier par distance.</Text>
        )}
      </Card>

      <FlatList
        data={listingItems}
        keyExtractor={(entry) => entry.item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucune pêche trouvée pour ce rayon.</Text>
        }
        renderItem={({ item }) => {
          const distance = item.distance;
          const listing = item.item;
          const isFavorite = favorites.includes(listing.id);

          return (
            <Card style={styles.card}>
              {listing.imageUri && (
                <Image source={{ uri: listing.imageUri }} style={styles.image} />
              )}
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{listing.title}</Text>
                <View style={styles.rowEnd}>
                  <Pressable
                    onPress={() => toggleFavorite(listing.id)}
                    style={styles.favoriteButton}
                  >
                    <Ionicons
                      name={isFavorite ? 'heart' : 'heart-outline'}
                      size={18}
                      color={isFavorite ? colors.danger : colors.muted}
                    />
                  </Pressable>
                  <Tag
                    label={listing.status === 'active' ? 'Disponible' : 'Clôturé'}
                  />
                </View>
              </View>
              <Text style={styles.cardText}>{listing.variety}</Text>
              <Text style={styles.cardText}>{listing.pricePerKg} € / kg</Text>
              <Text style={styles.cardText}>Stock : {listing.stockKg} kg</Text>
              <Text style={styles.cardMuted}>{listing.location}</Text>
              <Text style={styles.cardMuted}>{listing.pickupWindow}</Text>
              {distance !== null && (
                <Text style={styles.distance}>{distance.toFixed(1)} km</Text>
              )}
              <PrimaryButton
                label="Voir et réserver"
                onPress={() =>
                  navigation.navigate('ListingDetail', { listingId: listing.id })
                }
              />
            </Card>
          );
        }}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  filterCard: {
    marginBottom: spacing.md,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  filterActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  filterMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  filterRow: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  favoriteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
  },
  favoriteToggleActive: {
    borderColor: colors.danger,
    backgroundColor: '#FCEDEA',
  },
  favoriteToggleText: {
    fontSize: 12,
    color: colors.text,
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sortChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortChipActive: {
    borderColor: colors.primary,
    backgroundColor: '#E0F1F4',
  },
  sortChipText: {
    fontSize: 12,
    color: colors.muted,
  },
  sortChipTextActive: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  notice: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  empty: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: 140,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  favoriteButton: {
    padding: spacing.xs,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: spacing.xs,
  },
  cardText: {
    color: colors.text,
    marginTop: spacing.xs,
  },
  cardMuted: {
    color: colors.muted,
    marginTop: spacing.xs,
  },
  distance: {
    color: colors.primaryDark,
    fontWeight: '600',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
});
