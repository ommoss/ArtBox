import Link from 'next/link'

import { themeLinks, getTheme } from '@/lib/themes'

// /about-the-demo lives on every artist-template deployment. When the
// site is in demo mode (NEXT_PUBLIC_IS_DEMO=true), the top banner links
// here. Visitors get the "what is this?" pitch + a contact CTA.
//
// Real artist sites still have this page accessible (it's harmless), but
// no banner links to it.

export const metadata = {
  title: 'About this demo — Artbox platform',
}

export default function AboutTheDemoPage() {
  const theme = getTheme()

  return (
    <section
      style={{
        padding: '48px 24px',
        maxWidth: 760,
        margin: '0 auto',
        lineHeight: 1.65,
      }}
    >
      <style>{`
        .about-h1 {
          font-family: var(--font-heading);
          font-weight: var(--weight-heading);
          letter-spacing: var(--tracking-heading);
          font-size: 2rem;
          margin: 0 0 8px;
        }
        .about-sub {
          color: var(--color-secondary);
          font-size: 1.05rem;
          margin: 0 0 32px;
        }
        .about-section {
          margin-top: 40px;
        }
        .about-h2 {
          font-family: var(--font-heading);
          font-weight: var(--weight-heading);
          letter-spacing: var(--tracking-heading);
          font-size: 1.3rem;
          margin: 0 0 12px;
        }
        .about-list {
          padding-left: 22px;
          margin: 0 0 16px;
        }
        .about-list li {
          margin-bottom: 6px;
        }
        .about-themes {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-top: 16px;
        }
        .about-theme-card {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 14px 16px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          text-decoration: none;
          color: var(--color-primary);
          background: var(--color-surface);
          transition: border-color 0.15s, transform 0.1s;
        }
        .about-theme-card:hover {
          border-color: var(--color-primary);
          transform: translateY(-1px);
        }
        .about-theme-card--active {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 1px var(--color-primary);
        }
        .about-theme-name {
          font-weight: 600;
          font-size: 0.95rem;
        }
        .about-theme-tagline {
          font-size: 0.82rem;
          color: var(--color-secondary);
        }
        .about-cta {
          display: inline-block;
          margin-top: 12px;
          padding: 12px 22px;
          background: var(--color-primary);
          color: var(--color-bg);
          text-decoration: none;
          border-radius: 4px;
          font-weight: 600;
        }
        .about-cta:hover { opacity: 0.92; }
        .about-secondary-link {
          display: inline-block;
          margin-left: 8px;
          color: var(--color-secondary);
          text-decoration: underline;
          font-size: 0.9rem;
        }
      `}</style>

      <h1 className="about-h1">About this demo</h1>
      <p className="about-sub">
        This is a sample site built on the Artbox artist platform. The
        artwork and artist name on this deployment are placeholders —
        real artists get the same setup, customised to their work, their
        brand, and their pricing.
      </p>

      <div className="about-section">
        <h2 className="about-h2">What&apos;s included</h2>
        <ul className="about-list">
          <li>Public gallery — organise your work into series</li>
          <li>Per-artwork product builder with a 3D preview (frames, canvas, paper prints, more)</li>
          <li>Choose which sizes and orientations each piece is offered in</li>
          <li>Built-in cart and checkout with credit card payment via Helcim</li>
          <li>Print production handled by Artbox Printing in Victoria, BC — no inventory, no shipping logistics on your side</li>
          <li>Multiple visual themes you can pick from (and swap later)</li>
        </ul>
      </div>

      <div className="about-section">
        <h2 className="about-h2">Pick a look for your site</h2>
        <p style={{ color: 'var(--color-secondary)', margin: '0 0 8px' }}>
          The same demo content rendered in each theme. Yours can use any
          of these (or a custom variation):
        </p>
        <div className="about-themes">
          {themeLinks.map((link) => {
            const isActive = link.preset === theme.preset
            return (
              <a
                key={link.preset}
                href={link.url}
                className={`about-theme-card ${isActive ? 'about-theme-card--active' : ''}`}
              >
                <span className="about-theme-name">{link.label}</span>
                <span className="about-theme-tagline">{link.tagline}</span>
                {isActive ? (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--color-accent)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginTop: 4,
                    }}
                  >
                    You are here
                  </span>
                ) : null}
              </a>
            )
          })}
        </div>
      </div>

      <div className="about-section">
        <h2 className="about-h2">How pricing works</h2>
        <p style={{ margin: '0 0 12px' }}>
          You pay a flat platform fee for the site, plus Artbox&apos;s
          per-order production cost on whatever sells. You set your own
          markup on top of the production cost — that&apos;s your margin
          on each sale. No commission, no per-month variable fee.
        </p>
        <p style={{ margin: 0, color: 'var(--color-secondary)', fontSize: '0.9rem' }}>
          Exact pricing depends on what products you offer and your image
          prep needs — get in touch for a quote.
        </p>
      </div>

      <div className="about-section">
        <h2 className="about-h2">Get your own site</h2>
        <p style={{ margin: '0 0 8px' }}>
          Email us with a link to your portfolio (Instagram, an existing
          site, or a Dropbox of work). We&apos;ll come back with a draft
          deployment for you to review before any commitment.
        </p>
        <a className="about-cta" href="mailto:admin@artboxprinting.com?subject=Artbox%20artist%20site%20inquiry">
          Email admin@artboxprinting.com
        </a>
        <Link href="/" className="about-secondary-link">
          Back to the demo
        </Link>
      </div>
    </section>
  )
}
