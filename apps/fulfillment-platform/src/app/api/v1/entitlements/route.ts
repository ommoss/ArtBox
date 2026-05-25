import config from '@payload-config'
import { getPayload } from 'payload'

import { resolveArtistFromRequest } from '@/lib/api-auth'

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })

// Returns the entitlements for the artist identified by the API key in the
// request. The artist site uses this to gate optional modules (marketing
// today; more later) so Artbox controls what's available per-artist.
//
// Cached on the consuming side with a short TTL — entitlement changes don't
// need to be instant.
export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const artist = await resolveArtistFromRequest(payload, request)
  if (!artist) return json(401, { error: 'invalid_or_missing_api_key' })

  return json(200, {
    artistSlug: artist.slug,
    entitlements: artist.entitlements,
  })
}
