'use client'

import { useState } from 'react'

import type { PromptKind, PromptStatus, PromptUrgency, SocialPlatform, SocialTarget } from '../types'

import DraftModal from './DraftModal'

export type PromptSummary = {
  id: string | number
  title: string
  body?: string | null
  kind: PromptKind
  status: PromptStatus
  urgency: PromptUrgency
  draftCopy?: string | null
  socialTarget?: SocialTarget | null
  createdAt: string
}

type Props = {
  prompt: PromptSummary
}

const URGENCY_COLORS: Record<PromptUrgency, { bg: string; border: string; tag: string }> = {
  low: { bg: '#f8f8f8', border: '#e6e6e6', tag: '#999' },
  normal: { bg: '#fff', border: '#d8d8d8', tag: '#555' },
  high: { bg: '#fff8e6', border: '#f1c97e', tag: '#7a5a14' },
}

// Single prompt row in the admin dashboard widget. State (mark done, snooze,
// dismiss) is persisted via Payload's REST API; drafts go through the
// custom draft endpoint built in Phase 3.
export default function MarketingPromptCard({ prompt }: Props) {
  const [status, setStatus] = useState<PromptStatus>(prompt.status)
  const [busy, setBusy] = useState(false)
  const [showDraftModal, setShowDraftModal] = useState(false)
  const colors = URGENCY_COLORS[prompt.urgency]

  const updateStatus = async (next: PromptStatus, extraData: Record<string, unknown> = {}) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/marketing-prompts/${prompt.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: next, ...extraData }),
      })
      if (!res.ok) {
        setBusy(false)
        return
      }
      setStatus(next)
    } finally {
      setBusy(false)
    }
  }

  const snooze = () => {
    // Hard-coded one-week snooze for v0. Could expose a dropdown later.
    const until = new Date()
    until.setDate(until.getDate() + 7)
    updateStatus('snoozed', { snoozedUntil: until.toISOString() })
  }

  // Once acted on, fade the card so the artist sees the state change but the
  // list doesn't shift around mid-interaction.
  const isResolved = status === 'done' || status === 'dismissed'

  return (
    <div
      style={{
        padding: 14,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 6,
        marginBottom: 10,
        opacity: isResolved ? 0.5 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: 1,
                color: colors.tag,
                fontWeight: 600,
              }}
            >
              {prompt.urgency === 'high' ? '! ' : ''}
              {KIND_LABEL[prompt.kind]}
            </span>
            {status !== 'active' ? (
              <span
                style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  color: '#999',
                  fontStyle: 'italic',
                }}
              >
                · {status}
              </span>
            ) : null}
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#222' }}>{prompt.title}</div>
          {prompt.body ? (
            <div style={{ fontSize: '0.85rem', color: '#555', marginTop: 4, lineHeight: 1.4 }}>
              {prompt.body}
            </div>
          ) : null}
        </div>
      </div>

      {!isResolved ? (
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowDraftModal(true)}
            disabled={busy}
            style={primaryButton}
          >
            Draft a post
          </button>
          <button
            type="button"
            onClick={() => updateStatus('done', { resolvedAt: new Date().toISOString() })}
            disabled={busy}
            style={secondaryButton}
          >
            Mark done
          </button>
          <button type="button" onClick={snooze} disabled={busy} style={secondaryButton}>
            Snooze a week
          </button>
          <button
            type="button"
            onClick={() => updateStatus('dismissed', { resolvedAt: new Date().toISOString() })}
            disabled={busy}
            style={dismissButton}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {showDraftModal ? (
        <DraftModal
          promptId={prompt.id}
          promptTitle={prompt.title}
          initialDraft={prompt.draftCopy ?? null}
          defaultPlatform={
            prompt.socialTarget && prompt.socialTarget !== 'none'
              ? (prompt.socialTarget as SocialPlatform | 'email')
              : 'instagram'
          }
          onClose={() => setShowDraftModal(false)}
        />
      ) : null}
    </div>
  )
}

const KIND_LABEL: Record<PromptKind, string> = {
  catalog_idle: 'No new work',
  gallery_idle: 'Idle gallery',
  hero_rotate: 'Rotate hero',
  milestone: 'Milestone',
  top_performer: 'Top performer',
}

const primaryButton: React.CSSProperties = {
  padding: '6px 12px',
  background: '#1a1a1a',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: '0.85rem',
}
const secondaryButton: React.CSSProperties = {
  padding: '6px 12px',
  background: 'transparent',
  color: '#444',
  border: '1px solid #ccc',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: '0.85rem',
}
const dismissButton: React.CSSProperties = {
  padding: '6px 12px',
  background: 'transparent',
  color: '#999',
  border: '1px solid #e0e0e0',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: '0.85rem',
}
