export type ArtistBrand = {
  artistName: string
  tagline: string
  primary: string
  accent: string
  background: string
}

export function getArtistBrand(): ArtistBrand {
  return {
    artistName: process.env.NEXT_PUBLIC_ARTIST_NAME || 'Sample Artist',
    tagline:
      process.env.NEXT_PUBLIC_ARTIST_TAGLINE || 'Photographs from the field',
    primary: process.env.NEXT_PUBLIC_BRAND_PRIMARY || '#1a1a1a',
    accent: process.env.NEXT_PUBLIC_BRAND_ACCENT || '#a86232',
    background: process.env.NEXT_PUBLIC_BRAND_BG || '#fafaf6',
  }
}
