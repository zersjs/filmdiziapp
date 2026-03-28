export const colors = {
  bg: {
    primary: '#000000',
    secondary: '#070707',
    tertiary: '#0f0f0f',
    elevated: '#141414',
    overlay: 'rgba(0, 0, 0, 0.75)',
  },
  surface: {
    default: '#111111',
    hover: '#1a1a1a',
    active: '#222222',
    border: '#1e1e1e',
    borderHover: '#2a2a2a',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.45)',
    muted: 'rgba(255, 255, 255, 0.25)',
    inverse: '#000000',
  },
  accent: {
    primary: '#ffffff',
    secondary: '#a0a0a0',
    warning: '#f59e0b',
    danger: '#ef4444',
    success: '#22c55e',
    info: '#3b82f6',
    star: '#fbbf24',
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  '4xl': '64px',
};

export const radius = {
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '20px',
  full: '9999px',
};

export const typography = {
  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  size: {
    xs: '11px',
    sm: '13px',
    base: '15px',
    lg: '17px',
    xl: '20px',
    '2xl': '26px',
    '3xl': '34px',
    '4xl': '48px',
    '5xl': '64px',
  },
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  leading: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.7,
  },
  tracking: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.04em',
    wider: '0.1em',
    widest: '0.2em',
  },
};

export const shadows = {
  sm: '0 2px 8px rgba(0, 0, 0, 0.4)',
  md: '0 8px 24px rgba(0, 0, 0, 0.5)',
  lg: '0 16px 48px rgba(0, 0, 0, 0.6)',
  xl: '0 24px 64px rgba(0, 0, 0, 0.7)',
  glow: '0 0 20px rgba(255, 255, 255, 0.08)',
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const zIndex = {
  dropdown: 50,
  sticky: 100,
  overlay: 500,
  modal: 1000,
  toast: 2000,
  tooltip: 3000,
};
