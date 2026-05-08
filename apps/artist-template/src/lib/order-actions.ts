'use server'

import type { IncomingOrder, IncomingOrderLine } from '@artbox/types'

import type { CartItem } from './cart-context'

const FULFILLMENT_API_URL = process.env.FULFILLMENT_API_URL || ''
const FULFILLMENT_API_KEY = process.env.FULFILLMENT_API_KEY || ''

export type OrderFormCustomer = {
  name: string
  email: string
  phone?: string
}

export type OrderFormAddress = {
  line1: string
  line2?: string
  city: string
  region: string
  postalCode: string
  country: string
}

export type SubmitOrderInput = {
  customer: OrderFormCustomer
  shippingAddress: OrderFormAddress
  items: CartItem[]
}

export type SubmitOrderResult =
  | {
      ok: true
      orderId: string | number
      externalOrderId: string
      totals: { subtotal: number; shipping: number; tax: number; total: number }
    }
  | { ok: false; error: string; details?: unknown }

const SHIPPING_FLAT_CAD = 15
const TAX_RATE = 0.05 // 5% GST placeholder; real tax engine comes later

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export async function submitMockOrder(
  input: SubmitOrderInput,
): Promise<SubmitOrderResult> {
  if (!FULFILLMENT_API_URL || !FULFILLMENT_API_KEY) {
    return {
      ok: false,
      error:
        'Fulfillment platform not configured. Set FULFILLMENT_API_URL and FULFILLMENT_API_KEY in apps/artist-template/.env, then restart the dev server.',
    }
  }

  if (input.items.length === 0) {
    return { ok: false, error: 'Cart is empty.' }
  }

  const lines: IncomingOrderLine[] = input.items.map((item) => ({
    templateSlug: item.templateSlug,
    configuration: item.configuration,
    artistProductRef: item.artworkSlug,
    artistProductName: `${item.artworkTitle} — ${item.templateName}`,
    imageUrl: item.imageUrl,
    quantity: item.quantity,
    lineSubtotal: round2(item.configuration.unitPrice * item.quantity),
  }))

  const subtotal = round2(lines.reduce((acc, l) => acc + l.lineSubtotal, 0))
  const shipping = SHIPPING_FLAT_CAD
  const tax = round2(subtotal * TAX_RATE)
  const total = round2(subtotal + shipping + tax)

  const externalOrderId = `MOCK-${Date.now().toString(36).toUpperCase()}`

  const payload: IncomingOrder = {
    externalOrderId,
    customer: input.customer,
    shippingAddress: { name: input.customer.name, ...input.shippingAddress },
    lines,
    subtotal,
    shipping,
    tax,
    total,
    currency: 'CAD',
    notes: 'MOCK ORDER (no payment captured) — generated from artist site demo flow.',
  }

  let res: Response
  try {
    res = await fetch(`${FULFILLMENT_API_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-artbox-api-key': FULFILLMENT_API_KEY,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })
  } catch (err) {
    return {
      ok: false,
      error: 'Could not reach fulfillment platform. Is it running on the configured URL?',
      details: String(err),
    }
  }

  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    body = null
  }

  if (!res.ok) {
    return {
      ok: false,
      error: `Fulfillment API rejected the order (HTTP ${res.status}).`,
      details: body,
    }
  }

  const parsed = body as { id?: string | number }
  if (!parsed?.id) {
    return { ok: false, error: 'Fulfillment API returned no order id.', details: body }
  }

  return {
    ok: true,
    orderId: parsed.id,
    externalOrderId,
    totals: { subtotal, shipping, tax, total },
  }
}
