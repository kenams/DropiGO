import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { GhostButton, PrimaryButton } from '../../components/Buttons';
import { BackButton } from '../../components/BackButton';
import { Card } from '../../components/Card';
import { CompensationNotice } from '../../components/CompensationNotice';
import { ReservationTimeline } from '../../components/ReservationTimeline';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { compensationPolicy } from '../../services/compensation';
import { useAppState } from '../../state/AppState';
import { exportPickupReceipt } from '../../services/pdf';
import { colors, spacing, textStyles } from '../../theme';
import { BuyerStackParamList } from '../../navigation/types';

type Props = {
  onBack?: () => void;
  onOpenTracking?: (id: string) => void;
  onOpenChat?: (threadId: string) => void;
};

const BuyerReservationsContent: React.FC<Props> = ({
  onBack,
  onOpenTracking,
  onOpenChat,
}) => {
  const {
    reservations,
    listings,
    requestBuyerArrival,
    declareDelay,
    cancelAfterArrival,
    startChat,
    role,
  } = useAppState();
  const canBuyer = role === 'buyer' || role === 'admin';

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
      checkoutId: reservation.checkoutId,
    });
  };

  const ratePercent = Math.round(compensationPolicy.rate * 100);

  return (
    <Screen style={styles.container}>
      {onBack && <BackButton onPress={onBack} style={styles.back} />}
      <Text style={styles.title}>Mes réservations</Text>
      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const statusLabel =
            item.status === 'pending'
              ? 'En attente'
              : item.status === 'confirmed'
              ? 'Confirmée'
              : item.status === 'rejected'
              ? item.cancellationBy
                ? item.cancellationBy === 'fisher'
                  ? 'Annulée (pêcheur)'
                  : 'Annulée (acheteur)'
                : 'Refusée'
              : 'Livrée';
          const statusTone =
            item.status === 'picked_up'
              ? 'success'
              : item.status === 'confirmed'
              ? 'success'
              : item.status === 'rejected'
              ? 'danger'
              : 'warning';

          const escrowLabel =
            item.escrowStatus === 'released'
              ? 'Paiement débloqué'
              : item.escrowStatus === 'escrowed'
              ? 'Séquestre actif'
              : item.escrowStatus === 'hold'
              ? 'Litige en cours'
              : item.escrowStatus === 'refunded'
              ? 'Remboursé'
              : 'Non payé';
          const escrowTone =
            item.escrowStatus === 'released'
              ? 'success'
              : item.escrowStatus === 'hold'
              ? 'danger'
              : item.escrowStatus === 'refunded'
              ? 'warning'
              : item.escrowStatus === 'escrowed'
              ? 'success'
              : 'warning';

          const deliveryLabel =
            item.deliveryStatus === 'approaching_port'
              ? 'Approche du port'
              : item.deliveryStatus === 'arrived'
              ? 'Arrivé au port'
              : item.deliveryStatus === 'delivered'
              ? 'Remis'
              : 'En mer';

          const conformityLabel =
            item.buyerConformity === 'conform'
              ? 'Conforme'
              : item.buyerConformity === 'non_conform'
              ? 'Non conforme'
              : 'En attente';

          const canChat = item.status === 'confirmed' || item.status === 'picked_up';

          return (
            <Card style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{item.listingTitle}</Text>
                <Tag label={statusLabel} tone={statusTone} />
              </View>
              <Text style={styles.cardText}>Quantité : {item.qtyKg} kg</Text>
              <Text style={styles.cardText}>Retrait : {item.pickupTime}</Text>
              <Text style={styles.cardText}>
                Total estimé : {item.totalPrice.toFixed(2)} €
              </Text>
              <Text style={styles.pendingText}>Séquestre : {escrowLabel}</Text>
              <Text style={styles.pendingText}>Suivi : {deliveryLabel}</Text>
              <Text style={styles.pendingText}>
                Conformité : {conformityLabel}
              </Text>
              {item.note && (
                <Text style={styles.pendingText}>Note : {item.note}</Text>
              )}
              <View style={styles.paymentRow}>
                <Tag
                  label={escrowLabel}
                  tone={escrowTone}
                />
              </View>
              <ReservationTimeline status={item.status} />
              {item.status === 'pending' && (
                <Text style={styles.pendingText}>
                  En attente de confirmation du pêcheur.
                </Text>
              )}
              {item.status === 'rejected' && (
                <Text style={styles.pendingText}>
                  {item.cancellationBy === 'buyer'
                    ? 'Réservation annulée par l\'acheteur.'
                    : item.cancellationBy === 'fisher'
                    ? 'Réservation annulée par le pêcheur.'
                    : 'Réservation refusée par le pêcheur.'}
                </Text>
              )}
              {item.compensation && (
                <CompensationNotice compensation={item.compensation} viewerRole="buyer" />
              )}

              {item.status === 'confirmed' && (
                <View style={styles.arrivalBox}>
                  <Text style={styles.sectionTitle}>Arrivée au point de RDV</Text>
                  {canBuyer ? (
                    <>
                      {!item.buyerArrivalRequestedAt && (
                        <PrimaryButton
                          label="Je suis arrivé au point de RDV"
                          onPress={() => requestBuyerArrival(item.id)}
                        />
                      )}
                      {item.buyerArrivalRequestedAt &&
                        !item.buyerArrivalConfirmedAt && (
                          <Text style={styles.pendingText}>
                            Arrivée signalée. En attente de confirmation du pêcheur.
                          </Text>
                        )}
                      {item.buyerArrivalConfirmedAt && (
                        <Text style={styles.confirmText}>
                          Arrivée confirmée par le pêcheur.
                        </Text>
                      )}
                      {item.buyerArrivalConfirmedAt && !item.compensation && (
                        <View style={styles.incidentActions}>
                          <GhostButton
                            label="Signaler retard du pêcheur"
                            onPress={() => declareDelay(item.id, 'fisher')}
                          />
                          <GhostButton
                            label="Pêcheur a annulé"
                            onPress={() => cancelAfterArrival(item.id, 'fisher')}
                          />
                        </View>
                      )}
                    </>
                  ) : (
                    <Text style={styles.noticeText}>
                      Actions réservées aux acheteurs.
                    </Text>
                  )}
                  <Text style={styles.policyText}>
                    Barème : {ratePercent}% du total, min {compensationPolicy.min} €, max{' '}
                    {compensationPolicy.max} € (retard &gt; {compensationPolicy.lateThresholdMinutes} min).
                  </Text>
                </View>
              )}

              <View style={styles.actions}>
                {canBuyer && canChat && (
                  <GhostButton
                    label="Contacter le pêcheur"
                    onPress={async () => {
                      const threadId = await startChat(item.listingId, {
                        buyerId: item.buyerId,
                        buyerName: item.buyerName,
                        listingTitle: item.listingTitle,
                        fisherId: listings.find((l) => l.id === item.listingId)?.fisherId,
                        fisherName: listings.find((l) => l.id === item.listingId)?.fisherName,
                      });
                      onOpenChat?.(threadId);
                    }}
                  />
                )}
                {onOpenTracking && canBuyer && (
                  <GhostButton
                    label="Suivre la commande"
                    onPress={() => onOpenTracking(item.id)}
                  />
                )}
                {item.status !== 'rejected' && canBuyer && (
                  <GhostButton
                    label="Télécharger le bon de retrait (PDF)"
                    onPress={() => handleExport(item.id)}
                  />
                )}
              </View>
            </Card>
          );
        }}
      />
    </Screen>
  );
};

