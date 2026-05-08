'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

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
  const router = useRouter()

  if (!active) {
    return (
      <div style={{ padding: 32, background: '#fff', borderRadius: 8 }}>
        <p style={{ color: '#888' }}>
          No products available yet. Connect this site to the Artbox fulfillment platform by setting{' '}
          <code>FULFILLMENT_API_URL</code> and <code>FULFILLMENT_API_KEY</code> in <code>.env</code>.
        </p>
      </div>
    )
  }

  const handleAddToCart = (cfg: BuilderConfiguration, quantity: number) => {
    cart.addItem({
      artworkSlug,
      artworkTitle: imageTitle,
      imageUrl,
      templateSlug: active.slug,
      templateName: active.name,
      configuration: cfg,
      quantity,
    })
    router.push('/cart')
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        {templates.map((t) => (
          <button
            key={t.slug}
            type="button"
            onClick={() => setActiveSlug(t.slug)}
            style={{
              padding: '8px 14px',
              background: t.slug === active.slug ? '#111' : '#fff',
              color: t.slug === active.slug ? '#fff' : '#333',
              border: '1px solid #ddd',
              borderRadius: 999,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            {t.name}
          </button>
        ))}
      </div>

      <ProductBuilder
        template={active}
        imageUrl={imageUrl}
        imageTitle={imageTitle}
        onAddToCart={handleAddToCart}
      />
    </div>
  )
}
