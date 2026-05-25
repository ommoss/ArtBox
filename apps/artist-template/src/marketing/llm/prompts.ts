import type { PromptKind, SocialPlatform, SocialTarget } from '../types'

export type DraftContext = {
  artistName: string
  tagline: string
  kind: PromptKind
  // Payload from the trigger that fired the prompt — keys vary by kind.
  payload: Record<string, unknown>
  // Where the caption is going. Drives character limit and tone hints.
  target: SocialPlatform | 'email'
}

const PLATFORM_LIMITS: Record<SocialPlatform | 'email', number> = {
  instagram: 2200,
  facebook: 500,
  twitter: 280,
  pinterest: 500,
  email: 800,
}

const PLATFORM_TONE: Record<SocialPlatform | 'email', string> = {
  instagram:
    'longer-form than Twitter, observational, can include light scene-setting and 2-4 hashtags at the end',
  facebook: 'conversational, slightly longer, no hashtags',
  twitter: 'tight, one or two sentences, no hashtags unless they\'re load-bearing',
  pinterest: 'descriptive of the image, search-friendly keywords, no hashtags',
  email:
    'subject-line-friendly opening, then 2-3 sentences as the body of a newsletter blurb',
}

export function buildSystemPrompt(ctx: DraftContext): string {
  const tagline = ctx.tagline
    ? ` Their work is "${ctx.tagline}".`
    : ''
  return [
    `You are drafting a social media post for ${ctx.artistName}, an artist.${tagline}`,
    '',
    'Voice: observational, understated, in the artist\'s first person. Not salesy. Not breathless. Treat the audience as people who already follow the work.',
    '',
    `Platform: ${ctx.target}. Tone: ${PLATFORM_TONE[ctx.target]}.`,
    `Maximum length: ${PLATFORM_LIMITS[ctx.target]} characters.`,
    '',
    'Output only the caption text. No preamble, no explanation, no labels, no quotation marks around the caption itself.',
  ].join('\n')
}

export function buildUserPrompt(ctx: DraftContext): string {
  switch (ctx.kind) {
    case 'catalog_idle': {
      const days = ctx.payload.daysSince
      return [
        `Context: It's been ${days} days since the artist last added a published piece to the site.`,
        '',
        'Draft a caption that gently surfaces what\'s coming next, or invites followers to suggest where they\'d like the work to go. Don\'t be apologetic about the gap — treat it as part of the normal creative cadence.',
      ].join('\n')
    }
    case 'gallery_idle': {
      const galleryName = ctx.payload.galleryName ?? 'a gallery'
      const isEmpty = Boolean(ctx.payload.isEmpty)
      const days = ctx.payload.daysSince
      if (isEmpty) {
        return [
          `Context: The "${galleryName}" gallery is empty and has been for ${days} days.`,
          '',
          'Draft a caption either teasing what work will eventually fill this gallery, or asking followers what they associate with the theme.',
        ].join('\n')
      }
      return [
        `Context: The "${galleryName}" gallery hasn't grown in ${days} days.`,
        '',
        'Draft a caption that resurfaces existing work from this series — an angle like "thinking about returning to this body of work" or "this piece still feels relevant" works well. Reference the gallery by name.',
      ].join('\n')
    }
    case 'hero_rotate': {
      const title = ctx.payload.currentHeroTitle ?? 'the current featured piece'
      const days = ctx.payload.daysSince
      return [
        `Context: "${title}" has been the featured / hero image on the artist's site for ${days} days.`,
        '',
        'Draft a caption highlighting this piece specifically — what makes it the work the artist would lead with right now. Mention the title.',
      ].join('\n')
    }
    case 'milestone':
    case 'top_performer':
      // Sales-event kinds aren't wired yet (Phase 2.5). Fall back to a
      // generic structure so the endpoint doesn't crash if a stale prompt
      // of this kind ends up in the DB.
      return [
        'Context: A milestone or top-performer prompt fired but its specific data is not yet wired to the draft engine.',
        '',
        'Draft a generic caption acknowledging a recent positive moment — leave specifics in [brackets] for the artist to fill in.',
      ].join('\n')
  }
}

export function defaultTargetFor(target: SocialTarget | null | undefined): SocialPlatform | 'email' {
  if (!target || target === 'none') return 'instagram'
  return target
}
