import type { Payload } from 'payload'

type GroupSeed = {
  slug: string
  name: string
  inputType: 'select' | 'swatch' | 'size'
  helpText?: string
  options: OptionSeed[]
}

type OptionSeed = {
  value: string
  label: string
  priceModifierAmount: number
  swatchColor?: string
  sortOrder?: number
  widthIn?: number
  heightIn?: number
}

type TemplateSeed = {
  slug: string
  name: string
  category:
    | 'paper_print'
    | 'framed'
    | 'canvas'
    | 'block_mount'
    | 'art_card'
    | 'poster'
    | 'sticker'
    | 'calendar'
  description?: string
  basePrice: number
  baseProductionSku?: string
  optionGroupSlugs: string[] // groups in display order; all options in each group are allowed
  sortOrder?: number
}

const groups: GroupSeed[] = [
  {
    slug: 'paper-print-size',
    name: 'Print size',
    inputType: 'size',
    options: [
      { value: '8x10', label: '8×10″', priceModifierAmount: 25, sortOrder: 1, widthIn: 8, heightIn: 10 },
      { value: '11x14', label: '11×14″', priceModifierAmount: 40, sortOrder: 2, widthIn: 11, heightIn: 14 },
      { value: '16x20', label: '16×20″', priceModifierAmount: 65, sortOrder: 3, widthIn: 16, heightIn: 20 },
      { value: '20x24', label: '20×24″', priceModifierAmount: 95, sortOrder: 4, widthIn: 20, heightIn: 24 },
      { value: '24x36', label: '24×36″', priceModifierAmount: 150, sortOrder: 5, widthIn: 24, heightIn: 36 },
    ],
  },
  {
    slug: 'canvas-size',
    name: 'Canvas size',
    inputType: 'size',
    options: [
      { value: '12x16', label: '12×16″', priceModifierAmount: 95, sortOrder: 1, widthIn: 12, heightIn: 16 },
      { value: '16x20', label: '16×20″', priceModifierAmount: 140, sortOrder: 2, widthIn: 16, heightIn: 20 },
      { value: '20x30', label: '20×30″', priceModifierAmount: 195, sortOrder: 3, widthIn: 20, heightIn: 30 },
      { value: '24x36', label: '24×36″', priceModifierAmount: 240, sortOrder: 4, widthIn: 24, heightIn: 36 },
    ],
  },
  {
    slug: 'frame-size',
    name: 'Frame size',
    inputType: 'size',
    options: [
      { value: '11x14', label: '11×14″', priceModifierAmount: 60, sortOrder: 1, widthIn: 11, heightIn: 14 },
      { value: '16x20', label: '16×20″', priceModifierAmount: 95, sortOrder: 2, widthIn: 16, heightIn: 20 },
      { value: '20x24', label: '20×24″', priceModifierAmount: 130, sortOrder: 3, widthIn: 20, heightIn: 24 },
      { value: '24x36', label: '24×36″', priceModifierAmount: 195, sortOrder: 4, widthIn: 24, heightIn: 36 },
    ],
  },
  {
    slug: 'frame-color',
    name: 'Frame color',
    inputType: 'swatch',
    helpText: 'In-house wood frames from sustainable sources.',
    options: [
      { value: 'walnut', label: 'Walnut', priceModifierAmount: 0, swatchColor: '#4a3520', sortOrder: 1 },
      { value: 'oak', label: 'Oak', priceModifierAmount: 0, swatchColor: '#b89060', sortOrder: 2 },
      { value: 'maple', label: 'Maple', priceModifierAmount: 0, swatchColor: '#e6cba2', sortOrder: 3 },
      { value: 'black-painted', label: 'Black (painted)', priceModifierAmount: 0, swatchColor: '#111111', sortOrder: 4 },
      { value: 'white-painted', label: 'White (painted)', priceModifierAmount: 0, swatchColor: '#f5f5f0', sortOrder: 5 },
    ],
  },
  {
    slug: 'mat',
    name: 'Mat',
    inputType: 'select',
    options: [
      { value: 'none', label: 'No mat', priceModifierAmount: 0, sortOrder: 1 },
      { value: '2-white', label: '2″ white mat', priceModifierAmount: 25, sortOrder: 2 },
      { value: '4-white', label: '4″ white mat', priceModifierAmount: 45, sortOrder: 3 },
      { value: '2-black', label: '2″ black mat', priceModifierAmount: 25, sortOrder: 4 },
    ],
  },
  {
    slug: 'glass-type',
    name: 'Glass',
    inputType: 'select',
    helpText: 'Conservation glass blocks 99% UV. Museum glass adds anti-reflective coating.',
    options: [
      { value: 'standard', label: 'Standard glass', priceModifierAmount: 0, sortOrder: 1 },
      { value: 'conservation', label: 'Conservation glass', priceModifierAmount: 50, sortOrder: 2 },
      { value: 'museum', label: 'Museum glass', priceModifierAmount: 120, sortOrder: 3 },
    ],
  },
  {
    slug: 'stretcher-depth',
    name: 'Stretcher depth',
    inputType: 'select',
    helpText: 'Depth of the wood frame the canvas wraps around.',
    options: [
      { value: '0.75in', label: '3/4″ standard', priceModifierAmount: 0, sortOrder: 1 },
      { value: '1.5in', label: '1.5″ gallery', priceModifierAmount: 30, sortOrder: 2 },
    ],
  },
  {
    slug: 'canvas-wrap',
    name: 'Canvas edge',
    inputType: 'select',
    helpText:
      'Gallery wraps the image around the edge. Mirror reflects the image at the edge. Solid uses a chosen colour.',
    options: [
      { value: 'gallery', label: 'Gallery wrap (image continues over edge)', priceModifierAmount: 0, sortOrder: 1 },
      { value: 'mirror', label: 'Mirror wrap (image reflected at edge)', priceModifierAmount: 10, sortOrder: 2 },
      { value: 'solid', label: 'Solid colour edge', priceModifierAmount: 10, sortOrder: 3 },
    ],
  },
  {
    slug: 'canvas-edge-color',
    name: 'Edge colour',
    inputType: 'swatch',
    helpText: 'Only applies when "Solid colour edge" is selected above.',
    options: [
      { value: 'white', label: 'White', priceModifierAmount: 0, swatchColor: '#f5f5f0', sortOrder: 1 },
      { value: 'cream', label: 'Cream', priceModifierAmount: 0, swatchColor: '#e8dccd', sortOrder: 2 },
      { value: 'gray', label: 'Charcoal', priceModifierAmount: 0, swatchColor: '#3a3a3a', sortOrder: 3 },
      { value: 'navy', label: 'Navy', priceModifierAmount: 0, swatchColor: '#1a2840', sortOrder: 4 },
      { value: 'black', label: 'Black', priceModifierAmount: 0, swatchColor: '#111111', sortOrder: 5 },
    ],
  },
  {
    slug: 'block-size',
    name: 'Block-mount size',
    inputType: 'size',
    options: [
      { value: '8x10', label: '8×10″', priceModifierAmount: 55, sortOrder: 1, widthIn: 8, heightIn: 10 },
      { value: '11x14', label: '11×14″', priceModifierAmount: 78, sortOrder: 2, widthIn: 11, heightIn: 14 },
      { value: '16x20', label: '16×20″', priceModifierAmount: 125, sortOrder: 3, widthIn: 16, heightIn: 20 },
    ],
  },
  {
    slug: 'block-edge',
    name: 'Block edge color',
    inputType: 'swatch',
    options: [
      { value: 'natural-wood', label: 'Natural wood', priceModifierAmount: 0, swatchColor: '#c19a6b', sortOrder: 1 },
      { value: 'white', label: 'White', priceModifierAmount: 5, swatchColor: '#f5f5f0', sortOrder: 2 },
      { value: 'black', label: 'Black', priceModifierAmount: 5, swatchColor: '#111111', sortOrder: 3 },
    ],
  },
  {
    slug: 'card-size',
    name: 'Card size',
    inputType: 'size',
    options: [
      { value: 'a6', label: 'A6 (4.1×5.8″)', priceModifierAmount: 6, sortOrder: 1, widthIn: 4.1, heightIn: 5.8 },
      { value: '5x7', label: '5×7″', priceModifierAmount: 8, sortOrder: 2, widthIn: 5, heightIn: 7 },
    ],
  },
  {
    slug: 'card-pack',
    name: 'Pack size',
    inputType: 'select',
    options: [
      { value: 'single', label: 'Single card', priceModifierAmount: 0, sortOrder: 1 },
      { value: '5pack', label: '5-pack', priceModifierAmount: 25, sortOrder: 2 },
      { value: '10pack', label: '10-pack', priceModifierAmount: 45, sortOrder: 3 },
    ],
  },
  {
    slug: 'card-finish',
    name: 'Card finish',
    inputType: 'select',
    options: [
      { value: 'matte', label: 'Matte', priceModifierAmount: 0, sortOrder: 1 },
      { value: 'pearl', label: 'Pearl', priceModifierAmount: 3, sortOrder: 2 },
    ],
  },
  {
    slug: 'sticker-size',
    name: 'Sticker size',
    inputType: 'size',
    options: [
      { value: '3x3', label: '3×3″', priceModifierAmount: 5, sortOrder: 1, widthIn: 3, heightIn: 3 },
      { value: '4x4', label: '4×4″', priceModifierAmount: 8, sortOrder: 2, widthIn: 4, heightIn: 4 },
    ],
  },
  {
    slug: 'sticker-cut',
    name: 'Cut style',
    inputType: 'select',
    options: [
      { value: 'kiss-cut', label: 'Kiss-cut (rectangular backing)', priceModifierAmount: 0, sortOrder: 1 },
      { value: 'die-cut', label: 'Die-cut (contour)', priceModifierAmount: 3, sortOrder: 2 },
    ],
  },
  {
    slug: 'poster-size',
    name: 'Poster size',
    inputType: 'size',
    options: [
      { value: '12x18', label: '12×18″', priceModifierAmount: 30, sortOrder: 1, widthIn: 12, heightIn: 18 },
      { value: '18x24', label: '18×24″', priceModifierAmount: 45, sortOrder: 2, widthIn: 18, heightIn: 24 },
      { value: '24x36', label: '24×36″', priceModifierAmount: 75, sortOrder: 3, widthIn: 24, heightIn: 36 },
    ],
  },
  {
    slug: 'calendar-format',
    name: 'Calendar format',
    inputType: 'select',
    options: [
      { value: 'wall-12', label: '12-month wall calendar (11×17″)', priceModifierAmount: 35, sortOrder: 1 },
      { value: 'desk', label: 'Desk calendar (5×7″)', priceModifierAmount: 22, sortOrder: 2 },
    ],
  },
]

