import { getTheme, type Site } from './site'
import type { Theme } from './themes'

// Backward-compatible facade. New code should use getTheme(site) directly.
export type ArtistBrand = {
  artistName: string
  tagline: string
  primary: string
  accent: string
  background: string
  theme: Theme
}

export function getArtistBrand(site: Site): ArtistBrand {
  const theme = getTheme(site)
  return {
    artistName: theme.artistName,
    tagline: theme.tagline,
    primary: theme.colorPrimary,
    accent: theme.colorAccent,
    background: theme.colorBg,
    theme,
  }
}
