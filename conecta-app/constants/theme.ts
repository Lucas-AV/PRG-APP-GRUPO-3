export const Colors = {
  // ── Tokens de marca ──────────────────────────────────────────────────
  primary: '#0054d6',
  brand: '#0054d6',
  brandDeep: '#003fa3',
  primaryDim: '#004abd',
  primaryFixed: '#dae1ff',
  primaryFixedDim: '#c7d3ff',
  primaryContainer: '#dae1ff',
  onPrimary: '#f8f7ff',
  onPrimaryFixed: '#003894',
  onPrimaryContainer: '#0049bb',
  inversePrimary: '#5e8bff',

  // ── Tokens premium (novos) ────────────────────────────────────────────
  ink: '#0f172a',
  inkMuted: '#64748b',
  card: '#ffffff',
  border: 'rgba(15,23,42,0.08)',

  // ── Secundário / terciário (M3) ───────────────────────────────────────
  secondary: '#5f5f62',
  secondaryDim: '#535356',
  secondaryContainer: '#e4e2e6',
  onSecondary: '#faf8fc',
  onSecondaryContainer: '#515155',

  tertiary: '#615b77',
  tertiaryDim: '#554f6b',
  tertiaryContainer: '#e1d8fa',
  onTertiary: '#fcf7ff',
  onTertiaryContainer: '#504b66',

  // ── Erro ──────────────────────────────────────────────────────────────
  error: '#9f403d',
  errorContainer: '#fe8983',
  onError: '#fff7f6',
  onErrorContainer: '#752121',

  // ── Superfícies ───────────────────────────────────────────────────────
  surface: '#f8fafc',
  surfaceBright: '#f8fafc',
  surfaceDim: '#d4dbdd',
  surfaceVariant: '#dde4e5',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f2f4f4',
  surfaceContainer: '#ebeeef',
  surfaceContainerHigh: '#e4e9ea',
  surfaceContainerHighest: '#dde4e5',

  // ── On-surface ────────────────────────────────────────────────────────
  onSurface: '#0f172a',
  onSurfaceVariant: '#64748b',
  inverseSurface: '#0c0f0f',

  outline: '#757c7d',
  outlineVariant: '#adb3b4',

  background: '#f8fafc',
  onBackground: '#0f172a',
} as const;

export const FontFamily = {
  headlineExtraBold: 'Manrope-ExtraBold',
  headlineBold: 'Manrope-Bold',
  headlineSemiBold: 'Manrope-SemiBold',
  bodyRegular: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
} as const;

export const Typography = {
  display: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 32,
    letterSpacing: -1.2,
    lineHeight: 38,
  },
  headline: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 22,
    letterSpacing: -0.6,
    lineHeight: 28,
  },
  title: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: 17,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  body: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    letterSpacing: 0,
    lineHeight: 20,
  },
  bodyMedium: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    letterSpacing: 0,
    lineHeight: 20,
  },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.1,
    lineHeight: 16,
  },
  caption: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    letterSpacing: 0.2,
    lineHeight: 15,
  },
  overline: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.4,
    lineHeight: 14,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  screen: 20,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const GradientColors: [string, string] = ['#0054d6', '#003fa3'];
