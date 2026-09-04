'use client'

import * as React from 'react'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { Texture } from 'three'

import { TOKENS } from '../../theme-tokens'
import type { V2Option } from '../../types'
import type { RendererProps } from '../types'

import {
  CameraRig,
  CANVAS_PROPS,
  FOV_DEG,
  ORBIT_LIMITS,
  SCENE_UNITS_PER_INCH,
  SceneLighting,
  canvasPx,
  findSizeSelection,
  fitCameraZ,
  useArtworkTexture,
  usePrintTexture,
} from './scene-shared'

// Real 3D scene for framed prints. Three.js / R3F.

// Frame moulding thickness (visible face width) in inches.
const FRAME_FACE_IN = 1.25
// Frame depth (how far the moulding sticks out from the wall) in inches.
const FRAME_DEPTH_IN = 1.5
// How far the glass/mat/print package sits behind the moulding face. Real
// frames have a rabbet; without it the print reads as painted onto the face.
const RECESS_IN = 0.2
// Visible bevel of the mat's core at the window opening. Mat board is cut
// at 45°, exposing a thin light strip between mat face and print.
const BEVEL_IN = 0.1
// Mat width when the option value doesn't encode one (e.g. a bare "mat"
// value from the fulfillment API), as a fraction of the print's short side.
const MAT_FALLBACK_FRACTION = 0.16

export default function FramedScene({ template, imageUrl, selections, onReady }: RendererProps) {
  const sizeSel = findSizeSelection(template, selections)
  const widthIn = sizeSel?.widthIn ?? 16
  const heightIn = sizeSel?.heightIn ?? 20
  const frameOpt = selections['frame-color'] as V2Option | undefined
  const matSel = selections['mat']
  const frameColor = frameOpt?.swatchColor ?? '#3a2a1c'
  const matColor = matSel?.value?.endsWith('-black') ? '#1a1a1a' : '#f4f1ea'
  const matIn = matWidthIn(matSel, Math.min(widthIn, heightIn))

  const { canvasW, canvasH } = canvasPx(widthIn, heightIn)

  const faceWUnits = FRAME_FACE_IN * SCENE_UNITS_PER_INCH
  const matUnits = matIn * SCENE_UNITS_PER_INCH
  const totalWUnits = widthIn * SCENE_UNITS_PER_INCH + 2 * matUnits + 2 * faceWUnits
  const totalHUnits = heightIn * SCENE_UNITS_PER_INCH + 2 * matUnits + 2 * faceWUnits
  const cameraZ = fitCameraZ(totalWUnits, totalHUnits, canvasW, canvasH)

  const texture = useArtworkTexture(imageUrl)

  // Signal to the shell that the 3D scene has its texture and is mounting
  // for real — used to cancel the auto-fallback-to-2D timer. By the time
  // this effect runs, useLoader has resolved (Suspense waited above), so
  // we're definitely past the slow-load window.
  React.useEffect(() => {
    onReady?.()
  }, [onReady])

  const depth = FRAME_DEPTH_IN * SCENE_UNITS_PER_INCH

  return (
    <div
      style={{
        // Width caps at canvasW but shrinks on narrow screens (mobile).
        // Aspect-ratio keeps the canvas square-ish even when width shrinks.
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
        <SceneLighting wallZ={-depth / 2} />

        <FramedPiece
          widthIn={widthIn}
          heightIn={heightIn}
          texture={texture}
          frameColor={frameColor}
          matColor={matColor}
          matIn={matIn}
        />

        <OrbitControls {...ORBIT_LIMITS} />
      </Canvas>
    </div>
  )
}

// Mat width in inches from the option value. Fixture / fulfillment values
// look like "2-white", "4-white", "2-black"; "none" or missing → 0.
function matWidthIn(matSel: V2Option | undefined, shortSideIn: number): number {
  if (!matSel || matSel.value === 'none') return 0
  const m = /^(\d+(?:\.\d+)?)/.exec(matSel.value)
  if (m) return parseFloat(m[1])
  return MAT_FALLBACK_FRACTION * shortSideIn
}

function FramedPiece({
  widthIn,
  heightIn,
  texture,
  frameColor,
  matColor,
  matIn,
}: {
  widthIn: number
  heightIn: number
  texture: Texture
  frameColor: string
  matColor: string
  matIn: number
}) {
  const w = widthIn * SCENE_UNITS_PER_INCH
  const h = heightIn * SCENE_UNITS_PER_INCH
  const faceW = FRAME_FACE_IN * SCENE_UNITS_PER_INCH
  const depth = FRAME_DEPTH_IN * SCENE_UNITS_PER_INCH
  const matInset = matIn * SCENE_UNITS_PER_INCH
  const bevel = BEVEL_IN * SCENE_UNITS_PER_INCH
  const hasMat = matInset > 0

  // z of the mat/print package: recessed behind the moulding face so the
  // rails cast a shadow onto the mat.
  const packageZ = depth / 2 - RECESS_IN * SCENE_UNITS_PER_INCH

  usePrintTexture(texture, w, h)

  const railMaterial = <meshStandardMaterial color={frameColor} roughness={0.35} metalness={0.05} />

  return (
    <group>
      {hasMat ? (
        <>
          {/* Mat face */}
          <mesh position={[0, 0, packageZ]} receiveShadow>
            <planeGeometry args={[w + 2 * matInset, h + 2 * matInset]} />
            <meshStandardMaterial color={matColor} roughness={0.9} />
          </mesh>
          {/* Bevel core — the light strip exposed by the 45° window cut. */}
          <mesh position={[0, 0, packageZ + 0.0005]} receiveShadow>
            <planeGeometry args={[w + 2 * bevel, h + 2 * bevel]} />
            <meshStandardMaterial color="#fdfcf9" roughness={0.95} />
          </mesh>
        </>
      ) : null}

      {/* Print. meshBasicMaterial shows the texture at full brightness
          independent of scene lighting — a real photograph shouldn't darken
          based on light direction. */}
      <mesh position={[0, 0, packageZ + 0.001]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} />
      </mesh>

      {/* Frame: 4 box rails around the mat/print. Each rail extends past the
          opening by faceW so they meet at the corners. */}
      <mesh position={[0, h / 2 + matInset + faceW / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + 2 * matInset + 2 * faceW, faceW, depth]} />
        {railMaterial}
      </mesh>
      <mesh position={[0, -(h / 2 + matInset + faceW / 2), 0]} castShadow receiveShadow>
        <boxGeometry args={[w + 2 * matInset + 2 * faceW, faceW, depth]} />
        {railMaterial}
      </mesh>
      <mesh position={[-(w / 2 + matInset + faceW / 2), 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[faceW, h + 2 * matInset, depth]} />
        {railMaterial}
      </mesh>
      <mesh position={[w / 2 + matInset + faceW / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[faceW, h + 2 * matInset, depth]} />
        {railMaterial}
      </mesh>
    </group>
  )
}
