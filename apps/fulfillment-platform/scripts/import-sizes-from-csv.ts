/**
 * Replace all size data from a CSV.
 *
 * Expected CSV format (header row required):
 *
 *   category,value,label,widthIn,heightIn,baseCost
 *   framed,8x10,8 × 10″,8,10,25
 *   framed,10x8,10 × 8″,10,8,25
 *   canvas,12x16,12 × 16″,12,16,30
 *   ...
 *
 * What it does (in `--apply` mode):
 *   1. WIPE — deletes every Option in every size-input OptionGroup, and
 *      every ProductionCatalog entry that has BOTH widthIn AND heightIn
 *      populated. (Heuristic: "size-driven" SKUs.) Existing OrderLine
 *      references to those IDs become dangling; the configuration JSON
 *      snapshot on each line preserves what was sold.
 *   2. INSERT — creates one Option per CSV row in the matching template's
 *      size OptionGroup, and one ProductionCatalog SKU per row. SKU is
 *      derived from a category prefix + the row's value.
 *   3. ASSIGN — for each ProductTemplate, sets its size-group
 *      `allowedOptions` to the new Option IDs whose category matches.
 *
 * Defaults to DRY-RUN. Re-run with `--apply` to mutate the DB.
 *
 *   pnpm seed:import-sizes-csv path/to/sizes.csv
 *   pnpm seed:import-sizes-csv path/to/sizes.csv -- --apply
 */

import fs from 'node:fs'
import path from 'node:path'

import { getPayload } from 'payload'

import config from '../src/payload.config'

const apply = process.argv.includes('--apply')
const csvPath = process.argv
  .slice(2)
  .find((a) => !a.startsWith('--') && a.toLowerCase().endsWith('.csv'))

// Only the categories that ProductionCatalog supports. ProductTemplate
// also has 'calendar' but ProductionCatalog doesn't, so the CSV importer
// (which writes both) is constrained to this set.
type ProductionCategory =
  | 'framed'
  | 'canvas'
  | 'paper_print'
  | 'block_mount'
  | 'art_card'
  | 'sticker'
  | 'poster'

const VALID_CATEGORIES: ProductionCategory[] = [
  'framed',
  'canvas',
  'paper_print',
  'block_mount',
  'art_card',
  'sticker',
  'poster',
]

function asCategory(s: string): ProductionCategory {
  if ((VALID_CATEGORIES as string[]).includes(s)) return s as ProductionCategory
  throw new Error(
    `Invalid category "${s}". Must be one of: ${VALID_CATEGORIES.join(', ')}`,
  )
}

type CsvRow = {
  category: ProductionCategory
  value: string
  label: string
  widthIn: number
  heightIn: number
  baseCost: number
}

type OptionDoc = {
  id: number
  optionGroup: number | { id: number }
}

type TemplateConfigEntry = {
  optionGroup: number | { id: number }
  allowedOptions?: Array<number | { id: number }>
  isRequired?: boolean
}

type TemplateDoc = {
  id: number
  slug: string
  category: ProductionCategory
  configuration?: TemplateConfigEntry[]
}

function refId(ref: number | { id: number } | null | undefined): number | null {
  if (ref == null) return null
  if (typeof ref === 'object') return ref.id
  return ref
}

// Minimal CSV parser handling quoted fields + escaped quotes. Each row is
// a string array; the caller maps to the header row.
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let current: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += ch
      i++
      continue
    }
    if (ch === '"') {
      inQuotes = true
      i++
      continue
    }
    if (ch === ',') {
      current.push(field)
      field = ''
      i++
      continue
    }
    if (ch === '\n' || ch === '\r') {
      // End of row — consume \r\n pair if present
      current.push(field)
      field = ''
      if (current.length > 1 || current[0] !== '') rows.push(current)
      current = []
      if (ch === '\r' && text[i + 1] === '\n') i += 2
      else i++
      continue
    }
    field += ch
    i++
  }
  // Final field/row
  if (field !== '' || current.length > 0) {
    current.push(field)
    if (current.length > 1 || current[0] !== '') rows.push(current)
  }
  return rows
}

