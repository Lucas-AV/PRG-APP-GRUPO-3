export const Colors = {
  primary: '#171b22',
  onPrimary: '#ffffff',
  secondary: '#bc0000',
  surface: '#f8f9fa',
  surfaceContainerLow: '#f3f4f5',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerHigh: '#e8e9ea',
  surfaceContainerHighest: '#e1e3e4',
  onSurface: '#171b22',
  onSurfaceVariant: '#6b7280',
  error: '#ba1a1a',
  outline: 'rgba(23,27,34,0.15)',
} as const;

export const Typography = {
  displayLg: { fontSize: 56, lineHeight: 56, letterSpacing: -1.12 },
  headlineMd: { fontSize: 28, lineHeight: 31 },
  bodyLg: { fontSize: 16, lineHeight: 26 },
  titleMd: { fontSize: 18, lineHeight: 24 },
  labelMd: { fontSize: 12, lineHeight: 16 },
} as const;

export const Radius = {
  sm: 8,
  DEFAULT: 16,
  md: 20,
  lg: 32,
  full: 9999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;
