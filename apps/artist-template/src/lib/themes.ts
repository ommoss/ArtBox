// Theme system for the artist site.
// One presentation layer, multiple visual identities. The deployment chooses
// a preset via the NEXT_PUBLIC_THEME env var; per-deployment overrides
// (artist name, tagline, brand colors) come from other NEXT_PUBLIC_* vars.

export type HeaderLayout = 'split' | 'centered'

export type Theme = {
  preset: string
  artistName: string
  tagline: string

  // Color tokens
  colorPrimary: string
  colorSecondary: string
  colorBg: string
  colorSurface: string
  colorAccent: string
  colorBorder: string

  // Typography
  fontHeading: string
  fontBody: string
  headingWeight: number
  headingTracking: string
  baseFontSize: string

  // Spacing
  maxWidth: string
  pagePadding: string

  // Image treatment
  imageRadius: string
  imageShadow: string

  // Header layout
  headerLayout: HeaderLayout
}

type ThemePreset = Omit<Theme, 'artistName' | 'tagline'>

const SANS_STACK =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
const SERIF_STACK =
  'Georgia, "Iowan Old Style", "Source Serif Pro", "Apple Garamond", serif'
const DISPLAY_SERIF =
  '"Playfair Display", Didot, "Bodoni MT", Garamond, serif'

const minimal: ThemePreset = {
  preset: 'minimal',
  colorPrimary: '#1a1a1a',
  colorSecondary: 'rgba(0,0,0,0.6)',
  colorBg: '#fafaf6',
  colorSurface: '#ffffff',
  colorAccent: '#a86232',
  colorBorder: 'rgba(0,0,0,0.08)',
  fontHeading: SANS_STACK,
  fontBody: SANS_STACK,
  headingWeight: 500,
  headingTracking: '-0.01em',
  baseFontSize: '16px',
  maxWidth: '1280px',
  pagePadding: '32px',
  imageRadius: '4px',
  imageShadow: '0 8px 24px rgba(0,0,0,0.06)',
  headerLayout: 'split',
}

const editorial: ThemePreset = {
  preset: 'editorial',
  colorPrimary: '#2a2723',
  colorSecondary: 'rgba(42,39,35,0.65)',
  colorBg: '#f8f5ef',
  colorSurface: '#ffffff',
  colorAccent: '#7a5b3a',
  colorBorder: 'rgba(42,39,35,0.1)',
  fontHeading: DISPLAY_SERIF,
  fontBody: SERIF_STACK,
  headingWeight: 400,
  headingTracking: '-0.005em',
  baseFontSize: '17px',
  maxWidth: '1180px',
  pagePadding: '48px',
  imageRadius: '0px',
  imageShadow: 'none',
  headerLayout: 'centered',
}

const atmospheric: ThemePreset = {
  preset: 'atmospheric',
  colorPrimary: '#ebe8e3',
  colorSecondary: 'rgba(235,232,227,0.55)',
  colorBg: '#0d0d0e',
  colorSurface: '#18181a',
  colorAccent: '#c89657',
  colorBorder: 'rgba(255,255,255,0.08)',
  fontHeading: SANS_STACK,
  fontBody: SANS_STACK,
  headingWeight: 400,
  headingTracking: '0.02em',
  baseFontSize: '16px',
  maxWidth: '1280px',
  pagePadding: '32px',
  imageRadius: '0px',
  imageShadow: '0 24px 48px rgba(0,0,0,0.55)',
  headerLayout: 'split',
}

const warm: ThemePreset = {
  preset: 'warm',
  colorPrimary: '#3d2f23',
  colorSecondary: 'rgba(61,47,35,0.6)',
  colorBg: '#f5ebdc',
  colorSurface: '#fbf4e9',
  colorAccent: '#a04930',
  colorBorder: 'rgba(61,47,35,0.12)',
  fontHeading: SERIF_STACK,
  fontBody: SANS_STACK,
  headingWeight: 500,
  headingTracking: '-0.005em',
  baseFontSize: '16px',
  maxWidth: '1180px',
  pagePadding: '40px',
  imageRadius: '6px',
  imageShadow: '0 12px 28px rgba(61,47,35,0.14)',
  headerLayout: 'centered',
}

export const themes: Record<string, ThemePreset> = {
  minimal,
  editorial,
  atmospheric,
  warm,
}

// Public demo URLs for cross-linking the theme switcher bar at the bottom of
// every page. Update if you rename a Vercel project.
export type ThemeLink = { preset: string; label: string; url: string; tagline: string }

export const themeLinks: ThemeLink[] = [
  {
    preset: 'minimal',
    label: 'Minimal',
    tagline: 'Clean & contemporary',
    url: 'https://art-box-artist-template.vercel.app',
  },
  {
    preset: 'editorial',
    label: 'Editorial',
    tagline: 'Magazine, generous',
    url: 'https://art-box-artist-demo-editorial.vercel.app',
  },
  {
    preset: 'atmospheric',
    label: 'Atmospheric',
    tagline: 'Dark & cinematic',
    url: 'https://art-box-artist-demo-atmospheric.vercel.app',
  },
  {
    preset: 'warm',
    label: 'Warm',
    tagline: 'Vintage & curated',
    url: 'https://art-box-artist-demo-warm.vercel.app',
  },
]

export function getTheme(): Theme {
  const presetName = (process.env.NEXT_PUBLIC_THEME || 'minimal').toLowerCase()
  const preset = themes[presetName] ?? themes.minimal
  return {
    ...preset,
    // Default placeholder uses a historical figure so the demo content is
    // unambiguously not a real living artist's site.
    artistName: process.env.NEXT_PUBLIC_ARTIST_NAME || 'Vincent van Gogh',
    tagline:
      process.env.NEXT_PUBLIC_ARTIST_TAGLINE || 'Studies in light and colour',
  }
}

// Convert the theme into a record of CSS custom properties, for spreading
// onto a wrapping element's style prop.
export function themeCssVars(theme: Theme): Record<string, string | number> {
  return {
    '--color-primary': theme.colorPrimary,
    '--color-secondary': theme.colorSecondary,
    '--color-bg': theme.colorBg,
    '--color-surface': theme.colorSurface,
    '--color-accent': theme.colorAccent,
    '--color-border': theme.colorBorder,
    '--font-heading': theme.fontHeading,
    '--font-body': theme.fontBody,
    '--weight-heading': theme.headingWeight,
    '--tracking-heading': theme.headingTracking,
    '--base-font-size': theme.baseFontSize,
    '--max-width': theme.maxWidth,
    '--page-padding': theme.pagePadding,
    '--image-radius': theme.imageRadius,
    '--image-shadow': theme.imageShadow,
  }
}
