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

  // Gradients (modernes et vibrants)
  gradients: {
    primary: ['#0047FF', '#7B2FFF'],
    secondary: ['#7B2FFF', '#FF10F0'],
    accent: ['#FFD700', '#FFA500'],
    success: ['#22C55E', '#10B981'],
    danger: ['#EF4444', '#DC2626'],
    ocean: ['#0891B2', '#0EA5E9'],
    sunset: ['#F59E0B', '#F97316'],
    dark: ['#1A1A1A', '#404040'],
    neon: ['#39FF14', '#7B2FFF'],
    premium: ['#FFD700', '#7B2FFF'],
  },

  // Sport-specific colors
  sports: {
    running: '#0EA5E9',      // Bleu ciel
    football: '#22C55E',     // Vert
    basketball: '#F97316',   // Orange
    tennis: '#EAB308',       // Jaune
    yoga: '#A855F7',         // Violet
    cycling: '#06B6D4',      // Cyan
    swimming: '#3B82F6',     // Bleu
    fitness: '#EF4444',      // Rouge
  },

  // Session status colors
  sessionStatus: {
    pending: '#F59E0B',      // Orange
    matched: '#0047FF',      // Bleu
    confirmed: '#22C55E',    // Vert
    inProgress: '#7B2FFF',   // Violet
    completed: '#10B981',    // Vert foncé
    cancelled: '#EF4444',    // Rouge
  },

  // Trust Level colors
  trustLevel: {
    level0: '#EF4444',       // Rouge (nouveau)
    level1: '#F59E0B',       // Orange
    level2: '#EAB308',       // Jaune
    level3: '#22C55E',       // Vert
    level4: '#0EA5E9',       // Bleu
    level5: '#7B2FFF',       // Violet (max)
  },
};

export type ColorScheme = typeof Colors;
