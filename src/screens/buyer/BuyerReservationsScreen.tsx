import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { GhostButton, PrimaryButton } from '../../components/Buttons';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { useAppState } from '../../state/AppState';
import { exportPickupReceipt } from '../../services/pdf';
import { colors, spacing } from '../../theme';

export const BuyerReservationsScreen: React.FC = () => {
  const { reservations, updateReservationStatus, listings } = useAppState();

  const handleExport = async (reservationId: string) => {
    const reservation = reservations.find((item) => item.id === reservationId);
    if (!reservation) {
      return;
    }
    const listing = listings.find((item) => item.id === reservation.listingId);
    await exportPickupReceipt({
      listingTitle: reservation.listingTitle,
      qtyKg: reservation.qtyKg,
      pickupTime: reservation.pickupTime,
      buyerName: reservation.buyerName,
      fisherName: listing?.fisherName ?? 'Pêcheur',
      location: listing?.location ?? 'Lieu non défini',
    });
  };

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Mes réservations</Text>
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
            <Text style={styles.cardText}>Quantité : {item.qtyKg} kg</Text>
            <Text style={styles.cardText}>Pickup : {item.pickupTime}</Text>
            {item.status === 'pending' && (
              <Text style={styles.pendingText}>
                En attente de confirmation du pêcheur.
              </Text>
            )}
            {item.status === 'rejected' && (
              <Text style={styles.pendingText}>
                Réservation refusée par le pêcheur.
              </Text>
            )}
            <View style={styles.actions}>
              {item.status === 'confirmed' && (
                <PrimaryButton
                  label="Confirmer la réception"
                  onPress={() => updateReservationStatus(item.id, 'picked_up')}
                />
              )}
              {(item.status === 'confirmed' || item.status === 'picked_up') && (
                <GhostButton
                  label="Télécharger le bon de retrait (PDF)"
                  onPress={() => handleExport(item.id)}
                />
              )}
            </View>
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
  pendingText: {
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
});
