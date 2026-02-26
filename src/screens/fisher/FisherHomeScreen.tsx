import React from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../components/Card';
import { Logo } from '../../components/Logo';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { BackButton } from '../../components/BackButton';
import { useAppState } from '../../state/AppState';
import { colors, radius, spacing, textStyles } from '../../theme';

export const FisherHomeScreen: React.FC = () => {
  const { listings, signOut, role } = useAppState();

  const header = (
    <View>
      {role !== 'admin' && <BackButton onPress={signOut} style={styles.back} />}
      <View style={styles.headerRow}>
        <Logo size={64} showWordmark={false} compact />
        <View style={styles.headerText}>
          <Text style={styles.title}>Mes pêches du jour</Text>
          <Text style={styles.subtitle}>Ventes directes sans intermédiaires</Text>
        </View>
      </View>
      <Text style={styles.meta}>Données chargées : {listings.length} pêches</Text>

    </View>
  );

  return (
    <Screen style={styles.container}>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucune annonce pour le moment.</Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            {item.imageUri && (
              <Image source={{ uri: item.imageUri }} style={styles.image} />
            )}
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Tag label={item.status === 'active' ? 'Active' : 'Clôturée'} />
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
});
