'use client'

import * as React from 'react'

import { TOKENS } from '../theme-tokens'
import type { SelectionMap, V2Option, V2OptionGroup, V2Template } from '../types'

const fmt = (n: number, currency = 'CAD') =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(n)

// Third stage: pick everything that's not format or size.
// - Frame color, mat, glass, canvas wrap, edge color, block edge, etc.
// - Hidden groups (conditional on other selections) auto-disappear.

export function StageCustomize({
  template,
  selections,
  onSelect,
  isGroupVisible,
}: {
  template: V2Template
  selections: SelectionMap
  onSelect: (group: V2OptionGroup, opt: V2Option) => void
  isGroupVisible: (groupSlug: string, sel: SelectionMap) => boolean
}) {
  const groups = template.optionGroups.filter(
    (g) => g.inputType !== 'size' && isGroupVisible(g.slug, selections),
  )

  if (groups.length === 0) {
    return (
      <p style={{ color: TOKENS.secondary, fontSize: '0.9rem' }}>
        Nothing more to customize — ready to add to cart.
      </p>
    )
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="pbv2-customize">
        {groups.map((group) => (
          <CustomizeGroup
            key={group.slug}
            group={group}
            selectedId={selections[group.slug]?.id}
            onSelect={(opt) => onSelect(group, opt)}
          />
        ))}
      </div>
    </>
  )
}

function CustomizeGroup({
  group,
  selectedId,
  onSelect,
}: {
  group: V2OptionGroup
  selectedId: string | number | undefined
  onSelect: (opt: V2Option) => void
}) {
  return (
    <div className="pbv2-cz-group">
      <div className="pbv2-cz-head">
        <span className="pbv2-cz-name">{group.name}</span>
        {group.isRequired ? <span className="pbv2-cz-required">required</span> : null}
      </div>
      {group.helpText ? <p className="pbv2-cz-help">{group.helpText}</p> : null}

      {group.inputType === 'swatch' ? (
        <div className="pbv2-cz-swatches">
          {group.options.map((opt) => {
            const sel = String(opt.id) === String(selectedId)
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelect(opt)}
                className={`pbv2-cz-swatch ${sel ? 'pbv2-cz-swatch--active' : ''}`}
                title={`${opt.label}${
                  opt.priceModifierAmount
                    ? ` (+${opt.priceModifierAmount})`
                    : ''
                }`}
                aria-label={opt.label}
                style={
                  // Prefer the real material face photo if available, fall
                  // back to the color swatch.
                  opt.faceImage
                    ? {
                        backgroundImage: `url(${opt.faceImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : { background: opt.swatchColor ?? '#ddd' }
                }
              />
            )
          })}
          <span className="pbv2-cz-selected-label">
            {group.options.find((o) => String(o.id) === String(selectedId))?.label}
          </span>
        </div>
      ) : (
        <div className="pbv2-cz-radios">
          {group.options.map((opt) => {
            const sel = String(opt.id) === String(selectedId)
            return (
              <label
                key={opt.id}
                className={`pbv2-cz-radio ${sel ? 'pbv2-cz-radio--active' : ''}`}
              >
                <input
                  type="radio"
                  name={group.slug}
                  checked={sel}
                  onChange={() => onSelect(opt)}
                  style={{ marginRight: 8 }}
                />
                <span style={{ flex: 1 }}>{opt.label}</span>
                {opt.priceModifierAmount > 0 ? (
                  <span className="pbv2-cz-price">+{fmt(opt.priceModifierAmount)}</span>
                ) : null}
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

const CSS = `
.pbv2-customize {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.pbv2-cz-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pbv2-cz-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.pbv2-cz-name { font-weight: 600; color: ${TOKENS.primary}; }
.pbv2-cz-required {
  color: ${TOKENS.secondary};
  font-size: 0.7rem;
  opacity: 0.7;
}
.pbv2-cz-help {
  margin: 0;
  font-size: 0.85rem;
  color: ${TOKENS.secondary};
}
.pbv2-cz-swatches {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.pbv2-cz-swatch {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  outline: 1px solid ${TOKENS.border};
  /* #ddd is a generic mid-gray fallback when the option has no swatchColor.
     Visible on both light and dark theme backgrounds. */
  background-color: #ddd;
  transition: outline-color 0.15s, transform 0.1s;
}
.pbv2-cz-swatch:hover { transform: scale(1.05); }
.pbv2-cz-swatch:focus { outline: none; }
.pbv2-cz-swatch:focus-visible { outline: 3px solid ${TOKENS.primary}; }
.pbv2-cz-swatch--active { outline: 3px solid ${TOKENS.primary}; }
.pbv2-cz-selected-label {
  font-size: 0.9rem;
  color: ${TOKENS.primary};
  margin-left: 8px;
}
.pbv2-cz-radios { display: flex; flex-direction: column; gap: 6px; }
.pbv2-cz-radio {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid ${TOKENS.border};
  background: ${TOKENS.surface};
  color: ${TOKENS.primary};
  border-radius: 4px;
  cursor: pointer;
  font-family: ${TOKENS.fontBody};
}
.pbv2-cz-radio--active {
  border-color: ${TOKENS.primary};
  background: ${TOKENS.bg};
}
.pbv2-cz-price { color: ${TOKENS.secondary}; font-size: 0.9rem; }
`
