'use client'

import * as React from 'react'

import { Renderer25D } from '../renderers/Renderer25D'
import { TOKENS } from '../theme-tokens'
import type { SavedBuild, V2Option, V2Template } from '../types'

// Sticky bottom tray showing pinned builds side-by-side. Appears only when
// at least one build is pinned. Each card has:
//   - a mini preview (compact renderer) of the pinned build
//   - the format name + a 1-line option summary
//   - the unit price for that build
//   - Restore (load the build back into the main builder)
//   - X (remove from comparison)

const fmt = (n: number, currency = 'CAD') =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(n)

type Props = {
  pinned: SavedBuild[]
  templates: V2Template[]
  imageUrl: string
  onRestore: (build: SavedBuild) => void
  onRemove: (id: string) => void
}

export function ComparisonDrawer({
  pinned,
  templates,
  imageUrl,
  onRestore,
  onRemove,
}: Props) {
  if (pinned.length === 0) return null

  return (
    <>
      <style>{CSS}</style>
      <div className="pbv2-cmp" role="region" aria-label="Pinned builds for comparison">
        <div className="pbv2-cmp-head">
          <span className="pbv2-cmp-title">
            Comparison · {pinned.length} pinned
          </span>
          <span className="pbv2-cmp-hint">
            Click a build to restore it to the configurator
          </span>
        </div>
        <div className="pbv2-cmp-row">
          {pinned.map((build) => {
            const template = templates.find((t) => t.slug === build.templateSlug)
            if (!template) return null
            // Reconstruct selections from the saved values so the mini-preview
            // matches the pinned configuration exactly.
            const selections = reconstructSelections(template, build.selectionValues)
            const unit = computeUnitPrice(template, selections)
            const summary = buildSummary(template, selections)
            return (
              <article key={build.id} className="pbv2-cmp-card">
                <button
                  type="button"
                  onClick={() => onRestore(build)}
                  className="pbv2-cmp-card-restore"
                  aria-label={`Restore ${template.name} build`}
                >
                  <div className="pbv2-cmp-card-preview">
                    {Renderer25D.render({
                      template,
                      imageUrl,
                      selections,
                      pxPerIn: 7,
                      compact: true,
                    })}
                  </div>
                  <div className="pbv2-cmp-card-body">
                    <div className="pbv2-cmp-card-name">{template.name}</div>
                    <div className="pbv2-cmp-card-summary">{summary}</div>
                    <div className="pbv2-cmp-card-price">{fmt(unit)}</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(build.id)}
                  className="pbv2-cmp-card-remove"
                  aria-label="Remove from comparison"
                  title="Remove"
                >
                  ×
                </button>
              </article>
            )
          })}
        </div>
      </div>
    </>
  )
}

// --- helpers ---

function reconstructSelections(
  template: V2Template,
  values: Record<string, string>,
): Record<string, V2Option> {
  // Explicit Record<string, V2Option> — TS won't infer the | undefined out
  // of pickOption's return on its own, which then breaks computeUnitPrice
  // on strict builds.
  const sel: Record<string, V2Option> = {}
  for (const group of template.optionGroups) {
    const v = values[group.slug]
    const opt = pickOption(group.options, v)
    if (opt) sel[group.slug] = opt
  }
  return sel
}

function pickOption<T extends { value: string }>(
  options: T[],
  value: string | undefined,
): T | undefined {
  if (!value) return options[0]
  return options.find((o) => o.value === value) ?? options[0]
}

function computeUnitPrice(
  template: V2Template,
  selections: Record<string, { priceModifierAmount: number; value: string }>,
): number {
  // Mirror the main shell's isGroupVisible. Keep tiny here so the drawer
  // stays decoupled from the shell.
  const visibleGroups = template.optionGroups.filter((g) => {
    if (g.slug === 'canvas-edge-color') {
      return selections['canvas-wrap']?.value === 'solid'
    }
    return true
  })
  const sum = visibleGroups.reduce((acc, g) => {
    const sel = selections[g.slug]
    return acc + (sel?.priceModifierAmount ?? 0)
  }, 0)
  return Math.round((template.basePrice + sum) * 100) / 100
}

function buildSummary(
  template: V2Template,
  selections: Record<string, { label: string }>,
): string {
  // 1-line gist: include the size and the most-distinctive options for the
  // category. Keep under ~60 chars so it doesn't wrap awkwardly in a small card.
  const parts: string[] = []
  const size = template.optionGroups.find((g) => g.inputType === 'size')
  if (size && selections[size.slug]) parts.push(selections[size.slug].label)
  const interesting = ['frame-color', 'mat', 'canvas-wrap', 'block-edge']
  for (const slug of interesting) {
    if (selections[slug]) parts.push(selections[slug].label)
  }
  return parts.join(' · ') || '—'
}

const CSS = `
.pbv2-cmp {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 90;
  background: ${TOKENS.surface};
  border-top: 1px solid ${TOKENS.border};
  box-shadow: 0 -8px 24px rgba(0,0,0,0.12);
  font-family: ${TOKENS.fontBody};
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pbv2-cmp-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
}
.pbv2-cmp-title {
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${TOKENS.primary};
}
.pbv2-cmp-hint {
  font-size: 0.75rem;
  color: ${TOKENS.secondary};
}
.pbv2-cmp-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.pbv2-cmp-card {
  position: relative;
  flex: 0 0 auto;
  background: ${TOKENS.bg};
  border: 1px solid ${TOKENS.border};
  border-radius: 6px;
  overflow: hidden;
  width: 180px;
}
.pbv2-cmp-card-restore {
  display: block;
  width: 100%;
  padding: 0;
  background: transparent;
  border: none;
  color: ${TOKENS.primary};
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
}
.pbv2-cmp-card-restore:hover { background: ${TOKENS.surface}; }
.pbv2-cmp-card-restore:focus { outline: none; }
.pbv2-cmp-card-restore:focus-visible {
  outline: 2px solid ${TOKENS.primary};
  outline-offset: -2px;
}
.pbv2-cmp-card-preview {
  width: 100%;
  height: 90px;
  background: ${TOKENS.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.pbv2-cmp-card-body {
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pbv2-cmp-card-name {
  font-weight: 600;
  font-size: 0.85rem;
}
.pbv2-cmp-card-summary {
  font-size: 0.7rem;
  color: ${TOKENS.secondary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.pbv2-cmp-card-price {
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 2px;
}
.pbv2-cmp-card-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0,0,0,0.55);
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pbv2-cmp-card-remove:hover { background: rgba(0,0,0,0.75); }
.pbv2-cmp-card-remove:focus { outline: none; }
.pbv2-cmp-card-remove:focus-visible { outline: 2px solid ${TOKENS.primary}; }
`
