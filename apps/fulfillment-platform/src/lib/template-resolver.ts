import type { Payload } from 'payload'

import type {
  OptionInputType,
  ProductionCategory,
  PublicOption,
  PublicOptionGroup,
  PublicProductTemplate,
} from '@artbox/types'

type Doc = { id: string | number; [k: string]: unknown }

function asObj(v: unknown): Doc | null {
  return v && typeof v === 'object' ? (v as Doc) : null
}

// Lookup keyed by `${category}|${widthIn}x${heightIn}` → baseCost. Used to
// derive size-option prices from ProductionCatalog (source of truth) at
// resolution time. Built once per request and shared across templates.
type ProductionCostIndex = Map<string, number>

function makeKey(category: string, widthIn: number, heightIn: number): string {
  return `${category}|${widthIn}x${heightIn}`
}

async function loadProductionCostIndex(payload: Payload): Promise<ProductionCostIndex> {
  const result = await payload.find({
    collection: 'production-catalog',
    where: { isActive: { equals: true } },
    limit: 2000,
    depth: 0,
  })
  const index: ProductionCostIndex = new Map()
  for (const item of result.docs) {
    const d = item as unknown as {
      category?: string
      widthIn?: number | null
      heightIn?: number | null
      baseCost?: number
    }
    if (!d.category || !d.widthIn || !d.heightIn) continue
    const key = makeKey(d.category, d.widthIn, d.heightIn)
    // If multiple SKUs share dimensions in a category (rare; usually
    // material variations), prefer the lower baseCost as the "starting"
    // price. Staff can refine via the per-template configuration later.
    const existing = index.get(key)
    const cost = Number(d.baseCost ?? 0)
    if (existing == null || cost < existing) {
      index.set(key, cost)
    }
  }
  return index
}

export async function loadPublicTemplate(
  payload: Payload,
  slug: string,
): Promise<PublicProductTemplate | null> {
  const [result, costIndex] = await Promise.all([
    payload.find({
      collection: 'product-templates',
      where: {
        and: [{ slug: { equals: slug } }, { isActive: { equals: true } }],
      },
      limit: 1,
      depth: 3,
    }),
    loadProductionCostIndex(payload),
  ])
  const tmpl = result.docs[0]
  if (!tmpl) return null
  return shapeTemplate(tmpl as unknown as Doc, costIndex)
}

export async function loadPublicTemplates(
  payload: Payload,
): Promise<PublicProductTemplate[]> {
  const [result, costIndex] = await Promise.all([
    payload.find({
      collection: 'product-templates',
      where: { isActive: { equals: true } },
      limit: 100,
      depth: 3,
      sort: 'sortOrder',
    }),
    loadProductionCostIndex(payload),
  ])
  return result.docs.map((d) => shapeTemplate(d as unknown as Doc, costIndex))
}

function shapeTemplate(
  tmpl: Doc,
  costIndex: ProductionCostIndex,
): PublicProductTemplate {
  const optionGroups: PublicOptionGroup[] = []
  const category = (tmpl.category as ProductionCategory) ?? 'paper_print'

  const config = (tmpl.configuration as unknown[]) ?? []
  for (const entry of config) {
    const e = asObj(entry)
    if (!e) continue
    const groupDoc = asObj(e.optionGroup)
    const allowed = Array.isArray(e.allowedOptions) ? e.allowedOptions : []
    if (!groupDoc) continue
    const inputType = (groupDoc.inputType as OptionInputType) ?? 'select'

    const options: PublicOption[] = []
    for (const opt of allowed) {
      const o = asObj(opt)
      if (!o) continue
      if (o.isActive === false) continue

      const widthIn = typeof o.widthIn === 'number' ? o.widthIn : undefined
      const heightIn = typeof o.heightIn === 'number' ? o.heightIn : undefined

      // For SIZE options, derive priceModifierAmount from the matching
      // ProductionCatalog SKU's baseCost. ProductionCatalog is the
      // source-of-truth for what Artbox bills the artist per unit. Fall
      // back to the Option's own priceModifierAmount if no matching SKU
      // exists (so newly-added sizes without a SKU still get a price).
      let priceModifierAmount = Number(o.priceModifierAmount ?? 0)
      if (inputType === 'size' && widthIn && heightIn) {
        const cost = costIndex.get(makeKey(category, widthIn, heightIn))
        if (cost != null) priceModifierAmount = cost
      }

      options.push({
        id: o.id,
        label: String(o.label ?? ''),
        value: String(o.value ?? ''),
        priceModifierAmount,
        priceModifierPerSqIn:
          typeof o.priceModifierPerSqIn === 'number' && o.priceModifierPerSqIn !== 0
            ? o.priceModifierPerSqIn
            : undefined,
        swatchColor: o.swatchColor ? String(o.swatchColor) : undefined,
        previewImage: o.previewImage ? String(o.previewImage) : undefined,
        widthIn,
        heightIn,
        sortOrder: Number(o.sortOrder ?? 0),
      })
    }
    options.sort((a, b) => a.sortOrder - b.sortOrder)

    optionGroups.push({
      id: groupDoc.id,
      name: String(groupDoc.name ?? ''),
      slug: String(groupDoc.slug ?? ''),
      inputType,
      helpText: groupDoc.helpText ? String(groupDoc.helpText) : undefined,
      isRequired: e.isRequired !== false,
      options,
    })
  }

  return {
    id: tmpl.id,
    name: String(tmpl.name ?? ''),
    slug: String(tmpl.slug ?? ''),
    category,
    description: tmpl.description ? String(tmpl.description) : undefined,
    basePrice: Number(tmpl.basePrice ?? 0),
    thumbnailImage: tmpl.thumbnailImage ? String(tmpl.thumbnailImage) : undefined,
    optionGroups,
  }
}
