import Image from 'next/image'
import Link from 'next/link'

import type { GalleryGridMode } from '@/lib/themes'

type Artwork = {
  id: string | number
  slug?: string | null
  title?: string | null
  imageUrl?: string | null
  year?: number | null
  location?: string | null
}

type Props = {
  artworks: Artwork[]
  mode: GalleryGridMode
}

// Deterministic small rotation per index for the album mode. Same artwork
// always rotates the same way — feels intentional, not random.
function albumRotation(i: number): number {
  const seeds = [-1.2, 0.8, -0.6, 1.6, -1.8, 0.4, -1.0, 1.2]
  return seeds[i % seeds.length]
}

// Magazine layout: every Nth tile claims 2x2 to break the rhythm. The pattern
// is deterministic so above-the-fold tiles are consistent across renders.
function magazineSpan(i: number): { col: number; row: number } {
  // i % 7 == 0  → 2x2 feature (every 7 tiles, 1 feature)
  // i % 11 == 4 → 1x2 tall portrait
  if (i % 7 === 0) return { col: 2, row: 2 }
  if (i % 11 === 4) return { col: 1, row: 2 }
  return { col: 1, row: 1 }
}

export default function GalleryGrid({ artworks, mode }: Props) {
  if (mode === 'magazine') {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridAutoRows: '220px',
          gridAutoFlow: 'dense',
          gap: 16,
          marginTop: 32,
        }}
      >
        {artworks.map((a, i) => {
          const span = magazineSpan(i)
          const isAboveFold = i < 4
          const sizes =
            span.col === 2
              ? '(max-width: 768px) 100vw, 50vw'
              : '(max-width: 768px) 50vw, 25vw'
          return (
            <Link
              key={a.id}
              href={`/artwork/${a.slug}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                gridColumn: `span ${span.col}`,
                gridRow: `span ${span.row}`,
                position: 'relative',
                overflow: 'hidden',
                background: 'var(--color-surface)',
              }}
            >
              {a.imageUrl ? (
                <Image
                  src={a.imageUrl}
                  alt={a.title ?? ''}
                  fill
                  sizes={sizes}
                  style={{ objectFit: 'cover' }}
                  priority={isAboveFold}
                />
              ) : null}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: '40px 16px 14px',
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))',
                  color: '#fff',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                <div style={{ fontSize: '0.95rem', lineHeight: 1.2 }}>
                  {a.title}
                </div>
                {a.year ? (
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                    {a.year}
                  </div>
                ) : null}
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  if (mode === 'album') {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 36,
          marginTop: 40,
          paddingTop: 8,
        }}
      >
        {artworks.map((a, i) => {
          const rot = albumRotation(i)
          const isAboveFold = i < 4
          return (
            <Link
              key={a.id}
              href={`/artwork/${a.slug}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                transform: `rotate(${rot}deg)`,
                transition: 'transform 0.2s ease',
              }}
              className="album-card"
            >
              <div
                style={{
                  background: 'var(--color-surface)',
                  padding: '12px 12px 16px',
                  boxShadow: 'var(--image-shadow)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    background:
                      'linear-gradient(135deg, #e8e6df 0%, #d6d3c8 100%)',
                    overflow: 'hidden',
                    marginBottom: 12,
                  }}
                >
                  {a.imageUrl ? (
                    <Image
                      src={a.imageUrl}
                      alt={a.title ?? ''}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      style={{ objectFit: 'cover' }}
                      priority={isAboveFold}
                    />
                  ) : null}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      overflowWrap: 'anywhere',
                      flex: 1,
                    }}
                  >
                    {a.title}
                  </span>
                  {a.year ? (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        letterSpacing: 1.5,
                        textTransform: 'uppercase',
                        color: 'var(--color-secondary)',
                        border: '1px solid var(--color-border)',
                        padding: '2px 8px',
                        marginLeft: 8,
                      }}
                    >
                      {a.year}
                    </span>
                  ) : null}
                </div>
                {a.location ? (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-secondary)',
                      marginTop: 4,
                      fontStyle: 'italic',
                    }}
                  >
                    {a.location}
                  </div>
                ) : null}
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  // Uniform (default) — current minimal/atmospheric look
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 24,
        marginTop: 32,
      }}
    >
      {artworks.map((a, i) => {
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
                background:
                  'linear-gradient(135deg, #e8e6df 0%, #d6d3c8 100%)',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {a.imageUrl ? (
                <Image
                  src={a.imageUrl}
                  alt={a.title ?? ''}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
                  style={{ objectFit: 'cover' }}
                  priority={isAboveFold}
                />
              ) : null}
            </div>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 500,
                marginTop: 10,
                marginBottom: 0,
                overflowWrap: 'anywhere',
              }}
            >
              {a.title}
            </h3>
            {a.year ? (
              <p style={{ color: 'var(--color-secondary)', margin: 0, fontSize: '0.85rem' }}>
                {a.year}
              </p>
            ) : null}
          </Link>
        )
      })}
    </div>
  )
}
