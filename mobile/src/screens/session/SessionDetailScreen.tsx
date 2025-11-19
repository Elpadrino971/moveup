/**
 * SessionDetailScreen - Voir les détails d'une session et la rejoindre
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../theme';
import {
  getSessionById,
  joinSession,
  leaveSession,
  cancelSession,
  startSession,
} from '../../services/sessions';
import { useAuth } from '../../contexts/AuthContext';

interface Session {
  id: string;
  creator_id: string;
  sport_id: string;
  title: string;
  description?: string;
  session_type: 'one-on-one' | 'group';
  max_participants: number;
  scheduled_at: string;
  duration_minutes: number;
  location: string;
  location_lat?: number;
  location_lng?: number;
  gender_preference: 'any' | 'same' | 'opposite';
  status: 'pending' | 'matched' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  creator?: {
    id: string;
    username: string;
    avatar_url?: string;
    trust_level: number;
  };
  participants?: Array<{
    user_id: string;
    username: string;
    avatar_url?: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    trust_level: number;
  }>;
  current_participants_count: number;
}

export default function SessionDetailScreen({ route, navigation }: any) {
  const { sessionId } = route.params;
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  async function loadSession() {
    setLoading(true);
    try {
      const data = await getSessionById(sessionId);
      setSession(data);
    } catch (error) {
      console.error('Error loading session:', error);
      Alert.alert('Erreur', 'Impossible de charger la session.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinSession() {
    if (!session) return;

    setActionLoading(true);
    try {
      const result = await joinSession(sessionId);

      if (result) {
        Alert.alert(
          '✅ Demande envoyée !',
          session.session_type === 'one-on-one'
            ? 'Le créateur va recevoir une notification. Tu seras prévenu(e) quand il acceptera.'
            : 'Tu es maintenant dans la session !',
          [{ text: 'OK', onPress: () => loadSession() }]
        );
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de rejoindre la session.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleLeaveSession() {
    Alert.alert(
      'Quitter la session ?',
      'Es-tu sûr(e) de vouloir quitter cette session ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Quitter',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await leaveSession(sessionId);
              Alert.alert('Session quittée', 'Tu as quitté la session.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de quitter la session.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  }

  async function handleCancelSession() {
    Alert.alert(
      'Annuler la session ?',
      'Es-tu sûr(e) de vouloir annuler cette session ? Les participants seront notifiés.',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Annuler la session',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await cancelSession(sessionId);
              Alert.alert('Session annulée', 'La session a été annulée.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'annuler la session.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  }

  async function handleStartSession() {
    if (!session) return;

    setActionLoading(true);
    try {
      await startSession(sessionId);
      Alert.alert(
        '🏁 Session démarrée !',
        'La session est maintenant en cours. N\'oublie pas de faire le check-in avec le QR code !',
        [
          {
            text: 'Scanner QR Code',
            onPress: () => navigation.navigate('SessionQRScan', { sessionId }),
          },
        ]
      );
      loadSession();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de démarrer la session.');
    } finally {
      setActionLoading(false);
    }
  }

  function handleCheckIn() {
    navigation.navigate('SessionQRScan', { sessionId });
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!session) {
    return null;
  }

  const isCreator = session.creator_id === user?.id;
  const isParticipant = session.participants?.some((p) => p.user_id === user?.id);
  const canJoin = !isCreator && !isParticipant && session.status === 'pending';
  const isFull = session.current_participants_count >= session.max_participants;

  const sportEmojis: Record<string, string> = {
    running: '🏃',
    football: '⚽',
    basketball: '🏀',
    tennis: '🎾',
    yoga: '🧘',
    cycling: '🚴',
    swimming: '🏊',
    fitness: '💪',
  };

  const statusLabels = {
    pending: 'En attente',
    matched: 'Matché',
    confirmed: 'Confirmé',
    'in-progress': 'En cours',
    completed: 'Terminé',
    cancelled: 'Annulé',
  };

  const statusColors = {
    pending: Colors.gray500,
    matched: Colors.primary,
    confirmed: Colors.success,
    'in-progress': Colors.warning,
    completed: Colors.gray600,
    cancelled: Colors.error,
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.sportIcon}>
            <Text style={styles.sportEmoji}>{sportEmojis[session.sport_id] || '🏃'}</Text>
          </View>
          <Text style={styles.title}>{session.title}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors[session.status] + '20' },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColors[session.status] }]}>
              {statusLabels[session.status]}
            </Text>
          </View>
        </View>

        {/* Description */}
        {session.description && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Description</Text>
            <Text style={styles.descriptionText}>{session.description}</Text>
          </View>
        )}

        {/* Session Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informations</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📅 Date</Text>
            <Text style={styles.infoValue}>
              {new Date(session.scheduled_at).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🕐 Heure</Text>
            <Text style={styles.infoValue}>
              {new Date(session.scheduled_at).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>⏱ Durée</Text>
            <Text style={styles.infoValue}>{session.duration_minutes} minutes</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📍 Lieu</Text>
            <Text style={styles.infoValue}>{session.location}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>👥 Type</Text>
            <Text style={styles.infoValue}>
              {session.session_type === 'one-on-one' ? '1-on-1' : 'Groupe'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>👤 Participants</Text>
            <Text style={styles.infoValue}>
              {session.current_participants_count} / {session.max_participants}
            </Text>
          </View>

          {session.gender_preference !== 'any' && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>⚧ Genre</Text>
              <Text style={styles.infoValue}>
                {session.gender_preference === 'same' ? 'Même genre' : 'Genre opposé'}
              </Text>
            </View>
          )}
        </View>

        {/* Creator */}
        {session.creator && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Organisateur</Text>
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                {session.creator.avatar_url ? (
                  <Image
                    source={{ uri: session.creator.avatar_url }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {session.creator.username.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{session.creator.username}</Text>
                <View style={styles.trustBadge}>
                  <Text style={styles.trustText}>
                    Trust Level {session.creator.trust_level}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Participants */}
        {session.participants && session.participants.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Participants ({session.participants.length})
            </Text>
            {session.participants.map((participant) => (
              <View key={participant.user_id} style={styles.userRow}>
                <View style={styles.avatar}>
                  {participant.avatar_url ? (
                    <Image
                      source={{ uri: participant.avatar_url }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {participant.username.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{participant.username}</Text>
                  <View style={styles.trustBadge}>
                    <Text style={styles.trustText}>
                      Trust Level {participant.trust_level}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.participantStatus,
                    participant.status === 'confirmed' && styles.participantStatusConfirmed,
                  ]}
                >
                  <Text style={styles.participantStatusText}>
                    {participant.status === 'confirmed' ? '✓' : '⏳'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {canJoin && !isFull && (
            <TouchableOpacity
              style={[styles.primaryButton, actionLoading && styles.buttonDisabled]}
              onPress={handleJoinSession}
              disabled={actionLoading}
            >
              <Text style={styles.primaryButtonText}>
                {actionLoading ? 'Chargement...' : '✓ Rejoindre la session'}
              </Text>
            </TouchableOpacity>
          )}

          {canJoin && isFull && (
            <View style={styles.fullBadge}>
              <Text style={styles.fullText}>⚠️ Session complète</Text>
            </View>
          )}

          {isParticipant && session.status === 'pending' && (
            <TouchableOpacity
              style={[styles.secondaryButton, actionLoading && styles.buttonDisabled]}
              onPress={handleLeaveSession}
              disabled={actionLoading}
            >
              <Text style={styles.secondaryButtonText}>Quitter la session</Text>
            </TouchableOpacity>
          )}

          {isCreator && session.status === 'pending' && (
            <>
              <TouchableOpacity
                style={[styles.primaryButton, actionLoading && styles.buttonDisabled]}
                onPress={handleStartSession}
                disabled={actionLoading || session.current_participants_count < 2}
              >
                <Text style={styles.primaryButtonText}>
                  {actionLoading ? 'Chargement...' : '🏁 Démarrer la session'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dangerButton, actionLoading && styles.buttonDisabled]}
                onPress={handleCancelSession}
                disabled={actionLoading}
              >
                <Text style={styles.dangerButtonText}>Annuler la session</Text>
              </TouchableOpacity>
            </>
          )}

          {session.status === 'in-progress' && (isCreator || isParticipant) && (
            <TouchableOpacity
              style={[styles.primaryButton, actionLoading && styles.buttonDisabled]}
              onPress={handleCheckIn}
              disabled={actionLoading}
            >
              <Text style={styles.primaryButtonText}>📱 Check-in QR Code</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sportIcon: {
    width: 80,
    height: 80,
    backgroundColor: Colors.primary + '20',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sportEmoji: {
    fontSize: 48,
  },
  title: {
    ...Typography.h2,
    color: Colors.gray900,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
  },
  statusText: {
    ...Typography.small,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 12,
    ...Shadows.small,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.gray900,
    marginBottom: Spacing.md,
  },
  descriptionText: {
    ...Typography.body,
    color: Colors.gray700,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  infoLabel: {
    ...Typography.body,
    color: Colors.gray600,
    flex: 1,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.gray900,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.gray600,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.body,
    color: Colors.gray900,
    fontWeight: '600',
    marginBottom: 4,
  },
  trustBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trustText: {
    ...Typography.small,
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  participantStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantStatusConfirmed: {
    backgroundColor: Colors.success + '20',
  },
  participantStatusText: {
    fontSize: 16,
  },
  actionSection: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    ...Shadows.medium,
  },
  primaryButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: Colors.gray200,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...Typography.body,
    color: Colors.gray700,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: Colors.error + '20',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    ...Typography.body,
    color: Colors.error,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  fullBadge: {
    backgroundColor: Colors.warning + '20',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  fullText: {
    ...Typography.body,
    color: Colors.warning,
    fontWeight: '600',
  },
});
