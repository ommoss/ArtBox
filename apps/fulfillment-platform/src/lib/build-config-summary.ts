import type { BuilderConfiguration, BuilderSelection } from '@artbox/types'

// Build a human-readable summary string from an order line's configuration.
// Used by:
//   - The OrderLines beforeChange hook to populate `configurationSummary`
//     (a text field shown in the admin list view + detail page)
//   - The custom ConfigurationDisplay UI component
//   - Anywhere else staff need the build at a glance (packing slips, etc.)
//
// Format: "<Template name> · <option 1 label> · <option 2 label> · ..."
// Example: "Custom framed print · 16 × 20″ · Black oak · UV-protective glass"

// Priority order for displaying options. Lower number = earlier in the
// summary. Anything not listed defaults to the catch-all at the end.
// Tune this as the catalog grows — staff should see the most production-
// relevant choices first (size, primary material, then refinements).
const GROUP_PRIORITY: Record<string, number> = {
  size: 0,
  'frame-color': 1,
  'canvas-wrap': 1,
  'block-edge': 1,
  'pack-size': 1,
  'paper-type': 2,
  'canvas-edge-color': 2,
  'stretcher-depth': 3,
  mat: 4,
  'glass-type': 5,
}

// Selections matching these slugs are noisy or redundant and get filtered
// out of the summary entirely. Empty for now; placeholder for future
// internal-only groups.
const HIDDEN_GROUPS = new Set<string>([])

export function buildConfigSummary(
  templateName: string | null | undefined,
  config: BuilderConfiguration | null | undefined,
): string {
  const name = templateName?.trim() || 'Order line'
  if (!config || !Array.isArray(config.selections)) return name

  const visible: BuilderSelection[] = config.selections.filter(
    (s) => s && s.optionLabel && !HIDDEN_GROUPS.has(s.optionGroupSlug),
  )
  visible.sort(
    (a, b) =>
      (GROUP_PRIORITY[a.optionGroupSlug] ?? 99) -
      (GROUP_PRIORITY[b.optionGroupSlug] ?? 99),
  )
  if (visible.length === 0) return name

  return [name, ...visible.map((s) => s.optionLabel)].join(' · ')
}
