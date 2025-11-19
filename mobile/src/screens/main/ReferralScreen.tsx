/**
 * ReferralScreen - Programme de Parrainage
 * Partager code, voir stats, leaderboard
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  Clipboard,
  Alert,
} from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../theme';
import {
  getMyReferralCode,
  getMyReferralStats,
  getMyReferralTier,
  getMyReferrals,
  getReferralLeaderboard,
  generateShareURL,
  generateShareMessage,
  ReferralCode,
  ReferralStats,
  ReferralTier,
  TIER_CONFIG,
} from '../services/referral';

export default function ReferralScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState<ReferralCode | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [tier, setTier] = useState<ReferralTier | null>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'leaderboard'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [codeData, statsData, tierData, referralsData, leaderboardData] = await Promise.all([
        getMyReferralCode(),
        getMyReferralStats(),
        getMyReferralTier(),
        getMyReferrals(),
        getReferralLeaderboard(100),
      ]);

      setCode(codeData);
      setStats(statsData);
      setTier(tierData);
      setReferrals(referralsData);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    if (!code) return;

    const message = generateShareMessage(code.code, 'toi'); // TODO: Get real username
    const url = generateShareURL(code.code);

    try {
      await Share.share({
        message: message,
        url: url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }

  function handleCopyCode() {
    if (!code) return;
    Clipboard.setString(code.code);
    Alert.alert('✅ Code copié !', `Ton code ${code.code} est dans le presse-papier.`);
  }

  function handleCopyLink() {
    if (!code) return;
    const url = generateShareURL(code.code);
    Clipboard.setString(url);
    Alert.alert('✅ Lien copié !', 'Le lien de parrainage est dans le presse-papier.');
  }

  function getTierInfo(tierName: string) {
    const tierColors = {
      none: Colors.gray500,
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      diamond: '#B9F2FF',
      elite: '#9D00FF',
    };

    const tierEmojis = {
      none: '',
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      diamond: '💎',
      elite: '👑',
    };

    return {
      color: tierColors[tierName as keyof typeof tierColors] || Colors.gray500,
      emoji: tierEmojis[tierName as keyof typeof tierEmojis] || '',
    };
  }

  function getNextTier(currentTier: string, totalReferrals: number) {
    const tiers = ['none', 'bronze', 'silver', 'gold', 'diamond', 'elite'];
    const currentIndex = tiers.indexOf(currentTier);

    if (currentIndex === tiers.length - 1) {
      return null; // Déjà au max
    }

    const nextTierName = tiers[currentIndex + 1];
    const config = TIER_CONFIG[nextTierName as keyof typeof TIER_CONFIG];

    return {
      name: nextTierName,
      needed: config.min_referrals - totalReferrals,
    };
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const tierInfo = getTierInfo(tier?.tier || 'none');
  const nextTier = getNextTier(tier?.tier || 'none', tier?.total_referrals || 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎁 Parrainage</Text>
        <Text style={styles.headerSubtitle}>Invite tes amis, gagne des récompenses !</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            Vue d'ensemble
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'referrals' && styles.tabActive]}
          onPress={() => setActiveTab('referrals')}
        >
          <Text style={[styles.tabText, activeTab === 'referrals' && styles.tabTextActive]}>
            Mes filleuls ({referrals.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'leaderboard' && styles.tabActive]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>
            Classement
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <>
            {/* Code de parrainage */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Ton code de parrainage</Text>

              <View style={styles.codeBox}>
                <Text style={styles.code}>{code?.code || 'LOADING'}</Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.buttonSecondary} onPress={handleCopyCode}>
                  <Text style={styles.buttonSecondaryText}>📋 Copier code</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonSecondary} onPress={handleCopyLink}>
                  <Text style={styles.buttonSecondaryText}>🔗 Copier lien</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.buttonPrimary} onPress={handleShare}>
                <Text style={styles.buttonPrimaryText}>📱 Partager</Text>
              </TouchableOpacity>
            </View>

            {/* Palier actuel */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Ton palier</Text>

              <View style={styles.tierBadge}>
                <Text style={styles.tierEmoji}>{tierInfo.emoji}</Text>
                <Text style={[styles.tierName, { color: tierInfo.color }]}>
                  {tier?.tier.toUpperCase() || 'NONE'}
                </Text>
              </View>

              <Text style={styles.tierStats}>
                {tier?.total_referrals || 0} filleuls • {tier?.active_referrals || 0} actifs •{' '}
                {tier?.premium_referrals || 0} Premium
              </Text>

              {nextTier && (
                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>
                    Plus que {nextTier.needed} filleul{nextTier.needed > 1 ? 's' : ''} pour{' '}
                    {nextTier.name.toUpperCase()}
                  </Text>

                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(
                            ((tier?.total_referrals || 0) /
                              TIER_CONFIG[nextTier.name as keyof typeof TIER_CONFIG]
                                .min_referrals) *
                              100,
                            100
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              )}

              {tier?.tier === 'elite' && (
                <Text style={styles.eliteMessage}>
                  👑 Palier MAX atteint ! Tu es une légende !
                </Text>
              )}
            </View>

            {/* Stats de performance */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📊 Tes stats</Text>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats?.total_clicks || 0}</Text>
                  <Text style={styles.statLabel}>Clics</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats?.total_signups || 0}</Text>
                  <Text style={styles.statLabel}>Inscriptions</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats?.conversion_rate.toFixed(1) || 0}%</Text>
                  <Text style={styles.statLabel}>Conversion</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats?.total_active || 0}</Text>
                  <Text style={styles.statLabel}>Actifs</Text>
                </View>
              </View>
            </View>

            {/* Gains totaux */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>💰 Gains totaux</Text>

              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>MoovCoins gagnés</Text>
                <Text style={styles.earningsValue}>
                  {stats?.total_moovcoins_earned || 0} coins
                </Text>
              </View>

              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>Premium gratuit</Text>
                <Text style={styles.earningsValue}>
                  {stats?.total_premium_days_earned || 0} jours
                </Text>
              </View>

              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>Commissions</Text>
                <Text style={styles.earningsValue}>
                  {((stats?.total_commission_cents || 0) / 100).toFixed(2)} €
                </Text>
              </View>
            </View>
          </>
        )}

        {activeTab === 'referrals' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tes filleuls ({referrals.length})</Text>

            {referrals.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  Aucun filleul pour le moment.{'\n'}Partage ton code pour commencer !
                </Text>
              </View>
            ) : (
              referrals.map((referral) => (
                <View key={referral.id} style={styles.referralItem}>
                  <View style={styles.referralInfo}>
                    <Text style={styles.referralUsername}>
                      @{referral.referred?.username || 'Unknown'}
                    </Text>
                    <Text style={styles.referralDate}>
                      Inscrit il y a {Math.floor((Date.now() - new Date(referral.created_at).getTime()) / (1000 * 60 * 60 * 24))} jours
                    </Text>
                  </View>

                  <View style={styles.referralBadges}>
                    {referral.status === 'completed' && (
                      <View style={[styles.badge, styles.badgeActive]}>
                        <Text style={styles.badgeText}>✅ Actif</Text>
                      </View>
                    )}

                    {referral.referred?.subscription_tier === 'premium' && (
                      <View style={[styles.badge, styles.badgePremium]}>
                        <Text style={styles.badgeText}>💎 Premium</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'leaderboard' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🏆 Top 100 Parrains</Text>

            {leaderboard.slice(0, 100).map((entry, index) => (
              <View key={entry.user_id} style={styles.leaderboardItem}>
                <View style={styles.leaderboardRank}>
                  {index < 3 ? (
                    <Text style={styles.leaderboardMedal}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </Text>
                  ) : (
                    <Text style={styles.leaderboardNumber}>#{index + 1}</Text>
                  )}
                </View>

                <View style={styles.leaderboardInfo}>
                  <Text style={styles.leaderboardUsername}>
                    @{entry.profile?.username || 'Unknown'}
                  </Text>
                  <Text style={styles.leaderboardStats}>
                    {entry.total_referrals} filleuls • {getTierInfo(entry.tier).emoji}{' '}
                    {entry.tier.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.gray900,
  },
  headerSubtitle: {
    ...Typography.body,
    color: Colors.gray600,
    marginTop: Spacing.xs,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    ...Typography.body,
    color: Colors.gray600,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.white,
    margin: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 12,
    ...Shadows.medium,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.gray900,
    marginBottom: Spacing.md,
  },
  codeBox: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  code: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: Colors.gray100,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    ...Typography.body,
    color: Colors.gray900,
    fontWeight: '600',
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  tierBadge: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tierEmoji: {
    fontSize: 48,
    marginBottom: Spacing.xs,
  },
  tierName: {
    fontSize: 24,
    fontWeight: '700',
  },
  tierStats: {
    ...Typography.body,
    color: Colors.gray600,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  progressContainer: {
    marginTop: Spacing.md,
  },
  progressLabel: {
    ...Typography.small,
    color: Colors.gray600,
    marginBottom: Spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  eliteMessage: {
    ...Typography.body,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.gray50,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.gray900,
  },
  statLabel: {
    ...Typography.small,
    color: Colors.gray600,
    marginTop: Spacing.xs,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  earningsLabel: {
    ...Typography.body,
    color: Colors.gray700,
  },
  earningsValue: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.gray900,
  },
  emptyState: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    ...Typography.body,
    color: Colors.gray500,
    textAlign: 'center',
  },
  referralItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  referralInfo: {
    flex: 1,
  },
  referralUsername: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.gray900,
  },
  referralDate: {
    ...Typography.small,
    color: Colors.gray500,
  },
  referralBadges: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: Colors.success + '20',
  },
  badgePremium: {
    backgroundColor: Colors.primary + '20',
  },
  badgeText: {
    ...Typography.small,
    fontWeight: '600',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  leaderboardRank: {
    width: 40,
    alignItems: 'center',
  },
  leaderboardMedal: {
    fontSize: 24,
  },
  leaderboardNumber: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.gray600,
  },
  leaderboardInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  leaderboardUsername: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.gray900,
  },
  leaderboardStats: {
    ...Typography.small,
    color: Colors.gray600,
  },
});
