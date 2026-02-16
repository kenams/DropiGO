import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GhostButton, PrimaryButton } from '../../components/Buttons';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { MapPreview } from '../../components/MapPreview';
import { useAppState } from '../../state/AppState';
import { colors, radius, spacing, textStyles } from '../../theme';
import { BuyerStackParamList } from '../../navigation/types';

type RouteProps = RouteProp<BuyerStackParamList, 'ListingDetail'>;

type ListingDetailProps = {
  listingId: string;
  onBack?: () => void;
};

const ListingDetailContent: React.FC<ListingDetailProps> = ({
  listingId,
  onBack,
}) => {
  const { listings, createReservation, addToCart } = useAppState();
  const [qtyKg, setQtyKg] = useState(1);
  const [pickupTime, setPickupTime] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const listing = useMemo(
    () => listings.find((item) => item.id === listingId),
    [listings, listingId]
  );

  if (!listing) {
    return (
      <Screen style={styles.container}>
        <Text style={styles.title}>Annonce introuvable</Text>
      </Screen>
    );
  }

  const handleReserve = () => {
    if (!pickupTime) {
      setError('Choisissez un créneau de retrait.');
      return;
    }
    if (qtyKg <= 0 || qtyKg > listing.stockKg) {
      setError('Quantité invalide.');
      return;
    }
    createReservation(listing.id, qtyKg, pickupTime, note.trim() || undefined);
    setError('');
    if (onBack) {
      onBack();
    }
  };

  const quickQty = [1, 2, 5, 10];
  const availableSlots =
    listing.pickupSlots && listing.pickupSlots.length > 0
      ? listing.pickupSlots
      : [listing.pickupWindow];
  const totalPrice = qtyKg * listing.pricePerKg;

  return (
    <Screen scroll>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{listing.title}</Text>
        {onBack && (
          <Pressable onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={18} color={colors.primaryDark} />
          </Pressable>
        )}
      </View>
      <Text style={styles.subtitle}>Pêcheur : {listing.fisherName}</Text>
      <Card style={styles.card}>
        {listing.imageUri && (
          <Image source={{ uri: listing.imageUri }} style={styles.image} />
        )}
        <Text style={styles.cardText}>{listing.variety}</Text>
        <Text style={styles.cardText}>{listing.pricePerKg} € / kg</Text>
        <Text style={styles.cardText}>Stock : {listing.stockKg} kg</Text>
        <Text style={styles.cardMuted}>Pêche : {listing.catchDate}</Text>
        <Text style={styles.cardMuted}>Méthode : {listing.method}</Text>
        <Text style={styles.cardMuted}>Calibre : {listing.sizeGrade}</Text>
        <Text style={styles.cardMuted}>
          Bateau : {listing.fisherBoat ?? '—'}
        </Text>
        <Text style={styles.cardMuted}>
          Licence : {listing.fisherPermit ?? '—'}
        </Text>
        <Text style={styles.cardMuted}>
          Immatriculation : {listing.fisherRegistration ?? '—'}
        </Text>
        <Text style={styles.cardMuted}>{listing.location}</Text>
        <Text style={styles.cardMuted}>{listing.pickupWindow}</Text>
        <View style={styles.tagRow}>
          {listing.qualityTags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </View>
      </Card>

      {listing.latitude !== undefined && listing.longitude !== undefined && (
        <MapPreview latitude={listing.latitude} longitude={listing.longitude} />
      )}

      <Text style={styles.sectionTitle}>Réserver</Text>
      <Text style={styles.paymentNote}>
        Paiement séquestré • débloqué après validation conjointe
      </Text>

      <Text style={styles.label}>Quantité (kg)</Text>
      <View style={styles.qtyRow}>
        {quickQty.map((value) => (
          <Pressable
            key={value}
            onPress={() => setQtyKg(Math.min(value, listing.stockKg))}
            style={[styles.qtyChip, qtyKg === value && styles.qtyChipActive]}
          >
            <Text style={[styles.qtyChipText, qtyKg === value && styles.qtyChipTextActive]}>
              {value} kg
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.qtyInputRow}>
        <Pressable
          onPress={() => setQtyKg((prev) => Math.max(1, prev - 1))}
          style={styles.qtyButton}
        >
          <Text style={styles.qtyButtonText}>-</Text>
        </Pressable>
        <TextInput
          value={String(qtyKg)}
          onChangeText={(value) => {
            const next = Number(value.replace(',', '.'));
            if (Number.isFinite(next)) {
              setQtyKg(Math.max(1, Math.min(next, listing.stockKg)));
            }
          }}
          keyboardType="numeric"
          style={styles.qtyInput}
        />
        <Pressable
          onPress={() => setQtyKg((prev) => Math.min(listing.stockKg, prev + 1))}
          style={styles.qtyButton}
        >
          <Text style={styles.qtyButtonText}>+</Text>
        </Pressable>
      </View>
      <Text style={styles.helper}>Stock disponible : {listing.stockKg} kg</Text>

      <Text style={styles.label}>Créneau de retrait</Text>
      <View style={styles.slotRow}>
        {availableSlots.map((slot) => (
          <Pressable
            key={slot}
            onPress={() => setPickupTime(slot)}
            style={[styles.slotChip, pickupTime === slot && styles.slotChipActive]}
          >
            <Text style={[styles.slotChipText, pickupTime === slot && styles.slotChipTextActive]}>
              {slot}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Note pour le pêcheur (optionnel)</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Ex: prévoir glaçons, remise à quai"
        placeholderTextColor={colors.muted}
        style={styles.noteInput}
        multiline
      />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total estimé</Text>
        <Text style={styles.totalValue}>{totalPrice.toFixed(2)} €</Text>
      </View>

      {error.length > 0 && <Text style={styles.error}>{error}</Text>}
      <View style={styles.actions}>
        <PrimaryButton label="Payer en séquestre" onPress={handleReserve} />
        <GhostButton
          label="Ajouter au panier"
          onPress={() => addToCart(listing.id, qtyKg)}
        />
      </View>
    </Screen>
  );
};

export const ListingDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { params } = useRoute<RouteProps>();

  return (
    <ListingDetailContent
      listingId={params.listingId}
      onBack={() => navigation.goBack()}
    />
  );
};

export const ListingDetailStandalone: React.FC<ListingDetailProps> = (props) => (
  <ListingDetailContent {...props} />
);

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...textStyles.h2,
    marginBottom: spacing.xs,
    flex: 1,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  subtitle: {
    ...textStyles.caption,
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.lg,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  cardText: {
    ...textStyles.body,
    marginBottom: spacing.xs,
  },
  cardMuted: {
    ...textStyles.caption,
    marginBottom: spacing.xs,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...textStyles.h3,
    marginBottom: spacing.sm,
  },
  paymentNote: {
    ...textStyles.caption,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  label: {
    ...textStyles.label,
    marginBottom: spacing.xs,
  },
  qtyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  qtyChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  qtyChipActive: {
    borderColor: colors.accent,
    backgroundColor: 'transparent',
  },
  qtyChipText: {
    ...textStyles.caption,
    color: colors.muted,
  },
  qtyChipTextActive: {
    color: colors.primaryDark,
    fontFamily: textStyles.bodyBold.fontFamily,
  },
  qtyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  qtyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  qtyButtonText: {
    ...textStyles.bodyBold,
    color: colors.primaryDark,
    fontSize: 16,
  },
  qtyInput: {
    minWidth: 80,
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
  helper: {
    ...textStyles.caption,
    marginBottom: spacing.md,
  },
  slotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  slotChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  slotChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  slotChipText: {
    ...textStyles.caption,
    color: colors.muted,
  },
  slotChipTextActive: {
    color: colors.primaryDark,
    fontFamily: textStyles.bodyBold.fontFamily,
  },
  noteInput: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    fontFamily: textStyles.body.fontFamily,
    color: colors.text,
    backgroundColor: 'transparent',
    marginBottom: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  totalLabel: {
    ...textStyles.bodyBold,
  },
  totalValue: {
    ...textStyles.h3,
    color: colors.accentDark,
  },
  error: {
    ...textStyles.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
});
