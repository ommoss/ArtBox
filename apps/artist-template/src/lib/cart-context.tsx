'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import type { BuilderConfiguration } from '@artbox/types'

export type CartItem = {
  id: string
  artworkSlug: string
  artworkTitle: string
  imageUrl: string
  templateSlug: string
  templateName: string
  configuration: BuilderConfiguration
  quantity: number
}

type CartState = {
  items: CartItem[]
  itemCount: number
  subtotal: number
  hydrated: boolean
  addItem: (item: Omit<CartItem, 'id'>) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clear: () => void
}

const CartContext = createContext<CartState | null>(null)

const STORAGE_KEY = 'artbox-artist-cart-v1'

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from sessionStorage after mount.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[]
        if (Array.isArray(parsed)) setItems(parsed)
      }
    } catch {
      // ignore
    }
    setHydrated(true)
  }, [])

  // Persist on change (only after hydration so we don't blow away saved cart).
  useEffect(() => {
    if (!hydrated) return
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore
    }
  }, [items, hydrated])

  const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
    setItems((prev) => [...prev, { ...item, id: makeId() }])
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item,
      ),
    )
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<CartState>(() => {
    const itemCount = items.reduce((acc, i) => acc + i.quantity, 0)
    const subtotal =
      Math.round(
        items.reduce((acc, i) => acc + i.configuration.unitPrice * i.quantity, 0) *
          100,
      ) / 100
    return {
      items,
      itemCount,
      subtotal,
      hydrated,
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }
  }, [items, hydrated, addItem, updateQuantity, removeItem, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartState {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return ctx
}
