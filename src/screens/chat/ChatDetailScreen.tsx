import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppState } from '../../state/AppState';
import { colors, radius, spacing, textStyles } from '../../theme';

type Props = {
  threadId: string;
  onBack?: () => void;
};

export const ChatDetailScreen: React.FC<Props> = ({ threadId, onBack }) => {
  const { role, chatThreads, chatMessages, sendChatMessage, markThreadRead } =
    useAppState();
  const [text, setText] = useState('');

  const thread = chatThreads.find((t) => t.id === threadId);
  const messages = useMemo(
    () => chatMessages.filter((m) => m.threadId === threadId),
    [chatMessages, threadId]
  );

  useEffect(() => {
    markThreadRead(threadId);
  }, [threadId]);

  const handleSend = () => {
    sendChatMessage(threadId, text);
    setText('');
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        {onBack && (
          <Pressable onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={18} color={colors.primaryDark} />
          </Pressable>
        )}
        <View>
          <Text style={styles.title}>{thread?.otherName ?? 'Conversation'}</Text>
          <Text style={styles.subtitle}>{thread?.listingTitle ?? ''}</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isMine = item.sender === role;
          return (
            <View style={[styles.bubble, isMine ? styles.mine : styles.theirs]}>
              <Text style={[styles.messageText, isMine && styles.mineText]}>
                {item.text}
              </Text>
              <Text style={[styles.time, isMine && styles.mineTime]}>
                {new Date(item.createdAt).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Écrire un message…"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <Pressable onPress={handleSend} style={styles.sendButton}>
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  title: {
    ...textStyles.h3,
  },
  subtitle: {
    ...textStyles.caption,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  bubble: {
    maxWidth: '78%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    ...textStyles.body,
    color: colors.text,
  },
  mineText: {
    color: '#FFFFFF',
  },
  time: {
    ...textStyles.caption,
    marginTop: spacing.xs,
    color: colors.muted,
  },
  mineTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceWarm,
    color: colors.text,
    fontFamily: textStyles.body.fontFamily,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
});

