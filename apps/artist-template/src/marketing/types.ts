// Shared types for the Marketing module. Kept loose at the boundary so the
// Payload schema can be the source of truth — we hand-mirror the union values
// here to avoid a circular dep on payload-types.ts.

export type PromptKind =
  | 'catalog_idle'      // No new artwork in N days
  | 'gallery_idle'      // A specific gallery hasn't grown
  | 'hero_rotate'       // Editorial featured artwork stale
  | 'milestone'         // 10th / 100th / 500th order, etc.
  | 'top_performer'     // Top-selling/viewed piece this period

export type PromptStatus = 'active' | 'snoozed' | 'dismissed' | 'done'

export type PromptUrgency = 'low' | 'normal' | 'high'

export type SocialPlatform = 'instagram' | 'facebook' | 'twitter' | 'pinterest'

export type SocialTarget = SocialPlatform | 'email' | 'none'

export const PROMPT_KIND_LABELS: Record<PromptKind, string> = {
  catalog_idle: 'No new work',
  gallery_idle: 'Idle gallery',
  hero_rotate: 'Rotate hero',
  milestone: 'Milestone',
  top_performer: 'Top performer',
}
