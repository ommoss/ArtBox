import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

import { getArtistBrand } from '@/lib/artist-config'

// Galleries can be edited live in the CMS — render fresh per request.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const brand = getArtistBrand()
  const payload = await getPayload({ config })

  const galleries = await payload.find({
    collection: 'galleries',
    where: { isPublished: { equals: true } },
    sort: 'sortOrder',
    limit: 6,
    depth: 1,
  })

  return (
    <div>
      <section
        style={{
          padding: '96px 32px 64px',
          textAlign: 'center',
          maxWidth: 800,
          margin: '0 auto',
        }}
      >
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', margin: 0, fontWeight: 500, letterSpacing: -0.5 }}>
          {brand.artistName}
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'rgba(0,0,0,0.6)', marginTop: 16 }}>
          {brand.tagline}
        </p>
      </section>

      <section style={{ padding: '0 32px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600, marginBottom: 24 }}>
          Galleries
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 32,
          }}
        >
          {galleries.docs.map((g) => {
            const cover = (g as { coverImageUrl?: string }).coverImageUrl
            return (
              <Link
                key={g.id}
                href={`/gallery/${g.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  style={{
                    aspectRatio: '4 / 3',
                    background: cover
                      ? `url(${cover}) center/cover`
                      : 'linear-gradient(135deg, #e8e6df 0%, #d6d3c8 100%)',
                    borderRadius: 4,
                  }}
                />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 500, marginTop: 16, marginBottom: 4, overflowWrap: 'anywhere' }}>
                  {g.name}
                </h3>
                {g.description ? (
                  <p style={{ color: 'rgba(0,0,0,0.6)', margin: 0, fontSize: '0.95rem', overflowWrap: 'anywhere' }}>
                    {g.description}
                  </p>
                ) : null}
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
