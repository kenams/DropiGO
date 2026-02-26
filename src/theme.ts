export const colors = {
  background: '#F4F8FB',
  backgroundTop: '#FCE7D2',
  backgroundBottom: '#D8EEF9',
  backgroundOverlayTop: 'rgba(252, 231, 210, 0.72)',
  backgroundOverlayBottom: 'rgba(216, 238, 249, 0.7)',
  surface: 'rgba(255, 255, 255, 0.55)',
  surfaceWarm: 'rgba(255, 255, 255, 0.45)',
  text: '#0B1B2B',
  muted: '#3C4A56',
  primary: '#0B3D68',
  primaryDark: '#072A47',
  accent: '#F07C1A',
  accentDark: '#C75E0B',
  danger: '#C4372C',
  border: 'rgba(11, 61, 104, 0.25)',
  success: '#0E6B43',
  chat: '#E06D61',
  sunGlow: 'rgba(240, 124, 26, 0.25)',
  seaGlow: 'rgba(11, 61, 104, 0.18)',
};

export const fonts = {
  heading: 'BodoniModa_700Bold',
  headingAlt: 'BodoniModa_600SemiBold',
  body: 'Sora_400Regular',
  bodyBold: 'Sora_600SemiBold',
  bodyHeavy: 'Sora_700Bold',
};

export const textStyles = {
  h1: {
    fontFamily: fonts.heading,
    fontSize: 30,
    letterSpacing: 0.3,
    color: colors.text,
    textShadowColor: 'rgba(0, 0, 0, 0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1.2,
  },
  h2: {
    fontFamily: fonts.headingAlt,
    fontSize: 25,
    letterSpacing: 0.2,
    color: colors.text,
    textShadowColor: 'rgba(0, 0, 0, 0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1.2,
  },
  h3: {
    fontFamily: fonts.headingAlt,
    fontSize: 19,
    letterSpacing: 0.2,
    color: colors.text,
    textShadowColor: 'rgba(0, 0, 0, 0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1.2,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.14)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  bodyBold: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.14)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.6,
    color: colors.muted,
    textTransform: 'uppercase' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 19,
    textShadowColor: 'rgba(0, 0, 0, 0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
};

export const shadow = {
  card: {
    shadowColor: '#0E1A24',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
};
