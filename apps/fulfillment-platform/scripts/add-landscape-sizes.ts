/**
 * One-off script: add landscape size Options to every size OptionGroup
 * that currently has portrait sizes, and add the new Options to the
 * `allowedOptions` of every ProductTemplate that uses that group.
 *
 * Idempotent — safe to run multiple times. Skips landscape variants that
 * already exist (matched by `value`).
 *
 * Defaults to DRY-RUN. Re-run with `--apply` to actually mutate the DB.
 *
 * Run from `apps/fulfillment-platform/`:
 *   pnpm seed:landscape-sizes              (dry-run — logs only)
 *   pnpm seed:landscape-sizes -- --apply   (commits changes)
 */

import { getPayload } from 'payload'

import config from '../src/payload.config'

// Mapping of portrait `value` → landscape `value` + `label`. The script
// only creates a landscape variant if its portrait equivalent exists in
// the target OptionGroup and the landscape value isn't already there.
//
// The landscape Option's widthIn/heightIn are computed by swapping the
// portrait's, so no need to encode them here.
const LANDSCAPE_MAP: Record<string, { value: string; label: string }> = {
  '8x10': { value: '10x8', label: '10 × 8″' },
  '11x14': { value: '14x11', label: '14 × 11″' },
  '16x20': { value: '20x16', label: '20 × 16″' },
  '20x24': { value: '24x20', label: '24 × 20″' },
  '24x36': { value: '36x24', label: '36 × 24″' },
  '12x16': { value: '16x12', label: '16 × 12″' },
  '20x30': { value: '30x20', label: '30 × 20″' },
  '30x40': { value: '40x30', label: '40 × 30″' },
}

const apply = process.argv.includes('--apply')

// IDs are numbers in the postgres adapter. Templates' nested relationship
// fields can be either a number (depth=0 fetch, what we use) or a populated
// object — `refId` normalises both to a number.
type OptionDoc = {
  id: number
  optionGroup: number | { id: number }
  label: string
  value: string
  priceModifierAmount: number
  swatchColor?: string
  previewImage?: string
  widthIn?: number | null
  heightIn?: number | null
  sortOrder?: number | null
  isActive?: boolean
}

