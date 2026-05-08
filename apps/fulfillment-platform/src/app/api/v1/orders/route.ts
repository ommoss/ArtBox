import config from '@payload-config'
import { getPayload } from 'payload'

import type { IncomingOrder } from '@artbox/types'
import { resolveArtistFromRequest } from '@/lib/api-auth'

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })

function validate(body: unknown): body is IncomingOrder {
  if (!body || typeof body !== 'object') return false
  const o = body as Partial<IncomingOrder>
  if (typeof o.externalOrderId !== 'string') return false
  if (!o.customer || typeof o.customer.email !== 'string') return false
  if (!o.shippingAddress || typeof o.shippingAddress.line1 !== 'string') return false
  if (!Array.isArray(o.lines) || o.lines.length === 0) return false
  for (const line of o.lines) {
    if (typeof line.imageUrl !== 'string') return false
    if (typeof line.quantity !== 'number' || line.quantity < 1) return false
    // each line must reference at least one of: a productionSku or a templateSlug
    const hasSku = typeof line.productionSku === 'string' && line.productionSku.length > 0
    const hasTemplate = typeof line.templateSlug === 'string' && line.templateSlug.length > 0
    if (!hasSku && !hasTemplate) return false
  }
  return true
}

export async function POST(request: Request) {
  const payload = await getPayload({ config })

  const artist = await resolveArtistFromRequest(payload, request)
  if (!artist) {
    return json(401, { error: 'invalid_or_missing_api_key' })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json(400, { error: 'invalid_json' })
  }

  if (!validate(body)) {
    return json(400, { error: 'invalid_payload' })
  }

  const order = body

  // Resolve productionSku → productionItem id (only for lines that supply a SKU)
  const skuList = Array.from(
    new Set(
      order.lines
        .map((l) => l.productionSku)
        .filter((s): s is string => typeof s === 'string' && s.length > 0),
    ),
  )
  const skuToId = new Map<string, number>()
  if (skuList.length > 0) {
    const skuLookup = await payload.find({
      collection: 'production-catalog',
      where: { sku: { in: skuList } },
      limit: skuList.length,
      depth: 0,
    })
    for (const item of skuLookup.docs) skuToId.set(item.sku, Number(item.id))
    const missing = skuList.filter((sku) => !skuToId.has(sku))
    if (missing.length > 0) {
      return json(422, { error: 'unknown_production_skus', missing })
    }
  }

  // Resolve templateSlug → template id (only for lines with templates)
  const templateSlugs = Array.from(
    new Set(
      order.lines
        .map((l) => l.templateSlug)
        .filter((s): s is string => typeof s === 'string' && s.length > 0),
    ),
  )
  const slugToTemplateId = new Map<string, number>()
  if (templateSlugs.length > 0) {
    const tmplLookup = await payload.find({
      collection: 'product-templates',
      where: { slug: { in: templateSlugs } },
      limit: templateSlugs.length,
      depth: 0,
    })
    for (const t of tmplLookup.docs) slugToTemplateId.set(t.slug, Number(t.id))
    const missing = templateSlugs.filter((s) => !slugToTemplateId.has(s))
    if (missing.length > 0) {
      return json(422, { error: 'unknown_template_slugs', missing })
    }
  }

  // Reject duplicate externalOrderId for this artist
  const existing = await payload.find({
    collection: 'orders',
    where: {
      and: [
        { artist: { equals: artist.id } },
        { externalOrderId: { equals: order.externalOrderId } },
      ],
    },
    limit: 1,
    depth: 0,
  })
  if (existing.docs.length > 0) {
    return json(409, {
      error: 'duplicate_order',
      orderId: existing.docs[0].id,
    })
  }

  const created = await payload.create({
    collection: 'orders',
    data: {
      artist: artist.id,
      externalOrderId: order.externalOrderId,
      status: 'new',
      customer: order.customer,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress ?? order.shippingAddress,
      subtotal: order.subtotal,
      shipping: order.shipping,
      tax: order.tax,
      total: order.total,
      currency: order.currency,
      helcimTransactionId: order.helcimTransactionId,
      notes: order.notes,
    },
  })

  const orderId = Number(created.id)
  for (const line of order.lines) {
    await payload.create({
      collection: 'order-lines',
      data: {
        order: orderId,
        productionItem: line.productionSku ? skuToId.get(line.productionSku) : undefined,
        template: line.templateSlug ? slugToTemplateId.get(line.templateSlug) : undefined,
        configuration: line.configuration ?? undefined,
        artistProductRef: line.artistProductRef,
        artistProductName: line.artistProductName,
        imageUrl: line.imageUrl,
        imageNotes: line.imageNotes,
        quantity: line.quantity,
        lineSubtotal: line.lineSubtotal,
        status: 'new',
      },
    })
  }

  await payload.create({
    collection: 'fulfillment-events',
    data: {
      order: orderId,
      type: 'system',
      message: `Order received from ${artist.name} site`,
      metadata: {
        externalOrderId: order.externalOrderId,
        helcimTransactionId: order.helcimTransactionId ?? null,
      },
    },
  })

  return json(201, {
    id: created.id,
    status: 'new',
    artist: artist.slug,
  })
}
