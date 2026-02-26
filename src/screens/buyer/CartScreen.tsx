import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { PrimaryButton, GhostButton } from '../../components/Buttons';
import { useAppState } from '../../state/AppState';
import { colors, radius, spacing, textStyles } from '../../theme';

const COMMISSION_RATE = 0.08;

type Props = { onBack?: () => void };

const CartContent: React.FC<Props> = ({ onBack }) => {
  const { cart, updateCartQty, removeCartItem, clearCart, checkoutCart, role } =
    useAppState();
  const canBuyer = role === 'buyer' || role === 'admin';
  const [pickupTime, setPickupTime] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const totals = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.qtyKg * item.pricePerKg,
      0
    );
    const commission = subtotal * COMMISSION_RATE;
    const total = subtotal + commission;
    return { subtotal, commission, total };
  }, [cart]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      return;
    }
    if (!pickupTime.trim()) {
      setError('Indiquez un créneau de retrait.');
      return;
    }
    checkoutCart(pickupTime.trim(), note.trim() || undefined);
    setPickupTime('');
    setNote('');
    setError('');
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>Panier</Text>
      <Text style={styles.subtitle}>Multi-produits • Paiement unique</Text>

      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Panier vide.</Text>}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.meta}>{item.fisherName}</Text>
            <Text style={styles.meta}>{item.location}</Text>
            <Text style={styles.meta}>{item.pricePerKg.toFixed(2)} € / kg</Text>
            {canBuyer ? (
              <View style={styles.qtyRow}>
                <Pressable
                  style={styles.qtyButton}
                  onPress={() => updateCartQty(item.id, item.qtyKg - 1)}
                >
                  <Text style={styles.qtyButtonText}>-</Text>
                </Pressable>
                <TextInput
                  value={String(item.qtyKg)}
                  onChangeText={(value) => {
                    const next = Number(value.replace(',', '.'));
                    if (Number.isFinite(next)) {
                      updateCartQty(item.id, next);
                    }
                  }}
                  keyboardType="numeric"
                  style={styles.qtyInput}
                />
                <Pressable
                  style={styles.qtyButton}
                  onPress={() => updateCartQty(item.id, item.qtyKg + 1)}
                >
                  <Text style={styles.qtyButtonText}>+</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={styles.readOnlyText}>
                Quantité : {item.qtyKg} kg
              </Text>
            )}
            <Text style={styles.lineTotal}>
              Sous-total: {(item.qtyKg * item.pricePerKg).toFixed(2)} €
            </Text>
            {canBuyer && (
              <GhostButton label="Retirer" onPress={() => removeCartItem(item.id)} />
            )}
          </Card>
        )}
      />

      <Card style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Récapitulatif</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.meta}>Total marchandise</Text>
          <Text style={styles.meta}>{totals.subtotal.toFixed(2)} €</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.meta}>Commission DroPiPêche (8%)</Text>
          <Text style={styles.meta}>{totals.commission.toFixed(2)} €</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.totalLabel}>Total à payer</Text>
          <Text style={styles.totalValue}>{totals.total.toFixed(2)} €</Text>
        </View>
      </Card>
      <Text style={styles.notice}>
        Paiement placé en séquestre jusqu’à validation de la remise.
      </Text>

      {canBuyer ? (
        <>
          <Text style={styles.sectionTitle}>Créneau de retrait</Text>
          <TextInput
            value={pickupTime}
            onChangeText={setPickupTime}
            placeholder="Ex: Aujourd'hui 18:00"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <Text style={styles.sectionTitle}>
            Note pour le pêcheur (optionnel)
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Ex: préparer en caissettes"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />

          {error.length > 0 && <Text style={styles.error}>{error}</Text>}

          <View style={styles.actions}>
            <PrimaryButton label="Payer en séquestre" onPress={handleCheckout} />
            <GhostButton label="Vider le panier" onPress={clearCart} />
          </View>
        </>
      ) : (
        <Text style={styles.noticeText}>
          Actions de paiement réservées aux acheteurs.
        </Text>
      )}
    </Screen>
  );
};

export const CartScreen: React.FC = () => {
  return <CartContent />;
};

export const CartStandalone: React.FC<Props> = ({ onBack }) => {
  return <CartContent onBack={onBack} />;
};

const styles = StyleSheet.create({
  title: {
    ...textStyles.h2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...textStyles.caption,
    marginBottom: spacing.md,
  },
  list: {
    paddingBottom: spacing.md,
  },
  empty: {
    ...textStyles.caption,
    marginTop: spacing.lg,
    textAlign: 'center',
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
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  qtyButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonText: {
    ...textStyles.bodyBold,
    color: colors.text,
  },
  qtyInput: {
    minWidth: 70,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    textAlign: 'center',
    fontFamily: textStyles.bodyBold.fontFamily,
    color: colors.text,
    backgroundColor: 'transparent',
  },
  lineTotal: {
    ...textStyles.caption,
    marginBottom: spacing.sm,
  },
  readOnlyText: {
    ...textStyles.caption,
    color: colors.muted,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  summaryCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...textStyles.h3,
    marginBottom: spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  totalLabel: {
    ...textStyles.bodyBold,
  },
  totalValue: {
    ...textStyles.h3,
    color: colors.accentDark,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
    fontFamily: textStyles.body.fontFamily,
    color: colors.text,
    backgroundColor: 'transparent',
  },
  error: {
    ...textStyles.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
  notice: {
    ...textStyles.caption,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  noticeText: {
    ...textStyles.caption,
    color: colors.muted,
    marginBottom: spacing.lg,
  },
});