function parseCsvFile(p: string): CsvRow[] {
  const text = fs.readFileSync(p, 'utf-8')
  const rows = parseCsv(text)
  if (rows.length < 2) throw new Error('CSV has no data rows')
  const headers = rows[0].map((h) => h.trim().toLowerCase())
  const required = ['category', 'value', 'label', 'widthin', 'heightin', 'basecost']
  for (const r of required) {
    if (!headers.includes(r)) throw new Error(`CSV missing required column: ${r}`)
  }
  const idx = (name: string) => headers.indexOf(name)
  return rows.slice(1).map((row, i) => {
    const get = (col: string) => row[idx(col)]?.trim() ?? ''
    const widthIn = Number(get('widthin'))
    const heightIn = Number(get('heightin'))
    const baseCost = Number(get('basecost'))
    if (Number.isNaN(widthIn) || Number.isNaN(heightIn) || Number.isNaN(baseCost)) {
      throw new Error(`Row ${i + 2}: widthIn/heightIn/baseCost must be numeric`)
    }
    return {
      category: asCategory(get('category')),
      value: get('value'),
      label: get('label'),
      widthIn,
      heightIn,
      baseCost,
    }
  })
}

const SKU_PREFIX_BY_CATEGORY: Record<string, string> = {
  framed: 'FRM',
  canvas: 'CNV',
  paper_print: 'PPR',
  block_mount: 'BLK',
  art_card: 'CRD',
  sticker: 'STK',
  poster: 'POS',
  calendar: 'CAL',
}

function makeSku(category: string, value: string): string {
  const prefix = SKU_PREFIX_BY_CATEGORY[category] ?? category.toUpperCase().slice(0, 3)
  return `${prefix}-${value}`
}

