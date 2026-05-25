import { notFound } from 'next/navigation'

import DevBuilderV2Client from './DevBuilderV2Client'

export const metadata = {
  title: 'Builder V2 sandbox',
}

// Dev-only sandbox for the V2 product builder. Mounts ProductBuilderV2
// against fixture template data so iteration doesn't depend on the
// fulfillment API or real artworks. Pick the theme via NEXT_PUBLIC_THEME on
// the parent deployment to see how V2 looks under each preset.
//
// Gated to development environment only — NODE_ENV is set at build time so
// production builds skip prerendering this page and 404 at request time.
export default function DevBuilderV2Page() {
  if (process.env.NODE_ENV !== 'development') notFound()
  return (
    <section style={{ padding: '32px 16px', maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 500, margin: 0 }}>
          Product Builder V2 — sandbox
        </h1>
        <p
          style={{
            color: 'var(--color-secondary)',
            fontSize: '0.9rem',
            marginTop: 8,
            maxWidth: 720,
          }}
        >
          Dev-only route for iterating on the V2 builder. Uses fixture
          templates so it works without the fulfillment API. Cart actions in
          this view log to console only — they do NOT add to the real cart.
        </p>
      </header>
      <DevBuilderV2Client />
    </section>
  )
}
