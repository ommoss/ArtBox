// Theme system for the artist site.
// One presentation layer, multiple visual identities. The deployment chooses
// a preset via the NEXT_PUBLIC_THEME env var; per-deployment overrides
// (artist name, tagline, brand colors) come from other NEXT_PUBLIC_* vars.

export type HeaderLayout = 'split' | 'centered' | 'sidebar'
export type HomeLayout = 'centered' | 'hero' | 'carousel'
export type GalleryGridMode =
  | 'uniform'
  | 'magazine'
  | 'album'
  | 'cinematic'
  | 'solo'
export type ArtworkLayout = 'stacked' | 'asymmetric'

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

  // Layout variants — drive structural (not just stylistic) differences
  // between presets. Sailing uses a full-bleed hero carousel + cinematic
  // wide-aspect grid; Lifestyle uses hero + magazine + asymmetric; Travel uses
  // sidebar + album. Fine Art keeps the uniform gallery-wall layout.
  headerLayout: HeaderLayout
  homeLayout: HomeLayout
  galleryGridMode: GalleryGridMode
  artworkLayout: ArtworkLayout
  // Optional background overlay (e.g. paper texture for the warm preset).
  bgTexture?: string
}

type ThemePreset = Omit<Theme, 'artistName' | 'tagline'>

const SANS_STACK =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
const SERIF_STACK =
  'Georgia, "Iowan Old Style", "Source Serif Pro", "Apple Garamond", serif'
const DISPLAY_SERIF =
  '"Playfair Display", Didot, "Bodoni MT", Garamond, serif'

// Default preset, tuned for sailing / marine / regatta photography: wide-aspect
// action and seascape work shown full-bleed and immersive. Cool navy ink on a
// cool near-white, with a signal-orange accent (regatta buoys / spinnakers) for
// CTAs. Colour is the cheapest lever here — retune freely.
const sailing: ThemePreset = {
  preset: 'sailing',
  colorPrimary: '#13212e',
  colorSecondary: 'rgba(19,33,46,0.6)',
  colorBg: '#f4f7f8',
  colorSurface: '#ffffff',
  colorAccent: '#cf4a25',
  colorBorder: 'rgba(19,33,46,0.1)',
  fontHeading: SANS_STACK,
  fontBody: SANS_STACK,
  headingWeight: 600,
  headingTracking: '-0.02em',
  baseFontSize: '16px',
  // Wider canvas for wide-aspect work; the hero carousel itself is full-bleed.
  maxWidth: '1440px',
  pagePadding: '32px',
  // Edge-to-edge: marine leaders present wide-aspect imagery full-bleed, not as
  // rounded, shadowed cards.
  imageRadius: '0px',
  imageShadow: 'none',
  headerLayout: 'split',
  homeLayout: 'carousel',
  galleryGridMode: 'cinematic',
  artworkLayout: 'stacked',
}

// Lifestyle photography (was "editorial"): magazine-style storytelling kept
// from the editorial base, but reframed lighter and more modern. Display-serif
// headings over a clean sans body is the canonical lifestyle pairing; the
// palette is airier and the accent a warm clay rather than a literary brown.
const lifestyle: ThemePreset = {
  preset: 'lifestyle',
  colorPrimary: '#2a2723',
  colorSecondary: 'rgba(42,39,35,0.65)',
  colorBg: '#faf8f3',
  colorSurface: '#ffffff',
  colorAccent: '#c0674a',
  colorBorder: 'rgba(42,39,35,0.1)',
  fontHeading: DISPLAY_SERIF,
  fontBody: SANS_STACK,
  headingWeight: 400,
  headingTracking: '-0.005em',
  baseFontSize: '17px',
  maxWidth: '1180px',
  pagePadding: '48px',
  imageRadius: '0px',
  imageShadow: 'none',
  headerLayout: 'centered',
  homeLayout: 'hero',
  galleryGridMode: 'magazine',
  artworkLayout: 'asymmetric',
}

// Fine-art photography (was "atmospheric"): dark, cinematic presentation that
// suits limited-edition print sales. The palette is already ideal and kept
// as-is. Galleries use the `solo` mode — each piece shown one-per-row at its
// native aspect ratio with its story beside it, so a wide range of work
// (panoramas, portraits, squares) each gets room to breathe (GalleryGrid.tsx).
const art: ThemePreset = {
  preset: 'art',
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
  homeLayout: 'centered',
  galleryGridMode: 'solo',
  artworkLayout: 'stacked',
}

// Travel photography (was "warm"): sun-warmed, journal/album feel with a paper
// grain, organized by destination. The warm base already fits travel well, so
// this is a light touch — only the accent warms toward a sunset terracotta.
const travel: ThemePreset = {
  preset: 'travel',
  colorPrimary: '#3d2f23',
  colorSecondary: 'rgba(61,47,35,0.6)',
  colorBg: '#f5ebdc',
  colorSurface: '#fbf4e9',
  colorAccent: '#bd5a2c',
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
  headerLayout: 'sidebar',
  homeLayout: 'centered',
  galleryGridMode: 'album',
  artworkLayout: 'stacked',
  // Subtle paper-grain texture using inline SVG noise — no external asset
  // needed. Renders as a low-contrast overlay so warm tones stay warm.
  bgTexture:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='4'/><feColorMatrix values='0 0 0 0 0.6  0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0.07 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
}

export const themes: Record<string, ThemePreset> = {
  sailing,
  lifestyle,
  art,
  travel,
}

// Public demo URLs for cross-linking the theme switcher bar at the bottom of
// every page. Update if you rename a Vercel project.
export type ThemeLink = { preset: string; label: string; url: string; tagline: string }

export const themeLinks: ThemeLink[] = [
  {
    preset: 'sailing',
    label: 'Sailing',
    tagline: 'Wide, immersive, event-driven',
    url: 'https://art-box-artist-template.vercel.app',
  },
  {
    preset: 'lifestyle',
    label: 'Lifestyle',
    tagline: 'Editorial & candid',
    url: 'https://art-box-artist-demo-editorial.vercel.app',
  },
  {
    preset: 'art',
    label: 'Fine Art',
    tagline: 'Dark, cinematic, gallery-wall',
    url: 'https://art-box-artist-demo-atmospheric.vercel.app',
  },
  {
    preset: 'travel',
    label: 'Travel',
    tagline: 'Sun-warmed, by destination',
    url: 'https://art-box-artist-demo-warm.vercel.app',
  },
]

export function getTheme(): Theme {
  const presetName = (process.env.NEXT_PUBLIC_THEME || 'sailing').toLowerCase()
  const preset = themes[presetName] ?? themes.sailing
  return {
    ...preset,
    // Default placeholder uses a historical figure so the demo content is
    // unambiguously not a real living artist's site. The /about-the-demo
    // page + the top banner (enabled via NEXT_PUBLIC_IS_DEMO=true on the
    // 4 showcase deployments) make the "this is a sample" framing
    // explicit. Real artist sites set NEXT_PUBLIC_ARTIST_NAME to their
    // own name and leave NEXT_PUBLIC_IS_DEMO unset.
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
