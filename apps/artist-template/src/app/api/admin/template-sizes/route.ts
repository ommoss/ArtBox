import config from '@payload-config'
import { getPayload } from 'payload'

import type { PublicProductTemplate } from '@artbox/types'

// Server proxy that returns the available size options for a given product
// template slug. Used by the custom SizeSelectorField in the Artworks
// admin so artists can pick from real fulfillment sizes instead of typing
// them by hand.
//
// Requires an authenticated Payload admin user. The fulfillment API key
// stays server-side; the browser only ever sees the resolved size list.
//
// Always fetches FRESH from the fulfillment API (cache: 'no-store') —
// admins editing artworks need to see new sizes the instant Artbox adds
// them, not after a 60s revalidate window. Higher per-call latency is
// fine for an admin-only endpoint.

// Mark the route handler as dynamic so Vercel/Next doesn't statically
// cache the response. Without this, the route gets a stale edge cache
// even though the underlying fetch already uses `no-store`.
export const dynamic = 'force-dynamic'
export const revalidate = 0

export type TemplateSize = {
  value: string
  label: string
  widthIn?: number
  heightIn?: number
  priceModifierAmount: number
}

export type TemplateSizesResponse = {
  productSlug: string
  sizes: TemplateSize[]
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })

const FULFILLMENT_API_URL = process.env.FULFILLMENT_API_URL || ''
const FULFILLMENT_API_KEY = process.env.FULFILLMENT_API_KEY || ''

async function fetchTemplatesFresh(): Promise<PublicProductTemplate[]> {
  if (!FULFILLMENT_API_URL || !FULFILLMENT_API_KEY) return []
  try {
    const res = await fetch(`${FULFILLMENT_API_URL}/api/v1/templates`, {
      headers: { 'x-artbox-api-key': FULFILLMENT_API_KEY },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const body = (await res.json()) as { templates?: PublicProductTemplate[] }
    return body.templates ?? []
  } catch {
    return []
  }
}

export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const headers = new Headers(request.headers)
  const authReq = await payload.auth({ headers })
  if (!authReq?.user) {
    return json(401, { error: 'unauthorized' })
  }

  const url = new URL(request.url)
  const productSlug = url.searchParams.get('product')
  if (!productSlug) {
    return json(400, { error: 'missing_product_slug' })
  }

  const templates = await fetchTemplatesFresh()
  const template = templates.find((t) => t.slug === productSlug)
  if (!template) {
    return json(404, { error: 'template_not_found', productSlug })
  }

  const sizeGroup = template.optionGroups.find((g) => g.inputType === 'size')
  const sizes: TemplateSize[] = (sizeGroup?.options ?? []).map((o) => ({
    value: o.value,
    label: o.label,
    widthIn: o.widthIn,
    heightIn: o.heightIn,
    priceModifierAmount: o.priceModifierAmount,
  }))

  const body: TemplateSizesResponse = { productSlug, sizes }
  return json(200, body)
}
