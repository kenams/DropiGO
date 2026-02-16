export const colors = {
  background: '#F7F2EA',
  backgroundTop: '#FFF2DF',
  backgroundBottom: '#E4F1F2',
  backgroundOverlayTop: 'rgba(255, 242, 223, 0.7)',
  backgroundOverlayBottom: 'rgba(228, 241, 242, 0.62)',
  surface: 'transparent',
  surfaceWarm: 'transparent',
  text: '#0B1217',
  muted: '#34414A',
  primary: '#1E2F3E',
  primaryDark: '#0E1A24',
  accent: '#E23A2E',
  accentDark: '#B92A22',
  danger: '#C4372C',
  border: '#E5E0D7',
  success: '#0E6B43',
  chat: '#E06D61',
  sunGlow: 'rgba(245, 186, 74, 0.35)',
  seaGlow: 'rgba(14, 107, 67, 0.12)',
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
    textShadowColor: 'rgba(0, 0, 0, 0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1.5,
  },
  h2: {
    fontFamily: fonts.headingAlt,
    fontSize: 24,
    letterSpacing: 0.2,
    color: colors.text,
    textShadowColor: 'rgba(0, 0, 0, 0.16)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1.5,
  },
  h3: {
    fontFamily: fonts.headingAlt,
    fontSize: 18,
    letterSpacing: 0.2,
    color: colors.text,
    textShadowColor: 'rgba(0, 0, 0, 0.14)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1.5,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
    lineHeight: 21,
    textShadowColor: 'rgba(0, 0, 0, 0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1.2,
  },
  bodyBold: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
    lineHeight: 21,
    textShadowColor: 'rgba(0, 0, 0, 0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1.2,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.4,
    color: colors.muted,
    textTransform: 'uppercase' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.14)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1.2,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
    lineHeight: 17,
    textShadowColor: 'rgba(0, 0, 0, 0.14)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1.2,
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
