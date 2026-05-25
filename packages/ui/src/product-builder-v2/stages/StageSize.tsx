'use client'

import * as React from 'react'

import { TOKENS } from '../theme-tokens'
import type { SelectionMap, V2Option, V2OptionGroup, V2Template } from '../types'

// Second stage: pick a size. The size group is the only thing rendered here;
// the main preview on the left updates live as the customer hovers or
// selects, so the right-side stage UI stays minimal.

const fmt = (n: number, currency = 'CAD') =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(n)

export function StageSize({
  template,
  selections,
  onSelect,
  onHover,
}: {
  template: V2Template
  selections: SelectionMap
  onSelect: (group: V2OptionGroup, opt: V2Option) => void
  // Optional preview-on-hover: parent can stash a "hovered" size and pass
  // through to the renderer so the customer feels the scale change before
  // clicking. Pass null to clear.
  onHover?: (opt: V2Option | null) => void
}) {
  const sizeGroup = template.optionGroups.find((g) => g.inputType === 'size')
  if (!sizeGroup) {
    return (
      <p style={{ color: TOKENS.secondary, fontSize: '0.9rem' }}>
        This format has only one size.
      </p>
    )
  }
  const selectedId = selections[sizeGroup.slug]?.id

  return (
    <>
      <style>{CSS}</style>
      <div className="pbv2-size-stage">
        {sizeGroup.helpText ? (
          <p className="pbv2-size-help">{sizeGroup.helpText}</p>
        ) : null}
        <div className="pbv2-size-grid">
          {sizeGroup.options.map((opt) => {
            const sel = String(opt.id) === String(selectedId)
            const dims = formatDimsLabel(opt)
            const real = realDimsLabel(opt)
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelect(sizeGroup, opt)}
                onMouseEnter={() => onHover?.(opt)}
                onMouseLeave={() => onHover?.(null)}
                onFocus={() => onHover?.(opt)}
                onBlur={() => onHover?.(null)}
                className={`pbv2-size-card ${sel ? 'pbv2-size-card--active' : ''}`}
              >
                <div className="pbv2-size-card-main">{dims}</div>
                {real && real !== dims ? (
                  <div className="pbv2-size-card-real">{real}</div>
                ) : null}
                <div className="pbv2-size-card-price">
                  +{fmt(opt.priceModifierAmount)}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

// Prefer the human label as-is. Fall back to a computed "WxH" form if absent.
function formatDimsLabel(opt: V2Option): string {
  return opt.label ?? `${opt.widthIn ?? '?'}x${opt.heightIn ?? '?'}`
}

// Optional "real" rendering — useful when the label is something terse like
// "Medium" rather than dimensional.
function realDimsLabel(opt: V2Option): string | null {
  if (!opt.widthIn || !opt.heightIn) return null
  return `${opt.widthIn}" × ${opt.heightIn}"`
}

const CSS = `
.pbv2-size-stage {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pbv2-size-help {
  margin: 0;
  font-size: 0.85rem;
  color: ${TOKENS.secondary};
}
.pbv2-size-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}
.pbv2-size-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 10px;
  background: ${TOKENS.surface};
  border: 1px solid ${TOKENS.border};
  border-radius: 6px;
  cursor: pointer;
  font-family: ${TOKENS.fontBody};
  color: ${TOKENS.primary};
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  min-height: 80px;
}
.pbv2-size-card:hover {
  border-color: ${TOKENS.primary};
}
.pbv2-size-card:focus { outline: none; }
.pbv2-size-card:focus-visible {
  outline: 2px solid ${TOKENS.primary};
  outline-offset: 2px;
}
.pbv2-size-card--active {
  border-color: ${TOKENS.primary};
  box-shadow: 0 0 0 1px ${TOKENS.primary};
  background: ${TOKENS.bg};
}
.pbv2-size-card-main {
  font-weight: 600;
  font-size: 1rem;
  font-family: ${TOKENS.fontHeading};
  letter-spacing: ${TOKENS.trackingHeading};
}
.pbv2-size-card-real {
  font-size: 0.75rem;
  color: ${TOKENS.secondary};
}
.pbv2-size-card-price {
  font-size: 0.85rem;
  color: ${TOKENS.secondary};
}
`
