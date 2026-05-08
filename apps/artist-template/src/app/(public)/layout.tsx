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

  return (
    <html lang="en">
      <body
        style={{
          ...cssVars,
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--base-font-size)',
          margin: 0,
          background: 'var(--color-bg)',
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
          `}</style>
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
