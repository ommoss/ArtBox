import Link from 'next/link'

type Args = { searchParams: Promise<{ ref?: string; orderId?: string }> }

export default async function OrderConfirmation({ searchParams }: Args) {
  const { ref, orderId } = await searchParams

  return (
    <section style={{ padding: '64px 32px', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#1a7f46',
          color: '#fff',
          fontSize: '1.5rem',
          margin: '0 auto 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-hidden
      >
        ✓
      </div>

      <h1 style={{ fontSize: '1.8rem', fontWeight: 500, marginTop: 0 }}>Order received</h1>

      {ref ? (
        <p style={{ color: 'var(--color-primary)', fontSize: '1rem' }}>
          Reference: <code style={{ background: 'var(--color-surface)', padding: '2px 6px', borderRadius: 3, border: '1px solid var(--color-border)' }}>{ref}</code>
        </p>
      ) : null}

      <p style={{ color: 'var(--color-secondary)', maxWidth: 520, margin: '16px auto 0', lineHeight: 1.6 }}>
        Thanks — the Artbox team has been notified and will begin production shortly. You&apos;ll
        get an email when it ships.
      </p>

      <p style={{ color: 'var(--color-secondary)', fontSize: '0.85rem', marginTop: 8 }}>
        (Mock order. No payment was captured.{orderId ? ` Internal order id: ${orderId}.` : ''})
      </p>

      <Link
        href="/gallery"
        style={{
          display: 'inline-block',
          marginTop: 32,
          padding: '10px 18px',
          background: 'var(--color-primary)',
          color: 'var(--color-bg)',
          textDecoration: 'none',
          borderRadius: 4,
        }}
      >
        Continue browsing
      </Link>
    </section>
  )
}
