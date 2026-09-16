import config from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import GalleryGrid from '@/components/GalleryGrid'
import { getTheme, MULTI_SITE, resolveSite, withSite } from '@/lib/site'

export const revalidate = 300
// Pre-render known galleries at build time; render new ones on-demand and
// cache them after.
export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config })
    const galleries = await payload.find({
      collection: 'galleries',
      where: { isPublished: { equals: true } },
      limit: 100,
      depth: 0,
    })
    return galleries.docs.flatMap((g) => {
      const row = g as { slug?: string; site?: string | null }
      const siteKey = MULTI_SITE ? row.site : resolveSite(undefined).key
      return siteKey && row.slug ? [{ site: siteKey, slug: row.slug }] : []
    })
  } catch {
    // DB unreachable at build time — fall back to fully on-demand rendering.
    return []
  }
}

const PER_PAGE = 60

type Args = {
  params: Promise<{ site: string; slug: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function GalleryDetail({ params, searchParams }: Args) {
  const { site: siteParam, slug } = await params
  const site = resolveSite(siteParam)
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const payload = await getPayload({ config })

  const gallery = (
    await payload.find({
      collection: 'galleries',
      where: withSite(site, {
        and: [{ slug: { equals: slug } }, { isPublished: { equals: true } }],
      }),
      limit: 1,
      depth: 1,
    })
  ).docs[0]

  if (!gallery) notFound()

  const theme = getTheme(site)

  const artworks = await payload.find({
    collection: 'artworks',
    where: {
      and: [{ gallery: { equals: gallery.id } }, { isPublished: { equals: true } }],
    },
    // The route map (travel) is a journey, so it follows sortOrder strictly.
    // Other modes float featured pieces first (e.g. the magazine 2×2 slots).
    sort: theme.galleryGridMode === 'route' ? 'sortOrder' : ['-isFeatured', 'sortOrder'],
    limit: PER_PAGE,
    page,
    depth: 1,
  })

  const totalPages = artworks.totalPages || 1
  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <section style={{ padding: '64px 32px', maxWidth: 1280, margin: '0 auto' }}>
      <Link href="/gallery" style={{ color: 'var(--color-secondary)', fontSize: '0.9rem', textDecoration: 'none' }}>
        ← All galleries
      </Link>

      <h1 style={{ fontSize: '2rem', fontWeight: 500, marginTop: 16, marginBottom: 8 }}>
        {gallery.name}
      </h1>
      {gallery.description ? (
        <p style={{ color: 'var(--color-secondary)', marginBottom: 32, maxWidth: 600 }}>{gallery.description}</p>
      ) : null}

      <GalleryGrid
        artworks={artworks.docs.map((a) => {
          const ax = a as {
            imageUrl?: string
            isLimitedEdition?: boolean
            editionSize?: number | null
            editionsRemaining?: number | null
          }
          return {
            id: a.id,
            slug: a.slug as string,
            title: a.title as string,
            imageUrl: ax.imageUrl,
            year: a.year as number | null | undefined,
            location: a.location as string | null | undefined,
            description: a.description as string | null | undefined,
            lat: a.lat as number | null | undefined,
            lng: a.lng as number | null | undefined,
            isLimitedEdition: ax.isLimitedEdition,
            editionSize: ax.editionSize,
            editionsRemaining: ax.editionsRemaining,
          }
        })}
        mode={theme.galleryGridMode}
        accent={theme.colorAccent}
        mapImageUrl={(gallery as { mapImageUrl?: string | null }).mapImageUrl ?? undefined}
      />

      {totalPages > 1 ? (
        <nav
          aria-label="Gallery pagination"
          style={{
            marginTop: 48,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            color: 'var(--color-secondary)',
            fontSize: '0.9rem',
          }}
        >
          {hasPrev ? (
            <Link
              href={page === 2 ? `/gallery/${slug}` : `/gallery/${slug}?page=${page - 1}`}
              style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
            >
              ← Previous
            </Link>
          ) : (
            <span style={{ opacity: 0.4 }}>← Previous</span>
          )}
          <span>
            Page {page} of {totalPages} · {artworks.totalDocs} works
          </span>
          {hasNext ? (
            <Link
              href={`/gallery/${slug}?page=${page + 1}`}
              style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
            >
              Next →
            </Link>
          ) : (
            <span style={{ opacity: 0.4 }}>Next →</span>
          )}
        </nav>
      ) : null}
    </section>
  )
}
