import React, { useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PrimaryButton } from '../../components/Buttons';
import { BackButton } from '../../components/BackButton';
import { Card } from '../../components/Card';
import { Field } from '../../components/Field';
import { Logo } from '../../components/Logo';
import { Screen } from '../../components/Screen';
import { useAppState } from '../../state/AppState';
import { colors, radius, spacing, textStyles } from '../../theme';
import { BuyerStackParamList } from '../../navigation/types';

type NavProp = StackNavigationProp<BuyerStackParamList, 'BuyerHome'>;

export const BuyerHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  return (
    <BuyerHomeContent
      onOpenListing={(id) => navigation.navigate('ListingDetail', { listingId: id })}
    />
  );
};

export const BuyerHomeStandalone: React.FC<{
  onOpenListing: (listingId: string) => void;
}> = ({ onOpenListing }) => {
  return <BuyerHomeContent onOpenListing={onOpenListing} />;
};

const BuyerHomeContent: React.FC<{
  onOpenListing: (listingId: string) => void;
}> = ({ onOpenListing }) => {
  const { listings, signOut, registerPort, role } = useAppState();
  const canBuyer = role === 'buyer' || role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPort, setFilterPort] = useState('');
  const [filterBoat, setFilterBoat] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const listingItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const portQuery = filterPort.trim().toLowerCase();
    const boatQuery = filterBoat.trim().toLowerCase();
    const maxPriceValue = Number(maxPrice.replace(',', '.'));
    const hasMaxPrice = Number.isFinite(maxPriceValue) && maxPriceValue > 0;
    if (!query) {
      return listings.filter((item) => {
        const matchesPort = portQuery
          ? item.location.toLowerCase().includes(portQuery)
          : true;
        const matchesBoat = boatQuery
          ? `${item.fisherBoat ?? ''} ${item.fisherName}`.toLowerCase().includes(boatQuery)
          : true;
        const matchesPrice = hasMaxPrice ? item.pricePerKg <= maxPriceValue : true;
        return matchesPort && matchesBoat && matchesPrice;
      });
    }
    return listings.filter((item) => {
      const matchesQuery = `${item.title} ${item.variety} ${item.location} ${item.fisherName}`
        .toLowerCase()
        .includes(query);
      const matchesPort = portQuery
        ? item.location.toLowerCase().includes(portQuery)
        : true;
      const matchesBoat = boatQuery
        ? `${item.fisherBoat ?? ''} ${item.fisherName}`.toLowerCase().includes(boatQuery)
        : true;
      const matchesPrice = hasMaxPrice ? item.pricePerKg <= maxPriceValue : true;
      return matchesQuery && matchesPort && matchesBoat && matchesPrice;
    });
  }, [listings, searchQuery, filterPort, filterBoat, maxPrice]);

  const header = (
    <View>
      {role !== 'admin' && <BackButton onPress={signOut} style={styles.back} />}
      <View style={styles.headerRow}>
        <Logo size={64} showWordmark={false} compact />
        <View style={styles.headerText}>
          <Text style={styles.title}>Pêches disponibles</Text>
          <Text style={styles.subtitle}>Direct pêcheurs & restaurateurs</Text>
        </View>
      </View>
      <Text style={styles.meta}>Données chargées : {listingItems.length} pêches</Text>

      <Card style={styles.statusCard}>
        <Text style={styles.sectionTitle}>Bateaux en mer</Text>
        {listingItems.length === 0 ? (
          <Text style={styles.empty}>Aucun bateau signalé.</Text>
        ) : (
          listingItems.slice(0, 3).map((item) => (
            <Text key={item.id} style={styles.statusItem}>
              {item.fisherBoat ?? item.fisherName} • ETA {item.pickupWindow}
            </Text>
          ))
        )}
      </Card>

      <View style={styles.searchRow}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher un poisson, un port, un bateau..."
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
      </View>

      <Card style={styles.filterCard}>
        <Text style={styles.sectionTitle}>Filtres rapides</Text>
        <Field
          label="Port"
          value={filterPort}
          onChangeText={setFilterPort}
          placeholder="Ex: Sète, Oran..."
          onEndEditing={() => registerPort(filterPort)}
        />
        <Field
          label="Bateau / pêcheur"
          value={filterBoat}
          onChangeText={setFilterBoat}
          placeholder="Ex: L’Étoile Marine"
        />
        <Field
          label="Prix max (€/kg)"
          value={maxPrice}
          onChangeText={setMaxPrice}
          keyboardType="numeric"
          placeholder="Ex: 18"
        />
      </Card>
    </View>
  );

  return (
    <Screen style={styles.container}>
      <FlatList
        data={listingItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucune pêche trouvée.</Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            {item.imageUri && (
              <Image source={{ uri: item.imageUri }} style={styles.image} />
            )}
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardText}>{item.variety}</Text>
            <Text style={styles.cardText}>{item.pricePerKg} € / kg</Text>
            <Text style={styles.cardText}>Stock : {item.stockKg} kg</Text>
            <Text style={styles.cardMuted}>{item.location}</Text>
            <Text style={styles.cardMuted}>{item.pickupWindow}</Text>
            {canBuyer ? (
              <PrimaryButton
                label="Voir et réserver"
                onPress={() => onOpenListing(item.id)}
              />
            ) : (
              <Text style={styles.noticeText}>
                Réservation réservée aux acheteurs.
              </Text>
            )}
          </Card>
        )}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  back: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...textStyles.h2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...textStyles.caption,
    color: colors.muted,
  },
  meta: {
    ...textStyles.caption,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...textStyles.h3,
    marginBottom: spacing.sm,
  },
  statusCard: {
    marginBottom: spacing.md,
  },
  statusItem: {
    ...textStyles.caption,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  searchRow: {
    marginBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(11, 61, 104, 0.35)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
  },
  filterCard: {
    marginBottom: spacing.md,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  empty: {
    ...textStyles.caption,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
    borderColor: 'rgba(11, 61, 104, 0.2)',
  },
  image: {
    width: '100%',
    height: 140,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...textStyles.h3,
  },
  cardText: {
    ...textStyles.body,
    marginTop: spacing.xs,
  },
  cardMuted: {
    ...textStyles.caption,
    marginTop: spacing.xs,
  },
  noticeText: {
    ...textStyles.caption,
    color: colors.muted,
    marginTop: spacing.sm,
  },
});
