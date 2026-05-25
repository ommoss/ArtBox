import config from '@payload-config'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import { runTriggers } from '@/marketing/triggers/runner'

// Runs the marketing trigger engine and inserts any new prompts. Two ways
// to invoke:
//
// 1. Authenticated user (admin UI button) — uses the Payload session cookie.
// 2. Scheduled call (Vercel Cron, future) — passes a shared secret in the
//    Authorization header. Set CRON_SECRET in env to enable.
//
// Returns a summary of what ran so the UI can show "created N prompts".
export async function POST(req: NextRequest) {
  const payload = await getPayload({ config })

  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')
  const cronOk =
    Boolean(cronSecret) && authHeader === `Bearer ${cronSecret}`

  if (!cronOk) {
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const result = await runTriggers(payload)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      {
        error: 'Trigger run failed',
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    )
  }
}
