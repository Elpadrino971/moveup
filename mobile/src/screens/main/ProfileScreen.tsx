/**
 * MoovUp Now - Profile Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Spacing, TextPresets } from '../../theme';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.username}>@utilisateur</Text>
        <Text style={styles.bio}>Profil à compléter</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Séances</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>1</Text>
          <Text style={styles.statLabel}>Niveau</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>QR Code</Text>
        <View style={styles.qrPlaceholder}>
          <Text>QR Code ici</Text>
        </View>
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
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 48,
  },
  username: {
    ...TextPresets.h3,
    color: Colors.text.primary,
  },
  bio: {
    ...TextPresets.body,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginTop: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...TextPresets.h3,
    color: Colors.primary,
  },
  statLabel: {
    ...TextPresets.small,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  section: {
    backgroundColor: Colors.white,
    marginTop: Spacing.md,
    padding: Spacing.lg,
  },
  sectionTitle: {
    ...TextPresets.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  qrPlaceholder: {
    height: 200,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
});