function prettyCategory(category: string): string {
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

async function main() {
  if (!csvPath) {
    console.error('Usage: pnpm seed:import-sizes-csv path/to/sizes.csv [-- --apply]\n')
    process.exit(1)
  }
  const resolvedPath = path.resolve(csvPath)
  console.log(
    `\n=== Import sizes from CSV ===\nCSV: ${resolvedPath}\nMode: ${apply ? 'APPLY (will mutate DB)' : 'DRY-RUN (no changes)'}\n`,
  )

  const csvRows = parseCsvFile(resolvedPath)
  console.log(`Parsed ${csvRows.length} CSV rows.\n`)

  const payload = await getPayload({ config })

  // ---- Discover the size OptionGroup used by each category ----
  const allTemplates = (
    await payload.find({
      collection: 'product-templates',
      limit: 500,
      depth: 0,
    })
  ).docs as unknown as TemplateDoc[]

  const allGroups = (
    await payload.find({
      collection: 'option-groups',
      limit: 200,
      depth: 0,
    })
  ).docs as unknown as Array<{ id: number; slug: string; inputType: string }>
  const sizeGroupIds = new Set(
    allGroups.filter((g) => g.inputType === 'size').map((g) => g.id),
  )

  const categoryToGroup = new Map<string, number>()
  for (const t of allTemplates) {
    for (const entry of t.configuration ?? []) {
      const ogId = refId(entry.optionGroup)
      if (ogId != null && sizeGroupIds.has(ogId)) {
        if (!categoryToGroup.has(t.category)) {
          categoryToGroup.set(t.category, ogId)
        }
        break
      }
    }
  }

  const csvCategories = new Set(csvRows.map((r) => r.category))
  for (const cat of csvCategories) {
    if (!categoryToGroup.has(cat)) {
      console.warn(
        `  ! WARNING: CSV has category "${cat}" but no template uses it with a size group. Rows will be skipped.`,
      )
    }
  }

  // ---- 1. WIPE ----
  console.log('— WIPE phase —')
  // Delete every Option in every size OptionGroup
  let optionsDeleted = 0
  for (const groupId of sizeGroupIds) {
    const existing = await payload.find({
      collection: 'options',
      where: { optionGroup: { equals: groupId } },
      limit: 1000,
      depth: 0,
    })
    for (const o of existing.docs as unknown as OptionDoc[]) {
      if (apply) await payload.delete({ collection: 'options', id: o.id })
      optionsDeleted++
    }
  }
  console.log(
    `  ${apply ? '× deleted' : '× would delete'} ${optionsDeleted} options across ${sizeGroupIds.size} size group(s)`,
  )

  // Delete every ProductionCatalog entry that has both widthIn AND heightIn
  // — those are the "size-driven" entries the CSV is replacing.
  const allPc = await payload.find({
    collection: 'production-catalog',
    limit: 5000,
    depth: 0,
  })
  let pcDeleted = 0
  for (const p of allPc.docs as unknown as Array<{
    id: number
    widthIn?: number | null
    heightIn?: number | null
  }>) {
    if (p.widthIn != null && p.heightIn != null) {
      if (apply) await payload.delete({ collection: 'production-catalog', id: p.id })
      pcDeleted++
    }
  }
  console.log(
    `  ${apply ? '× deleted' : '× would delete'} ${pcDeleted} production-catalog entries (those with widthIn + heightIn)`,
  )

  // ---- 2. INSERT ----
  console.log('\n— INSERT phase —')
  const newOptionIdsByCategory = new Map<string, number[]>()

  for (let i = 0; i < csvRows.length; i++) {
    const row = csvRows[i]
    const groupId = categoryToGroup.get(row.category)
    if (groupId == null) continue

    if (apply) {
      const created = (await payload.create({
        collection: 'options',
        data: {
          optionGroup: groupId,
          label: row.label,
          value: row.value,
          priceModifierAmount: row.baseCost,
          widthIn: row.widthIn,
          heightIn: row.heightIn,
          sortOrder: i,
          isActive: true,
        },
      })) as unknown as { id: number }
      const arr = newOptionIdsByCategory.get(row.category) ?? []
      arr.push(created.id)
      newOptionIdsByCategory.set(row.category, arr)
    } else {
      const arr = newOptionIdsByCategory.get(row.category) ?? []
      arr.push(-1)
      newOptionIdsByCategory.set(row.category, arr)
    }
    console.log(
      `  + ${apply ? 'created' : 'would create'} option ${row.category}/${row.value} (${row.widthIn}×${row.heightIn}″, $${row.baseCost})`,
    )

    // ProductionCatalog entry
    const sku = makeSku(row.category, row.value)
    const name = `${prettyCategory(row.category)} ${row.label}`
    if (apply) {
      await payload.create({
        collection: 'production-catalog',
        data: {
          sku,
          name,
          category: row.category,
          widthIn: row.widthIn,
          heightIn: row.heightIn,
          baseCost: row.baseCost,
          isActive: true,
        },
      })
    }
    console.log(
      `    + ${apply ? 'created' : 'would create'} pc sku ${sku} ($${row.baseCost})`,
    )
  }

  // ---- 3. ASSIGN ----
  console.log('\n— ASSIGN phase —')
  for (const t of allTemplates) {
    const groupId = categoryToGroup.get(t.category)
    if (groupId == null) continue
    const newOptionIds = newOptionIdsByCategory.get(t.category) ?? []
    if (newOptionIds.length === 0) continue

    const updatedConfig = (t.configuration ?? []).map((entry) => {
      if (refId(entry.optionGroup) !== groupId) return entry
      return { ...entry, allowedOptions: newOptionIds }
    })
    if (apply) {
      await payload.update({
        collection: 'product-templates',
        id: t.id,
        data: { configuration: updatedConfig },
      })
    }
    console.log(
      `  → ${apply ? 'updated' : 'would update'} template "${t.slug}" (${t.category}): allowedOptions = ${newOptionIds.length} size(s)`,
    )
  }

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
