import config from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

type Args = { params: Promise<{ slug: string }> }

export default async function GalleryDetail({ params }: Args) {
  const { slug } = await params
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
    limit: 100,
    depth: 1,
  })

  return (
    <section style={{ padding: '64px 32px', maxWidth: 1280, margin: '0 auto' }}>
      <Link href="/gallery" style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.9rem', textDecoration: 'none' }}>
        ← All galleries
      </Link>

      <h1 style={{ fontSize: '2rem', fontWeight: 500, marginTop: 16, marginBottom: 8 }}>
        {gallery.name}
      </h1>
      {gallery.description ? (
        <p style={{ color: 'rgba(0,0,0,0.6)', marginBottom: 32, maxWidth: 600 }}>{gallery.description}</p>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 24,
          marginTop: 32,
        }}
      >
        {artworks.docs.map((a) => {
          const url = (a as { imageUrl?: string }).imageUrl
          return (
            <Link
              key={a.id}
              href={`/artwork/${a.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  aspectRatio: '1 / 1',
                  background: url
                    ? `url(${url}) center/cover`
                    : 'linear-gradient(135deg, #e8e6df 0%, #d6d3c8 100%)',
                  borderRadius: 2,
                }}
              />
              <h3 style={{ fontSize: '1rem', fontWeight: 500, marginTop: 10, marginBottom: 0, overflowWrap: 'anywhere' }}>
                {a.title}
              </h3>
              {a.year ? (
                <p style={{ color: 'rgba(0,0,0,0.5)', margin: 0, fontSize: '0.85rem' }}>{a.year}</p>
              ) : null}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
