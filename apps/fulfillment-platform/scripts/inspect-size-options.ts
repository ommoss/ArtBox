/**
 * Read-only diagnostic: lists every Option in every size OptionGroup with
 * its value, label, widthIn, heightIn, and isActive. Use to spot
 * concatenated labels, swapped dimensions, duplicates, or any other
 * weirdness in the size data.
 *
 *   pnpm seed:inspect-size-options
 */

import { getPayload } from 'payload'

import config from '../src/payload.config'

type OptionDoc = {
  id: number
  optionGroup: number | { id: number }
  label?: string
  value?: string
  widthIn?: number | null
  heightIn?: number | null
  priceModifierAmount?: number
  sortOrder?: number | null
  isActive?: boolean
}

async function main() {
  const payload = await getPayload({ config })

  const sizeGroups = await payload.find({
    collection: 'option-groups',
    where: { inputType: { equals: 'size' } },
    limit: 100,
    depth: 0,
  })

  for (const group of sizeGroups.docs as unknown as Array<{
    id: number
    name: string
    slug: string
  }>) {
    console.log(`\n— Group "${group.name}" (slug: ${group.slug}, id: ${group.id}) —`)
    const result = await payload.find({
      collection: 'options',
      where: { optionGroup: { equals: group.id } },
      limit: 500,
      depth: 0,
      sort: 'sortOrder',
    })
    const opts = result.docs as unknown as OptionDoc[]
    const headers = ['id', 'value', 'label', 'widthIn', 'heightIn', '+price', 'active']
    const rows = opts.map((o) => [
      String(o.id),
      o.value ?? '',
      o.label ?? '',
      o.widthIn != null ? String(o.widthIn) : '—',
      o.heightIn != null ? String(o.heightIn) : '—',
      o.priceModifierAmount != null ? `$${o.priceModifierAmount}` : '—',
      o.isActive === false ? 'no' : 'yes',
    ])

    // Compute column widths for tabular display.
    const widths = headers.map((h, i) =>
      Math.max(h.length, ...rows.map((r) => r[i].length)),
    )
    const fmt = (r: string[]) => r.map((c, i) => c.padEnd(widths[i])).join(' │ ')
    console.log('  ' + fmt(headers))
    console.log('  ' + widths.map((w) => '─'.repeat(w)).join('─┼─'))
    for (const r of rows) console.log('  ' + fmt(r))

    // Flag suspicious entries.
    for (const o of opts) {
      if (!o.label || !o.value) {
        console.log(`  ! id ${o.id}: missing label/value`)
      }
      if (o.widthIn == null || o.heightIn == null) {
        console.log(`  ! id ${o.id}: missing widthIn/heightIn`)
        continue
      }
      // Label says e.g. "10 × 8″" but stored dims are 8×10 → swap mismatch
      const labelMatch = (o.label ?? '').match(/(\d+)\s*[×x]\s*(\d+)/)
      if (labelMatch) {
        const labelW = Number(labelMatch[1])
        const labelH = Number(labelMatch[2])
        if (labelW !== o.widthIn || labelH !== o.heightIn) {
          console.log(
            `  ! id ${o.id}: label "${o.label}" implies ${labelW}×${labelH} but dims are ${o.widthIn}×${o.heightIn}`,
          )
        }
      }
      // Value e.g. "10x8" should match stored dims similarly
      const valueMatch = (o.value ?? '').match(/^(\d+)x(\d+)$/)
      if (valueMatch) {
        const valW = Number(valueMatch[1])
        const valH = Number(valueMatch[2])
        if (valW !== o.widthIn || valH !== o.heightIn) {
          console.log(
            `  ! id ${o.id}: value "${o.value}" implies ${valW}×${valH} but dims are ${o.widthIn}×${o.heightIn}`,
          )
        }
      }
    }
  }

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
