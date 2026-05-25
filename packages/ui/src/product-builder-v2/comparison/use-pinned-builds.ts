'use client'

import * as React from 'react'

import type { SavedBuild } from '../types'

// Persists pinned builds in sessionStorage so they survive page reloads but
// clear with the tab. Cross-tab sharing happens via the shareable URL, not
// via storage syncing.
const STORAGE_KEY = 'artbox-builder-v2-pinned-v1'
const MAX_PINNED = 4

export function usePinnedBuilds() {
  const [pinned, setPinned] = React.useState<SavedBuild[]>([])
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as SavedBuild[]
        if (Array.isArray(parsed)) setPinned(parsed.slice(0, MAX_PINNED))
      }
    } catch {
      // ignore
    }
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!hydrated) return
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pinned))
    } catch {
      // ignore
    }
  }, [pinned, hydrated])

  const add = React.useCallback((build: Omit<SavedBuild, 'id' | 'createdAt'>) => {
    setPinned((prev) => {
      const next: SavedBuild = {
        ...build,
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: Date.now(),
      }
      // Cap at MAX_PINNED — drop the oldest if full.
      const trimmed = prev.length >= MAX_PINNED ? prev.slice(1) : prev
      return [...trimmed, next]
    })
  }, [])

  const remove = React.useCallback((id: string) => {
    setPinned((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const clear = React.useCallback(() => setPinned([]), [])

  return { pinned, add, remove, clear, hydrated, capacity: MAX_PINNED }
}
