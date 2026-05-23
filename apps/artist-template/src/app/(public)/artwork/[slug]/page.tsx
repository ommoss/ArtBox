import config from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import {
  filterTemplates,
  type ArtworkOverrides,
  type CatalogSettings,
} from '@/lib/catalog-filter'
import { fetchTemplates, fulfillmentConfigured } from '@/lib/fulfillment-client'

import ArtworkBuilder from './ArtworkBuilder'

export const revalidate = 300
export const dynamicParams = true

// Cap build-time pre-render to a recent subset. At catalog sizes of 10k+ a
// blanket pre-render would blow past Vercel's build budget; instead we pre-
// render the latest few dozen so the most likely landing pages are instant,
// and let `dynamicParams: true` handle the long tail on first hit (cached
// after) via ISR.
const PRERENDER_LIMIT = 50

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config })
    const artworks = await payload.find({
      collection: 'artworks',
      where: { isPublished: { equals: true } },
      sort: '-updatedAt',
      limit: PRERENDER_LIMIT,
      depth: 0,
    })
    return artworks.docs.map((a) => ({ slug: a.slug as string }))
  } catch {
    return []
  }
}

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
  const allTemplates = await fetchTemplates()
  const catalog = (await payload
    .findGlobal({ slug: 'catalog' })
    .catch(() => null)) as CatalogSettings | null
  const templates = filterTemplates(
    allTemplates,
    catalog,
    artwork as unknown as ArtworkOverrides,
  )

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
        <EditionBadge
          isLimited={Boolean((artwork as { isLimitedEdition?: boolean }).isLimitedEdition)}
          size={(artwork as { editionSize?: number | null }).editionSize ?? null}
          remaining={(artwork as { editionsRemaining?: number | null }).editionsRemaining ?? null}
        />
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
          soldOut={
            Boolean((artwork as { isLimitedEdition?: boolean }).isLimitedEdition) &&
            ((artwork as { editionsRemaining?: number | null }).editionsRemaining ?? 0) <= 0
          }
        />
      ) : (
        <p style={{ color: 'var(--color-secondary)' }}>This artwork has no image attached.</p>
      )}
    </section>
  )
}

function EditionBadge({
  isLimited,
  size,
  remaining,
}: {
  isLimited: boolean
  size: number | null
  remaining: number | null
}) {
  if (!isLimited || !size) return null
  const isSoldOut = (remaining ?? 0) <= 0
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
        padding: '4px 12px',
        background: isSoldOut ? 'var(--color-secondary)' : 'var(--color-accent)',
        color: 'var(--color-bg)',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        fontWeight: 500,
        borderRadius: 2,
      }}
    >
      {isSoldOut
        ? `Sold out · edition of ${size}`
        : `${remaining} of ${size} remaining`}
    </div>
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
