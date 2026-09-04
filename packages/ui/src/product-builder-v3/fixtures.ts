import type { V2Template } from './types'

// Hand-crafted templates that mirror the shape returned by the fulfillment
// API's /api/v1/templates endpoint. Used by:
//   - the /dev/builder-v3 sandbox route and the marketing home demo
//   - unit/Storybook-style demos
//   - tests
//
// Keep the slugs aligned with the fulfillment platform so a build pinned in
// the sandbox round-trips to a real cart entry without translation.

let nextId = 1
const id = () => nextId++

export const fixtureFramedPrint: V2Template = {
  id: 'tpl-framed',
  slug: 'framed-print',
  name: 'Custom framed print',
  category: 'framed',
  description: 'Archival print, hand-mounted in a solid-wood moulding with UV-protective glass.',
  basePrice: 95,
  optionGroups: [
    {
      id: id(),
      name: 'Size',
      slug: 'size',
      inputType: 'size',
      isRequired: true,
      options: [
        // Portrait sizes (w < h)
        { id: id(), label: '8 × 10″', value: '8x10', priceModifierAmount: 25, widthIn: 8, heightIn: 10, sortOrder: 1 },
        { id: id(), label: '11 × 14″', value: '11x14', priceModifierAmount: 40, widthIn: 11, heightIn: 14, sortOrder: 2 },
        { id: id(), label: '16 × 20″', value: '16x20', priceModifierAmount: 65, widthIn: 16, heightIn: 20, sortOrder: 3 },
        { id: id(), label: '20 × 24″', value: '20x24', priceModifierAmount: 95, widthIn: 20, heightIn: 24, sortOrder: 4 },
        { id: id(), label: '24 × 36″', value: '24x36', priceModifierAmount: 150, widthIn: 24, heightIn: 36, sortOrder: 5 },
        // Landscape sizes (w > h) — same SKUs rotated
        { id: id(), label: '10 × 8″', value: '10x8', priceModifierAmount: 25, widthIn: 10, heightIn: 8, sortOrder: 6 },
        { id: id(), label: '14 × 11″', value: '14x11', priceModifierAmount: 40, widthIn: 14, heightIn: 11, sortOrder: 7 },
        { id: id(), label: '20 × 16″', value: '20x16', priceModifierAmount: 65, widthIn: 20, heightIn: 16, sortOrder: 8 },
        { id: id(), label: '24 × 20″', value: '24x20', priceModifierAmount: 95, widthIn: 24, heightIn: 20, sortOrder: 9 },
        { id: id(), label: '36 × 24″', value: '36x24', priceModifierAmount: 150, widthIn: 36, heightIn: 24, sortOrder: 10 },
      ],
    },
    {
      id: id(),
      name: 'Frame color',
      slug: 'frame-color',
      inputType: 'swatch',
      isRequired: true,
      helpText: 'Solid hardwood, hand-finished in Victoria, BC.',
      options: [
        { id: id(), label: 'Black oak', value: 'black-oak', priceModifierAmount: 0, swatchColor: '#1a1410', sortOrder: 1 },
        { id: id(), label: 'Natural maple', value: 'natural-maple', priceModifierAmount: 0, swatchColor: '#c8a878', sortOrder: 2 },
        { id: id(), label: 'Walnut', value: 'walnut', priceModifierAmount: 10, swatchColor: '#5a3a24', sortOrder: 3 },
        { id: id(), label: 'White', value: 'white', priceModifierAmount: 0, swatchColor: '#f4f1e8', sortOrder: 4 },
        { id: id(), label: 'Gold leaf', value: 'gold-leaf', priceModifierAmount: 35, swatchColor: '#c89b4a', sortOrder: 5 },
      ],
    },
    {
      id: id(),
      name: 'Mat',
      slug: 'mat',
      inputType: 'select',
      isRequired: false,
      helpText: 'Acid-free cotton mat board.',
      options: [
        { id: id(), label: 'No mat', value: 'none', priceModifierAmount: 0, sortOrder: 1 },
        { id: id(), label: '2" white mat', value: '2-white', priceModifierAmount: 15, sortOrder: 2 },
        { id: id(), label: '2" black mat', value: '2-black', priceModifierAmount: 15, sortOrder: 3 },
        { id: id(), label: '4" white mat (gallery)', value: '4-white', priceModifierAmount: 30, sortOrder: 4 },
      ],
    },
    {
      id: id(),
      name: 'Glass',
      slug: 'glass-type',
      inputType: 'select',
      isRequired: false,
      options: [
        { id: id(), label: 'Standard glass', value: 'standard', priceModifierAmount: 0, sortOrder: 1 },
        { id: id(), label: 'UV-protective glass', value: 'uv', priceModifierAmount: 25, sortOrder: 2 },
        { id: id(), label: 'Museum non-glare', value: 'museum', priceModifierAmount: 60, sortOrder: 3 },
      ],
    },
  ],
}

