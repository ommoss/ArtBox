import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

export default async function GalleriesIndex() {
  const payload = await getPayload({ config })
  const galleries = await payload.find({
    collection: 'galleries',
    where: { isPublished: { equals: true } },
    sort: 'sortOrder',
    limit: 50,
    depth: 1,
  })

  return (
    <section style={{ padding: '64px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 500, marginTop: 0 }}>Galleries</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 32,
          marginTop: 32,
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
                  background: cover ? `url(${cover}) center/cover` : '#ddd',
                  borderRadius: 4,
                }}
              />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginTop: 12, marginBottom: 4 }}>
                {g.name}
              </h3>
              {g.description ? (
                <p style={{ color: 'rgba(0,0,0,0.6)', margin: 0, fontSize: '0.9rem' }}>
                  {g.description}
                </p>
              ) : null}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
