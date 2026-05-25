import type * as React from 'react'

import type { RoomBackground, SelectionMap, V2Template } from '../types'

// Renderer = pure presentation of a built configuration. Stateless from the
// outside; gets selections + template + room context and returns JSX.
//
// Multiple renderers can coexist (2.5D photo compositor today, R3F-based 3D
// later). The shell picks one based on capability + browser support.
export type RendererProps = {
  template: V2Template
  imageUrl: string
  selections: SelectionMap
  // Pixels per inch in the display. Smaller on mobile so a 24×36 print fits.
  // The 2.5D renderer uses this for scale; the 3D renderer ignores it (camera
  // distance does the work there).
  pxPerIn: number
  // Optional wall/room background. Composite at room.pxPerIn so the framed
  // piece scales realistically against the room's scale.
  room?: RoomBackground | null
  // If true, suppress shadows/animations so the renderer is OK to capture as
  // a thumbnail (used for the comparison drawer pins).
  staticCapture?: boolean
  // Compact mode for thumbnails (e.g. format-stage cards). Disables the
  // minimum-dimension floor in size scaling, hides depth strips, and uses
  // thinner frame mouldings so the rendered output fits within a small
  // container at the given pxPerIn.
  compact?: boolean
  // Flat mode: keep normal sizing but hide the perspective-rotated bottom
  // and right depth strips. Used when compositing into a room — depth
  // strips read as broken when the piece is meant to be hanging flat on a
  // wall and viewed head-on.
  flat?: boolean
}

export type Renderer = (props: RendererProps) => React.ReactElement

// Capabilities a renderer can advertise. The shell uses these to pick the
// best available renderer for a given device. Today only 2.5D ships; 3D is
// scaffolded but disabled.
export type RendererCapability = 'depth-strips' | 'photo-corners' | 'orbit-3d' | 'room-composite'

export type RendererDescriptor = {
  id: '2.5d' | '3d'
  label: string
  capabilities: RendererCapability[]
  // Whether this renderer is currently usable. The 3D renderer returns false
  // until the R3F integration lands.
  isAvailable: () => boolean
  render: Renderer
}
