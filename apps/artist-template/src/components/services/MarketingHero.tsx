import Image from 'next/image'

import { DEMO_LABELS, siteUrl } from '@/lib/site'

import { mailto } from './services-content'

// Hero for the marketing root (mosseditions.com). Headline and two actions on
// the left, the four demo looks as a clickable mosaic on the right. Dark
// ground so the glass header rides over it in white chrome.

export type DemoCover = { preset: string; imageUrl: string | null }

export default function MarketingHero({ covers }: { covers: DemoCover[] }) {
  return (
    <section className="mkt-hero">
      <div className="mkt-hero__inner">
        <div className="mkt-hero__copy">
          <span className="mkt-hero__kicker">Moss Editions · Victoria, BC</span>
          <h1 className="mkt-hero__title">Sell your photography as prints. We handle the rest.</h1>
          <p className="mkt-hero__lede">
            A print shop website built around your work, with every order printed, framed, packed
            and shipped by Artbox Printing. No inventory. No packing tape. You set the prices.
          </p>
          <div className="mkt-hero__actions">
            <a className="svc-btn svc-btn--light" href="#looks">
              See the demo sites
            </a>
            <a className="svc-btn svc-btn--outline" href={mailto('Moss Editions artist site inquiry')}>
              Email us
            </a>
          </div>
        </div>
        <div className="mkt-hero__mosaic" aria-label="The four demo looks">
          {covers.map((c) => (
            <a key={c.preset} href={siteUrl(c.preset)} className="mkt-hero__tile">
              {c.imageUrl ? (
                <Image src={c.imageUrl} alt="" fill sizes="(max-width: 900px) 50vw, 25vw" style={{ objectFit: 'cover' }} priority />
              ) : null}
              <span className="mkt-hero__tile-label">{DEMO_LABELS[c.preset]?.label ?? c.preset}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
