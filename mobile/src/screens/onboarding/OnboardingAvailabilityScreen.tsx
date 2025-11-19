/**
 * MoovUp Now - Onboarding Step 3: Availability Selection
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

type DayOfWeek = {
  id: string;
  short: string;
  full: string;
};

type TimeSlot = {
  id: string;
  label: string;
  start: string;
  end: string;
};

const DAYS: DayOfWeek[] = [
  { id: 'monday', short: 'Lun', full: 'Lundi' },
  { id: 'tuesday', short: 'Mar', full: 'Mardi' },
  { id: 'wednesday', short: 'Mer', full: 'Mercredi' },
  { id: 'thursday', short: 'Jeu', full: 'Jeudi' },
  { id: 'friday', short: 'Ven', full: 'Vendredi' },
  { id: 'saturday', short: 'Sam', full: 'Samedi' },
  { id: 'sunday', short: 'Dim', full: 'Dimanche' },
];

const TIME_SLOTS: TimeSlot[] = [
  { id: 'early_morning', label: 'Tôt le matin', start: '06:00', end: '09:00' },
  { id: 'morning', label: 'Matin', start: '09:00', end: '12:00' },
  { id: 'lunch', label: 'Midi', start: '12:00', end: '14:00' },
  { id: 'afternoon', label: 'Après-midi', start: '14:00', end: '18:00' },
  { id: 'evening', label: 'Soirée', start: '18:00', end: '21:00' },
  { id: 'night', label: 'Nuit', start: '21:00', end: '23:00' },
];

export default function OnboardingAvailabilityScreen({ navigation, route }: any) {
  const { selectedSports, selectedGoals } = route.params || {};
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);

  const toggleDay = (dayId: string) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayId)) {
        return prev.filter((id) => id !== dayId);
      } else {
        return [...prev, dayId];
      }
    });
  };

  const toggleTimeSlot = (slotId: string) => {
    setSelectedTimeSlots((prev) => {
      if (prev.includes(slotId)) {
        return prev.filter((id) => id !== slotId);
      } else {
        return [...prev, slotId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedDays.length === 0 || selectedTimeSlots.length === 0) {
      Alert.alert(
        'Attention',
        'Sélectionne au moins un jour et un créneau horaire'
      );
      return;
    }
    navigation.navigate('OnboardingCharter', {
      selectedSports,
      selectedGoals,
      availability: {
        days: selectedDays,
        timeSlots: selectedTimeSlots,
      },
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.step}>Étape 3/4</Text>
        <Text style={styles.title}>Tes disponibilités</Text>
        <Text style={styles.subtitle}>
          Quand es-tu disponible pour faire du sport ?
        </Text>
      </View>

      {/* Availability Selection */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Days Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jours de la semaine</Text>
          <View style={styles.daysGrid}>
            {DAYS.map((day) => {
              const isSelected = selectedDays.includes(day.id);
              return (
                <TouchableOpacity
                  key={day.id}
                  style={[
                    styles.dayCard,
                    isSelected && styles.dayCardSelected,
                  ]}
                  onPress={() => toggleDay(day.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.dayTextSelected,
                    ]}
                  >
                    {day.short}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Time Slots Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Créneaux horaires</Text>
          <View style={styles.timeSlotsGrid}>
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedTimeSlots.includes(slot.id);
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.timeSlotCard,
                    isSelected && styles.timeSlotCardSelected,
                  ]}
                  onPress={() => toggleTimeSlot(slot.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.timeSlotLabel,
                      isSelected && styles.timeSlotLabelSelected,
                    ]}
                  >
                    {slot.label}
                  </Text>
                  <Text style={styles.timeSlotTime}>
                    {slot.start} - {slot.end}
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

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Tu pourras modifier tes disponibilités à tout moment dans ton
            profil
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
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
            disabled={selectedDays.length === 0 || selectedTimeSlots.length === 0}
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
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  dayCard: {
    width: '13%',
    aspectRatio: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  dayText: {
    ...TextPresets.bodyMedium,
    color: Colors.text.primary,
  },
  dayTextSelected: {
    color: Colors.white,
  },
  timeSlotsGrid: {
    gap: Spacing.md,
  },
  timeSlotCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: Spacing.lg,
    position: 'relative',
  },
  timeSlotCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  timeSlotLabel: {
    ...TextPresets.bodyMedium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  timeSlotLabelSelected: {
    color: Colors.primary,
  },
  timeSlotTime: {
    ...TextPresets.small,
    color: Colors.text.secondary,
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
  infoBox: {
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  infoText: {
    ...TextPresets.small,
    color: Colors.primary,
    textAlign: 'center',
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
