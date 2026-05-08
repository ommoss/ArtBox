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

export async function loadPublicTemplate(
  payload: Payload,
  slug: string,
): Promise<PublicProductTemplate | null> {
  const result = await payload.find({
    collection: 'product-templates',
    where: {
      and: [{ slug: { equals: slug } }, { isActive: { equals: true } }],
    },
    limit: 1,
    depth: 3,
  })
  const tmpl = result.docs[0]
  if (!tmpl) return null
  return shapeTemplate(tmpl)
}

export async function loadPublicTemplates(
  payload: Payload,
): Promise<PublicProductTemplate[]> {
  const result = await payload.find({
    collection: 'product-templates',
    where: { isActive: { equals: true } },
    limit: 100,
    depth: 3,
    sort: 'sortOrder',
  })
  return result.docs.map(shapeTemplate)
}

function shapeTemplate(tmpl: Doc): PublicProductTemplate {
  const optionGroups: PublicOptionGroup[] = []

  const config = (tmpl.configuration as unknown[]) ?? []
  for (const entry of config) {
    const e = asObj(entry)
    if (!e) continue
    const groupDoc = asObj(e.optionGroup)
    const allowed = Array.isArray(e.allowedOptions) ? e.allowedOptions : []
    if (!groupDoc) continue

    const options: PublicOption[] = []
    for (const opt of allowed) {
      const o = asObj(opt)
      if (!o) continue
      if (o.isActive === false) continue
      options.push({
        id: o.id,
        label: String(o.label ?? ''),
        value: String(o.value ?? ''),
        priceModifierAmount: Number(o.priceModifierAmount ?? 0),
        swatchColor: o.swatchColor ? String(o.swatchColor) : undefined,
        previewImage: o.previewImage ? String(o.previewImage) : undefined,
        widthIn: typeof o.widthIn === 'number' ? o.widthIn : undefined,
        heightIn: typeof o.heightIn === 'number' ? o.heightIn : undefined,
        sortOrder: Number(o.sortOrder ?? 0),
      })
    }
    options.sort((a, b) => a.sortOrder - b.sortOrder)

    optionGroups.push({
      id: groupDoc.id,
      name: String(groupDoc.name ?? ''),
      slug: String(groupDoc.slug ?? ''),
      inputType: (groupDoc.inputType as OptionInputType) ?? 'select',
      helpText: groupDoc.helpText ? String(groupDoc.helpText) : undefined,
      isRequired: e.isRequired !== false,
      options,
    })
  }

  return {
    id: tmpl.id,
    name: String(tmpl.name ?? ''),
    slug: String(tmpl.slug ?? ''),
    category: (tmpl.category as ProductionCategory) ?? 'paper_print',
    description: tmpl.description ? String(tmpl.description) : undefined,
    basePrice: Number(tmpl.basePrice ?? 0),
    thumbnailImage: tmpl.thumbnailImage ? String(tmpl.thumbnailImage) : undefined,
    optionGroups,
  }
}
