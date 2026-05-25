/**
 * One-off script: add square + panoramic size Options to the configured
 * products, mirror the corresponding ProductionCatalog SKUs, and add the
 * new Options to each Product Template's allowedOptions.
 *
 * Pricing for each new size copies from the EXISTING Option/SKU with the
 * closest area in the same group/category — so the new 16×16 framed
 * print inherits the 16×20's price modifier and base cost. Adjust prices
 * afterward via the admin (or a future bulk-edit page) if the area-match
 * tier doesn't fit your retail strategy.
 *
 * Idempotent: skips entries that already exist by `value` (Options) or
 * `sku` (ProductionCatalog).
 *
 * Defaults to DRY-RUN. Re-run with `--apply` to mutate the DB.
 *
 *   pnpm seed:square-panoramic-sizes
 *   pnpm seed:square-panoramic-sizes -- --apply
 */

import { getPayload } from 'payload'

import config from '../src/payload.config'

const apply = process.argv.includes('--apply')

const TARGET_TEMPLATE_SLUGS = ['framed-print', 'canvas-wrap', 'paper-print', 'block-mount']

// Categories used by ProductionCatalog. Maps template slug → category so
// we can find the right portrait SKUs to copy pricing from.
const TEMPLATE_TO_CATEGORY: Record<string, ProductionCategory> = {
  'framed-print': 'framed',
  'canvas-wrap': 'canvas',
  'paper-print': 'paper_print',
  'block-mount': 'block_mount',
}

type ProductionCategory =
  | 'paper_print'
  | 'canvas'
  | 'framed'
  | 'block_mount'
  | 'art_card'
  | 'sticker'
  | 'poster'

type NewSize = { value: string; label: string; widthIn: number; heightIn: number }

const NEW_SIZES: NewSize[] = [
  // Square
  { value: '8x8', label: '8 × 8″', widthIn: 8, heightIn: 8 },
  { value: '12x12', label: '12 × 12″', widthIn: 12, heightIn: 12 },
  { value: '16x16', label: '16 × 16″', widthIn: 16, heightIn: 16 },
  { value: '20x20', label: '20 × 20″', widthIn: 20, heightIn: 20 },
  { value: '30x30', label: '30 × 30″', widthIn: 30, heightIn: 30 },
  // Panoramic
  { value: '12x24', label: '12 × 24″', widthIn: 12, heightIn: 24 },
  { value: '16x40', label: '16 × 40″', widthIn: 16, heightIn: 40 },
  { value: '20x60', label: '20 × 60″', widthIn: 20, heightIn: 60 },
]

type OptionDoc = {
  id: number
  optionGroup: number | { id: number }
  label: string
  value: string
  priceModifierAmount: number
  widthIn?: number | null
  heightIn?: number | null
  sortOrder?: number | null
  isActive?: boolean
}

type TemplateConfigEntry = {
  optionGroup: number | { id: number }
  allowedOptions?: Array<number | { id: number }>
  isRequired?: boolean
}

type TemplateDoc = {
  id: number
  slug: string
  configuration?: TemplateConfigEntry[]
}

type ProductionItemDoc = {
  id: number
  sku: string
  name: string
  category: ProductionCategory
  widthIn?: number | null
  heightIn?: number | null
  material?: string
  finish?: string
  baseCost: number
  leadTimeDays?: number | null
  isActive?: boolean
  notes?: string
}

function refId(ref: number | { id: number } | null | undefined): number | null {
  if (ref == null) return null
  if (typeof ref === 'object') return ref.id
  return ref
}

// Pick the existing Option with the closest area to the new size — this
// is our price reference within a given OptionGroup. Returns null if no
// existing options carry dimensions.
function findClosestAreaOption(options: OptionDoc[], targetArea: number): OptionDoc | null {
  let best: OptionDoc | null = null
  let bestDelta = Infinity
  for (const o of options) {
    if (!o.widthIn || !o.heightIn) continue
    const area = o.widthIn * o.heightIn
    const delta = Math.abs(area - targetArea)
    if (delta < bestDelta) {
      bestDelta = delta
      best = o
    }
  }
  return best
}

