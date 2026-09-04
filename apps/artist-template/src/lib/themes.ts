// Theme system for the artist site.
// One presentation layer, multiple visual identities. The deployment chooses
// a preset via the NEXT_PUBLIC_THEME env var; per-deployment overrides
// (artist name, tagline) come from other NEXT_PUBLIC_* vars.
//
// Presets are named by photography genre. Each genre demo has its own content
// set (src/seed/demo-content.ts) and its own database branch.

export type HeaderLayout = 'split' | 'centered'
// 'solid'  — opaque bar in the theme's background colour, sticky.
// 'glass'  — transparent over a hero (white chrome, hairline rule), turning
//            into a blurred glass bar once the page scrolls. Same pattern as
//            the artboxprinting.com header. Pages without a hero get the
//            light glass from the start.
export type HeaderStyle = 'solid' | 'glass'
// 'carousel'     — full-bleed rotating featured work with an edition CTA (wildlife)
// 'hero'         — one featured piece full-bleed (lifestyle)
// 'gallery-wall' — one piece on a dark wall with a signed-editions headline (art)
// 'journeys'     — latest journey cover, then the globe as a "browse by place" section (travel)
// 'globe'        — globe as the whole hero (previous travel home, kept)
// 'centered'     — name + tagline only (fallback)
export type HomeLayout = 'centered' | 'hero' | 'carousel' | 'gallery-wall' | 'journeys' | 'globe'
export type GalleryGridMode =
  | 'uniform'
  | 'magazine'
  | 'album'
  | 'cinematic'
  | 'solo'
  | 'route'
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

  // Image + control treatment
  imageRadius: string
  imageShadow: string
  // Radius for buttons, chips, inputs and cards. Kept separate from
  // imageRadius so a theme can have square photos and soft controls.
  controlRadius: string

  // Header chrome
  headerLayout: HeaderLayout
  headerStyle: HeaderStyle
  // Glass fill used once the header is scrolled and NOT over a hero: the
  // theme's background at partial alpha, blurred behind. Only read when
  // headerStyle is 'glass'.
  headerGlassBg: string
  headerBlur: string

  // Layout variants — drive structural (not just stylistic) differences
  // between presets.
  homeLayout: HomeLayout
  galleryGridMode: GalleryGridMode
  artworkLayout: ArtworkLayout
  // Optional background overlay (e.g. paper texture for the travel preset).
  bgTexture?: string

  // Placeholder identity for the demo deployments. Historical photographers
  // (all long dead, work in the public domain) so the sample is unambiguously
  // not a living artist's site. Real deployments override via env.
  demoArtistName: string
  demoTagline: string
  // Optional thin strip above the header (offers, shipping notes). Real sites
  // set NEXT_PUBLIC_ANNOUNCEMENT; the demo deployments fall back to this.
  demoAnnouncement?: string
}

type ThemePreset = Omit<Theme, 'artistName' | 'tagline'>

const SANS_STACK =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
const SERIF_STACK =
  'Georgia, "Iowan Old Style", "Source Serif Pro", "Apple Garamond", serif'
const DISPLAY_SERIF =
  '"Playfair Display", Didot, "Bodoni MT", Garamond, serif'

// Default preset: wildlife photography sold as large-format limited editions.
// Modelled on the large-format landscape/wildlife sellers (Lik, Aaron Reed):
// light neutral chrome, a sans face, the photographs carry all the colour.
// Full-bleed carousel home with the glass header riding over it.
const wildlife: ThemePreset = {
  preset: 'wildlife',
  colorPrimary: '#161a17',
  colorSecondary: 'rgba(22,26,23,0.62)',
  colorBg: '#f5f4f0',
  colorSurface: '#ffffff',
  colorAccent: '#a9672b',
  colorBorder: 'rgba(22,26,23,0.1)',
  fontHeading: SANS_STACK,
  fontBody: SANS_STACK,
  headingWeight: 600,
  headingTracking: '-0.02em',
  baseFontSize: '16px',
  maxWidth: '1440px',
  pagePadding: '32px',
  imageRadius: '0px',
  imageShadow: 'none',
  controlRadius: '2px',
  headerLayout: 'split',
  headerStyle: 'glass',
  headerGlassBg: 'rgba(245,244,240,0.72)',
  headerBlur: '14px',
  homeLayout: 'carousel',
  galleryGridMode: 'cinematic',
  artworkLayout: 'stacked',
  demoArtistName: 'Eadweard Muybridge',
  demoTagline: 'Large-format wildlife, in limited editions',
}

