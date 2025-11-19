/**
 * MoovUp Now - Session Card Component
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, TextPresets, BorderRadius, Shadows } from '../../theme';
import { TrustBadge } from '../common';
import { Session } from '../../types';

type SessionCardProps = {
  session: Session;
  onPress: () => void;
  showDistance?: boolean;
  distance?: number;
};

export default function SessionCard({
  session,
  onPress,
  showDistance = false,
  distance,
}: SessionCardProps) {
  const formattedDate = new Date(session.scheduled_at).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const formattedTime = new Date(session.scheduled_at).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const currentParticipants = session.session_participants?.length || 0;
  const spotsLeft = session.max_participants - currentParticipants;

  const sessionTypeLabel =
    session.session_type === 'one-on-one' ? '👥 1-on-1' : '👨‍👩‍👧‍👦 Groupe';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sportEmoji}>{session.sport?.emoji || '🏃'}</Text>
          <View>
            <Text style={styles.title} numberOfLines={1}>
              {session.title}
            </Text>
            <Text style={styles.sport}>{session.sport?.name}</Text>
          </View>
        </View>
        {showDistance && distance !== undefined && (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{distance.toFixed(1)} km</Text>
          </View>
        )}
      </View>

      {/* Creator Info */}
      <View style={styles.creatorRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {session.creator?.username?.[0].toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.creatorInfo}>
          <Text style={styles.username}>@{session.creator?.username}</Text>
          <TrustBadge level={session.creator?.trust_level || 1} size="small" />
        </View>
        {session.creator?.average_rating && session.creator.average_rating > 0 && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>
              ⭐ {session.creator.average_rating.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>
            {formattedDate} à {formattedTime}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText} numberOfLines={1}>
            {session.location_name}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>⏱️</Text>
          <Text style={styles.detailText}>{session.duration_minutes} min</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>
            {session.session_type === 'one-on-one' ? '👥' : '👨‍👩‍👧‍👦'}
          </Text>
          <Text style={styles.detailText}>{sessionTypeLabel}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View
          style={[
            styles.spotsBadge,
            spotsLeft === 0 && styles.spotsBadgeFull,
          ]}
        >
          <Text
            style={[
              styles.spotsText,
              spotsLeft === 0 && styles.spotsTextFull,
            ]}
          >
            {spotsLeft === 0
              ? 'Complet'
              : `${spotsLeft} place${spotsLeft > 1 ? 's' : ''} restante${spotsLeft > 1 ? 's' : ''}`}
          </Text>
        </View>

        {session.gender_preference && session.gender_preference !== 'any' && (
          <View style={styles.genderBadge}>
            <Text style={styles.genderText}>
              {session.gender_preference === 'male' ? '♂️ Hommes' : '♀️ Femmes'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sportEmoji: {
    fontSize: 32,
    marginRight: Spacing.sm,
  },
  title: {
    ...TextPresets.h4,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  sport: {
    ...TextPresets.small,
    color: Colors.text.secondary,
  },
  distanceBadge: {
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  distanceText: {
    ...TextPresets.small,
    color: Colors.primary,
    fontWeight: '600',
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  creatorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  username: {
    ...TextPresets.bodyMedium,
    color: Colors.text.primary,
  },
  ratingBadge: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  ratingText: {
    ...TextPresets.small,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  details: {
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
    width: 20,
  },
  detailText: {
    ...TextPresets.body,
    color: Colors.text.secondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  spotsBadge: {
    backgroundColor: Colors.success + '10',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    flex: 1,
  },
  spotsBadgeFull: {
    backgroundColor: Colors.gray[200],
  },
  spotsText: {
    ...TextPresets.small,
    color: Colors.success,
    fontWeight: '600',
    textAlign: 'center',
  },
  spotsTextFull: {
    color: Colors.text.secondary,
  },
  genderBadge: {
    backgroundColor: Colors.secondary + '10',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  genderText: {
    ...TextPresets.small,
    color: Colors.secondary,
    fontWeight: '600',
  },
});
