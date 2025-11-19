/**
 * MoovUp Now - Profile Screen
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors, Spacing, TextPresets, BorderRadius, Shadows } from '../../theme';
import { Card, TrustBadge, Button } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentUserProfile, getTrustStats, getUserSports, getUserBadges } from '../../services/profile';
import { UserProfile, Sport, Badge } from '../../types';
import { getTrustLevelInfo } from '../../utils/trustLevel';

export default function ProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trustStats, setTrustStats] = useState<any>(null);
  const [sports, setSports] = useState<Sport[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, statsData, sportsData, badgesData] = await Promise.all([
        getCurrentUserProfile(),
        getTrustStats(),
        getUserSports(),
        getUserBadges(),
      ]);
      setProfile(profileData);
      setTrustStats(statsData);
      setSports(sportsData);
      setBadges(badgesData);
    } catch (error) {
      console.error('Error loading profile data:', error);
      Alert.alert('Erreur', 'Impossible de charger le profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Déconnexion',
      'Es-tu sûr de vouloir te déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const username = profile?.username || 'utilisateur';
  const firstName = profile?.first_name;
  const lastName = profile?.last_name;
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName;
  const bio = profile?.bio || 'Aucune bio pour le moment';
  const trustLevel = trustStats?.trustLevel || 1;
  const trustLevelInfo = getTrustLevelInfo(trustLevel, trustStats);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {firstName ? firstName[0].toUpperCase() : username[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.username}>@{username}</Text>
        {fullName && <Text style={styles.fullName}>{fullName}</Text>}
        <Text style={styles.bio}>{bio}</Text>

        <View style={styles.trustBadgeContainer}>
          <TrustBadge level={trustLevel} size="large" />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{trustStats?.totalSessions || 0}</Text>
          <Text style={styles.statLabel}>Séances</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {trustStats?.averageRating > 0 ? trustStats.averageRating.toFixed(1) : '-'}
          </Text>
          <Text style={styles.statLabel}>Note</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile?.points || 0}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>

      {/* Trust Level Details */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Niveau de confiance</Text>
        <View style={styles.trustDetails}>
          <View style={styles.trustDetailRow}>
            <Text style={styles.trustDetailLabel}>Sessions même sexe:</Text>
            <Text style={styles.trustDetailValue}>
              {trustStats?.sameGenderSessions || 0}
            </Text>
          </View>
          <View style={styles.trustDetailRow}>
            <Text style={styles.trustDetailLabel}>Sessions groupe:</Text>
            <Text style={styles.trustDetailValue}>
              {trustStats?.groupSessions || 0}
            </Text>
          </View>
          <View style={styles.trustDetailRow}>
            <Text style={styles.trustDetailLabel}>Sessions sexe opposé:</Text>
            <Text style={styles.trustDetailValue}>
              {trustStats?.oppositeGenderSessions || 0}
            </Text>
          </View>
          <View style={styles.trustDetailRow}>
            <Text style={styles.trustDetailLabel}>Ancienneté:</Text>
            <Text style={styles.trustDetailValue}>
              {trustStats?.accountAgeDays || 0} jours
            </Text>
          </View>
        </View>

        {trustLevel < 5 && (
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>Prochain niveau :</Text>
            <Text style={styles.progressText}>{trustLevelInfo.nextLevelRequirements}</Text>
          </View>
        )}
      </Card>

      {/* QR Code */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>QR Code de session</Text>
        <Text style={styles.sectionDescription}>
          Scanne ce code lors de chaque session pour valider ta présence
        </Text>
        <View style={styles.qrContainer}>
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrText}>QR</Text>
            <Text style={styles.qrCode}>{profile?.qr_code || 'XXXXXX'}</Text>
          </View>
          <Text style={styles.qrLabel}>Code: {profile?.qr_code || 'Génération...'}</Text>
        </View>
      </Card>

      {/* Sports */}
      {sports.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Mes sports</Text>
          <View style={styles.sportsGrid}>
            {sports.map((sport) => (
              <View key={sport.id} style={styles.sportChip}>
                <Text style={styles.sportEmoji}>{sport.emoji}</Text>
                <Text style={styles.sportName}>{sport.name}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Mes badges</Text>
          <View style={styles.badgesGrid}>
            {badges.map((badge) => (
              <View key={badge.id} style={styles.badgeItem}>
                <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                <Text style={styles.badgeName}>{badge.name}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Actions */}
      <View style={styles.section}>
        <Button
          title="Modifier mon profil"
          variant="outline"
          onPress={() => {}}
          fullWidth
          style={styles.actionButton}
        />
        <Button
          title="Paramètres"
          variant="outline"
          onPress={() => {}}
          fullWidth
          style={styles.actionButton}
        />
        <Button
          title="Se déconnecter"
          variant="ghost"
          onPress={handleSignOut}
          fullWidth
          style={styles.actionButton}
        />
      </View>

      <View style={styles.bottomSpacer} />
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
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  avatarText: {
    fontSize: 48,
    color: Colors.white,
    fontWeight: 'bold',
  },
  username: {
    ...TextPresets.h3,
    color: Colors.text.primary,
  },
  fullName: {
    ...TextPresets.body,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  bio: {
    ...TextPresets.body,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  trustBadgeContainer: {
    marginTop: Spacing.lg,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  statValue: {
    ...TextPresets.h2,
    color: Colors.primary,
  },
  statLabel: {
    ...TextPresets.small,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  section: {
    margin: Spacing.lg,
  },
  sectionTitle: {
    ...TextPresets.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  sectionDescription: {
    ...TextPresets.small,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  trustDetails: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  trustDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  trustDetailLabel: {
    ...TextPresets.body,
    color: Colors.text.secondary,
  },
  trustDetailValue: {
    ...TextPresets.bodyMedium,
    color: Colors.text.primary,
  },
  progressInfo: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.md,
  },
  progressTitle: {
    ...TextPresets.bodyMedium,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  progressText: {
    ...TextPresets.small,
    color: Colors.primary,
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  qrText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.gray[300],
    marginBottom: Spacing.sm,
  },
  qrCode: {
    ...TextPresets.h4,
    color: Colors.primary,
    fontFamily: 'monospace',
  },
  qrLabel: {
    ...TextPresets.body,
    color: Colors.text.secondary,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sportEmoji: {
    fontSize: 18,
    marginRight: Spacing.xs,
  },
  sportName: {
    ...TextPresets.small,
    color: Colors.text.primary,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  badgeItem: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  badgeName: {
    ...TextPresets.small,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  actionButton: {
    marginBottom: Spacing.md,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});
