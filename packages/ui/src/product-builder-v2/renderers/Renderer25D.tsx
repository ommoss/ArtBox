import * as React from 'react'

import { TOKENS } from '../theme-tokens'
import type { SelectionMap, V2Option, V2Template } from '../types'

import type { Renderer, RendererDescriptor, RendererProps } from './types'

// 2.5D photo compositor.
// ----------------------
// Two visual layers:
//   1. The print itself, sized to scale at the current `pxPerIn`.
//   2. A material treatment around/under the print, picked per template
//      category (paper / framed / canvas / block_mount).
//
// For frames, the material treatment has TWO render paths:
//   a. Photo compositor — when the selected frame-color option has both
//      `cornerImage` and `railImage` set, compose them around the print as
//      mitered corners + tileable rails. Photographic, no CSS gradients.
//   b. Fallback — CSS wood-grain background + a perspective-rotated bottom
//      and right depth strip. This is the V1 behavior, preserved verbatim
//      so the builder still looks credible before real photos are uploaded.
//
// Canvas and block_mount currently only have the fallback path; their
// equivalent of the corner image would be an edge wrap photo, which can be
// added later under the same V2Option.railImage slot.

// ---------------- shared helpers ----------------

function getSizedDims(
  widthIn: number | undefined,
  heightIn: number | undefined,
  pxPerIn: number,
  compact = false,
) {
  // Main preview: scale up tiny prints so the minimum dimension is at least
  // 140px on screen — otherwise an 8x10 looks like a postage stamp.
  //
  // Compact (thumbnails): scale every format to a consistent target max
  // dimension so a 3" sticker and a 24×36 print both fit nicely in the same
  // 140×140 card. Without this, real-world size differences (10× across the
  // catalog) would make stickers tiny and large prints overflow.
  if (compact) {
    const TARGET_MAX_PX = 110
    if (!widthIn || !heightIn) {
      return { widthPx: TARGET_MAX_PX, heightPx: TARGET_MAX_PX, enlarged: false }
    }
    const natW = widthIn * pxPerIn
    const natH = heightIn * pxPerIn
    const maxDim = Math.max(natW, natH)
    const scale = TARGET_MAX_PX / maxDim
    return {
      widthPx: Math.round(natW * scale),
      heightPx: Math.round(natH * scale),
      enlarged: scale > 1,
    }
  }
  const MIN_DIM = 140
  const FALLBACK = 280
  if (!widthIn || !heightIn) {
    return { widthPx: FALLBACK, heightPx: FALLBACK, enlarged: false }
  }
  const natW = widthIn * pxPerIn
  const natH = heightIn * pxPerIn
  const minDim = Math.min(natW, natH)
  if (minDim >= MIN_DIM) return { widthPx: natW, heightPx: natH, enlarged: false }
  const scale = MIN_DIM / minDim
  return {
    widthPx: Math.round(natW * scale),
    heightPx: Math.round(natH * scale),
    enlarged: true,
  }
}

function findSizeSelection(
  template: V2Template,
  selections: SelectionMap,
): V2Option | null {
  for (const group of template.optionGroups) {
    if (group.inputType !== 'size') continue
    const sel = selections[group.slug]
    if (sel && (sel.widthIn || sel.heightIn)) return sel
  }
  return null
}

// Mat thickness in px keyed off print dimension. "4-white" is a wider gallery
// mat; numeric "2..." prefixes use a thinner border.
function matThickness(baseDim: number, matSel: V2Option | undefined): number {
  if (!matSel) return 0
  if (matSel.value === '4-white') return Math.round(baseDim * 0.16)
  if (matSel.value?.startsWith('2')) return Math.round(baseDim * 0.08)
  return 0
}

function matColor(matSel: V2Option | undefined): string {
  return matSel?.value?.endsWith('-black') ? '#1a1a1a' : '#f4f1ea'
}

// ---------------- CSS-texture fallbacks (V1 parity) ----------------

function woodGrainBg(base: string): string {
  return [
    'repeating-linear-gradient(90deg, transparent 0 3px, rgba(0,0,0,0.06) 3px 4px)',
    'repeating-linear-gradient(90deg, transparent 0 11px, rgba(255,255,255,0.05) 11px 13px)',
    'linear-gradient(180deg, rgba(255,255,255,0.06), transparent 25%, transparent 75%, rgba(0,0,0,0.07))',
    `linear-gradient(${base}, ${base})`,
  ].join(', ')
}

