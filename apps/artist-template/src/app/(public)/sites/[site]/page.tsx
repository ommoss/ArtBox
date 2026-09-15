import config from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'

import GalleryWallHero from '@/components/GalleryWallHero'
import GlobeHome, { type GalleryPin } from '@/components/GlobeHome'
import HeroCarousel from '@/components/HeroCarousel'
import JourneyHero from '@/components/JourneyHero'
import ServicesHome, { type GalleryCard } from '@/components/services/ServicesHome'
import { getArtistBrand } from '@/lib/artist-config'
import { getTheme, isDemoSite } from '@/lib/themes'

// Cache rendered pages for 5 minutes. CMS edits propagate within that window
// — fine for a gallery site where new work goes up rarely. Big win over
// force-dynamic: no Neon cold-start on every visit.
export const revalidate = 300

type ArtworkRow = {
  slug?: string
  title?: string | null
  imageUrl?: string
  location?: string | null
  year?: number | null
  isLimitedEdition?: boolean
  editionSize?: number | null
}

type GalleryRow = {
  id: string | number
  slug?: string
  name?: string
  description?: string | null
  coverImageUrl?: string | null
  lat?: number | null
  lng?: number | null
}

export default async function HomePage() {
  const brand = getArtistBrand()
  const theme = getTheme()
  const isDemo = isDemoSite()
  const payload = await getPayload({ config })

  const galleries = await payload.find({
    collection: 'galleries',
    where: { isPublished: { equals: true } },
    sort: 'sortOrder',
    limit: 6,
    depth: 1,
  })
  const galleryRows = galleries.docs as unknown as GalleryRow[]

  // One "lead" piece: explicitly featured first, then most recent. Used by the
  // single-piece heroes (lifestyle, art) and by the demo builder embed.
  const leadQuery = await payload.find({
    collection: 'artworks',
    where: { isPublished: { equals: true } },
    sort: ['-isFeatured', '-updatedAt'],
    limit: theme.homeLayout === 'carousel' ? 6 : 1,
    depth: 0,
  })
  const leadRows = leadQuery.docs as unknown as ArtworkRow[]
  const lead = leadRows[0]

  // Carousel (wildlife): several featured pieces rotating full-bleed, each
  // with its edition line + CTA.
  const carouselSlides = leadRows
    .map((d) => ({
      imageUrl: d.imageUrl ?? '',
      title: d.title ?? null,
      slug: d.slug ?? null,
      editionSize: d.isLimitedEdition ? (d.editionSize ?? null) : null,
    }))
    .filter((s) => s.imageUrl)

  // Globe pins (travel): each gallery at its coordinates. Galleries without
  // lat/lng are skipped on the globe but still appear in the grid below.
  const globePins: GalleryPin[] =
    theme.homeLayout === 'globe' || theme.homeLayout === 'journeys'
      ? galleryRows
          .filter((g) => typeof g.lat === 'number' && typeof g.lng === 'number' && !!g.slug)
          .map((g) => ({
            slug: g.slug as string,
            name: g.name ?? '',
            lat: g.lat as number,
            lng: g.lng as number,
            coverImageUrl: g.coverImageUrl ?? null,
          }))
      : []

  // Journey hero (travel): the first journey, captioned with the place and
  // year of its opening photograph.
  let journey: Parameters<typeof JourneyHero>[0]['gallery'] | null = null
  if (theme.homeLayout === 'journeys' && galleryRows[0]?.slug) {
    const g = galleryRows[0]
    const opener = await payload.find({
      collection: 'artworks',
      where: {
        and: [{ isPublished: { equals: true } }, { gallery: { equals: g.id } }],
      },
      sort: 'sortOrder',
      limit: 1,
      depth: 0,
    })
    const first = opener.docs[0] as unknown as ArtworkRow | undefined
    journey = {
      slug: g.slug as string,
      name: g.name ?? '',
      description: g.description ?? null,
      coverImageUrl: g.coverImageUrl ?? null,
      place: first?.location ?? null,
      year: first?.year ?? null,
    }
  }

  const galleryCards: GalleryCard[] = galleryRows.map((g) => ({
    id: g.id,
    slug: g.slug as string,
    name: g.name ?? '',
    description: g.description ?? null,
    coverImageUrl: g.coverImageUrl ?? null,
  }))

  const hero = (() => {
    switch (theme.homeLayout) {
      case 'carousel':
        return carouselSlides.length > 0 ? (
          <div className="site-hero" data-hero>
            <HeroCarousel slides={carouselSlides} artistName={brand.artistName} tagline={brand.tagline} />
          </div>
        ) : null
      case 'hero':
        return lead?.imageUrl ? (
          <div className="site-hero" data-hero>
            <HeroBanner
              imageUrl={lead.imageUrl}
              artistName={brand.artistName}
              tagline={brand.tagline}
              editionSize={lead.isLimitedEdition ? (lead.editionSize ?? null) : null}
            />
          </div>
        ) : null
      case 'gallery-wall':
        return lead?.imageUrl && lead.slug ? (
          <GalleryWallHero
            artistName={brand.artistName}
            tagline={brand.tagline}
            imageUrl={lead.imageUrl}
            title={lead.title ?? ''}
            slug={lead.slug}
            editionSize={lead.isLimitedEdition ? (lead.editionSize ?? null) : null}
          />
        ) : null
      case 'journeys':
        return journey ? (
          <div className="site-hero" data-hero>
            <JourneyHero artistName={brand.artistName} tagline={brand.tagline} gallery={journey} />
          </div>
        ) : null
      case 'globe':
        return globePins.length > 0 ? (
          <div className="site-hero" data-hero>
            <GlobeHome galleries={globePins} accent={theme.colorAccent} atmosphere={theme.colorAccent} />
          </div>
        ) : null
      default:
        return null
    }
  })()

  return (
    <div>
      {hero ?? (
        <section style={{ padding: '96px var(--page-padding) 64px', textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--weight-heading)' as unknown as number,
              letterSpacing: 'var(--tracking-heading)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              margin: 0,
            }}
          >
            {brand.artistName}
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--color-secondary)', marginTop: 16 }}>{brand.tagline}</p>
        </section>
      )}

      {theme.homeLayout === 'journeys' && globePins.length > 0 ? (
        <section style={{ padding: '64px var(--page-padding) 0', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
          <p style={{ margin: '0 0 6px', fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
            Browse by place
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--weight-heading)' as unknown as number,
              letterSpacing: 'var(--tracking-heading)',
              fontSize: 'clamp(1.6rem, 3vw, 2.3rem)',
              margin: '0 0 8px',
            }}
          >
            Every journey, pinned where it happened.
          </h2>
          <p style={{ margin: 0, color: 'var(--color-secondary)' }}>Spin the globe, hover a pin, click through to the trip.</p>
          <GlobeHome galleries={globePins} accent={theme.colorAccent} atmosphere={theme.colorAccent} />
        </section>
      ) : null}

      {isDemo ? (
        <ServicesHome
          theme={theme}
          galleries={galleryCards}
          builderImageUrl={
            lead?.imageUrl ||
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=75'
          }
          builderImageTitle={lead?.title || 'Featured work'}
        />
      ) : (
        <section style={{ padding: '0 var(--page-padding)', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600, marginBottom: 24 }}>
            Galleries
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))',
              gap: 32,
            }}
          >
            {galleryCards.map((g, i) => (
              <Link key={g.id} href={`/gallery/${g.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '4 / 3',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--image-radius)',
                    boxShadow: 'var(--image-shadow)',
                    overflow: 'hidden',
                  }}
                >
                  {g.coverImageUrl ? (
                    <Image
                      src={g.coverImageUrl}
                      alt={g.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                      priority={i < 2}
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
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function HeroBanner({
  imageUrl,
  artistName,
  tagline,
  editionSize,
}: {
  imageUrl: string
  artistName: string
  tagline: string
  editionSize: number | null
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
        <Image src={imageUrl} alt={artistName} fill sizes="100vw" style={{ objectFit: 'cover' }} priority />
      ) : null}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.45) 100%)',
        }}
      />
      {editionSize ? (
        <div
          style={{
            position: 'absolute',
            top: 24,
            right: 'var(--page-padding)',
            padding: '4px 12px',
            background: 'rgba(0,0,0,0.55)',
            color: '#fff',
            fontSize: '0.7rem',
            letterSpacing: 2,
            textTransform: 'uppercase',
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          Limited edition of {editionSize}
        </div>
      ) : null}
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
