import {
  Archivo_Black,
  Caveat,
  Fraunces,
  Jost,
  Manrope,
  Shippori_Mincho,
  Space_Grotesk,
  Space_Mono,
  Zen_Kaku_Gothic_New,
} from 'next/font/google'

// Web fonts for presets that need a specific face. Self-hosted by next/font
// at build time; preload is off so sites that don't use a face never fetch
// it. Each exposes a CSS variable that themes.ts references.

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

// Wildlife (glassmorphism): a clean rounded grotesk that reads on glass.
export const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
  preload: false,
})

// Fine art (brutalism): one blunt display face and a monospace for everything else.
export const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-archivo',
  display: 'swap',
  preload: false,
})
export const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
  preload: false,
})

// Travel (skeuomorphism): handwriting for notes, captions and labels.
export const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-caveat',
  display: 'swap',
  preload: false,
})

// Maximalism: a soft-serif display set black and italic, a quirky grotesk for text.
export const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['600', '900'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
  preload: false,
})
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-grotesk',
  display: 'swap',
  preload: false,
})

export const fontVariables = [
  jost,
  shippori,
  zenGothic,
  manrope,
  archivoBlack,
  spaceMono,
  caveat,
  fraunces,
  spaceGrotesk,
]
  .map((f) => f.variable)
  .join(' ')
