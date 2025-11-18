/**
 * MoovUp Now - Home Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Spacing, TextPresets } from '../../theme';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour 👋</Text>
        <Text style={styles.slogan}>Bouge maintenant. Pas demain.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Prochaine séance</Text>
        <Text style={styles.cardSubtitle}>Aucune séance planifiée</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ton objectif du jour</Text>
        <Text style={styles.cardSubtitle}>30 minutes d'activité</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.xl,
    backgroundColor: Colors.white,
  },
  greeting: {
    ...TextPresets.h2,
    color: Colors.text.primary,
  },
  slogan: {
    ...TextPresets.body,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.white,
    margin: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 12,
  },
  cardTitle: {
    ...TextPresets.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  cardSubtitle: {
    ...TextPresets.body,
    color: Colors.text.secondary,
  },
});
