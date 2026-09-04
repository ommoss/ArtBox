'use client'

import * as React from 'react'

import { Renderer25D } from './Renderer25D'
import type { Renderer, RendererDescriptor, RendererProps } from './types'

// V3 3D renderer using react-three-fiber. Real 3D for framed prints, canvas
// wraps and block mounts (the categories with depth worth showing). Other
// categories fall back to the 2.5D renderer.
//
// The scene imports are lazy so SSR doesn't try to instantiate WebGL and
// three/R3F/drei stay out of the initial bundle. Nothing in this file may
// import from 'three' or '@react-three/*' directly.

const loadFramed = () => import('./3d/FramedScene')
const loadCanvas = () => import('./3d/CanvasScene')
const loadBlockMount = () => import('./3d/BlockMountScene')

const FramedScene = React.lazy(loadFramed)
const CanvasScene = React.lazy(loadCanvas)
const BlockMountScene = React.lazy(loadBlockMount)

// Categories that have a real 3D scene. Others delegate to the 2.5D
// renderer (paper print, sticker, art card etc. — no depth/edge to show).
const SCENE_BY_CATEGORY: Record<string, React.LazyExoticComponent<React.ComponentType<RendererProps>>> = {
  framed: FramedScene,
  canvas: CanvasScene,
  block_mount: BlockMountScene,
}

// Kick off the 3D chunk download without rendering anything. The shell
// calls this on idle after mount so the first switch to a 3D-capable
// format doesn't pay the chunk fetch on the critical path. Idempotent —
// dynamic imports are cached by the bundler runtime.
function preload() {
  void loadFramed()
  void loadCanvas()
  void loadBlockMount()
}

const renderImpl: Renderer = (props) => {
  const Scene = SCENE_BY_CATEGORY[props.template.category]
  if (!Scene) {
    return Renderer25D.render(props)
  }
  // R3F's Canvas touches `document` during render. Next.js statically
  // pre-renders client components for initial HTML, so we have to defer
  // *all* 3D rendering until after hydration. Without this, vercel
  // builds fail on "document is not defined" during static generation.
  //
  // The 2.5D render of the same configuration is the fallback for both the
  // pre-hydration gap and the Suspense wait (chunk + texture), so the
  // customer sees the piece immediately instead of a "loading" caption.
  const fallback = Renderer25D.render(props)
  return (
    <ClientOnly fallback={fallback}>
      <React.Suspense fallback={fallback}>
        <Scene {...props} />
      </React.Suspense>
    </ClientOnly>
  )
}

function ClientOnly({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback: React.ReactNode
}) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return <>{fallback}</>
  return <>{children}</>
}

export const Renderer3D: RendererDescriptor = {
  id: '3d',
  label: '3D (R3F)',
  capabilities: ['orbit-3d', 'photo-corners'],
  // Available in V3 — R3F deps must be installed in the consumer's app.
  isAvailable: () => true,
  render: renderImpl,
  preload,
}
