import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BackButton } from '../../components/BackButton';
import { Card } from '../../components/Card';
import { GhostButton, PrimaryButton } from '../../components/Buttons';
import { Screen } from '../../components/Screen';
import { Tag } from '../../components/Tag';
import { useAppState } from '../../state/AppState';
import { colors, spacing, textStyles } from '../../theme';

type Props = {
  onBack: () => void;
  onOpenBuyer?: () => void;
  onOpenFisher?: () => void;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export const AdminDashboardScreen: React.FC<Props> = ({
  onBack,
  onOpenBuyer,
  onOpenFisher,
}) => {
  const {
    reservations,
    fisherApplicants,
    buyerApplicants,
    adminProfiles,
    refreshAdminProfiles,
    updateUserRole,
    queue,
    syncHistory,
    syncQueue,
    isOnline,
  } = useAppState();

  const stats = useMemo(() => {
    const disputes = reservations.filter((item) => item.escrowStatus === 'hold');
    const escrows = reservations.filter((item) => item.escrowStatus === 'escrowed');
    return {
      transactions: reservations.length,
      disputes: disputes.length,
      escrows: escrows.length,
      pendingKyc:
        fisherApplicants.filter((item) => item.status === 'pending').length +
        buyerApplicants.filter((item) => item.status === 'pending').length,
    };
  }, [reservations, fisherApplicants, buyerApplicants]);

  const lastSync = syncHistory[0]?.syncedAt;

  useEffect(() => {
    refreshAdminProfiles().catch(() => undefined);
  }, []);

  const roleLabel = (role: string) =>
    role === 'admin' ? 'Admin' : role === 'fisher' ? 'Pêcheur' : 'Acheteur';

  const roleTone = (
    role: string
  ): 'neutral' | 'success' | 'warning' =>
    role === 'admin' ? 'warning' : role === 'fisher' ? 'success' : 'neutral';

  return (
    <Screen scroll>
      <BackButton onPress={onBack} style={styles.back} />
      <Text style={styles.title}>Back-office (démo)</Text>
      <Text style={styles.subtitle}>Vue synthétique des opérations.</Text>

      {(onOpenBuyer || onOpenFisher) && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Accès rapide</Text>
          <View style={styles.quickActions}>
            {onOpenBuyer && (
              <PrimaryButton label="Vue acheteur" onPress={onOpenBuyer} />
            )}
            {onOpenFisher && (
              <PrimaryButton label="Vue pêcheur" onPress={onOpenFisher} />
            )}
          </View>
        </Card>
      )}

      <View style={styles.kpiRow}>
        <Card style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Transactions</Text>
          <Text style={styles.kpiValue}>{stats.transactions}</Text>
        </Card>
        <Card style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Séquestres</Text>
          <Text style={styles.kpiValue}>{stats.escrows}</Text>
        </Card>
      </View>
      <View style={styles.kpiRow}>
        <Card style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Litiges</Text>
          <Text style={styles.kpiValue}>{stats.disputes}</Text>
        </Card>
        <Card style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>KYC en attente</Text>
          <Text style={styles.kpiValue}>{stats.pendingKyc}</Text>
        </Card>
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Synchronisation</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.meta}>Connexion</Text>
          <Tag label={isOnline ? 'En ligne' : 'Hors ligne'} tone={isOnline ? 'success' : 'warning'} />
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.meta}>Actions en attente</Text>
          <Text style={styles.value}>{queue.length}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.meta}>Dernière synchro</Text>
          <Text style={styles.value}>{lastSync ? formatDate(lastSync) : '—'}</Text>
        </View>
        <GhostButton label="Forcer la synchronisation" onPress={syncQueue} />
      </Card>

      <Card style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Utilisateurs & rôles</Text>
          <GhostButton label="Rafraîchir" onPress={refreshAdminProfiles} />
        </View>
        {adminProfiles.length === 0 ? (
          <Text style={styles.empty}>Aucun utilisateur synchronisé.</Text>
        ) : (
          adminProfiles.map((profile) => (
            <View key={profile.id} style={styles.userRow}>
              <View style={styles.rowBetween}>
                <Text style={styles.value}>{profile.name || profile.email}</Text>
                <Tag label={roleLabel(profile.role)} tone={roleTone(profile.role)} />
              </View>
              <Text style={styles.meta}>{profile.email}</Text>
              <View style={styles.roleActions}>
                <GhostButton
                  label="Acheteur"
                  onPress={() => updateUserRole(profile.id, 'buyer')}
                />
                <GhostButton
                  label="Pêcheur"
                  onPress={() => updateUserRole(profile.id, 'fisher')}
                />
                <GhostButton
                  label="Admin"
                  onPress={() => updateUserRole(profile.id, 'admin')}
                />
              </View>
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  back: {
    marginBottom: spacing.md,
  },
  title: {
    ...textStyles.h2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...textStyles.caption,
    marginBottom: spacing.lg,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  kpiCard: {
    flex: 1,
    padding: spacing.md,
  },
  kpiLabel: {
    ...textStyles.caption,
  },
  kpiValue: {
    ...textStyles.h2,
    fontSize: 22,
  },
  empty: {
    ...textStyles.caption,
    color: colors.muted,
  },
  card: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...textStyles.h3,
    marginBottom: spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  quickActions: {
    gap: spacing.sm,
  },
  meta: {
    ...textStyles.caption,
    color: colors.muted,
  },
  value: {
    ...textStyles.bodyBold,
  },
  userRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  roleActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});


