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
// 'construct'    — Bauhaus composition: colour blocks + photographs on a strict grid (bauhaus)
// 'quiet'        — one photograph, wide margins, a few lines of text (wabisabi)
// 'brutal'       — giant name, raw image, an index table of works (art)
// 'desk'         — journal, polaroids and postcards on a wooden desk (travel)
// 'collage'      — overlapping shapes, stickers and a ticker (maximalism)
export type HomeLayout =
  | 'centered'
  | 'hero'
  | 'carousel'
  | 'gallery-wall'
  | 'journeys'
  | 'globe'
  | 'construct'
  | 'quiet'
  | 'brutal'
  | 'desk'
  | 'collage'
export type GalleryGridMode =
  | 'uniform'
  | 'magazine'
  | 'album'
  | 'cinematic'
  | 'solo'
  | 'route'
  | 'construct'
  | 'quiet'
  | 'glass'
  | 'index'
  | 'collage'
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

// Wildlife, styled as glassmorphism: large-format nature photography seen
// through frosted panels. A deep forest ground lit by soft colour fields so
// the glass has something to blur; translucent surfaces, white hairline
// borders, generous radii. Full-bleed carousel with a glass caption card.
const wildlife: ThemePreset = {
  preset: 'wildlife',
  colorPrimary: '#f4f7f2',
  colorSecondary: 'rgba(244,247,242,0.72)',
  colorBg: '#0d1a16',
  colorSurface: 'rgba(255,255,255,0.08)',
  colorAccent: '#e8b04b',
  colorBorder: 'rgba(255,255,255,0.18)',
  fontHeading: 'var(--font-manrope), "Segoe UI", system-ui, sans-serif',
  fontBody: 'var(--font-manrope), "Segoe UI", system-ui, sans-serif',
  headingWeight: 700,
  headingTracking: '-0.02em',
  baseFontSize: '16px',
  maxWidth: '1360px',
  pagePadding: '32px',
  imageRadius: '18px',
  imageShadow: '0 24px 60px rgba(0,0,0,0.35)',
  controlRadius: '14px',
  headerLayout: 'split',
  headerStyle: 'glass',
  headerGlassBg: 'rgba(13,26,22,0.45)',
  headerBlur: '18px',
  homeLayout: 'carousel',
  galleryGridMode: 'glass',
  artworkLayout: 'stacked',
  bgTexture:
    'radial-gradient(55vw 45vw at 8% 4%, rgba(46,140,110,0.55), transparent 62%), ' +
    'radial-gradient(45vw 40vw at 96% 18%, rgba(214,150,60,0.32), transparent 62%), ' +
    'radial-gradient(60vw 50vw at 55% 100%, rgba(40,96,150,0.45), transparent 62%)',
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

// Fine art, styled as brutalism: the work and nothing pretending otherwise.
// White ground, black type, raw link blue, a blunt display face over a
// monospace, hard 2px rules, no radius, no shadow. The home is a giant name
// over an index of editions; galleries are a catalogue table.
const art: ThemePreset = {
  preset: 'art',
  colorPrimary: '#000000',
  colorSecondary: 'rgba(0,0,0,0.62)',
  colorBg: '#ffffff',
  colorSurface: '#f1f1ee',
  colorAccent: '#0000ee',
  colorBorder: '#000000',
  fontHeading: 'var(--font-archivo), "Arial Black", Impact, sans-serif',
  fontBody: 'var(--font-mono), "Courier New", monospace',
  headingWeight: 400,
  headingTracking: '-0.03em',
  baseFontSize: '15px',
  maxWidth: '1600px',
  pagePadding: '20px',
  imageRadius: '0px',
  imageShadow: 'none',
  controlRadius: '0px',
  headerLayout: 'split',
  headerStyle: 'solid',
  headerGlassBg: 'rgba(255,255,255,0.9)',
  headerBlur: '0px',
  homeLayout: 'brutal',
  galleryGridMode: 'index',
  artworkLayout: 'stacked',
  demoArtistName: 'Alfred Stieglitz',
  demoTagline: 'Signed, limited edition photographs',
}

// Travel, styled as skeuomorphism: a journal you can almost touch. Linen
// paper ground, prints with real-world drop shadows, handwriting for notes.
// The home is a wooden desk with a notebook, polaroids, a postcard and a
// passport stamp; inside a gallery the antique route map stays and the photos
// become polaroids (galleryGridMode 'route').
const travel: ThemePreset = {
  preset: 'travel',
  colorPrimary: '#3d2f23',
  colorSecondary: 'rgba(61,47,35,0.62)',
  colorBg: '#efe4d2',
  colorSurface: '#fbf6ec',
  colorAccent: '#b4532a',
  colorBorder: 'rgba(61,47,35,0.16)',
  fontHeading: 'Georgia, "Iowan Old Style", "Source Serif Pro", serif',
  fontBody: '"Segoe UI", system-ui, -apple-system, sans-serif',
  headingWeight: 500,
  headingTracking: '-0.005em',
  baseFontSize: '16px',
  maxWidth: '1200px',
  pagePadding: '40px',
  imageRadius: '2px',
  imageShadow: '0 1px 1px rgba(40,25,10,0.18), 0 6px 14px rgba(40,25,10,0.18), 0 18px 34px rgba(40,25,10,0.14)',
  controlRadius: '6px',
  headerLayout: 'split',
  headerStyle: 'solid',
  headerGlassBg: 'rgba(239,228,210,0.85)',
  headerBlur: '12px',
  homeLayout: 'desk',
  galleryGridMode: 'route',
  artworkLayout: 'stacked',
  bgTexture:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='4'/><feColorMatrix values='0 0 0 0 0.6  0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0.09 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
  demoArtistName: 'Francis Frith',
  demoTagline: 'Journeys, one print at a time',
}

// Maximalism: more of everything. Cream ground under a pink polka-dot field,
// deep purple ink, hot pink accent with cobalt, chartreuse and tangerine in
// play, a black italic display serif, pill buttons with hard offset shadows,
// overlapping shapes. Suits saturated colour photography.
const maximalism: ThemePreset = {
  preset: 'maximalism',
  colorPrimary: '#1e0b3a',
  colorSecondary: 'rgba(30,11,58,0.74)',
  colorBg: '#fff1dc',
  colorSurface: '#ffffff',
  colorAccent: '#ff2e88',
  colorBorder: '#1e0b3a',
  fontHeading: 'var(--font-fraunces), Georgia, serif',
  fontBody: 'var(--font-grotesk), "Segoe UI", system-ui, sans-serif',
  headingWeight: 900,
  headingTracking: '-0.02em',
  baseFontSize: '16px',
  maxWidth: '1360px',
  pagePadding: '32px',
  imageRadius: '22px',
  imageShadow: '8px 8px 0 #1e0b3a',
  controlRadius: '999px',
  headerLayout: 'split',
  headerStyle: 'solid',
  headerGlassBg: 'rgba(255,241,220,0.9)',
  headerBlur: '12px',
  homeLayout: 'collage',
  galleryGridMode: 'collage',
  artworkLayout: 'stacked',
  bgTexture: 'radial-gradient(rgba(255,46,136,0.22) 1.6px, transparent 1.9px)',
  demoArtistName: "Mervyn O'Gorman",
  demoTagline: 'Colour, loudly',
  demoAnnouncement: 'New colour editions every month · Free shipping on two or more prints',
}

// Bauhaus: the style rather than a genre. Primary red / yellow / blue on an
// off-white ground, black rules, a geometric sans set heavy and uppercase,
// everything on a strict grid. Suits architectural and graphic photography.
const bauhaus: ThemePreset = {
  preset: 'bauhaus',
  colorPrimary: '#111111',
  colorSecondary: 'rgba(17,17,17,0.66)',
  colorBg: '#f1ede4',
  colorSurface: '#faf8f3',
  colorAccent: '#d42a1f',
  colorBorder: '#111111',
  fontHeading: 'var(--font-jost), Futura, "Century Gothic", "Avenir Next", sans-serif',
  fontBody: 'var(--font-jost), Futura, "Century Gothic", "Avenir Next", sans-serif',
  headingWeight: 700,
  headingTracking: '-0.01em',
  baseFontSize: '16px',
  maxWidth: '1320px',
  pagePadding: '32px',
  imageRadius: '0px',
  imageShadow: 'none',
  controlRadius: '0px',
  headerLayout: 'split',
  headerStyle: 'solid',
  headerGlassBg: 'rgba(241,237,228,0.85)',
  headerBlur: '12px',
  homeLayout: 'construct',
  galleryGridMode: 'construct',
  artworkLayout: 'stacked',
  demoArtistName: 'László Moholy-Nagy',
  demoTagline: 'Form, light and the built world',
}

// Wabi-sabi: quiet, imperfect, impermanent. Unbleached-paper ground, warm
// charcoal ink, a clay accent, a mincho for headings, wide margins, and image
// corners that are very slightly uneven. Suits still life and quiet nature.
const wabisabi: ThemePreset = {
  preset: 'wabisabi',
  colorPrimary: '#3b3833',
  colorSecondary: 'rgba(59,56,51,0.6)',
  colorBg: '#ece8df',
  colorSurface: '#f4f1ea',
  colorAccent: '#8d6e4c',
  colorBorder: 'rgba(59,56,51,0.14)',
  fontHeading: 'var(--font-shippori), "Hiragino Mincho ProN", "Yu Mincho", Georgia, serif',
  fontBody: 'var(--font-zen), "Hiragino Sans", "Segoe UI", sans-serif',
  headingWeight: 400,
  headingTracking: '0.04em',
  baseFontSize: '16px',
  maxWidth: '1120px',
  pagePadding: '48px',
  imageRadius: '3px 7px 4px 9px / 6px 3px 8px 4px',
  imageShadow: 'none',
  controlRadius: '2px',
  headerLayout: 'split',
  headerStyle: 'solid',
  headerGlassBg: 'rgba(236,232,223,0.85)',
  headerBlur: '12px',
  homeLayout: 'quiet',
  galleryGridMode: 'quiet',
  artworkLayout: 'asymmetric',
  bgTexture:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' seed='9'/><feColorMatrix values='0 0 0 0 0.35  0 0 0 0 0.33  0 0 0 0 0.3  0 0 0 0.06 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
  demoArtistName: 'Kusakabe Kimbei',
  demoTagline: 'Quiet things, slowly seen',
}

// Moss Editions' own look, for the marketing root (never a demo). Light
// neutral chrome with the glass header; the demos each carry their own style.
const moss: ThemePreset = {
  preset: 'moss',
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
  homeLayout: 'centered',
  galleryGridMode: 'uniform',
  artworkLayout: 'stacked',
  demoArtistName: 'Moss Editions',
  demoTagline: 'Print shops for photographers',
}

export const themes: Record<string, ThemePreset> = {
  wildlife,
  lifestyle,
  art,
  travel,
  bauhaus,
  wabisabi,
  maximalism,
  moss,
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
  'wabi-sabi': 'wabisabi',
}

export function resolvePresetName(raw?: string | null): string {
  const key = (raw || DEFAULT_PRESET).toLowerCase()
  const resolved = PRESET_ALIASES[key] ?? key
  return themes[resolved] ? resolved : DEFAULT_PRESET
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
