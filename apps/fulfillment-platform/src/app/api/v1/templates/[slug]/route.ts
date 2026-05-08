import config from '@payload-config'
import { getPayload } from 'payload'

import { resolveArtistFromRequest } from '@/lib/api-auth'
import { loadPublicTemplate } from '@/lib/template-resolver'

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const payload = await getPayload({ config })
  const artist = await resolveArtistFromRequest(payload, request)
  if (!artist) return json(401, { error: 'invalid_or_missing_api_key' })

  const { slug } = await params
  const tmpl = await loadPublicTemplate(payload, slug)
  if (!tmpl) return json(404, { error: 'template_not_found' })

  return json(200, { template: tmpl })
}
