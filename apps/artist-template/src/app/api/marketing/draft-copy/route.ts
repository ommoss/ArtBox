import config from '@payload-config'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import { getArtistBrand } from '@/lib/artist-config'
import { fetchEntitlements } from '@/lib/fulfillment-client'
import { DRAFT_MODEL, getAnthropicClient } from '@/marketing/llm/client'
import {
  buildSystemPrompt,
  buildUserPrompt,
  defaultTargetFor,
  type DraftContext,
} from '@/marketing/llm/prompts'
import type { PromptKind, SocialPlatform, SocialTarget } from '@/marketing/types'

type DraftRequestBody = {
  promptId?: string | number
  // Override the prompt's stored socialTarget for this draft. Useful when the
  // artist wants the same prompt drafted for multiple platforms.
  platform?: SocialPlatform | 'email'
}

// On-demand LLM caption draft for a specific prompt. The endpoint persists
// the draft back onto the prompt record so re-opening the modal is free.
export async function POST(req: NextRequest) {
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const entitlements = await fetchEntitlements()
  if (!entitlements.marketingEnabled) {
    return NextResponse.json(
      {
        error: 'not_entitled',
        message:
          'The marketing module is not enabled for this artist. Contact Artbox to enable it.',
      },
      { status: 403 },
    )
  }

  let body: DraftRequestBody
  try {
    body = (await req.json()) as DraftRequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.promptId) {
    return NextResponse.json(
      { error: 'Missing promptId' },
      { status: 400 },
    )
  }

  let prompt
  try {
    prompt = await payload.findByID({
      collection: 'marketing-prompts',
      id: body.promptId as number,
      depth: 0,
    })
  } catch {
    return NextResponse.json(
      { error: 'Prompt not found' },
      { status: 404 },
    )
  }

  const brand = getArtistBrand()
  const target = defaultTargetFor(
    (body.platform as SocialTarget) ?? (prompt.socialTarget as SocialTarget),
  )

  const ctx: DraftContext = {
    artistName: brand.artistName,
    tagline: brand.tagline,
    kind: prompt.kind as PromptKind,
    payload:
      (prompt.payload as Record<string, unknown> | null | undefined) ?? {},
    target,
  }

  let draft: string
  try {
    const anthropic = getAnthropicClient()
    const response = await anthropic.messages.create({
      model: DRAFT_MODEL,
      max_tokens: 1024,
      system: buildSystemPrompt(ctx),
      messages: [{ role: 'user', content: buildUserPrompt(ctx) }],
    })
    const textBlocks = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { text: string }).text)
    draft = textBlocks.join('\n').trim()
  } catch (err) {
    return NextResponse.json(
      {
        error: 'draft_failed',
        message: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 },
    )
  }

  // Persist the draft back so the same artist re-opening the modal doesn't
  // pay another API call. They can still regenerate explicitly.
  await payload.update({
    collection: 'marketing-prompts',
    id: prompt.id,
    data: {
      draftCopy: draft,
      socialTarget: target as SocialTarget,
    },
  })

  return NextResponse.json({
    draft,
    platform: target,
    promptId: prompt.id,
  })
}