function findClosestAreaSku(items: ProductionItemDoc[], targetArea: number): ProductionItemDoc | null {
  let best: ProductionItemDoc | null = null
  let bestDelta = Infinity
  for (const i of items) {
    if (!i.widthIn || !i.heightIn) continue
    const area = i.widthIn * i.heightIn
    const delta = Math.abs(area - targetArea)
    if (delta < bestDelta) {
      bestDelta = delta
      best = i
    }
  }
  return best
}

async function main() {
  console.log(
    `\n=== Square + panoramic sizes script ===\nMode: ${apply ? 'APPLY (will mutate DB)' : 'DRY-RUN (no changes)'}\n`,
  )
  const payload = await getPayload({ config })

  for (const templateSlug of TARGET_TEMPLATE_SLUGS) {
    console.log(`\n— Template: ${templateSlug} —`)

    const tmplLookup = await payload.find({
      collection: 'product-templates',
      where: { slug: { equals: templateSlug } },
      limit: 1,
      depth: 0,
    })
    const template = tmplLookup.docs[0] as unknown as TemplateDoc | undefined
    if (!template) {
      console.log('  ? template not found — skip')
      continue
    }

    // Identify the size OptionGroup that this template uses. We expect
    // exactly one size-input group in the template's configuration.
    let sizeGroupId: number | null = null
    for (const entry of template.configuration ?? []) {
      const groupId = refId(entry.optionGroup)
      if (groupId == null) continue
      const group = await payload.findByID({
        collection: 'option-groups',
        id: groupId,
        depth: 0,
      })
      if ((group as { inputType?: string } | null)?.inputType === 'size') {
        sizeGroupId = groupId
        break
      }
    }
    if (sizeGroupId == null) {
      console.log('  ? no size OptionGroup bound — skip')
      continue
    }

    const existing = await payload.find({
      collection: 'options',
      where: { optionGroup: { equals: sizeGroupId } },
      limit: 500,
      depth: 0,
    })
    const existingOpts = existing.docs as unknown as OptionDoc[]
    const existingValues = new Set(existingOpts.map((o) => o.value))

    const newOptionIds: number[] = []

    for (const ns of NEW_SIZES) {
      if (existingValues.has(ns.value)) {
        console.log(`    = ${ns.value} already exists — skip`)
        continue
      }
      const targetArea = ns.widthIn * ns.heightIn
      const ref = findClosestAreaOption(existingOpts, targetArea)
      if (!ref) {
        console.log(`    ? no reference Option to copy price from — skip ${ns.value}`)
        continue
      }

      if (apply) {
        const created = (await payload.create({
          collection: 'options',
          data: {
            optionGroup: sizeGroupId,
            label: ns.label,
            value: ns.value,
            priceModifierAmount: ref.priceModifierAmount,
            widthIn: ns.widthIn,
            heightIn: ns.heightIn,
            sortOrder: (ref.sortOrder ?? 0) + 200,
            isActive: true,
          },
        })) as unknown as { id: number }
        newOptionIds.push(created.id)
        console.log(
          `    + created ${ns.value} (id ${created.id}, ${ns.widthIn}×${ns.heightIn}″, ` +
            `+$${ref.priceModifierAmount} from ${ref.value})`,
        )
      } else {
        console.log(
          `    + would create ${ns.value} (${ns.widthIn}×${ns.heightIn}″, ` +
            `+$${ref.priceModifierAmount} from ${ref.value})`,
        )
      }
    }

    if (newOptionIds.length === 0) {
      if (!apply) console.log('  (dry-run had no new options for template update)')
      continue
    }

    // Update the template's allowedOptions for the size group.
    const updatedConfig: TemplateConfigEntry[] = (template.configuration ?? []).map((entry) => {
      if (refId(entry.optionGroup) !== sizeGroupId) return entry
      const current = (entry.allowedOptions ?? [])
        .map((x) => refId(x))
        .filter((x): x is number => x !== null)
      const merged = [...new Set<number>([...current, ...newOptionIds])]
      return { ...entry, allowedOptions: merged }
    })
    if (apply) {
      await payload.update({
        collection: 'product-templates',
        id: template.id,
        data: { configuration: updatedConfig },
      })
    }
    console.log(
      `  ${apply ? '→ updated' : '→ would update'} template "${template.slug}": +${newOptionIds.length} new option(s)`,
    )
  }

  // ProductionCatalog pass: one new SKU per (template-category × new size).
  console.log('\n— ProductionCatalog pass —')
  const allItems = await payload.find({
    collection: 'production-catalog',
    limit: 1000,
    depth: 0,
  })
  const items = allItems.docs as unknown as ProductionItemDoc[]
  const skusInDb = new Set(items.map((i) => i.sku))

  let pcCreated = 0
  let pcSkipped = 0

  for (const templateSlug of TARGET_TEMPLATE_SLUGS) {
    const category = TEMPLATE_TO_CATEGORY[templateSlug]
    if (!category) continue
    const itemsForCategory = items.filter((i) => i.category === category)

    for (const ns of NEW_SIZES) {
      const targetArea = ns.widthIn * ns.heightIn
      const ref = findClosestAreaSku(itemsForCategory, targetArea)
      if (!ref) {
        console.log(`    ? [${category}] no reference SKU for ${ns.value} — skip`)
        pcSkipped++
        continue
      }
      // Derive the new SKU by replacing the reference's dimensions with
      // the new ones in the SKU string. Falls back to a deterministic
      // suffix if the SKU doesn't encode dimensions.
      const refDimsPattern = new RegExp(
        `(\\b|[^0-9])${ref.widthIn}x${ref.heightIn}(\\b|[^0-9])`,
      )
      let newSku: string
      if (refDimsPattern.test(ref.sku)) {
        newSku = ref.sku.replace(refDimsPattern, (_m, a, b) => `${a}${ns.widthIn}x${ns.heightIn}${b}`)
      } else {
        newSku = `${ref.sku}-${ns.value}`
      }
      if (skusInDb.has(newSku)) {
        console.log(`    = ${newSku} already exists — skip`)
        pcSkipped++
        continue
      }
      // Derive the new name similarly.
      let newName: string
      if (refDimsPattern.test(ref.name)) {
        newName = ref.name.replace(refDimsPattern, (_m, a, b) => `${a}${ns.widthIn}x${ns.heightIn}${b}`)
      } else {
        newName = `${ref.name} ${ns.label}`
      }
      if (apply) {
        const created = (await payload.create({
          collection: 'production-catalog',
          data: {
            sku: newSku,
            name: newName,
            category,
            widthIn: ns.widthIn,
            heightIn: ns.heightIn,
            material: ref.material,
            finish: ref.finish,
            baseCost: ref.baseCost,
            leadTimeDays: ref.leadTimeDays,
            isActive: ref.isActive ?? true,
            notes: ref.notes,
          },
        })) as unknown as { id: number; sku: string }
        skusInDb.add(created.sku)
        pcCreated++
        console.log(
          `    + [${category}] created ${newSku} (id ${created.id}, ${ns.widthIn}×${ns.heightIn}″, ` +
            `cost $${ref.baseCost} from ${ref.sku})`,
        )
      } else {
        console.log(
          `    + [${category}] would create ${newSku} (${ns.widthIn}×${ns.heightIn}″, ` +
            `cost $${ref.baseCost} from ${ref.sku})`,
        )
        pcCreated++
      }
    }
  }

  console.log(
    `\n  ProductionCatalog: ${apply ? 'created' : 'would create'} ${pcCreated}, skipped ${pcSkipped}`,
  )
  console.log(
    `\n=== Done ===\n${apply ? 'Changes committed.' : 'Dry-run complete. Re-run with --apply to commit.'}\n`,
  )
  await close(payload)
}

async function close(payload: Awaited<ReturnType<typeof getPayload>>) {
  try {
    const maybeDestroy = (payload as unknown as { destroy?: () => Promise<void> }).destroy
    if (typeof maybeDestroy === 'function') await maybeDestroy.call(payload)
  } catch {
    // ignore
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\nScript failed:', err)
    process.exit(1)
  })
