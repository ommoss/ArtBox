'use client'

import * as React from 'react'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { Texture } from 'three'

import { TOKENS } from '../../theme-tokens'
import type { RendererProps } from '../types'

import {
  CameraRig,
  CANVAS_PROPS,
  FOV_DEG,
  ORBIT_LIMITS,
  SCENE_UNITS_PER_INCH,
  SceneLighting,
  canvasPx,
  coverCrop,
  findSizeSelection,
  fitCameraZ,
  useArtworkTexture,
  useMaxAnisotropy,
  usePrintTexture,
} from './scene-shared'

// 3D canvas-wrap scene. The print is the front face of a box-like canvas
// stretched on wooden stretcher bars; the 4 side edges show the wrap
// treatment the customer picked (gallery / mirror / solid color).
//
// Implementation: 5 plane meshes — front + 4 edges — composed into a box.
// Avoids BoxGeometry's UV gymnastics for the edge-wrap variations.

type WrapMode = 'gallery' | 'mirror' | 'solid'

export default function CanvasScene({
  template,
  imageUrl,
  selections,
  onReady,
}: RendererProps) {
  const sizeSel = findSizeSelection(template, selections)
  const widthIn = sizeSel?.widthIn ?? 16
  const heightIn = sizeSel?.heightIn ?? 20
  const stretcher = selections['stretcher-depth']
  const wrap = selections['canvas-wrap']
  const edgeColorOpt = selections['canvas-edge-color']

  const depthIn = stretcher?.value === '1.5in' ? 1.5 : 0.75
  const wrapMode = (wrap?.value ?? 'gallery') as WrapMode
  const edgeColor = edgeColorOpt?.swatchColor ?? '#1a2840'

  const { canvasW, canvasH } = canvasPx(widthIn, heightIn)
  const cameraZ = fitCameraZ(
    widthIn * SCENE_UNITS_PER_INCH,
    heightIn * SCENE_UNITS_PER_INCH,
    canvasW,
    canvasH,
  )

  const texture = useArtworkTexture(imageUrl)

  React.useEffect(() => {
    onReady?.()
  }, [onReady])

  const d = depthIn * SCENE_UNITS_PER_INCH

  return (
    <div
      style={{
        width: '100%',
        maxWidth: canvasW,
        aspectRatio: `${canvasW} / ${canvasH}`,
        background: TOKENS.bg,
        borderRadius: TOKENS.imageRadius,
        overflow: 'hidden',
        boxShadow: TOKENS.imageShadow,
      }}
    >
      <Canvas {...CANVAS_PROPS} camera={{ position: [0, 0, cameraZ], fov: FOV_DEG }}>
        <CameraRig z={cameraZ} />
        <SceneLighting wallZ={-d / 2} />

        <CanvasPiece
          widthIn={widthIn}
          heightIn={heightIn}
          depthIn={depthIn}
          texture={texture}
          wrapMode={wrapMode}
          edgeColor={edgeColor}
        />

        {/* Orbit range is wide enough (±45° azimuth) to see the wrap on the
            side edges — that's what the customer is comparing here. */}
        <OrbitControls {...ORBIT_LIMITS} />
      </Canvas>
    </div>
  )
}

