import * as React from 'react'

import type { RendererDescriptor } from './types'

// Placeholder for the future R3F-based 3D renderer.
// Implementation plan:
//   - Mount a <Canvas> at the same px-per-inch scale as the 2.5D renderer
//   - Extrude a mitered moulding profile from a 2D shape (THREE.ExtrudeGeometry)
//   - UV-map the railImage as a normal map and faceImage as a diffuse texture
//   - Place the print as a textured plane inset by the moulding depth
//   - Camera at slight off-axis (~10°) with HemisphereLight + DirectionalLight
//   - Hover/drag → orbit ±10° around vertical only (no full sphere)
//
// `isAvailable` returns false until R3F is added to the package's
// dependencies and the implementation lands; the shell will silently fall
// back to the 2.5D renderer. Don't import three or @react-three/fiber here —
// that would force the consumer to install them even when 3D is off.
export const Renderer3D: RendererDescriptor = {
  id: '3d',
  label: '3D (preview)',
  capabilities: ['orbit-3d', 'photo-corners', 'room-composite'],
  isAvailable: () => false,
  render: () => <Stub />,
}

function Stub() {
  return (
    <div
      style={{
        padding: 24,
        border: '1px dashed var(--color-border, rgba(0,0,0,0.12))',
        borderRadius: 4,
        color: 'var(--color-secondary, rgba(0,0,0,0.6))',
        fontSize: '0.85rem',
        textAlign: 'center',
      }}
    >
      3D preview not yet available — using 2.5D fallback.
    </div>
  )
}