export const fixtureCanvasWrap: V2Template = {
  id: 'tpl-canvas',
  slug: 'canvas-wrap',
  name: 'Canvas wrap',
  category: 'canvas',
  description: 'Pigment ink on cotton canvas, hand-stretched on solid pine.',
  basePrice: 75,
  optionGroups: [
    {
      id: id(),
      name: 'Size',
      slug: 'size',
      inputType: 'size',
      isRequired: true,
      options: [
        // Portrait
        { id: id(), label: '12 × 16″', value: '12x16', priceModifierAmount: 30, widthIn: 12, heightIn: 16, sortOrder: 1 },
        { id: id(), label: '16 × 20″', value: '16x20', priceModifierAmount: 55, widthIn: 16, heightIn: 20, sortOrder: 2 },
        { id: id(), label: '20 × 30″', value: '20x30', priceModifierAmount: 90, widthIn: 20, heightIn: 30, sortOrder: 3 },
        { id: id(), label: '30 × 40″', value: '30x40', priceModifierAmount: 145, widthIn: 30, heightIn: 40, sortOrder: 4 },
        // Landscape
        { id: id(), label: '16 × 12″', value: '16x12', priceModifierAmount: 30, widthIn: 16, heightIn: 12, sortOrder: 5 },
        { id: id(), label: '20 × 16″', value: '20x16', priceModifierAmount: 55, widthIn: 20, heightIn: 16, sortOrder: 6 },
        { id: id(), label: '30 × 20″', value: '30x20', priceModifierAmount: 90, widthIn: 30, heightIn: 20, sortOrder: 7 },
        { id: id(), label: '40 × 30″', value: '40x30', priceModifierAmount: 145, widthIn: 40, heightIn: 30, sortOrder: 8 },
      ],
    },
    {
      id: id(),
      name: 'Stretcher depth',
      slug: 'stretcher-depth',
      inputType: 'select',
      isRequired: true,
      options: [
        { id: id(), label: '0.75" thin', value: '0.75in', priceModifierAmount: 0, sortOrder: 1 },
        { id: id(), label: '1.5" gallery', value: '1.5in', priceModifierAmount: 20, sortOrder: 2 },
      ],
    },
    {
      id: id(),
      name: 'Edge wrap',
      slug: 'canvas-wrap',
      inputType: 'select',
      isRequired: true,
      helpText: 'How the image wraps around the canvas edge.',
      options: [
        { id: id(), label: 'Gallery wrap (image continues)', value: 'gallery', priceModifierAmount: 0, sortOrder: 1 },
        { id: id(), label: 'Mirror wrap', value: 'mirror', priceModifierAmount: 0, sortOrder: 2 },
        { id: id(), label: 'Solid color edge', value: 'solid', priceModifierAmount: 0, sortOrder: 3 },
      ],
    },
    {
      id: id(),
      name: 'Edge color',
      slug: 'canvas-edge-color',
      inputType: 'swatch',
      isRequired: false,
      helpText: 'Only used when "Solid color edge" is selected.',
      options: [
        { id: id(), label: 'Black', value: 'black', priceModifierAmount: 0, swatchColor: '#1a1a1a', sortOrder: 1 },
        { id: id(), label: 'White', value: 'white', priceModifierAmount: 0, swatchColor: '#f4f1e8', sortOrder: 2 },
        { id: id(), label: 'Navy', value: 'navy', priceModifierAmount: 0, swatchColor: '#1a2840', sortOrder: 3 },
      ],
    },
  ],
}

export const fixturePaperPrint: V2Template = {
  id: 'tpl-paper',
  slug: 'paper-print',
  name: 'Fine art paper print',
  category: 'paper_print',
  description: 'Pigment ink on Hahnemühle cotton rag, unframed.',
  basePrice: 35,
  optionGroups: [
    {
      id: id(),
      name: 'Size',
      slug: 'size',
      inputType: 'size',
      isRequired: true,
      options: [
        { id: id(), label: '8 × 10″', value: '8x10', priceModifierAmount: 0, widthIn: 8, heightIn: 10, sortOrder: 1 },
        { id: id(), label: '11 × 14″', value: '11x14', priceModifierAmount: 15, widthIn: 11, heightIn: 14, sortOrder: 2 },
        { id: id(), label: '16 × 20″', value: '16x20', priceModifierAmount: 35, widthIn: 16, heightIn: 20, sortOrder: 3 },
        { id: id(), label: '24 × 36″', value: '24x36', priceModifierAmount: 95, widthIn: 24, heightIn: 36, sortOrder: 4 },
      ],
    },
    {
      id: id(),
      name: 'Paper',
      slug: 'paper-type',
      inputType: 'select',
      isRequired: true,
      options: [
        { id: id(), label: 'Smooth cotton', value: 'smooth', priceModifierAmount: 0, sortOrder: 1 },
        { id: id(), label: 'Textured cotton rag', value: 'textured', priceModifierAmount: 8, sortOrder: 2 },
        { id: id(), label: 'Baryta gloss', value: 'baryta', priceModifierAmount: 12, sortOrder: 3 },
      ],
    },
  ],
}

