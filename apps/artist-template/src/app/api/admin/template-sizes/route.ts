import config from '@payload-config'
import { getPayload } from 'payload'

import { fetchTemplates } from '@/lib/fulfillment-client'

// Server proxy that returns the available size options for a given product
// template slug. Used by the custom SizeSelectorField in the Artworks
// admin so artists can pick from real fulfillment sizes instead of typing
// them by hand.
//
// Requires an authenticated Payload admin user. The fulfillment API key
// stays server-side; the browser only ever sees the resolved size list.
//
// Cached by Next per the underlying fulfillment-client revalidate (60s).

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

export async function GET(request: Request) {
  const payload = await getPayload({ config })
  // Authenticate using Payload's req.user — anyone logged into the admin
  // can call this. We deliberately don't expose this to unauthenticated
  // visitors since it leaks the fulfillment catalog structure.
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

  const templates = await fetchTemplates()
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

