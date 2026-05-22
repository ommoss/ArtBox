import type { PublicProductTemplate } from '@artbox/types'

// Shape we pull from Payload's Catalog global + Artwork overrides. We keep
// this loose because Payload's generated types can lag behind schema changes
// and these fields are stable enough to type by hand.
export type SizeRestriction = {
  productSlug?: string | null
  enabledSizes?: string[] | null
}

export type PricingMode = 'percent' | 'amount'

export type CatalogSettings = {
  enabledProducts?: string[] | null
  sizeRestrictions?: SizeRestriction[] | null
  pricingMode?: PricingMode | null
  defaultMarkup?: number | null
}

export type ArtworkOverrides = {
  overrideProducts?: boolean | null
  enabledProducts?: string[] | null
  overrideSizes?: boolean | null
  sizeRestrictions?: SizeRestriction[] | null
  overrideMarkup?: boolean | null
  pricingMode?: PricingMode | null
  markup?: number | null
}

type EffectiveMarkup = { mode: PricingMode; value: number }

function resolveMarkup(
  global: CatalogSettings | null | undefined,
  override: ArtworkOverrides | null | undefined,
): EffectiveMarkup {
  if (override?.overrideMarkup) {
    return {
      mode: override.pricingMode ?? 'percent',
      value: Math.max(0, override.markup ?? 0),
    }
  }
  return {
    mode: global?.pricingMode ?? 'percent',
    value: Math.max(0, global?.defaultMarkup ?? 0),
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100

function applyMarkup(
  template: PublicProductTemplate,
  markup: EffectiveMarkup,
): PublicProductTemplate {
  if (markup.value === 0) return template
  if (markup.mode === 'percent') {
    const factor = 1 + markup.value / 100
    return {
      ...template,
      basePrice: round2(template.basePrice * factor),
      optionGroups: template.optionGroups.map((g) => ({
        ...g,
        options: g.options.map((o) => ({
          ...o,
          priceModifierAmount: round2(o.priceModifierAmount * factor),
        })),
      })),
    }
  }
  // Flat amount: applied to the base price only; option modifiers stay at
  // their true incremental cost. The artist's margin per order is the flat
  // amount regardless of option choices.
  return { ...template, basePrice: round2(template.basePrice + markup.value) }
}

// Combine site-wide catalog defaults with per-artwork overrides into the
// effective filter that should apply to this artwork's product list.
function resolveSettings(
  global: CatalogSettings | null | undefined,
  override: ArtworkOverrides | null | undefined,
): CatalogSettings {
  const enabledProducts = override?.overrideProducts
    ? (override.enabledProducts ?? [])
    : (global?.enabledProducts ?? [])

  const sizeRestrictions = override?.overrideSizes
    ? (override.sizeRestrictions ?? [])
    : (global?.sizeRestrictions ?? [])

  return { enabledProducts, sizeRestrictions }
}

export function filterTemplates(
  templates: PublicProductTemplate[],
  global: CatalogSettings | null | undefined,
  override: ArtworkOverrides | null | undefined,
): PublicProductTemplate[] {
  const { enabledProducts, sizeRestrictions } = resolveSettings(global, override)
  const markup = resolveMarkup(global, override)

  const productAllowed = (slug: string) => {
    // Site-level empty = allow all. Artwork-level empty when override is on
    // means "no products" — but `resolveSettings` returns `[]` in both cases,
    // so we distinguish here using the override flag.
    if (override?.overrideProducts) {
      return (enabledProducts ?? []).includes(slug)
    }
    const list = enabledProducts ?? []
    return list.length === 0 || list.includes(slug)
  }

  return templates
    .filter((t) => productAllowed(t.slug))
    .map((t) => {
      const restriction = (sizeRestrictions ?? []).find(
        (r) => r.productSlug === t.slug,
      )
      if (!restriction) return t
      const allowedSizes = restriction.enabledSizes ?? []
      if (allowedSizes.length === 0) return t
      return {
        ...t,
        optionGroups: t.optionGroups.map((g) => {
          if (g.inputType !== 'size') return g
          return {
            ...g,
            options: g.options.filter((o) => allowedSizes.includes(o.value)),
          }
        }),
      }
    })
    // Drop any template whose size group ended up empty after filtering —
    // a product with zero buyable sizes is useless on the page.
    .filter((t) => {
      const sizeGroup = t.optionGroups.find((g) => g.inputType === 'size')
      return !sizeGroup || sizeGroup.options.length > 0
    })
    // Apply markup last so prices shown to customers reflect retail, not cost.
    .map((t) => applyMarkup(t, markup))
}
