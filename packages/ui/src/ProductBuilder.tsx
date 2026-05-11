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
  // Both the refine section and the price breakdown are closed by default
  // for SSR/hydration safety; the viewport effect opens them on desktop
  // after mount.
  const [refineOpen, setRefineOpen] = useState(false)
  const [priceOpen, setPriceOpen] = useState(false)

  // Carry size selection (and equivalent options) across template switches.
  useEffect(() => {
    setSelections((prev) => reconcileSelections(prev, template))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.slug])

  // Smaller pixels-per-inch on mobile so 24×36 fits a phone viewport, and
  // collapsible details default-open on desktop / closed on mobile.
  useEffect(() => {
    const update = () => {
      const isMobile =
        typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT_PX
      setPxPerIn(isMobile ? PX_PER_IN_MOBILE : PX_PER_IN_DESKTOP)
      setRefineOpen(!isMobile)
      setPriceOpen(!isMobile)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const unitPrice = useMemo(() => {
    // Only count selections from groups that are currently visible — hidden
    // groups (e.g. canvas-edge-color when wrap is gallery) shouldn't add cost.
    const visibleSlugs = new Set(
      template.optionGroups.filter((g) => isGroupVisible(g, selections)).map((g) => g.slug),
    )
    const sum = Object.entries(selections).reduce((acc, [slug, opt]) => {
      if (!visibleSlugs.has(slug)) return acc
      return acc + (opt?.priceModifierAmount ?? 0)
    }, 0)
    return Math.round((template.basePrice + sum) * 100) / 100
  }, [selections, template])

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
  const shipDate = useMemo(() => estimatedShipDate(template.category), [template.category])

  // Split option groups: "primary" stay inline, "refine" tuck into a
  // collapsible section (open on desktop, closed on mobile).
  const visibleGroups = template.optionGroups.filter((g) =>
    isGroupVisible(g, selections),
  )
  const primaryGroups = visibleGroups.filter((g) => !ADVANCED_GROUP_SLUGS.has(g.slug))
  const refineGroups = visibleGroups.filter((g) => ADVANCED_GROUP_SLUGS.has(g.slug))

  return (
    <>
      <style>{RESPONSIVE_CSS}</style>
      <div className="pb-shell" style={styles.shell}>
      <div className="pb-preview" style={styles.preview}>
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

        {template.optionGroups.map((group) => {
          if (!isGroupVisible(group, selections)) return null
          return (
            <OptionGroupControl
              key={group.slug}
              group={group}
              selectedId={selections[group.slug]?.id}
              onSelect={(opt) => handleSelect(group, opt)}
            />
          )
        })}

        {refineGroups.length > 0 ? (
          <details
            className="pb-refine"
            open={refineOpen}
            onToggle={(e) => setRefineOpen((e.currentTarget as HTMLDetailsElement).open)}
          >
            <summary className="pb-refine-summary">
              Refine print
              <span className="pb-refine-hint">
                ({refineGroups.length} more {refineGroups.length === 1 ? 'option' : 'options'})
              </span>
            </summary>
            <div className="pb-refine-body">
              {refineGroups.map((group) => (
                <OptionGroupControl
                  key={group.slug}
                  group={group}
                  selectedId={selections[group.slug]?.id}
                  onSelect={(opt) => handleSelect(group, opt)}
                />
              ))}
            </div>
          </details>
        ) : null}

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

        <div style={styles.shipDateRow} aria-label="Estimated ready-by date">
          <span style={styles.shipDateIcon} aria-hidden>
            ✓
          </span>
          <span>
            <strong>Ready to ship by {shipDate}</strong>{' '}
            <span style={styles.shipDateHint}>· production and dispatch from Victoria, BC</span>
          </span>
        </div>

        <details
          style={styles.summary}
          open={priceOpen}
          onToggle={(e) =>
            setPriceOpen((e.currentTarget as HTMLDetailsElement).open)
          }
        >
          <summary style={styles.summaryTitle}>Price breakdown</summary>
          <div style={styles.priceBreakdown}>
            <div style={styles.priceRow}>
              <span>Base ({template.name})</span>
              <span style={styles.priceValue}>{fmt(template.basePrice)}</span>
            </div>
            {visibleGroups.map((group) => {
              const sel = selections[group.slug]
              if (!sel) return null
              return (
                <div key={group.slug} style={styles.priceRow}>
                  <span>
                    {group.name}: {sel.label}
                  </span>
                  <span style={styles.priceValue}>
                    {sel.priceModifierAmount > 0
                      ? `+${fmt(sel.priceModifierAmount)}`
                      : 'no charge'}
                  </span>
                </div>
              )
            })}
            <div style={styles.priceDivider} />
            <div style={styles.priceRow}>
              <span>Per print</span>
              <span style={styles.priceValue}>{fmt(unitPrice)}</span>
            </div>
            {quantity > 1 ? (
              <>
                <div style={styles.priceRow}>
                  <span>Quantity</span>
                  <span style={styles.priceValue}>× {quantity}</span>
                </div>
                <div style={styles.priceDivider} />
                <div style={{ ...styles.priceRow, fontWeight: 600 }}>
                  <span>Total</span>
                  <span style={styles.priceValue}>{fmt(totalPrice)}</span>
                </div>
              </>
            ) : null}
          </div>
        </details>

        <button
          type="button"
          onClick={handleAddToCart}
          style={styles.cta}
          className="pb-cta-desktop"
        >
          Add to cart →
        </button>
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
.pb-preview {
  position: sticky;
  top: 16px;
  align-self: flex-start;
}
.pb-refine {
  border-top: 1px solid var(--color-border, rgba(0,0,0,0.08));
  padding-top: 12px;
}
.pb-refine-summary {
  cursor: pointer;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-primary, #1a1a1a);
  list-style: none;
  display: flex;
  align-items: center;
  gap: 8px;
}
.pb-refine-summary::-webkit-details-marker { display: none; }
.pb-refine-summary::before {
  content: '+';
  font-size: 0.95rem;
  display: inline-block;
  width: 12px;
  text-align: center;
  transition: transform 0.15s ease;
}
.pb-refine[open] .pb-refine-summary::before { content: '−'; }
.pb-refine-hint {
  font-size: 0.7rem;
  text-transform: none;
  letter-spacing: 0;
  color: var(--color-secondary, rgba(0,0,0,0.6));
}
.pb-refine-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 16px;
}
@media (max-width: 768px) {
  .pb-shell {
    grid-template-columns: 1fr !important;
    gap: 24px !important;
    padding: 16px !important;
  }
  .pb-preview {
    /* In single-column mobile layout, sticky doesn't make sense — controls
       are below the preview, not beside it. */
    position: static !important;
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

// Option groups that get tucked into the "Refine print" details element.
// Most customers leave these at default; the primary lineup (size, frame
// colour, wrap mode, etc.) stays inline.
const ADVANCED_GROUP_SLUGS = new Set([
  'mat',
  'glass-type',
  'card-finish',
  'canvas-edge-color',
])

// Production + dispatch lead time per template category, in business days.
// Tunable per Artbox's actual capacity; these are conservative starting
// estimates that survive typical seasonal variance.
const SHIP_LEAD_DAYS: Record<string, number> = {
  paper_print: 7,
  framed: 14,
  canvas: 10,
  block_mount: 10,
  art_card: 5,
  sticker: 5,
  poster: 7,
  calendar: 9,
}

function estimatedShipDate(category: string): string {
  const days = SHIP_LEAD_DAYS[category] ?? 7
  const target = new Date()
  target.setDate(target.getDate() + days)
  return target.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

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

// Some option groups only matter when another option is set a certain way
// (e.g. the canvas edge colour only matters when wrap = "solid"). Rather than
// model this in the schema, we hardcode the small set of dependencies here.
// Returns true if the group should be visible given current selections.
function isGroupVisible(
  group: PublicOptionGroup,
  selections: Record<string, PublicOption>,
): boolean {
  if (group.slug === 'canvas-edge-color') {
    return selections['canvas-wrap']?.value === 'solid'
  }
  return true
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

// === Depth visualization ===
// Approach A: a single bottom-edge strip foreshortened via CSS perspective.
// Scaffolded so adding a right-edge strip (Approach B) is just dropping the
// `right` flag in the spec and rendering the second JSX block.

type DepthEdgeStyle =
  // Canvas wrap: shows a slice of the print's inflated image — either the
  // bleed past the visible print (gallery) or the print's edge mirrored.
  | { kind: 'gallery' }
  | { kind: 'mirror' }
  // For frames, blocks, and solid-coloured canvas wraps: a CSS background.
  | { kind: 'fill'; style: React.CSSProperties }

type DepthSpec = {
  depthInches: number
  // Pixels of bleed inflation applied uniformly on all four edges of the
  // canvas print so the image's aspect ratio is preserved (rather than being
  // crushed only vertically). Always uses the max stretcher depth so the
  // print view stays stable when the customer toggles 0.75" ↔ 1.5".
  // 0 for non-canvas templates.
  inflationPx: number
  bottom: DepthEdgeStyle
  right: DepthEdgeStyle
}

const MAX_CANVAS_STRETCHER_IN = 1.5

function getDepthSpec(
  template: PublicProductTemplate,
  selections: Record<string, PublicOption>,
  pxPerIn: number,
): DepthSpec | null {
  if (template.category === 'canvas') {
    const stretcher = selections['stretcher-depth']
    const wrap = selections['canvas-wrap']
    const edgeColor = selections['canvas-edge-color']

    const depthInches = stretcher?.value === '1.5in' ? 1.5 : 0.75
    const inflationPx = MAX_CANVAS_STRETCHER_IN * pxPerIn

    let edge: DepthEdgeStyle
    if (wrap?.value === 'mirror') {
      edge = { kind: 'mirror' }
    } else if (wrap?.value === 'solid') {
      edge = {
        kind: 'fill',
        style: { background: edgeColor?.swatchColor || '#1a2840' },
      }
    } else {
      edge = { kind: 'gallery' }
    }
    // Bottom and right share the same edge treatment for canvas — the same
    // wrap logic applies to every side of the canvas in real life.
    return { depthInches, inflationPx, bottom: edge, right: edge }
  }

  if (template.category === 'framed') {
    const frame = selections['frame-color']
    const edge: DepthEdgeStyle = {
      kind: 'fill',
      style: { background: woodGrainBackground(frame?.swatchColor || '#3a2a1c') },
    }
    return { depthInches: 1.25, inflationPx: 0, bottom: edge, right: edge }
  }

  if (template.category === 'block_mount') {
    const edgeOpt = selections['block-edge']
    const edge: DepthEdgeStyle = {
      kind: 'fill',
      style: { background: blockEdgeBackground(edgeOpt?.swatchColor || '#c19a6b') },
    }
    return { depthInches: 0.75, inflationPx: 0, bottom: edge, right: edge }
  }

  return null
}

function DepthStrips({
  spec,
  pxPerIn,
  imageUrl,
  printWidthPx,
  printHeightPx,
}: {
  spec: DepthSpec
  pxPerIn: number
  imageUrl: string
  printWidthPx: number
  printHeightPx: number
}) {
  // For canvas the strip thickness equals the actual bleed; for non-image
  // wraps (frame/block) we add a small visual multiplier since there's no
  // literal bleed to reveal.
  const stripThickness =
    spec.inflationPx > 0
      ? spec.depthInches * pxPerIn
      : spec.depthInches * pxPerIn * 1.4

  const inflatedWidth = printWidthPx + 2 * spec.inflationPx
  const inflatedHeight = printHeightPx + 2 * spec.inflationPx

  // Build the inner image element for an edge given how it should expose
  // the inflated image. Returns null for fill-style edges.
  const renderEdgeImage = (
    edge: DepthEdgeStyle,
    side: 'bottom' | 'right',
  ): React.ReactNode => {
    if (edge.kind === 'fill') return null
    const isMirror = edge.kind === 'mirror'

    // Default positioning matches the print's image (centred with bleed
    // around). Each kind/side combo shifts and/or flips from there.
    let left = -spec.inflationPx
    let top = -spec.inflationPx
    let transform: string | undefined

    if (edge.kind === 'gallery') {
      if (side === 'bottom') top = -(spec.inflationPx + printHeightPx)
      if (side === 'right') left = -(spec.inflationPx + printWidthPx)
    } else if (isMirror) {
      // Position matches the print, just flip the relevant axis.
      transform = side === 'bottom' ? 'scaleY(-1)' : 'scaleX(-1)'
    }

    return (
      <img
        src={imageUrl}
        alt=""
        style={{
          display: 'block',
          position: 'absolute',
          left,
          top,
          width: inflatedWidth,
          height: inflatedHeight,
          objectFit: 'cover',
          objectPosition: 'center',
          transform,
          transformOrigin: 'center',
        }}
      />
    )
  }

  return (
    <>
      {/* Bottom strip — tilts back away from the viewer */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 'calc(100% + 3px)',
          height: stripThickness,
          transformOrigin: 'top',
          transform: 'perspective(1400px) rotateX(-30deg)',
          boxShadow:
            'inset 0 1px 3px rgba(0,0,0,0.18), 0 4px 10px rgba(0,0,0,0.14)',
          overflow: 'hidden',
          pointerEvents: 'none',
          borderRadius: '2px',
          ...(spec.bottom.kind === 'fill' ? spec.bottom.style : {}),
        }}
      >
        {renderEdgeImage(spec.bottom, 'bottom')}
      </div>

      {/* Right strip — tilts back to the right of the viewer */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 'calc(100% + 3px)',
          width: stripThickness,
          transformOrigin: 'left',
          transform: 'perspective(1400px) rotateY(30deg)',
          boxShadow:
            'inset 1px 0 3px rgba(0,0,0,0.18), 4px 0 10px rgba(0,0,0,0.14)',
          overflow: 'hidden',
          pointerEvents: 'none',
          borderRadius: '2px',
          ...(spec.right.kind === 'fill' ? spec.right.style : {}),
        }}
      >
        {renderEdgeImage(spec.right, 'right')}
      </div>
    </>
  )
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

  const depthSpec = getDepthSpec(template, selections, pxPerIn)

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
        {depthSpec ? (
          <DepthStrips
            spec={depthSpec}
            pxPerIn={pxPerIn}
            imageUrl={imageUrl}
            printWidthPx={widthPx}
            printHeightPx={heightPx}
          />
        ) : null}
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
        {depthSpec ? (
          <DepthStrips
            spec={depthSpec}
            pxPerIn={pxPerIn}
            imageUrl={imageUrl}
            printWidthPx={widthPx}
            printHeightPx={heightPx}
          />
        ) : null}
      </div>
    )
  }

  if (template.category === 'canvas') {
    // Inflate the image on BOTH axes so the bleed extends past the visible
    // print on every side without distorting the image's aspect ratio. An
    // inner clip container shows the central printWidthPx × printHeightPx
    // window; the depth strips reveal the bottom and right bleed bands.
    const inflationPx = depthSpec?.inflationPx ?? 0
    const inflatedWidth = widthPx + 2 * inflationPx
    const inflatedHeight = heightPx + 2 * inflationPx
    return (
      <div style={outerCommon}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            boxShadow:
              '0 18px 32px rgba(0,0,0,0.22), 4px 0 0 0 rgba(0,0,0,0.06), 0 4px 0 0 rgba(0,0,0,0.06)',
          }}
        >
          <img
            src={imageUrl}
            alt=""
            style={{
              display: 'block',
              position: 'absolute',
              left: -inflationPx,
              top: -inflationPx,
              width: inflatedWidth,
              height: inflatedHeight,
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
          <div style={canvasOverlay()} />
        </div>
        {depthSpec ? (
          <DepthStrips
            spec={depthSpec}
            pxPerIn={pxPerIn}
            imageUrl={imageUrl}
            printWidthPx={widthPx}
            printHeightPx={heightPx}
          />
        ) : null}
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
  shipDateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    background: 'rgba(26, 127, 70, 0.08)',
    border: `1px solid rgba(26, 127, 70, 0.18)`,
    borderRadius: 4,
    fontSize: '0.85rem',
    color: C_PRIMARY,
  },
  shipDateIcon: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: '#1a7f46',
    color: '#fff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: 700,
    flex: '0 0 18px',
  },
  shipDateHint: { color: C_SECONDARY, fontWeight: 400 },
  priceBreakdown: {
    marginTop: 12,
    padding: '10px 12px',
    background: C_BG,
    border: `1px solid ${C_BORDER}`,
    borderRadius: 4,
    fontSize: '0.85rem',
    color: C_PRIMARY,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    lineHeight: 1.5,
  },
  priceValue: { color: C_PRIMARY, fontVariantNumeric: 'tabular-nums' as const },
  priceDivider: {
    height: 1,
    background: C_BORDER,
    margin: '6px 0',
  },
}
