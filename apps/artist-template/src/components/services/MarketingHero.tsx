import Image from 'next/image'

import { DEMO_LABELS, DEMO_PRESETS, siteUrl } from '@/lib/site'

import { mailto } from './services-content'

// Hero for the marketing root (mosseditions.com). Headline and two actions on
// the left; on the right, the top of each demo site as a captured screenshot
// (public/demo-shots/<preset>.webp, regenerated with scratch script
// demo-shots.js whenever the demos change) so a visitor sees what a site
// looks like, not just a photograph.

export default function MarketingHero() {
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
        <div className="mkt-hero__mosaic" aria-label="The four demo sites">
          {DEMO_PRESETS.map((preset, i) => (
            <a key={preset} href={siteUrl(preset)} className="mkt-hero__tile">
              <span className="mkt-hero__chrome" aria-hidden>
                <i />
                <i />
                <i />
              </span>
              <span className="mkt-hero__shot">
                <Image
                  src={`/demo-shots/${preset}.webp`}
                  alt={`${DEMO_LABELS[preset].label} demo site`}
                  fill
                  sizes="(max-width: 900px) 50vw, 25vw"
                  style={{ objectFit: 'cover', objectPosition: 'top' }}
                  priority={i < 2}
                />
              </span>
              <span className="mkt-hero__tile-label">{DEMO_LABELS[preset].label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
