import type { Payload } from 'payload'

type CatalogSeed = {
  sku: string
  name: string
  category:
    | 'paper_print'
    | 'canvas'
    | 'framed'
    | 'block_mount'
    | 'art_card'
    | 'sticker'
    | 'poster'
  widthIn?: number
  heightIn?: number
  material?: string
  finish?: string
  baseCost: number
  leadTimeDays?: number
}

// Initial catalog drawn from artboxprinting.com's advertised services.
// Costs are placeholders — update with real Artbox pricing before going live.
export const productionCatalogSeed: CatalogSeed[] = [
  // Giclée fine art paper prints
  { sku: 'PRT-FA-08x10', name: 'Giclée fine art paper print, 8×10', category: 'paper_print', widthIn: 8, heightIn: 10, material: 'Hahnemühle Photo Rag (placeholder)', baseCost: 18 },
  { sku: 'PRT-FA-11x14', name: 'Giclée fine art paper print, 11×14', category: 'paper_print', widthIn: 11, heightIn: 14, material: 'Hahnemühle Photo Rag (placeholder)', baseCost: 28 },
  { sku: 'PRT-FA-16x20', name: 'Giclée fine art paper print, 16×20', category: 'paper_print', widthIn: 16, heightIn: 20, material: 'Hahnemühle Photo Rag (placeholder)', baseCost: 48 },
  { sku: 'PRT-FA-20x24', name: 'Giclée fine art paper print, 20×24', category: 'paper_print', widthIn: 20, heightIn: 24, material: 'Hahnemühle Photo Rag (placeholder)', baseCost: 68 },
  { sku: 'PRT-FA-24x36', name: 'Giclée fine art paper print, 24×36', category: 'paper_print', widthIn: 24, heightIn: 36, material: 'Hahnemühle Photo Rag (placeholder)', baseCost: 110 },

  // Giclée canvas prints
  { sku: 'CAN-12x16', name: 'Giclée canvas, 12×16, gallery wrap', category: 'canvas', widthIn: 12, heightIn: 16, material: 'Photo canvas, archival inks', finish: 'Gallery wrap', baseCost: 65 },
  { sku: 'CAN-16x20', name: 'Giclée canvas, 16×20, gallery wrap', category: 'canvas', widthIn: 16, heightIn: 20, material: 'Photo canvas, archival inks', finish: 'Gallery wrap', baseCost: 95 },
  { sku: 'CAN-24x36', name: 'Giclée canvas, 24×36, gallery wrap', category: 'canvas', widthIn: 24, heightIn: 36, material: 'Photo canvas, archival inks', finish: 'Gallery wrap', baseCost: 175 },

  // Block mounts
  { sku: 'BLK-08x10', name: 'Wood block-mount, 8×10', category: 'block_mount', widthIn: 8, heightIn: 10, material: 'In-house sustainable wood', baseCost: 38 },
  { sku: 'BLK-16x20', name: 'Wood block-mount, 16×20', category: 'block_mount', widthIn: 16, heightIn: 20, material: 'In-house sustainable wood', baseCost: 88 },

  // Ready-framed prints (paper print + ready frame + mat)
  { sku: 'FRM-RDY-11x14', name: 'Ready-framed print, 11×14', category: 'framed', widthIn: 11, heightIn: 14, material: 'Ready frame + pre-cut mat', baseCost: 75 },
  { sku: 'FRM-RDY-16x20', name: 'Ready-framed print, 16×20', category: 'framed', widthIn: 16, heightIn: 20, material: 'Ready frame + pre-cut mat', baseCost: 125 },

  // Custom-framed prints (priced as quote-on-request placeholder)
  { sku: 'FRM-CST-16x20', name: 'Custom-framed print, 16×20, conservation', category: 'framed', widthIn: 16, heightIn: 20, material: 'Custom wood frame, conservation glass', baseCost: 220, leadTimeDays: 14 },
  { sku: 'FRM-CST-24x36', name: 'Custom-framed print, 24×36, conservation', category: 'framed', widthIn: 24, heightIn: 36, material: 'Custom wood frame, conservation glass', baseCost: 380, leadTimeDays: 14 },

  // Art cards / posters / stickers
  { sku: 'CRD-5x7', name: 'Art card, 5×7', category: 'art_card', widthIn: 5, heightIn: 7, baseCost: 4 },
  { sku: 'CRD-A6', name: 'Art card, A6 (4.1×5.8)', category: 'art_card', widthIn: 4.1, heightIn: 5.8, baseCost: 3 },
  { sku: 'PST-12x18', name: 'Poster, 12×18', category: 'poster', widthIn: 12, heightIn: 18, baseCost: 22 },
  { sku: 'PST-18x24', name: 'Poster, 18×24', category: 'poster', widthIn: 18, heightIn: 24, baseCost: 32 },
  { sku: 'STK-3x3', name: 'Sticker, 3×3 vinyl', category: 'sticker', widthIn: 3, heightIn: 3, baseCost: 2 },
  { sku: 'STK-4x4', name: 'Sticker, 4×4 vinyl', category: 'sticker', widthIn: 4, heightIn: 4, baseCost: 3 },
]

export async function seedProductionCatalog(payload: Payload) {
  for (const item of productionCatalogSeed) {
    const existing = await payload.find({
      collection: 'production-catalog',
      where: { sku: { equals: item.sku } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs.length === 0) {
      await payload.create({ collection: 'production-catalog', data: item })
    }
  }
}
