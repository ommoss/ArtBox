import { getArtistBrand } from '@/lib/artist-config'

import ContactForm from './ContactForm'

export default function ContactPage() {
  const brand = getArtistBrand()
  const handle = brand.artistName.toLowerCase().replace(/\s+/g, '')

  return (
    <section style={{ padding: '64px 32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 500, marginTop: 0, marginBottom: 8 }}>
        Contact
      </h1>
      <p style={{ color: 'var(--color-secondary)', marginTop: 0, marginBottom: 32, maxWidth: 560 }}>
        For commissions, licensing, exhibitions, or press inquiries — drop a message below or
        get in touch directly.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 48,
          alignItems: 'start',
        }}
      >
        <ContactForm />

        <div style={{ fontSize: '0.95rem', lineHeight: 1.8 }}>
          <h3
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              marginTop: 0,
              marginBottom: 8,
              color: 'var(--color-secondary)',
            }}
          >
            Direct
          </h3>
          <a
            href={`mailto:hello@${handle}.com`}
            style={{ color: 'var(--color-primary)', textDecoration: 'none', borderBottom: '1px solid var(--color-border)' }}
          >
            hello@{handle}.com
          </a>

          <h3
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              marginTop: 32,
              marginBottom: 8,
              color: 'var(--color-secondary)',
            }}
          >
            Social
          </h3>
          <p style={{ margin: 0 }}>
            Instagram:{' '}
            <a
              href={`https://instagram.com/${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-primary)', textDecoration: 'none', borderBottom: '1px solid var(--color-border)' }}
            >
              @{handle}
            </a>
          </p>

          <h3
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              marginTop: 32,
              marginBottom: 8,
              color: 'var(--color-secondary)',
            }}
          >
            Studio
          </h3>
          <p style={{ margin: 0, color: 'var(--color-primary)' }}>
            Vancouver Island, British Columbia
          </p>

          <h3
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              marginTop: 32,
              marginBottom: 8,
              color: 'var(--color-secondary)',
            }}
          >
            Print fulfillment
          </h3>
          <p style={{ margin: 0, color: 'var(--color-primary)' }}>
            Orders are produced and shipped by{' '}
            <a
              href="https://artboxprinting.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-primary)', textDecoration: 'none', borderBottom: '1px solid var(--color-border)' }}
            >
              Artbox Printing
            </a>{' '}
            in Victoria, BC.
          </p>
        </div>
      </div>

      <p
        style={{
          marginTop: 64,
          color: 'var(--color-secondary)',
          fontSize: '0.85rem',
          fontStyle: 'italic',
          borderTop: '1px solid var(--color-border)',
          paddingTop: 24,
        }}
      >
        Placeholder content. Real email, social handles, and the form&apos;s recipient address
        get wired in when we set up your site.
      </p>
    </section>
  )
}
