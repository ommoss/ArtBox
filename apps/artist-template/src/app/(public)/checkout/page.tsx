'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { useCart } from '@/lib/cart-context'
import { submitMockOrder } from '@/lib/order-actions'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n)

const SHIPPING = 15
const TAX_RATE = 0.05

export default function CheckoutPage() {
  const { items, subtotal, hydrated, clear } = useCart()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const tax = Math.round(subtotal * TAX_RATE * 100) / 100
  const total = Math.round((subtotal + SHIPPING + tax) * 100) / 100

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)

    const customer = {
      name: String(fd.get('name') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      phone: String(fd.get('phone') || '').trim() || undefined,
    }
    const shippingAddress = {
      line1: String(fd.get('line1') || '').trim(),
      line2: String(fd.get('line2') || '').trim() || undefined,
      city: String(fd.get('city') || '').trim(),
      region: String(fd.get('region') || '').trim(),
      postalCode: String(fd.get('postalCode') || '').trim(),
      country: String(fd.get('country') || '').trim(),
    }

    startTransition(async () => {
      const result = await submitMockOrder({ customer, shippingAddress, items })
      if (!result.ok) {
        setError(result.error)
        return
      }
      const params = new URLSearchParams({
        ref: result.externalOrderId,
        orderId: String(result.orderId),
      })
      clear()
      router.push(`/order/confirmation?${params.toString()}`)
    })
  }

  if (hydrated && items.length === 0) {
    return (
      <section style={{ padding: '48px 32px', maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 500 }}>Checkout</h1>
        <p style={{ color: 'var(--color-secondary)' }}>Your cart is empty.</p>
        <Link href="/gallery" style={{ color: 'var(--color-primary)' }}>
          Browse galleries →
        </Link>
      </section>
    )
  }

  return (
    <section className="checkout-grid">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 500, marginTop: 0 }}>Checkout</h1>

        <fieldset style={fieldset}>
          <legend style={legend}>Contact</legend>
          <Field label="Full name" name="name" required />
          <Field label="Email" name="email" type="email" required />
          <Field label="Phone (optional)" name="phone" />
        </fieldset>

        <fieldset style={fieldset}>
          <legend style={legend}>Shipping address</legend>
          <Field label="Address line 1" name="line1" required />
          <Field label="Address line 2" name="line2" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="City" name="city" required />
            <Field label="Province / State" name="region" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Postal / ZIP" name="postalCode" required />
            <Field label="Country" name="country" defaultValue="Canada" required />
          </div>
        </fieldset>

        <div
          style={{
            padding: 16,
            background: '#fff7e6',
            border: '1px solid #f1c97e',
            borderRadius: 4,
            fontSize: '0.9rem',
            color: '#7a5a14',
          }}
        >
          <strong>Mock checkout.</strong> No payment is captured. Clicking below will record a
          test order in the Artbox fulfillment dashboard.
        </div>

        {error ? (
          <div
            style={{
              padding: 16,
              background: '#fdecea',
              border: '1px solid #e3848a',
              borderRadius: 4,
              color: '#9b1f24',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          style={{
            padding: '14px 20px',
            background: pending ? 'var(--color-secondary)' : 'var(--color-primary)',
            color: 'var(--color-bg)',
            border: 'none',
            borderRadius: 4,
            cursor: pending ? 'wait' : 'pointer',
            fontSize: '1rem',
          }}
        >
          {pending ? 'Submitting…' : `Place order (mock) · ${fmt(total)}`}
        </button>
      </form>

      <aside>
        <h2 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
          Order summary
        </h2>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 4, padding: 16 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                gap: 12,
                padding: '8px 0',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  overflow: 'hidden',
                  flex: '0 0 48px',
                }}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.artworkTitle}
                  fill
                  sizes="48px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div style={{ flex: 1, fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 500 }}>{item.artworkTitle}</div>
                <div style={{ color: 'var(--color-secondary)' }}>
                  {item.templateName} × {item.quantity}
                </div>
              </div>
              <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                {fmt(item.configuration.unitPrice * item.quantity)}
              </div>
            </div>
          ))}
          <Row label="Subtotal" value={fmt(subtotal)} />
          <Row label="Shipping" value={fmt(SHIPPING)} />
          <Row label="Tax (5% est.)" value={fmt(tax)} />
          <Row label="Total" value={fmt(total)} bold />
        </div>
      </aside>
    </section>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  defaultValue?: string
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.85rem', color: 'var(--color-secondary)' }}>
      {label}
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        style={{
          padding: '8px 10px',
          border: '1px solid var(--color-border)',
          borderRadius: 4,
          fontSize: '1rem',
          background: 'var(--color-surface)',
          color: 'var(--color-primary)',
        }}
      />
    </label>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '6px 0',
        fontWeight: bold ? 600 : 400,
        fontSize: bold ? '1rem' : '0.9rem',
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

const fieldset: React.CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: 4,
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
}
const legend: React.CSSProperties = { padding: '0 8px', fontSize: '0.85rem', color: 'var(--color-secondary)' }
