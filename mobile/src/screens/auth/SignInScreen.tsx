/**
 * MoovUp Now - Sign In Screen
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, TextPresets } from '../../theme';

export default function SignInScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Se connecter</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
  },
});
