import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { useAppState } from '../../state/AppState';
import { colors, spacing } from '../../theme';

export const FisherHomeScreen: React.FC = () => {
  const { listings, favorites, toggleFavorite } = useAppState();

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Mes pêches du jour</Text>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
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
                  <Ionicons
                    name={favorites.includes(item.id) ? 'heart' : 'heart-outline'}
                    size={18}
                    color={favorites.includes(item.id) ? colors.danger : colors.muted}
                  />
                </Pressable>
                <Tag label={item.status === 'active' ? 'Active' : 'Clôturée'} />
              </View>
            </View>
            <Text style={styles.cardText}>{item.variety}</Text>
            <Text style={styles.cardText}>{item.pricePerKg} € / kg</Text>
            <Text style={styles.cardText}>Stock : {item.stockKg} kg</Text>
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
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: 140,
    borderRadius: 12,
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
  },
  cardText: {
    color: colors.text,
    marginTop: spacing.xs,
  },
  cardMuted: {
    color: colors.muted,
    marginTop: spacing.xs,
  },
});
