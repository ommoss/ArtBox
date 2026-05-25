'use client'

import { useEffect, useRef, useState } from 'react'

import type { SocialPlatform } from '../types'

type Props = {
  promptId: string | number
  promptTitle: string
  // Initial draft from the prompt record. If present, modal shows it
  // immediately and only calls the LLM if the artist clicks regenerate.
  initialDraft?: string | null
  defaultPlatform?: SocialPlatform | 'email'
  onClose: () => void
}

const PLATFORMS: (SocialPlatform | 'email')[] = [
  'instagram',
  'facebook',
  'twitter',
  'pinterest',
  'email',
]

const PLATFORM_LABEL: Record<SocialPlatform | 'email', string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  twitter: 'Twitter / X',
  pinterest: 'Pinterest',
  email: 'Email newsletter',
}

// Embedded modal — no portal, no z-index war. Caller renders this inside
// whichever surface invokes it (dashboard widget, dedicated marketing section).
export default function DraftModal({
  promptId,
  promptTitle,
  initialDraft,
  defaultPlatform = 'instagram',
  onClose,
}: Props) {
  const [platform, setPlatform] = useState<SocialPlatform | 'email'>(defaultPlatform)
  const [draft, setDraft] = useState(initialDraft ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  const generate = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/marketing/draft-copy', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ promptId, platform }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.message ?? data?.error ?? `Request failed (${res.status})`)
      } else {
        setDraft(data.draft ?? '')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => {
    if (!draft) return
    try {
      await navigator.clipboard.writeText(draft)
      setCopied(true)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy to clipboard. Select and copy manually.')
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Draft post"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          color: '#222',
          width: 'min(640px, 92vw)',
          maxHeight: '85vh',
          overflowY: 'auto',
          borderRadius: 8,
          padding: 24,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          fontFamily:
            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1.2, color: '#888' }}>
              Draft a post
            </div>
            <h2 style={{ margin: '4px 0 0', fontSize: '1.2rem' }}>{promptTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.4rem',
              cursor: 'pointer',
              color: '#666',
              lineHeight: 1,
              padding: 4,
            }}
          >
            ×
          </button>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ fontSize: '0.85rem', color: '#666', display: 'flex', alignItems: 'center', gap: 8 }}>
            Platform:
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as SocialPlatform | 'email')}
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: 4,
                background: '#fff',
              }}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABEL[p]}
                </option>
              ))}
            </select>
          </label>

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={busy ? 'Drafting…' : 'Click "Draft" to generate, or type your own.'}
            rows={8}
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #ddd',
              borderRadius: 4,
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              lineHeight: 1.5,
              resize: 'vertical',
              background: busy ? '#f8f8f8' : '#fff',
            }}
            disabled={busy}
          />

          {error ? (
            <div
              role="alert"
              style={{
                padding: 12,
                background: '#fee',
                border: '1px solid #fbb',
                borderRadius: 4,
                color: '#900',
                fontSize: '0.85rem',
              }}
            >
              {error}
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={generate}
              disabled={busy}
              style={{
                padding: '8px 16px',
                background: busy ? '#aaa' : '#1a1a1a',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: busy ? 'wait' : 'pointer',
                fontSize: '0.9rem',
              }}
            >
              {busy ? 'Drafting…' : draft ? 'Regenerate' : 'Draft'}
            </button>
            <button
              type="button"
              onClick={copy}
              disabled={!draft || busy}
              style={{
                padding: '8px 16px',
                background: '#fff',
                color: '#1a1a1a',
                border: '1px solid #1a1a1a',
                borderRadius: 4,
                cursor: !draft || busy ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
              }}
            >
              {copied ? 'Copied ✓' : 'Copy to clipboard'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
