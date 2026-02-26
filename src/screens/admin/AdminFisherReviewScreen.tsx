import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { useAppState } from '../../state/AppState';
import { colors, spacing, textStyles } from '../../theme';
import { FisherApplicantStatus } from '../../types';

const statusLabel: Record<FisherApplicantStatus, string> = {
  pending: 'En attente',
  verified: 'Vérifié',
  rejected: 'Refusé',
};

export const AdminFisherReviewScreen: React.FC = () => {
  const { fisherApplicants, role } = useAppState();
  const canAdmin = role === 'admin';

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Validation pêcheurs</Text>
      {!canAdmin && (
        <Text style={styles.noticeText}>
          Accès réservé aux administrateurs.
        </Text>
      )}
      <FlatList
        data={fisherApplicants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Tag
                label={statusLabel[item.status]}
                tone={
                  item.status === 'verified'
                    ? 'success'
                    : item.status === 'rejected'
                    ? 'danger'
                    : 'warning'
                }
              />
            </View>
            <Text style={styles.meta}>Permis : {item.permit}</Text>
            <Text style={styles.meta}>Bateau : {item.boat}</Text>
            <Text style={styles.meta}>Immatriculation : {item.registration}</Text>
            <Text style={styles.meta}>Port : {item.port}</Text>
            <Text style={styles.meta}>Assurance : {item.insurance}</Text>
            <Text style={styles.meta}>RIB : {item.bankAccount}</Text>
            <Text style={styles.meta}>Téléphone : {item.phone}</Text>
            <Text style={styles.meta}>Email : {item.email}</Text>
            <Text style={styles.meta}>Pièce ID : {item.idNumber}</Text>

            <Text style={styles.note}>
              Vérification automatique : aucune validation manuelle requise.
            </Text>
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
  note: {
    ...textStyles.caption,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  noticeText: {
    ...textStyles.caption,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
});

