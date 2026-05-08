import { getTheme, type Theme } from './themes'

// Backward-compatible facade. New code should use getTheme() directly.
export type ArtistBrand = {
  artistName: string
  tagline: string
  primary: string
  accent: string
  background: string
  theme: Theme
}

export function getArtistBrand(): ArtistBrand {
  const theme = getTheme()
  return {
    artistName: theme.artistName,
    tagline: theme.tagline,
    primary: theme.colorPrimary,
    accent: theme.colorAccent,
    background: theme.colorBg,
    theme,
  }
}
