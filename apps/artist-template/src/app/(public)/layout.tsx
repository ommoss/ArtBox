import Link from 'next/link'
import React from 'react'

import CartButton from '@/components/CartButton'
import CartProviderWrapper from '@/components/CartProviderWrapper'
import { getArtistBrand } from '@/lib/artist-config'

export const metadata = {
  title: 'Artist Site',
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const brand = getArtistBrand()

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
          margin: 0,
          background: brand.background,
          color: brand.primary,
          ['--brand-primary' as string]: brand.primary,
          ['--brand-accent' as string]: brand.accent,
          ['--brand-bg' as string]: brand.background,
        }}
      >
        <CartProviderWrapper>
          <style>{`
            .public-header {
              padding: 20px 32px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              flex-wrap: wrap;
              gap: 16px;
              border-bottom: 1px solid rgba(0,0,0,0.06);
            }
            .public-nav {
              display: flex;
              gap: 24px;
              align-items: center;
              flex-wrap: wrap;
            }
            .checkout-grid {
              display: grid;
              grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
              gap: 48px;
              padding: 48px 32px;
              max-width: 1100px;
              margin: 0 auto;
            }
            @media (max-width: 768px) {
              .public-header { padding: 16px 20px; gap: 12px; }
              .public-nav { gap: 14px; }
              .checkout-grid {
                grid-template-columns: 1fr;
                gap: 32px;
                padding: 32px 20px;
              }
            }
          `}</style>
          <header className="public-header">
            <Link
              href="/"
              style={{
                color: brand.primary,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
                letterSpacing: 0.3,
              }}
            >
              {brand.artistName}
            </Link>
            <nav className="public-nav">
              <Link href="/gallery" style={navStyle(brand.primary)}>
                Galleries
              </Link>
              <Link href="/about" style={navStyle(brand.primary)}>
                About
              </Link>
              <Link href="/contact" style={navStyle(brand.primary)}>
                Contact
              </Link>
              <CartButton color={brand.primary} />
              <Link href="/admin" style={{ ...navStyle(brand.primary), opacity: 0.5 }}>
                Admin
              </Link>
            </nav>
          </header>

          <main>{children}</main>

          <footer
            style={{
              marginTop: 96,
              padding: '32px',
              borderTop: '1px solid rgba(0,0,0,0.06)',
              color: 'rgba(0,0,0,0.5)',
              fontSize: '0.8rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <span>© {new Date().getFullYear()} {brand.artistName}</span>
            <span style={{ opacity: 0.7 }}>Prints by Artbox Printing</span>
          </footer>
        </CartProviderWrapper>
      </body>
    </html>
  )
}

function navStyle(color: string): React.CSSProperties {
  return {
    color,
    textDecoration: 'none',
    fontSize: '0.95rem',
    letterSpacing: 0.3,
  }
}
