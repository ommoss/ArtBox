import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@payload-config'

import BulkPricesClient, {
  type ProductionItemRow,
  type TemplateRow,
} from './BulkPricesClient'

// Custom admin page for bulk-editing base prices (the prices Artbox
// invoices artists for). Source of truth: ProductionCatalog.baseCost.
// Templates also have a basePrice that can be edited here for cases where
// pricing isn't carried by a Production Catalog SKU.
//
// Auth-gated. Not visible without an admin session.

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Bulk price editor — Artbox Fulfillment',
}

export default async function BulkPricesPage() {
  const payload = await getPayload({ config })

  const headers = await nextHeaders()
  const { user } = await payload.auth({ headers: new Headers(headers as unknown as HeadersInit) })
  if (!user) {
    redirect('/admin/login?redirect=/bulk-prices')
  }

  const [templates, productionItems] = await Promise.all([
    payload.find({
      collection: 'product-templates',
      limit: 200,
      depth: 0,
      sort: 'name',
    }),
    payload.find({
      collection: 'production-catalog',
      limit: 2000,
      depth: 0,
      sort: 'sku',
    }),
  ])

  const templateRows: TemplateRow[] = templates.docs.map((t) => ({
    id: Number(t.id),
    name: (t as { name?: string }).name ?? '(unnamed)',
    slug: (t as { slug?: string }).slug ?? '',
    category: (t as { category?: string }).category ?? '',
    basePrice: Number((t as { basePrice?: number }).basePrice ?? 0),
    isActive: Boolean((t as { isActive?: boolean }).isActive),
  }))

  const productionRows: ProductionItemRow[] = productionItems.docs.map((p) => ({
    id: Number(p.id),
    sku: (p as { sku?: string }).sku ?? '',
    name: (p as { name?: string }).name ?? '(unnamed)',
    category: (p as { category?: string }).category ?? '',
    widthIn: (p as { widthIn?: number | null }).widthIn ?? null,
    heightIn: (p as { heightIn?: number | null }).heightIn ?? null,
    material: (p as { material?: string }).material ?? '',
    baseCost: Number((p as { baseCost?: number }).baseCost ?? 0),
    isActive: Boolean((p as { isActive?: boolean }).isActive ?? true),
  }))

  return <BulkPricesClient templates={templateRows} productionItems={productionRows} />
}
