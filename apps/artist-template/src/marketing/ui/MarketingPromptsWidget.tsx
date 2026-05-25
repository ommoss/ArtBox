import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

import { fetchEntitlements } from '@/lib/fulfillment-client'

import MarketingPromptCard, { type PromptSummary } from './MarketingPromptCard'
import MarketingRunTriggersButton from './MarketingRunTriggersButton'

// Surfaces on the Payload admin dashboard via admin.components.beforeDashboard.
// Server component — checks entitlement, queries active prompts, renders the
// list. Per-card interactions hand off to the client components.
export default async function MarketingPromptsWidget() {
  const entitlements = await fetchEntitlements().catch(() => null)
  if (!entitlements?.marketingEnabled) {
    return <NotEnabledEmptyState />
  }

  const payload = await getPayload({ config })
  const prompts = await payload.find({
    collection: 'marketing-prompts',
    where: { status: { in: ['active', 'snoozed'] } },
    sort: ['-urgency', '-createdAt'],
    limit: 10,
    depth: 0,
  })

  return (
    <section
      style={{
        margin: '0 0 24px 0',
        padding: 20,
        background: '#fff',
        border: '1px solid #e6e6e6',
        borderRadius: 8,
        fontFamily:
          '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: '#222',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 16,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#222' }}>Marketing prompts</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#666' }}>
            Nudges generated from your catalog and orders. Draft a post, mark done, or snooze.
          </p>
        </div>
        <Link
          href="/admin/collections/marketing-prompts"
          style={{ fontSize: '0.85rem', color: '#1a1a1a' }}
        >
          View all →
        </Link>
      </header>

      {prompts.docs.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          {prompts.docs.map((p) => (
            <MarketingPromptCard
              key={p.id}
              prompt={
                {
                  id: p.id,
                  title: p.title as string,
                  body: (p as { body?: string }).body,
                  kind: p.kind,
                  status: p.status,
                  urgency: p.urgency,
                  draftCopy: (p as { draftCopy?: string }).draftCopy,
                  socialTarget: (p as { socialTarget?: string }).socialTarget,
                  createdAt: p.createdAt as string,
                } as PromptSummary
              }
            />
          ))}
        </div>
      )}

      <MarketingRunTriggersButton />
    </section>
  )
}

function EmptyState() {
  return (
    <div
      style={{
        padding: '24px 16px',
        textAlign: 'center',
        color: '#888',
        fontSize: '0.9rem',
        background: '#fafafa',
        border: '1px dashed #ddd',
        borderRadius: 4,
      }}
    >
      No active prompts. The trigger engine fires on a schedule; or click
      &ldquo;Run triggers now&rdquo; below to evaluate immediately.
    </div>
  )
}

function NotEnabledEmptyState() {
  return (
    <section
      style={{
        margin: '0 0 24px 0',
        padding: 16,
        background: '#fafafa',
        border: '1px dashed #ddd',
        borderRadius: 8,
        fontSize: '0.9rem',
        color: '#666',
        fontFamily:
          '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <strong style={{ color: '#222' }}>Marketing module:</strong> not enabled for this artist.{' '}
      Contact Artbox to turn it on.
    </section>
  )
}
