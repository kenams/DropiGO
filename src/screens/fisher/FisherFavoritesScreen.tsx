import React, { useMemo } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { useAppState } from '../../state/AppState';
import { colors, radius, spacing, textStyles } from '../../theme';

export const FisherFavoritesScreen: React.FC = () => {
  const { listings, favorites, toggleFavorite } = useAppState();

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
      <Text style={styles.title}>Annonces suivies</Text>
      <FlatList
        data={favoriteListings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucune annonce suivie.</Text>
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
                <Tag label={item.status === 'active' ? 'Active' : 'Clôturée'} />
              </View>
            </View>
            <Text style={styles.cardText}>{item.variety}</Text>
            <Text style={styles.cardText}>{item.pricePerKg} € / kg</Text>
            <Text style={styles.cardText}>Stock : {item.stockKg} kg</Text>
            <View style={styles.tagRow}>
              {item.qualityTags.slice(0, 2).map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </View>
            <Text style={styles.cardMuted}>{item.location}</Text>
            <Text style={styles.cardMuted}>{item.pickupWindow}</Text>
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
    ...textStyles.h2,
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
    borderColor: 'rgba(226, 58, 46, 0.12)',
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
    ...textStyles.h3,
    flex: 1,
    marginRight: spacing.xs,
  },
  cardText: {
    ...textStyles.body,
    marginTop: spacing.xs,
  },
  cardMuted: {
    ...textStyles.caption,
    marginTop: spacing.xs,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});

