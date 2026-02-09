import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GhostButton, PrimaryButton } from '../components/Buttons';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { Tag } from '../components/Tag';
import { useAppState } from '../state/AppState';
import { colors, spacing } from '../theme';

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ProfileScreen: React.FC = () => {
  const {
    role,
    setRole,
    resetApp,
    isOnline,
    queue,
    syncHistory,
    syncQueue,
  } = useAppState();
  const pendingCount = queue.length;

  return (
    <Screen scroll style={styles.container}>
      <Text style={styles.title}>Mon profil</Text>
      <Card style={styles.card}>
        <Text style={styles.label}>Rôle actuel</Text>
        <Text style={styles.value}>
          {role === 'fisher' ? 'Pêcheur' : 'Acheteur / Restaurateur'}
        </Text>
        <Text style={styles.label}>Paiement</Text>
        <Text style={styles.value}>Au pickup</Text>
      </Card>

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
          </View>
        )}
      </Card>

      <PrimaryButton label="Changer de rôle" onPress={() => setRole(null)} />
      <View style={styles.spacer} />
      <GhostButton label="Réinitialiser la démo" onPress={resetApp} />
      <View style={styles.spacer} />
      <GhostButton label="Déconnexion" onPress={() => setRole(null)} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  queueList: {
    marginBottom: spacing.md,
  },
  queueItem: {
    color: colors.text,
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
    color: colors.text,
    fontSize: 14,
  },
  historyDate: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  empty: {
    color: colors.muted,
  },
  spacer: {
    height: spacing.sm,
  },
});
