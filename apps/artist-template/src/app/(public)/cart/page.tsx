'use client'

import Link from 'next/link'

import { useCart } from '@/lib/cart-context'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n)

export default function CartPage() {
  const { items, subtotal, hydrated, updateQuantity, removeItem } = useCart()

  return (
    <section style={{ padding: '48px 32px', maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 500, marginTop: 0 }}>Cart</h1>

      {!hydrated ? (
        <p style={{ color: 'var(--color-secondary)' }}>Loading cart…</p>
      ) : items.length === 0 ? (
        <div style={{ padding: '48px 0', color: 'var(--color-secondary)' }}>
          <p>Your cart is empty.</p>
          <Link href="/gallery" style={{ color: 'var(--color-primary)' }}>
            Browse galleries →
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {items.map((item) => {
              const lineTotal = item.configuration.unitPrice * item.quantity
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '88px 1fr auto',
                    gap: 16,
                    alignItems: 'center',
                    padding: 16,
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 4,
                  }}
                >
                  <div
                    style={{
                      width: 88,
                      height: 88,
                      backgroundImage: `url(${item.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: 2,
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 500 }}>{item.artworkTitle}</div>
                    <div style={{ color: 'var(--color-secondary)', fontSize: '0.9rem', marginTop: 2 }}>
                      {item.templateName}
                    </div>
                    <ul
                      style={{
                        margin: '6px 0 0',
                        padding: 0,
                        listStyle: 'none',
                        fontSize: '0.8rem',
                        color: 'var(--color-secondary)',
                      }}
                    >
                      {item.configuration.selections.map((sel) => (
                        <li key={sel.optionGroupSlug}>{sel.optionLabel}</li>
                      ))}
                    </ul>
                    <div
                      style={{
                        marginTop: 8,
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                      }}
                    >
                      <label style={{ fontSize: '0.8rem', color: 'var(--color-secondary)' }}>Qty</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.id,
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        style={{
                          width: 56,
                          padding: '4px 6px',
                          border: '1px solid var(--color-border)',
                          borderRadius: 4,
                          background: 'var(--color-surface)',
                          color: 'var(--color-primary)',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#c33',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 600 }}>
                    {fmt(lineTotal)}
                  </div>
                </div>
              )
            })}
          </div>

          <div
            style={{
              marginTop: 32,
              padding: 20,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 4,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.95rem',
              }}
            >
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
            <p style={{ color: 'var(--color-secondary)', fontSize: '0.85rem', marginTop: 8 }}>
              Shipping and tax calculated at checkout.
            </p>
            <Link
              href="/checkout"
              style={{
                display: 'block',
                marginTop: 16,
                padding: '14px 20px',
                background: 'var(--color-primary)',
                color: 'var(--color-bg)',
                textDecoration: 'none',
                borderRadius: 4,
                textAlign: 'center' as const,
                fontSize: '1rem',
              }}
            >
              Continue to checkout →
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
