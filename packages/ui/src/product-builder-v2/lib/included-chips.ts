import type { SelectionMap, V2Template } from '../types'

// Generates the row of "What's included" chips under the price, surfacing
// tangible value to justify the cost.
//
// Two sources:
//   1. Static chips per template category (e.g. every canvas wrap ships with
//      a sawtooth hanger, every paper print is on cotton rag).
//   2. Dynamic chips derived from selected options (e.g. "UV-protective
//      glass" only when uv is picked, "4-ply gallery mat" only when the
//      4-white mat option is picked).
//
// Chips are short noun-phrases — 1–3 words, no marketing fluff. Keep ≤ 6
// total in any given build or the row gets too long.

export type IncludedChip = {
  label: string
  // Optional tooltip text shown on hover/focus.
  tooltip?: string
}

const STATIC_BY_CATEGORY: Record<string, IncludedChip[]> = {
  framed: [
    { label: 'Solid hardwood', tooltip: 'Hand-finished moulding, not veneer.' },
    { label: 'Hardware kit', tooltip: 'D-rings and braided wire included.' },
    { label: 'Local print', tooltip: 'Printed and assembled in Victoria, BC.' },
  ],
  canvas: [
    { label: 'Pigment ink' },
    { label: 'Sawtooth hanger', tooltip: 'Ready to hang straight out of the box.' },
    { label: 'Local print' },
  ],
  paper_print: [
    { label: 'Hahnemühle cotton rag' },
    { label: 'Pigment ink', tooltip: 'Archival, fade-resistant for 100+ years.' },
    { label: 'Acid-free' },
  ],
  block_mount: [
    { label: 'Sustainable birch ply' },
    { label: 'Ready to hang', tooltip: 'Recessed hanger pre-installed on the back.' },
    { label: 'Local print' },
  ],
  art_card: [
    { label: 'Folded 5×7" card' },
    { label: 'White envelope' },
    { label: 'Blank inside' },
  ],
  sticker: [
    { label: 'Weatherproof vinyl' },
    { label: 'Die-cut' },
  ],
  poster: [{ label: 'Pigment ink' }, { label: 'Heavy poster stock' }],
  calendar: [{ label: 'Spiral-bound' }, { label: 'Heavy cover stock' }],
}

// Dynamic chip rules keyed on (group slug → option value). When the customer
// picks that option, append the listed chip. Keep this list tight — only
// surface the option-driven facts that actually change perceived value.
const DYNAMIC_RULES: Array<{
  groupSlug: string
  valueMatch: (value: string) => boolean
  chip: IncludedChip
}> = [
  {
    groupSlug: 'glass-type',
    valueMatch: (v) => v === 'uv',
    chip: { label: 'UV-protective glass', tooltip: 'Blocks 97% of UV rays to slow fading.' },
  },
  {
    groupSlug: 'glass-type',
    valueMatch: (v) => v === 'museum',
    chip: { label: 'Museum non-glare', tooltip: 'Anti-reflective and UV-blocking.' },
  },
  {
    groupSlug: 'mat',
    valueMatch: (v) => v === '4-white',
    chip: { label: '4-ply gallery mat' },
  },
  {
    groupSlug: 'mat',
    valueMatch: (v) => v.startsWith('2'),
    chip: { label: '2" cotton mat' },
  },
  {
    groupSlug: 'stretcher-depth',
    valueMatch: (v) => v === '1.5in',
    chip: { label: '1.5" gallery depth' },
  },
  {
    groupSlug: 'paper-type',
    valueMatch: (v) => v === 'baryta',
    chip: { label: 'Baryta gloss' },
  },
]

export function computeIncludedChips(
  template: V2Template,
  selections: SelectionMap,
): IncludedChip[] {
  const baseChips = STATIC_BY_CATEGORY[template.category] ?? []
  const dynamic: IncludedChip[] = []
  for (const rule of DYNAMIC_RULES) {
    const sel = selections[rule.groupSlug]
    if (sel && rule.valueMatch(sel.value)) {
      dynamic.push(rule.chip)
    }
  }
  // Dedupe by label so a dynamic chip doesn't echo a static one.
  const seen = new Set<string>()
  const out: IncludedChip[] = []
  for (const chip of [...baseChips, ...dynamic]) {
    if (seen.has(chip.label)) continue
    seen.add(chip.label)
    out.push(chip)
    if (out.length >= 6) break
  }
  return out
}
