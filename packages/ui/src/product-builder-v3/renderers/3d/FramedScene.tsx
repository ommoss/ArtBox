'use client'

import * as React from 'react'

import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { SRGBColorSpace, type Texture, TextureLoader } from 'three'

import { TOKENS } from '../../theme-tokens'
import type { SelectionMap, V2Option, V2Template } from '../../types'
import type { RendererProps } from '../types'

// Real 3D scene for framed prints. Three.js / R3F.
//
// Coordinate system: 1 unit ≈ 1 inch / 20, so a 16" wide print = 0.8 units.
// Keeps the camera at a comfortable distance with no need to tune fov per
// print size.

const SCENE_UNITS_PER_INCH = 1 / 20
// Frame moulding thickness (visible face width) in inches → scene units.
const FRAME_FACE_IN = 1.25
// Frame depth (how far the moulding sticks out from the wall) in inches.
const FRAME_DEPTH_IN = 1.5

export default function FramedScene({ template, imageUrl, selections, onReady }: RendererProps) {
  const sizeSel = findSizeSelection(template, selections)
  const widthIn = sizeSel?.widthIn ?? 16
  const heightIn = sizeSel?.heightIn ?? 20
  const frameOpt = selections['frame-color'] as V2Option | undefined
  const matSel = selections['mat']
  const frameColor = frameOpt?.swatchColor ?? '#3a2a1c'
  const matColor = matSel?.value?.endsWith('-black') ? '#1a1a1a' : '#f4f1ea'
  const hasMat = matSel && matSel.value !== 'none'

  // Canvas size scales with print so a 24×36 reads larger than an 8×10.
  const canvasW = Math.min(680, Math.max(540, Math.round(widthIn * 22)))
  const canvasH = Math.min(680, Math.max(540, Math.round(heightIn * 22)))

  // Camera distance: default to z=1.8 (the "looks right" distance for the
  // 16×20 default). When the framed piece exceeds what fits at that
  // distance (24×36 + frame moulding), back the camera off so the piece
  // doesn't get cut off vertically.
  const FOV_DEG = 50
  const DEFAULT_Z = 1.8
  const printHUnits = heightIn * SCENE_UNITS_PER_INCH
  const printWUnits = widthIn * SCENE_UNITS_PER_INCH
  const faceWUnits = FRAME_FACE_IN * SCENE_UNITS_PER_INCH
  const totalHUnits = printHUnits + 2 * faceWUnits
  const totalWUnits = printWUnits + 2 * faceWUnits
  const halfFovRad = (FOV_DEG / 2) * (Math.PI / 180)
  const aspect = canvasW / canvasH
  // Min camera z required to fit the framed piece with a 30% breathing
  // margin in both dimensions. 30% is generous to make sure the piece
  // never crowds the canvas edges, especially at largest sizes.
  const MARGIN = 1.3
  const zFitH = (totalHUnits * MARGIN) / (2 * Math.tan(halfFovRad))
  const zFitW = (totalWUnits * MARGIN) / (2 * Math.tan(halfFovRad) * aspect)
  const cameraZ = Math.max(DEFAULT_Z, zFitH, zFitW)

  // Preload the texture above the Canvas so Suspense waits before mounting
  // the Canvas at all — avoids the empty-canvas-then-print-pop sequence.
  const texture = useLoader(TextureLoader, imageUrl)
  React.useEffect(() => {
    if (!texture) return
    texture.colorSpace = SRGBColorSpace
  }, [texture])

  // Signal to the shell that the 3D scene has its texture and is mounting
  // for real — used to cancel the auto-fallback-to-2D timer. By the time
  // this effect runs, useLoader has resolved (Suspense waited above), so
  // we're definitely past the slow-load window.
  React.useEffect(() => {
    onReady?.()
  }, [onReady])

  return (
    <div
      style={{
        // Width caps at canvasW but shrinks on narrow screens (mobile).
        // Aspect-ratio keeps the canvas square-ish even when width shrinks,
        // so a portrait 16×20 in a 320px-wide phone viewport stays 320×(320*canvasH/canvasW).
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
        // Key on cameraZ so the Canvas remounts when the camera needs to
        // move (R3F's `camera` prop is only honored on initial mount). The
        // texture is cached via useLoader so the remount is essentially
        // instant — no re-fetch.
        key={Math.round(cameraZ * 100)}
        camera={{ position: [0, 0, cameraZ], fov: FOV_DEG }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Bright, soft front lighting so the moulding reads as wood (not
            black plastic) and the print is fully lit. The print itself
            uses meshBasicMaterial below so it isn't dimmed by the lighting. */}
        <hemisphereLight args={['#ffffff', '#5a5a5a', 1.0]} />
        <directionalLight position={[-3, 4, 5]} intensity={0.9} />
        <ambientLight intensity={0.6} />

        <FramedPiece
          widthIn={widthIn}
          heightIn={heightIn}
          texture={texture}
          frameColor={frameColor}
          matColor={matColor}
          hasMat={Boolean(hasMat)}
        />

        {/* Limited orbit so the customer can rock the frame back-and-forth
            without getting lost behind it. */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2 - Math.PI / 7.2}
          maxPolarAngle={Math.PI / 2 + Math.PI / 7.2}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  )
}

// Use three.js's Texture type directly. R3F 9.x's useLoader generics
// changed order (input first, then loader); rather than thread that, just
// type the return as Texture which is what TextureLoader produces.
type LoadedTexture = Texture

function FramedPiece({
  widthIn,
  heightIn,
  texture,
  frameColor,
  matColor,
  hasMat,
}: {
  widthIn: number
  heightIn: number
  texture: LoadedTexture
  frameColor: string
  matColor: string
  hasMat: boolean
}) {
  const w = widthIn * SCENE_UNITS_PER_INCH
  const h = heightIn * SCENE_UNITS_PER_INCH
  const faceW = FRAME_FACE_IN * SCENE_UNITS_PER_INCH
  const depth = FRAME_DEPTH_IN * SCENE_UNITS_PER_INCH
  const matInset = hasMat ? 0.16 * Math.min(w, h) : 0

  // Apply "cover"-style UV cropping so the texture isn't stretched to fit
  // the print's aspect ratio. Mirrors CSS object-fit: cover behavior.
  // The texture is already loaded (parent suspended on it), so we can read
  // its image dimensions synchronously here.
  React.useEffect(() => {
    if (!texture) return
    const img = texture.image as { naturalWidth?: number; naturalHeight?: number; width?: number; height?: number } | undefined
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

  // Frame: 4 box rails arranged around the print. Each rail extends past the
  // print edges by faceW so they meet at the corners (forming a mitred look
  // visually if face material is consistent — for a true miter, we'd use an
  // ExtrudeGeometry, deferred to a later iteration).
  const railArgs = (long: number, short: number, depthArg: number): [number, number, number] => [
    long,
    short,
    depthArg,
  ]

  return (
    <group>
      {/* Mat (recessed plane behind the print) */}
      {hasMat ? (
        <mesh position={[0, 0, depth / 2 - 0.005]}>
          <planeGeometry args={[w + 2 * matInset, h + 2 * matInset]} />
          <meshStandardMaterial color={matColor} roughness={0.9} />
        </mesh>
      ) : null}

      {/* Print on top of mat. meshBasicMaterial shows the texture at full
          brightness independent of scene lighting — a real photograph
          shouldn't darken based on light direction. */}
      <mesh position={[0, 0, depth / 2]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} />
      </mesh>

      {/* Top rail */}
      <mesh position={[0, h / 2 + matInset + faceW / 2, 0]}>
        <boxGeometry args={railArgs(w + 2 * matInset + 2 * faceW, faceW, depth)} />
        <meshStandardMaterial color={frameColor} roughness={0.35} metalness={0.05} />
      </mesh>
      {/* Bottom rail */}
      <mesh position={[0, -(h / 2 + matInset + faceW / 2), 0]}>
        <boxGeometry args={railArgs(w + 2 * matInset + 2 * faceW, faceW, depth)} />
        <meshStandardMaterial color={frameColor} roughness={0.35} metalness={0.05} />
      </mesh>
      {/* Left rail */}
      <mesh position={[-(w / 2 + matInset + faceW / 2), 0, 0]}>
        <boxGeometry args={railArgs(faceW, h + 2 * matInset, depth)} />
        <meshStandardMaterial color={frameColor} roughness={0.35} metalness={0.05} />
      </mesh>
      {/* Right rail */}
      <mesh position={[w / 2 + matInset + faceW / 2, 0, 0]}>
        <boxGeometry args={railArgs(faceW, h + 2 * matInset, depth)} />
        <meshStandardMaterial color={frameColor} roughness={0.35} metalness={0.05} />
      </mesh>
    </group>
  )
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
