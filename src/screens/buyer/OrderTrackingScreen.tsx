import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { GhostButton, PrimaryButton } from '../../components/Buttons';
import { BackButton } from '../../components/BackButton';
import { MapPreview } from '../../components/MapPreview';
import { useAppState } from '../../state/AppState';
import { colors, radius, spacing, textStyles } from '../../theme';

type Props = {
  reservationId: string;
  onBack?: () => void;
};

export const OrderTrackingScreen: React.FC<Props> = ({ reservationId, onBack }) => {
  const {
    reservations,
    listings,
    setBuyerConformity,
    releaseEscrow,
    role,
  } = useAppState();
  const canBuyer = role === 'buyer' || role === 'admin';
  const [note, setNote] = useState('');

  const reservation = useMemo(
    () => reservations.find((item) => item.id === reservationId),
    [reservations, reservationId]
  );
  const listing = useMemo(
    () => listings.find((item) => item.id === reservation?.listingId),
    [listings, reservation]
  );
  const mapLat = reservation?.gpsLat ?? listing?.latitude;
  const mapLng = reservation?.gpsLng ?? listing?.longitude;
  const gpsTime = reservation?.gpsUpdatedAt
    ? new Date(reservation.gpsUpdatedAt).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  if (!reservation) {
    return (
      <Screen style={styles.container}>
        <Text style={styles.title}>Commande introuvable</Text>
      </Screen>
    );
  }

  const deliveryLabel =
    reservation.deliveryStatus === 'approaching_port'
      ? 'Approche du port'
      : reservation.deliveryStatus === 'arrived'
      ? 'Arrivé au port'
      : reservation.deliveryStatus === 'delivered'
      ? 'Livré'
      : 'En mer';

  const escrowLabel =
    reservation.escrowStatus === 'released'
      ? 'Paiement débloqué'
      : reservation.escrowStatus === 'hold'
      ? 'Litige en cours'
      : reservation.escrowStatus === 'refunded'
      ? 'Remboursé'
      : reservation.escrowStatus === 'escrowed'
      ? 'Séquestré'
      : 'Non payé';

  const canRelease =
    reservation.status === 'picked_up' &&
    reservation.buyerConformity === 'conform' &&
    reservation.escrowStatus !== 'released';

  return (
    <Screen scroll style={styles.container}>
      {onBack && <BackButton onPress={onBack} style={styles.back} />}
      <Text style={styles.title}>Suivi commande</Text>
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>{reservation.listingTitle}</Text>
        <Text style={styles.meta}>Quantité : {reservation.qtyKg} kg</Text>
        <Text style={styles.meta}>Port : {listing?.location ?? '—'}</Text>
        <Text style={styles.meta}>ETA : {reservation.eta ?? reservation.pickupTime}</Text>
        <Text style={styles.meta}>Statut : {deliveryLabel}</Text>
        <Text style={styles.meta}>Paiement : {escrowLabel}</Text>
        {reservation.gpsLat !== undefined && reservation.gpsLng !== undefined && (
          <Text style={styles.meta}>
            Position : {reservation.gpsLat.toFixed(4)}, {reservation.gpsLng.toFixed(4)}
            {gpsTime ? ` (maj ${gpsTime})` : ''}
          </Text>
        )}
      </Card>

      {mapLat !== undefined && mapLng !== undefined && (
        <MapPreview latitude={mapLat} longitude={mapLng} />
      )}

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Validation marchandise</Text>
        {canBuyer ? (
          <>
            <Text style={styles.meta}>Choisissez après contrôle au quai.</Text>
            <View style={styles.actions}>
              <PrimaryButton
                label="Marchandise conforme"
                onPress={() => setBuyerConformity(reservation.id, 'conform')}
              />
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Motif de non-conformité"
                placeholderTextColor={colors.muted}
                style={styles.noteInput}
              />
              <GhostButton
                label="Signaler non-conformité"
                onPress={() => setBuyerConformity(reservation.id, 'non_conform', note)}
              />
            </View>
          </>
        ) : (
          <Text style={styles.noticeText}>
            Actions réservées aux acheteurs.
          </Text>
        )}
      </Card>

      {reservation.buyerConformity === 'non_conform' && (
        <Text style={styles.warningText}>
          Litige en cours. L’équipe DroPiPêche analyse votre signalement.
        </Text>
      )}
      {reservation.buyerConformity === 'conform' &&
        reservation.status !== 'picked_up' && (
          <Text style={styles.waitingText}>
            En attente de la confirmation de remise par le pêcheur.
          </Text>
        )}
      {canRelease && canBuyer && (
        <PrimaryButton
          label="Débloquer le paiement"
          onPress={() => releaseEscrow(reservation.id)}
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  back: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  title: {
    ...textStyles.h2,
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...textStyles.h3,
    marginBottom: spacing.xs,
  },
  meta: {
    ...textStyles.caption,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...textStyles.h3,
    marginBottom: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
  noteInput: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    fontFamily: textStyles.body.fontFamily,
    color: colors.text,
    backgroundColor: 'transparent',
  },
  waitingText: {
    ...textStyles.caption,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  warningText: {
    ...textStyles.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  noticeText: {
    ...textStyles.caption,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
});
