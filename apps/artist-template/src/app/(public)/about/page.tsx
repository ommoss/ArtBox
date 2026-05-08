import Image from 'next/image'

import { getArtistBrand } from '@/lib/artist-config'

const PORTRAIT_URL =
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'

export default function AboutPage() {
  const brand = getArtistBrand()

  return (
    <section style={{ padding: '64px 32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 500, marginTop: 0, marginBottom: 32 }}>
        About {brand.artistName}
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 48,
          alignItems: 'start',
        }}
      >
        <div
          style={{
            position: 'relative',
            aspectRatio: '4 / 5',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <Image
            src={PORTRAIT_URL}
            alt={`Portrait of ${brand.artistName}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>

        <div style={{ lineHeight: 1.7, fontSize: '1.05rem' }}>
          <p style={{ marginTop: 0 }}>
            {brand.artistName} is a photographer working in the spaces between land and sea —
            long-form documentary work shaped by patience, weather, and a deep familiarity with
            place.
          </p>
          <p>
            Trained in [discipline] before turning to photography, [their] work has appeared in
            [Publications] and been exhibited at [Galleries]. [They] live and work on the west
            coast of Canada, often on assignment further afield.
          </p>
          <p>
            Prints are produced through Artbox Printing in Victoria, BC, on archival fine art
            paper and canvas with pigment inks rated to last 250+ years.
          </p>
        </div>
      </div>

      <h2
        style={{
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          color: 'var(--color-secondary)',
          marginTop: 64,
          marginBottom: 16,
        }}
      >
        Selected exhibitions
      </h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: 1.9 }}>
        <li><strong>2025</strong> · [Exhibition title], [Gallery / Institution], [City]</li>
        <li><strong>2024</strong> · [Exhibition title], [Gallery / Institution], [City]</li>
        <li><strong>2023</strong> · Group show, [Gallery / Institution], [City]</li>
      </ul>

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
        Placeholder content. The real bio, portrait, and exhibition list go here once we have
        them.
      </p>
    </section>
  )
}
