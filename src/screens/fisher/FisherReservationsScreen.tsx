import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../../components/Buttons';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { useAppState } from '../../state/AppState';
import { colors, spacing } from '../../theme';

export const FisherReservationsScreen: React.FC = () => {
  const { reservations, updateReservationStatus } = useAppState();

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Réservations reçues</Text>
      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>{item.listingTitle}</Text>
              <Tag
                label={
                  item.status === 'pending'
                    ? 'En attente'
                    : item.status === 'confirmed'
                    ? 'Confirmée'
                    : item.status === 'rejected'
                    ? 'Refusée'
                    : 'Livrée'
                }
                tone={
                  item.status === 'picked_up'
                    ? 'success'
                    : item.status === 'confirmed'
                    ? 'success'
                    : item.status === 'rejected'
                    ? 'danger'
                    : 'warning'
                }
              />
            </View>
            <Text style={styles.cardText}>Acheteur : {item.buyerName}</Text>
            <Text style={styles.cardText}>Quantité : {item.qtyKg} kg</Text>
            <Text style={styles.cardText}>Pickup : {item.pickupTime}</Text>
            {item.status === 'pending' && (
              <View style={styles.actionsRow}>
                <PrimaryButton
                  label="Confirmer la réservation"
                  onPress={() => updateReservationStatus(item.id, 'confirmed')}
                  style={styles.actionButton}
                />
                <PrimaryButton
                  label="Refuser"
                  onPress={() => updateReservationStatus(item.id, 'rejected')}
                  style={styles.rejectButton}
                />
              </View>
            )}
            {item.status === 'confirmed' && (
              <PrimaryButton
                label="Confirmer la remise"
                onPress={() => updateReservationStatus(item.id, 'picked_up')}
              />
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  cardText: {
    color: colors.text,
    marginBottom: spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: colors.danger,
  },
});
