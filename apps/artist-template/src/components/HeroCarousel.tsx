'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Full-bleed hero carousel for the sailing preset. Marine/regatta sites lead
// with a rotating full-screen wide-aspect hero (Borlenghi, Ultimate Sailing),
// so this crossfades through featured work behind the artist name + tagline.
//
// Performance + a11y, straight from the research:
//   - Only the first slide gets `priority` (fetchpriority=high, preloaded);
//     the rest lazy-load so they don't compete with the LCP image.
//   - Autoplay is disabled under prefers-reduced-motion, and there is an
//     always-available pause control. The crossfade itself is suppressed when
//     reduced motion is requested.

type Slide = {
  imageUrl: string
  title?: string | null
  slug?: string | null
  editionSize?: number | null
}

const INTERVAL_MS = 6000

export default function HeroCarousel({
  slides,
  artistName,
  tagline,
}: {
  slides: Slide[]
  artistName: string
  tagline: string
}) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Respect the OS-level reduced-motion preference, and keep it live if the
  // user toggles it.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const canAutoplay = slides.length > 1 && !reducedMotion && !paused

  // Advance on a timer while autoplay is allowed. Re-arms whenever the active
  // slide changes so manual navigation resets the dwell time.
  useEffect(() => {
    if (!canAutoplay) return
    const id = window.setTimeout(
      () => setIndex((i) => (i + 1) % slides.length),
      INTERVAL_MS,
    )
    return () => window.clearTimeout(id)
  }, [canAutoplay, index, slides.length])

  if (slides.length === 0) return null

  const go = (next: number) =>
    setIndex(((next % slides.length) + slides.length) % slides.length)
  const current = slides[index]

  return (
    <section
      aria-roledescription="carousel"
      aria-label={`${artistName} — featured work`}
      style={{
        position: 'relative',
        width: '100%',
        height: 'min(86vh, 820px)',
        overflow: 'hidden',
        marginBottom: 80,
        background: '#000',
      }}
    >
      {slides.map((s, i) => (
        <div
          key={i}
          aria-hidden={i !== index}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: i === index ? 1 : 0,
            transition: reducedMotion ? 'none' : 'opacity 0.8s ease',
          }}
        >
          {s.imageUrl ? (
            <Image
              src={s.imageUrl}
              alt={i === index ? (s.title ?? artistName) : ''}
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              priority={i === 0}
              loading={i === 0 ? undefined : 'lazy'}
            />
          ) : null}
        </div>
      ))}

      {/* Legibility scrim for the overlaid name/tagline. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0 6vw 6vh',
          color: '#fff',
          pointerEvents: 'none',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--weight-heading)' as unknown as number,
            letterSpacing: 'var(--tracking-heading)',
            fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
            lineHeight: 1.05,
            margin: 0,
            textShadow: '0 2px 24px rgba(0,0,0,0.35)',
          }}
        >
          {artistName}
        </h1>
        {tagline ? (
          <p
            style={{
              fontSize: 'clamp(1rem, 1.6vw, 1.3rem)',
              marginTop: 16,
              maxWidth: 640,
              opacity: 0.92,
              textShadow: '0 2px 12px rgba(0,0,0,0.4)',
            }}
          >
            {tagline}
          </p>
        ) : null}
        {/* Edition line + single CTA for the active slide, the way large-format
            limited-edition sellers lead (one release, one button). */}
        {current?.slug ? (
          <div
            style={{
              marginTop: 22,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              flexWrap: 'wrap',
              pointerEvents: 'auto',
            }}
          >
            <Link
              href={`/artwork/${current.slug}`}
              style={{
                padding: '12px 22px',
                background: '#fff',
                color: '#111',
                borderRadius: 'var(--control-radius)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                letterSpacing: 0.3,
              }}
            >
              {current.editionSize ? 'Secure your edition' : 'View this piece'}
            </Link>
            <span style={{ fontSize: '0.9rem', opacity: 0.9, textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
              {current.title}
              {current.editionSize ? ` · Limited edition of ${current.editionSize}` : ''}
            </span>
          </div>
        ) : null}
      </div>

      {/* Controls: prev / next / pause + a "n / N" position indicator. Hidden
          entirely for a single slide. */}
      {slides.length > 1 ? (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            right: '6vw',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span
            aria-live="polite"
            style={{
              color: '#fff',
              fontSize: '0.8rem',
              letterSpacing: 1,
              fontVariantNumeric: 'tabular-nums',
              opacity: 0.85,
              marginRight: 4,
            }}
          >
            {index + 1} / {slides.length}
          </span>
          <CarouselButton label="Previous slide" onClick={() => go(index - 1)}>
            ‹
          </CarouselButton>
          {!reducedMotion ? (
            <CarouselButton
              label={paused ? 'Play slideshow' : 'Pause slideshow'}
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? '▶' : '❚❚'}
            </CarouselButton>
          ) : null}
          <CarouselButton label="Next slide" onClick={() => go(index + 1)}>
            ›
          </CarouselButton>
        </div>
      ) : null}
    </section>
  )
}

function CarouselButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        width: 34,
        height: 34,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.4)',
        borderRadius: 999,
        cursor: 'pointer',
        fontSize: '0.85rem',
        lineHeight: 1,
        padding: 0,
      }}
    >
      {children}
    </button>
  )
}