const templates: TemplateSeed[] = [
  {
    slug: 'paper-print',
    name: 'Fine art paper print',
    category: 'paper_print',
    description: 'Giclée-printed on archival fine art paper, 250-year lifespan.',
    basePrice: 0,
    baseProductionSku: 'PRT-FA-16x20',
    optionGroupSlugs: ['paper-print-size'],
    sortOrder: 1,
  },
  {
    slug: 'framed-print',
    name: 'Custom framed print',
    category: 'framed',
    description:
      'Giclée print in an in-house custom wood frame, with optional mat and conservation glass.',
    basePrice: 65,
    baseProductionSku: 'FRM-CST-16x20',
    optionGroupSlugs: ['frame-size', 'frame-color', 'mat', 'glass-type'],
    sortOrder: 2,
  },
  {
    slug: 'canvas-wrap',
    name: 'Canvas wrap',
    category: 'canvas',
    description: 'Giclée on photo canvas, gallery-wrapped over a wood stretcher.',
    basePrice: 0,
    baseProductionSku: 'CAN-16x20',
    optionGroupSlugs: ['canvas-size', 'stretcher-depth', 'canvas-wrap', 'canvas-edge-color'],
    sortOrder: 3,
  },
  {
    slug: 'block-mount',
    name: 'Wood block-mount',
    category: 'block_mount',
    description: 'Print mounted on solid sustainable wood, no frame, ready to hang.',
    basePrice: 0,
    baseProductionSku: 'BLK-16x20',
    optionGroupSlugs: ['block-size', 'block-edge'],
    sortOrder: 4,
  },
  {
    slug: 'greeting-card',
    name: 'Greeting card',
    category: 'art_card',
    description: 'Folded greeting cards with white envelopes.',
    basePrice: 0,
    baseProductionSku: 'CRD-5x7',
    optionGroupSlugs: ['card-size', 'card-pack', 'card-finish'],
    sortOrder: 5,
  },
  {
    slug: 'sticker',
    name: 'Vinyl sticker',
    category: 'sticker',
    description: 'Weatherproof vinyl stickers, indoor/outdoor use.',
    basePrice: 0,
    baseProductionSku: 'STK-3x3',
    optionGroupSlugs: ['sticker-size', 'sticker-cut'],
    sortOrder: 6,
  },
]

