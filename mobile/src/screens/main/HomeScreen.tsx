/**
 * MoovUp Now - Home Screen
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Colors, Spacing, TextPresets, BorderRadius, Shadows } from '../../theme';
import { Card, TrustBadge } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentUserProfile, getTrustStats } from '../../services/profile';
import { UserProfile } from '../../types';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trustStats, setTrustStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, statsData] = await Promise.all([
        getCurrentUserProfile(),
        getTrustStats(),
      ]);
      setProfile(profileData);
      setTrustStats(statsData);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const firstName = profile?.first_name || profile?.username || 'Moover';
  const currentHour = new Date().getHours();
  let greeting = 'Bonjour';
  if (currentHour < 12) greeting = 'Bonjour';
  else if (currentHour < 18) greeting = 'Bon après-midi';
  else greeting = 'Bonsoir';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {greeting} {firstName} 👋
          </Text>
          <Text style={styles.slogan}>Bouge maintenant. Pas demain.</Text>
        </View>
        {trustStats && (
          <TrustBadge level={trustStats.trustLevel} size="medium" />
        )}
      </View>

      {/* Trust Level Card */}
      {trustStats && (
        <Card style={styles.trustCard} onPress={() => navigation.navigate('Profile')}>
          <View style={styles.trustCardHeader}>
            <Text style={styles.cardTitle}>Ton niveau de confiance</Text>
            <Text style={styles.trustLevel}>Niveau {trustStats.trustLevel}</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{trustStats.totalSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {trustStats.averageRating > 0
                  ? trustStats.averageRating.toFixed(1)
                  : '-'}
              </Text>
              <Text style={styles.statLabel}>Note moy.</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{trustStats.accountAgeDays}j</Text>
              <Text style={styles.statLabel}>Ancienneté</Text>
            </View>
          </View>

          {trustStats.trustLevel < 3 && (
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {trustStats.trustLevel === 1
                  ? '🔰 Participe à 10 sessions pour débloquer le niveau 2'
                  : '⚡ Continue comme ça ! 8 sessions de plus pour le niveau 3'}
              </Text>
            </View>
          )}
        </Card>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Find')}
          >
            <Text style={styles.actionEmoji}>🔍</Text>
            <Text style={styles.actionLabel}>Trouver une session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {}}
          >
            <Text style={styles.actionEmoji}>➕</Text>
            <Text style={styles.actionLabel}>Créer une session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Goals')}
          >
            <Text style={styles.actionEmoji}>🎯</Text>
            <Text style={styles.actionLabel}>Mes objectifs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Shop')}
          >
            <Text style={styles.actionEmoji}>🛍️</Text>
            <Text style={styles.actionLabel}>Boutique</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Prochaines sessions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prochaines sessions</Text>
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>📅</Text>
          <Text style={styles.emptyTitle}>Aucune session planifiée</Text>
          <Text style={styles.emptySubtitle}>
            Trouve des partenaires pour bouger ensemble !
          </Text>
        </Card>
      </View>

      {/* Daily Goal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Objectif du jour</Text>
        <Card style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalEmoji}>⚡</Text>
            <View style={styles.goalContent}>
              <Text style={styles.goalTitle}>30 minutes d'activité</Text>
              <Text style={styles.goalSubtitle}>0 / 30 minutes</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '0%' }]} />
          </View>
        </Card>
      </View>

      {/* Tips */}
      <View style={styles.section}>
        <Card style={styles.tipCard}>
          <Text style={styles.tipEmoji}>💡</Text>
          <Text style={styles.tipText}>
            {trustStats?.trustLevel === 1
              ? 'Commence par des sessions avec des personnes du même sexe ou en groupe pour débloquer plus d\'options !'
              : 'Continue à participer et à bien noter tes partenaires pour progresser !'}
          </Text>
        </Card>
      </View>
    </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greeting: {
    ...TextPresets.h2,
    color: Colors.text.primary,
  },
  slogan: {
    ...TextPresets.body,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  trustCard: {
    margin: Spacing.lg,
    marginBottom: Spacing.md,
  },
  trustCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    ...TextPresets.h4,
    color: Colors.text.primary,
  },
  trustLevel: {
    ...TextPresets.bodyMedium,
    color: Colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TextPresets.h3,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...TextPresets.small,
    color: Colors.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  progressInfo: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.md,
  },
  progressText: {
    ...TextPresets.small,
    color: Colors.primary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...TextPresets.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  actionCard: {
    width: '48%',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    ...TextPresets.bodyMedium,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...TextPresets.bodyMedium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...TextPresets.small,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  goalCard: {
    padding: Spacing.lg,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  goalEmoji: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    ...TextPresets.bodyMedium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  goalSubtitle: {
    ...TextPresets.small,
    color: Colors.text.secondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.accent + '10',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  tipEmoji: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  tipText: {
    ...TextPresets.body,
    color: Colors.text.primary,
    flex: 1,
  },
});
