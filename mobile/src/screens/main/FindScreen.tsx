/**
 * MoovUp Now - Find Screen (Map & Search)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, TextPresets } from '../../theme';

export default function FindScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carte</Text>
      <Text style={styles.subtitle}>
        Géolocalisation et recherche de partenaires à venir...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  title: {
    ...TextPresets.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...TextPresets.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
