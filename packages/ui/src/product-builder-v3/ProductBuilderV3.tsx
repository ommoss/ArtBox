'use client'

import * as React from 'react'

import type { BuilderConfiguration, BuilderSelection } from '@artbox/types'

import { ComparisonDrawer } from './comparison/ComparisonDrawer'
import { usePinnedBuilds } from './comparison/use-pinned-builds'
import { computeIncludedChips } from './lib/included-chips'
import { Renderer25D } from './renderers/Renderer25D'
import { Renderer3D } from './renderers/Renderer3D'
import type { RendererDescriptor } from './renderers/types'
import { RoomPicker } from './room-preview/RoomPicker'
import { StageCustomize } from './stages/StageCustomize'
import { StageFormat } from './stages/StageFormat'
import { StageProgress } from './stages/StageProgress'
import { StageSize } from './stages/StageSize'
import { TOKENS } from './theme-tokens'
import type {
  BuilderStage,
  RoomBackground,
  SelectionMap,
  V2Option,
  V2OptionGroup,
  V2Template,
} from './types'
import { useSyncBuilderUrl } from './use-builder-url-state'

// Pixel-per-inch in the on-screen preview. Smaller on mobile so a 24×36
// print doesn't overflow a phone viewport.
const PX_PER_IN_DESKTOP = 15
const PX_PER_IN_MOBILE = 11
const MOBILE_BREAKPOINT_PX = 768

// Available renderers in priority order. First one whose `isAvailable()`
// returns true wins. 3D is scaffolded but disabled today, so 2.5D ships.
const RENDERERS: RendererDescriptor[] = [Renderer3D, Renderer25D]

// Template categories for which V3's Renderer3D actually produces a 3D
// scene. Others fall through to 2.5D inside Renderer3D itself, so the 2D
// toggle and auto-fallback only matter for these.
const THREE_D_CAPABLE_CATEGORIES = new Set<string>(['framed', 'canvas', 'block_mount'])

// How long to wait for the 3D scene to mount (including R3F lazy chunk +
// texture load) before automatically switching to 2.5D. Set generous so
// users on slow connections get a chance to see 3D.
const AUTO_FALLBACK_MS = 10000

const FORCE_2D_KEY = 'artbox-builder-v3-force-2d-v1'

// Only show the "View on a wall" picker for things that actually hang on a
// wall. Stickers, greeting cards, and similar formats render the picker
// would be confusing.
const WALL_HANGABLE_CATEGORIES = new Set<string>([
  'framed',
  'canvas',
  'block_mount',
  'paper_print',
  'poster',
])

function pickRenderer(): RendererDescriptor {
  for (const r of RENDERERS) {
    if (r.isAvailable()) return r
  }
  return Renderer25D
}

const fmt = (n: number, currency = 'CAD') =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(n)

type Props = {
  templates: V2Template[]
  imageUrl: string
  imageTitle?: string
  artworkSlug?: string
  // Optional: pre-selected template + selections (used by the comparison
  // drawer to re-open a pinned build, or by a shareable URL load).
  initialTemplateSlug?: string
  initialSelectionValues?: Record<string, string>
  // Smart defaults: per-artwork recommended selections set by the artist or
  // Artbox staff (e.g. "this dark photograph pairs best with black-oak +
  // 4-white mat"). Applied on first load when no initialSelectionValues or
  // URL state overrides them. Falls back to "first option per group" if
  // absent.
  recommendedSelections?: Record<string, string>
  // Optional: an initial wall/room background. The customer can change it
  // via the in-builder RoomPicker; this prop only sets the starting value.
  initialRoom?: RoomBackground | null
  // Whether to use the stage-based flow. When false, all options are shown
  // at once (V1-equivalent UX, transitional fallback).
  useStageFlow?: boolean
  // Whether to sync builder state to the URL querystring. Defaults to the
  // value of useStageFlow (shareable URLs are part of the stage-flow feature).
  syncUrl?: boolean
  onAddToCart?: (cfg: BuilderConfiguration, quantity: number) => void
}