export async function seedTemplatesAndOptions(payload: Payload) {
  // 1. Seed option groups + their options
  const groupIdBySlug = new Map<string, number>()
  const optionIdsByGroupSlug = new Map<string, number[]>()

  for (const g of groups) {
    let groupDoc = (
      await payload.find({
        collection: 'option-groups',
        where: { slug: { equals: g.slug } },
        limit: 1,
        depth: 0,
      })
    ).docs[0]

    if (!groupDoc) {
      groupDoc = await payload.create({
        collection: 'option-groups',
        data: { slug: g.slug, name: g.name, inputType: g.inputType, helpText: g.helpText },
      })
    }
    const groupId = Number(groupDoc.id)
    groupIdBySlug.set(g.slug, groupId)

    const optionIds: number[] = []
    for (const o of g.options) {
      const existing = (
        await payload.find({
          collection: 'options',
          where: {
            and: [
              { optionGroup: { equals: groupId } },
              { value: { equals: o.value } },
            ],
          },
          limit: 1,
          depth: 0,
        })
      ).docs[0]

      if (existing) {
        optionIds.push(Number(existing.id))
      } else {
        const created = await payload.create({
          collection: 'options',
          data: {
            optionGroup: groupId,
            label: o.label,
            value: o.value,
            priceModifierAmount: o.priceModifierAmount,
            swatchColor: o.swatchColor,
            widthIn: o.widthIn,
            heightIn: o.heightIn,
            sortOrder: o.sortOrder ?? 0,
            isActive: true,
          },
        })
        optionIds.push(Number(created.id))
      }
    }
    optionIdsByGroupSlug.set(g.slug, optionIds)
  }

  // 2. Seed templates (force-update existing template configuration to match
  //    the current spec, so adding/removing/reordering option groups in this
  //    file propagates to the deployed DB on boot)
  for (const t of templates) {
    const existing = (
      await payload.find({
        collection: 'product-templates',
        where: { slug: { equals: t.slug } },
        limit: 1,
        depth: 0,
      })
    ).docs[0]

    let baseProductionSkuId: number | undefined
    if (t.baseProductionSku) {
      const sku = (
        await payload.find({
          collection: 'production-catalog',
          where: { sku: { equals: t.baseProductionSku } },
          limit: 1,
          depth: 0,
        })
      ).docs[0]
      if (sku) baseProductionSkuId = Number(sku.id)
    }

    const configuration = t.optionGroupSlugs
      .filter((slug) => groupIdBySlug.has(slug))
      .map((slug) => ({
        optionGroup: groupIdBySlug.get(slug)!,
        allowedOptions: optionIdsByGroupSlug.get(slug)!,
        isRequired: true,
      }))

    if (existing) {
      // Only push an update when the config differs, to avoid spurious updates
      // on every boot.
      const existingConfig = (existing as { configuration?: unknown[] }).configuration
      const expectedSlugList = t.optionGroupSlugs.join(',')
      const existingSlugList = Array.isArray(existingConfig)
        ? existingConfig
            .map((c) => {
              const og = (c as { optionGroup?: { slug?: string } | number }).optionGroup
              return typeof og === 'object' && og && 'slug' in og ? og.slug : ''
            })
            .filter(Boolean)
            .join(',')
        : ''
      if (existingSlugList !== expectedSlugList) {
        await payload.update({
          collection: 'product-templates',
          id: existing.id,
          data: { configuration, baseProductionSku: baseProductionSkuId },
        })
      }
      continue
    }

    await payload.create({
      collection: 'product-templates',
      data: {
        slug: t.slug,
        name: t.name,
        category: t.category,
        description: t.description,
        basePrice: t.basePrice,
        baseProductionSku: baseProductionSkuId,
        configuration,
        isActive: true,
        sortOrder: t.sortOrder ?? 0,
      },
    })
  }
}
