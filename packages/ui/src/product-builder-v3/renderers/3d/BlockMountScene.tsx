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
  findSizeSelection,
  fitCameraZ,
  useArtworkTexture,
  usePrintTexture,
} from './scene-shared'

// 3D block-mount scene. Real block mounts have the print laminated to the
// top face of a 3/4" birch ply slab — no border around the print, just a
// wood edge visible from the side. The customer picks an edge stain.

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

  const d = BLOCK_DEPTH_IN * SCENE_UNITS_PER_INCH

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

        <BlockPiece
          widthIn={widthIn}
          heightIn={heightIn}
          texture={texture}
          edgeColor={edgeColor}
        />

        <OrbitControls {...ORBIT_LIMITS} />
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

  usePrintTexture(texture, w, h)

  // Edge: wood stain colour matching the customer's pick. Higher roughness
  // than canvas (wood has grain, not weave) and a slight darken at the
  // crevices via the directional light.
  const edgeMat = <meshStandardMaterial color={edgeColor} roughness={0.7} metalness={0.05} />

  return (
    <group>
      {/* Top (front-facing) face — the print */}
      <mesh position={[0, 0, d / 2]} castShadow>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      {/* Edges — wood stain */}
      <mesh position={[0, h / 2, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <planeGeometry args={[w, d]} />
        {edgeMat}
      </mesh>
      <mesh position={[0, -h / 2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <planeGeometry args={[w, d]} />
        {edgeMat}
      </mesh>
      <mesh position={[-w / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow>
        <planeGeometry args={[d, h]} />
        {edgeMat}
      </mesh>
      <mesh position={[w / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <planeGeometry args={[d, h]} />
        {edgeMat}
      </mesh>
    </group>
  )
}
