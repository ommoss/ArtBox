import Link from 'next/link'

// Shown only when NEXT_PUBLIC_IS_DEMO=true (the genre showcase deployments).
// Real artist sites never render it.
export default function DemoBanner({ href = '/#how-it-works' }: { href?: string }) {
  return (
    <div className="demo-banner">
      <span className="demo-banner__text">
        Sample artist site — built on the Moss Editions platform
      </span>
      <Link href={href} className="demo-banner__cta">
        See how it works →
      </Link>
    </div>
  )
}
