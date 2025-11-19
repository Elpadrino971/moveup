/**
 * MoovUp Now - Onboarding Step 1: Sports Selection
 */

import React, { useState, useEffect } from 'react';
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
import { supabase } from '../../services/supabase';
import { Sport } from '../../types';

const SPORT_CATEGORIES = {
  individual: '🏃 Sports Individuels',
  team: '⚽ Sports Collectifs',
  fitness: '💪 Fitness & Gym',
  outdoor: '🏔️ Sports Outdoor',
  combat: '🥊 Sports de Combat',
  racket: '🎾 Sports de Raquette',
  water: '🏊 Sports Aquatiques',
  winter: '⛷️ Sports d\'Hiver',
};

export default function OnboardingSportsScreen({ navigation }: any) {
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSports();
  }, []);

  const loadSports = async () => {
    try {
      const { data, error } = await supabase
        .from('sports')
        .select('*')
        .order('name');

      if (error) throw error;
      setSports(data || []);
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de charger les sports');
      console.error('Error loading sports:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSport = (sportId: string) => {
    setSelectedSports((prev) => {
      if (prev.includes(sportId)) {
        return prev.filter((id) => id !== sportId);
      } else {
        return [...prev, sportId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedSports.length === 0) {
      Alert.alert('Attention', 'Sélectionne au moins un sport pour continuer');
      return;
    }
    // Navigate to next onboarding step with selected sports
    navigation.navigate('OnboardingGoals', { selectedSports });
  };

  const getSportsByCategory = (category: string) => {
    return sports.filter((sport) => sport.category === category);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.step}>Étape 1/4</Text>
        <Text style={styles.title}>Tes sports préférés</Text>
        <Text style={styles.subtitle}>
          Sélectionne les sports que tu pratiques ou que tu aimerais découvrir
        </Text>
      </View>

      {/* Sports Selection */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(SPORT_CATEGORIES).map(([category, label]) => {
          const categorySports = getSportsByCategory(category);
          if (categorySports.length === 0) return null;

          return (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryLabel}>{label}</Text>
              <View style={styles.sportsGrid}>
                {categorySports.map((sport) => {
                  const isSelected = selectedSports.includes(sport.id);
                  return (
                    <TouchableOpacity
                      key={sport.id}
                      style={[
                        styles.sportCard,
                        isSelected && styles.sportCardSelected,
                      ]}
                      onPress={() => toggleSport(sport.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.sportEmoji}>{sport.emoji}</Text>
                      <Text
                        style={[
                          styles.sportName,
                          isSelected && styles.sportNameSelected,
                        ]}
                        numberOfLines={2}
                      >
                        {sport.name}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkmark}>
                          <Text style={styles.checkmarkIcon}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.selectedCount}>
          {selectedSports.length} sport{selectedSports.length > 1 ? 's' : ''}{' '}
          sélectionné{selectedSports.length > 1 ? 's' : ''}
        </Text>
        <Button
          title="Continuer"
          onPress={handleContinue}
          fullWidth
          disabled={selectedSports.length === 0}
        />
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
  categorySection: {
    marginBottom: Spacing.xl,
  },
  categoryLabel: {
    ...TextPresets.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  sportCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sportCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  sportEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  sportName: {
    ...TextPresets.small,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  sportNameSelected: {
    ...TextPresets.bodyMedium,
    color: Colors.primary,
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
});
