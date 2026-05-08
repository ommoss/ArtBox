'use client'

import { useMemo, useState } from 'react'

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
  const [selections, setSelections] = useState<Record<string, PublicOption>>(() => {
    const init: Record<string, PublicOption> = {}
    for (const g of template.optionGroups) {
      if (g.options.length > 0) init[g.slug] = g.options[0]
    }
    return init
  })
  const [quantity, setQuantity] = useState(1)

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
  const dims = computeDimensions(sizeSelection?.widthIn, sizeSelection?.heightIn)

  return (
    <>
      <style>{RESPONSIVE_CSS}</style>
      <div className="pb-shell" style={styles.shell}>
      <div style={styles.preview}>
        <div style={styles.previewFrame}>
          <ImagePreview template={template} imageUrl={imageUrl} selections={selections} />
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

        <button type="button" onClick={handleAddToCart} style={styles.cta}>
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
@media (max-width: 768px) {
  .pb-shell {
    grid-template-columns: 1fr !important;
    gap: 32px !important;
    padding: 20px !important;
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

// 12 px = 1 inch baseline. Below the floor, the print is uniformly scaled up
// so the smaller dimension reaches MIN_PREVIEW_DIM. Aspect ratio preserved.
const PX_PER_IN = 12
const MIN_PREVIEW_DIM = 100
const FALLBACK_WIDTH = 240
const FALLBACK_HEIGHT = 240

type PreviewDims = { widthPx: number; heightPx: number; enlarged: boolean }

function computeDimensions(widthIn?: number, heightIn?: number): PreviewDims {
  if (!widthIn || !heightIn) {
    return { widthPx: FALLBACK_WIDTH, heightPx: FALLBACK_HEIGHT, enlarged: false }
  }
  const naturalW = widthIn * PX_PER_IN
  const naturalH = heightIn * PX_PER_IN
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

function ImagePreview({
  template,
  imageUrl,
  selections,
}: {
  template: PublicProductTemplate
  imageUrl: string
  selections: Record<string, PublicOption>
}) {
  const sizeSel = findSizeSelection(template, selections)
  const { widthPx, heightPx } = computeDimensions(sizeSel?.widthIn, sizeSel?.heightIn)

  const frameColor = selections['frame-color']?.swatchColor
  const blockEdge = selections['block-edge']?.swatchColor
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
  const matColor = matSel?.value?.endsWith('-black') ? '#111' : '#fafafa'
  const blockEdgeThicknessPx = template.category === 'block_mount' ? 6 : 0

  const imageStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }

  // Outer container's dimensions = the customer's selected print size.
  // Frame/mat/edge treatments live INSIDE this container so total visible size = print size.
  const outerStyle: React.CSSProperties = {
    width: widthPx,
    height: heightPx,
    transition: 'width 0.25s ease, height 0.25s ease',
    boxShadow:
      template.category === 'canvas'
        ? '0 18px 32px rgba(0,0,0,0.22)'
        : template.category === 'block_mount'
          ? '0 14px 28px rgba(0,0,0,0.22)'
          : template.category === 'framed'
            ? '0 12px 32px rgba(0,0,0,0.20)'
            : '0 8px 24px rgba(0,0,0,0.12)',
    background:
      template.category === 'framed' ? frameColor || '#222' :
      template.category === 'block_mount' ? blockEdge || '#c19a6b' :
      'transparent',
    padding: template.category === 'framed' ? frameThicknessPx : blockEdgeThicknessPx,
    boxSizing: 'border-box',
  }

  if (template.category === 'framed') {
    return (
      <div style={outerStyle}>
        <div
          style={{
            width: '100%',
            height: '100%',
            background: matColor,
            padding: matThicknessPx,
            boxSizing: 'border-box',
          }}
        >
          <img src={imageUrl} alt="" style={imageStyle} />
        </div>
      </div>
    )
  }

  if (template.category === 'block_mount') {
    return (
      <div style={outerStyle}>
        <img src={imageUrl} alt="" style={imageStyle} />
      </div>
    )
  }

  if (template.category === 'canvas') {
    return (
      <div style={outerStyle}>
        <img src={imageUrl} alt="" style={imageStyle} />
      </div>
    )
  }

  return (
    <div style={outerStyle}>
      <img src={imageUrl} alt="" style={imageStyle} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: 'grid',
    gridTemplateColumns: 'minmax(280px, 1.1fr) minmax(280px, 1fr)',
    gap: 48,
    padding: 32,
    maxWidth: 1100,
    margin: '0 auto',
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 1px 0 rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.08)',
  },
  preview: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  previewFrame: {
    width: '100%',
    minHeight: 420,
    background: '#f4f4f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 4,
    overflow: 'auto',
  },
  previewCaption: {
    color: '#666',
    fontStyle: 'italic',
    margin: 0,
    fontSize: '0.9rem',
    textAlign: 'center' as const,
  },
  previewSizeBadge: { color: '#999', fontStyle: 'normal' as const },
  controls: { display: 'flex', flexDirection: 'column', gap: 20 },
  heading: { margin: 0, fontSize: '1.5rem' },
  description: { margin: 0, color: '#555', fontSize: '0.95rem' },
  group: { display: 'flex', flexDirection: 'column', gap: 8 },
  groupHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    fontSize: '0.85rem',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    color: '#333',
  },
  groupName: { fontWeight: 600 },
  required: { color: '#999', fontSize: '0.7rem' },
  groupHelp: { margin: 0, fontSize: '0.85rem', color: '#777' },
  swatches: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'outline-color 0.15s',
  },
  selectedLabel: { fontSize: '0.9rem', color: '#333', marginLeft: 8 },
  sizes: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 },
  sizeButton: {
    padding: '12px 8px',
    border: '1px solid #ddd',
    background: '#fff',
    borderRadius: 4,
    cursor: 'pointer',
    textAlign: 'center' as const,
  },
  sizeButtonSelected: {
    borderColor: '#111',
    boxShadow: '0 0 0 1px #111',
    background: '#fafafa',
  },
  sizeLabel: { fontWeight: 600 },
  sizePrice: { fontSize: '0.8rem', color: '#666', marginTop: 2 },
  selectStack: { display: 'flex', flexDirection: 'column', gap: 6 },
  selectRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: 4,
    cursor: 'pointer',
  },
  selectRowSelected: { borderColor: '#111', background: '#fafafa' },
  selectPrice: { color: '#666', fontSize: '0.9rem' },
  quantityRow: { display: 'flex', alignItems: 'center', gap: 12 },
  quantityLabel: { fontSize: '0.85rem', textTransform: 'uppercase' as const, letterSpacing: 0.5, color: '#333' },
  quantityInput: { width: 64, padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4 },
  totalRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTop: '1px solid #eee',
  },
  unitLabel: { fontSize: '0.75rem', color: '#777', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  unitPrice: { fontSize: '1rem', color: '#333' },
  totalBox: { textAlign: 'right' as const },
  totalLabel: { fontSize: '0.75rem', color: '#777', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  totalPrice: { fontSize: '1.5rem', fontWeight: 700 },
  cta: {
    padding: '14px 20px',
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    fontSize: '1rem',
    cursor: 'pointer',
  },
  summary: { marginTop: 4 },
  summaryTitle: { cursor: 'pointer', color: '#666', fontSize: '0.85rem' },
  summaryList: { margin: '8px 0 0 0', paddingLeft: 20, fontSize: '0.9rem', color: '#333' },
  summaryDelta: { color: '#999' },
}