type TemplateConfigEntry = {
  optionGroup: number | { id: number }
  // Use `undefined` only (not `null`) to match Payload's generated types.
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
  category: 'paper_print' | 'canvas' | 'framed' | 'block_mount' | 'art_card' | 'sticker' | 'poster'
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

async function main() {
  console.log(
    `\n=== Landscape-sizes script ===\nMode: ${apply ? 'APPLY (will mutate DB)' : 'DRY-RUN (no changes)'}\n`,
  )
  const payload = await getPayload({ config })

  // 1. Find all size-input OptionGroups
  const sizeGroups = await payload.find({
    collection: 'option-groups',
    where: { inputType: { equals: 'size' } },
    limit: 200,
    depth: 0,
  })

  if (sizeGroups.docs.length === 0) {
    console.log('No size OptionGroups found. Nothing to do.')
    await close(payload)
    return
  }

  console.log(`Found ${sizeGroups.docs.length} size OptionGroup(s).\n`)

  for (const group of sizeGroups.docs as unknown as Array<{ id: number; name: string; slug: string }>) {
    console.log(`\n— Group: "${group.name}" (slug: ${group.slug}, id: ${group.id})`)

    const existing = await payload.find({
      collection: 'options',
      where: { optionGroup: { equals: group.id } },
      limit: 500,
      depth: 0,
    })
    const existingValues = new Set((existing.docs as unknown as OptionDoc[]).map((o) => o.value))
    console.log(`  Existing options: ${existing.docs.length}`)

    const newOptionIds: number[] = []

    for (const portrait of existing.docs as unknown as OptionDoc[]) {
      // Only act on portrait sizes (w < h) with both dimensions defined.
      const w = portrait.widthIn ?? 0
      const h = portrait.heightIn ?? 0
      if (!w || !h) continue
      if (w >= h) continue

      const landscape = LANDSCAPE_MAP[portrait.value]
      if (!landscape) {
        console.log(`    ? no landscape mapping for value="${portrait.value}" — skip`)
        continue
      }
      if (existingValues.has(landscape.value)) {
        console.log(`    = ${landscape.value} already exists — skip`)
        continue
      }

      if (apply) {
        const created = (await payload.create({
          collection: 'options',
          data: {
            optionGroup: group.id,
            label: landscape.label,
            value: landscape.value,
            priceModifierAmount: portrait.priceModifierAmount,
            widthIn: portrait.heightIn ?? undefined,
            heightIn: portrait.widthIn ?? undefined,
            sortOrder: (portrait.sortOrder ?? 0) + 100,
            isActive: portrait.isActive ?? true,
          },
        })) as unknown as { id: number }
        newOptionIds.push(created.id)
        console.log(`    + created ${landscape.value} (id ${created.id}, ${portrait.heightIn}×${portrait.widthIn}″)`)
      } else {
        console.log(
          `    + would create ${landscape.value} (${portrait.heightIn}×${portrait.widthIn}″, +$${portrait.priceModifierAmount})`,
        )
      }
    }

    if (newOptionIds.length === 0) {
      if (!apply) console.log('  (dry-run had no new options to record for template updates)')
      continue
    }

    // 2. Update ProductTemplates that reference this OptionGroup so their
    //    allowedOptions include the new landscape Options.
    const templates = await payload.find({
      collection: 'product-templates',
      where: { 'configuration.optionGroup': { equals: group.id } },
      limit: 200,
      depth: 0,
    })

    for (const t of templates.docs as unknown as TemplateDoc[]) {
      const updatedConfig: TemplateConfigEntry[] = (t.configuration ?? []).map((entry) => {
        if (refId(entry.optionGroup) !== group.id) return entry
        const current = (entry.allowedOptions ?? [])
          .map((x) => refId(x))
          .filter((x): x is number => x !== null)
        const merged = [...new Set<number>([...current, ...newOptionIds])]
        return { ...entry, allowedOptions: merged }
      })
      if (apply) {
        await payload.update({
          collection: 'product-templates',
          id: t.id,
          data: { configuration: updatedConfig },
        })
      }
      console.log(
        `  ${apply ? '→ updated' : '→ would update'} template "${t.slug}": +${newOptionIds.length} landscape option(s)`,
      )
    }
  }

  // 3. Mirror the landscape variants into ProductionCatalog so the base
  //    cost / pricing lookup has matching SKUs. ProductionCatalog is the
  //    source-of-truth for production cost; without entries here, the
  //    landscape Option exists but has no underlying cost record.
  console.log('\n— ProductionCatalog pass —')
  const portraitItems = await payload.find({
    collection: 'production-catalog',
    where: {
      and: [
        { widthIn: { greater_than: 0 } },
        { heightIn: { greater_than: 0 } },
      ],
    },
    limit: 500,
    depth: 0,
  })

  // Build a lookup by sku for fast existence checks.
  const allItems = await payload.find({
    collection: 'production-catalog',
    limit: 1000,
    depth: 0,
  })
  const skusInDb = new Set(
    (allItems.docs as unknown as ProductionItemDoc[]).map((i) => i.sku),
  )

  let pcCreated = 0
  let pcSkipped = 0

  for (const portrait of portraitItems.docs as unknown as ProductionItemDoc[]) {
    const w = portrait.widthIn ?? 0
    const h = portrait.heightIn ?? 0
    if (!w || !h) continue
    if (w >= h) continue // already landscape or square — skip

    // Derive the landscape SKU by swapping "WxH" → "HxW" inside the SKU
    // string. Only does this when the SKU contains a literal "WxH" segment
    // matching the portrait's dimensions; otherwise we don't know the
    // convention and skip with a warning.
    const dimsPattern = new RegExp(`(\\b|[^0-9])${w}x${h}(\\b|[^0-9])`)
    if (!dimsPattern.test(portrait.sku)) {
      console.log(
        `    ? SKU "${portrait.sku}" doesn't encode "${w}x${h}" — can't derive landscape SKU, skip`,
      )
      pcSkipped++
      continue
    }
    const landscapeSku = portrait.sku.replace(dimsPattern, (_m, a, b) => `${a}${h}x${w}${b}`)
    if (skusInDb.has(landscapeSku)) {
      console.log(`    = ${landscapeSku} already exists — skip`)
      pcSkipped++
      continue
    }

    // Name typically follows the same dimensions pattern; rewrite it too
    // when possible. Falls back to appending "(landscape)" if no match.
    let landscapeName: string
    if (dimsPattern.test(portrait.name)) {
      landscapeName = portrait.name.replace(dimsPattern, (_m, a, b) => `${a}${h}x${w}${b}`)
    } else {
      landscapeName = `${portrait.name} (landscape)`
    }

    if (apply) {
      const created = (await payload.create({
        collection: 'production-catalog',
        data: {
          sku: landscapeSku,
          name: landscapeName,
          category: portrait.category,
          widthIn: h,
          heightIn: w,
          material: portrait.material,
          finish: portrait.finish,
          baseCost: portrait.baseCost,
          leadTimeDays: portrait.leadTimeDays,
          isActive: portrait.isActive ?? true,
          notes: portrait.notes,
        },
      })) as unknown as { id: number; sku: string }
      skusInDb.add(created.sku)
      pcCreated++
      console.log(
        `    + created ${landscapeSku} (id ${created.id}, ${h}×${w}″, cost $${portrait.baseCost})`,
      )
    } else {
      console.log(
        `    + would create ${landscapeSku} (${h}×${w}″, cost $${portrait.baseCost}, from "${portrait.sku}")`,
      )
      pcCreated++
    }
  }

  console.log(
    `  ProductionCatalog: ${apply ? 'created' : 'would create'} ${pcCreated}, skipped ${pcSkipped}`,
  )

  console.log(
    `\n=== Done ===\n${apply ? 'Changes committed.' : 'Dry-run complete. Re-run with --apply to commit.'}\n`,
  )
  await close(payload)
}

async function close(payload: Awaited<ReturnType<typeof getPayload>>) {
  // payload.destroy() closes the DB pool so the script can exit cleanly.
  // Without it Node may hang on open connections.
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
