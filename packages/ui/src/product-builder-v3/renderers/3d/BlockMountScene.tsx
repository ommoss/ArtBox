'use client'

import * as React from 'react'

import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { SRGBColorSpace, type Texture, TextureLoader } from 'three'

import { TOKENS } from '../../theme-tokens'
import type { SelectionMap, V2Option, V2Template } from '../../types'
import type { RendererProps } from '../types'

// 3D block-mount scene. Real block mounts have the print laminated to the
// top face of a 3/4" birch ply slab — no border around the print, just a
// wood edge visible from the side. The customer picks an edge stain.

const SCENE_UNITS_PER_INCH = 1 / 20
const BLOCK_DEPTH_IN = 0.75

export default function BlockMountScene({
  template,
  imageUrl,
  selections,
  onReady,
}: RendererProps) {
  const sizeSel = findSizeSelection(template, selections)
  const widthIn = sizeSel?.widthIn ?? 12
  const heightIn = sizeSel?.heightIn ?? 16
  const edgeOpt = selections['block-edge']
  const edgeColor = edgeOpt?.swatchColor ?? '#c19a6b'

  const canvasW = Math.min(680, Math.max(540, Math.round(widthIn * 22)))
  const canvasH = Math.min(680, Math.max(540, Math.round(heightIn * 22)))

  const DEFAULT_Z = 1.8
  const FOV_DEG = 50
  const printWUnits = widthIn * SCENE_UNITS_PER_INCH
  const printHUnits = heightIn * SCENE_UNITS_PER_INCH
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

        <BlockPiece
          widthIn={widthIn}
          heightIn={heightIn}
          texture={texture}
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

function BlockPiece({
  widthIn,
  heightIn,
  texture,
  edgeColor,
}: {
  widthIn: number
  heightIn: number
  texture: Texture
  edgeColor: string
}) {
  const w = widthIn * SCENE_UNITS_PER_INCH
  const h = heightIn * SCENE_UNITS_PER_INCH
  const d = BLOCK_DEPTH_IN * SCENE_UNITS_PER_INCH

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

  // Edge: wood stain colour matching the customer's pick. Higher roughness
  // than canvas (wood has grain, not weave) and a slight darken at the
  // crevices via the directional light.
  const edgeMat = <meshStandardMaterial color={edgeColor} roughness={0.7} metalness={0.05} />

  return (
    <group>
      {/* Top (front-facing) face — the print */}
      <mesh position={[0, 0, d / 2]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      {/* Edges — wood stain */}
      <mesh position={[0, h / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        {edgeMat}
      </mesh>
      <mesh position={[0, -h / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        {edgeMat}
      </mesh>
      <mesh position={[-w / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[d, h]} />
        {edgeMat}
      </mesh>
      <mesh position={[w / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[d, h]} />
        {edgeMat}
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
