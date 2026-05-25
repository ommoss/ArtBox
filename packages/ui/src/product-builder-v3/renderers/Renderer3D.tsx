'use client'

import * as React from 'react'

import { Renderer25D } from './Renderer25D'
import type { Renderer, RendererDescriptor, RendererProps } from './types'

// V3 3D renderer using react-three-fiber. Implements true 3D for framed
// prints (the highest-value category for 3D — frame depth, lighting,
// shadow). Other categories fall back to the 2.5D renderer; their 3D
// equivalents can be added later under the same pattern.
//
// The Canvas import is lazy so SSR doesn't try to instantiate WebGL.

const FramedScene = React.lazy(() => import('./3d/FramedScene'))
const CanvasScene = React.lazy(() => import('./3d/CanvasScene'))
const BlockMountScene = React.lazy(() => import('./3d/BlockMountScene'))

// Categories that have a real 3D scene. Others delegate to the 2.5D
// renderer (paper print, sticker, art card etc. — no depth/edge to show).
const SCENE_BY_CATEGORY: Record<string, React.LazyExoticComponent<React.ComponentType<RendererProps>>> = {
  framed: FramedScene,
  canvas: CanvasScene,
  block_mount: BlockMountScene,
}

const renderImpl: Renderer = (props) => {
  const Scene = SCENE_BY_CATEGORY[props.template.category]
  if (!Scene) {
    // Categories without a 3D scene (paper print, sticker, card) fall back
    // to 2.5D — there's no depth or edge to model in 3D.
    return Renderer25D.render(props)
  }
  // R3F's Canvas touches `document` during render. Next.js statically
  // pre-renders client components for initial HTML, so we have to defer
  // *all* 3D rendering until after hydration. Without this, vercel
  // builds fail on "document is not defined" during static generation.
  return (
    <ClientOnly fallback={<Fallback />}>
      <React.Suspense fallback={<Fallback />}>
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

function Fallback() {
  return (
    <div
      style={{
        padding: 24,
        textAlign: 'center',
        color: 'var(--color-secondary, rgba(0,0,0,0.6))',
        fontSize: '0.85rem',
      }}
    >
      Loading 3D preview…
    </div>
  )
}

export const Renderer3D: RendererDescriptor = {
  id: '3d',
  label: '3D (R3F)',
  capabilities: ['orbit-3d', 'photo-corners', 'room-composite'],
  // Available in V3 — R3F deps must be installed in the consumer's app.
  isAvailable: () => true,
  render: renderImpl,
}