function CanvasPiece({
  widthIn,
  heightIn,
  depthIn,
  texture,
  wrapMode,
  edgeColor,
}: {
  widthIn: number
  heightIn: number
  depthIn: number
  texture: Texture
  wrapMode: WrapMode
  edgeColor: string
}) {
  const w = widthIn * SCENE_UNITS_PER_INCH
  const h = heightIn * SCENE_UNITS_PER_INCH
  const d = depthIn * SCENE_UNITS_PER_INCH

  usePrintTexture(texture, w, h)

  // Per-edge textures for gallery and mirror wraps. Each is a clone of the
  // print texture with repeat/offset set to show a thin strip from one
  // edge of the image, so the image visually wraps around the canvas's
  // stretcher bars (gallery) or mirrors at the edge (mirror).
  //
  // For solid wrap, edges use a flat material with the customer's chosen
  // edge color — no texture clone needed.
  const edgeTextures = useEdgeTextures(texture, w, h, d, wrapMode)
  // Free the GPU copies when the clones are replaced or the piece unmounts.
  React.useEffect(() => {
    if (!edgeTextures) return
    const clones = Object.values(edgeTextures)
    return () => clones.forEach((t) => t.dispose())
  }, [edgeTextures])

  const edgeMaterial = (tex: Texture | undefined) =>
    wrapMode === 'solid' || !tex ? (
      <meshStandardMaterial color={edgeColor} roughness={0.85} />
    ) : (
      <meshBasicMaterial map={tex} />
    )

  return (
    <group>
      {/* Front face — the print */}
      <mesh position={[0, 0, d / 2]} castShadow>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      {/* Top edge */}
      <mesh position={[0, h / 2, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <planeGeometry args={[w, d]} />
        {edgeMaterial(edgeTextures?.top)}
      </mesh>
      {/* Bottom edge */}
      <mesh position={[0, -h / 2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <planeGeometry args={[w, d]} />
        {edgeMaterial(edgeTextures?.bottom)}
      </mesh>
      {/* Left edge */}
      <mesh position={[-w / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow>
        <planeGeometry args={[d, h]} />
        {edgeMaterial(edgeTextures?.left)}
      </mesh>
      {/* Right edge */}
      <mesh position={[w / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <planeGeometry args={[d, h]} />
        {edgeMaterial(edgeTextures?.right)}
      </mesh>
    </group>
  )
}

// Build per-edge texture clones whose UV mappings show a thin strip from
// each side of the image. The strip's seam with the front face must match
// pixel-for-pixel for the wrap to read correctly.
//
// Coordinate setup, after the per-edge rotations applied in CanvasPiece:
//   - Top edge plane:    UV V=0 lies at z=+d/2 (front seam), V=1 at back
//   - Bottom edge plane: UV V=1 lies at z=+d/2 (front seam), V=0 at back
//   - Left edge plane:   UV U=1 lies at z=+d/2 (front seam), U=0 at back
//   - Right edge plane:  UV U=0 lies at z=+d/2 (front seam), U=1 at back
//
// For "gallery" wrap, the strip away from the seam continues the image
// past the front face's visible region. For "mirror", the strip mirrors
// back into the visible region. The offset/repeat values below derive
// directly from these constraints.
function useEdgeTextures(
  baseTexture: Texture,
  w: number,
  h: number,
  d: number,
  wrapMode: WrapMode,
): { top: Texture; bottom: Texture; left: Texture; right: Texture } | null {
  const anisotropy = useMaxAnisotropy()
  return React.useMemo(() => {
    if (wrapMode === 'solid') return null
    const base = coverCrop(baseTexture, w, h)
    if (!base) return null
    const { repeatX: baseRepeatX, repeatY: baseRepeatY, offsetX: baseOffsetX, offsetY: baseOffsetY } = base

    // Strip thickness as a fraction of the front-face UV span.
    const stripFracY = (d / h) * baseRepeatY
    const stripFracX = (d / w) * baseRepeatX

    const mirror = wrapMode === 'mirror'

    const clone = (offsetX: number, repeatX: number, offsetY: number, repeatY: number): Texture => {
      const t = baseTexture.clone()
      t.colorSpace = baseTexture.colorSpace
      t.anisotropy = anisotropy
      t.offset.set(offsetX, offsetY)
      t.repeat.set(repeatX, repeatY)
      t.needsUpdate = true
      return t
    }

    // Front-face edge UV positions — the values the front face shows at
    // each of its four edges. The corresponding edge plane must show the
    // same value at the seam.
    const frontTopV = baseOffsetY + baseRepeatY
    const frontBottomV = baseOffsetY
    const frontLeftU = baseOffsetX
    const frontRightU = baseOffsetX + baseRepeatX

    // TOP: plane V=0 at front seam → image V = frontTopV; plane V=1 at back.
    //   gallery → plane V=1 = frontTopV + stripFracY (continues image upward)
    //   mirror  → plane V=1 = frontTopV - stripFracY (mirrors back inward)
    const top = clone(baseOffsetX, baseRepeatX, frontTopV, mirror ? -stripFracY : stripFracY)
    // BOTTOM: plane V=1 at front seam → image V = frontBottomV; plane V=0 at back.
    //   gallery → plane V=0 = frontBottomV - stripFracY (image extends down)
    //   mirror  → plane V=0 = frontBottomV + stripFracY (mirrors back up)
    const bottom = clone(
      baseOffsetX,
      baseRepeatX,
      mirror ? frontBottomV + stripFracY : frontBottomV - stripFracY,
      mirror ? -stripFracY : stripFracY,
    )
    // LEFT: plane U=1 at front seam → image U = frontLeftU; plane U=0 at back.
    //   gallery → plane U=0 = frontLeftU - stripFracX (image extends left)
    //   mirror  → plane U=0 = frontLeftU + stripFracX
    const left = clone(
      mirror ? frontLeftU + stripFracX : frontLeftU - stripFracX,
      mirror ? -stripFracX : stripFracX,
      baseOffsetY,
      baseRepeatY,
    )
    // RIGHT: plane U=0 at front seam → image U = frontRightU; plane U=1 at back.
    //   gallery → plane U=1 = frontRightU + stripFracX
    //   mirror  → plane U=1 = frontRightU - stripFracX
    const right = clone(frontRightU, mirror ? -stripFracX : stripFracX, baseOffsetY, baseRepeatY)
    return { top, bottom, left, right }
  }, [baseTexture, w, h, d, wrapMode, anisotropy])
}
