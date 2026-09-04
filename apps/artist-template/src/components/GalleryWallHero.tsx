import Link from 'next/link'

// Home hero for the fine-art preset: one piece on a dark wall, presented the
// way a limited-edition seller leads (Lumas, Yellowkorner) — headline about
// signed editions, the work itself carrying the page, an edition line and a
// single link into it. Plain <img> because remote URLs carry no dimensions
// and the piece must show at its native aspect ratio.

export default function GalleryWallHero({
  artistName,
  tagline,
  imageUrl,
  title,
  slug,
  editionSize,
}: {
  artistName: string
  tagline: string
  imageUrl: string
  title: string
  slug: string
  editionSize: number | null
}) {
  return (
    <section
      style={{
        padding: 'clamp(48px, 8vh, 96px) var(--page-padding) 24px',
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          margin: '0 0 14px',
          fontSize: '0.72rem',
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          color: 'var(--color-accent)',
        }}
      >
        {tagline}
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 'var(--weight-heading)' as unknown as number,
          letterSpacing: 'var(--tracking-heading)',
          fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
          lineHeight: 1.05,
          margin: '0 0 clamp(32px, 6vh, 64px)',
        }}
      >
        {artistName}
      </h1>

      <Link href={`/artwork/${slug}`} style={{ display: 'inline-block', textDecoration: 'none', color: 'inherit' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title}
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: 'min(64vh, 720px)',
            width: 'auto',
            height: 'auto',
            margin: '0 auto',
            borderRadius: 'var(--image-radius)',
            boxShadow: 'var(--image-shadow)',
            outline: '1px solid var(--color-border)',
          }}
        />
        <div
          style={{
            marginTop: 28,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'baseline',
            gap: 14,
            flexWrap: 'wrap',
            fontSize: '0.95rem',
          }}
        >
          <span style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic' }}>{title}</span>
          {editionSize ? (
            <span style={{ color: 'var(--color-secondary)' }}>Signed edition of {editionSize}</span>
          ) : null}
          <span style={{ color: 'var(--color-accent)', borderBottom: '1px solid currentColor' }}>
            View the edition
          </span>
        </div>
      </Link>
    </section>
  )
}
