'use client'

import { useState } from 'react'

// Manual trigger button — useful before cron is set up in Phase 5. Shows the
// per-rule result counts so the artist can confirm the engine actually ran.
export default function MarketingRunTriggersButton() {
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    setBusy(true)
    setResult(null)
    setError(null)
    try {
      const res = await fetch('/api/marketing/run-triggers', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.message ?? data?.error ?? `Request failed (${res.status})`)
      } else if (data.skippedReason === 'not_entitled') {
        setError('Marketing module is not enabled for this artist.')
      } else {
        setResult(
          `Created ${data.created}, deduped ${data.duplicates}, evaluated ${data.evaluated}.`,
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setBusy(false)
      // Auto-refresh the dashboard to surface any new prompts.
      if (typeof window !== 'undefined') {
        setTimeout(() => window.location.reload(), 800)
      }
    }
  }

  return (
    <div style={{ marginTop: 8 }}>
      <button
        type="button"
        onClick={run}
        disabled={busy}
        style={{
          padding: '6px 12px',
          background: 'transparent',
          color: '#444',
          border: '1px solid #ccc',
          borderRadius: 4,
          cursor: busy ? 'wait' : 'pointer',
          fontSize: '0.8rem',
        }}
      >
        {busy ? 'Running triggers…' : 'Run triggers now'}
      </button>
      {result ? (
        <span style={{ marginLeft: 12, fontSize: '0.8rem', color: '#666' }}>{result}</span>
      ) : null}
      {error ? (
        <span style={{ marginLeft: 12, fontSize: '0.8rem', color: '#900' }}>{error}</span>
      ) : null}
    </div>
  )
}
