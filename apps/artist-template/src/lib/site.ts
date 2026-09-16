// Site resolution.
//
// Every public route lives under app/(public)/sites/[site]/ and the middleware
// rewrites incoming requests to put the site key in that segment, so pages get
// it as a plain route param and ISR keeps working per path.
//
// Two deployment modes:
//   MULTI_SITE=true   one deployment serves the marketing root plus one demo
//                     per preset on subdomains of NEXT_PUBLIC_SITE_DOMAIN
//                     (mosseditions.com, wildlife.mosseditions.com, ...).
//                     Content rows carry a `site` column and queries filter on it.
//   unset             a single artist site; the preset comes from
//                     NEXT_PUBLIC_THEME as before and nothing filters by site.

import type { Where } from 'payload'

import { DEFAULT_PRESET, resolvePresetName, themes, type Theme } from './themes'

// Tolerant on purpose: dashboards produce 'True', 'TRUE', '1' and stray spaces.
export const MULTI_SITE = /^(true|1|yes|on)$/i.test((process.env.MULTI_SITE || '').trim())
export const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'localhost:3001'
export const HOME_KEY = 'home'

export type SiteKind = 'home' | 'demo' | 'artist'
export type Site = {
  key: string // 'home' or a preset name; equals the [site] route param
  kind: SiteKind
  preset: string
}

export const PLATFORM_NAME = 'Moss Editions'
export const PLATFORM_TAGLINE = 'Print shops for photographers, with fulfilment included'

// Order the demos are presented in.
export const DEMO_PRESETS = ['wildlife', 'lifestyle', 'art', 'travel'] as const
export const DEMO_LABELS: Record<string, { label: string; tagline: string }> = {
  wildlife: { label: 'Wildlife', tagline: 'Large-format, limited editions' },
  lifestyle: { label: 'Lifestyle', tagline: 'Editorial & candid' },
  art: { label: 'Fine Art', tagline: 'Dark, cinematic, gallery-wall' },
  travel: { label: 'Travel', tagline: 'Sun-warmed, by destination' },
}

// Turn the [site] route param into a Site. In single-site mode the param is
// whatever the middleware put there (the env preset), so it's authoritative
// either way.
export function resolveSite(param: string | undefined): Site {
  if (MULTI_SITE) {
    if (!param || param === HOME_KEY) return { key: HOME_KEY, kind: 'home', preset: DEFAULT_PRESET }
    const preset = resolvePresetName(param)
    return { key: preset, kind: 'demo', preset }
  }
  const preset = resolvePresetName(process.env.NEXT_PUBLIC_THEME)
  return { key: preset, kind: process.env.NEXT_PUBLIC_IS_DEMO === 'true' ? 'demo' : 'artist', preset }
}

// The site key the middleware should use for a request host.
export function siteKeyForHost(host: string): string {
  if (!MULTI_SITE) return resolvePresetName(process.env.NEXT_PUBLIC_THEME)
  const h = host.toLowerCase()
  const d = SITE_DOMAIN.toLowerCase()
  if (h === d || h === `www.${d}`) return HOME_KEY
  if (h.endsWith(`.${d}`)) {
    const sub = h.slice(0, -(d.length + 1))
    if (sub in themes) return sub
  }
  // Preview hosts (*.vercel.app) and anything unknown land on the marketing root.
  return HOME_KEY
}

export function siteUrl(key: string, path = ''): string {
  const proto = SITE_DOMAIN.startsWith('localhost') ? 'http' : 'https'
  const host = key === HOME_KEY ? SITE_DOMAIN : `${key}.${SITE_DOMAIN}`
  return `${proto}://${host}${path}`
}

export type DemoLink = { preset: string; label: string; tagline: string; url: string }
export function demoLinks(): DemoLink[] {
  return DEMO_PRESETS.map((preset) => ({
    preset,
    ...DEMO_LABELS[preset],
    url: siteUrl(preset),
  }))
}

// Payload `where` fragment restricting a query to this site's rows. Null in
// single-site mode (rows there may predate the column).
export function siteWhere(site: Site): Where | null {
  return MULTI_SITE ? { site: { equals: site.preset } } : null
}
export function withSite(site: Site, where: Where): Where {
  const s = siteWhere(site)
  return s ? { and: [s, where] } : where
}

export function isDemo(site: Site): boolean {
  return site.kind === 'demo'
}

export function getTheme(site: Site): Theme {
  const preset = themes[site.preset] ?? themes[DEFAULT_PRESET]
  if (site.kind === 'home') {
    return { ...preset, artistName: PLATFORM_NAME, tagline: PLATFORM_TAGLINE }
  }
  const envName = MULTI_SITE ? '' : process.env.NEXT_PUBLIC_ARTIST_NAME
  const envTagline = MULTI_SITE ? '' : process.env.NEXT_PUBLIC_ARTIST_TAGLINE
  return {
    ...preset,
    artistName: envName || preset.demoArtistName,
    tagline: envTagline || preset.demoTagline,
  }
}

export function getAnnouncement(site: Site, theme: Theme): string | null {
  if (site.kind === 'home') return null
  const fromEnv = MULTI_SITE ? '' : process.env.NEXT_PUBLIC_ANNOUNCEMENT?.trim()
  if (fromEnv) return fromEnv
  return isDemo(site) && theme.demoAnnouncement ? theme.demoAnnouncement : null
}

export type NavItem = { href: string; label: string }
export function navFor(site: Site): { items: NavItem[]; showCart: boolean; showAdmin: boolean } {
  if (site.kind === 'home') {
    return {
      items: [
        { href: '/#looks', label: 'Looks' },
        { href: '/#how-it-works', label: 'How it works' },
        { href: '/#pricing', label: 'Pricing' },
        { href: '/#contact', label: 'Contact' },
      ],
      showCart: false,
      showAdmin: false,
    }
  }
  return {
    items: [
      { href: '/gallery', label: 'Galleries' },
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
    ],
    showCart: true,
    showAdmin: site.kind === 'demo',
  }
}