// Lifestyle photography: magazine-style storytelling, display-serif headings
// over a clean sans body, airy palette with a warm clay accent. Logo-centred
// solid header (Galerie Prints / Gray Malin).
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
  controlRadius: '0px',
  headerLayout: 'centered',
  headerStyle: 'solid',
  headerGlassBg: 'rgba(250,248,243,0.8)',
  headerBlur: '12px',
  homeLayout: 'hero',
  galleryGridMode: 'magazine',
  artworkLayout: 'asymmetric',
  demoArtistName: 'Julia Margaret Cameron',
  demoTagline: 'Portraits, homes and the moments between',
  demoAnnouncement: 'Free framing on orders over $300 through the end of the month',
}

// Fine-art photography: dark, cinematic presentation that suits limited-edition
// print sales. Deliberately the one dark look in the set. Galleries use the
// `solo` mode — each piece one-per-row at its native aspect ratio with its
// story beside it.
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
  controlRadius: '0px',
  headerLayout: 'split',
  headerStyle: 'solid',
  headerGlassBg: 'rgba(13,13,14,0.7)',
  headerBlur: '12px',
  homeLayout: 'gallery-wall',
  galleryGridMode: 'solo',
  artworkLayout: 'stacked',
  demoArtistName: 'Alfred Stieglitz',
  demoTagline: 'Signed, limited edition photographs',
}

// Travel photography: sun-warmed, journal/album feel with a paper grain,
// organised by journey. Interactive globe on the home (homeLayout 'globe');
// inside a gallery the photos are plotted on a mini-map joined by a dashed
// route (galleryGridMode 'route').
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
  controlRadius: '6px',
  headerLayout: 'split',
  headerStyle: 'solid',
  headerGlassBg: 'rgba(245,235,220,0.8)',
  headerBlur: '12px',
  homeLayout: 'journeys',
  galleryGridMode: 'route',
  artworkLayout: 'stacked',
  // Subtle paper-grain texture using inline SVG noise — no external asset
  // needed. Renders as a low-contrast overlay so warm tones stay warm.
  bgTexture:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='4'/><feColorMatrix values='0 0 0 0 0.6  0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0.07 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
  demoArtistName: 'Francis Frith',
  demoTagline: 'Journeys, one print at a time',
}

export const themes: Record<string, ThemePreset> = {
  wildlife,
  lifestyle,
  art,
  travel,
}

export const DEFAULT_PRESET = 'wildlife'

// Older env values still resolve. 'sailing' was the wildlife preset's previous
// identity; the style names predate the genre reframe.
const PRESET_ALIASES: Record<string, string> = {
  sailing: 'wildlife',
  minimal: 'wildlife',
  editorial: 'lifestyle',
  atmospheric: 'art',
  warm: 'travel',
}

export function resolvePresetName(raw?: string | null): string {
  const key = (raw || DEFAULT_PRESET).toLowerCase()
  const resolved = PRESET_ALIASES[key] ?? key
  return themes[resolved] ? resolved : DEFAULT_PRESET
}

// Public demo URLs for cross-linking the theme switcher bar at the bottom of
// every page. The URLs are Vercel project names and still carry the old
// style-based slugs; rename here when the projects are renamed.
export type ThemeLink = { preset: string; label: string; url: string; tagline: string }

export const themeLinks: ThemeLink[] = [
  {
    preset: 'wildlife',
    label: 'Wildlife',
    tagline: 'Large-format, limited editions',
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
  const preset = themes[resolvePresetName(process.env.NEXT_PUBLIC_THEME)]
  return {
    ...preset,
    // Real artist sites set NEXT_PUBLIC_ARTIST_NAME / _TAGLINE. The demo
    // deployments leave them unset and get the genre placeholder.
    artistName: process.env.NEXT_PUBLIC_ARTIST_NAME || preset.demoArtistName,
    tagline: process.env.NEXT_PUBLIC_ARTIST_TAGLINE || preset.demoTagline,
  }
}

export function isDemoSite(): boolean {
  return process.env.NEXT_PUBLIC_IS_DEMO === 'true'
}

export function getAnnouncement(theme: Theme): string | null {
  const fromEnv = process.env.NEXT_PUBLIC_ANNOUNCEMENT?.trim()
  if (fromEnv) return fromEnv
  return isDemoSite() && theme.demoAnnouncement ? theme.demoAnnouncement : null
}

// Convert the theme into a record of CSS custom properties, for spreading
// onto a wrapping element's style prop. Every component in the public app and
// in @artbox/ui reads these; nothing should hardcode a colour, font, radius
// or shadow that one of these covers.
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
    '--control-radius': theme.controlRadius,
    '--header-glass-bg': theme.headerGlassBg,
    '--header-blur': theme.headerBlur,
  }
}
