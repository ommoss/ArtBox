'use client'

import * as React from 'react'

import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { SRGBColorSpace, type Texture, TextureLoader } from 'three'

import { TOKENS } from '../../theme-tokens'
import type { SelectionMap, V2Option, V2Template } from '../../types'
import type { RendererProps } from '../types'

// 3D canvas-wrap scene. The print is the front face of a box-like canvas
// stretched on wooden stretcher bars; the 4 side edges show the wrap
// treatment the customer picked (gallery / mirror / solid color).
//
// Implementation: 5 plane meshes — front + 4 edges — composed into a box.
// Avoids BoxGeometry's UV gymnastics for the edge-wrap variations.

const SCENE_UNITS_PER_INCH = 1 / 20

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
  const wrapMode = (wrap?.value ?? 'gallery') as 'gallery' | 'mirror' | 'solid'
  const edgeColor = edgeColorOpt?.swatchColor ?? '#1a2840'

  const canvasW = Math.min(680, Math.max(540, Math.round(widthIn * 22)))
  const canvasH = Math.min(680, Math.max(540, Math.round(heightIn * 22)))

  // Camera distance: default to z=1.8 (matches FramedScene), back off when
  // the canvas piece (print + side wrap) exceeds the default's framing.
  const DEFAULT_Z = 1.8
  const FOV_DEG = 50
  const printWUnits = widthIn * SCENE_UNITS_PER_INCH
  const printHUnits = heightIn * SCENE_UNITS_PER_INCH
  const depthUnits = depthIn * SCENE_UNITS_PER_INCH
  const halfFovRad = (FOV_DEG / 2) * (Math.PI / 180)
  const aspect = canvasW / canvasH
  const MARGIN = 1.3
  const zFitH = (printHUnits * MARGIN) / (2 * Math.tan(halfFovRad))
  const zFitW = (printWUnits * MARGIN) / (2 * Math.tan(halfFovRad) * aspect)
  const cameraZ = Math.max(DEFAULT_Z, zFitH, zFitW)

  const texture = useLoader(TextureLoader, imageUrl)
  React.useEffect(() => {
    if (!texture) return
    texture.colorSpace = SRGBColorSpace
  }, [texture])

  React.useEffect(() => {
    onReady?.()
  }, [onReady])

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
      <Canvas
        key={Math.round(cameraZ * 100)}
        camera={{ position: [0, 0, cameraZ], fov: FOV_DEG }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <hemisphereLight args={['#ffffff', '#5a5a5a', 1.0]} />
        <directionalLight position={[-3, 4, 5]} intensity={0.9} />
        <ambientLight intensity={0.6} />

        <CanvasPiece
          widthIn={widthIn}
          heightIn={heightIn}
          depthIn={depthIn}
          texture={texture}
          wrapMode={wrapMode}
          edgeColor={edgeColor}
        />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2 - Math.PI / 8}
          maxPolarAngle={Math.PI / 2 + Math.PI / 8}
          minAzimuthAngle={-Math.PI / 6}
          maxAzimuthAngle={Math.PI / 6}
          rotateSpeed={0.5}
        />
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
  wrapMode: 'gallery' | 'mirror' | 'solid'
  edgeColor: string
}) {
  const w = widthIn * SCENE_UNITS_PER_INCH
  const h = heightIn * SCENE_UNITS_PER_INCH
  const d = depthIn * SCENE_UNITS_PER_INCH

  // Cover-crop the print texture onto the front face.
  React.useEffect(() => {
    if (!texture) return
    const img = texture.image as
      | { naturalWidth?: number; naturalHeight?: number; width?: number; height?: number }
      | undefined
    const imgW = img?.naturalWidth ?? img?.width
    const imgH = img?.naturalHeight ?? img?.height
    if (!imgW || !imgH) return
    const imgAspect = imgW / imgH
    const planeAspect = w / h
    if (imgAspect > planeAspect) {
      texture.repeat.set(planeAspect / imgAspect, 1)
      texture.offset.set((1 - planeAspect / imgAspect) / 2, 0)
    } else {
      texture.repeat.set(1, imgAspect / planeAspect)
      texture.offset.set(0, (1 - imgAspect / planeAspect) / 2)
    }
    texture.needsUpdate = true
  }, [texture, w, h])

  // Per-edge textures for gallery and mirror wraps. Each is a clone of the
  // print texture with repeat/offset set to show a thin strip from one
  // edge of the image, so the image visually wraps around the canvas's
  // stretcher bars (gallery) or mirrors at the edge (mirror).
  //
  // For solid wrap, edges use a flat material with the customer's chosen
  // edge color — no texture clone needed.
  const edgeTextures = useEdgeTextures(texture, w, h, d, wrapMode)

  return (
    <group>
      {/* Front face — the print */}
      <mesh position={[0, 0, d / 2]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      {/* Top edge */}
      <mesh position={[0, h / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        {wrapMode === 'solid' || !edgeTextures ? (
          <meshStandardMaterial color={edgeColor} roughness={0.85} />
        ) : (
          <meshBasicMaterial map={edgeTextures.top} />
        )}
      </mesh>
      {/* Bottom edge */}
      <mesh position={[0, -h / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        {wrapMode === 'solid' || !edgeTextures ? (
          <meshStandardMaterial color={edgeColor} roughness={0.85} />
        ) : (
          <meshBasicMaterial map={edgeTextures.bottom} />
        )}
      </mesh>
      {/* Left edge */}
      <mesh position={[-w / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[d, h]} />
        {wrapMode === 'solid' || !edgeTextures ? (
          <meshStandardMaterial color={edgeColor} roughness={0.85} />
        ) : (
          <meshBasicMaterial map={edgeTextures.left} />
        )}
      </mesh>
      {/* Right edge */}
      <mesh position={[w / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[d, h]} />
        {wrapMode === 'solid' || !edgeTextures ? (
          <meshStandardMaterial color={edgeColor} roughness={0.85} />
        ) : (
          <meshBasicMaterial map={edgeTextures.right} />
        )}
      </mesh>
    </group>
  )
}

// Build per-edge texture clones whose UV mappings show a thin strip from
// each side of the image. Gallery wrap reuses the existing edge of the
// front texture (image continues). Mirror wrap takes the same edge strip
// but flips it so the seam reads as a reflection.
function useEdgeTextures(
  baseTexture: Texture | null | undefined,
  w: number,
  h: number,
  d: number,
  wrapMode: 'gallery' | 'mirror' | 'solid',
): { top: Texture; bottom: Texture; left: Texture; right: Texture } | null {
  return React.useMemo(() => {
    if (!baseTexture || wrapMode === 'solid') return null
    const img = baseTexture.image as
      | { naturalWidth?: number; naturalHeight?: number; width?: number; height?: number }
      | undefined
    const imgW = img?.naturalWidth ?? img?.width
    const imgH = img?.naturalHeight ?? img?.height
    if (!imgW || !imgH) return null

    // Recompute cover-crop UV bounds so the edge strip uses the same
    // visible region as the front face. Otherwise the edge would show
    // pixels that the front face has already cropped out.
    const imgAspect = imgW / imgH
    const planeAspect = w / h
    let baseRepeatX: number
    let baseRepeatY: number
    let baseOffsetX: number
    let baseOffsetY: number
    if (imgAspect > planeAspect) {
      baseRepeatX = planeAspect / imgAspect
      baseRepeatY = 1
      baseOffsetX = (1 - baseRepeatX) / 2
      baseOffsetY = 0
    } else {
      baseRepeatX = 1
      baseRepeatY = imgAspect / planeAspect
      baseOffsetX = 0
      baseOffsetY = (1 - baseRepeatY) / 2
    }

    // Strip thickness as a fraction of the front-face UV span. The edge
    // depth `d` in scene units relative to the plane's `h` or `w` gives
    // the right proportion.
    const stripFracY = (d / h) * baseRepeatY
    const stripFracX = (d / w) * baseRepeatX

    const makeStrip = (
      repeatX: number,
      repeatY: number,
      offsetX: number,
      offsetY: number,
      flipX = false,
      flipY = false,
    ): Texture => {
      const t = baseTexture.clone()
      t.colorSpace = baseTexture.colorSpace
      t.needsUpdate = true
      t.repeat.set(repeatX * (flipX ? -1 : 1), repeatY * (flipY ? -1 : 1))
      // When flipping, three.js mirrors around the offset; compensate so
      // the strip stays in the visible region.
      t.offset.set(
        offsetX + (flipX ? repeatX : 0),
        offsetY + (flipY ? repeatY : 0),
      )
      return t
    }

    // Mirror mode flips the strip on the axis perpendicular to the edge
    // so the seam reads as a reflection.
    const mirror = wrapMode === 'mirror'

    // Top edge of canvas → top strip of image (high V values).
    const top = makeStrip(
      baseRepeatX,
      stripFracY,
      baseOffsetX,
      baseOffsetY + baseRepeatY - stripFracY,
      false,
      mirror,
    )
    // Bottom edge → bottom strip of image.
    const bottom = makeStrip(
      baseRepeatX,
      stripFracY,
      baseOffsetX,
      baseOffsetY,
      false,
      mirror,
    )
    // Left edge → left strip of image.
    const left = makeStrip(
      stripFracX,
      baseRepeatY,
      baseOffsetX,
      baseOffsetY,
      mirror,
      false,
    )
    // Right edge → right strip of image.
    const right = makeStrip(
      stripFracX,
      baseRepeatY,
      baseOffsetX + baseRepeatX - stripFracX,
      baseOffsetY,
      mirror,
      false,
    )
    return { top, bottom, left, right }
  }, [baseTexture, w, h, d, wrapMode])
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
