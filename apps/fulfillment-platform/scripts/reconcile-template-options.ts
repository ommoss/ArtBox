/**
 * One-off reconcile: walk every active Product Template and ensure each
 * `configuration[].allowedOptions` includes every active Option that
 * belongs to that entry's OptionGroup. Catches up any drift where
 * Options exist but haven't been bound to templates yet (e.g. when the
 * landscape/square/panoramic seed scripts created Options but the
 * template-update step didn't take).
 *
 * Idempotent. Defaults to DRY-RUN. Re-run with `--apply` to mutate the DB.
 *
 *   pnpm seed:reconcile-template-options
 *   pnpm seed:reconcile-template-options -- --apply
 */

import { getPayload } from 'payload'

import config from '../src/payload.config'

const apply = process.argv.includes('--apply')

type OptionDoc = {
  id: number
  optionGroup: number | { id: number }
  label: string
  value: string
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
  name: string
  configuration?: TemplateConfigEntry[]
}

function refId(ref: number | { id: number } | null | undefined): number | null {
  if (ref == null) return null
  if (typeof ref === 'object') return ref.id
  return ref
}

async function main() {
  console.log(
    `\n=== Reconcile template options ===\nMode: ${apply ? 'APPLY (will mutate DB)' : 'DRY-RUN (no changes)'}\n`,
  )
  const payload = await getPayload({ config })

  // Load all active Options once and index by optionGroup id.
  const allOptions = await payload.find({
    collection: 'options',
    limit: 5000,
    depth: 0,
  })
  const optionsByGroup = new Map<number, OptionDoc[]>()
  for (const o of allOptions.docs as unknown as OptionDoc[]) {
    if (o.isActive === false) continue
    const gid = refId(o.optionGroup)
    if (gid == null) continue
    const arr = optionsByGroup.get(gid) ?? []
    arr.push(o)
    optionsByGroup.set(gid, arr)
  }

  // Walk every active template and check its allowedOptions per group.
  const templates = await payload.find({
    collection: 'product-templates',
    where: { isActive: { equals: true } },
    limit: 500,
    depth: 0,
    sort: 'slug',
  })

  let templatesUpdated = 0
  let totalAdditions = 0

  for (const t of templates.docs as unknown as TemplateDoc[]) {
    const config = t.configuration ?? []
    const additionsByEntry: Array<{ entryIdx: number; missing: number[] }> = []

    config.forEach((entry, idx) => {
      const gid = refId(entry.optionGroup)
      if (gid == null) return
      const allowed = new Set(
        (entry.allowedOptions ?? []).map((x) => refId(x)).filter((x): x is number => x !== null),
      )
      const groupOptions = optionsByGroup.get(gid) ?? []
      const missing = groupOptions.filter((o) => !allowed.has(o.id)).map((o) => o.id)
      if (missing.length > 0) {
        additionsByEntry.push({ entryIdx: idx, missing })
      }
    })

    if (additionsByEntry.length === 0) continue

    const summary = additionsByEntry
      .map(({ entryIdx, missing }) => `entry[${entryIdx}]: +${missing.length}`)
      .join(', ')
    console.log(
      `  ${apply ? '→ updating' : '→ would update'} "${t.slug}" (${t.name}): ${summary}`,
    )

    if (apply) {
      const updated = config.map((entry, idx) => {
        const found = additionsByEntry.find((a) => a.entryIdx === idx)
        if (!found) return entry
        const current = (entry.allowedOptions ?? [])
          .map((x) => refId(x))
          .filter((x): x is number => x !== null)
        return { ...entry, allowedOptions: [...current, ...found.missing] }
      })
      await payload.update({
        collection: 'product-templates',
        id: t.id,
        data: { configuration: updated },
      })
    }
    templatesUpdated++
    totalAdditions += additionsByEntry.reduce((acc, a) => acc + a.missing.length, 0)
  }

  console.log(
    `\n  Templates ${apply ? 'updated' : 'would update'}: ${templatesUpdated} (${totalAdditions} option assignments total)`,
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
