'use client'

import { useState } from 'react'

import {
  ALL_FIXTURE_TEMPLATES,
  FIXTURE_IMAGE_TITLE,
  FIXTURE_IMAGE_URL,
  ProductBuilderV3,
} from '@artbox/ui'

export default function DevBuilderV3Client() {
  const [stageFlow, setStageFlow] = useState(true)
  const [lastAdd, setLastAdd] = useState<string | null>(null)

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          padding: '12px 16px',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 4,
          marginBottom: 24,
          fontSize: '0.9rem',
        }}
      >
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={stageFlow}
            onChange={(e) => setStageFlow(e.target.checked)}
          />
          <span>Use stage flow (Format → Size → Customize)</span>
        </label>
        <span style={{ color: 'var(--color-secondary)' }}>
          Pick &ldquo;Custom framed print&rdquo; to see the 3D preview.
        </span>
      </div>

      <ProductBuilderV3
        templates={ALL_FIXTURE_TEMPLATES}
        imageUrl={FIXTURE_IMAGE_URL}
        imageTitle={FIXTURE_IMAGE_TITLE}
        useStageFlow={stageFlow}
        syncUrl={stageFlow}
        // Default to a mid-range size (16×20) instead of the first option
        // (8×10). The 3D preview reads better at this scale, and 16×20 is
        // the most common gallery print size.
        recommendedSelections={{ size: '16x20' }}
        onAddToCart={(cfg, qty) => {
          console.log('[V3 sandbox] add-to-cart', cfg, qty)
          setLastAdd(`${qty} × ${cfg.templateSlug} at $${cfg.unitPrice.toFixed(2)}`)
        }}
      />

      {lastAdd ? (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 4,
            fontSize: '0.9rem',
            color: 'var(--color-primary)',
          }}
        >
          <strong>Last add-to-cart:</strong> {lastAdd}{' '}
          <span style={{ color: 'var(--color-secondary)' }}>
            (sandbox only — not added to real cart)
          </span>
        </div>
      ) : null}
    </div>
  )
}
