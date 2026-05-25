import type { Payload } from 'payload'

import type {
  PromptKind,
  PromptUrgency,
  SocialTarget,
} from '../types'

// Settings shape the trigger engine cares about. Mirrors the fields on the
// MarketingSettings global — kept loose so we don't pull in payload-types.ts
// for what's effectively a value object. Note: the entitlement check (is
// the module available at all?) lives in fulfillment, not here.
export type MarketingSettingsForTriggers = {
  catalogIdleDays?: number | null
  galleryIdleDays?: number | null
  heroRotateDays?: number | null
}

export type TriggerContext = {
  payload: Payload
  settings: MarketingSettingsForTriggers
  now: Date
}

// What a rule emits when it decides a prompt should fire. The runner is
// responsible for dedup and insertion — rules just describe what the prompt
// would say.
export type PromptInput = {
  kind: PromptKind
  // Stable key used for deduplication against existing active prompts of the
  // same kind. e.g. for gallery_idle, this is the gallery slug; for
  // catalog_idle, it's a constant. Two rules emitting prompts with the same
  // (kind, dedupKey) won't double-up.
  dedupKey: string
  title: string
  body?: string
  urgency: PromptUrgency
  // Kind-specific context, persisted as JSON on the prompt and read later by
  // the LLM draft endpoint.
  payload: Record<string, unknown>
  relatedArtworkId?: number
  socialTarget?: SocialTarget
}

export type RuleResult = PromptInput | PromptInput[] | null
