/**
 * MoovUp Now - Onboarding Step 2: Goals Selection
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Spacing, TextPresets, BorderRadius } from '../../theme';
import { Button } from '../../components/common';

type Goal = {
  id: string;
  emoji: string;
  title: string;
  description: string;
};

const AVAILABLE_GOALS: Goal[] = [
  {
    id: 'lose_weight',
    emoji: '⚖️',
    title: 'Perdre du poids',
    description: 'Atteindre un poids santé',
  },
  {
    id: 'build_muscle',
    emoji: '💪',
    title: 'Prendre du muscle',
    description: 'Développer ma masse musculaire',
  },
  {
    id: 'improve_endurance',
    emoji: '🏃',
    title: 'Améliorer mon endurance',
    description: 'Courir plus longtemps, plus loin',
  },
  {
    id: 'flexibility',
    emoji: '🧘',
    title: 'Être plus souple',
    description: 'Améliorer ma flexibilité',
  },
  {
    id: 'stay_active',
    emoji: '✨',
    title: 'Rester actif',
    description: 'Bouger régulièrement',
  },
  {
    id: 'meet_people',
    emoji: '👥',
    title: 'Rencontrer des gens',
    description: 'Créer des liens sociaux',
  },
  {
    id: 'stress_relief',
    emoji: '😌',
    title: 'Réduire le stress',
    description: 'Me détendre et décompresser',
  },
  {
    id: 'compete',
    emoji: '🏆',
    title: 'Me challenger',
    description: 'Participer à des compétitions',
  },
  {
    id: 'learn_new',
    emoji: '🎓',
    title: 'Apprendre un nouveau sport',
    description: 'Découvrir de nouvelles activités',
  },
  {
    id: 'health',
    emoji: '❤️',
    title: 'Santé générale',
    description: 'Améliorer ma santé globale',
  },
];

export default function OnboardingGoalsScreen({ navigation, route }: any) {
  const { selectedSports } = route.params || {};
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goalId)) {
        return prev.filter((id) => id !== goalId);
      } else {
        // Limit to 3 goals max
        if (prev.length >= 3) {
          Alert.alert('Maximum atteint', 'Tu peux sélectionner 3 objectifs maximum');
          return prev;
        }
        return [...prev, goalId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedGoals.length === 0) {
      Alert.alert('Attention', 'Sélectionne au moins un objectif pour continuer');
      return;
    }
    navigation.navigate('OnboardingAvailability', {
      selectedSports,
      selectedGoals,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.step}>Étape 2/4</Text>
        <Text style={styles.title}>Tes objectifs</Text>
        <Text style={styles.subtitle}>
          Quels sont tes objectifs ? (max 3)
        </Text>
      </View>

      {/* Goals Selection */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.goalsGrid}>
          {AVAILABLE_GOALS.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            return (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  isSelected && styles.goalCardSelected,
                ]}
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                <Text
                  style={[
                    styles.goalTitle,
                    isSelected && styles.goalTitleSelected,
                  ]}
                >
                  {goal.title}
                </Text>
                <Text style={styles.goalDescription}>{goal.description}</Text>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkIcon}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.selectedCount}>
          {selectedGoals.length}/3 objectif{selectedGoals.length > 1 ? 's' : ''}{' '}
          sélectionné{selectedGoals.length > 1 ? 's' : ''}
        </Text>
        <View style={styles.buttonRow}>
          <Button
            title="Retour"
            variant="outline"
            onPress={handleBack}
            style={styles.backButton}
          />
          <Button
            title="Continuer"
            onPress={handleContinue}
            disabled={selectedGoals.length === 0}
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
  goalsGrid: {
    gap: Spacing.md,
  },
  goalCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  goalCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  goalEmoji: {
    fontSize: 40,
    marginRight: Spacing.md,
  },
  goalTitle: {
    ...TextPresets.bodyMedium,
    color: Colors.text.primary,
    flex: 1,
  },
  goalTitleSelected: {
    color: Colors.primary,
  },
  goalDescription: {
    ...TextPresets.small,
    color: Colors.text.secondary,
    position: 'absolute',
    bottom: Spacing.sm,
    left: 68,
  },
  checkmark: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkIcon: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    padding: Spacing.xl,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  selectedCount: {
    ...TextPresets.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
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
