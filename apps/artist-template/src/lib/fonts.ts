import { Jost, Shippori_Mincho, Zen_Kaku_Gothic_New } from 'next/font/google'

// Web fonts for the presets that need a specific face. Self-hosted by
// next/font at build time; preload is off so the other sites never fetch
// them. Each exposes a CSS variable that themes.ts references.

// Bauhaus: geometric sans in the Futura / Bayer universal tradition.
export const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-jost',
  display: 'swap',
  preload: false,
})

// Wabi-sabi: a quiet mincho for headings, a soft gothic for text.
export const shippori = Shippori_Mincho({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-shippori',
  display: 'swap',
  preload: false,
})
export const zenGothic = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-zen',
  display: 'swap',
  preload: false,
})

export const fontVariables = [jost.variable, shippori.variable, zenGothic.variable].join(' ')
