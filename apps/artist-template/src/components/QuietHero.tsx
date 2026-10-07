import Link from 'next/link'

// Home hero for the wabi-sabi preset. One photograph at its own proportions,
// set off-centre with a wide margin; the name and a few lines of text sit low
// on the far side, and a short vertical line of text runs down the edge.
// Plain <img>: external URLs carry no dimensions and the native aspect ratio
// is the point.

export default function QuietHero({
  artistName,
  tagline,
  piece,
  pieceCount,
}: {
  artistName: string
  tagline: string
  piece: { slug: string; title: string; imageUrl: string; location?: string | null; year?: number | null }
  pieceCount: number
}) {
  const where = [piece.location, piece.year].filter(Boolean).join(', ')
  return (
    <section className="qh">
      <style>{`
        .qh {
          max-width: var(--max-width); margin: 0 auto;
          padding: clamp(48px, 9vh, 112px) var(--page-padding) 24px;
          display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 4fr) 28px;
          gap: clamp(32px, 6vw, 88px); align-items: end;
        }
        .qh__figure { margin: 0; }
        .qh__figure img {
          display: block; width: 100%; height: auto; max-height: 76vh; object-fit: contain;
          object-position: left bottom; border-radius: var(--image-radius);
        }
        .qh__figure figcaption {
          margin-top: 14px; font-size: 0.82rem; color: var(--color-secondary); letter-spacing: 0.04em;
        }
        .qh__text { padding-bottom: 40px; }
        .qh__text h1 {
          font-family: var(--font-heading); font-weight: var(--weight-heading);
          letter-spacing: var(--tracking-heading);
          font-size: clamp(1.7rem, 3vw, 2.5rem); line-height: 1.25; margin: 0 0 18px;
        }
        .qh__text p { margin: 0 0 28px; color: var(--color-secondary); line-height: 1.9; font-weight: 300; }
        .qh__text a {
          color: var(--color-primary); text-decoration: none; font-size: 0.92rem; letter-spacing: 0.06em;
          padding-bottom: 4px; border-bottom: 1px solid var(--color-accent);
        }
        .qh__rule { width: 40px; height: 1px; background: var(--color-accent); margin: 0 0 22px; }
        .qh__vertical {
          writing-mode: vertical-rl; align-self: start; justify-self: end;
          font-size: 0.75rem; letter-spacing: 0.32em; color: var(--color-secondary); white-space: nowrap;
        }
        @media (max-width: 820px) {
          .qh { grid-template-columns: 1fr; gap: 28px; padding-top: 32px; }
          .qh__vertical { display: none; }
          .qh__text { padding-bottom: 0; }
        }
      `}</style>
      <Link href={`/artwork/${piece.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <figure className="qh__figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={piece.imageUrl} alt={piece.title} />
          <figcaption>
            {piece.title}
            {where ? ` · ${where}` : ''}
          </figcaption>
        </figure>
      </Link>
      <div className="qh__text">
        <div className="qh__rule" aria-hidden />
        <h1>{artistName}</h1>
        <p>{tagline}. Photographs printed slowly, on paper made to last.</p>
        <Link href="/gallery">Enter the galleries</Link>
      </div>
      <span className="qh__vertical" aria-hidden>
        {pieceCount} photographs · printed to order
      </span>
    </section>
  )
}
