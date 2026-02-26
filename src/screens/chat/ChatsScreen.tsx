import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { useAppState } from '../../state/AppState';
import { colors, spacing, textStyles } from '../../theme';

export const ChatsScreen: React.FC<{ onOpenThread?: (id: string) => void }> = ({
  onOpenThread,
}) => {
  const { chatThreads, role } = useAppState();
  const canChat = role === 'buyer' || role === 'fisher' || role === 'admin';

  const sorted = useMemo(
    () =>
      [...chatThreads].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [chatThreads]
  );

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      {!canChat && (
        <Text style={styles.noticeText}>
          Fonction réservée aux comptes métier.
        </Text>
      )}
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucune conversation pour le moment.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              if (!canChat) {
                return;
              }
              if (onOpenThread) {
                onOpenThread(item.id);
              }
            }}
            style={styles.pressable}
          >
            <Card style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{item.otherName}</Text>
                {item.unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.unreadCount}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.subtitle}>{item.listingTitle}</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.preview}>{item.lastMessage}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </View>
            </Card>
          </Pressable>
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
  empty: {
    ...textStyles.caption,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  pressable: {
    marginBottom: spacing.md,
  },
  card: {
    borderColor: 'rgba(226, 58, 46, 0.12)',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    ...textStyles.h3,
  },
  subtitle: {
    ...textStyles.caption,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  preview: {
    ...textStyles.body,
    color: colors.muted,
    flex: 1,
    marginRight: spacing.sm,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    ...textStyles.caption,
    color: '#FFFFFF',
    fontFamily: textStyles.bodyBold.fontFamily,
  },
  noticeText: {
    ...textStyles.caption,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
});

