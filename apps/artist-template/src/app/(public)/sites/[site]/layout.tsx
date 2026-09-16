import Link from 'next/link'
import React from 'react'

import CartProviderWrapper from '@/components/CartProviderWrapper'
import DemoBanner from '@/components/site/DemoBanner'
import SiteFooter from '@/components/site/SiteFooter'
import SiteHeader from '@/components/site/SiteHeader'
import ThemeSwitcher from '@/components/site/ThemeSwitcher'
import { getAnnouncement, getTheme, isDemo, navFor, resolveSite } from '@/lib/site'
import { themeCssVars } from '@/lib/themes'

import './globals.css'

type Params = Promise<{ site: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const site = resolveSite((await params).site)
  const theme = getTheme(site)
  return {
    title: {
      default: theme.artistName,
      template: `%s — ${theme.artistName}`,
    },
    description: theme.tagline,
    // Demo sites stay out of search; the marketing root and real artist
    // sites are indexable.
    robots: isDemo(site) ? { index: false, follow: true } : undefined,
  }
}

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Params
}) {
  const site = resolveSite((await params).site)
  const theme = getTheme(site)
  const cssVars = themeCssVars(theme) as React.CSSProperties
  const demo = isDemo(site)
  const announcement = getAnnouncement(site, theme)
  const nav = navFor(site)

  return (
    <html lang="en">
      <body
        className={`theme-${theme.preset} header-${theme.headerStyle} site-${site.kind}`}
        style={{
          ...cssVars,
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--base-font-size)',
          background: 'var(--color-bg)',
          backgroundImage: theme.bgTexture,
          color: 'var(--color-primary)',
        }}
      >
        <CartProviderWrapper siteKey={site.key}>
          {demo ? <DemoBanner /> : null}
          {announcement ? <div className="announce">{announcement}</div> : null}
          <SiteHeader
            artistName={theme.artistName}
            layout={theme.headerLayout}
            style={theme.headerStyle}
            items={nav.items}
            showCart={nav.showCart}
            showAdmin={nav.showAdmin}
          />
          <main>{children}</main>
          <SiteFooter artistName={theme.artistName} isPlatform={site.kind === 'home'}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/shipping-returns">Shipping &amp; returns</Link>
          </SiteFooter>
          {demo ? <ThemeSwitcher activePreset={theme.preset} /> : null}
        </CartProviderWrapper>
      </body>
    </html>
  )
}
