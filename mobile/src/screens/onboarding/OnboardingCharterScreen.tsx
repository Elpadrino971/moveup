/**
 * MoovUp Now - Onboarding Step 4: Charter Acceptance
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, TextPresets, BorderRadius } from '../../theme';
import { Button } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

const CHARTER_RULES = [
  {
    emoji: '🤝',
    title: 'Respect mutuel',
    description: 'Je m\'engage à respecter tous les utilisateurs, sans discrimination',
  },
  {
    emoji: '🔒',
    title: 'Sécurité d\'abord',
    description: 'Je rencontre dans des lieux publics et informe mes proches',
  },
  {
    emoji: '✅',
    title: 'Code QR obligatoire',
    description: 'Je scanne le QR code à chaque session pour valider ma présence',
  },
  {
    emoji: '🚫',
    title: 'Zéro tolérance',
    description: 'Je signale tout comportement inapproprié immédiatement',
  },
  {
    emoji: '📱',
    title: 'Communication claire',
    description: 'Je communique mes intentions et limites clairement',
  },
  {
    emoji: '⭐',
    title: 'Feedback honnête',
    description: 'Je note mes partenaires de façon juste et constructive',
  },
];

const TRUST_LEVELS = [
  {
    level: 1,
    emoji: '🔰',
    name: 'Débutant',
    description: 'Même sexe ou groupes uniquement',
  },
  {
    level: 3,
    emoji: '✅',
    name: 'Vérifié',
    description: 'Déblocage sexe opposé après 10 sessions validées',
  },
  {
    level: 5,
    emoji: '👑',
    name: 'Legend',
    description: 'Statut expert avec avantages premium',
  },
];

export default function OnboardingCharterScreen({ navigation, route }: any) {
  const { selectedSports, selectedGoals, availability } = route.params || {};
  const { user } = useAuth();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!accepted) {
      Alert.alert('Attention', 'Tu dois accepter la charte pour continuer');
      return;
    }

    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    setLoading(true);

    try {
      // 1. Update profile with onboarding data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          charter_accepted: true,
          charter_accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Insert selected sports
      if (selectedSports && selectedSports.length > 0) {
        const userSports = selectedSports.map((sportId: string, index: number) => ({
          user_id: user.id,
          sport_id: sportId,
          skill_level: 'beginner', // Default level
          is_favorite: index === 0, // First one is favorite
        }));

        const { error: sportsError } = await supabase
          .from('user_sports')
          .insert(userSports);

        if (sportsError) throw sportsError;
      }

      // 3. Insert goals
      if (selectedGoals && selectedGoals.length > 0) {
        const userGoals = selectedGoals.map((goalId: string) => ({
          user_id: user.id,
          goal_type: goalId,
          target_value: null,
          current_value: 0,
          status: 'active',
        }));

        const { error: goalsError } = await supabase
          .from('user_goals')
          .insert(userGoals);

        if (goalsError) throw goalsError;
      }

      // 4. Insert availability
      if (availability) {
        const { days, timeSlots } = availability;
        const availabilities = [];

        for (const day of days) {
          for (const slot of timeSlots) {
            availabilities.push({
              user_id: user.id,
              day_of_week: day,
              time_slot: slot,
              is_available: true,
            });
          }
        }

        const { error: availError } = await supabase
          .from('user_availability')
          .insert(availabilities);

        if (availError) throw availError;
      }

      // Success! The AuthContext will detect charter_accepted and update isOnboardingComplete
      Alert.alert(
        'Bienvenue ! 🎉',
        'Ton profil est prêt ! Tu débutes au niveau 🔰 Débutant. Participe à des sessions pour progresser !',
        [{ text: 'C\'est parti !', style: 'default' }]
      );

      // Navigation will happen automatically via AuthContext
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      Alert.alert(
        'Erreur',
        error.message || 'Une erreur est survenue. Réessaye plus tard.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.step}>Étape 4/4</Text>
        <Text style={styles.title}>Charte de sécurité</Text>
        <Text style={styles.subtitle}>
          Pour une expérience sûre et respectueuse
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Charter Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Je m'engage à :</Text>
          {CHARTER_RULES.map((rule, index) => (
            <View key={index} style={styles.ruleCard}>
              <Text style={styles.ruleEmoji}>{rule.emoji}</Text>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>{rule.title}</Text>
                <Text style={styles.ruleDescription}>{rule.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Trust System */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Système de confiance progressif</Text>
          <View style={styles.trustInfoBox}>
            <Text style={styles.trustInfoText}>
              Pour ta sécurité, tu débutes avec des restrictions qui se
              lèveront au fur et à mesure de ta participation :
            </Text>
          </View>
          {TRUST_LEVELS.map((level) => (
            <View key={level.level} style={styles.trustLevelCard}>
              <Text style={styles.trustLevelEmoji}>{level.emoji}</Text>
              <View style={styles.trustLevelContent}>
                <Text style={styles.trustLevelName}>
                  Niveau {level.level} - {level.name}
                </Text>
                <Text style={styles.trustLevelDescription}>
                  {level.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Acceptance Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAccepted(!accepted)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
            {accepted && <Text style={styles.checkboxIcon}>✓</Text>}
          </View>
          <Text style={styles.checkboxText}>
            J'ai lu et j'accepte la charte de sécurité et les conditions
            d'utilisation de MoovUp Now
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <Button
            title="Retour"
            variant="outline"
            onPress={handleBack}
            disabled={loading}
            style={styles.backButton}
          />
          <Button
            title={loading ? 'Finalisation...' : 'Commencer !'}
            onPress={handleComplete}
            disabled={!accepted || loading}
            loading={loading}
            style={styles.continueButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  step: {
    ...TextPresets.small,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  title: {
    ...TextPresets.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...TextPresets.body,
    color: Colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...TextPresets.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  ruleCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ruleEmoji: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  ruleContent: {
    flex: 1,
  },
  ruleTitle: {
    ...TextPresets.bodyMedium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  ruleDescription: {
    ...TextPresets.small,
    color: Colors.text.secondary,
  },
  trustInfoBox: {
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  trustInfoText: {
    ...TextPresets.small,
    color: Colors.primary,
    textAlign: 'center',
  },
  trustLevelCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trustLevelEmoji: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  trustLevelContent: {
    flex: 1,
  },
  trustLevelName: {
    ...TextPresets.bodyMedium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  trustLevelDescription: {
    ...TextPresets.small,
    color: Colors.text.secondary,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxIcon: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxText: {
    ...TextPresets.body,
    color: Colors.text.primary,
    flex: 1,
  },
  footer: {
    padding: Spacing.xl,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  backButton: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
  },
});
