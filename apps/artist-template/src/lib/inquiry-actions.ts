'use server'

import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

// Shared server action for the intake form (root) and the contact forms
// (demo + artist sites). Bot handling, in order of cost:
//   1. honeypot   — a hidden `website` field; humans never fill it
//   2. timing     — the form stamps when it rendered; anything submitted
//                   inside MIN_FILL_MS is a script
//   3. Turnstile  — verified only when TURNSTILE_SECRET_KEY is set, so the
//                   forms keep working before the keys exist
// Then the row is written to Payload (so nothing is lost if mail fails) and
// emailed through Resend's REST API. No Resend SDK; one fetch.

const MIN_FILL_MS = 3000
const MAX_FIELD = 4000

export type InquiryState = { ok: boolean; error?: string }

const clean = (v: FormDataEntryValue | null, max = MAX_FIELD) =>
  typeof v === 'string' ? v.trim().slice(0, max) : ''

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false
  try {
    const body = new URLSearchParams({ secret, response: token })
    if (ip) body.set('remoteip', ip)
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    })
    const data = (await r.json()) as { success?: boolean }
    return Boolean(data.success)
  } catch {
    return false
  }
}

async function sendMail(msg: { to: string; subject: string; text: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY
  if (!key) return false
  const from = process.env.RESEND_FROM || 'Moss Editions <onboarding@resend.dev>'
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [msg.to],
        subject: msg.subject,
        text: msg.text,
        ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
      }),
    })
    if (!r.ok) console.warn('[inquiry] resend failed', r.status, await r.text())
    return r.ok
  } catch (e) {
    console.warn('[inquiry] resend error', e)
    return false
  }
}

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  // 1. honeypot
  if (clean(formData.get('website'))) return { ok: true }

  // 2. timing
  const started = Number(formData.get('startedAt') || 0)
  if (!started || Date.now() - started < MIN_FILL_MS) {
    return { ok: false, error: 'That was quick. Please try sending again.' }
  }

  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || null

  // 3. turnstile (no-op until keys exist)
  if (!(await verifyTurnstile(clean(formData.get('cf-turnstile-response')), ip))) {
    return { ok: false, error: 'We could not verify you are human. Please try again.' }
  }

  const name = clean(formData.get('name'), 200)
  const email = clean(formData.get('email'), 200)
  const message = clean(formData.get('message'))
  const subject = clean(formData.get('subject'), 200)
  const portfolioUrl = clean(formData.get('portfolioUrl'), 500)
  const look = clean(formData.get('look'), 20)
  const pieces = clean(formData.get('pieces'), 20)
  const sellsToday = clean(formData.get('sellsToday'), 20)
  const source = clean(formData.get('source'), 60) || 'unknown'

  if (!name || !EMAIL_RE.test(email)) return { ok: false, error: 'Please give us your name and a valid email.' }
  if (!message && !portfolioUrl) return { ok: false, error: 'Add a message or a link to your work.' }

  const payload = await getPayload({ config })
  const row = await payload.create({
    collection: 'inquiries',
    overrideAccess: true,
    data: {
      name,
      email,
      subject: subject || undefined,
      message: message || undefined,
      portfolioUrl: portfolioUrl || undefined,
      look: (look || undefined) as never,
      pieces: (pieces || undefined) as never,
      sellsToday: (sellsToday || undefined) as never,
      source,
      status: 'new',
      userAgent: h.get('user-agent')?.slice(0, 300) || undefined,
    },
  })

  const to = process.env.INQUIRY_TO || 'admin@mosseditions.com'
  const lines = [
    `From: ${name} <${email}>`,
    `Source: ${source}`,
    subject ? `Subject: ${subject}` : null,
    portfolioUrl ? `Portfolio: ${portfolioUrl}` : null,
    look ? `Look: ${look}` : null,
    pieces ? `Pieces: ${pieces}` : null,
    sellsToday ? `Sells today: ${sellsToday}` : null,
    '',
    message || '(no message)',
    '',
    `Inquiry #${row.id}`,
  ].filter((l) => l !== null)

  const emailed = await sendMail({
    to,
    subject: `[Moss Editions] ${subject || 'New inquiry'} — ${name}`,
    text: lines.join('\n'),
    replyTo: email,
  })
  if (emailed) {
    await payload.update({ collection: 'inquiries', id: row.id, overrideAccess: true, data: { emailed: true } })
  }

  // Auto-reply. Fails silently until the sending domain is verified in
  // Resend (unverified accounts may only mail their own address).
  await sendMail({
    to: email,
    subject: 'Thanks — we have your note',
    text:
      `Hi ${name},\n\nThanks for getting in touch. We read every message and reply within one business day.\n\n` +
      `If you sent a link to your work, we'll come back with a draft site in the look you chose before anything is agreed.\n\n` +
      `Moss Editions\nVictoria, BC`,
  })

  return { ok: true }
}
