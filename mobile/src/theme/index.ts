/**
 * MoovUp Now - Theme System
 *
 * Central export for all theme tokens
 */

export { Colors } from './colors';
export { Typography, TextPresets } from './typography';
export { Spacing, BorderRadius, Shadows } from './spacing';

// Theme object for easy import
export const Theme = {
  colors: require('./colors').Colors,
  typography: require('./typography').Typography,
  textPresets: require('./typography').TextPresets,
  spacing: require('./spacing').Spacing,
  borderRadius: require('./spacing').BorderRadius,
  shadows: require('./spacing').Shadows,
};
