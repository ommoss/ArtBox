import type { RoomBackground } from '../types'

// Curated rooms used by the wall-preview picker. Each room is calibrated so
// the framed piece composites at correct relative scale.
//
// CALIBRATION NOTES — pxPerIn comes from measuring a known reference in each
// photo (sofa back ≈ 33" tall, standard door ≈ 80" tall, queen headboard
// ≈ 60" wide). When Artbox replaces these placeholder photos with their own,
// re-measure and update pxPerIn per image.
//
// Anchor is where the framed piece centers by default (normalized 0..1 to
// image width/height). Picked to land on the focal blank-wall area for each
// room. Customer can drag to reposition.

// Solid-color "blank wall" presets. Each is a subtle vertical gradient that
// reads as a real wall under soft top-down lighting (top a touch brighter,
// bottom a touch shadowed). Using CSS backgrounds rather than photos
// guarantees the wall is actually blank — the framed piece is the focus,
// not arbitrary furniture in a stock photo.
//
// Customers who want their real wall use the Upload button in RoomPicker.
export const CURATED_ROOMS: RoomBackground[] = [
  {
    id: 'wall-white',
    label: 'White wall',
    backgroundCss:
      'linear-gradient(180deg, #faf8f3 0%, #efece5 70%, #e6e3dc 100%)',
    pxPerIn: 8,
    anchor: { x: 0.5, y: 0.45 },
  },
  {
    id: 'wall-warm',
    label: 'Warm beige',
    backgroundCss:
      'linear-gradient(180deg, #e9dfc9 0%, #d8ccae 70%, #c6b894 100%)',
    pxPerIn: 8,
    anchor: { x: 0.5, y: 0.45 },
  },
  {
    id: 'wall-gray',
    label: 'Soft gray',
    backgroundCss:
      'linear-gradient(180deg, #e2e2df 0%, #c9c9c4 70%, #b6b6b0 100%)',
    pxPerIn: 8,
    anchor: { x: 0.5, y: 0.45 },
  },
  {
    id: 'wall-charcoal',
    label: 'Charcoal',
    backgroundCss:
      'linear-gradient(180deg, #3a3a3c 0%, #2a2a2c 70%, #1f1f21 100%)',
    pxPerIn: 8,
    anchor: { x: 0.5, y: 0.45 },
  },
]
