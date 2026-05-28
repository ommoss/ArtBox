import Link from 'next/link'
import React from 'react'

import CartButton from '@/components/CartButton'
import CartProviderWrapper from '@/components/CartProviderWrapper'
import { getTheme, themeCssVars, themeLinks } from '@/lib/themes'

export const metadata = {
  title: 'Artist Site',
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const theme = getTheme()
  const cssVars = themeCssVars(theme) as React.CSSProperties
  const isSidebar = theme.headerLayout === 'sidebar'
  // Set NEXT_PUBLIC_IS_DEMO=true on demo Vercel projects (the 4 theme
  // showcase deployments) so the "this is a sample" banner appears. Real
  // artist sites leave this unset.
  const isDemo = process.env.NEXT_PUBLIC_IS_DEMO === 'true'

  return (
    <html lang="en">
      <body
        style={{
          ...cssVars,
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--base-font-size)',
          margin: 0,
          background: 'var(--color-bg)',
          backgroundImage: theme.bgTexture,
          color: 'var(--color-primary)',
        }}
      >
        <CartProviderWrapper>
          <style>{`
            .public-header {
              padding: 20px var(--page-padding);
              display: flex;
              justify-content: space-between;
              align-items: center;
              flex-wrap: wrap;
              gap: 16px;
              border-bottom: 1px solid var(--color-border);
            }
            .public-header--centered {
              flex-direction: column;
              text-align: center;
              padding-top: 32px;
              padding-bottom: 24px;
              gap: 12px;
            }
            .public-header--centered .public-name {
              font-size: 1.6rem;
              font-family: var(--font-heading);
              font-weight: var(--weight-heading);
              letter-spacing: var(--tracking-heading);
            }
            .public-layout--sidebar {
              display: grid;
              grid-template-columns: 240px 1fr;
              min-height: 100vh;
            }
            .public-layout--sidebar .public-header--sidebar {
              flex-direction: column;
              align-items: flex-start;
              padding: 36px 28px;
              gap: 28px;
              border-bottom: none;
              border-right: 1px solid var(--color-border);
              position: sticky;
              top: 0;
              align-self: start;
              height: 100vh;
            }
            .public-layout--sidebar .public-header--sidebar .public-name {
              font-size: 1.5rem;
              font-family: var(--font-heading);
              font-weight: var(--weight-heading);
              letter-spacing: var(--tracking-heading);
              line-height: 1.1;
            }
            .public-layout--sidebar .public-header--sidebar .public-nav {
              flex-direction: column;
              align-items: flex-start;
              gap: 14px;
            }
            .public-layout--sidebar .public-footer {
              margin-top: 0;
              padding: 24px 28px;
              text-align: left;
              border-top: 1px solid var(--color-border);
            }
            .public-layout--sidebar .theme-switcher {
              text-align: left;
              padding: 24px 28px 32px;
            }
            .public-layout--sidebar .theme-switcher-links {
              justify-content: flex-start;
            }
            .public-layout--sidebar .public-aside {
              border-right: 1px solid var(--color-border);
              display: flex;
              flex-direction: column;
            }
            @media (max-width: 768px) {
              .public-layout--sidebar {
                grid-template-columns: 1fr;
              }
              .public-layout--sidebar .public-aside {
                border-right: none;
              }
              .public-layout--sidebar .public-header--sidebar {
                flex-direction: row;
                position: static;
                height: auto;
                border-right: none;
                border-bottom: 1px solid var(--color-border);
                padding: 20px var(--page-padding);
                gap: 16px;
              }
              .public-layout--sidebar .public-header--sidebar .public-nav {
                flex-direction: row;
              }
              .public-layout--sidebar .public-footer {
                text-align: center;
              }
              .public-layout--sidebar .theme-switcher {
                text-align: center;
              }
            }
            .public-nav {
              display: flex;
              gap: 24px;
              align-items: center;
              flex-wrap: wrap;
            }
            .public-name {
              font-family: var(--font-body);
              font-weight: 600;
              letter-spacing: 0.3px;
              font-size: 1.1rem;
            }
            .public-footer {
              margin-top: 96px;
              padding: 32px;
              border-top: 1px solid var(--color-border);
              color: var(--color-secondary);
              font-size: 0.8rem;
              text-align: center;
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
            .theme-switcher {
              padding: 24px 32px 32px;
              border-top: 1px dashed var(--color-border);
              text-align: center;
              font-family: var(--font-body);
            }
            .theme-switcher-label {
              display: block;
              font-size: 0.7rem;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: var(--color-secondary);
              margin-bottom: 12px;
            }
            .theme-switcher-links {
              display: flex;
              gap: 8px;
              justify-content: center;
              flex-wrap: wrap;
            }
            .theme-switcher-link {
              display: flex;
              flex-direction: column;
              gap: 2px;
              align-items: center;
              padding: 8px 16px;
              border: 1px solid var(--color-border);
              border-radius: 4px;
              text-decoration: none;
              color: var(--color-primary);
              background: transparent;
              transition: background 0.15s, border-color 0.15s;
            }
            .theme-switcher-link:hover {
              background: var(--color-surface);
              border-color: var(--color-primary);
            }
            .theme-switcher-link--active {
              background: var(--color-primary);
              color: var(--color-bg);
              border-color: var(--color-primary);
            }
            .theme-switcher-link-name {
              font-size: 0.85rem;
              font-weight: 500;
              letter-spacing: 0.3px;
            }
            .theme-switcher-link-tagline {
              font-size: 0.7rem;
              opacity: 0.7;
            }
            @media (max-width: 768px) {
              .theme-switcher { padding: 20px 20px 28px; }
              .theme-switcher-link { padding: 6px 12px; }
            }
            .checkout-grid {
              display: grid;
              grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
              gap: 48px;
              padding: 48px var(--page-padding);
              max-width: 1100px;
              margin: 0 auto;
            }
            @media (max-width: 768px) {
              .public-header { padding: 16px 20px; gap: 12px; }
              .public-header--centered { padding: 24px 20px; }
              .public-nav { gap: 14px; }
              .checkout-grid {
                grid-template-columns: 1fr;
                gap: 32px;
                padding: 32px 20px;
              }
            }
            .demo-banner {
              background: var(--color-primary);
              color: var(--color-bg);
              padding: 8px 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 16px;
              flex-wrap: wrap;
              font-size: 0.85rem;
              text-align: center;
            }
            .demo-banner-text {
              opacity: 0.92;
            }
            .demo-banner-cta {
              padding: 4px 12px;
              background: var(--color-bg);
              color: var(--color-primary);
              border-radius: 999px;
              text-decoration: none;
              font-weight: 600;
              white-space: nowrap;
              transition: opacity 0.15s;
            }
            .demo-banner-cta:hover { opacity: 0.85; }
            @media (max-width: 480px) {
              .demo-banner {
                font-size: 0.78rem;
                padding: 6px 12px;
                gap: 10px;
              }
              .demo-banner-cta { padding: 3px 10px; }
            }
          `}</style>
          {isDemo ? (
            <div className="demo-banner">
              <span className="demo-banner-text">
                Sample artist site — built on the Artbox platform
              </span>
              <Link href="/about-the-demo" className="demo-banner-cta">
                See how it works →
              </Link>
            </div>
          ) : null}
          <div className={isSidebar ? 'public-layout--sidebar' : undefined}>
            {isSidebar ? (
              <aside className="public-aside">
                <header className="public-header public-header--sidebar">
                  <Link href="/" className="public-name" style={navStyle()}>
                    {theme.artistName}
                  </Link>
                  {theme.tagline ? (
                    <span
                      style={{
                        color: 'var(--color-secondary)',
                        fontSize: '0.9rem',
                        fontStyle: 'italic',
                        lineHeight: 1.4,
                      }}
                    >
                      {theme.tagline}
                    </span>
                  ) : null}
                  <nav className="public-nav">
                    <Link href="/gallery" style={navStyle()}>
                      Galleries
                    </Link>
                    <Link href="/about" style={navStyle()}>
                      About
                    </Link>
                    <Link href="/contact" style={navStyle()}>
                      Contact
                    </Link>
                    <CartButton color="var(--color-primary)" />
                    <Link href="/admin" style={{ ...navStyle(), opacity: 0.5 }}>
                      Admin
                    </Link>
                  </nav>
                </header>
              </aside>
            ) : (
              <header
                className={`public-header public-header--${theme.headerLayout}`}
              >
                <Link href="/" className="public-name" style={navStyle()}>
                  {theme.artistName}
                </Link>
                <nav className="public-nav">
                  <Link href="/gallery" style={navStyle()}>
                    Galleries
                  </Link>
                  <Link href="/about" style={navStyle()}>
                    About
                  </Link>
                  <Link href="/contact" style={navStyle()}>
                    Contact
                  </Link>
                  <CartButton color="var(--color-primary)" />
                  <Link href="/admin" style={{ ...navStyle(), opacity: 0.5 }}>
                    Admin
                  </Link>
                </nav>
              </header>
            )}

            <div>
              <main>{children}</main>

              <footer className="public-footer">
                <span>© {new Date().getFullYear()} {theme.artistName}</span>
                <span style={{ opacity: 0.7 }}>Prints by Artbox Printing</span>
              </footer>

              <div className="theme-switcher">
                <span className="theme-switcher-label">Demo · same content, different feeling:</span>
                <div className="theme-switcher-links">
                  {themeLinks.map((link) => {
                    const isActive = link.preset === theme.preset
                    return (
                      <a
                        key={link.preset}
                        href={link.url}
                        className={
                          isActive
                            ? 'theme-switcher-link theme-switcher-link--active'
                            : 'theme-switcher-link'
                        }
                      >
                        <span className="theme-switcher-link-name">{link.label}</span>
                        <span className="theme-switcher-link-tagline">{link.tagline}</span>
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </CartProviderWrapper>
      </body>
    </html>
  )
}

function navStyle(): React.CSSProperties {
  return {
    color: 'var(--color-primary)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    letterSpacing: 0.3,
  }
}
