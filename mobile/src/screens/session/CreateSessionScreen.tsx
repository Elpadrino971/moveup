/**
 * CreateSessionScreen - Créer une nouvelle session sportive
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
  Platform,
} from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../theme';
import { createSession, canCreateSession } from '../services/sessions';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateSessionScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [canCreate, setCanCreate] = useState(false);

  // Form state
  const [sport, setSport] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sessionType, setSessionType] = useState<'one-on-one' | 'group'>('one-on-one');
  const [maxParticipants, setMaxParticipants] = useState(2);
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [duration, setDuration] = useState(60);
  const [location, setLocation] = useState('');
  const [locationLat, setLocationLat] = useState(48.8566); // Paris center demo
  const [locationLng, setLocationLng] = useState(2.3522);
  const [genderPreference, setGenderPreference] = useState<'any' | 'same' | 'opposite'>('any');

  // Sports disponibles
  const sports = [
    { id: 'running', name: 'Running', emoji: '🏃' },
    { id: 'football', name: 'Football', emoji: '⚽' },
    { id: 'basketball', name: 'Basketball', emoji: '🏀' },
    { id: 'tennis', name: 'Tennis', emoji: '🎾' },
    { id: 'yoga', name: 'Yoga', emoji: '🧘' },
    { id: 'cycling', name: 'Vélo', emoji: '🚴' },
    { id: 'swimming', name: 'Natation', emoji: '🏊' },
    { id: 'fitness', name: 'Fitness', emoji: '💪' },
  ];

  useEffect(() => {
    checkCanCreate();
  }, []);

  async function checkCanCreate() {
    const result = await canCreateSession();
    setCanCreate(result);

    if (!result) {
      Alert.alert(
        '⏸ Limite atteinte',
        'Tu as atteint ta limite de sessions actives.\n\nAnnule ou complète une session existante, ou passe à Premium pour créer des sessions illimitées !',
        [
          { text: 'Retour', onPress: () => navigation.goBack() },
          { text: 'Voir Premium', onPress: () => {} },
        ]
      );
    }
  }

  async function handleCreateSession() {
    // Validation
    if (!sport) {
      Alert.alert('Sport requis', 'Sélectionne un sport.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Titre requis', 'Donne un titre à ta session.');
      return;
    }

    if (!location.trim()) {
      Alert.alert('Lieu requis', 'Indique où aura lieu la session.');
      return;
    }

    setLoading(true);

    try {
      const session = await createSession({
        sport_id: sport,
        title: title.trim(),
        description: description.trim() || undefined,
        session_type: sessionType,
        max_participants: sessionType === 'one-on-one' ? 2 : maxParticipants,
        scheduled_at: scheduledDate.toISOString(),
        duration_minutes: duration,
        location: location.trim(),
        location_lat: locationLat,
        location_lng: locationLng,
        gender_preference: genderPreference,
      });

      if (session) {
        Alert.alert('✅ Session créée !', 'Ta session est maintenant visible par la communauté.', [
          {
            text: 'Voir la session',
            onPress: () => {
              navigation.replace('SessionDetail', { sessionId: session.id });
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      Alert.alert('Erreur', 'Impossible de créer la session. Réessaie.');
    } finally {
      setLoading(false);
    }
  }

  function handleDateChange(event: any, selectedDate?: Date) {
    setShowDatePicker(false);
    if (selectedDate) {
      setScheduledDate(selectedDate);
    }
  }

  function handleTimeChange(event: any, selectedTime?: Date) {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(scheduledDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setScheduledDate(newDate);
    }
  }

  if (!canCreate) {
    return null; // Alert already shown
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Sport Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sport *</Text>
          <View style={styles.sportGrid}>
            {sports.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.sportButton, sport === s.id && styles.sportButtonActive]}
                onPress={() => setSport(s.id)}
              >
                <Text style={styles.sportEmoji}>{s.emoji}</Text>
                <Text
                  style={[styles.sportName, sport === s.id && styles.sportNameActive]}
                >
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Titre *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Session running matinale"
            placeholderTextColor={Colors.gray400}
            maxLength={100}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Ex: Allure tranquille, 8km environ"
            placeholderTextColor={Colors.gray400}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        {/* Session Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de session *</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                sessionType === 'one-on-one' && styles.typeButtonActive,
              ]}
              onPress={() => {
                setSessionType('one-on-one');
                setMaxParticipants(2);
              }}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  sessionType === 'one-on-one' && styles.typeButtonTextActive,
                ]}
              >
                1-on-1
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, sessionType === 'group' && styles.typeButtonActive]}
              onPress={() => {
                setSessionType('group');
                setMaxParticipants(5);
              }}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  sessionType === 'group' && styles.typeButtonTextActive,
                ]}
              >
                Groupe
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Max Participants (if group) */}
        {sessionType === 'group' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nombre max de participants</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setMaxParticipants(Math.max(3, maxParticipants - 1))}
              >
                <Text style={styles.counterButtonText}>−</Text>
              </TouchableOpacity>

              <Text style={styles.counterValue}>{maxParticipants}</Text>

              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setMaxParticipants(Math.min(20, maxParticipants + 1))}
              >
                <Text style={styles.counterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date et heure *</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                📅 {scheduledDate.toLocaleDateString('fr-FR')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                🕐 {scheduledDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={scheduledDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={scheduledDate}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Durée (minutes)</Text>
          <View style={styles.durationGrid}>
            {[30, 45, 60, 90, 120].map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.durationButton, duration === d && styles.durationButtonActive]}
                onPress={() => setDuration(d)}
              >
                <Text
                  style={[
                    styles.durationText,
                    duration === d && styles.durationTextActive,
                  ]}
                >
                  {d} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lieu *</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Ex: Parc des Buttes Chaumont"
            placeholderTextColor={Colors.gray400}
            maxLength={200}
          />
          <Text style={styles.helperText}>
            📍 Localisation approximative partagée avec les participants
          </Text>
        </View>

        {/* Gender Preference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférence de genre</Text>
          <View style={styles.genderGrid}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                genderPreference === 'any' && styles.genderButtonActive,
              ]}
              onPress={() => setGenderPreference('any')}
            >
              <Text
                style={[
                  styles.genderText,
                  genderPreference === 'any' && styles.genderTextActive,
                ]}
              >
                Peu importe
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                genderPreference === 'same' && styles.genderButtonActive,
              ]}
              onPress={() => setGenderPreference('same')}
            >
              <Text
                style={[
                  styles.genderText,
                  genderPreference === 'same' && styles.genderTextActive,
                ]}
              >
                Même genre
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                genderPreference === 'opposite' && styles.genderButtonActive,
              ]}
              onPress={() => setGenderPreference('opposite')}
            >
              <Text
                style={[
                  styles.genderText,
                  genderPreference === 'opposite' && styles.genderTextActive,
                ]}
              >
                Genre opposé
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>
            ⚠️ Genre opposé nécessite Trust Level 3+ (sécurité)
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleCreateSession}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Création...' : '✓ Créer la session'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 12,
    ...Shadows.small,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.gray900,
    marginBottom: Spacing.md,
  },
  sportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sportButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: Colors.gray50,
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sportButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  sportEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  sportName: {
    ...Typography.small,
    color: Colors.gray700,
  },
  sportNameActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  input: {
    ...Typography.body,
    backgroundColor: Colors.gray50,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray200,
    color: Colors.gray900,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeButton: {
    flex: 1,
    backgroundColor: Colors.gray100,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  typeButtonText: {
    ...Typography.body,
    color: Colors.gray700,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: Colors.primary,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  counterButton: {
    width: 44,
    height: 44,
    backgroundColor: Colors.gray100,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    fontSize: 24,
    color: Colors.gray700,
  },
  counterValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.gray900,
    minWidth: 40,
    textAlign: 'center',
  },
  dateButton: {
    flex: 1,
    backgroundColor: Colors.gray50,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  dateButtonText: {
    ...Typography.body,
    color: Colors.gray900,
  },
  durationGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  durationButton: {
    flex: 1,
    backgroundColor: Colors.gray100,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  durationButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  durationText: {
    ...Typography.small,
    color: Colors.gray700,
  },
  durationTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  helperText: {
    ...Typography.small,
    color: Colors.gray500,
    marginTop: Spacing.xs,
  },
  genderGrid: {
    gap: Spacing.sm,
  },
  genderButton: {
    backgroundColor: Colors.gray100,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  genderText: {
    ...Typography.body,
    color: Colors.gray700,
  },
  genderTextActive: {
    color: Colors.primary,
    fontWeight: '600',
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
});
