import type {
  BuilderSelection,
  PublicOptionGroup,
  PublicProductTemplate,
} from '@artbox/types'

export function calcUnitPrice(
  template: Pick<PublicProductTemplate, 'basePrice'>,
  selections: Pick<BuilderSelection, 'priceModifierAmount'>[],
): number {
  const sum = selections.reduce((acc, s) => acc + (s.priceModifierAmount || 0), 0)
  return round2(template.basePrice + sum)
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Validate that selections cover every required option group exactly once
 * and that each selected option is allowed for its group.
 */
export function validateSelections(
  template: PublicProductTemplate,
  selections: BuilderSelection[],
): { ok: true } | { ok: false; error: string } {
  const groupMap = new Map<string, PublicOptionGroup>(
    template.optionGroups.map((g) => [g.slug, g]),
  )
  const seen = new Set<string>()
  for (const s of selections) {
    const group = groupMap.get(s.optionGroupSlug)
    if (!group) return { ok: false, error: `unknown_option_group:${s.optionGroupSlug}` }
    if (seen.has(s.optionGroupSlug)) {
      return { ok: false, error: `duplicate_option_group:${s.optionGroupSlug}` }
    }
    seen.add(s.optionGroupSlug)
    const allowed = group.options.find((o) => String(o.id) === String(s.optionId))
    if (!allowed) {
      return { ok: false, error: `option_not_allowed:${s.optionGroupSlug}:${s.optionId}` }
    }
  }
  for (const g of template.optionGroups) {
    if (g.isRequired && !seen.has(g.slug)) {
      return { ok: false, error: `missing_required_group:${g.slug}` }
    }
  }
  return { ok: true }
}
