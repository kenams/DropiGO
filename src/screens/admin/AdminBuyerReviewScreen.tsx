import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { GhostButton, PrimaryButton } from '../../components/Buttons';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { useAppState } from '../../state/AppState';
import { colors, spacing, textStyles } from '../../theme';
import { BuyerApplicantStatus } from '../../types';

const statusLabel: Record<BuyerApplicantStatus, string> = {
  pending: 'En attente',
  approved: 'Validé',
  rejected: 'Refusé',
};

export const AdminBuyerReviewScreen: React.FC = () => {
  const { buyerApplicants, updateBuyerApplicantStatus } = useAppState();

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Validation acheteurs</Text>
      <FlatList
        data={buyerApplicants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>{item.company}</Text>
              <Tag
                label={statusLabel[item.status]}
                tone={
                  item.status === 'approved'
                    ? 'success'
                    : item.status === 'rejected'
                    ? 'danger'
                    : 'warning'
                }
              />
            </View>
            <Text style={styles.meta}>Contact : {item.name}</Text>
            <Text style={styles.meta}>Registre : {item.registry}</Text>
            <Text style={styles.meta}>Activité : {item.activity}</Text>
            <Text style={styles.meta}>Paiement : {item.paymentMethod}</Text>
            <Text style={styles.meta}>Téléphone : {item.phone}</Text>
            <Text style={styles.meta}>Email : {item.email}</Text>
            <Text style={styles.meta}>Adresse : {item.address}</Text>

            <View style={styles.actions}>
              <PrimaryButton
                label="Valider"
                onPress={() => updateBuyerApplicantStatus(item.id, 'approved')}
                disabled={item.status === 'approved'}
                style={styles.actionButton}
              />
              <GhostButton
                label="Refuser"
                onPress={() => updateBuyerApplicantStatus(item.id, 'rejected')}
              />
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
    ...textStyles.h2,
    marginBottom: spacing.md,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  card: {
    marginBottom: spacing.md,
    borderColor: 'rgba(226, 58, 46, 0.12)',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...textStyles.h3,
  },
  meta: {
    ...textStyles.caption,
    marginBottom: spacing.xs,
  },
  actions: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  actionButton: {
    width: '100%',
  },
});

