/**
 * MoovUp Now - Home Screen (Redesigned)
 * Modern, beautiful and performant
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Card, Button, TrustBadge, SportBadge } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentUserProfile, getTrustStats } from '../../services/profile';
import { UserProfile } from '../../types';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trustStats, setTrustStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

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

      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
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

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const firstName = profile?.first_name || profile?.username || 'Moover';
  const moovCoins = profile?.moov_coins || 0;
  const trustLevel = trustStats?.trustLevel || 0;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Gradient Header */}
      <LinearGradient
        colors={Colors.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>
              {greeting} {firstName} 👋
            </Text>
            <Text style={styles.slogan}>Bouge maintenant. Pas demain.</Text>
          </View>
          <TouchableOpacity
            style={styles.coinsButton}
            onPress={() => navigation.navigate('Shop')}
          >
            <Text style={styles.coinsValue}>{moovCoins}</Text>
            <Text style={styles.coinsLabel}>🪙</Text>
          </TouchableOpacity>
        </View>

        {/* Trust Badge */}
        <View style={styles.trustContainer}>
          <TrustBadge level={trustLevel} size="lg" />
          {trustStats && (
            <View style={styles.quickStats}>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue}>{trustStats.totalSessions}</Text>
                <Text style={styles.quickStatLabel}>Sessions</Text>
              </View>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue}>
                  {trustStats.averageRating > 0
                    ? trustStats.averageRating.toFixed(1)
                    : '-'}
                </Text>
                <Text style={styles.quickStatLabel}>Note</Text>
              </View>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue}>{trustStats.accountAgeDays}j</Text>
                <Text style={styles.quickStatLabel}>Membre</Text>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>

      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Quick Actions - Modern Grid */}
        <View style={styles.actionsSection}>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors.sports.running + '15' }]}
              onPress={() => navigation.navigate('SessionCreate')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.sports.running }]}>
                <Text style={styles.actionEmoji}>➕</Text>
              </View>
              <Text style={styles.actionLabel}>Créer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors.sports.football + '15' }]}
              onPress={() => navigation.navigate('Find')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.sports.football }]}>
                <Text style={styles.actionEmoji}>🔍</Text>
              </View>
              <Text style={styles.actionLabel}>Trouver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors.secondary + '15' }]}
              onPress={() => navigation.navigate('Coach')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.secondary }]}>
                <Text style={styles.actionEmoji}>🤖</Text>
              </View>
              <Text style={styles.actionLabel}>Coach IA</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors.accent + '15' }]}
              onPress={() => navigation.navigate('Shop')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.accent }]}>
                <Text style={styles.actionEmoji}>🛍️</Text>
              </View>
              <Text style={styles.actionLabel}>Boutique</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* New Features Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🚀 Nouvelles fonctionnalités</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Tout voir</Text>
            </TouchableOpacity>
          </View>

          {/* Referral Card */}
          <Card variant="gradient" gradient={Colors.gradients.premium} style={styles.featureCard}>
            <View style={styles.featureContent}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>🎁</Text>
              </View>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>Programme de Parrainage</Text>
                <Text style={styles.featureSubtitle}>
                  Invite tes amis et gagne jusqu'à 500 MoovCoins + 30% de commissions !
                </Text>
              </View>
            </View>
            <Button
              title="Parrainer"
              variant="ghost"
              size="sm"
              onPress={() => navigation.navigate('Referral')}
              textStyle={{ color: Colors.white }}
            />
          </Card>

          {/* Sentinel Mode Card */}
          <Card variant="elevated" shadow="lg" style={styles.featureCard}>
            <View style={styles.featureContent}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: Colors.sessionStatus.confirmed + '20' },
                ]}
              >
                <Text style={styles.featureEmoji}>🛡️</Text>
              </View>
              <View style={styles.featureInfo}>
                <Text style={[styles.featureTitle, { color: Colors.gray[900] }]}>
                  Mode Sentinel
                </Text>
                <Text style={[styles.featureSubtitle, { color: Colors.gray[600] }]}>
                  Partage ta position en temps réel avec tes contacts de confiance
                </Text>
              </View>
            </View>
            <Button
              title="Configurer"
              variant="outline"
              size="sm"
              onPress={() => navigation.navigate('SentinelSetup')}
            />
          </Card>
        </View>

        {/* Sessions à venir */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📅 Prochaines sessions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          <Card variant="outlined" style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🏃‍♂️</Text>
            <Text style={styles.emptyTitle}>Aucune session planifiée</Text>
            <Text style={styles.emptySubtitle}>
              Trouve des partenaires pour bouger ensemble !
            </Text>
            <Button
              title="Trouver une session"
              variant="gradient"
              size="md"
              onPress={() => navigation.navigate('Find')}
              style={{ marginTop: Spacing.lg }}
            />
          </Card>
        </View>

        {/* Sports populaires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Sports populaires</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.sportsRow}>
              <SportBadge sport="running" emoji="🏃" size="lg" />
              <SportBadge sport="football" emoji="⚽" size="lg" />
              <SportBadge sport="basketball" emoji="🏀" size="lg" />
              <SportBadge sport="tennis" emoji="🎾" size="lg" />
              <SportBadge sport="yoga" emoji="🧘" size="lg" />
            </View>
          </ScrollView>
        </View>

        {/* Progress Card */}
        {trustLevel < 5 && (
          <View style={styles.section}>
            <Card variant="elevated" shadow="md" style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>🎯 Progression Trust Level</Text>
                <Text style={styles.progressLevel}>Niveau {trustLevel}</Text>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={Colors.gradients.success}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.progressFill,
                      { width: `${(trustLevel / 5) * 100}%` },
                    ]}
                  />
                </View>
              </View>

              <Text style={styles.progressText}>
                {trustLevel < 3
                  ? `${10 - (trustStats?.totalSessions || 0)} sessions pour débloquer le niveau ${trustLevel + 1}`
                  : 'Continue à participer pour augmenter ton niveau !'}
              </Text>
            </Card>
          </View>
        )}

        {/* Tips */}
        <View style={styles.section}>
          <Card
            variant="elevated"
            shadow="sm"
            style={[styles.tipCard, { backgroundColor: Colors.info + '10' }]}
          >
            <View style={styles.tipIcon}>
              <Text style={styles.tipEmoji}>💡</Text>
            </View>
            <Text style={styles.tipText}>
              {trustLevel < 2
                ? 'Astuce : Complète 10 sessions pour débloquer plus de fonctionnalités !'
                : 'Astuce : Parraine tes amis pour gagner des MoovCoins et des jours Premium !'}
            </Text>
          </Card>
        </View>

        <View style={{ height: Spacing['4xl'] }} />
      </Animated.View>
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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    ...Shadows.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  greeting: {
    ...Typography.h2,
    color: Colors.white,
    fontWeight: '700',
  },
  slogan: {
    ...Typography.body,
    color: Colors.white,
    opacity: 0.9,
    marginTop: Spacing.xs,
  },
  coinsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  coinsValue: {
    ...Typography.h4,
    color: Colors.white,
    fontWeight: '700',
  },
  coinsLabel: {
    fontSize: 20,
  },
  trustContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatValue: {
    ...Typography.h4,
    color: Colors.white,
    fontWeight: '700',
  },
  quickStatLabel: {
    ...Typography.small,
    color: Colors.white,
    opacity: 0.8,
    fontSize: 11,
  },
  actionsSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing.xl,
    marginBottom: Spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionLabel: {
    ...Typography.small,
    color: Colors.gray[900],
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.gray[900],
    fontWeight: '700',
  },
  seeAll: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  featureCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureEmoji: {
    fontSize: 28,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.h4,
    color: Colors.white,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  featureSubtitle: {
    ...Typography.small,
    color: Colors.white,
    opacity: 0.9,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.gray[900],
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  sportsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  progressCard: {
    padding: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressTitle: {
    ...Typography.h4,
    color: Colors.gray[900],
    fontWeight: '700',
  },
  progressLevel: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '700',
  },
  progressBarContainer: {
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressText: {
    ...Typography.small,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.lg,
  },
  tipIcon: {
    marginRight: Spacing.md,
  },
  tipEmoji: {
    fontSize: 28,
  },
  tipText: {
    ...Typography.body,
    color: Colors.gray[900],
    flex: 1,
    lineHeight: 22,
  },
});
