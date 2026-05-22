import config from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

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
    return galleries.docs.map((g) => ({ slug: g.slug as string }))
  } catch {
    // DB unreachable at build time — fall back to fully on-demand rendering.
    return []
  }
}

const PER_PAGE = 60

type Args = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function GalleryDetail({ params, searchParams }: Args) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const payload = await getPayload({ config })

  const gallery = (
    await payload.find({
      collection: 'galleries',
      where: {
        and: [{ slug: { equals: slug } }, { isPublished: { equals: true } }],
      },
      limit: 1,
      depth: 1,
    })
  ).docs[0]

  if (!gallery) notFound()

  const artworks = await payload.find({
    collection: 'artworks',
    where: {
      and: [{ gallery: { equals: gallery.id } }, { isPublished: { equals: true } }],
    },
    sort: 'sortOrder',
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 24,
          marginTop: 32,
        }}
      >
        {artworks.docs.map((a, i) => {
          const url = (a as { imageUrl?: string }).imageUrl
          const isAboveFold = i < 4
          return (
            <Link
              key={a.id}
              href={`/artwork/${a.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '1 / 1',
                  background: 'linear-gradient(135deg, #e8e6df 0%, #d6d3c8 100%)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                {url ? (
                  <Image
                    src={url}
                    alt={a.title as string}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
                    style={{ objectFit: 'cover' }}
                    priority={isAboveFold}
                  />
                ) : null}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 500, marginTop: 10, marginBottom: 0, overflowWrap: 'anywhere' }}>
                {a.title}
              </h3>
              {a.year ? (
                <p style={{ color: 'var(--color-secondary)', margin: 0, fontSize: '0.85rem' }}>{a.year}</p>
              ) : null}
            </Link>
          )
        })}
      </div>

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
