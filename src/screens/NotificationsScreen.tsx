import React, { useCallback, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GhostButton } from '../components/Buttons';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { Tag } from '../components/Tag';
import { useAppState } from '../state/AppState';
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

const NotificationsContent: React.FC<{ autoMarkRead: boolean }> = ({
  autoMarkRead,
}) => {
  const { notifications, markAllNotificationsRead } = useAppState();

  useEffect(() => {
    if (!autoMarkRead) {
      return;
    }
    if (notifications.some((item) => !item.read)) {
      markAllNotificationsRead();
    }
  }, [autoMarkRead, notifications, markAllNotificationsRead]);

  return (
    <Screen style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Notifications</Text>
        {notifications.some((item) => !item.read) && (
          <GhostButton
            label="Tout marquer comme lu"
            onPress={markAllNotificationsRead}
          />
        )}
      </View>

      {notifications.length === 0 ? (
        <Text style={styles.empty}>Aucune notification pour le moment.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {!item.read && <Tag label="Nouveau" tone="warning" />}
              </View>
              <Text style={styles.cardBody}>{item.body}</Text>
              <Text style={styles.cardTime}>{formatDate(item.createdAt)}</Text>
            </Card>
          )}
        />
      )}
    </Screen>
  );
};

export const NotificationsScreen: React.FC = () => {
  const { notifications, markAllNotificationsRead } = useAppState();

  useFocusEffect(
    useCallback(() => {
      if (notifications.some((item) => !item.read)) {
        markAllNotificationsRead();
      }
    }, [notifications, markAllNotificationsRead])
  );

  return <NotificationsContent autoMarkRead={false} />;
};

export const NotificationsStandalone: React.FC = () => {
  return <NotificationsContent autoMarkRead />;
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    ...textStyles.h2,
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
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...textStyles.h3,
  },
  cardBody: {
    ...textStyles.body,
  },
  cardTime: {
    ...textStyles.caption,
    marginTop: spacing.xs,
  },
  empty: {
    ...textStyles.caption,
  },
});

