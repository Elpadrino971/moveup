/**
 * MoovUp Now - Typography System
 */

export const Typography = {
  // Font families
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    // Will be replaced with Inter/Poppins when custom fonts are loaded
  },

  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Font weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Typography presets
export const TextPresets = {
  // Headings
  h1: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.sizes['4xl'] * Typography.lineHeights.tight,
  },
  h2: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.sizes['3xl'] * Typography.lineHeights.tight,
  },
  h3: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.sizes['2xl'] * Typography.lineHeights.tight,
  },
  h4: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.sizes.xl * Typography.lineHeights.normal,
  },

  // Body text
  body: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.sizes.base * Typography.lineHeights.normal,
  },
  bodyMedium: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    lineHeight: Typography.sizes.base * Typography.lineHeights.normal,
  },
  bodyBold: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.sizes.base * Typography.lineHeights.normal,
  },

  // Small text
  small: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.normal,
  },
  smallMedium: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.normal,
  },

  // Caption
  caption: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.sizes.xs * Typography.lineHeights.normal,
  },

  // Button text
  button: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.sizes.base * Typography.lineHeights.tight,
  },
};
