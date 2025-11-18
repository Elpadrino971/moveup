/**
 * MoovUp Now - Goals Screen
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, TextPresets } from '../../theme';

export default function GoalsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Objectifs</Text>
      <Text style={styles.subtitle}>
        Suivi de progression et coaching à venir...
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
