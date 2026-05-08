import config from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { ProductBuilder } from '@artbox/ui'
import { loadPublicTemplate, loadPublicTemplates } from '@/lib/template-resolver'

const SAMPLE_IMAGE =
  'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&w=1600&q=80'

type Args = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ image?: string; title?: string }>
}

export default async function BuilderPage({ params, searchParams }: Args) {
  const { slug } = await params
  const { image, title } = await searchParams

  const payload = await getPayload({ config })
  const template = await loadPublicTemplate(payload, slug)
  if (!template) notFound()

  const allTemplates = await loadPublicTemplates(payload)
  const imageUrl = image || SAMPLE_IMAGE
  const imageTitle = title || 'Sample image'

  return (
    <main style={{ padding: '32px 24px 64px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Home
        </Link>
        <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {allTemplates.map((t) => (
            <Link
              key={t.slug}
              href={`/builder/${t.slug}${image ? `?image=${encodeURIComponent(image)}` : ''}`}
              style={{
                padding: '6px 12px',
                background: t.slug === slug ? '#111' : '#fff',
                color: t.slug === slug ? '#fff' : '#333',
                border: '1px solid #ddd',
                borderRadius: 4,
                textDecoration: 'none',
                fontSize: '0.85rem',
              }}
            >
              {t.name}
            </Link>
          ))}
        </nav>
      </div>

      <ProductBuilder template={template} imageUrl={imageUrl} imageTitle={imageTitle} />

      <p style={{ color: '#888', fontSize: '0.8rem', textAlign: 'center', marginTop: 24 }}>
        Preview tool. Pass <code>?image=&lt;url&gt;&amp;title=&lt;text&gt;</code> in the URL to swap the
        sample image.
      </p>
    </main>
  )
}