export const BuyerReservationsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<BuyerStackParamList>>();
  return (
    <BuyerReservationsContent
      onOpenTracking={(id) =>
        navigation.navigate('OrderTracking', { reservationId: id })
      }
      onOpenChat={(threadId) =>
        (navigation as any).navigate('ChatDetail', { threadId })
      }
    />
  );
};

export const BuyerReservationsStandalone: React.FC<Props> = ({
  onBack,
  onOpenTracking,
  onOpenChat,
}) => {
  return (
    <BuyerReservationsContent
      onBack={onBack}
      onOpenTracking={onOpenTracking}
      onOpenChat={onOpenChat}
    />
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
  title: {
    ...textStyles.h2,
    marginBottom: spacing.md,
  },
  list: {
    paddingBottom: spacing.xxl,
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
    ...textStyles.h3,
  },
  cardText: {
    ...textStyles.body,
    marginBottom: spacing.xs,
  },
  pendingText: {
    ...textStyles.caption,
    marginBottom: spacing.sm,
  },
  confirmText: {
    ...textStyles.caption,
    color: colors.success,
    marginBottom: spacing.sm,
  },
  paymentRow: {
    marginBottom: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
  arrivalBox: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  incidentActions: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...textStyles.bodyBold,
    marginBottom: spacing.sm,
  },
  policyText: {
    ...textStyles.caption,
    color: colors.muted,
  },
  noticeText: {
    ...textStyles.caption,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
});


