'use client'

import { useState, useTransition } from 'react'

export default function ContactForm() {
  const [sent, setSent] = useState(false)
  const [pending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    startTransition(async () => {
      // Demo: simulate a network round-trip without sending anything.
      await new Promise((r) => setTimeout(r, 500))
      setSent(true)
    })
  }

  if (sent) {
    return (
      <div
        style={{
          padding: 20,
          background: '#f0f9f4',
          border: '1px solid #b0d8be',
          borderRadius: 4,
        }}
      >
        <p style={{ margin: 0, color: '#1a7f46', fontWeight: 500 }}>
          Thanks — we&apos;ll be in touch shortly.
        </p>
        <p style={{ marginTop: 6, marginBottom: 0, color: '#666', fontSize: '0.85rem' }}>
          (Demo only — no message was actually sent. Real form will route to the artist&apos;s
          email of choice.)
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Field label="Your name" name="name" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Subject" name="subject" />
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.85rem' }}>
        Message
        <textarea
          name="message"
          rows={6}
          required
          style={{
            padding: '8px 10px',
            border: '1px solid #ccc',
            borderRadius: 4,
            fontSize: '1rem',
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        style={{
          padding: '12px 20px',
          background: pending ? '#666' : '#111',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
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
}: {
  label: string
  name: string
  type?: string
  required?: boolean
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.85rem' }}>
      {label}
      <input
        type={type}
        name={name}
        required={required}
        style={{
          padding: '8px 10px',
          border: '1px solid #ccc',
          borderRadius: 4,
          fontSize: '1rem',
        }}
      />
    </label>
  )
}
