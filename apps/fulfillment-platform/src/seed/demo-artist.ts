import type { Payload } from 'payload'

/**
 * Dev convenience: ensure a "Demo Artist" record exists with status=active
 * so end-to-end testing of the order flow works without clicking through the
 * admin UI to create an artist + grab an API key. Logs the key to stdout on
 * every boot so you can copy it into apps/artist-template/.env.
 *
 * Skipped in production unless explicitly opted in via SEED_DEMO_ARTIST=1.
 */
export async function seedDemoArtist(payload: Payload) {
  const isDev = process.env.NODE_ENV !== 'production'
  const optedIn = process.env.SEED_DEMO_ARTIST === '1'
  if (!isDev && !optedIn) return

  const slug = 'demo-artist'
  let artist = (
    await payload.find({
      collection: 'artists',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
  ).docs[0]

  if (!artist) {
    artist = await payload.create({
      collection: 'artists',
      data: {
        slug,
        name: 'Demo Artist',
        status: 'active',
        contactEmail: 'demo@example.com',
      },
    })
  }

  const key = (artist as { apiKey?: string }).apiKey
  if (!key) {
    payload.logger.warn('[demo-artist] artist exists but has no API key')
    return
  }

  payload.logger.info(
    `\n` +
      `┌──────────────────────────────────────────────────────────────────┐\n` +
      `│  Demo artist API key — paste into apps/artist-template/.env:    │\n` +
      `│                                                                  │\n` +
      `│  FULFILLMENT_API_KEY=${key.padEnd(44)}│\n` +
      `└──────────────────────────────────────────────────────────────────┘\n`,
  )
}
