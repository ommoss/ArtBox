import Image from 'next/image'
import Link from 'next/link'

// Home hero for the travel preset: the latest journey as a full-bleed cover
// with a "Place, Year" caption in the collection-row style the travel print
// sellers use (Jimmy Chin, McCurry). The globe moves below as "browse by place".

export default function JourneyHero({
  artistName,
  tagline,
  gallery,
}: {
  artistName: string
  tagline: string
  gallery: {
    slug: string
    name: string
    description?: string | null
    coverImageUrl?: string | null
    place?: string | null
    year?: number | null
  }
}) {
  const where = [gallery.place, gallery.year].filter(Boolean).join(', ')
  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        height: 'min(78vh, 760px)',
        overflow: 'hidden',
        background: 'var(--color-primary)',
      }}
    >
      {gallery.coverImageUrl ? (
        <Image
          src={gallery.coverImageUrl}
          alt={gallery.name}
          fill
          sizes="100vw"
          style={{ objectFit: 'cover' }}
          priority
        />
      ) : null}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(20,12,6,0.72) 0%, rgba(20,12,6,0.15) 55%, rgba(20,12,6,0) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0 var(--page-padding) 6vh',
          maxWidth: 'var(--max-width)',
          margin: '0 auto',
          color: '#fff',
        }}
      >
        <p style={{ margin: '0 0 10px', fontSize: '0.72rem', letterSpacing: '2.5px', textTransform: 'uppercase', opacity: 0.85 }}>
          {artistName} · {tagline}
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--weight-heading)' as unknown as number,
            letterSpacing: 'var(--tracking-heading)',
            fontSize: 'clamp(2.2rem, 6vw, 4.6rem)',
            lineHeight: 1.05,
            margin: 0,
            textShadow: '0 2px 24px rgba(0,0,0,0.35)',
          }}
        >
          {gallery.name}
        </h1>
        <p style={{ margin: '12px 0 0', fontSize: 'clamp(1rem, 1.5vw, 1.2rem)', opacity: 0.92, maxWidth: 640 }}>
          {where ? <span style={{ fontVariant: 'small-caps', letterSpacing: 1 }}>{where}</span> : null}
          {where && gallery.description ? ' — ' : null}
          {gallery.description}
        </p>
        <Link
          href={`/gallery/${gallery.slug}`}
          style={{
            alignSelf: 'flex-start',
            marginTop: 22,
            padding: '11px 20px',
            background: 'rgba(255,255,255,0.14)',
            border: '1px solid rgba(255,255,255,0.55)',
            borderRadius: 'var(--control-radius)',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '0.9rem',
            letterSpacing: 0.4,
            backdropFilter: 'blur(6px)',
          }}
        >
          Follow the route →
        </Link>
      </div>
    </section>
  )
}
