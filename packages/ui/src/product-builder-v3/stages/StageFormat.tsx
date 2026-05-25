'use client'

import * as React from 'react'

import { Renderer25D } from '../renderers/Renderer25D'
import { TOKENS } from '../theme-tokens'
import type { SelectionMap, V2Template } from '../types'

// First stage: pick a product format (paper / framed / canvas / block / card).
// Each format is shown as a card with a small live preview of the current
// artwork in that format, plus name + starting price.
//
// Rendering 6 mini previews simultaneously is the main cost here. We mitigate
// by:
//   1. Using a small pxPerIn (7 vs the main preview's 15) and passing
//      compact=true so the renderer skips depth strips and the MIN_DIM
//      floor that would otherwise blow past the card's 140px height.
//   2. Each card builds its own default selections (no shared state with the
//      main flow) so a re-render of the parent doesn't cascade.
//   3. No interactive features inside the card — pure presentation.

const FORMAT_TILE_PX_PER_IN = 7

export function StageFormat({
  templates,
  imageUrl,
  activeSlug,
  onPick,
}: {
  templates: V2Template[]
  imageUrl: string
  activeSlug: string
  onPick: (template: V2Template) => void
}) {
  return (
    <>
      <style>{CSS}</style>
      <div className="pbv2-format-grid" role="radiogroup" aria-label="Product format">
        {templates.map((template) => (
          <FormatCard
            key={template.slug}
            template={template}
            imageUrl={imageUrl}
            active={template.slug === activeSlug}
            onPick={() => onPick(template)}
          />
        ))}
      </div>
    </>
  )
}

function FormatCard({
  template,
  imageUrl,
  active,
  onPick,
}: {
  template: V2Template
  imageUrl: string
  active: boolean
  onPick: () => void
}) {
  // Pre-pick reasonable defaults so the mini preview shows a plausible
  // version of this format. Falls back to first option per group.
  const previewSelections = React.useMemo<SelectionMap>(() => {
    const sel: SelectionMap = {}
    for (const group of template.optionGroups) {
      if (group.options.length === 0) continue
      // For size, pick the smallest option in the preview so the tile stays
      // compact and we don't push the card layout around.
      if (group.inputType === 'size') {
        const sorted = [...group.options].sort((a, b) => {
          const aArea = (a.widthIn || 0) * (a.heightIn || 0)
          const bArea = (b.widthIn || 0) * (b.heightIn || 0)
          return aArea - bArea
        })
        sel[group.slug] = sorted[0]
      } else {
        sel[group.slug] = group.options[0]
      }
    }
    return sel
  }, [template])

  // Starting price = base + cheapest size + zero on other groups (since first
  // options are usually the no-charge default).
  const startingPrice = React.useMemo(() => {
    let sum = template.basePrice
    for (const group of template.optionGroups) {
      const cheapest = [...group.options]
        .filter((o) => o)
        .sort((a, b) => a.priceModifierAmount - b.priceModifierAmount)[0]
      if (cheapest && cheapest.priceModifierAmount > 0 && group.inputType === 'size') {
        sum += cheapest.priceModifierAmount
      }
    }
    return Math.round(sum * 100) / 100
  }, [template])

  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onPick}
      className={`pbv2-format-card ${active ? 'pbv2-format-card--active' : ''}`}
    >
      <div className="pbv2-format-card-preview">
        {Renderer25D.render({
          template,
          imageUrl,
          selections: previewSelections,
          pxPerIn: FORMAT_TILE_PX_PER_IN,
          compact: true,
        })}
      </div>
      <div className="pbv2-format-card-body">
        <div className="pbv2-format-card-name">{template.name}</div>
        <div className="pbv2-format-card-price">from ${startingPrice.toFixed(2)}</div>
        {template.description ? (
          <div className="pbv2-format-card-desc">{template.description}</div>
        ) : null}
      </div>
    </button>
  )
}

const CSS = `
.pbv2-format-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}
.pbv2-format-card {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  background: ${TOKENS.surface};
  border: 1px solid ${TOKENS.border};
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  font-family: ${TOKENS.fontBody};
  font-size: ${TOKENS.baseFontSize};
  color: ${TOKENS.primary};
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
  overflow: hidden;
}
.pbv2-format-card:hover {
  border-color: ${TOKENS.primary};
  transform: translateY(-1px);
}
.pbv2-format-card:focus { outline: none; }
.pbv2-format-card:focus-visible {
  outline: 2px solid ${TOKENS.primary};
  outline-offset: 2px;
}
.pbv2-format-card--active {
  border-color: ${TOKENS.primary};
  box-shadow: 0 0 0 1px ${TOKENS.primary};
}
.pbv2-format-card-preview {
  width: 100%;
  height: 140px;
  background: ${TOKENS.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  /* Mini previews can spill slightly because DepthStrips position themselves
     outside the print bounds; clip them so the card edges stay clean. */
}
.pbv2-format-card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px 16px;
}
.pbv2-format-card-name {
  font-family: ${TOKENS.fontHeading};
  font-weight: ${TOKENS.weightHeading};
  letter-spacing: ${TOKENS.trackingHeading};
  font-size: 1rem;
}
.pbv2-format-card-price {
  font-size: 0.85rem;
  color: ${TOKENS.secondary};
}
.pbv2-format-card-desc {
  font-size: 0.8rem;
  color: ${TOKENS.secondary};
  line-height: 1.4;
  margin-top: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
`
