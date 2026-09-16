import Link from 'next/link'
import { notFound } from 'next/navigation'

import { legalDocs } from '@/content/legal'
import { getTheme, resolveSite } from '@/lib/site'

export const dynamicParams = false

export function generateStaticParams() {
  return legalDocs.map((d) => ({ legal: d.slug }))
}

type Args = { params: Promise<{ site: string; legal: string }> }

export async function generateMetadata({ params }: Args) {
  const { legal } = await params
  const doc = legalDocs.find((d) => d.slug === legal)
  return doc ? { title: doc.title, description: doc.summary } : {}
}

// Privacy, terms, shipping & returns. The copy lives in src/content/legal.tsx;
// this page substitutes the operator names for the current site.
export default async function LegalPage({ params }: Args) {
  const { site: siteParam, legal } = await params
  const doc = legalDocs.find((d) => d.slug === legal)
  if (!doc) notFound()
  const site = resolveSite(siteParam)
  const theme = getTheme(site)

  const ctx = {
    siteName: theme.artistName,
    platform: 'Moss Editions',
    producer: 'Artbox Printing',
    producerCity: 'Victoria, BC',
    contactEmail: site.kind === 'artist' ? 'the address on the contact page' : 'admin@mosseditions.com',
    updated: 'September 2026',
  }

  return (
    <section className="legal">
      <style>{`
        .legal { max-width: 720px; margin: 0 auto; padding: 56px var(--page-padding) 32px; line-height: 1.65; }
        .legal h1 { font-family: var(--font-heading); font-weight: var(--weight-heading); letter-spacing: var(--tracking-heading); font-size: 2rem; margin: 0 0 6px; }
        .legal .legal-summary { color: var(--color-secondary); margin: 0 0 32px; }
        .legal h2 { font-family: var(--font-heading); font-weight: var(--weight-heading); letter-spacing: var(--tracking-heading); font-size: 1.15rem; margin: 32px 0 8px; }
        .legal p { margin: 0 0 12px; }
        .legal ul { padding-left: 22px; margin: 0 0 12px; }
        .legal li { margin-bottom: 8px; }
        .legal .legal-updated { margin-top: 32px; color: var(--color-secondary); font-size: 0.85rem; }
        .legal-nav { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--color-border); font-size: 0.9rem; }
        .legal-nav a { color: var(--color-secondary); text-decoration: none; }
        .legal-nav a[aria-current] { color: var(--color-primary); border-bottom: 1px solid var(--color-primary); }
      `}</style>
      <h1>{doc.title}</h1>
      <p className="legal-summary">{doc.summary}</p>
      {doc.body(ctx)}
      <nav className="legal-nav" aria-label="Legal pages">
        {legalDocs.map((d) => (
          <Link key={d.slug} href={`/${d.slug}`} aria-current={d.slug === doc.slug ? 'page' : undefined}>
            {d.title}
          </Link>
        ))}
      </nav>
    </section>
  )
}
