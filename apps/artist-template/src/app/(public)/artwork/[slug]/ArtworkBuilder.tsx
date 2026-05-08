'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { ProductBuilder } from '@artbox/ui'
import type { BuilderConfiguration, PublicProductTemplate } from '@artbox/types'

import { useCart } from '@/lib/cart-context'

type Props = {
  templates: PublicProductTemplate[]
  imageUrl: string
  imageTitle: string
  artworkSlug: string
}

export default function ArtworkBuilder({
  templates,
  imageUrl,
  imageTitle,
  artworkSlug,
}: Props) {
  const [activeSlug, setActiveSlug] = useState(templates[0]?.slug ?? '')
  const active = templates.find((t) => t.slug === activeSlug) ?? templates[0]
  const cart = useCart()
  const [toast, setToast] = useState<string | null>(null)
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  if (!active) {
    return (
      <div style={{ padding: 32, background: 'var(--color-surface)', borderRadius: 8 }}>
        <p style={{ color: 'var(--color-secondary)' }}>
          No products available yet. Connect this site to the Artbox fulfillment platform by setting{' '}
          <code>FULFILLMENT_API_URL</code> and <code>FULFILLMENT_API_KEY</code> in <code>.env</code>.
        </p>
      </div>
    )
  }

  const showToast = (msg: string) => {
    setToast(msg)
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4500)
  }

  const handleAddToCart = (_cfg: BuilderConfiguration, quantity: number) => {
    cart.addItem({
      artworkSlug,
      artworkTitle: imageTitle,
      imageUrl,
      templateSlug: active.slug,
      templateName: active.name,
      configuration: _cfg,
      quantity,
    })
    showToast(
      quantity === 1
        ? `Added to cart · ${active.name}`
        : `Added to cart · ${quantity} × ${active.name}`,
    )
  }

  return (
    <div>
      <style>{`
        .ab-tab {
          padding: 8px 14px;
          border: 1px solid var(--color-border);
          border-radius: 999px;
          cursor: pointer;
          font-size: 0.85rem;
          white-space: nowrap;
          transition: background 0.15s, border-color 0.15s;
          min-height: 36px;
        }
        .ab-tab:focus { outline: none; }
        .ab-tab:focus-visible {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }
        .ab-tab:hover { border-color: var(--color-primary); }
        .ab-tab--active {
          background: var(--color-primary);
          color: var(--color-bg);
          border-color: var(--color-primary);
        }
        .ab-tab--inactive {
          background: var(--color-surface);
          color: var(--color-primary);
        }
        .ab-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          padding: 16px 22px;
          background: var(--color-primary);
          color: var(--color-bg);
          border-radius: 8px;
          box-shadow: 0 20px 48px rgba(0,0,0,0.32), 0 0 0 1px rgba(255,255,255,0.06);
          z-index: 200;
          display: flex;
          gap: 16px;
          align-items: center;
          max-width: 380px;
          font-size: 0.95rem;
          animation: ab-toast-in 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.1);
        }
        .ab-toast-check {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--color-bg);
          color: var(--color-primary);
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 22px;
          font-weight: 700;
        }
        .ab-toast-link {
          color: var(--color-bg);
          border-bottom: 1px solid var(--color-bg);
          text-decoration: none;
          font-weight: 500;
          white-space: nowrap;
        }
        @keyframes ab-toast-in {
          0% { transform: translateY(20px) scale(0.96); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @media (max-width: 768px) {
          .ab-tab { min-height: 40px; padding: 9px 14px; }
          .ab-toast {
            bottom: 96px;
            left: 16px;
            right: 16px;
            max-width: none;
          }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        {templates.map((t) => {
          const isActive = t.slug === active.slug
          return (
            <button
              key={t.slug}
              type="button"
              onClick={() => setActiveSlug(t.slug)}
              className={`ab-tab ${isActive ? 'ab-tab--active' : 'ab-tab--inactive'}`}
            >
              {t.name}
            </button>
          )
        })}
      </div>

      <ProductBuilder
        template={active}
        imageUrl={imageUrl}
        imageTitle={imageTitle}
        onAddToCart={handleAddToCart}
      />

      {toast ? (
        <div className="ab-toast" role="status" aria-live="polite">
          <span className="ab-toast-check" aria-hidden>
            ✓
          </span>
          <span style={{ flex: 1 }}>{toast}</span>
          <Link href="/cart" className="ab-toast-link">
            View cart →
          </Link>
        </div>
      ) : null}
    </div>
  )
}
