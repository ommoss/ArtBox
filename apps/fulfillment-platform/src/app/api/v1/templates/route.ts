import config from '@payload-config'
import { getPayload } from 'payload'

import { resolveArtistFromRequest } from '@/lib/api-auth'
import { loadPublicTemplates } from '@/lib/template-resolver'

// Always run fresh — prevents Vercel from edge-caching the templates
// response. Bulk-price edits in /bulk-prices need to be visible to
// artist sites on their next fetch, not after an edge TTL.
export const dynamic = 'force-dynamic'
export const revalidate = 0

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })

export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const artist = await resolveArtistFromRequest(payload, request)
  if (!artist) return json(401, { error: 'invalid_or_missing_api_key' })

  const templates = await loadPublicTemplates(payload)
  return json(200, { templates })
}