function matTextureBg(base: string): string {
  return [
    'radial-gradient(rgba(0,0,0,0.025) 0.5px, transparent 0.5px) 0 0 / 4px 4px',
    'radial-gradient(rgba(0,0,0,0.02) 0.5px, transparent 0.5px) 2px 2px / 4px 4px',
    `linear-gradient(${base}, ${base})`,
  ].join(', ')
}

function blockEdgeBg(base: string): string {
  return [
    'repeating-linear-gradient(0deg, transparent 0 4px, rgba(0,0,0,0.04) 4px 5px)',
    `linear-gradient(${base}, ${base})`,
  ].join(', ')
}

function canvasWeaveOverlay(): React.CSSProperties {
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
  return {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background:
      'linear-gradient(135deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 65%)',
  }
}

// ---------------- depth strips (V1 parity, used by fallback path) ----------------

type DepthEdgeStyle =
  | { kind: 'gallery' }
  | { kind: 'mirror' }
  | { kind: 'fill'; style: React.CSSProperties }

type DepthSpec = {
  depthInches: number
  inflationPx: number
  bottom: DepthEdgeStyle
  right: DepthEdgeStyle
}

const MAX_CANVAS_STRETCHER_IN = 1.5

function getDepthSpec(
  template: V2Template,
  selections: SelectionMap,
  pxPerIn: number,
): DepthSpec | null {
  if (template.category === 'canvas') {
    const stretcher = selections['stretcher-depth']
    const wrap = selections['canvas-wrap']
    const edgeColor = selections['canvas-edge-color']
    const depthInches = stretcher?.value === '1.5in' ? 1.5 : 0.75
    const inflationPx = MAX_CANVAS_STRETCHER_IN * pxPerIn
    let edge: DepthEdgeStyle
    if (wrap?.value === 'mirror') edge = { kind: 'mirror' }
    else if (wrap?.value === 'solid')
      edge = { kind: 'fill', style: { background: edgeColor?.swatchColor || '#1a2840' } }
    else edge = { kind: 'gallery' }
    return { depthInches, inflationPx, bottom: edge, right: edge }
  }
  if (template.category === 'framed') {
    const frame = selections['frame-color']
    const edge: DepthEdgeStyle = {
      kind: 'fill',
      style: { background: woodGrainBg(frame?.swatchColor || '#3a2a1c') },
    }
    return { depthInches: 1.25, inflationPx: 0, bottom: edge, right: edge }
  }
  if (template.category === 'block_mount') {
    const edgeOpt = selections['block-edge']
    const edge: DepthEdgeStyle = {
      kind: 'fill',
      style: { background: blockEdgeBg(edgeOpt?.swatchColor || '#c19a6b') },
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
  // Bumped non-canvas multiplier from 1.4 → 2.0 so frame/block depth strips
  // are obviously thick. Without this the perspective foreshortening swallows
  // most of the strip and the 2.5D effect doesn't read.
  const stripThickness =
    spec.inflationPx > 0
      ? spec.depthInches * pxPerIn
      : spec.depthInches * pxPerIn * 2.0
  const inflatedW = printWidthPx + 2 * spec.inflationPx
  const inflatedH = printHeightPx + 2 * spec.inflationPx

  const renderEdgeImage = (edge: DepthEdgeStyle, side: 'bottom' | 'right'): React.ReactNode => {
    if (edge.kind === 'fill') return null
    const isMirror = edge.kind === 'mirror'
    let left = -spec.inflationPx
    let top = -spec.inflationPx
    let transform: string | undefined
    if (edge.kind === 'gallery') {
      if (side === 'bottom') top = -(spec.inflationPx + printHeightPx)
      if (side === 'right') left = -(spec.inflationPx + printWidthPx)
    } else if (isMirror) {
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
          width: inflatedW,
          height: inflatedH,
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
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.18), 0 4px 10px rgba(0,0,0,0.14)',
          overflow: 'hidden',
          pointerEvents: 'none',
          borderRadius: 2,
          ...(spec.bottom.kind === 'fill' ? spec.bottom.style : {}),
        }}
      >
        {renderEdgeImage(spec.bottom, 'bottom')}
      </div>
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
          boxShadow: 'inset 1px 0 3px rgba(0,0,0,0.18), 4px 0 10px rgba(0,0,0,0.14)',
          overflow: 'hidden',
          pointerEvents: 'none',
          borderRadius: 2,
          ...(spec.right.kind === 'fill' ? spec.right.style : {}),
        }}
      >
        {renderEdgeImage(spec.right, 'right')}
      </div>
    </>
  )
}

