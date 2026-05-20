// ─── Design Tokens SADESA Mobile ─────────────────────────────────────────────

export const COLORS = {
  // Brand
  primary:        '#0050A7',
  primaryDark:    '#003D82',
  primaryLight:   '#E8F0FB',
  primaryFaded:   'rgba(0, 80, 167, 0.10)',

  // Background
  background:     '#F5F5F5',
  card:           '#FFFFFF',
  inputBg:        '#EBEBEB',

  // Text
  text:           '#1A1A1A',
  textSecondary:  '#555555',
  textMuted:      '#9E9E9E',
  textPlaceholder:'#ABABAB',

  // Border & Divider
  border:         '#E2E2E2',
  divider:        '#F0F0F0',

  // Status
  success:        '#28A745',
  successLight:   '#E8F5ED',
  warning:        '#F59E0B',
  warningLight:   '#FEF3C7',
  danger:         '#EF4444',
  dangerLight:    '#FEE2E2',
  info:           '#3B82F6',
  infoLight:      '#EFF6FF',

  // Misc
  white:          '#FFFFFF',
  black:          '#000000',
  overlay:        'rgba(0,0,0,0.45)',
} as const;

export const RADIUS = {
  xs:   6,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  full: 999,
} as const;

export const SPACING = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  xxxl: 32,
} as const;

export const FONT = {
  xs:      11,
  sm:      12,
  base:    13,
  md:      14,
  lg:      15,
  xl:      16,
  xxl:     18,
  xxxl:    22,
  display: 28,
} as const;

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
} as const;
