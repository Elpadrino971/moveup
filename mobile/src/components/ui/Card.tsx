/**
 * Card Component - Carte moderne et réutilisable
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: keyof typeof Spacing;
  margin?: keyof typeof Spacing;
  onPress?: () => void;
  style?: ViewStyle;
  gradient?: string[];
  shadow?: keyof typeof Shadows;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'lg',
  margin,
  onPress,
  style,
  gradient,
  shadow = 'md',
}) => {
  const cardStyle = [
    styles.card,
    styles[`card_${variant}`],
    padding && { padding: Spacing[padding] },
    margin && { margin: Spacing[margin] },
    variant === 'elevated' && Shadows[shadow],
    style,
  ];

  if (variant === 'gradient') {
    const gradientColors = gradient || Colors.gradients.primary;
    const CardContainer = onPress ? TouchableOpacity : View;

    return (
      <CardContainer
        onPress={onPress}
        activeOpacity={onPress ? 0.8 : 1}
        style={[cardStyle, { padding: 0, backgroundColor: 'transparent' }, Shadows[shadow]]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradientCard,
            padding && { padding: Spacing[padding] },
          ]}
        >
          {children}
        </LinearGradient>
      </CardContainer>
    );
  }

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={cardStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  card_default: {
    backgroundColor: Colors.white,
  },
  card_elevated: {
    backgroundColor: Colors.white,
  },
  card_outlined: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  card_gradient: {
    backgroundColor: 'transparent',
  },
  gradientCard: {
    borderRadius: BorderRadius.lg,
    width: '100%',
    height: '100%',
  },
});
