'use client'

import { useActionState } from 'react'

import { BotGuard } from '@/components/services/InquiryForm'
import { submitInquiry, type InquiryState } from '@/lib/inquiry-actions'

const initial: InquiryState = { ok: false }

// Contact form on demo and artist sites. Posts to the same inquiries
// collection and mailbox as the intake form, tagged with the site it came
// from, so a prospect poking at a demo still reaches a person.
export default function ContactForm({
  defaultSubject = '',
  source,
}: {
  defaultSubject?: string
  source: string
}) {
  const [state, action, pending] = useActionState(submitInquiry, initial)

  if (state.ok) {
    return (
      <div
        style={{
          padding: 20,
          background: 'color-mix(in srgb, var(--color-accent) 12%, var(--color-surface))',
          border: '1px solid color-mix(in srgb, var(--color-accent) 45%, transparent)',
          borderRadius: 'var(--control-radius)',
        }}
      >
        <p style={{ margin: 0, color: 'var(--color-primary)', fontWeight: 500 }}>
          Thanks — we&apos;ll be in touch shortly.
        </p>
      </div>
    )
  }

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input type="hidden" name="source" value={source} />
      <BotGuard />
      <Field label="Your name" name="name" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Subject" name="subject" defaultValue={defaultSubject} />
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.85rem' }}>
        Message
        <textarea
          name="message"
          rows={6}
          required
          style={{
            padding: '8px 10px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--control-radius)',
            fontSize: '1rem',
            fontFamily: 'inherit',
            resize: 'vertical',
            background: 'var(--color-surface)',
            color: 'var(--color-primary)',
          }}
        />
      </label>
      {state.error ? (
        <p role="alert" style={{ margin: 0, color: 'var(--color-accent)', fontSize: '0.9rem' }}>
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        style={{
          padding: '12px 20px',
          background: pending ? 'var(--color-secondary)' : 'var(--color-primary)',
          color: 'var(--color-bg)',
          border: 'none',
          borderRadius: 'var(--control-radius)',
          cursor: pending ? 'wait' : 'pointer',
          fontSize: '1rem',
          alignSelf: 'flex-start',
        }}
      >
        {pending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
}: {
  defaultValue?: string
  label: string
  name: string
  type?: string
  required?: boolean
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.85rem' }}>
      {label}
      <input
        defaultValue={defaultValue}
        type={type}
        name={name}
        required={required}
        style={{
          padding: '8px 10px',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--control-radius)',
          fontSize: '1rem',
          background: 'var(--color-surface)',
          color: 'var(--color-primary)',
        }}
      />
    </label>
  )
}
