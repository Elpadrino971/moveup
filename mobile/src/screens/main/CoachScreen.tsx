/**
 * CoachScreen - Chat avec Coach IA "Moov"
 * Interface de conversation avec IA personnalisée
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../theme';
import {
  chat,
  getConversations,
  getQuickSuggestions,
  checkDailyMessageLimit,
  getProactiveMessages,
  markProactiveMessageAsRead,
  AIMessage,
  ProactiveMessage,
} from '../services/coachAI';

export default function CoachScreen({ navigation }: any) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [proactiveMessages, setProactiveMessages] = useState<ProactiveMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [canSendMore, setCanSendMore] = useState(true);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [conversationsData, proactiveData, limitOk] = await Promise.all([
        getConversations(50),
        getProactiveMessages(),
        checkDailyMessageLimit(),
      ]);

      setMessages(conversationsData);
      setProactiveMessages(proactiveData);
      setCanSendMore(limitOk);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error loading coach data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!inputText.trim()) return;

    if (!canSendMore) {
      Alert.alert(
        '⏸ Limite atteinte',
        'Tu as atteint ta limite quotidienne (10 messages/jour en Free).\n\nPasse à Premium pour des messages illimités ! 🚀',
        [
          { text: 'Plus tard', style: 'cancel' },
          { text: 'Voir Premium', onPress: () => {
            // TODO: Navigate to Premium screen
          }},
        ]
      );
      return;
    }

    const userMessage = inputText.trim();
    setInputText('');
    setSending(true);

    // Add user message optimistically
    const optimisticUserMessage: AIMessage = {
      id: 'temp-' + Date.now(),
      user_id: 'current',
      message: userMessage,
      is_user: true,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await chat(userMessage);

      // Add AI response
      const aiMessage: AIMessage = {
        id: 'temp-ai-' + Date.now(),
        user_id: 'current',
        message: response,
        is_user: false,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Check limit again
      const stillCanSend = await checkDailyMessageLimit();
      setCanSendMore(stillCanSend);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message. Réessaie.');

      // Remove optimistic message
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUserMessage.id));
    } finally {
      setSending(false);
    }
  }

  function handleQuickSuggestion(suggestion: string) {
    setInputText(suggestion);
  }

  async function handleDismissProactiveMessage(messageId: string) {
    await markProactiveMessageAsRead(messageId);
    setProactiveMessages((prev) => prev.filter((m) => m.id !== messageId));
  }

  function renderProactiveMessage({ item }: { item: ProactiveMessage }) {
    const priorityColors = {
      low: Colors.gray500,
      medium: Colors.warning,
      high: Colors.error,
      critical: Colors.error,
    };

    const priorityEmojis = {
      low: 'ℹ️',
      medium: '⚠️',
      high: '🔔',
      critical: '🚨',
    };

    return (
      <View
        style={[
          styles.proactiveMessageCard,
          { borderLeftColor: priorityColors[item.priority] },
        ]}
      >
        <View style={styles.proactiveMessageHeader}>
          <Text style={styles.proactiveMessageEmoji}>
            {priorityEmojis[item.priority]}
          </Text>
          <Text style={styles.proactiveMessageTitle}>Moov te conseille</Text>
        </View>

        <Text style={styles.proactiveMessageContent}>{item.message_content}</Text>

        <TouchableOpacity
          style={styles.proactiveMessageDismiss}
          onPress={() => handleDismissProactiveMessage(item.id)}
        >
          <Text style={styles.proactiveMessageDismissText}>OK, compris</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderMessage({ item }: { item: AIMessage }) {
    const isUser = item.is_user;

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.messageContainerUser : styles.messageContainerAI,
        ]}
      >
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>🤖</Text>
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isUser ? styles.messageBubbleUser : styles.messageBubbleAI,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.messageTextUser : styles.messageTextAI,
            ]}
          >
            {item.message}
          </Text>

          <Text
            style={[
              styles.messageTime,
              isUser ? styles.messageTimeUser : styles.messageTimeAI,
            ]}
          >
            {new Date(item.created_at).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {isUser && (
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>👤</Text>
          </View>
        )}
      </View>
    );
  }

  function renderQuickSuggestions() {
    const suggestions = getQuickSuggestions();

    return (
      <View style={styles.quickSuggestionsContainer}>
        <Text style={styles.quickSuggestionsTitle}>💡 Suggestions :</Text>
        <View style={styles.quickSuggestions}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickSuggestionButton}
              onPress={() => handleQuickSuggestion(suggestion)}
            >
              <Text style={styles.quickSuggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Chargement de Moov...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>🤖</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Coach Moov</Text>
            <Text style={styles.headerSubtitle}>
              {canSendMore ? 'En ligne' : '⏸ Limite atteinte (10/jour)'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            // TODO: Open settings
          }}
        >
          <Text style={styles.headerSettings}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        ListHeaderComponent={
          <>
            {/* Proactive Messages */}
            {proactiveMessages.length > 0 && (
              <View style={styles.proactiveMessagesContainer}>
                {proactiveMessages.map((msg) => (
                  <View key={msg.id}>{renderProactiveMessage({ item: msg })}</View>
                ))}
              </View>
            )}

            {/* Welcome Message */}
            {messages.length === 0 && (
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeEmoji}>👋</Text>
                <Text style={styles.welcomeTitle}>Salut ! Je suis Moov</Text>
                <Text style={styles.welcomeText}>
                  Ton coach personnel IA. Je suis là pour te motiver, te conseiller et t'aider à
                  atteindre tes objectifs !
                </Text>

                {renderQuickSuggestions()}
              </View>
            )}
          </>
        }
        ListFooterComponent={
          sending ? (
            <View style={styles.typingIndicator}>
              <View style={styles.typingDot} />
              <View style={[styles.typingDot, styles.typingDot2]} />
              <View style={[styles.typingDot, styles.typingDot3]} />
              <Text style={styles.typingText}>Moov est en train d'écrire...</Text>
            </View>
          ) : null
        }
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Pose-moi une question..."
          placeholderTextColor={Colors.gray400}
          multiline
          maxLength={500}
          editable={!sending}
        />

        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
        >
          <Text style={styles.sendButtonText}>📤</Text>
        </TouchableOpacity>
      </View>

      {/* Limit Warning */}
      {!canSendMore && (
        <View style={styles.limitWarning}>
          <Text style={styles.limitWarningText}>
            ⏸ Limite Free atteinte (10 msg/jour). Passe à Premium pour l'illimité ! 🚀
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.gray600,
    marginTop: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  headerAvatarText: {
    fontSize: 24,
  },
  headerTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.gray900,
  },
  headerSubtitle: {
    ...Typography.small,
    color: Colors.success,
  },
  headerSettings: {
    fontSize: 24,
  },
  messagesContainer: {
    padding: Spacing.md,
  },
  proactiveMessagesContainer: {
    marginBottom: Spacing.md,
  },
  proactiveMessageCard: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    borderLeftWidth: 4,
    ...Shadows.small,
  },
  proactiveMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  proactiveMessageEmoji: {
    fontSize: 20,
    marginRight: Spacing.xs,
  },
  proactiveMessageTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.gray900,
  },
  proactiveMessageContent: {
    ...Typography.body,
    color: Colors.gray700,
    marginBottom: Spacing.sm,
  },
  proactiveMessageDismiss: {
    alignSelf: 'flex-end',
  },
  proactiveMessageDismissText: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: '600',
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  welcomeEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  welcomeTitle: {
    ...Typography.h3,
    color: Colors.gray900,
    marginBottom: Spacing.sm,
  },
  welcomeText: {
    ...Typography.body,
    color: Colors.gray600,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  quickSuggestionsContainer: {
    marginTop: Spacing.lg,
    width: '100%',
  },
  quickSuggestionsTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.gray700,
    marginBottom: Spacing.sm,
  },
  quickSuggestions: {
    gap: Spacing.sm,
  },
  quickSuggestionButton: {
    backgroundColor: Colors.gray100,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  quickSuggestionText: {
    ...Typography.body,
    color: Colors.gray700,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
  },
  messageContainerUser: {
    justifyContent: 'flex-end',
  },
  messageContainerAI: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  aiAvatarText: {
    fontSize: 20,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs,
  },
  userAvatarText: {
    fontSize: 16,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: Spacing.md,
    borderRadius: 16,
  },
  messageBubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleAI: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    ...Shadows.small,
  },
  messageText: {
    ...Typography.body,
  },
  messageTextUser: {
    color: Colors.white,
  },
  messageTextAI: {
    color: Colors.gray900,
  },
  messageTime: {
    ...Typography.small,
    marginTop: Spacing.xs,
  },
  messageTimeUser: {
    color: Colors.white + 'CC',
  },
  messageTimeAI: {
    color: Colors.gray500,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray400,
    marginRight: 4,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 0.4,
  },
  typingText: {
    ...Typography.small,
    color: Colors.gray500,
    marginLeft: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    ...Typography.body,
    backgroundColor: Colors.gray50,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    maxHeight: 100,
    marginRight: Spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray300,
  },
  sendButtonText: {
    fontSize: 20,
  },
  limitWarning: {
    backgroundColor: Colors.warning + '20',
    padding: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.warning,
  },
  limitWarningText: {
    ...Typography.small,
    color: Colors.warning,
    textAlign: 'center',
  },
});
