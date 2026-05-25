'use client'

import * as React from 'react'

import { useField, useFormFields } from '@payloadcms/ui'

import {
  ASPECT_LABELS,
  classifyAspect,
  matchesAspect,
  type AspectCategory,
} from '@/lib/aspect-filter'
import type {
  TemplateSize,
  TemplateSizesResponse,
} from '@/app/api/admin/template-sizes/route'

// Custom field component for `sizeRestrictions[].enabledSizes` on the
// Artworks collection. Replaces the default hasMany text input — artists
// no longer have to type SKU strings like "16x20" by hand.
//
// Pulls the available sizes for the sibling `productSlug` from a server
// proxy (which talks to the fulfillment platform with a server-side key).
// Shows an aspect-ratio shortcut (Any / Portrait / Landscape / Square /
// Panoramic) that pre-fills the multi-select; artists can then tweak
// individual sizes after.

type FieldProps = {
  // Payload passes the field's path here (e.g.
  // "sizeRestrictions.0.enabledSizes").
  path: string
}

const ASPECT_OPTIONS: AspectCategory[] = ['any', 'portrait', 'landscape', 'square', 'panoramic']

export default function SizeSelectorField({ path }: FieldProps) {
  // The path of the sibling productSlug — same array index, different
  // leaf field. "sizeRestrictions.0.enabledSizes" → "sizeRestrictions.0.productSlug"
  const productSlugPath = React.useMemo(
    () => path.replace(/\.enabledSizes$/, '.productSlug'),
    [path],
  )

  const productSlugField = useFormFields(([fields]) => fields[productSlugPath])
  const productSlug = (productSlugField?.value as string | null | undefined) ?? null

  const { value, setValue } = useField<string[]>({ path })
  const selected = Array.isArray(value) ? value : []

  // Aspect-ratio shortcut is UI-only state — not stored. Defaults to 'any'
  // unless we can infer it from the currently-selected sizes (e.g. all
  // selections happen to be landscape → start with 'landscape' picked).
  const [aspect, setAspect] = React.useState<AspectCategory>('any')

  const [sizes, setSizes] = React.useState<TemplateSize[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  // Fetch the size list whenever the productSlug changes. Bail out cleanly
  // if no product is picked yet — the parent array row will show the
  // product dropdown first.
  React.useEffect(() => {
    if (!productSlug) {
      setSizes(null)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/admin/template-sizes?product=${encodeURIComponent(productSlug)}`, {
      credentials: 'include',
      // Bypass the browser HTTP cache so admins see new sizes the instant
      // Artbox adds them. Without this, the browser may serve a cached
      // response and the SizeSelector stays stale.
      cache: 'no-store',
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? `HTTP ${res.status}`)
        }
        return (await res.json()) as TemplateSizesResponse
      })
      .then((body) => {
        if (cancelled) return
        setSizes(body.sizes)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.message ?? 'Failed to load sizes')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [productSlug])

  // Sync the aspect shortcut to the current selections — best-effort. If
  // every selected size matches one specific aspect, show that aspect; if
  // mixed, fall back to 'any'.
  React.useEffect(() => {
    if (!sizes || selected.length === 0) return
    const selectedSizes = sizes.filter((s) => selected.includes(s.value))
    if (selectedSizes.length === 0) return
    const aspects = new Set(
      selectedSizes.map((s) => classifyAspect(s.widthIn, s.heightIn)),
    )
    if (aspects.size === 1) {
      const only = [...aspects][0]
      if (only !== aspect) setAspect(only)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizes])

  const applyAspect = (next: AspectCategory) => {
    setAspect(next)
    if (!sizes) return
    if (next === 'any') {
      // "Any" means no restriction — pre-fill with all sizes available.
      setValue(sizes.map((s) => s.value))
      return
    }
    const matching = sizes.filter((s) => matchesAspect(next, s.widthIn, s.heightIn))
    setValue(matching.map((s) => s.value))
  }

  const toggle = (sizeValue: string) => {
    if (selected.includes(sizeValue)) {
      setValue(selected.filter((v) => v !== sizeValue))
    } else {
      setValue([...selected, sizeValue])
    }
  }

  const selectAll = () => setValue((sizes ?? []).map((s) => s.value))
  const clearAll = () => setValue([])

  if (!productSlug) {
    return (
      <div style={emptyStyle}>
        <strong>Enabled sizes</strong>
        <p style={{ margin: '6px 0 0', fontSize: '0.85rem', opacity: 0.7 }}>
          Pick a product above first — the available sizes load from the Artbox catalog.
        </p>
      </div>
    )
  }

  return (
    <div style={wrapperStyle}>
      <div style={labelRowStyle}>
        <strong>Enabled sizes</strong>
        <span style={hintStyle}>
          {selected.length === 0
            ? 'None selected — this artwork will not be offered in this product'
            : `${selected.length} selected`}
        </span>
      </div>

      <div style={aspectRowStyle}>
        <span style={aspectLabelStyle}>Aspect ratio</span>
        {ASPECT_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => applyAspect(opt)}
            disabled={loading || !sizes}
            style={{
              ...chipStyle,
              ...(aspect === opt ? chipActiveStyle : {}),
            }}
          >
            {ASPECT_LABELS[opt]}
          </button>
        ))}
      </div>

      {loading ? <p style={hintStyle}>Loading sizes…</p> : null}
      {error ? (
        <p style={{ ...hintStyle, color: 'var(--theme-error-500, #c62828)' }}>
          {error} — check FULFILLMENT_API_URL / FULFILLMENT_API_KEY env vars.
        </p>
      ) : null}

      {sizes && sizes.length > 0 ? (
        <>
          <div style={actionsRowStyle}>
            <button type="button" onClick={selectAll} style={linkBtnStyle}>
              Select all
            </button>
            <button type="button" onClick={clearAll} style={linkBtnStyle}>
              Clear
            </button>
          </div>
          <div style={gridStyle}>
            {sizes.map((s) => {
              const isSelected = selected.includes(s.value)
              const cat = classifyAspect(s.widthIn, s.heightIn)
              return (
                <label
                  key={s.value}
                  style={{ ...cardStyle, ...(isSelected ? cardSelectedStyle : {}) }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(s.value)}
                    style={{ marginRight: 8 }}
                  />
                  <span style={{ flex: 1 }}>
                    <span style={{ fontWeight: 500 }}>{s.label}</span>
                    <span style={catLabelStyle}>{ASPECT_LABELS[cat]}</span>
                  </span>
                  {s.priceModifierAmount > 0 ? (
                    <span style={priceStyle}>+${s.priceModifierAmount.toFixed(2)}</span>
                  ) : null}
                </label>
              )
            })}
          </div>
        </>
      ) : sizes && sizes.length === 0 ? (
        <p style={hintStyle}>This product has no size options.</p>
      ) : null}
    </div>
  )
}

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  marginTop: 4,
  marginBottom: 12,
  padding: 12,
  border: '1px solid var(--theme-elevation-150, rgba(0,0,0,0.08))',
  borderRadius: 4,
}

const emptyStyle: React.CSSProperties = {
  ...wrapperStyle,
  background: 'var(--theme-elevation-50, rgba(0,0,0,0.02))',
  color: 'var(--theme-text-light, rgba(0,0,0,0.6))',
}

const labelRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
}

const hintStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'var(--theme-text-light, rgba(0,0,0,0.6))',
  margin: 0,
}

const aspectRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  alignItems: 'center',
}

const aspectLabelStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  color: 'var(--theme-text-light, rgba(0,0,0,0.6))',
  marginRight: 6,
}

const chipStyle: React.CSSProperties = {
  padding: '4px 10px',
  border: '1px solid var(--theme-elevation-200, rgba(0,0,0,0.12))',
  background: 'transparent',
  borderRadius: 999,
  color: 'var(--theme-text)',
  fontSize: '0.8rem',
  cursor: 'pointer',
}

const chipActiveStyle: React.CSSProperties = {
  background: 'var(--theme-text)',
  color: 'var(--theme-bg)',
  borderColor: 'var(--theme-text)',
}

const actionsRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  fontSize: '0.8rem',
}

const linkBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--theme-link, #1565c0)',
  cursor: 'pointer',
  padding: 0,
  textDecoration: 'underline',
  fontSize: '0.8rem',
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  gap: 6,
}

const cardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '8px 10px',
  border: '1px solid var(--theme-elevation-150, rgba(0,0,0,0.08))',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: '0.9rem',
}

const cardSelectedStyle: React.CSSProperties = {
  borderColor: 'var(--theme-text)',
  background: 'var(--theme-elevation-50, rgba(0,0,0,0.02))',
}

const catLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.7rem',
  color: 'var(--theme-text-light, rgba(0,0,0,0.55))',
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  marginTop: 2,
}

const priceStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'var(--theme-text-light, rgba(0,0,0,0.6))',
  fontVariantNumeric: 'tabular-nums',
}
