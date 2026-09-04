'use client'

import * as React from 'react'

import { useLoader, useThree } from '@react-three/fiber'
import { SRGBColorSpace, type Texture, TextureLoader } from 'three'

import type { SelectionMap, V2Option, V2Template } from '../../types'

// Bits shared by the three R3F scenes (framed / canvas / block mount).
// This module imports three + fiber, so it must only ever be imported by
// the lazily-loaded scene files — never by Renderer3D.tsx — or the 3D
// chunk leaks into the initial bundle.

// Coordinate system: 1 unit ≈ 1 inch / 20, so a 16" wide print = 0.8 units.
// Keeps the camera at a comfortable distance with no need to tune fov per
// print size.
export const SCENE_UNITS_PER_INCH = 1 / 20
export const FOV_DEG = 50

// Camera distance: default to z=1.8 (the "looks right" distance for the
// 16×20 default). When the piece exceeds what fits at that distance, back
// the camera off so it doesn't get cut off.
const DEFAULT_Z = 1.8
// Breathing margin around the piece so it never crowds the canvas edges.
const MARGIN = 1.3

// Canvas size scales with print so a 24×36 reads larger than an 8×10.
export function canvasPx(widthIn: number, heightIn: number) {
  return {
    canvasW: Math.min(680, Math.max(540, Math.round(widthIn * 22))),
    canvasH: Math.min(680, Math.max(540, Math.round(heightIn * 22))),
  }
}

// Minimum camera z that fits a piece of totalW × totalH scene units inside
// a canvas of the given pixel aspect, with MARGIN breathing room.
export function fitCameraZ(
  totalWUnits: number,
  totalHUnits: number,
  canvasW: number,
  canvasH: number,
): number {
  const halfFovRad = (FOV_DEG / 2) * (Math.PI / 180)
  const aspect = canvasW / canvasH
  const zFitH = (totalHUnits * MARGIN) / (2 * Math.tan(halfFovRad))
  const zFitW = (totalWUnits * MARGIN) / (2 * Math.tan(halfFovRad) * aspect)
  return Math.max(DEFAULT_Z, zFitH, zFitW)
}

export function findSizeSelection(
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

// Loads the artwork texture above the Canvas so Suspense waits before
// mounting the Canvas at all — avoids the empty-canvas-then-print-pop
// sequence. useLoader caches per URL, so the colour-space fix runs once.
export function useArtworkTexture(imageUrl: string): Texture {
  const texture = useLoader(TextureLoader, imageUrl)
  if (texture.colorSpace !== SRGBColorSpace) {
    texture.colorSpace = SRGBColorSpace
    texture.needsUpdate = true
  }
  return texture
}

// Max anisotropic filtering the GPU supports. Must run inside the Canvas
// (needs the renderer). Applied to the print texture so it stays sharp when
// the customer orbits and the plane is viewed at an angle.
export function useMaxAnisotropy(): number {
  const gl = useThree((s) => s.gl)
  return React.useMemo(() => gl.capabilities.getMaxAnisotropy(), [gl])
}

// Apply "cover"-style UV cropping so the texture isn't stretched to fit the
// print's aspect ratio. Mirrors CSS object-fit: cover. Also bumps anisotropy
// to the GPU max. Inside the Canvas only (uses useThree).
export function usePrintTexture(texture: Texture, w: number, h: number) {
  const anisotropy = useMaxAnisotropy()
  const invalidate = useThree((s) => s.invalidate)
  React.useEffect(() => {
    if (texture.anisotropy !== anisotropy) {
      texture.anisotropy = anisotropy
      texture.needsUpdate = true
    }
    const crop = coverCrop(texture, w, h)
    if (crop) {
      texture.repeat.set(crop.repeatX, crop.repeatY)
      texture.offset.set(crop.offsetX, crop.offsetY)
    }
    // frameloop="demand": manual texture mutations don't schedule a frame.
    invalidate()
  }, [texture, w, h, anisotropy, invalidate])
}

// Cover-crop bounds of a texture on a w × h plane: the visible image region
// in UV space is [offset, offset + repeat] per axis.
export function coverCrop(
  texture: Texture,
  w: number,
  h: number,
): { repeatX: number; repeatY: number; offsetX: number; offsetY: number } | null {
  const img = texture.image as
    | { naturalWidth?: number; naturalHeight?: number; width?: number; height?: number }
    | undefined
  const imgW = img?.naturalWidth ?? img?.width
  const imgH = img?.naturalHeight ?? img?.height
  if (!imgW || !imgH) return null
  const imgAspect = imgW / imgH
  const planeAspect = w / h
  if (imgAspect > planeAspect) {
    const repeatX = planeAspect / imgAspect
    return { repeatX, repeatY: 1, offsetX: (1 - repeatX) / 2, offsetY: 0 }
  }
  const repeatY = imgAspect / planeAspect
  return { repeatX: 1, repeatY, offsetX: 0, offsetY: (1 - repeatY) / 2 }
}

// Moves the camera to distance z without remounting the Canvas. R3F only
// honours the `camera` prop on mount, so size changes drive this instead.
// Keeps whatever orbit direction the customer has dragged to; only the
// distance changes.
export function CameraRig({ z }: { z: number }) {
  const camera = useThree((s) => s.camera)
  const invalidate = useThree((s) => s.invalidate)
  React.useEffect(() => {
    if (camera.position.lengthSq() === 0) camera.position.set(0, 0, z)
    else camera.position.setLength(z)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    invalidate()
  }, [camera, z, invalidate])
  return null
}

// Shared lighting rig + the wall the piece hangs on.
//
// Low ambient so the directional key light produces real shading on the
// moulding / stretcher edges, and a shadow-catcher wall plane at the back of
// the piece so it casts a soft drop shadow. ShadowMaterial only paints the
// shadow — the canvas stays transparent, so the theme background shows
// through instead of a hardcoded wall colour.
export function SceneLighting({ wallZ }: { wallZ: number }) {
  return (
    <>
      {/* Intensities are tuned for NoToneMapping (Canvas `flat`): front
          faces land at ~1.1× albedo so a white mat reads white and light
          mouldings (maple, white, gold) don't blow out. */}
      <ambientLight intensity={0.25} />
      <hemisphereLight args={['#ffffff', '#6a6a6a', 1.1]} />
      <directionalLight
        position={[-3, 4, 5]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <mesh position={[0, 0, wallZ]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <shadowMaterial transparent opacity={0.28} />
      </mesh>
    </>
  )
}

// Orbit limits shared by every scene: rock the piece back-and-forth without
// getting lost behind it.
export const ORBIT_LIMITS = {
  enableZoom: false,
  enablePan: false,
  minPolarAngle: Math.PI / 2 - Math.PI / 7.2,
  maxPolarAngle: Math.PI / 2 + Math.PI / 7.2,
  minAzimuthAngle: -Math.PI / 4,
  maxAzimuthAngle: Math.PI / 4,
  rotateSpeed: 0.5,
} as const

// Shared Canvas props. frameloop="demand" so an idle scene doesn't burn a
// continuous 60fps render at 2× DPR on a marketing page; drei's
// OrbitControls and the hooks above call invalidate() when something moves.
// `flat` disables ACES tone mapping so the print texture shows the source
// photo's actual colours (the customer is judging their artwork) and a
// white mat isn't compressed to grey.
export const CANVAS_PROPS = {
  dpr: [1, 2] as [number, number],
  gl: { antialias: true, alpha: true },
  frameloop: 'demand' as const,
  shadows: true,
  flat: true,
}
