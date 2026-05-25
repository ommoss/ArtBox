// Aspect-ratio classification used by the per-artwork size selector.
//
// Thresholds picked to put the common SKUs in the buckets artists expect:
//   - 8×10, 11×14, 16×20, 24×36 → portrait
//   - 10×8, 14×11, 20×16, 36×24 → landscape
//   - 12×16 → portrait (1.33 ratio)
//   - 16×16, 30×30 → square (within 5% of 1:1)
//   - 12×36 (3:1+) → panoramic
//
// 'any' is the wildcard — matches everything regardless of ratio.

export type AspectCategory = 'any' | 'portrait' | 'landscape' | 'square' | 'panoramic'

const SQUARE_TOLERANCE = 0.05 // within 5% of 1:1 reads as square
const PANORAMIC_THRESHOLD = 2.5 // 2.5:1 or wider reads as panoramic

export function classifyAspect(
  widthIn: number | undefined | null,
  heightIn: number | undefined | null,
): AspectCategory {
  if (!widthIn || !heightIn) return 'any'
  const ratio = widthIn / heightIn
  // Square: within ±5% of 1:1
  if (Math.abs(ratio - 1) <= SQUARE_TOLERANCE) return 'square'
  // Panoramic: ratio ≥ 2.5 (very wide landscape) or ≤ 0.4 (very tall portrait)
  if (ratio >= PANORAMIC_THRESHOLD || ratio <= 1 / PANORAMIC_THRESHOLD) {
    return 'panoramic'
  }
  return ratio > 1 ? 'landscape' : 'portrait'
}

export function matchesAspect(
  aspect: AspectCategory,
  widthIn: number | undefined | null,
  heightIn: number | undefined | null,
): boolean {
  if (aspect === 'any') return true
  return classifyAspect(widthIn, heightIn) === aspect
}

export const ASPECT_LABELS: Record<AspectCategory, string> = {
  any: 'Any',
  portrait: 'Portrait',
  landscape: 'Landscape',
  square: 'Square',
  panoramic: 'Panoramic',
}
