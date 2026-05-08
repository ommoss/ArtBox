'use client'

import Link from 'next/link'

import { useCart } from '@/lib/cart-context'

export default function CartButton({ color }: { color: string }) {
  const { itemCount, hydrated } = useCart()
  return (
    <Link
      href="/cart"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color,
        textDecoration: 'none',
        fontSize: '0.95rem',
      }}
    >
      Cart
      {hydrated && itemCount > 0 ? (
        <span
          style={{
            background: color,
            color: '#fff',
            borderRadius: 999,
            padding: '2px 8px',
            fontSize: '0.75rem',
            fontWeight: 600,
            lineHeight: 1.2,
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
