'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { ProductBuilderV3 } from '@artbox/ui'
import type { BuilderConfiguration, PublicProductTemplate } from '@artbox/types'

import { useCart } from '@/lib/cart-context'

type Props = {
  templates: PublicProductTemplate[]
  imageUrl: string
  imageTitle: string
  artworkSlug: string
  soldOut?: boolean
}

export default function ArtworkBuilder({
  templates,
  imageUrl,
  imageTitle,
  artworkSlug,
  soldOut = false,
}: Props) {
  const cart = useCart()
  const [toast, setToast] = useState<string | null>(null)
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  if (soldOut) {
    return (
      <div
        style={{
          padding: 32,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          textAlign: 'center',
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: '1.4rem', fontWeight: 500 }}>
          This edition is sold out.
        </h2>
        <p style={{ color: 'var(--color-secondary)', maxWidth: 480, margin: '12px auto 0' }}>
          All copies of this limited edition have been claimed. Browse other works
          in the gallery or get in touch about future releases.
        </p>
      </div>
    )
  }

  if (templates.length === 0) {
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

  const handleAddToCart = (cfg: BuilderConfiguration, quantity: number) => {
    // V3 picks the template internally via its Format stage, so we look it
    // up from the configuration's templateSlug to recover the display name.
    const template = templates.find((t) => t.slug === cfg.templateSlug)
    const templateName = template?.name ?? cfg.templateSlug
    cart.addItem({
      artworkSlug,
      artworkTitle: imageTitle,
      imageUrl,
      templateSlug: cfg.templateSlug,
      templateName,
      configuration: cfg,
      quantity,
    })
    showToast(
      quantity === 1
        ? `Added to cart · ${templateName}`
        : `Added to cart · ${quantity} × ${templateName}`,
    )
  }

  return (
    <div>
      <style>{`
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
          .ab-toast {
            bottom: 96px;
            left: 16px;
            right: 16px;
            max-width: none;
          }
        }
      `}</style>

      <ProductBuilderV3
        templates={templates}
        imageUrl={imageUrl}
        imageTitle={imageTitle}
        useStageFlow={true}
        // Shareable build URLs (?t=…&size=…) on the artwork page only; the
        // builder defaults to no URL sync so embeds don't rewrite the path.
        syncUrl={true}
        recommendedSelections={{ size: '16x20' }}
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