export default function ProductBuilderV3({
  templates,
  imageUrl,
  imageTitle,
  initialTemplateSlug,
  initialSelectionValues,
  recommendedSelections,
  initialRoom = null,
  useStageFlow = false,
  syncUrl,
  onAddToCart,
}: Props) {
  const urlSyncEnabled = syncUrl ?? useStageFlow
  const [room, setRoom] = React.useState<RoomBackground | null>(initialRoom)
  const [templateSlug, setTemplateSlug] = React.useState<string>(
    initialTemplateSlug ?? templates[0]?.slug ?? '',
  )
  const template = templates.find((t) => t.slug === templateSlug) ?? templates[0]

  // Auto-clear the room when switching to a non-wall-hangable format so the
  // renderer doesn't keep trying to composite a sticker onto a bedroom wall.
  React.useEffect(() => {
    if (!template) return
    if (!WALL_HANGABLE_CATEGORIES.has(template.category) && room) {
      setRoom(null)
    }
  }, [template, room])

  const [selections, setSelections] = React.useState<SelectionMap>(() =>
    // initialSelectionValues (URL / pinned-build restore) takes precedence
    // over recommendedSelections (artwork-level smart defaults) over the
    // hardcoded first-option fallback.
    reconcile({}, template, initialSelectionValues ?? recommendedSelections),
  )
  const [quantity, setQuantity] = React.useState(1)
  const [pxPerIn, setPxPerIn] = React.useState(PX_PER_IN_DESKTOP)
  const [stage, setStage] = React.useState<BuilderStage>(
    useStageFlow ? 'format' : 'customize',
  )

  React.useEffect(() => {
    setSelections((prev) => reconcile(prev, template, undefined))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.slug])

  React.useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT_PX
      setPxPerIn(mobile ? PX_PER_IN_MOBILE : PX_PER_IN_DESKTOP)
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const visibleGroups = template
    ? template.optionGroups.filter((g) => isGroupVisible(g.slug, selections))
    : []

  useSyncBuilderUrl({
    enabled: urlSyncEnabled,
    templateSlug,
    stage,
    quantity,
    selections,
    template,
  })

  const canJumpTo = (s: BuilderStage): boolean => {
    if (s === 'format') return true
    if (s === 'size') return !!templateSlug
    if (s === 'customize') {
      // Allow Customize once a size is chosen (or the template has no size group).
      const sizeGroup = template?.optionGroups.find((g) => g.inputType === 'size')
      return !sizeGroup || !!selections[sizeGroup.slug]
    }
    return false
  }

  // Effective modifier for an option in the context of a currently-selected
  // size: flat amount + (per-sq-in × selected size's area). Falls back to
  // just the flat amount when no size is selected or the option has no
  // per-sq-in rate.
  const selectedSizeArea = React.useMemo(() => {
    if (!template) return 0
    const sizeGroup = template.optionGroups.find((g) => g.inputType === 'size')
    if (!sizeGroup) return 0
    const sel = selections[sizeGroup.slug]
    if (!sel?.widthIn || !sel?.heightIn) return 0
    return sel.widthIn * sel.heightIn
  }, [template, selections])

  const effectiveModifier = React.useCallback(
    (opt: V2Option | undefined): number => {
      if (!opt) return 0
      const flat = opt.priceModifierAmount ?? 0
      const perSqIn = opt.priceModifierPerSqIn ?? 0
      if (perSqIn === 0) return flat
      return flat + perSqIn * selectedSizeArea
    },
    [selectedSizeArea],
  )

  const unitPrice = React.useMemo(() => {
    if (!template) return 0
    const visible = new Set(visibleGroups.map((g) => g.slug))
    const sum = Object.entries(selections).reduce((acc, [slug, opt]) => {
      if (!visible.has(slug)) return acc
      return acc + effectiveModifier(opt)
    }, 0)
    return Math.round((template.basePrice + sum) * 100) / 100
  }, [template, selections, visibleGroups, effectiveModifier])

  const totalPrice = Math.round(unitPrice * quantity * 100) / 100

  const { pinned, add: addPinned, remove: removePinned } = usePinnedBuilds()
  const [copyHint, setCopyHint] = React.useState<string | null>(null)

  const handlePin = () => {
    if (!template) return
    const selectionValues: Record<string, string> = {}
    for (const [groupSlug, opt] of Object.entries(selections)) {
      selectionValues[groupSlug] = opt.value
    }
    addPinned({ templateSlug: template.slug, selectionValues })
  }

  const handleRestore = (build: { templateSlug: string; selectionValues: Record<string, string> }) => {
    setTemplateSlug(build.templateSlug)
    // The template-change effect will reconcile selections; we override
    // those reconciled values here with the saved ones in the next tick.
    const t = templates.find((tt) => tt.slug === build.templateSlug)
    if (t) {
      setSelections(reconcile({}, t, build.selectionValues))
    }
    if (useStageFlow) setStage('customize')
  }

  const handleCopyShareLink = async () => {
    if (typeof window === 'undefined' || !template) return
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}`
    try {
      await navigator.clipboard.writeText(url)
      setCopyHint('Link copied')
    } catch {
      setCopyHint('Press Ctrl+C to copy')
    }
    setTimeout(() => setCopyHint(null), 2500)
  }

  if (!template) {
    return (
      <div style={emptyStateStyle}>
        <p>No products available yet.</p>
      </div>
    )
  }

  const handleSelect = (groupSlug: string, opt: V2Option) => {
    setSelections((prev) => ({ ...prev, [groupSlug]: opt }))
  }

  const handleGroupSelect = (group: V2OptionGroup, opt: V2Option) => {
    handleSelect(group.slug, opt)
  }

  const handlePickFormat = (t: V2Template) => {
    setTemplateSlug(t.slug)
    // No auto-advance — let the customer see the main preview update for
    // the new format before they commit. They click "Continue →" to move on.
  }

  const stageOrder: BuilderStage[] = ['format', 'size', 'customize']
  const stageIdx = stageOrder.indexOf(stage)
  const goBack = () => {
    if (stageIdx > 0) setStage(stageOrder[stageIdx - 1])
  }
  const goNext = () => {
    const nextStage = stageOrder[stageIdx + 1]
    if (nextStage && canJumpTo(nextStage)) setStage(nextStage)
  }

  const handleAdd = () => {
    // Snapshot the EFFECTIVE per-option price (flat + per-sqin × size area)
    // into the order line so the order total matches what the customer
    // saw, regardless of pricing-formula changes later.
    const builderSelections: BuilderSelection[] = Object.entries(selections).map(
      ([groupSlug, opt]) => ({
        optionGroupSlug: groupSlug,
        optionId: opt.id,
        optionValue: opt.value,
        optionLabel: opt.label,
        priceModifierAmount: effectiveModifier(opt),
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

  // Force-2D toggle: user can opt out of 3D, OR auto-fallback kicks in
  // on error / slow load. Persists in sessionStorage so a page reload
  // keeps the user's preference for the session.
  const [force2D, setForce2D] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.sessionStorage.getItem(FORCE_2D_KEY) === '1'
    } catch {
      return false
    }
  })
  const persistForce2D = React.useCallback((v: boolean) => {
    setForce2D(v)
    try {
      window.sessionStorage.setItem(FORCE_2D_KEY, v ? '1' : '0')
    } catch {
      // ignore
    }
  }, [])

  const is3DCapable = THREE_D_CAPABLE_CATEGORIES.has(template.category)
  const using3D = is3DCapable && !force2D

  // Auto-fallback: if 3D is selected but isn't ready within
  // AUTO_FALLBACK_MS, switch to 2D and show a hint. The timer is only
  // armed when 3D goes active OR the template slug changes — NOT on
  // every option change, otherwise it'd reset readyRef and re-arm
  // forever, eventually firing the fallback even after onReady already
  // arrived.
  const [autoFallbackHint, setAutoFallbackHint] = React.useState<string | null>(null)
  const readyRef = React.useRef(false)
  React.useEffect(() => {
    if (!using3D) return
    readyRef.current = false
    const timer = setTimeout(() => {
      if (!readyRef.current) {
        persistForce2D(true)
        setAutoFallbackHint('3D took too long — showing 2D preview.')
        setTimeout(() => setAutoFallbackHint(null), 5000)
      }
    }, AUTO_FALLBACK_MS)
    return () => clearTimeout(timer)
  }, [using3D, template.slug, persistForce2D])

  const handleReady = React.useCallback(() => {
    readyRef.current = true
  }, [])

  const handleRendererError = React.useCallback(
    (err: Error) => {
      // WebGL unsupported, texture load failed, or R3F crashed. Drop to 2D
      // and tell the user why. Never auto-recover back to 3D in this session
      // — sessionStorage persistence avoids flicker on re-render.
      console.warn('[V3] 3D renderer error, falling back to 2D:', err)
      persistForce2D(true)
      setAutoFallbackHint('3D preview unavailable — showing 2D instead.')
      setTimeout(() => setAutoFallbackHint(null), 5000)
    },
    [persistForce2D],
  )

  const renderer = using3D ? pickRenderer() : Renderer25D

  return (
    <>
      <style>{CSS}</style>
      <div className="pbv2-shell">
        <div className="pbv2-preview">
          {WALL_HANGABLE_CATEGORIES.has(template.category) &&
          (!useStageFlow || stage !== 'format') ? (
            <RoomPicker active={room} onChange={setRoom} />
          ) : null}
          <div className="pbv2-preview-frame">
            <div className="pbv2-preview-center">
              <RendererErrorBoundary
                key={`${template.slug}-${using3D ? '3d' : '2d'}`}
                onError={handleRendererError}
              >
                {renderer.render({
                  template,
                  imageUrl,
                  selections,
                  pxPerIn,
                  room,
                  onReady: using3D ? handleReady : undefined,
                })}
              </RendererErrorBoundary>
            </div>
          </div>
          {imageTitle ? (
            <p className="pbv2-preview-caption">{imageTitle}</p>
          ) : null}
          {is3DCapable ? (
            <button
              type="button"
              onClick={() => persistForce2D(!force2D)}
              className="pbv2-mode-toggle"
              title={using3D ? 'Switch to a faster, simpler preview' : 'Try the 3D preview again'}
            >
              {using3D ? 'View in 2D' : 'View in 3D'}
            </button>
          ) : null}
          {autoFallbackHint ? (
            <p className="pbv2-mode-hint" role="status">
              {autoFallbackHint}
            </p>
          ) : null}
          <button
            type="button"
            onClick={handlePin}
            className="pbv2-save-compare"
            title="Save this configuration so you can compare it against another"
          >
            + Save to compare
          </button>
        </div>

        <div className="pbv2-controls">
          {/* Template selector — temporary horizontal tabs until Phase B
              replaces this with the StageFormat picker. */}
          {templates.length > 1 ? (
            <div className="pbv2-tabs">
              {templates.map((t) => {
                const active = t.slug === template.slug
                return (
                  <button
                    key={t.slug}
                    type="button"
                    onClick={() => setTemplateSlug(t.slug)}
                    className={`pbv2-tab ${active ? 'pbv2-tab--active' : ''}`}
                  >
                    {t.name}
                  </button>
                )
              })}
            </div>
          ) : null}

          <h2 className="pbv2-heading">{template.name}</h2>
          {template.description ? (
            <p className="pbv2-description">{template.description}</p>
          ) : null}

          {useStageFlow ? (
            <>
              <StageProgress
                current={stage}
                onJumpTo={setStage}
                canJumpTo={canJumpTo}
              />
              <div className="pbv2-stage-body">
                {stage === 'format' ? (
                  <StageFormat
                    templates={templates}
                    imageUrl={imageUrl}
                    activeSlug={template.slug}
                    onPick={handlePickFormat}
                  />
                ) : stage === 'size' ? (
                  <StageSize
                    template={template}
                    selections={selections}
                    onSelect={handleGroupSelect}
                  />
                ) : (
                  <StageCustomize
                    template={template}
                    selections={selections}
                    onSelect={handleGroupSelect}
                    isGroupVisible={isGroupVisible}
                  />
                )}
              </div>
              <div className="pbv2-stage-nav">
                <button
                  type="button"
                  className="pbv2-stage-back"
                  onClick={goBack}
                  disabled={stageIdx === 0}
                >
                  ← Back
                </button>
                {stageIdx < stageOrder.length - 1 ? (
                  <button
                    type="button"
                    className="pbv2-stage-next"
                    onClick={goNext}
                    disabled={!canJumpTo(stageOrder[stageIdx + 1])}
                  >
                    Continue →
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            <div className="pbv2-groups">
              {visibleGroups.map((group) => (
                <OptionGroupControl
                  key={group.slug}
                  groupSlug={group.slug}
                  groupName={group.name}
                  groupHelp={group.helpText}
                  inputType={group.inputType}
                  required={group.isRequired}
                  options={group.options}
                  selectedId={selections[group.slug]?.id}
                  onSelect={(opt) => handleSelect(group.slug, opt)}
                  effectiveModifier={effectiveModifier}
                />
              ))}
            </div>
          )}

          <div className="pbv2-qty">
            <label className="pbv2-qty-label">Quantity</label>
            <input
              type="number"
              min={1}
              max={50}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="pbv2-qty-input"
            />
          </div>

          <div className="pbv2-total">
            <div>
              <div className="pbv2-meta">Unit price</div>
              <div className="pbv2-unit">{fmt(unitPrice)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="pbv2-meta">Total</div>
              <div className="pbv2-grand">{fmt(totalPrice)}</div>
            </div>
          </div>

          {/* "What's included" chips — concrete value items below the price.
              Generated from category + current selections so the chips
              update when the customer toggles options (e.g. UV glass). */}
          <IncludedChipsRow template={template} selections={selections} />

          <div className="pbv2-action-row">
            <button type="button" onClick={handleAdd} className="pbv2-cta">
              Add to cart →
            </button>
            {urlSyncEnabled ? (
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="pbv2-secondary"
                title="Copy a shareable link for this exact build"
              >
                {copyHint ?? 'Share'}
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <ComparisonDrawer
        pinned={pinned}
        templates={templates}
        imageUrl={imageUrl}
        onRestore={handleRestore}
        onRemove={removePinned}
      />
    </>
  )
}

// ---------------- included chips row ----------------

function IncludedChipsRow({
  template,
  selections,
}: {
  template: V2Template
  selections: SelectionMap
}) {
  const chips = React.useMemo(
    () => computeIncludedChips(template, selections),
    [template, selections],
  )
  if (chips.length === 0) return null
  return (
    <div className="pbv2-chips-row" aria-label="What's included">
      <span className="pbv2-chips-label">Includes</span>
      <div className="pbv2-chips">
        {chips.map((chip) => (
          <span
            key={chip.label}
            className="pbv2-chip"
            title={chip.tooltip}
          >
            {chip.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ---------------- error boundary for the renderer ----------------
//
// Catches WebGL initialization failures and unhandled errors thrown by the
// 3D renderer so they don't blow up the whole builder. On error, calls
// onError so the shell can switch to 2D.
class RendererErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (err: Error) => void },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error) {
    this.props.onError(error)
  }
  render() {
    if (this.state.hasError) {
      // Render nothing while waiting for parent to swap to 2D and remount.
      return null
    }
    return this.props.children
  }
}

// ---------------- option group control ----------------

function OptionGroupControl({
  groupSlug,
  groupName,
  groupHelp,
  inputType,
  required,
  options,
  selectedId,
  onSelect,
  effectiveModifier,
}: {
  groupSlug: string
  groupName: string
  groupHelp?: string
  inputType: 'select' | 'swatch' | 'size'
  required: boolean
  options: V2Option[]
  selectedId: string | number | undefined
  onSelect: (opt: V2Option) => void
  // Computes the effective price modifier for an option in the current
  // size context. Lets us display "$X.XX" labels that already factor in
  // per-square-inch scaling.
  effectiveModifier: (opt: V2Option) => number
}) {
  return (
    <div className="pbv2-group">
      <div className="pbv2-group-head">
        <span className="pbv2-group-name">{groupName}</span>
        {required ? <span className="pbv2-required">required</span> : null}
      </div>
      {groupHelp ? <p className="pbv2-group-help">{groupHelp}</p> : null}

      {inputType === 'swatch' ? (
        <div className="pbv2-swatches">
          {options.map((opt) => {
            const sel = String(opt.id) === String(selectedId)
            const eff = effectiveModifier(opt)
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelect(opt)}
                className={`pbv2-swatch ${sel ? 'pbv2-swatch--active' : ''}`}
                style={{ background: opt.swatchColor ?? '#ddd' }}
                title={`${opt.label}${eff ? ` (+${fmt(eff)})` : ''}`}
                aria-label={opt.label}
              />
            )
          })}
          <span className="pbv2-selected-label">
            {options.find((o) => String(o.id) === String(selectedId))?.label}
          </span>
        </div>
      ) : inputType === 'size' ? (
        <div className="pbv2-sizes">
          {options.map((opt) => {
            const sel = String(opt.id) === String(selectedId)
            // Size options use the raw priceModifierAmount — they're the
            // size itself, not an upgrade on top of a size.
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelect(opt)}
                className={`pbv2-size ${sel ? 'pbv2-size--active' : ''}`}
              >
                <div className="pbv2-size-label">{opt.label}</div>
                <div className="pbv2-size-price">+{fmt(opt.priceModifierAmount)}</div>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="pbv2-radios">
          {options.map((opt) => {
            const sel = String(opt.id) === String(selectedId)
            const eff = effectiveModifier(opt)
            return (
              <label
                key={opt.id}
                className={`pbv2-radio ${sel ? 'pbv2-radio--active' : ''}`}
              >
                <input
                  type="radio"
                  name={groupSlug}
                  checked={sel}
                  onChange={() => onSelect(opt)}
                  style={{ marginRight: 8 }}
                />
                <span style={{ flex: 1 }}>{opt.label}</span>
                {eff > 0 ? (
                  <span className="pbv2-radio-price">+{fmt(eff)}</span>
                ) : null}
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---------------- helpers ----------------

// Mirrors V1 hardcoded dependency rules. Hidden groups don't contribute to
// price and aren't rendered.
function isGroupVisible(groupSlug: string, selections: SelectionMap): boolean {
  if (groupSlug === 'canvas-edge-color') {
    return selections['canvas-wrap']?.value === 'solid'
  }
  return true
}

// Reconcile a prior selections map against a new template (e.g. after the
// customer switches from Framed → Canvas). Sizes carry over by closest area;
// other groups carry over by exact value match if the new template happens
// to expose a group with the same slug.
// If `presetValues` is provided (initial selections from URL or pinned
// build), those take precedence over carry-over.
function reconcile(
  prev: SelectionMap,
  template: V2Template | undefined,
  presetValues: Record<string, string> | undefined,
): SelectionMap {
  if (!template) return {}
  const next: SelectionMap = {}
  const prevSize = Object.values(prev).find((o) => o?.widthIn && o?.heightIn)
  for (const group of template.optionGroups) {
    if (group.options.length === 0) continue
    const preset = presetValues?.[group.slug]
    if (preset) {
      const match = group.options.find((o) => o.value === preset)
      if (match) {
        next[group.slug] = match
        continue
      }
    }
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
      const match = carry
        ? group.options.find((o) => o.id === carry.id || o.value === carry.value)
        : undefined
      next[group.slug] = match ?? group.options[0]
    }
  }
  return next
}

const emptyStateStyle: React.CSSProperties = {
  padding: 32,
  background: TOKENS.surface,
  borderRadius: 8,
  textAlign: 'center',
  color: TOKENS.secondary,
}

// All visual properties bind to theme tokens (see ./theme-tokens.ts) so the
// builder matches whatever artist preset is active. No hardcoded colors,
// fonts, radii, or shadows below this point.
const CSS = `
.pbv2-shell {
  display: grid;
  grid-template-columns: minmax(280px, 1.2fr) minmax(280px, 1fr);
  gap: 48px;
  padding: 32px;
  background: ${TOKENS.surface};
  color: ${TOKENS.primary};
  border-radius: ${TOKENS.imageRadius};
  box-shadow: ${TOKENS.imageShadow};
  font-family: ${TOKENS.fontBody};
  font-size: ${TOKENS.baseFontSize};
  max-width: 1100px;
  margin: 0 auto;
}
.pbv2-preview {
  position: sticky;
  top: 16px;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.pbv2-preview-frame {
  width: 100%;
  min-height: 420px;
  background: ${TOKENS.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  border-radius: ${TOKENS.imageRadius};
  overflow: auto;
}
.pbv2-preview-center {
  position: relative;
}
.pbv2-preview-caption {
  margin: 0;
  font-size: 0.9rem;
  color: ${TOKENS.secondary};
  font-style: italic;
  text-align: center;
}
.pbv2-mode-toggle {
  align-self: center;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid ${TOKENS.border};
  border-radius: 999px;
  color: ${TOKENS.secondary};
  font-family: ${TOKENS.fontBody};
  font-size: 0.75rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.pbv2-mode-toggle:hover {
  border-color: ${TOKENS.primary};
  color: ${TOKENS.primary};
}
.pbv2-mode-toggle:focus { outline: none; }
.pbv2-mode-toggle:focus-visible {
  outline: 2px solid ${TOKENS.primary};
  outline-offset: 2px;
}
.pbv2-mode-hint {
  align-self: center;
  margin: 0;
  padding: 6px 10px;
  background: ${TOKENS.bg};
  border: 1px solid ${TOKENS.border};
  border-radius: 4px;
  font-size: 0.75rem;
  color: ${TOKENS.secondary};
  text-align: center;
}
.pbv2-save-compare {
  align-self: center;
  margin-top: 4px;
  padding: 8px 14px;
  background: transparent;
  border: 1px dashed ${TOKENS.border};
  border-radius: 999px;
  color: ${TOKENS.secondary};
  font-family: ${TOKENS.fontBody};
  font-size: 0.8rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.pbv2-save-compare:hover {
  border-color: ${TOKENS.primary};
  color: ${TOKENS.primary};
}
.pbv2-save-compare:focus { outline: none; }
.pbv2-save-compare:focus-visible {
  outline: 2px solid ${TOKENS.primary};
  outline-offset: 2px;
}
.pbv2-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.pbv2-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.pbv2-tab {
  padding: 8px 14px;
  border: 1px solid ${TOKENS.border};
  border-radius: 999px;
  background: ${TOKENS.surface};
  color: ${TOKENS.primary};
  font-size: 0.85rem;
  font-family: ${TOKENS.fontBody};
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  min-height: 36px;
}
.pbv2-tab:focus { outline: none; }
.pbv2-tab:focus-visible {
  outline: 2px solid ${TOKENS.primary};
  outline-offset: 2px;
}
.pbv2-tab:hover { border-color: ${TOKENS.primary}; }
.pbv2-tab--active {
  background: ${TOKENS.primary};
  color: ${TOKENS.bg};
  border-color: ${TOKENS.primary};
}
.pbv2-heading {
  margin: 0;
  font-size: 1.5rem;
  font-family: ${TOKENS.fontHeading};
  font-weight: ${TOKENS.weightHeading};
  letter-spacing: ${TOKENS.trackingHeading};
  color: ${TOKENS.primary};
}
.pbv2-description {
  margin: 0;
  color: ${TOKENS.secondary};
  font-size: 0.95rem;
}
.pbv2-stage-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pbv2-stage-nav {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid ${TOKENS.border};
}
.pbv2-stage-back, .pbv2-stage-next {
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-family: ${TOKENS.fontBody};
  font-size: 0.9rem;
  transition: opacity 0.15s, background 0.15s;
}
.pbv2-stage-back {
  background: transparent;
  border: 1px solid ${TOKENS.border};
  color: ${TOKENS.primary};
}
.pbv2-stage-back:hover:not(:disabled) { border-color: ${TOKENS.primary}; }
.pbv2-stage-next {
  background: ${TOKENS.primary};
  border: 1px solid ${TOKENS.primary};
  color: ${TOKENS.bg};
}
.pbv2-stage-back:disabled, .pbv2-stage-next:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.pbv2-stage-back:focus, .pbv2-stage-next:focus { outline: none; }
.pbv2-stage-back:focus-visible, .pbv2-stage-next:focus-visible {
  outline: 2px solid ${TOKENS.primary};
  outline-offset: 2px;
}
.pbv2-groups {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.pbv2-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pbv2-group-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.pbv2-group-name { font-weight: 600; }
.pbv2-required {
  color: ${TOKENS.secondary};
  font-size: 0.7rem;
  opacity: 0.7;
}
.pbv2-group-help {
  margin: 0;
  font-size: 0.85rem;
  color: ${TOKENS.secondary};
}
.pbv2-swatches {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.pbv2-swatch {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  outline: 1px solid ${TOKENS.border};
  transition: outline-color 0.15s;
}
.pbv2-swatch:focus { outline: none; }
.pbv2-swatch:focus-visible { outline: 3px solid ${TOKENS.primary}; }
.pbv2-swatch--active { outline: 3px solid ${TOKENS.primary}; }
.pbv2-selected-label {
  font-size: 0.9rem;
  color: ${TOKENS.primary};
  margin-left: 8px;
}
.pbv2-sizes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
}
.pbv2-size {
  padding: 12px 8px;
  border: 1px solid ${TOKENS.border};
  background: ${TOKENS.surface};
  color: ${TOKENS.primary};
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  font-family: ${TOKENS.fontBody};
}
.pbv2-size:focus { outline: none; }
.pbv2-size:focus-visible {
  outline: 2px solid ${TOKENS.primary};
  outline-offset: 2px;
}
.pbv2-size--active {
  border-color: ${TOKENS.primary};
  box-shadow: 0 0 0 1px ${TOKENS.primary};
  background: ${TOKENS.bg};
}
.pbv2-size-label { font-weight: 600; }
.pbv2-size-price { font-size: 0.8rem; color: ${TOKENS.secondary}; margin-top: 2px; }
.pbv2-radios { display: flex; flex-direction: column; gap: 6px; }
.pbv2-radio {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid ${TOKENS.border};
  background: ${TOKENS.surface};
  color: ${TOKENS.primary};
  border-radius: 4px;
  cursor: pointer;
  font-family: ${TOKENS.fontBody};
}
.pbv2-radio--active {
  border-color: ${TOKENS.primary};
  background: ${TOKENS.bg};
}
.pbv2-radio-price { color: ${TOKENS.secondary}; font-size: 0.9rem; }
.pbv2-qty {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pbv2-qty-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${TOKENS.primary};
}
.pbv2-qty-input {
  width: 64px;
  padding: 6px 8px;
  border: 1px solid ${TOKENS.border};
  background: ${TOKENS.surface};
  color: ${TOKENS.primary};
  border-radius: 4px;
  font-family: ${TOKENS.fontBody};
}
.pbv2-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid ${TOKENS.border};
}
.pbv2-meta {
  font-size: 0.75rem;
  color: ${TOKENS.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.pbv2-unit { font-size: 1rem; color: ${TOKENS.primary}; }
.pbv2-grand {
  font-size: 1.5rem;
  font-weight: 700;
  color: ${TOKENS.primary};
}
.pbv2-chips-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}
.pbv2-chips-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${TOKENS.secondary};
  flex: 0 0 auto;
}
.pbv2-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pbv2-chip {
  padding: 3px 10px;
  background: ${TOKENS.bg};
  border: 1px solid ${TOKENS.border};
  border-radius: 999px;
  font-size: 0.75rem;
  color: ${TOKENS.primary};
  white-space: nowrap;
  cursor: default;
}
.pbv2-action-row {
  display: flex;
  gap: 8px;
  align-items: stretch;
}
.pbv2-cta {
  flex: 1 1 auto;
  padding: 14px 20px;
  background: ${TOKENS.primary};
  color: ${TOKENS.bg};
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-family: ${TOKENS.fontBody};
  cursor: pointer;
  min-height: 48px;
}
.pbv2-secondary {
  flex: 0 0 auto;
  padding: 12px 14px;
  background: ${TOKENS.surface};
  color: ${TOKENS.primary};
  border: 1px solid ${TOKENS.border};
  border-radius: 4px;
  font-size: 0.85rem;
  font-family: ${TOKENS.fontBody};
  cursor: pointer;
  min-height: 48px;
}
.pbv2-secondary:hover { border-color: ${TOKENS.primary}; }
.pbv2-secondary:focus { outline: none; }
.pbv2-secondary:focus-visible {
  outline: 2px solid ${TOKENS.primary};
  outline-offset: 2px;
}
.pbv2-cta:focus { outline: none; }
.pbv2-cta:focus-visible {
  outline: 2px solid ${TOKENS.primary};
  outline-offset: 2px;
}
@media (max-width: 768px) {
  .pbv2-shell {
    grid-template-columns: 1fr !important;
    gap: 24px !important;
    padding: 16px !important;
  }
  .pbv2-preview { position: static !important; }
  .pbv2-preview-frame {
    min-height: 280px !important;
    padding: 16px !important;
  }
  .pbv2-size { padding: 14px 10px !important; min-height: 48px !important; }
  .pbv2-radio { padding: 14px !important; min-height: 48px !important; }
}
`
