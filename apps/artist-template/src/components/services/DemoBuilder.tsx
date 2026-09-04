'use client'

import { useState } from 'react'

import { ALL_FIXTURE_TEMPLATES, ProductBuilderV3 } from '@artbox/ui'

// The live product builder on the demo home. Runs entirely on fixture
// templates (no fulfilment API), URL sync off so it doesn't rewrite "/".
export default function DemoBuilder({ imageUrl, imageTitle }: { imageUrl: string; imageTitle: string }) {
  const [note, setNote] = useState<string | null>(null)

  return (
    <div>
      <ProductBuilderV3
        templates={ALL_FIXTURE_TEMPLATES}
        imageUrl={imageUrl}
        imageTitle={imageTitle}
        useStageFlow={true}
        syncUrl={false}
        initialTemplateSlug="framed-print"
        recommendedSelections={{ size: '16x20' }}
        onAddToCart={(cfg, qty) => {
          setNote(
            `On a live site this puts ${qty} × ${cfg.templateSlug.replace(/-/g, ' ')} in the cart and the order goes to Artbox Printing at checkout.`,
          )
        }}
      />
      {note ? (
        <p
          role="status"
          style={{
            margin: 0,
            padding: '12px 20px',
            borderTop: '1px solid var(--color-border)',
            color: 'var(--color-secondary)',
            fontSize: '0.9rem',
          }}
        >
          {note}
        </p>
      ) : null}
    </div>
  )
}
