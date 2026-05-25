import Anthropic from '@anthropic-ai/sdk'

// Anthropic SDK singleton — initialized lazily so missing-API-key errors
// surface at call time (returnable as JSON), not at module load.
let cached: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (cached) return cached
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Add it to apps/artist-template/.env for the marketing module to draft copy.',
    )
  }
  cached = new Anthropic({ apiKey })
  return cached
}

// Default model: Haiku 4.5. Caption drafting doesn't need Opus-level reasoning
// and Haiku is ~5x cheaper. Override per-request if a specific draft needs more
// thoughtfulness.
export const DRAFT_MODEL = 'claude-haiku-4-5'
