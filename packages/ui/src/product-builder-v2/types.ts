import type {
  BuilderConfiguration,
  PublicOption,
  PublicOptionGroup,
  PublicProductTemplate,
} from '@artbox/types'

// V2 extends PublicOption with optional photo asset slots so frame mouldings,
// canvas edges, and rooms can be shown as real photography rather than
// CSS-generated textures. Backwards compatible: old templates without these
// fields fall back to the synthesized texture path in the renderer.
//
// Image specs are described in the renderer; staff upload these via the
// fulfillment-platform admin against each option.
export type V2OptionExtras = {
  cornerImage?: string
  railImage?: string
  faceImage?: string
}

export type V2Option = PublicOption & V2OptionExtras

// Re-export the template/group types with the V2 option shape so the renderer
// can use them transparently. PublicOption is a structural subset of V2Option
// so a stock template from the fulfillment API satisfies V2Template at runtime.
export type V2OptionGroup = Omit<PublicOptionGroup, 'options'> & {
  options: V2Option[]
}

export type V2Template = Omit<PublicProductTemplate, 'optionGroups'> & {
  optionGroups: V2OptionGroup[]
}

export type BuilderStage = 'format' | 'size' | 'customize'

// Selections are keyed by option-group slug. Mirrors the V1 shape so callers
// hand-off to the existing cart context without translation.
export type SelectionMap = Record<string, V2Option>

export type RoomBackground = {
  // EITHER a photo URL OR a CSS background string (linear-gradient, etc.).
  // Solid-color "wall" presets use backgroundCss so we don't depend on
  // arbitrary photos that may not actually show blank wall area. Uploads
  // and real room photos set imageUrl. RoomComposite prefers backgroundCss
  // when both are set.
  imageUrl?: string
  backgroundCss?: string
  // On-screen pixels per real-world inch — kept for future "true-to-scale"
  // mode. Today the RoomComposite scales by a fixed fraction of room width
  // + customer zoom, ignoring this.
  pxPerIn: number
  // Where on the wall to anchor the framed piece (0..1 normalized to image
  // dimensions). Customer can drag to reposition.
  anchor: { x: number; y: number }
  // Human-readable name shown under the room thumbnail in the picker.
  label?: string
  // Stable identifier used for picker active-state and re-anchoring effect.
  // Derived from imageUrl or backgroundCss when not set.
  id?: string
}

// A serializable build the customer can pin to comparison, share via URL, or
// reload from session storage. `templateSlug` + `selections` are enough to
// reconstruct unitPrice on render.
export type SavedBuild = {
  id: string
  templateSlug: string
  selectionValues: Record<string, string>
  createdAt: number
}

export type BuilderResult = {
  configuration: BuilderConfiguration
  quantity: number
}
