import React, { useMemo } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { useAppState } from '../../state/AppState';
import { colors, radius, spacing } from '../../theme';
import { BuyerTabsParamList } from '../../navigation/types';

export const FavoritesScreen: React.FC = () => {
  const { listings, favorites, toggleFavorite } = useAppState();
  const navigation = useNavigation<BottomTabNavigationProp<BuyerTabsParamList>>();

  const favoriteListings = useMemo(() => {
    return listings
      .filter((item) => favorites.includes(item.id))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [listings, favorites]);

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Mes favoris</Text>
      <FlatList
        data={favoriteListings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun favori pour le moment.</Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            {item.imageUri && (
              <Image source={{ uri: item.imageUri }} style={styles.image} />
            )}
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.rowEnd}>
                <Pressable
                  onPress={() => toggleFavorite(item.id)}
                  style={styles.favoriteButton}
                >
                  <Ionicons name="heart" size={18} color={colors.danger} />
                </Pressable>
                <Tag label={item.status === 'active' ? 'Disponible' : 'Clôturé'} />
              </View>
            </View>
            <Text style={styles.cardText}>{item.variety}</Text>
            <Text style={styles.cardText}>{item.pricePerKg} € / kg</Text>
            <Text style={styles.cardText}>Stock : {item.stockKg} kg</Text>
            <Text style={styles.cardMuted}>{item.location}</Text>
            <Text style={styles.cardMuted}>{item.pickupWindow}</Text>
            <Pressable
              onPress={() =>
                navigation.navigate('Feed', {
                  screen: 'ListingDetail',
                  params: { listingId: item.id },
                })
              }
              style={styles.detailButton}
            >
              <Text style={styles.detailButtonText}>Voir le détail</Text>
            </Pressable>
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
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
  detailButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  detailButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
