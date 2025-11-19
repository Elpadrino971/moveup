/**
 * MoovUp Now - Trust Badge Component
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, TextPresets, BorderRadius } from '../../theme';
import { TrustLevel } from '../../types';
import { getTrustLevelName, getTrustLevelBadge, getTrustLevelColor } from '../../utils/trustLevel';

type TrustBadgeProps = {
  level: TrustLevel;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  style?: ViewStyle;
};

export default function TrustBadge({
  level,
  size = 'medium',
  showLabel = true,
  style,
}: TrustBadgeProps) {
  const badge = getTrustLevelBadge(level);
  const name = getTrustLevelName(level);
  const color = getTrustLevelColor(level);

  const sizeStyles = {
    small: {
      container: styles.smallContainer,
      emoji: styles.smallEmoji,
      text: styles.smallText,
    },
    medium: {
      container: styles.mediumContainer,
      emoji: styles.mediumEmoji,
      text: styles.mediumText,
    },
    large: {
      container: styles.largeContainer,
      emoji: styles.largeEmoji,
      text: styles.largeText,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.container, currentSize.container, { backgroundColor: color + '20' }, style]}>
      <Text style={[styles.emoji, currentSize.emoji]}>{badge}</Text>
      {showLabel && (
        <Text style={[styles.text, currentSize.text, { color }]}>
          {name}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  emoji: {
    marginRight: Spacing.xs,
  },
  text: {
    fontWeight: '600',
  },

  // Small size
  smallContainer: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  smallEmoji: {
    fontSize: 14,
  },
  smallText: {
    fontSize: 12,
  },

  // Medium size
  mediumContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  mediumEmoji: {
    fontSize: 18,
  },
  mediumText: {
    fontSize: 14,
  },

  // Large size
  largeContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  largeEmoji: {
    fontSize: 24,
  },
  largeText: {
    fontSize: 16,
  },
});
