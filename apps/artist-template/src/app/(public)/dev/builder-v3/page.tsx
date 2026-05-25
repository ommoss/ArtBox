import { notFound } from 'next/navigation'

import DevBuilderV3Client from './DevBuilderV3Client'

export const metadata = {
  title: 'Builder V3 sandbox (3D)',
}

// Dev-only sandbox for the V3 product builder. Gated to development
// environment — production builds skip prerendering and 404 at request time.
// This also avoids the SSR-prerender errors that R3F's Canvas can throw
// during static generation in production builds.
export default function DevBuilderV3Page() {
  if (process.env.NODE_ENV !== 'development') notFound()
  return (
    <section style={{ padding: '32px 16px', maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 500, margin: 0 }}>
          Product Builder V3 — sandbox (3D)
        </h1>
        <p
          style={{
            color: 'var(--color-secondary)',
            fontSize: '0.9rem',
            marginTop: 8,
            maxWidth: 720,
          }}
        >
          Dev-only route for V3 (R3F-based 3D framed prints). Other formats
          fall back to the 2.5D renderer. Drag the framed piece to rotate
          ±15° around vertical and horizontal axes.
        </p>
      </header>
      <DevBuilderV3Client />
    </section>
  )
}
