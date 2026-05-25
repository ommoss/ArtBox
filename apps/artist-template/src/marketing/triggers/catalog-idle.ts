import type { RuleResult, TriggerContext } from './types'

const DEFAULT_IDLE_DAYS = 14

// Fires when the artist hasn't published any new artworks in the configured
// number of days. Looks at the most recent published artwork's updatedAt as
// the proxy for "last activity."
export async function evaluateCatalogIdle(
  ctx: TriggerContext,
): Promise<RuleResult> {
  const idleDays = ctx.settings.catalogIdleDays ?? DEFAULT_IDLE_DAYS

  const recent = await ctx.payload.find({
    collection: 'artworks',
    where: { isPublished: { equals: true } },
    sort: '-updatedAt',
    limit: 1,
    depth: 0,
  })

  const latest = recent.docs[0]
  // Empty catalog isn't an "idle" prompt — it's an onboarding concern,
  // handled elsewhere. Bail out silently.
  if (!latest) return null

  const updatedAt = new Date(latest.updatedAt as string)
  const daysSince = Math.floor(
    (ctx.now.getTime() - updatedAt.getTime()) / (24 * 60 * 60 * 1000),
  )
  if (daysSince < idleDays) return null

  return {
    kind: 'catalog_idle',
    dedupKey: 'catalog_idle', // singleton — only ever one active
    title: `No new work in ${daysSince} days`,
    body:
      `Your last update was ${daysSince} days ago. Anything in progress worth sharing or queuing up?`,
    urgency: daysSince >= idleDays * 2 ? 'high' : 'normal',
    payload: {
      lastArtworkSlug: latest.slug,
      lastUpdatedAt: latest.updatedAt,
      daysSince,
    },
  }
}
