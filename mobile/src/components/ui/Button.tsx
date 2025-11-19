/**
 * Button Component - Bouton moderne et réutilisable
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: string[];
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  gradient,
}) => {
  const isDisabled = disabled || loading;

  const buttonStyle = [
    styles.button,
    styles[`button_${size}`],
    styles[`button_${variant}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`text_${size}`],
    styles[`text_${variant}`],
    isDisabled && styles.textDisabled,
    textStyle,
  ];

  const content = (
    <View style={styles.content}>
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white}
          style={styles.loader}
        />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <View style={styles.iconLeft}>{icon}</View>
      )}
      <Text style={textStyleCombined}>{title}</Text>
      {!loading && icon && iconPosition === 'right' && (
        <View style={styles.iconRight}>{icon}</View>
      )}
    </View>
  );

  if (variant === 'gradient') {
    const gradientColors = gradient || Colors.gradients.primary;
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
        style={[buttonStyle, { padding: 0, backgroundColor: 'transparent' }]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, styles[`button_${size}`]]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={buttonStyle}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  button_sm: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 36,
  },
  button_md: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
  },
  button_lg: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    minHeight: 56,
  },
  button_primary: {
    backgroundColor: Colors.primary,
    ...Shadows.md,
  },
  button_secondary: {
    backgroundColor: Colors.secondary,
    ...Shadows.md,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  button_gradient: {
    backgroundColor: 'transparent',
    ...Shadows.lg,
  },
  button_danger: {
    backgroundColor: Colors.error,
    ...Shadows.md,
  },
  gradient: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  text_sm: {
    ...Typography.small,
    fontSize: 14,
  },
  text_md: {
    ...Typography.body,
    fontSize: 16,
  },
  text_lg: {
    ...Typography.h4,
    fontSize: 18,
  },
  text_primary: {
    color: Colors.white,
  },
  text_secondary: {
    color: Colors.white,
  },
  text_outline: {
    color: Colors.primary,
  },
  text_ghost: {
    color: Colors.primary,
  },
  text_gradient: {
    color: Colors.white,
  },
  text_danger: {
    color: Colors.white,
  },
  textDisabled: {
    opacity: 0.7,
  },
  loader: {
    marginRight: Spacing.sm,
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
});
