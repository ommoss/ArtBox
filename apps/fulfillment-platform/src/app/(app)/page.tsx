import Link from 'next/link'

export default function Page() {
  return (
    <main
      style={{
        maxWidth: 640,
        margin: '6rem auto',
        padding: '0 2rem',
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
        Artbox Fulfillment Platform
      </h1>
      <p style={{ color: '#555', marginBottom: '1.5rem' }}>
        Internal ops dashboard for routing artist orders through Artbox
        Printing&apos;s production line.
      </p>
      <Link
        href="/admin"
        style={{
          display: 'inline-block',
          padding: '0.6rem 1rem',
          background: '#111',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: 4,
        }}
      >
        Open admin →
      </Link>
    </main>
  )
}
