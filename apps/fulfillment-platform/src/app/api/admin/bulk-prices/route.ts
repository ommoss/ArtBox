import config from '@payload-config'
import { getPayload } from 'payload'

// Batch update endpoint for the bulk-prices admin page. Accepts a list
// of template basePrice changes and production-catalog baseCost changes,
// applies them, and reports how many succeeded.
//
// Auth-gated to logged-in fulfillment users. Each update calls payload
// update() so collection hooks (e.g. timestamps) fire.

type TemplateUpdate = { id: number; basePrice: number }
type ProductionItemUpdate = { id: number; baseCost: number }

type Body = {
  templates?: TemplateUpdate[]
  productionItems?: ProductionItemUpdate[]
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })

function validate(body: unknown): body is Body {
  if (!body || typeof body !== 'object') return false
  const b = body as Body
  const arrCheck = <T>(
    arr: unknown,
    pred: (x: unknown) => x is T,
  ): arr is T[] => Array.isArray(arr) && arr.every(pred)
  if (
    b.templates != null &&
    !arrCheck(b.templates, (x): x is TemplateUpdate => {
      if (!x || typeof x !== 'object') return false
      const u = x as TemplateUpdate
      return typeof u.id === 'number' && typeof u.basePrice === 'number' && u.basePrice >= 0
    })
  ) {
    return false
  }
  if (
    b.productionItems != null &&
    !arrCheck(b.productionItems, (x): x is ProductionItemUpdate => {
      if (!x || typeof x !== 'object') return false
      const u = x as ProductionItemUpdate
      return typeof u.id === 'number' && typeof u.baseCost === 'number' && u.baseCost >= 0
    })
  ) {
    return false
  }
  return true
}

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const auth = await payload.auth({ headers: new Headers(request.headers) })
  if (!auth?.user) return json(401, { error: 'unauthorized' })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json(400, { error: 'invalid_json' })
  }
  if (!validate(body)) return json(400, { error: 'invalid_payload' })

  const templates = body.templates ?? []
  const productionItems = body.productionItems ?? []

  let templateUpdated = 0
  let productionUpdated = 0
  const errors: Array<{ collection: string; id: number; error: string }> = []

  for (const u of templates) {
    try {
      await payload.update({
        collection: 'product-templates',
        id: u.id,
        data: { basePrice: u.basePrice },
      })
      templateUpdated++
    } catch (err) {
      errors.push({
        collection: 'product-templates',
        id: u.id,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  for (const u of productionItems) {
    try {
      await payload.update({
        collection: 'production-catalog',
        id: u.id,
        data: { baseCost: u.baseCost },
      })
      productionUpdated++
    } catch (err) {
      errors.push({
        collection: 'production-catalog',
        id: u.id,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return json(errors.length > 0 ? 207 : 200, {
    updated: { templates: templateUpdated, productionItems: productionUpdated },
    errors,
  })
}
