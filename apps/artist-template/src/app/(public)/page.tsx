import config from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'

import { getArtistBrand } from '@/lib/artist-config'
import { getTheme } from '@/lib/themes'

// Cache rendered pages for 5 minutes. CMS edits propagate within that window
// — fine for a gallery site where new work goes up rarely. Big win over
// force-dynamic: no Neon cold-start on every visit.
export const revalidate = 300

export default async function HomePage() {
  const brand = getArtistBrand()
  const theme = getTheme()
  const payload = await getPayload({ config })

  const galleries = await payload.find({
    collection: 'galleries',
    where: { isPublished: { equals: true } },
    sort: 'sortOrder',
    limit: 6,
    depth: 1,
  })

  // Editorial themes use a featured artwork as a full-bleed hero with title
  // overlay. Pull one promoted piece to back the hero.
  const heroArtwork =
    theme.homeLayout === 'hero'
      ? (
          await payload.find({
            collection: 'artworks',
            where: { isPublished: { equals: true } },
            sort: '-updatedAt',
            limit: 1,
            depth: 0,
          })
        ).docs[0]
      : null

  return (
    <div>
      {theme.homeLayout === 'hero' && heroArtwork ? (
        <HeroBanner
          imageUrl={(heroArtwork as { imageUrl?: string }).imageUrl ?? ''}
          artistName={brand.artistName}
          tagline={brand.tagline}
        />
      ) : theme.headerLayout === 'sidebar' ? (
        // Sidebar layouts already show the artist's name + tagline in the
        // left rail, so the home page skips its centered hero block entirely.
        <div style={{ paddingTop: 64 }} />
      ) : (
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
          <p style={{ fontSize: '1.15rem', color: 'var(--color-secondary)', marginTop: 16 }}>
            {brand.tagline}
          </p>
        </section>
      )}

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
          {galleries.docs.map((g, i) => {
            const cover = (g as { coverImageUrl?: string }).coverImageUrl
            // First two cards above the fold get priority for LCP.
            const isAboveFold = i < 2
            return (
              <Link
                key={g.id}
                href={`/gallery/${g.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '4 / 3',
                    background:
                      'linear-gradient(135deg, #e8e6df 0%, #d6d3c8 100%)',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  {cover ? (
                    <Image
                      src={cover}
                      alt={g.name as string}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                      priority={isAboveFold}
                    />
                  ) : null}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 500, marginTop: 16, marginBottom: 4, overflowWrap: 'anywhere' }}>
                  {g.name}
                </h3>
                {g.description ? (
                  <p style={{ color: 'var(--color-secondary)', margin: 0, fontSize: '0.95rem', overflowWrap: 'anywhere' }}>
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

function HeroBanner({
  imageUrl,
  artistName,
  tagline,
}: {
  imageUrl: string
  artistName: string
  tagline: string
}) {
  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        height: 'min(80vh, 720px)',
        overflow: 'hidden',
        marginBottom: 80,
      }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={artistName}
          fill
          sizes="100vw"
          style={{ objectFit: 'cover' }}
          priority
        />
      ) : null}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.45) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0 6vw 6vh',
          color: '#fff',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--weight-heading)' as unknown as number,
            letterSpacing: 'var(--tracking-heading)',
            fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
            lineHeight: 1.05,
            margin: 0,
            textShadow: '0 2px 24px rgba(0,0,0,0.35)',
          }}
        >
          {artistName}
        </h1>
        {tagline ? (
          <p
            style={{
              fontSize: 'clamp(1rem, 1.6vw, 1.3rem)',
              marginTop: 16,
              maxWidth: 640,
              opacity: 0.92,
              textShadow: '0 2px 12px rgba(0,0,0,0.4)',
            }}
          >
            {tagline}
          </p>
        ) : null}
      </div>
    </section>
  )
}
