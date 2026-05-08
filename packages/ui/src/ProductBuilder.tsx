'use client'

import { useEffect, useMemo, useState } from 'react'

import type {
  BuilderConfiguration,
  BuilderSelection,
  PublicOption,
  PublicOptionGroup,
  PublicProductTemplate,
} from '@artbox/types'

type Props = {
  template: PublicProductTemplate
  imageUrl: string
  imageTitle?: string
  onAddToCart?: (cfg: BuilderConfiguration, quantity: number) => void
}

const fmt = (n: number, currency = 'CAD') =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(n)

export default function ProductBuilder({
  template,
  imageUrl,
  imageTitle,
  onAddToCart,
}: Props) {
  const [selections, setSelections] = useState<Record<string, PublicOption>>(() =>
    reconcileSelections({}, template),
  )
  const [quantity, setQuantity] = useState(1)
  const [pxPerIn, setPxPerIn] = useState(PX_PER_IN_DESKTOP)

  // Carry size selection (and equivalent options) across template switches.
  useEffect(() => {
    setSelections((prev) => reconcileSelections(prev, template))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.slug])

  // Smaller pixels-per-inch on mobile so 24×36 fits a phone viewport.
  useEffect(() => {
    const update = () =>
      setPxPerIn(
        typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT_PX
          ? PX_PER_IN_MOBILE
          : PX_PER_IN_DESKTOP,
      )
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const unitPrice = useMemo(() => {
    const sum = Object.values(selections).reduce(
      (acc, o) => acc + (o?.priceModifierAmount ?? 0),
      0,
    )
    return Math.round((template.basePrice + sum) * 100) / 100
  }, [selections, template.basePrice])

  const totalPrice = useMemo(
    () => Math.round(unitPrice * quantity * 100) / 100,
    [unitPrice, quantity],
  )

  const handleSelect = (group: PublicOptionGroup, option: PublicOption) => {
    setSelections((prev) => ({ ...prev, [group.slug]: option }))
  }

  const handleAddToCart = () => {
    const builderSelections: BuilderSelection[] = Object.entries(selections).map(
      ([groupSlug, opt]) => ({
        optionGroupSlug: groupSlug,
        optionId: opt.id,
        optionValue: opt.value,
        optionLabel: opt.label,
        priceModifierAmount: opt.priceModifierAmount,
      }),
    )
    onAddToCart?.(
      {
        templateSlug: template.slug,
        selections: builderSelections,
        basePrice: template.basePrice,
        unitPrice,
      },
      quantity,
    )
  }

  const sizeSelection = findSizeSelection(template, selections)
  const dims = computeDimensions(sizeSelection?.widthIn, sizeSelection?.heightIn, pxPerIn)

  return (
    <>
      <style>{RESPONSIVE_CSS}</style>
      <div className="pb-shell" style={styles.shell}>
      <div style={styles.preview}>
        <div style={styles.previewFrame}>
          <ImagePreview
            template={template}
            imageUrl={imageUrl}
            selections={selections}
            pxPerIn={pxPerIn}
          />
        </div>
        <p style={styles.previewCaption}>
          {imageTitle ? <span>{imageTitle}</span> : null}
          {sizeSelection ? (
            <span style={styles.previewSizeBadge}>
              {imageTitle ? ' · ' : null}
              {dims.enlarged
                ? `Approx. scale · ${sizeSelection.label} (enlarged for visibility)`
                : `Shown to scale at ${sizeSelection.label}`}
            </span>
          ) : null}
        </p>
      </div>

      <div style={styles.controls}>
        <h2 style={styles.heading}>{template.name}</h2>
        {template.description ? (
          <p style={styles.description}>{template.description}</p>
        ) : null}

        {template.optionGroups.map((group) => (
          <OptionGroupControl
            key={group.slug}
            group={group}
            selectedId={selections[group.slug]?.id}
            onSelect={(opt) => handleSelect(group, opt)}
          />
        ))}

        <div style={styles.quantityRow}>
          <label style={styles.quantityLabel}>Quantity</label>
          <input
            type="number"
            min={1}
            max={50}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            style={styles.quantityInput}
          />
        </div>

        <div style={styles.totalRow}>
          <div>
            <div style={styles.unitLabel}>Unit price</div>
            <div style={styles.unitPrice}>{fmt(unitPrice)}</div>
          </div>
          <div style={styles.totalBox}>
            <div style={styles.totalLabel}>Total</div>
            <div style={styles.totalPrice}>{fmt(totalPrice)}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          style={styles.cta}
          className="pb-cta-desktop"
        >
          Add to cart →
        </button>

        <details style={styles.summary}>
          <summary style={styles.summaryTitle}>Configuration summary</summary>
          <ul style={styles.summaryList}>
            {template.optionGroups.map((group) => {
              const sel = selections[group.slug]
              return (
                <li key={group.slug}>
                  <strong>{group.name}:</strong> {sel?.label ?? '—'}{' '}
                  {sel?.priceModifierAmount ? (
                    <span style={styles.summaryDelta}>
                      (+{fmt(sel.priceModifierAmount)})
                    </span>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </details>
      </div>
      </div>

      {/* Mobile-only sticky bottom bar — keeps the CTA + price visible while
          scrolling through long option lists. Hidden on desktop. */}
      <div className="pb-sticky-spacer" aria-hidden />
      <div className="pb-sticky-cta">
        <div>
          <div style={{ fontSize: '0.7rem', color: C_SECONDARY, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Total
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: C_PRIMARY }}>
            {fmt(totalPrice)}
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          style={{
            padding: '12px 20px',
            background: C_PRIMARY,
            color: C_BG,
            border: 'none',
            borderRadius: 4,
            fontSize: '0.95rem',
            cursor: 'pointer',
            minHeight: 44,
          }}
        >
          Add to cart
        </button>
      </div>
    </>
  )
}

const RESPONSIVE_CSS = `
.pb-shell {
  display: grid;
  grid-template-columns: minmax(280px, 1.1fr) minmax(280px, 1fr);
  gap: 48px;
  padding: 32px;
}
.pb-sticky-cta { display: none; }
.pb-sticky-spacer { display: none; }
.pb-size-btn:focus,
.pb-radio-row:focus,
.pb-radio-row input:focus,
.pb-cta-desktop:focus {
  outline: none;
}
.pb-size-btn:focus-visible,
.pb-radio-row:focus-visible,
.pb-radio-row input:focus-visible,
.pb-cta-desktop:focus-visible {
  outline: 2px solid var(--color-primary, #1a1a1a);
  outline-offset: 2px;
}
@media (max-width: 768px) {
  .pb-shell {
    grid-template-columns: 1fr !important;
    gap: 24px !important;
    padding: 16px !important;
  }
  .pb-shell > div:first-child > div:first-child {
    /* tighter previewFrame on mobile so the cream backing block doesn't dominate */
    min-height: 280px !important;
    padding: 16px !important;
  }
  .pb-size-btn {
    padding: 14px 10px !important;
    min-height: 48px !important;
  }
  .pb-radio-row {
    padding: 14px !important;
    min-height: 48px !important;
  }
  .pb-cta-desktop { display: none !important; }
  .pb-sticky-cta {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px 16px;
    background: var(--color-surface, #ffffff);
    border-top: 1px solid var(--color-border, rgba(0,0,0,0.1));
    justify-content: space-between;
    align-items: center;
    z-index: 100;
    box-shadow: 0 -4px 16px rgba(0,0,0,0.12);
  }
  .pb-sticky-spacer {
    display: block;
    height: 80px;
  }
}
`

function OptionGroupControl({
  group,
  selectedId,
  onSelect,
}: {
  group: PublicOptionGroup
  selectedId: string | number | undefined
  onSelect: (opt: PublicOption) => void
}) {
  return (
    <div style={styles.group}>
      <div style={styles.groupHeader}>
        <span style={styles.groupName}>{group.name}</span>
        {group.isRequired ? <span style={styles.required}>required</span> : null}
      </div>
      {group.helpText ? <p style={styles.groupHelp}>{group.helpText}</p> : null}

      {group.inputType === 'swatch' ? (
        <div style={styles.swatches}>
          {group.options.map((opt) => {
            const selected = String(opt.id) === String(selectedId)
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelect(opt)}
                style={{
                  ...styles.swatch,
                  background: opt.swatchColor ?? '#ddd',
                  outline: selected ? '3px solid #111' : '1px solid #ccc',
                }}
                title={`${opt.label}${opt.priceModifierAmount ? ` (+${opt.priceModifierAmount})` : ''}`}
                aria-label={opt.label}
              />
            )
          })}
          <span style={styles.selectedLabel}>
            {group.options.find((o) => String(o.id) === String(selectedId))?.label}
          </span>
        </div>
      ) : group.inputType === 'size' ? (
        <div style={styles.sizes}>
          {group.options.map((opt) => {
            const selected = String(opt.id) === String(selectedId)
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelect(opt)}
                className="pb-size-btn"
                style={{
                  ...styles.sizeButton,
                  ...(selected ? styles.sizeButtonSelected : {}),
                }}
              >
                <div style={styles.sizeLabel}>{opt.label}</div>
                <div style={styles.sizePrice}>+{fmt(opt.priceModifierAmount)}</div>
              </button>
            )
          })}
        </div>
      ) : (
        <div style={styles.selectStack}>
          {group.options.map((opt) => {
            const selected = String(opt.id) === String(selectedId)
            return (
              <label
                key={opt.id}
                className="pb-radio-row"
                style={{
                  ...styles.selectRow,
                  ...(selected ? styles.selectRowSelected : {}),
                }}
              >
                <input
                  type="radio"
                  name={group.slug}
                  checked={selected}
                  onChange={() => onSelect(opt)}
                  style={{ marginRight: 8 }}
                />
                <span style={{ flex: 1 }}>{opt.label}</span>
                {opt.priceModifierAmount > 0 ? (
                  <span style={styles.selectPrice}>+{fmt(opt.priceModifierAmount)}</span>
                ) : null}
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Pixels-per-inch in the on-screen preview. Smaller on mobile so a 24×36
// print doesn't overflow a phone viewport.
const PX_PER_IN_DESKTOP = 15
const PX_PER_IN_MOBILE = 11
const MOBILE_BREAKPOINT_PX = 768
const MIN_PREVIEW_DIM = 140
const FALLBACK_WIDTH = 280
const FALLBACK_HEIGHT = 280

type PreviewDims = { widthPx: number; heightPx: number; enlarged: boolean }

function computeDimensions(
  widthIn: number | undefined,
  heightIn: number | undefined,
  pxPerIn: number,
): PreviewDims {
  if (!widthIn || !heightIn) {
    return { widthPx: FALLBACK_WIDTH, heightPx: FALLBACK_HEIGHT, enlarged: false }
  }
  const naturalW = widthIn * pxPerIn
  const naturalH = heightIn * pxPerIn
  const minDim = Math.min(naturalW, naturalH)
  if (minDim >= MIN_PREVIEW_DIM) {
    return { widthPx: naturalW, heightPx: naturalH, enlarged: false }
  }
  const scale = MIN_PREVIEW_DIM / minDim
  return {
    widthPx: Math.round(naturalW * scale),
    heightPx: Math.round(naturalH * scale),
    enlarged: true,
  }
}

// Reconcile a previous selections map against a new template. Sizes carry
// over by closest area; other groups carry over by exact value match if the
// new template happens to share a group.
function reconcileSelections(
  prev: Record<string, PublicOption>,
  template: PublicProductTemplate,
): Record<string, PublicOption> {
  const next: Record<string, PublicOption> = {}
  const prevSize = Object.values(prev).find((o) => o?.widthIn && o?.heightIn)
  for (const group of template.optionGroups) {
    if (group.options.length === 0) continue
    if (group.inputType === 'size' && prevSize) {
      const oldArea = (prevSize.widthIn || 0) * (prevSize.heightIn || 0)
      let best = group.options[0]
      let bestDelta = Infinity
      for (const opt of group.options) {
        const area = (opt.widthIn || 0) * (opt.heightIn || 0)
        if (area > 0) {
          const delta = Math.abs(area - oldArea)
          if (delta < bestDelta) {
            bestDelta = delta
            best = opt
          }
        }
      }
      next[group.slug] = best
    } else {
      const carry = prev[group.slug]
      const valueMatch = carry
        ? group.options.find((o) => o.id === carry.id || o.value === carry.value)
        : undefined
      next[group.slug] = valueMatch ?? group.options[0]
    }
  }
  return next
}

function findSizeSelection(
  template: PublicProductTemplate,
  selections: Record<string, PublicOption>,
): PublicOption | null {
  for (const group of template.optionGroups) {
    if (group.inputType !== 'size') continue
    const sel = selections[group.slug]
    if (sel && (sel.widthIn || sel.heightIn)) return sel
  }
  return null
}

// === Material background fallback chain ===
// 1. If option.previewImage is set, use it as a tiled background (artbox staff
//    can upload real wood/mat/edge photos in admin — see IMAGE_GUIDELINES.md).
// 2. Else, generate a CSS texture appropriate to the material kind.
// 3. Else, fall back to a solid swatchColor.

function woodGrainBackground(baseColor: string): string {
  // Vertical grain stripes overlaid on the base color. Subtle on dark woods,
  // a touch more visible on light woods.
  return [
    'repeating-linear-gradient(90deg, transparent 0 3px, rgba(0,0,0,0.06) 3px 4px)',
    'repeating-linear-gradient(90deg, transparent 0 11px, rgba(255,255,255,0.05) 11px 13px)',
    'linear-gradient(180deg, rgba(255,255,255,0.06), transparent 25%, transparent 75%, rgba(0,0,0,0.07))',
    `linear-gradient(${baseColor}, ${baseColor})`,
  ].join(', ')
}

function matTextureBackground(baseColor: string): string {
  // Two staggered radial-dot patterns simulate cotton/paper tooth.
  return [
    'radial-gradient(rgba(0,0,0,0.025) 0.5px, transparent 0.5px) 0 0 / 4px 4px',
    'radial-gradient(rgba(0,0,0,0.02) 0.5px, transparent 0.5px) 2px 2px / 4px 4px',
    `linear-gradient(${baseColor}, ${baseColor})`,
  ].join(', ')
}

function blockEdgeBackground(baseColor: string): string {
  // Slight horizontal grain to suggest sustainable wood block edge.
  return [
    'repeating-linear-gradient(0deg, transparent 0 4px, rgba(0,0,0,0.04) 4px 5px)',
    `linear-gradient(${baseColor}, ${baseColor})`,
  ].join(', ')
}

function canvasOverlay(): React.CSSProperties {
  // Faint cross-hatch suggesting woven canvas. Painted ON the image.
  return {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    backgroundImage: [
      'repeating-linear-gradient(0deg, rgba(0,0,0,0.015) 0 1px, transparent 1px 3px)',
      'repeating-linear-gradient(90deg, rgba(0,0,0,0.012) 0 1px, transparent 1px 3px)',
    ].join(', '),
    mixBlendMode: 'multiply',
  }
}

function glassShimmer(): React.CSSProperties {
  // Diagonal sheen suggesting glass over the matted print.
  return {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background:
      'linear-gradient(135deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 65%)',
  }
}

function optionBackground(
  opt: PublicOption | undefined,
  cssTexture: (color: string) => string,
  fallbackColor: string,
): React.CSSProperties {
  if (!opt) return { background: fallbackColor }
  if (opt.previewImage) {
    return {
      backgroundImage: `url(${opt.previewImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }
  return { background: cssTexture(opt.swatchColor || fallbackColor) }
}

function ImagePreview({
  template,
  imageUrl,
  selections,
  pxPerIn,
}: {
  template: PublicProductTemplate
  imageUrl: string
  selections: Record<string, PublicOption>
  pxPerIn: number
}) {
  const sizeSel = findSizeSelection(template, selections)
  const { widthPx, heightPx } = computeDimensions(sizeSel?.widthIn, sizeSel?.heightIn, pxPerIn)

  const frameOpt = selections['frame-color']
  const blockEdgeOpt = selections['block-edge']
  const matSel = selections['mat']

  // Frame and mat thickness scale with the print so a 24×36 looks heftier than an 11×14.
  const baseDim = Math.min(widthPx, heightPx)
  const frameThicknessPx = template.category === 'framed' ? Math.max(8, Math.round(baseDim * 0.08)) : 0
  const matThicknessPx = (() => {
    if (template.category !== 'framed' || !matSel) return 0
    if (matSel.value === '4-white') return Math.round(baseDim * 0.16)
    if (matSel.value?.startsWith('2')) return Math.round(baseDim * 0.08)
    return 0
  })()
  const matColorBase = matSel?.value?.endsWith('-black') ? '#1a1a1a' : '#f4f1ea'
  const blockEdgeThicknessPx = template.category === 'block_mount' ? 6 : 0

  const imageStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }

  const outerCommon: React.CSSProperties = {
    width: widthPx,
    height: heightPx,
    position: 'relative',
    transition: 'width 0.25s ease, height 0.25s ease',
    boxSizing: 'border-box',
  }

  if (template.category === 'framed') {
    const frameBg = optionBackground(frameOpt, woodGrainBackground, '#3a2a1c')
    const matBg = optionBackground(matSel, matTextureBackground, matColorBase)
    return (
      <div
        style={{
          ...outerCommon,
          ...frameBg,
          padding: frameThicknessPx,
          boxShadow: '0 12px 32px rgba(0,0,0,0.22), inset 0 0 0 1px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            ...matBg,
            padding: matThicknessPx,
            boxSizing: 'border-box',
            boxShadow: matThicknessPx > 0 ? 'inset 0 1px 4px rgba(0,0,0,0.08)' : undefined,
          }}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img src={imageUrl} alt="" style={imageStyle} />
            <div style={glassShimmer()} />
          </div>
        </div>
      </div>
    )
  }

  if (template.category === 'block_mount') {
    const edgeBg = optionBackground(blockEdgeOpt, blockEdgeBackground, '#c19a6b')
    return (
      <div
        style={{
          ...outerCommon,
          ...edgeBg,
          padding: blockEdgeThicknessPx,
          // Stepped shadow suggests the wood block has thickness.
          boxShadow:
            '3px 3px 0 0 rgba(0,0,0,0.18), 5px 5px 0 0 rgba(0,0,0,0.14), 0 16px 28px rgba(0,0,0,0.2)',
        }}
      >
        <img src={imageUrl} alt="" style={imageStyle} />
      </div>
    )
  }

  if (template.category === 'canvas') {
    return (
      <div
        style={{
          ...outerCommon,
          boxShadow: '0 18px 32px rgba(0,0,0,0.22), 4px 0 0 0 rgba(0,0,0,0.06), 0 4px 0 0 rgba(0,0,0,0.06)',
        }}
      >
        <img src={imageUrl} alt="" style={imageStyle} />
        <div style={canvasOverlay()} />
      </div>
    )
  }

  return (
    <div
      style={{
        ...outerCommon,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      }}
    >
      <img src={imageUrl} alt="" style={imageStyle} />
    </div>
  )
}

// CSS-var-driven so the builder picks up the host site's theme.
// Fallbacks match the current minimal theme so the fulfillment preview
// (which doesn't set theme vars) keeps the same look.
const C_PRIMARY = 'var(--color-primary, #1a1a1a)'
const C_SECONDARY = 'var(--color-secondary, rgba(0,0,0,0.6))'
const C_BG = 'var(--color-bg, #fafaf6)'
const C_SURFACE = 'var(--color-surface, #ffffff)'
const C_BORDER = 'var(--color-border, rgba(0,0,0,0.08))'

const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: 'grid',
    gridTemplateColumns: 'minmax(280px, 1.1fr) minmax(280px, 1fr)',
    gap: 48,
    padding: 32,
    maxWidth: 1100,
    margin: '0 auto',
    background: C_SURFACE,
    color: C_PRIMARY,
    borderRadius: 8,
    boxShadow: '0 1px 0 rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.08)',
  },
  preview: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  previewFrame: {
    width: '100%',
    minHeight: 420,
    background: C_BG,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 4,
    overflow: 'auto',
  },
  previewCaption: {
    color: C_SECONDARY,
    fontStyle: 'italic',
    margin: 0,
    fontSize: '0.9rem',
    textAlign: 'center' as const,
  },
  previewSizeBadge: { color: C_SECONDARY, fontStyle: 'normal' as const, opacity: 0.85 },
  controls: { display: 'flex', flexDirection: 'column', gap: 20 },
  heading: { margin: 0, fontSize: '1.5rem', color: C_PRIMARY },
  description: { margin: 0, color: C_SECONDARY, fontSize: '0.95rem' },
  group: { display: 'flex', flexDirection: 'column', gap: 8 },
  groupHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    fontSize: '0.85rem',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    color: C_PRIMARY,
  },
  groupName: { fontWeight: 600 },
  required: { color: C_SECONDARY, fontSize: '0.7rem', opacity: 0.7 },
  groupHelp: { margin: 0, fontSize: '0.85rem', color: C_SECONDARY },
  swatches: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'outline-color 0.15s',
  },
  selectedLabel: { fontSize: '0.9rem', color: C_PRIMARY, marginLeft: 8 },
  sizes: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 },
  sizeButton: {
    padding: '12px 8px',
    border: `1px solid ${C_BORDER}`,
    background: C_SURFACE,
    color: C_PRIMARY,
    borderRadius: 4,
    cursor: 'pointer',
    textAlign: 'center' as const,
  },
  sizeButtonSelected: {
    borderColor: C_PRIMARY,
    boxShadow: `0 0 0 1px ${C_PRIMARY}`,
    background: C_BG,
  },
  sizeLabel: { fontWeight: 600 },
  sizePrice: { fontSize: '0.8rem', color: C_SECONDARY, marginTop: 2 },
  selectStack: { display: 'flex', flexDirection: 'column', gap: 6 },
  selectRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    border: `1px solid ${C_BORDER}`,
    background: C_SURFACE,
    color: C_PRIMARY,
    borderRadius: 4,
    cursor: 'pointer',
  },
  selectRowSelected: { borderColor: C_PRIMARY, background: C_BG },
  selectPrice: { color: C_SECONDARY, fontSize: '0.9rem' },
  quantityRow: { display: 'flex', alignItems: 'center', gap: 12 },
  quantityLabel: {
    fontSize: '0.85rem',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    color: C_PRIMARY,
  },
  quantityInput: {
    width: 64,
    padding: '6px 8px',
    border: `1px solid ${C_BORDER}`,
    background: C_SURFACE,
    color: C_PRIMARY,
    borderRadius: 4,
  },
  totalRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTop: `1px solid ${C_BORDER}`,
  },
  unitLabel: {
    fontSize: '0.75rem',
    color: C_SECONDARY,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  unitPrice: { fontSize: '1rem', color: C_PRIMARY },
  totalBox: { textAlign: 'right' as const },
  totalLabel: {
    fontSize: '0.75rem',
    color: C_SECONDARY,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  totalPrice: { fontSize: '1.5rem', fontWeight: 700, color: C_PRIMARY },
  cta: {
    padding: '14px 20px',
    background: C_PRIMARY,
    color: C_BG,
    border: 'none',
    borderRadius: 4,
    fontSize: '1rem',
    cursor: 'pointer',
  },
  summary: { marginTop: 4 },
  summaryTitle: { cursor: 'pointer', color: C_SECONDARY, fontSize: '0.85rem' },
  summaryList: { margin: '8px 0 0 0', paddingLeft: 20, fontSize: '0.9rem', color: C_PRIMARY },
  summaryDelta: { color: C_SECONDARY, opacity: 0.8 },
}
