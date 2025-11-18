/**
 * MoovUp Now - Design System Colors
 *
 * Brand colors and theme palette
 */

export const Colors = {
  // Brand colors
  primary: '#0047FF',      // Bleu roi
  secondary: '#7B2FFF',    // Violet
  accent: '#FFD700',       // Or (badges, récompenses)

  // Neutrals
  black: '#1A1A1A',
  white: '#FFFFFF',
  gray: {
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Semantic colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Accent colors (touches fluo)
  neonGreen: '#39FF14',
  neonPink: '#FF10F0',

  // Functional
  background: '#FFFFFF',
  surface: '#F5F5F5',
  border: '#E5E5E5',
  disabled: '#D4D4D4',
  placeholder: '#A3A3A3',

  // Text
  text: {
    primary: '#1A1A1A',
    secondary: '#525252',
    tertiary: '#737373',
    inverse: '#FFFFFF',
    disabled: '#A3A3A3',
  },

  // Overlays
  overlay: {
    light: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
  },

  // Gradients
  gradients: {
    primary: ['#0047FF', '#7B2FFF'],
    accent: ['#FFD700', '#FFA500'],
    dark: ['#1A1A1A', '#404040'],
  },
};

export type ColorScheme = typeof Colors;
