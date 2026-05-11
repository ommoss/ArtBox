import config from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { fetchTemplates, fulfillmentConfigured } from '@/lib/fulfillment-client'

import ArtworkBuilder from './ArtworkBuilder'

export const revalidate = 300

type Args = { params: Promise<{ slug: string }> }

export default async function ArtworkDetail({ params }: Args) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const artwork = (
    await payload.find({
      collection: 'artworks',
      where: {
        and: [{ slug: { equals: slug } }, { isPublished: { equals: true } }],
      },
      limit: 1,
      depth: 2,
    })
  ).docs[0]

  if (!artwork) notFound()

  const gallery = artwork.gallery as { name?: string; slug?: string } | undefined
  const imageUrl = (artwork as { imageUrl?: string }).imageUrl ?? ''
  const templates = await fetchTemplates()

  return (
    <section style={{ padding: '48px 32px', maxWidth: 1280, margin: '0 auto' }}>
      <Link
        href={gallery?.slug ? `/gallery/${gallery.slug}` : '/gallery'}
        style={{ color: 'var(--color-secondary)', fontSize: '0.9rem', textDecoration: 'none' }}
      >
        ← {gallery?.name ?? 'Galleries'}
      </Link>

      <header style={{ marginTop: 16, marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 500, marginBottom: 6, overflowWrap: 'anywhere' }}>{artwork.title}</h1>
        <p style={{ color: 'var(--color-secondary)', margin: 0, fontSize: '0.95rem' }}>
          {[artwork.year, artwork.location].filter(Boolean).join(' · ')}
        </p>
        {artwork.description ? (
          <p style={{ marginTop: 16, maxWidth: 640, lineHeight: 1.6 }}>{artwork.description}</p>
        ) : null}
      </header>

      {!fulfillmentConfigured ? (
        <FulfillmentNotConfiguredBanner />
      ) : null}

      {imageUrl ? (
        <ArtworkBuilder
          templates={templates}
          imageUrl={imageUrl}
          imageTitle={artwork.title}
          artworkSlug={artwork.slug as string}
        />
      ) : (
        <p style={{ color: 'var(--color-secondary)' }}>This artwork has no image attached.</p>
      )}
    </section>
  )
}

function FulfillmentNotConfiguredBanner() {
  return (
    <div
      style={{
        padding: 16,
        background: '#fff7e6',
        border: '1px solid #f1c97e',
        borderRadius: 4,
        marginBottom: 24,
        fontSize: '0.9rem',
        color: '#7a5a14',
      }}
    >
      <strong>Builder not connected.</strong> Set{' '}
      <code>FULFILLMENT_API_URL</code> and <code>FULFILLMENT_API_KEY</code> in{' '}
      <code>apps/artist-template/.env</code> to enable the product builder. Get the
      key by creating an Artist record in the Artbox fulfillment platform admin.
    </div>
  )
}
