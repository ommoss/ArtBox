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
          <header
            style={{
              padding: '20px 32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}
          >
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
            <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
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
              fontSize: '0.85rem',
              textAlign: 'center',
            }}
          >
            © {new Date().getFullYear()} {brand.artistName}. Prints fulfilled by Artbox Printing.
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
