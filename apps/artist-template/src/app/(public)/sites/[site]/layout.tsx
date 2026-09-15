import React from 'react'

import CartProviderWrapper from '@/components/CartProviderWrapper'
import DemoBanner from '@/components/site/DemoBanner'
import SiteFooter from '@/components/site/SiteFooter'
import SiteHeader from '@/components/site/SiteHeader'
import ThemeSwitcher from '@/components/site/ThemeSwitcher'
import { getAnnouncement, getTheme, isDemoSite, themeCssVars } from '@/lib/themes'

import './globals.css'

export function generateMetadata() {
  const theme = getTheme()
  return {
    title: {
      default: theme.artistName,
      template: `%s — ${theme.artistName}`,
    },
    description: theme.tagline,
  }
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const theme = getTheme()
  const cssVars = themeCssVars(theme) as React.CSSProperties
  const isDemo = isDemoSite()
  const announcement = getAnnouncement(theme)

  return (
    <html lang="en">
      <body
        className={`theme-${theme.preset} header-${theme.headerStyle}`}
        style={{
          ...cssVars,
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--base-font-size)',
          background: 'var(--color-bg)',
          backgroundImage: theme.bgTexture,
          color: 'var(--color-primary)',
        }}
      >
        <CartProviderWrapper>
          {isDemo ? <DemoBanner /> : null}
          {announcement ? <div className="announce">{announcement}</div> : null}
          <SiteHeader
            artistName={theme.artistName}
            layout={theme.headerLayout}
            style={theme.headerStyle}
          />
          <main>{children}</main>
          <SiteFooter artistName={theme.artistName} />
          {isDemo ? <ThemeSwitcher activePreset={theme.preset} /> : null}
        </CartProviderWrapper>
      </body>
    </html>
  )
}
