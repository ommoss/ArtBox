import type { Payload } from 'payload'

import { fetchEntitlements } from '@/lib/fulfillment-client'

import { evaluateCatalogIdle } from './catalog-idle'
import { evaluateGalleryIdle } from './gallery-idle'
import { evaluateHeroRotate } from './hero-rotate'
import type {
  MarketingSettingsForTriggers,
  PromptInput,
  TriggerContext,
} from './types'

export type RunnerResult = {
  evaluated: number       // total prompts proposed by all rules
  created: number         // new prompts inserted
  duplicates: number      // skipped because an active matching prompt exists
  skippedReason?: 'not_entitled' | 'no_settings'
  ruleErrors: { rule: string; message: string }[]
}

// Rules are async functions returning a single PromptInput, an array, or
// null. We list them by stable name so errors and metrics report something
// useful.
const RULES = [
  { name: 'catalog_idle', evaluate: evaluateCatalogIdle },
  { name: 'gallery_idle', evaluate: evaluateGalleryIdle },
  { name: 'hero_rotate', evaluate: evaluateHeroRotate },
] as const

export async function runTriggers(payload: Payload): Promise<RunnerResult> {
  // Entitlement check first — Artbox controls whether this artist has the
  // marketing module at all. Locally-configured cadence/handles are
  // irrelevant if they're not entitled.
  const entitlements = await fetchEntitlements()
  if (!entitlements.marketingEnabled) {
    return {
      evaluated: 0,
      created: 0,
      duplicates: 0,
      skippedReason: 'not_entitled',
      ruleErrors: [],
    }
  }

  const settings = (await payload
    .findGlobal({ slug: 'marketing-settings' })
    .catch(() => null)) as MarketingSettingsForTriggers | null

  if (!settings) {
    return {
      evaluated: 0,
      created: 0,
      duplicates: 0,
      skippedReason: 'no_settings',
      ruleErrors: [],
    }
  }

  const ctx: TriggerContext = {
    payload,
    settings,
    now: new Date(),
  }

  // Collect all proposed prompts across rules. Surface per-rule failures so
  // one broken rule doesn't kill the rest.
  const proposed: PromptInput[] = []
  const ruleErrors: RunnerResult['ruleErrors'] = []
  for (const rule of RULES) {
    try {
      const result = await rule.evaluate(ctx)
      if (!result) continue
      if (Array.isArray(result)) proposed.push(...result)
      else proposed.push(result)
    } catch (err) {
      ruleErrors.push({
        rule: rule.name,
        message: err instanceof Error ? err.message : String(err),
      })
    }
  }

  if (proposed.length === 0) {
    return { evaluated: 0, created: 0, duplicates: 0, ruleErrors }
  }

  // Bulk dedup: pull all currently-active prompts whose (kind, dedupKey)
  // match anything we're about to insert. Cheaper than N existence probes.
  const activeMatches = await payload.find({
    collection: 'marketing-prompts',
    where: {
      and: [
        { status: { in: ['active', 'snoozed'] } },
        { kind: { in: Array.from(new Set(proposed.map((p) => p.kind))) } },
      ],
    },
    limit: 1000,
    depth: 0,
  })

  const existingKeys = new Set<string>()
  for (const doc of activeMatches.docs) {
    const docPayload = (doc as { payload?: Record<string, unknown> }).payload
    const dedupKey = computeDedupKey(doc.kind as string, docPayload ?? {})
    existingKeys.add(`${doc.kind}::${dedupKey}`)
  }

  let created = 0
  let duplicates = 0
  for (const input of proposed) {
    const key = `${input.kind}::${input.dedupKey}`
    if (existingKeys.has(key)) {
      duplicates++
      continue
    }
    await payload.create({
      collection: 'marketing-prompts',
      data: {
        title: input.title,
        body: input.body,
        kind: input.kind,
        status: 'active',
        urgency: input.urgency,
        payload: { dedupKey: input.dedupKey, ...input.payload },
        socialTarget: input.socialTarget ?? 'none',
        ...(input.relatedArtworkId
          ? { relatedArtwork: input.relatedArtworkId }
          : {}),
      },
    })
    existingKeys.add(key) // guard against duplicate inputs in the same run
    created++
  }

  return { evaluated: proposed.length, created, duplicates, ruleErrors }
}

// Mirrors the dedupKey writers use when inserting. Stored on the prompt's
// payload JSON under `dedupKey` so we don't need a dedicated column.
function computeDedupKey(_kind: string, payload: Record<string, unknown>): string {
  const stored = payload.dedupKey
  return typeof stored === 'string' ? stored : ''
}
