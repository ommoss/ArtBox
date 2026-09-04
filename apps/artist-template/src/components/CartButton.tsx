'use client'

import Link from 'next/link'

import { useCart } from '@/lib/cart-context'

// Inherits the header's current text colour so it stays legible when the
// glass header switches to white chrome over a hero.
export default function CartButton() {
  const { itemCount, hydrated } = useCart()
  return (
    <Link
      href="/cart"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color: 'inherit',
        textDecoration: 'none',
        fontSize: '0.95rem',
      }}
    >
      Cart
      {hydrated && itemCount > 0 ? (
        <span
          style={{
            border: '1px solid currentColor',
            color: 'inherit',
            borderRadius: 999,
            padding: '1px 8px',
            fontSize: '0.75rem',
            fontWeight: 600,
            lineHeight: 1.3,
            minWidth: 18,
            textAlign: 'center' as const,
          }}
        >
          {itemCount}
        </span>
      ) : null}
    </Link>
  )
}
