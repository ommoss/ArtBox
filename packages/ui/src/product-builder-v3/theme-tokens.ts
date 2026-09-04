// Theme tokens consumed by the V3 builder. Every visible property derives from a
// CSS variable so the builder visually matches whichever artist theme preset
// is active (see apps/artist-template/src/lib/themes.ts).
//
// The fallback values are a neutral light default so the component renders
// reasonably when mounted in a context without theme vars (e.g. the
// fulfillment-platform admin preview iframe). They intentionally do not track
// the default site preset — the iframe is theme-agnostic chrome.
export const TOKENS = {
  // Colors
  primary: 'var(--color-primary, #1a1a1a)',
  secondary: 'var(--color-secondary, rgba(0,0,0,0.6))',
  bg: 'var(--color-bg, #fafaf6)',
  surface: 'var(--color-surface, #ffffff)',
  accent: 'var(--color-accent, #a86232)',
  border: 'var(--color-border, rgba(0,0,0,0.08))',

  // Typography
  fontHeading: 'var(--font-heading, "Inter", -apple-system, BlinkMacSystemFont, sans-serif)',
  fontBody: 'var(--font-body, "Inter", -apple-system, BlinkMacSystemFont, sans-serif)',
  weightHeading: 'var(--weight-heading, 500)',
  trackingHeading: 'var(--tracking-heading, -0.01em)',
  baseFontSize: 'var(--base-font-size, 16px)',

  // Image treatment — applied to the print preview so it matches gallery
  // thumbnails on the host site.
  imageRadius: 'var(--image-radius, 4px)',
  imageShadow: 'var(--image-shadow, 0 8px 24px rgba(0,0,0,0.06))',

  // Corner radius for interactive controls (buttons, cards, inputs). Pills
  // (999px) and circles stay as-is; this is for the rectangular controls
  // so a sharp-cornered art theme doesn't get rounded buttons.
  controlRadius: 'var(--control-radius, 4px)',

  // Spacing
  pagePadding: 'var(--page-padding, 32px)',
} as const

// Semantic aliases that combine multiple tokens. Keeps usage sites tidy.
export const SEMANTIC = {
  // Subtle filled chip background, theme-aware.
  chipBg: TOKENS.bg,
  chipBorder: TOKENS.border,
  // CTA color pairing.
  ctaBg: TOKENS.primary,
  ctaFg: TOKENS.bg,
  // Focus ring color.
  focusRing: TOKENS.primary,
} as const
