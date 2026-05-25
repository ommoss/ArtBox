import type { RuleResult, TriggerContext } from './types'

const DEFAULT_ROTATE_DAYS = 30

// Fires when the currently-featured artwork (the hero on editorial themes)
// has been featured for longer than the configured threshold. If nothing is
// featured but the editorial theme is in use, we treat the fallback hero
// (latest updated artwork) as stale once it's been the de-facto hero for
// that long.
export async function evaluateHeroRotate(
  ctx: TriggerContext,
): Promise<RuleResult> {
  const rotateDays = ctx.settings.heroRotateDays ?? DEFAULT_ROTATE_DAYS

  const featured = await ctx.payload.find({
    collection: 'artworks',
    where: {
      and: [
        { isPublished: { equals: true } },
        { isFeatured: { equals: true } },
      ],
    },
    sort: '-updatedAt',
    limit: 1,
    depth: 0,
  })

  const hero = featured.docs[0]
  // No featured artwork = no rotation prompt. The artist either hasn't
  // featured anything yet (a different concern) or doesn't care to.
  if (!hero) return null

  const updatedAt = new Date(hero.updatedAt as string)
  const daysSince = Math.floor(
    (ctx.now.getTime() - updatedAt.getTime()) / (24 * 60 * 60 * 1000),
  )
  if (daysSince < rotateDays) return null

  return {
    kind: 'hero_rotate',
    dedupKey: 'hero_rotate',
    title: `"${hero.title}" has been the featured hero for ${daysSince} days`,
    body: `Rotating the editorial hero keeps repeat visitors engaged. Feature a different piece, or update this one's metadata to signal it's still your headline work.`,
    urgency: 'low',
    payload: {
      currentHeroSlug: hero.slug,
      currentHeroTitle: hero.title,
      daysSince,
    },
    relatedArtworkId: Number(hero.id),
  }
}
