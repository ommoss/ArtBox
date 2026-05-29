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
  isLimitedEdition?: boolean | null
  editionSize?: number | null
  editionsRemaining?: number | null
}

type Props = {
  artworks: Artwork[]
  mode: GalleryGridMode
}

type EditionState =
  | { kind: 'none' }
  | { kind: 'available'; size: number }
  | { kind: 'low'; size: number; remaining: number }
  | { kind: 'soldOut'; size: number }

function editionStateFor(a: Artwork): EditionState {
  if (!a.isLimitedEdition || !a.editionSize) return { kind: 'none' }
  const remaining = a.editionsRemaining ?? a.editionSize
  if (remaining <= 0) return { kind: 'soldOut', size: a.editionSize }
  // Low when 25% or 3-or-fewer remaining, whichever is more permissive.
  const lowThreshold = Math.max(3, Math.floor(a.editionSize * 0.25))
  if (remaining <= lowThreshold) {
    return { kind: 'low', size: a.editionSize, remaining }
  }
  return { kind: 'available', size: a.editionSize }
}

function EditionMarker({ state }: { state: EditionState }) {
  if (state.kind === 'none') return null

  if (state.kind === 'soldOut') {
    return (
      <>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'saturate(0)',
            WebkitBackdropFilter: 'saturate(0)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '6px 16px',
            background: 'rgba(0,0,0,0.78)',
            color: '#fff',
            fontSize: '0.75rem',
            letterSpacing: 2,
            textTransform: 'uppercase',
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.25)',
            pointerEvents: 'none',
          }}
        >
          Sold out
        </div>
      </>
    )
  }

  const isLow = state.kind === 'low'
  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        left: 10,
        padding: '4px 10px',
        background: isLow ? 'var(--color-accent)' : 'rgba(0,0,0,0.72)',
        color: '#fff',
        fontSize: '0.7rem',
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontWeight: 600,
        borderRadius: 2,
        pointerEvents: 'none',
        boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
      }}
    >
      {isLow ? `Only ${state.remaining} left` : `Edition of ${state.size}`}
    </div>
  )
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
          const edition = editionStateFor(a)
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
              <EditionMarker state={edition} />
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
          const edition = editionStateFor(a)
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
                  <EditionMarker state={edition} />
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

  if (mode === 'cinematic') {
    // Wide-aspect, large-tile layout for marine/sailing work: a 1–2 column
    // grid of 3:2 landscape images shown big, edge-to-edge (radius/shadow come
    // from the theme, which is 0/none for sailing), with a clean caption below.
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(560px, 1fr))',
          gap: 40,
          marginTop: 32,
        }}
      >
        {artworks.map((a, i) => {
          const isAboveFold = i < 2
          const edition = editionStateFor(a)
          return (
            <Link
              key={a.id}
              href={`/artwork/${a.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '3 / 2',
                  background:
                    'linear-gradient(135deg, #dfe6e8 0%, #c7d2d6 100%)',
                  borderRadius: 'var(--image-radius)',
                  overflow: 'hidden',
                }}
              >
                {a.imageUrl ? (
                  <Image
                    src={a.imageUrl}
                    alt={a.title ?? ''}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: 'cover' }}
                    priority={isAboveFold}
                  />
                ) : null}
                <EditionMarker state={edition} />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginTop: 12,
                  gap: 12,
                }}
              >
                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 500,
                    margin: 0,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {a.title}
                </h3>
                {a.location ? (
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--color-secondary)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {a.location}
                  </span>
                ) : null}
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  // Uniform (default) — gallery-wall look used by the fine-art preset
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
        const edition = editionStateFor(a)
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
              <EditionMarker state={edition} />
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
