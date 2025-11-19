/**
 * SessionRatingScreen - Noter son binôme après une session
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../theme';
import { getSessionById, rateSession } from '../../services/sessions';
import { useAuth } from '../../contexts/AuthContext';

interface Session {
  id: string;
  title: string;
  sport_id: string;
  scheduled_at: string;
  duration_minutes: number;
  participants?: Array<{
    user_id: string;
    username: string;
    avatar_url?: string;
    trust_level: number;
  }>;
}

export default function SessionRatingScreen({ route, navigation }: any) {
  const { sessionId } = route.params;
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reportReason, setReportReason] = useState('');

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

  async function handleSubmitRating() {
    if (rating === 0) {
      Alert.alert('Note requise', 'Donne une note à ton binôme (1-5 étoiles).');
      return;
    }

    // If rating is low, suggest reporting
    if (rating <= 2 && !reportReason) {
      Alert.alert(
        'Problème rencontré ?',
        'Une note basse indique un problème. Veux-tu signaler ce profil ?',
        [
          { text: 'Non, continuer', onPress: () => submitRating() },
          {
            text: 'Oui, signaler',
            onPress: () => {
              // In production, open report modal
              Alert.alert(
                'Signaler un profil',
                'Cette fonctionnalité sera disponible prochainement.'
              );
            },
          },
        ]
      );
      return;
    }

    await submitRating();
  }

  async function submitRating() {
    setSubmitting(true);
    try {
      // Get partner info
      const partner = session?.participants?.find((p) => p.user_id !== user?.id);

      if (!partner) {
        Alert.alert('Erreur', 'Impossible de trouver ton binôme.');
        return;
      }

      const result = await rateSession(sessionId, partner.user_id, rating, comment || undefined);

      if (result) {
        Alert.alert(
          '✅ Merci pour ton retour !',
          `Tu as gagné ${getRatingReward(rating)} MoovCoins pour avoir complété cette session !`,
          [
            {
              text: 'Retour à l\'accueil',
              onPress: () => navigation.navigate('Home'),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de soumettre la note.');
    } finally {
      setSubmitting(false);
    }
  }

  function getRatingReward(rating: number): number {
    // Reward based on rating
    if (rating === 5) return 100;
    if (rating === 4) return 75;
    if (rating === 3) return 50;
    return 25;
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

  const partner = session.participants?.find((p) => p.user_id !== user?.id);

  if (!partner) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Aucun binôme trouvé pour cette session.</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Comment s'est passée ta session ?</Text>
          <Text style={styles.headerSubtitle}>
            {sportEmojis[session.sport_id] || '🏃'} {session.title}
          </Text>
          <Text style={styles.headerDate}>
            {new Date(session.scheduled_at).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>
        </View>

        {/* Partner Info */}
        <View style={styles.partnerCard}>
          <Text style={styles.cardTitle}>Ton binôme</Text>
          <View style={styles.partnerRow}>
            <View style={styles.avatar}>
              {partner.avatar_url ? (
                <Image source={{ uri: partner.avatar_url }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {partner.username.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={styles.partnerInfo}>
              <Text style={styles.partnerName}>{partner.username}</Text>
              <View style={styles.trustBadge}>
                <Text style={styles.trustText}>Trust Level {partner.trust_level}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rating */}
        <View style={styles.ratingCard}>
          <Text style={styles.cardTitle}>Note ton binôme</Text>
          <Text style={styles.ratingSubtitle}>
            Comment évalues-tu ton expérience avec {partner.username} ?
          </Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                style={styles.starButton}
                onPress={() => setRating(star)}
              >
                <Text style={styles.starIcon}>{star <= rating ? '⭐' : '☆'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.ratingLabels}>
            <Text style={styles.ratingLabel}>Mauvais</Text>
            <Text style={styles.ratingLabel}>Excellent</Text>
          </View>

          {rating > 0 && (
            <View style={styles.ratingDescription}>
              <Text style={styles.ratingDescriptionText}>
                {getRatingDescription(rating)}
              </Text>
            </View>
          )}
        </View>

        {/* Comment */}
        <View style={styles.commentCard}>
          <Text style={styles.cardTitle}>Commentaire (optionnel)</Text>
          <Text style={styles.commentSubtitle}>
            Partage ton expérience pour aider la communauté
          </Text>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Ex: Super session, très motivant(e) !"
            placeholderTextColor={Colors.gray400}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{comment.length} / 500</Text>
        </View>

        {/* Rewards Preview */}
        {rating > 0 && (
          <View style={styles.rewardCard}>
            <Text style={styles.rewardTitle}>🎁 Récompenses</Text>
            <View style={styles.rewardRow}>
              <Text style={styles.rewardLabel}>MoovCoins</Text>
              <Text style={styles.rewardValue}>+{getRatingReward(rating)} 🪙</Text>
            </View>
            {rating >= 4 && (
              <View style={styles.rewardRow}>
                <Text style={styles.rewardLabel}>Trust Level</Text>
                <Text style={styles.rewardValue}>+1 point 🔒</Text>
              </View>
            )}
            <Text style={styles.rewardNote}>
              {rating === 5
                ? '🌟 Note parfaite = récompenses maximales !'
                : rating >= 4
                ? '👍 Bonne note = bonus Trust Level'
                : '⚠️ Note basse = pas de bonus Trust Level'}
            </Text>
          </View>
        )}

        {/* Trust System Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Le saviez-vous ?</Text>
          <Text style={styles.infoText}>
            • Les notes aident à maintenir une communauté de qualité{'\n'}
            • Les notes de 4-5 ⭐ augmentent le Trust Level du binôme{'\n'}
            • Les notes de 1-2 ⭐ déclenchent une vérification de sécurité{'\n'}
            • Tes notes restent anonymes et confidentielles
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, (rating === 0 || submitting) && styles.submitButtonDisabled]}
          onPress={handleSubmitRating}
          disabled={rating === 0 || submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Envoi...' : '✓ Envoyer ma note'}
          </Text>
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => {
            Alert.alert(
              'Passer la notation ?',
              'Tu peux toujours noter cette session plus tard depuis ton historique.\n\nAttention : tu ne gagneras pas de MoovCoins si tu ne notes pas la session.',
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Passer',
                  style: 'destructive',
                  onPress: () => navigation.navigate('Home'),
                },
              ]
            );
          }}
        >
          <Text style={styles.skipButtonText}>Passer pour l'instant</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function getRatingDescription(rating: number): string {
  switch (rating) {
    case 5:
      return '🌟 Excellente expérience ! Ton binôme a été parfait(e).';
    case 4:
      return '👍 Bonne expérience. Quelques petites améliorations possibles.';
    case 3:
      return '😐 Expérience moyenne. La session s\'est bien passée mais sans plus.';
    case 2:
      return '⚠️ Expérience décevante. Plusieurs problèmes rencontrés.';
    case 1:
      return '❌ Mauvaise expérience. Problèmes importants à signaler.';
    default:
      return '';
  }
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    ...Typography.h3,
    color: Colors.gray600,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
  },
  backButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
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
  headerTitle: {
    ...Typography.h2,
    color: Colors.gray900,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.h4,
    color: Colors.gray700,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  headerDate: {
    ...Typography.body,
    color: Colors.gray500,
    textAlign: 'center',
  },
  partnerCard: {
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
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.gray600,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    ...Typography.h3,
    color: Colors.gray900,
    marginBottom: Spacing.xs,
  },
  trustBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  trustText: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: '600',
  },
  ratingCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 12,
    ...Shadows.small,
  },
  ratingSubtitle: {
    ...Typography.body,
    color: Colors.gray600,
    marginBottom: Spacing.lg,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  starButton: {
    padding: Spacing.xs,
  },
  starIcon: {
    fontSize: 48,
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  ratingLabel: {
    ...Typography.small,
    color: Colors.gray500,
  },
  ratingDescription: {
    backgroundColor: Colors.gray50,
    padding: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.md,
  },
  ratingDescriptionText: {
    ...Typography.body,
    color: Colors.gray700,
    textAlign: 'center',
  },
  commentCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 12,
    ...Shadows.small,
  },
  commentSubtitle: {
    ...Typography.small,
    color: Colors.gray500,
    marginBottom: Spacing.md,
  },
  commentInput: {
    ...Typography.body,
    backgroundColor: Colors.gray50,
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray200,
    color: Colors.gray900,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    ...Typography.small,
    color: Colors.gray400,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  rewardCard: {
    backgroundColor: Colors.primary + '10',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
  },
  rewardTitle: {
    ...Typography.h4,
    color: Colors.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  rewardLabel: {
    ...Typography.body,
    color: Colors.gray700,
  },
  rewardValue: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 18,
  },
  rewardNote: {
    ...Typography.small,
    color: Colors.gray600,
    textAlign: 'center',
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 12,
    ...Shadows.small,
  },
  infoTitle: {
    ...Typography.h4,
    color: Colors.gray900,
    marginBottom: Spacing.sm,
  },
  infoText: {
    ...Typography.body,
    color: Colors.gray700,
    lineHeight: 22,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    ...Shadows.medium,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.gray300,
  },
  submitButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  skipButton: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  skipButtonText: {
    ...Typography.body,
    color: Colors.gray500,
    textDecoration: 'underline',
  },
});
