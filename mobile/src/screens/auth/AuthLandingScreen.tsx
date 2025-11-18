/**
 * MoovUp Now - Auth Landing Screen
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, TextPresets } from '../../theme';
import { SCREEN_NAMES } from '../../constants';

export default function AuthLandingScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>MoovUp Now</Text>
        <Text style={styles.slogan}>Bouge maintenant. Pas demain.</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate(SCREEN_NAMES.AUTH_SIGN_UP)}
          >
            <Text style={styles.primaryButtonText}>Créer un compte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate(SCREEN_NAMES.AUTH_SIGN_IN)}
          >
            <Text style={styles.secondaryButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  logo: {
    ...TextPresets.h1,
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  slogan: {
    ...TextPresets.body,
    color: Colors.white,
    marginBottom: Spacing['4xl'],
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...TextPresets.button,
    color: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.white,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...TextPresets.button,
    color: Colors.white,
  },
});
