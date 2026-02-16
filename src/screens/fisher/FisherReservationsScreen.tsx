import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { GhostButton, PrimaryButton } from '../../components/Buttons';
import { BackButton } from '../../components/BackButton';
import { Card } from '../../components/Card';
import { CompensationNotice } from '../../components/CompensationNotice';
import { ReservationTimeline } from '../../components/ReservationTimeline';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { compensationPolicy } from '../../services/compensation';
import { useAppState } from '../../state/AppState';
import { colors, spacing, textStyles } from '../../theme';

type Props = { onBack?: () => void };

const FisherReservationsContent: React.FC<Props> = ({ onBack }) => {
  const {
    reservations,
    updateReservationStatus,
    confirmBuyerArrival,
    declareFisherArrival,
    declareDelay,
    cancelAfterArrival,
    updateDeliveryStatus,
  } = useAppState();

  const ratePercent = Math.round(compensationPolicy.rate * 100);

  return (
    <Screen style={styles.container}>
      {onBack && <BackButton onPress={onBack} style={styles.back} />}
      <Text style={styles.title}>Réservations reçues</Text>
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
              ? 'Livré'
              : 'En mer';

          const conformityLabel =
            item.buyerConformity === 'conform'
              ? 'Conforme'
              : item.buyerConformity === 'non_conform'
              ? 'Non conforme'
              : 'En attente';

          return (
            <Card style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{item.listingTitle}</Text>
                <Tag label={statusLabel} tone={statusTone} />
              </View>
              <Text style={styles.cardText}>Acheteur : {item.buyerName}</Text>
              <Text style={styles.cardText}>Quantité : {item.qtyKg} kg</Text>
              <Text style={styles.cardText}>Retrait : {item.pickupTime}</Text>
              <Text style={styles.cardText}>
                Total estimé : {item.totalPrice.toFixed(2)} €
              </Text>
              {item.note && <Text style={styles.note}>Note : {item.note}</Text>}
              <View style={styles.paymentRow}>
                <Tag
                  label={escrowLabel}
                  tone={escrowTone}
                />
              </View>
              <ReservationTimeline status={item.status} />
              {item.deliveryStatus && (
                <Text style={styles.note}>Suivi : {deliveryLabel}</Text>
              )}
              <Text style={styles.note}>Conformité : {conformityLabel}</Text>
              {item.compensation && (
                <CompensationNotice compensation={item.compensation} viewerRole="fisher" />
              )}

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
                    tone="danger"
                    style={styles.actionButton}
                  />
                </View>
              )}
              {item.status === 'confirmed' && (
                <View style={styles.arrivalBox}>
                  <Text style={styles.sectionTitle}>Arrivée & RDV</Text>
                  {!item.fisherArrivalDeclaredAt && (
                    <PrimaryButton
                      label="Je suis au point de RDV"
                      onPress={() => declareFisherArrival(item.id)}
                    />
                  )}
                  {item.fisherArrivalDeclaredAt && (
                    <Text style={styles.confirmText}>
                      Présence pêcheur confirmée.
                    </Text>
                  )}
                  {item.buyerArrivalRequestedAt && !item.buyerArrivalConfirmedAt && (
                    <GhostButton
                      label="Confirmer arrivée acheteur"
                      onPress={() => confirmBuyerArrival(item.id)}
                    />
                  )}
                  {item.buyerArrivalConfirmedAt && (
                    <Text style={styles.confirmText}>
                      Arrivée acheteur confirmée.
                    </Text>
                  )}
                  {item.fisherArrivalDeclaredAt && !item.compensation && (
                    <>
                      <View style={styles.trackRow}>
                        <GhostButton
                          label="En mer"
                          onPress={() => updateDeliveryStatus(item.id, 'at_sea')}
                        />
                        <GhostButton
                          label="Approche"
                          onPress={() =>
                            updateDeliveryStatus(item.id, 'approaching_port')
                          }
                        />
                        <GhostButton
                          label="Arrivé"
                          onPress={() => updateDeliveryStatus(item.id, 'arrived')}
                        />
                      </View>
                      <View style={styles.incidentActions}>
                        <GhostButton
                          label="Acheteur en retard"
                          onPress={() => declareDelay(item.id, 'buyer')}
                        />
                        <GhostButton
                          label="Acheteur absent / annulation"
                          onPress={() => cancelAfterArrival(item.id, 'buyer')}
                        />
                      </View>
                    </>
                  )}
                  <Text style={styles.policyText}>
                    Barème : {ratePercent}% du total, min {compensationPolicy.min} €, max{' '}
                    {compensationPolicy.max} € (retard &gt; {compensationPolicy.lateThresholdMinutes} min).
                  </Text>
                </View>
              )}
              {item.status === 'confirmed' && (
                <PrimaryButton
                  label="Confirmer la remise"
                  onPress={() => updateReservationStatus(item.id, 'picked_up')}
                />
              )}
            </Card>
          );
        }}
      />
    </Screen>
  );
};

export const FisherReservationsScreen: React.FC = () => {
  return <FisherReservationsContent />;
};

export const FisherReservationsStandalone: React.FC<Props> = ({ onBack }) => {
  return <FisherReservationsContent onBack={onBack} />;
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
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  note: {
    ...textStyles.caption,
    marginBottom: spacing.sm,
  },
  paymentRow: {
    marginBottom: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  arrivalBox: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
    gap: spacing.xs,
  },
  incidentActions: {
    gap: spacing.xs,
  },
  trackRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  sectionTitle: {
    ...textStyles.bodyBold,
    marginBottom: spacing.xs,
  },
  confirmText: {
    ...textStyles.caption,
    color: colors.success,
  },
  policyText: {
    ...textStyles.caption,
    color: colors.muted,
  },
});