// ---------------- photo frame compositor (the new V2 path) ----------------
//
// Asset contract for staff uploads:
//   cornerImage — square PNG (200×200 recommended), photographed top-down
//     with the moulding's outer edge at the upper-left corner of the image
//     and the inner edge meeting the lower-right corner at 45°. The four
//     visible corners are produced by mirroring this single asset.
//   railImage — landscape PNG (~600×100), tileable horizontally, showing a
//     straight section of the same moulding photographed top-down. The four
//     rails are produced by tiling + rotation of this single asset.
//
// Frame thickness on screen is fixed at 8% of the print's shorter dimension
// (matches V1 visual weight) so the asset scales rather than being its
// "real" thickness. A future asset version with calibrated dimensions can
// flip to true-to-scale.

function PhotoFrame({
  cornerImage,
  railImage,
  printWidthPx,
  printHeightPx,
  frameThicknessPx,
  children,
}: {
  cornerImage: string
  railImage: string
  printWidthPx: number
  printHeightPx: number
  frameThicknessPx: number
  children: React.ReactNode
}) {
  const outerW = printWidthPx + 2 * frameThicknessPx
  const outerH = printHeightPx + 2 * frameThicknessPx
  const t = frameThicknessPx

  // Rails span the inner edge of the moulding, between the corner caps.
  const railLenH = printWidthPx
  const railLenV = printHeightPx

  const cornerStyle: React.CSSProperties = {
    position: 'absolute',
    width: t,
    height: t,
    display: 'block',
    objectFit: 'cover',
  }
  const railImgStyle = (length: number): React.CSSProperties => ({
    position: 'absolute',
    width: length,
    height: t,
    display: 'block',
    objectFit: 'cover',
    // Tile by repeating the rail image; we cheat by stretching here for V1
    // simplicity. A future version will use a tiled background-image.
  })

  return (
    <div
      style={{
        position: 'relative',
        width: outerW,
        height: outerH,
        boxShadow: TOKENS.imageShadow,
        borderRadius: TOKENS.imageRadius,
      }}
    >
      {/* Top rail */}
      <img
        src={railImage}
        alt=""
        aria-hidden
        style={{ ...railImgStyle(railLenH), top: 0, left: t }}
      />
      {/* Bottom rail (mirrored vertically) */}
      <img
        src={railImage}
        alt=""
        aria-hidden
        style={{
          ...railImgStyle(railLenH),
          bottom: 0,
          left: t,
          transform: 'scaleY(-1)',
        }}
      />
      {/* Left rail — same asset rotated 90deg, then sized to match left side */}
      <img
        src={railImage}
        alt=""
        aria-hidden
        style={{
          position: 'absolute',
          width: railLenV,
          height: t,
          top: t + railLenV / 2 - t / 2,
          left: -railLenV / 2 + t / 2,
          transform: 'rotate(-90deg)',
          transformOrigin: 'center',
          objectFit: 'cover',
        }}
      />
      {/* Right rail — rotated 90deg the other way */}
      <img
        src={railImage}
        alt=""
        aria-hidden
        style={{
          position: 'absolute',
          width: railLenV,
          height: t,
          top: t + railLenV / 2 - t / 2,
          right: -railLenV / 2 + t / 2,
          transform: 'rotate(90deg)',
          transformOrigin: 'center',
          objectFit: 'cover',
        }}
      />
      {/* Corners — overlay on top of rails to hide rail seams */}
      <img src={cornerImage} alt="" aria-hidden style={{ ...cornerStyle, top: 0, left: 0 }} />
      <img
        src={cornerImage}
        alt=""
        aria-hidden
        style={{ ...cornerStyle, top: 0, right: 0, transform: 'scaleX(-1)' }}
      />
      <img
        src={cornerImage}
        alt=""
        aria-hidden
        style={{ ...cornerStyle, bottom: 0, left: 0, transform: 'scaleY(-1)' }}
      />
      <img
        src={cornerImage}
        alt=""
        aria-hidden
        style={{ ...cornerStyle, bottom: 0, right: 0, transform: 'scale(-1, -1)' }}
      />

      {/* The print sits in the centre, inset by frame thickness */}
      <div
        style={{
          position: 'absolute',
          top: t,
          left: t,
          width: printWidthPx,
          height: printHeightPx,
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ---------------- per-category renders ----------------

function FramedRender({
  template,
  imageUrl,
  selections,
  pxPerIn,
  compact,
  flat,
}: RendererProps) {
  const sizeSel = findSizeSelection(template, selections)
  const { widthPx, heightPx } = getSizedDims(
    sizeSel?.widthIn,
    sizeSel?.heightIn,
    pxPerIn,
    compact,
  )
  const frameOpt = selections['frame-color'] as V2Option | undefined
  const matSel = selections['mat']
  const baseDim = Math.min(widthPx, heightPx)
  // Thinner moulding floor in compact mode so a 56×68 thumbnail doesn't get
  // dominated by the frame.
  const frameThick = compact
    ? Math.max(3, Math.round(baseDim * 0.08))
    : Math.max(8, Math.round(baseDim * 0.08))
  const matThick = matThickness(baseDim, matSel)

  const matInner = (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: matTextureBg(matColor(matSel)),
        padding: matThick,
        boxSizing: 'border-box',
        boxShadow: matThick > 0 ? 'inset 0 1px 4px rgba(0,0,0,0.08)' : undefined,
        borderRadius: TOKENS.imageRadius,
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <img
          src={imageUrl}
          alt=""
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: TOKENS.imageRadius,
          }}
        />
        <div style={glassShimmer()} />
      </div>
    </div>
  )

  // Photo path — when both corner + rail assets are present on the frame
  // option. Backwards compatible: missing either → fallback.
  if (frameOpt?.cornerImage && frameOpt?.railImage) {
    return (
      <PhotoFrame
        cornerImage={frameOpt.cornerImage}
        railImage={frameOpt.railImage}
        printWidthPx={widthPx}
        printHeightPx={heightPx}
        frameThicknessPx={frameThick}
      >
        {matInner}
      </PhotoFrame>
    )
  }

  // Fallback path — V1 wood-grain CSS + perspective depth strips.
  // Depth strips are off in compact mode (they bleed past the print bounds
  // and look broken when clipped by a small card's overflow:hidden).
  const depthSpec = compact || flat ? null : getDepthSpec(template, selections, pxPerIn)
  const frameBg =
    frameOpt?.previewImage != null
      ? {
          backgroundImage: `url(${frameOpt.previewImage})`,
          backgroundSize: 'cover' as const,
          backgroundPosition: 'center' as const,
          backgroundRepeat: 'no-repeat' as const,
        }
      : { background: woodGrainBg(frameOpt?.swatchColor || '#3a2a1c') }

  return (
    <div
      style={{
        width: widthPx,
        height: heightPx,
        position: 'relative',
        padding: frameThick,
        boxSizing: 'border-box',
        boxShadow: `${TOKENS.imageShadow}, inset 0 0 0 1px rgba(0,0,0,0.15)`,
        borderRadius: TOKENS.imageRadius,
        ...frameBg,
      }}
    >
      {matInner}
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

function CanvasRender({
  template,
  imageUrl,
  selections,
  pxPerIn,
  compact,
  flat,
}: RendererProps) {
  const sizeSel = findSizeSelection(template, selections)
  const { widthPx, heightPx } = getSizedDims(
    sizeSel?.widthIn,
    sizeSel?.heightIn,
    pxPerIn,
    compact,
  )
  const depthSpec = compact || flat ? null : getDepthSpec(template, selections, pxPerIn)
  const inflation = depthSpec?.inflationPx ?? 0
  const inflW = widthPx + 2 * inflation
  const inflH = heightPx + 2 * inflation

  return (
    <div
      style={{
        width: widthPx,
        height: heightPx,
        position: 'relative',
        borderRadius: TOKENS.imageRadius,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          boxShadow: `${TOKENS.imageShadow}, 4px 0 0 0 rgba(0,0,0,0.06), 0 4px 0 0 rgba(0,0,0,0.06)`,
          borderRadius: TOKENS.imageRadius,
        }}
      >
        <img
          src={imageUrl}
          alt=""
          style={{
            display: 'block',
            position: 'absolute',
            left: -inflation,
            top: -inflation,
            width: inflW,
            height: inflH,
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
        <div style={canvasWeaveOverlay()} />
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

function BlockMountRender({
  template,
  imageUrl,
  selections,
  pxPerIn,
  compact,
  flat,
}: RendererProps) {
  const sizeSel = findSizeSelection(template, selections)
  const { widthPx, heightPx } = getSizedDims(
    sizeSel?.widthIn,
    sizeSel?.heightIn,
    pxPerIn,
    compact,
  )
  // Real block mounts have the print laminated to the top face with no
  // visible border — wood edge only shows from the side. The edge stain
  // option therefore only controls the depth strip color (rendered below),
  // not a border around the image.
  const depthSpec = compact || flat ? null : getDepthSpec(template, selections, pxPerIn)
  return (
    <div
      style={{
        width: widthPx,
        height: heightPx,
        position: 'relative',
        boxShadow:
          '3px 3px 0 0 rgba(0,0,0,0.18), 5px 5px 0 0 rgba(0,0,0,0.14), 0 16px 28px rgba(0,0,0,0.2)',
        // Block mounts are cut square — sharp 90° edges, no radius.
        borderRadius: 0,
      }}
    >
      <img
        src={imageUrl}
        alt=""
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: 0,
        }}
      />
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

// Visual treatments per non-framed/non-canvas/non-block category. Each format
// gets a distinguishing detail so a customer scanning the format cards can
// tell paper prints, stickers, and greeting cards apart at thumbnail scale.
function FlatPrintRender({
  template,
  imageUrl,
  selections,
  pxPerIn,
  compact,
}: RendererProps) {
  const sizeSel = findSizeSelection(template, selections)
  const { widthPx, heightPx } = getSizedDims(
    sizeSel?.widthIn,
    sizeSel?.heightIn,
    pxPerIn,
    compact,
  )

  switch (template.category) {
    case 'sticker':
      return (
        <StickerRender
          imageUrl={imageUrl}
          widthPx={widthPx}
          heightPx={heightPx}
          compact={compact}
        />
      )
    case 'art_card':
      return (
        <CardRender
          imageUrl={imageUrl}
          widthPx={widthPx}
          heightPx={heightPx}
        />
      )
    case 'paper_print':
    case 'poster':
    case 'calendar':
    default:
      return (
        <PaperPrintRender
          imageUrl={imageUrl}
          widthPx={widthPx}
          heightPx={heightPx}
        />
      )
  }
}

// Paper print: a slim ivory inset suggests paper edge/border around the
// image, sitting on a soft drop shadow. Reads as "unframed photo print."
function PaperPrintRender({
  imageUrl,
  widthPx,
  heightPx,
}: {
  imageUrl: string
  widthPx: number
  heightPx: number
}) {
  // Inset border = paper margin. Scales with size so a small thumbnail still
  // shows the effect.
  const inset = Math.max(3, Math.round(Math.min(widthPx, heightPx) * 0.04))
  return (
    <div
      style={{
        width: widthPx,
        height: heightPx,
        position: 'relative',
        boxShadow: TOKENS.imageShadow,
        borderRadius: TOKENS.imageRadius,
        background: '#f9f5ec',
        padding: inset,
        boxSizing: 'border-box',
      }}
    >
      <img
        src={imageUrl}
        alt=""
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>
  )
}

// Sticker: rounded "die-cut" outer halo (white outline around the image),
// slight tilt, single drop shadow suggesting the sticker is peeled and
// hovering off the surface. Distinct silhouette vs. paper print.
function StickerRender({
  imageUrl,
  widthPx,
  heightPx,
  compact,
}: {
  imageUrl: string
  widthPx: number
  heightPx: number
  compact?: boolean
}) {
  const halo = Math.max(3, Math.round(Math.min(widthPx, heightPx) * 0.06))
  return (
    <div
      style={{
        width: widthPx,
        height: heightPx,
        position: 'relative',
        background: '#ffffff',
        padding: halo,
        boxSizing: 'border-box',
        borderRadius: '50%',
        // Tilt slightly for that peeled-sticker feel; subtler in compact mode
        // so it doesn't collide with neighbouring cards.
        transform: compact ? 'rotate(-3deg)' : 'rotate(-2deg)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.08)',
      }}
    >
      <img
        src={imageUrl}
        alt=""
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '50%',
        }}
      />
    </div>
  )
}

// Greeting card: vertical fold line at the centre and a small bottom-edge
// strip suggesting paper stock thickness. Flat rather than opened — the
// fold line + chip is enough to read as "folded card" at thumbnail scale.
function CardRender({
  imageUrl,
  widthPx,
  heightPx,
}: {
  imageUrl: string
  widthPx: number
  heightPx: number
}) {
  return (
    <div
      style={{
        width: widthPx,
        height: heightPx,
        position: 'relative',
        boxShadow: '0 14px 28px rgba(0,0,0,0.22), 0 2px 0 rgba(0,0,0,0.18)',
        borderRadius: 2,
      }}
    >
      <img
        src={imageUrl}
        alt=""
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: 2,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '50%',
          width: 1,
          transform: 'translateX(-0.5px)',
          background:
            'linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0.22) 50%, rgba(0,0,0,0.12))',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: -2,
          height: 2,
          background: '#e8e3d7',
          borderRadius: 1,
        }}
      />
    </div>
  )
}

// ---------------- room composite wrapper ----------------

// Fixed room composite size (px). The parent flex container centers this in
// the preview area. 540×405 is a 4:3 aspect that fits within the 420px-min
// preview frame and reads as a "wall photo" at a glance.
const ROOM_W = 540
const ROOM_H = 405
// Default on-screen width of the framed piece relative to the room photo
// width. The customer drags +/- buttons to adjust. Going with 25% as a
// reasonable starting point — fits above-sofa shots well, and there's no
// reliable way to be "true to scale" with arbitrary uploaded photos.
const DEFAULT_FRAME_FRACTION = 0.25

function RoomComposite({
  room,
  children,
}: {
  room: NonNullable<RendererProps['room']>
  children: React.ReactNode
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const innerRef = React.useRef<HTMLDivElement | null>(null)
  // Position in fraction-of-room (0..1) so the anchor survives container
  // resize. Start from the room's curated anchor.
  const [pos, setPos] = React.useState({ x: room.anchor.x, y: room.anchor.y })
  // Scale multiplier on top of "how big should the framed piece be at rest".
  const [zoom, setZoom] = React.useState(1)
  const dragRef = React.useRef<{
    startX: number
    startY: number
    posX: number
    posY: number
  } | null>(null)

  // Re-anchor when the room changes (e.g. customer switches from Living Room
  // to Bedroom). Without this, position would drift across rooms.
  React.useEffect(() => {
    setPos({ x: room.anchor.x, y: room.anchor.y })
    setZoom(1)
  }, [room.imageUrl, room.anchor.x, room.anchor.y])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    e.preventDefault()
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: pos.x,
      posY: pos.y,
    }
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const dx = (e.clientX - drag.startX) / rect.width
    const dy = (e.clientY - drag.startY) / rect.height
    setPos({
      x: clamp01(drag.posX + dx),
      y: clamp01(drag.posY + dy),
    })
  }
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    ;(e.target as Element).releasePointerCapture?.(e.pointerId)
    dragRef.current = null
  }

  // Measure the inner content's NATURAL (untransformed) size via offsetWidth
  // and re-measure whenever that changes (new template, new size selection).
  // offsetWidth is the layout box, not affected by CSS transform, so there's
  // no feedback loop between scale and measurement.
  const [naturalSize, setNaturalSize] = React.useState<{ w: number; h: number } | null>(null)
  React.useLayoutEffect(() => {
    if (!innerRef.current) return
    const child = innerRef.current.firstElementChild as HTMLElement | null
    if (!child) return
    const measure = () => {
      if (child.offsetWidth === 0) return
      setNaturalSize({ w: child.offsetWidth, h: child.offsetHeight })
    }
    measure()
    // Observe layout-box changes so swapping templates updates the scale.
    const ro = new ResizeObserver(measure)
    ro.observe(child)
    return () => ro.disconnect()
  }, [room.imageUrl])

  const baseScale = naturalSize ? (ROOM_W * DEFAULT_FRAME_FRACTION) / naturalSize.w : DEFAULT_FRAME_FRACTION
  const finalScale = baseScale * zoom

  // Background: prefer CSS gradient (solid-color wall preset) when set,
  // else use the photo URL (curated photo OR customer upload).
  const bgStyle: React.CSSProperties = room.backgroundCss
    ? { background: room.backgroundCss }
    : room.imageUrl
      ? {
          backgroundImage: `url(${room.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : { background: TOKENS.bg }
  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: ROOM_W,
        height: ROOM_H,
        maxWidth: '100%',
        borderRadius: TOKENS.imageRadius,
        overflow: 'hidden',
        boxShadow: TOKENS.imageShadow,
        userSelect: 'none',
        touchAction: 'none',
        ...bgStyle,
      }}
    >
      <div
        ref={innerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: 'absolute',
          left: `${pos.x * 100}%`,
          top: `${pos.y * 100}%`,
          transform: `translate(-50%, -50%) scale(${finalScale})`,
          transformOrigin: 'center',
          cursor: 'grab',
          // Cast a soft shadow below-right so the framed piece reads as
          // floating in front of the wall rather than pasted onto it.
          // Drop-shadow filter (not box-shadow) so it follows the irregular
          // edges of the inner content (e.g. tilted card, circular sticker).
          filter:
            'drop-shadow(8px 12px 12px rgba(0,0,0,0.32)) drop-shadow(2px 4px 4px rgba(0,0,0,0.18))',
        }}
      >
        {children}
      </div>
      {/* Zoom controls */}
      <div
        style={{
          position: 'absolute',
          right: 8,
          bottom: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(3, z * 1.15))}
          aria-label="Make print larger"
          style={zoomBtnStyle}
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.3, z / 1.15))}
          aria-label="Make print smaller"
          style={zoomBtnStyle}
        >
          −
        </button>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 8,
          bottom: 8,
          padding: '4px 8px',
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          fontSize: '0.7rem',
          borderRadius: 3,
          pointerEvents: 'none',
        }}
      >
        Drag to reposition · ± to resize
      </div>
    </div>
  )
}

const zoomBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 4,
  border: 'none',
  background: 'rgba(0,0,0,0.6)',
  color: '#fff',
  fontSize: '1.1rem',
  cursor: 'pointer',
  lineHeight: 1,
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v))
}

// ---------------- entry point ----------------

const renderImpl: Renderer = (props) => {
  const { template, room, pxPerIn, selections, compact } = props
  let inner: React.ReactElement
  switch (template.category) {
    case 'framed':
      inner = <FramedRender {...props} />
      break
    case 'canvas':
      inner = <CanvasRender {...props} />
      break
    case 'block_mount':
      inner = <BlockMountRender {...props} />
      break
    default:
      inner = <FlatPrintRender {...props} />
  }

  if (room) {
    // Re-render inner with flat=true so depth strips are suppressed when
    // the piece is composited onto a wall.
    let flatInner: React.ReactElement
    const flatProps = { ...props, flat: true }
    switch (template.category) {
      case 'framed':
        flatInner = <FramedRender {...flatProps} />
        break
      case 'canvas':
        flatInner = <CanvasRender {...flatProps} />
        break
      case 'block_mount':
        flatInner = <BlockMountRender {...flatProps} />
        break
      default:
        flatInner = <FlatPrintRender {...flatProps} />
    }
    return <RoomComposite room={room}>{flatInner}</RoomComposite>
  }

  // Tilt the framed piece slightly toward the viewer in the main preview so
  // the bottom + right depth strips become obvious. Without the tilt, a
  // flat-on view foreshortens the strips into near-invisibility — the
  // "2.5D" effect doesn't read. Compact thumbnails stay flat (a tilted
  // thumbnail in a small card looks gimmicky and inconsistent across
  // cards). Room composites stay flat too (a piece on a wall is meant to
  // look like it's hanging straight).
  if (compact) return inner
  const tiltedCategories = new Set(['framed', 'canvas', 'block_mount'])
  if (!tiltedCategories.has(template.category)) return inner
  return (
    <div
      style={{
        // perspective on the wrapper so child transforms have depth
        perspective: '1800px',
        // Inline-block keeps the wrapper sized to the inner content
        display: 'inline-block',
      }}
    >
      <div
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(-6deg) rotateY(-8deg)',
          transformOrigin: 'center center',
        }}
      >
        {inner}
      </div>
    </div>
  )
}

export const Renderer25D: RendererDescriptor = {
  id: '2.5d',
  label: '2.5D photo compositor',
  capabilities: ['depth-strips', 'photo-corners', 'room-composite'],
  isAvailable: () => true,
  render: renderImpl,
}
