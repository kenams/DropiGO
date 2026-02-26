import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GhostButton, PrimaryButton } from '../components/Buttons';
import { BackButton } from '../components/BackButton';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { Screen } from '../components/Screen';
import { Tag } from '../components/Tag';
import { useAppState } from '../state/AppState';
import { exportSyncHistoryCsv } from '../services/csv';
import { colors, spacing, textStyles } from '../theme';

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

type Props = { onBack?: () => void };

const ProfileContent: React.FC<Props> = ({ onBack }) => {
  const {
    role,
    signOut,
    resetApp,
    isOnline,
    queue,
    syncHistory,
    syncQueue,
    fisherProfile,
    buyerProfile,
    fisherApplicants,
    buyerApplicants,
    updateFisherApplicantStatus,
    updateBuyerApplicantStatus,
    reservations,
    resolveDispute,
  } = useAppState();
  const pendingCount = queue.length;
  const disputeItems = reservations.filter((item) => item.escrowStatus === 'hold');
  const escrowActiveCount = reservations.filter(
    (item) => item.escrowStatus === 'escrowed'
  ).length;

  const exportHistory = async () => {
    if (syncHistory.length === 0) {
      return;
    }
    await exportSyncHistoryCsv(syncHistory);
  };

  return (
    <Screen scroll style={styles.container}>
      {onBack && <BackButton onPress={onBack} style={styles.back} />}
      <Logo size={72} showWordmark={false} compact />
      <Text style={styles.title}>Mon profil</Text>

      <Card style={styles.card}>
        <Text style={styles.label}>Rôle actuel</Text>
        <Text style={styles.value}>
          {role === 'admin'
            ? 'Administrateur'
            : role === 'fisher'
            ? 'Pêcheur professionnel'
            : 'Acheteur professionnel'}
        </Text>
        <Text style={styles.label}>Paiement</Text>
        <Text style={styles.value}>Séquestre DroPiPêche</Text>

        {role === 'fisher' && (
          <>
            <Text style={styles.label}>Identité</Text>
            <Text style={styles.value}>{fisherProfile.name || '—'}</Text>
            <Text style={styles.value}>
              {fisherProfile.boat || 'Bateau non renseigné'}
            </Text>
            <Text style={styles.value}>
              {fisherProfile.port || 'Port non renseigné'}
            </Text>
            <Text style={styles.value}>
              {fisherProfile.phone || 'Téléphone non renseigné'}
            </Text>
          </>
        )}

        {role === 'buyer' && (
          <>
            <Text style={styles.label}>Société</Text>
            <Text style={styles.value}>{buyerProfile.company || '—'}</Text>
            <Text style={styles.value}>
              {buyerProfile.activity || 'Activité non renseignée'}
            </Text>
            <Text style={styles.value}>
              {buyerProfile.phone || 'Téléphone non renseigné'}
            </Text>
            <Text style={styles.value}>
              {buyerProfile.email || 'Email non renseigné'}
            </Text>
          </>
        )}
      </Card>

      {role === 'admin' && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Admin (démo)</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Transactions</Text>
            <Text style={styles.value}>{reservations.length}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Séquestres actifs</Text>
            <Text style={styles.value}>{escrowActiveCount}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Litiges en cours</Text>
            <Text style={styles.value}>{disputeItems.length}</Text>
          </View>

          <Text style={styles.subTitle}>Pêcheurs en attente</Text>
          {fisherApplicants.filter((item) => item.status === 'pending').length ===
          0 ? (
            <Text style={styles.empty}>Aucun dossier en attente.</Text>
          ) : (
            fisherApplicants
              .filter((item) => item.status === 'pending')
              .slice(0, 2)
              .map((item) => (
                <View key={item.id} style={styles.adminRow}>
                  <Text style={styles.value}>{item.name}</Text>
                  <View style={styles.adminActions}>
                    <GhostButton
                      label="Valider"
                      onPress={() => updateFisherApplicantStatus(item.id, 'verified')}
                    />
                    <GhostButton
                      label="Refuser"
                      onPress={() => updateFisherApplicantStatus(item.id, 'rejected')}
                    />
                  </View>
                </View>
              ))
          )}

          <Text style={styles.subTitle}>Acheteurs en attente</Text>
          {buyerApplicants.filter((item) => item.status === 'pending').length ===
          0 ? (
            <Text style={styles.empty}>Aucun dossier en attente.</Text>
          ) : (
            buyerApplicants
              .filter((item) => item.status === 'pending')
              .slice(0, 2)
              .map((item) => (
                <View key={item.id} style={styles.adminRow}>
                  <Text style={styles.value}>{item.company}</Text>
                  <View style={styles.adminActions}>
                    <GhostButton
                      label="Valider"
                      onPress={() => updateBuyerApplicantStatus(item.id, 'verified')}
                    />
                    <GhostButton
                      label="Refuser"
                      onPress={() => updateBuyerApplicantStatus(item.id, 'rejected')}
                    />
                  </View>
                </View>
              ))
          )}

          <Text style={styles.subTitle}>Litiges</Text>
          {disputeItems.length === 0 ? (
            <Text style={styles.empty}>Aucun litige à traiter.</Text>
          ) : (
            disputeItems.slice(0, 2).map((item) => (
              <View key={item.id} style={styles.disputeRow}>
                <Text style={styles.value}>{item.listingTitle}</Text>
                <Text style={styles.caption}>Acheteur : {item.buyerName}</Text>
                <View style={styles.disputeActions}>
                  <GhostButton
                    label="Rembourser"
                    onPress={() => resolveDispute(item.id, 'refund_buyer')}
                  />
                  <GhostButton
                    label="Payer pêcheur"
                    onPress={() => resolveDispute(item.id, 'pay_fisher')}
                  />
                  <GhostButton
                    label="Partager"
                    onPress={() => resolveDispute(item.id, 'split')}
                  />
                </View>
              </View>
            ))
          )}
        </Card>
      )}

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Synchronisation</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Statut réseau</Text>
          <Tag
            label={isOnline ? 'En ligne' : 'Hors-ligne'}
            tone={isOnline ? 'success' : 'warning'}
          />
        </View>
        <Text style={styles.label}>Actions en attente</Text>
        <Text style={styles.value}>{pendingCount}</Text>
        {pendingCount > 0 && (
          <View style={styles.queueList}>
            {queue.slice(0, 3).map((item) => (
              <Text key={item.id} style={styles.queueItem}>
                {item.summary}
              </Text>
            ))}
            {pendingCount > 3 && (
              <Text style={styles.queueItem}>+ {pendingCount - 3} autres</Text>
            )}
          </View>
        )}
        <PrimaryButton
          label="Synchroniser maintenant"
          onPress={syncQueue}
          disabled={!isOnline || pendingCount === 0}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Historique des synchronisations</Text>
        {syncHistory.length === 0 ? (
          <Text style={styles.empty}>Aucune action synchronisée pour le moment.</Text>
        ) : (
          <View style={styles.historyList}>
            {syncHistory.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <Text style={styles.historyText}>{item.summary}</Text>
                <Text style={styles.historyDate}>{formatDate(item.syncedAt)}</Text>
              </View>
            ))}
            <View style={styles.historyActions}>
              <GhostButton label="Exporter en CSV" onPress={exportHistory} />
            </View>
          </View>
        )}
      </Card>

      <PrimaryButton label="Changer de compte" onPress={signOut} />
      <View style={styles.spacer} />
      <GhostButton label="Réinitialiser la démo" onPress={resetApp} />
      <View style={styles.spacer} />
      <GhostButton label="Déconnexion" onPress={signOut} />
    </Screen>
  );
};

export const ProfileScreen: React.FC = () => {
  return <ProfileContent />;
};

export const ProfileStandalone: React.FC<Props> = ({ onBack }) => {
  return <ProfileContent onBack={onBack} />;
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
    marginBottom: spacing.lg,
  },
  label: {
    ...textStyles.label,
    marginTop: spacing.sm,
  },
  value: {
    ...textStyles.bodyBold,
  },
  caption: {
    ...textStyles.caption,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...textStyles.h3,
    marginBottom: spacing.sm,
  },
  subTitle: {
    ...textStyles.bodyBold,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  adminRow: {
    marginBottom: spacing.sm,
  },
  adminActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  disputeRow: {
    marginBottom: spacing.md,
  },
  disputeActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  queueList: {
    marginBottom: spacing.md,
  },
  queueItem: {
    ...textStyles.body,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  historyList: {
    marginTop: spacing.sm,
  },
  historyItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyText: {
    ...textStyles.body,
  },
  historyDate: {
    ...textStyles.caption,
    marginTop: spacing.xs,
  },
  historyActions: {
    marginTop: spacing.md,
  },
  empty: {
    ...textStyles.caption,
    color: colors.muted,
  },
  spacer: {
    height: spacing.sm,
  },
});
