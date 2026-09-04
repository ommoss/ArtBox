'use client'

import * as React from 'react'

import type { BuilderStage, SelectionMap, V2Template } from './types'

// Builder state encoded in the URL querystring so a build is shareable and
// survives a page reload.
//
// Format:
//   ?t=<template-slug>
//   &stage=<format|size|customize>
//   &qty=<n>
//   &<group-slug>=<option-value>   (one entry per visible group)
//
// Reserved keys (`t`, `stage`, `qty`) cannot collide with option group slugs
// because group slugs come from the fulfillment platform and are validated
// there to be lowercase-hyphenated identifiers without those reserved names.
// If a group slug ever needed to collide, we'd prefix with `g.<slug>=...`.

const RESERVED = new Set(['t', 'stage', 'qty'])

export type BuilderUrlState = {
  templateSlug: string | null
  stage: BuilderStage | null
  quantity: number | null
  selectionValues: Record<string, string>
}

export function readBuilderUrlState(search: string): BuilderUrlState {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const templateSlug = params.get('t')
  const stageRaw = params.get('stage')
  const stage: BuilderStage | null =
    stageRaw === 'format' || stageRaw === 'size' || stageRaw === 'customize'
      ? stageRaw
      : null
  const qtyRaw = params.get('qty')
  const quantity = qtyRaw ? Math.max(1, parseInt(qtyRaw, 10) || 1) : null

  const selectionValues: Record<string, string> = {}
  params.forEach((value, key) => {
    if (RESERVED.has(key)) return
    if (typeof value === 'string' && value.length > 0) {
      selectionValues[key] = value
    }
  })
  return { templateSlug, stage, quantity, selectionValues }
}

export function buildBuilderQueryString(state: {
  templateSlug: string
  stage: BuilderStage
  quantity: number
  selections: SelectionMap
  template: V2Template
}): string {
  const params = new URLSearchParams()
  params.set('t', state.templateSlug)
  params.set('stage', state.stage)
  if (state.quantity !== 1) params.set('qty', String(state.quantity))
  // Only encode selections that belong to a group on the current template,
  // so the URL stays clean across template switches.
  const groupSlugs = new Set(state.template.optionGroups.map((g) => g.slug))
  for (const [groupSlug, opt] of Object.entries(state.selections)) {
    if (!groupSlugs.has(groupSlug)) continue
    if (RESERVED.has(groupSlug)) continue
    params.set(groupSlug, opt.value)
  }
  return params.toString()
}

// Hook that keeps the URL in sync with builder state. Uses replaceState so
// the back button doesn't fill up with every option click.
export function useSyncBuilderUrl({
  enabled,
  templateSlug,
  stage,
  quantity,
  selections,
  template,
}: {
  enabled: boolean
  templateSlug: string
  stage: BuilderStage
  quantity: number
  selections: SelectionMap
  template: V2Template | undefined
}) {
  React.useEffect(() => {
    if (!enabled) return
    if (!template) return
    if (typeof window === 'undefined') return
    const qs = buildBuilderQueryString({
      templateSlug,
      stage,
      quantity,
      selections,
      template,
    })
    const next = `${window.location.pathname}?${qs}${window.location.hash}`
    // Only replace if changed; avoids a no-op replaceState that some browsers
    // still record.
    if (window.location.search.slice(1) !== qs) {
      window.history.replaceState(window.history.state, '', next)
    }
  }, [enabled, templateSlug, stage, quantity, selections, template])
}

// Read once on mount, returns null if SSR. Caller is expected to feed this
// into ProductBuilderV3's `initialTemplateSlug` + `initialSelectionValues`
// props.
export function useInitialBuilderUrlState(): BuilderUrlState | null {
  const [state, setState] = React.useState<BuilderUrlState | null>(null)
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    setState(readBuilderUrlState(window.location.search))
  }, [])
  return state
}
