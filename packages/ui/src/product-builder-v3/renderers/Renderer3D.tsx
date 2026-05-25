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

const renderImpl: Renderer = (props) => {
  const { template } = props
  // Only framed prints get the 3D treatment in V3. Other categories
  // delegate to the 2.5D renderer, which already does category-specific
  // depth strips and material treatments.
  if (template.category !== 'framed') {
    return Renderer25D.render(props)
  }
  return <Framed3DContainer {...props} />
}

function Framed3DContainer(props: RendererProps) {
  return (
    <React.Suspense fallback={<Fallback />}>
      <FramedScene {...props} />
    </React.Suspense>
  )
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
