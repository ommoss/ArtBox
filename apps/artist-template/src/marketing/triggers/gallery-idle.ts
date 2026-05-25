import type { RuleResult, TriggerContext } from './types'

const DEFAULT_IDLE_DAYS = 60

// Fires once per published gallery whose latest artwork is older than the
// configured threshold. Empty galleries get a prompt too — they're explicit
// onboarding gaps. One PromptInput per stale gallery; the runner dedups by
// gallery slug.
export async function evaluateGalleryIdle(
  ctx: TriggerContext,
): Promise<RuleResult> {
  const idleDays = ctx.settings.galleryIdleDays ?? DEFAULT_IDLE_DAYS

  const galleries = await ctx.payload.find({
    collection: 'galleries',
    where: { isPublished: { equals: true } },
    limit: 100,
    depth: 0,
  })
  if (galleries.docs.length === 0) return null

  const results = await Promise.all(
    galleries.docs.map(async (g) => {
      const recent = await ctx.payload.find({
        collection: 'artworks',
        where: {
          and: [
            { gallery: { equals: g.id } },
            { isPublished: { equals: true } },
          ],
        },
        sort: '-updatedAt',
        limit: 1,
        depth: 0,
      })
      const latest = recent.docs[0]
      // Reference point: the artwork's updatedAt if there is one, otherwise
      // the gallery's own createdAt (so an empty gallery still fires if it's
      // been sitting empty too long).
      const referenceTs = latest
        ? new Date(latest.updatedAt as string)
        : new Date(g.createdAt as string)
      const daysSince = Math.floor(
        (ctx.now.getTime() - referenceTs.getTime()) / (24 * 60 * 60 * 1000),
      )
      if (daysSince < idleDays) return null

      return {
        kind: 'gallery_idle' as const,
        dedupKey: `gallery_idle:${g.slug}`,
        title: `"${g.name}" hasn't grown in ${daysSince} days`,
        body: latest
          ? `Last addition to ${g.name} was ${daysSince} days ago. New pieces planned, or time to reshuffle the lineup?`
          : `${g.name} has been empty for ${daysSince} days. Upload at least one piece or unpublish the gallery.`,
        urgency: 'low' as const,
        payload: {
          gallerySlug: g.slug,
          galleryName: g.name,
          daysSince,
          isEmpty: !latest,
        },
      }
    }),
  )

  return results.filter((r): r is NonNullable<typeof r> => r !== null)
}
