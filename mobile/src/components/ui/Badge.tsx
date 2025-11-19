/**
 * Badge Component - Badge moderne pour statuts, niveaux, etc.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

interface BadgeProps {
  label: string;
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'neutral'
    | 'premium'
    | 'neon';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  icon,
  style,
  textStyle,
}) => {
  const badgeStyle = [
    styles.badge,
    styles[`badge_${size}`],
    styles[`badge_${variant}`],
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`text_${size}`],
    styles[`text_${variant}`],
    textStyle,
  ];

  return (
    <View style={badgeStyle}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={textStyleCombined}>{label}</Text>
    </View>
  );
};

// Trust Level Badge
interface TrustBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  level,
  size = 'md',
  showLabel = true,
}) => {
  const getTrustColor = (level: number): string => {
    if (level === 0) return Colors.trustLevel.level0;
    if (level === 1) return Colors.trustLevel.level1;
    if (level === 2) return Colors.trustLevel.level2;
    if (level === 3) return Colors.trustLevel.level3;
    if (level === 4) return Colors.trustLevel.level4;
    return Colors.trustLevel.level5;
  };

  const getTrustLabel = (level: number): string => {
    if (level === 0) return 'Nouveau';
    if (level === 1) return 'Débutant';
    if (level === 2) return 'Régulier';
    if (level === 3) return 'Confirmé';
    if (level === 4) return 'Expert';
    return 'Élite';
  };

  return (
    <View
      style={[
        styles.trustBadge,
        styles[`badge_${size}`],
        { backgroundColor: getTrustColor(level) + '20' },
      ]}
    >
      <View style={[styles.trustDot, { backgroundColor: getTrustColor(level) }]} />
      <Text
        style={[
          styles.trustText,
          styles[`text_${size}`],
          { color: getTrustColor(level) },
        ]}
      >
        {showLabel ? getTrustLabel(level) : `Niveau ${level}`}
      </Text>
    </View>
  );
};

// Sport Badge
interface SportBadgeProps {
  sport: string;
  emoji: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SportBadge: React.FC<SportBadgeProps> = ({
  sport,
  emoji,
  size = 'md',
}) => {
  const sportColor = (Colors.sports as any)[sport] || Colors.primary;

  return (
    <View
      style={[
        styles.sportBadge,
        styles[`badge_${size}`],
        { backgroundColor: sportColor + '20' },
      ]}
    >
      <Text style={styles[`emoji_${size}`]}>{emoji}</Text>
      <Text style={[styles.sportText, styles[`text_${size}`], { color: sportColor }]}>
        {sport.charAt(0).toUpperCase() + sport.slice(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
  },
  badge_sm: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  badge_md: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  badge_lg: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  badge_primary: {
    backgroundColor: Colors.primary + '20',
  },
  badge_secondary: {
    backgroundColor: Colors.secondary + '20',
  },
  badge_success: {
    backgroundColor: Colors.success + '20',
  },
  badge_warning: {
    backgroundColor: Colors.warning + '20',
  },
  badge_error: {
    backgroundColor: Colors.error + '20',
  },
  badge_info: {
    backgroundColor: Colors.info + '20',
  },
  badge_neutral: {
    backgroundColor: Colors.gray[200],
  },
  badge_premium: {
    backgroundColor: Colors.accent + '30',
  },
  badge_neon: {
    backgroundColor: Colors.neonGreen + '20',
  },
  text: {
    fontWeight: '600',
  },
  text_sm: {
    ...Typography.small,
    fontSize: 11,
  },
  text_md: {
    ...Typography.small,
    fontSize: 13,
  },
  text_lg: {
    ...Typography.body,
    fontSize: 15,
  },
  text_primary: {
    color: Colors.primary,
  },
  text_secondary: {
    color: Colors.secondary,
  },
  text_success: {
    color: Colors.success,
  },
  text_warning: {
    color: Colors.warning,
  },
  text_error: {
    color: Colors.error,
  },
  text_info: {
    color: Colors.info,
  },
  text_neutral: {
    color: Colors.gray[700],
  },
  text_premium: {
    color: Colors.accent,
  },
  text_neon: {
    color: Colors.neonGreen,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  // Trust Badge
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
  },
  trustDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  trustText: {
    fontWeight: '700',
  },
  // Sport Badge
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
  },
  sportText: {
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  emoji_sm: {
    fontSize: 14,
  },
  emoji_md: {
    fontSize: 18,
  },
  emoji_lg: {
    fontSize: 24,
  },
});