export const fixtureBlockMount: V2Template = {
  id: 'tpl-block',
  slug: 'block-mount',
  name: 'Wood block mount',
  category: 'block_mount',
  description: 'Print laminated directly to sustainable birch ply, ready to hang.',
  basePrice: 60,
  optionGroups: [
    {
      id: id(),
      name: 'Size',
      slug: 'size',
      inputType: 'size',
      isRequired: true,
      options: [
        { id: id(), label: '8 × 10″', value: '8x10', priceModifierAmount: 0, widthIn: 8, heightIn: 10, sortOrder: 1 },
        { id: id(), label: '12 × 16″', value: '12x16', priceModifierAmount: 20, widthIn: 12, heightIn: 16, sortOrder: 2 },
        { id: id(), label: '16 × 20″', value: '16x20', priceModifierAmount: 45, widthIn: 16, heightIn: 20, sortOrder: 3 },
      ],
    },
    {
      id: id(),
      name: 'Edge stain',
      slug: 'block-edge',
      inputType: 'swatch',
      isRequired: true,
      options: [
        { id: id(), label: 'Natural birch', value: 'natural', priceModifierAmount: 0, swatchColor: '#c19a6b', sortOrder: 1 },
        { id: id(), label: 'Walnut stain', value: 'walnut', priceModifierAmount: 8, swatchColor: '#5a3a24', sortOrder: 2 },
        { id: id(), label: 'Black', value: 'black', priceModifierAmount: 8, swatchColor: '#1a1410', sortOrder: 3 },
      ],
    },
  ],
}

export const fixtureGreetingCard: V2Template = {
  id: 'tpl-card',
  slug: 'greeting-card',
  name: 'Greeting card',
  category: 'art_card',
  description: 'Folded 5 × 7" card with white envelope, blank inside.',
  basePrice: 6,
  optionGroups: [
    {
      id: id(),
      name: 'Pack',
      slug: 'pack-size',
      inputType: 'select',
      isRequired: true,
      options: [
        { id: id(), label: 'Single card', value: '1', priceModifierAmount: 0, sortOrder: 1 },
        { id: id(), label: 'Pack of 6 (-15%)', value: '6', priceModifierAmount: 25, sortOrder: 2 },
        { id: id(), label: 'Pack of 12 (-25%)', value: '12', priceModifierAmount: 50, sortOrder: 3 },
      ],
    },
  ],
}

export const fixtureSticker: V2Template = {
  id: 'tpl-sticker',
  slug: 'sticker',
  name: 'Vinyl sticker',
  category: 'sticker',
  description: 'Die-cut weatherproof vinyl, 3 to 5 inches.',
  basePrice: 5,
  optionGroups: [
    {
      id: id(),
      name: 'Size',
      slug: 'size',
      inputType: 'size',
      isRequired: true,
      options: [
        { id: id(), label: '3"', value: '3', priceModifierAmount: 0, widthIn: 3, heightIn: 3, sortOrder: 1 },
        { id: id(), label: '4"', value: '4', priceModifierAmount: 2, widthIn: 4, heightIn: 4, sortOrder: 2 },
        { id: id(), label: '5"', value: '5', priceModifierAmount: 4, widthIn: 5, heightIn: 5, sortOrder: 3 },
      ],
    },
  ],
}

export const ALL_FIXTURE_TEMPLATES: V2Template[] = [
  fixtureFramedPrint,
  fixtureCanvasWrap,
  fixturePaperPrint,
  fixtureBlockMount,
  fixtureGreetingCard,
  fixtureSticker,
]

// A pleasant unsplash-style demo image that works well as a stand-in artwork
// in the sandbox. Local fallback prevents network issues from breaking the
// dev environment.
export const FIXTURE_IMAGE_URL =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80'
export const FIXTURE_IMAGE_TITLE = 'Sample artwork — Mountain ridge'
