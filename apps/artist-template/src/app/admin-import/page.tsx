'use client'

import Link from 'next/link'
import { useState } from 'react'

type ImportResult = {
  created: number
  updated: number
  skipped: number
  errors: { row: number; slug?: string; message: string }[]
}

const SAMPLE_CSV = `slug,title,gallerySlug,imageUrl,description,year,location,isPublished
sample-001,Morning study,coastlines,https://example.com/morning.jpg,Quick study,2025,Tofino,true
sample-002,Evening study,coastlines,https://example.com/evening.jpg,,2025,Tofino,false`

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/admin/import-artworks', {
        method: 'POST',
        body,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? `Request failed (${res.status})`)
      } else {
        setResult(data as ImportResult)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '48px 24px',
        fontFamily:
          '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: '#222',
      }}
    >
      <Link href="/admin" style={{ fontSize: '0.9rem', color: '#666' }}>
        ← Back to admin
      </Link>
      <h1 style={{ marginTop: 12, marginBottom: 8, fontSize: '1.6rem' }}>
        Import artworks from CSV
      </h1>
      <p style={{ color: '#666', marginTop: 0, lineHeight: 1.5 }}>
        Upload a CSV with one row per artwork. Existing artworks (matched by{' '}
        <code>slug</code>) are updated; new ones are created. Rows default to{' '}
        <code>isPublished: false</code> so you can curate which pieces go live
        before exposing them on the site.
      </p>

      <details style={{ margin: '16px 0' }}>
        <summary style={{ cursor: 'pointer', color: '#555' }}>
          CSV format & sample
        </summary>
        <p style={{ marginTop: 12, fontSize: '0.9rem' }}>
          Required columns: <code>slug</code>, <code>title</code>,{' '}
          <code>gallerySlug</code>. Optional: <code>imageUrl</code>,{' '}
          <code>description</code>, <code>year</code>, <code>location</code>,{' '}
          <code>isPublished</code>.
        </p>
        <pre
          style={{
            background: '#f5f5f5',
            padding: 12,
            borderRadius: 4,
            fontSize: '0.8rem',
            overflowX: 'auto',
          }}
        >
          {SAMPLE_CSV}
        </pre>
      </details>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          marginTop: 24,
          padding: 20,
          background: '#fafafa',
          border: '1px solid #e6e6e6',
          borderRadius: 6,
        }}
      >
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          disabled={!file || busy}
          style={{
            padding: '8px 20px',
            background: file && !busy ? '#1a1a1a' : '#aaa',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: file && !busy ? 'pointer' : 'not-allowed',
            fontSize: '0.95rem',
          }}
        >
          {busy ? 'Importing…' : 'Import'}
        </button>
      </form>

      {error ? (
        <div
          role="alert"
          style={{
            marginTop: 24,
            padding: 16,
            background: '#fee',
            border: '1px solid #fbb',
            borderRadius: 4,
            color: '#900',
          }}
        >
          {error}
        </div>
      ) : null}

      {result ? (
        <div
          style={{
            marginTop: 24,
            padding: 20,
            background: '#f6fff6',
            border: '1px solid #c6e6c6',
            borderRadius: 4,
          }}
        >
          <strong>Done.</strong>
          <ul style={{ marginTop: 12, lineHeight: 1.7 }}>
            <li>Created: {result.created}</li>
            <li>Updated: {result.updated}</li>
            <li>Skipped: {result.skipped}</li>
          </ul>
          {result.errors.length > 0 ? (
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: 'pointer' }}>
                {result.errors.length} row error{result.errors.length === 1 ? '' : 's'}
              </summary>
              <ul style={{ marginTop: 8, fontSize: '0.85rem' }}>
                {result.errors.slice(0, 50).map((e, idx) => (
                  <li key={idx}>
                    Row {e.row}
                    {e.slug ? ` (${e.slug})` : ''}: {e.message}
                  </li>
                ))}
                {result.errors.length > 50 ? (
                  <li>… and {result.errors.length - 50} more</li>
                ) : null}
              </ul>
            </details>
          ) : null}
        </div>
      ) : null}
    </main>
  )
}
