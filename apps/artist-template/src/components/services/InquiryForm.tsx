'use client'

import Script from 'next/script'
import { useActionState, useEffect, useState } from 'react'

import { submitInquiry, type InquiryState } from '@/lib/inquiry-actions'

// Bot guard shared by every form that posts to submitInquiry: honeypot,
// render timestamp, and the Turnstile widget when a site key is configured.
export function BotGuard() {
  const [startedAt, setStartedAt] = useState(0)
  useEffect(() => setStartedAt(Date.now()), [])
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  return (
    <>
      <input type="hidden" name="startedAt" value={startedAt} />
      {/* Honeypot: visually removed, still in the DOM for scripts to fill. */}
      <div aria-hidden style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {siteKey ? (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
          <div className="cf-turnstile" data-sitekey={siteKey} data-size="flexible" />
        </>
      ) : null}
    </>
  )
}

const initial: InquiryState = { ok: false }

// Intake form on the marketing root. Asks only what qualifies a lead: the
// work, the look they liked, how much they launch with, whether they sell now.
export default function InquiryForm({ source }: { source: string }) {
  const [state, action, pending] = useActionState(submitInquiry, initial)

  if (state.ok) {
    return (
      <div className="inq-done" role="status">
        <strong>Got it. Thanks.</strong>
        <p>We reply within one business day. If you sent a link to your work, expect a draft site before anything is agreed.</p>
      </div>
    )
  }

  return (
    <form action={action} className="inq">
      <input type="hidden" name="source" value={source} />
      <BotGuard />
      <div className="inq-row">
        <label>
          Name
          <input name="name" required autoComplete="name" />
        </label>
        <label>
          Email
          <input name="email" type="email" required autoComplete="email" />
        </label>
      </div>
      <label>
        Link to your work
        <input name="portfolioUrl" type="url" placeholder="Instagram, website, or a shared folder" inputMode="url" />
      </label>
      <div className="inq-row inq-row--3">
        <label>
          Look you liked
          <select name="look" defaultValue="">
            <option value="">Not sure yet</option>
            <option value="wildlife">Wildlife</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="art">Fine Art</option>
            <option value="travel">Travel</option>
          </select>
        </label>
        <label>
          Pieces to launch with
          <select name="pieces" defaultValue="">
            <option value="">Choose</option>
            <option value="1-10">1 to 10</option>
            <option value="10-30">10 to 30</option>
            <option value="30-100">30 to 100</option>
            <option value="100+">More than 100</option>
          </select>
        </label>
        <label>
          Selling prints today?
          <select name="sellsToday" defaultValue="">
            <option value="">Choose</option>
            <option value="no">Not yet</option>
            <option value="occasionally">Occasionally</option>
            <option value="under-1k">Under $1,000 a month</option>
            <option value="1k-3k">$1,000 to $3,000 a month</option>
            <option value="over-3k">Over $3,000 a month</option>
          </select>
        </label>
      </div>
      <label>
        Anything else
        <textarea name="message" rows={4} placeholder="What you shoot, where you sell now, what you want the site to do." />
      </label>
      {state.error ? (
        <p className="inq-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="inq-actions">
        <button type="submit" className="svc-btn" disabled={pending}>
          {pending ? 'Sending…' : 'Send'}
        </button>
        <span className="inq-fine">No newsletter, no follow-up sequence. One person reads this.</span>
      </div>
    </form>
  )
}
