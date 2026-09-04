import Image from 'next/image'
import Link from 'next/link'

import { themeLinks, themes, type Theme } from '@/lib/themes'

import DemoBuilder from './DemoBuilder'
import {
  CONTACT_EMAIL,
  FULFILMENT_CITY,
  FULFILMENT_PARTNER,
  PLATFORM_NAME,
  mailto,
  pricingBuild,
  pricingFootnotes,
  pricingTiers,
  products,
  proofPoints,
  steps,
} from './services-content'

import './services.css'

// The demo deployments' home page below the hero: what the platform is, what
// fulfilment covers, how it works, the live builder, the other looks, pricing,
// and a contact CTA. Real artist sites never render this (see page.tsx).

export type GalleryCard = {
  id: string | number
  slug: string
  name: string
  description?: string | null
  coverImageUrl?: string | null
}

export default function ServicesHome({
  theme,
  galleries,
  builderImageUrl,
  builderImageTitle,
}: {
  theme: Theme
  galleries: GalleryCard[]
  builderImageUrl: string
  builderImageTitle: string
}) {
  return (
    <div className="svc">
      <section className="svc-intro" id="services">
        <div>
          <span className="svc-kicker">A sample site by {PLATFORM_NAME}</span>
          <h2 className="svc-intro__title">
            A print shop for your photography, with the printing, framing and shipping already
            handled.
          </h2>
          <p className="svc-lede">
            {PLATFORM_NAME} builds and runs websites for photographers who want to sell prints
            without running a print business. Every order is produced by {FULFILMENT_PARTNER} in{' '}
            {FULFILMENT_CITY}. The galleries and the artist on this page are placeholders; the site
            around them is the real thing.
          </p>
        </div>
        <ul className="svc-proof">
          {proofPoints.map((p) => (
            <li key={p.title}>
              <strong>{p.title}</strong>
              <span>{p.body}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="svc-fulfil" id="fulfilment">
        <div className="svc-fulfil__copy">
          <span className="svc-kicker">Fulfilment included</span>
          <h2 className="svc-h2">Sell prints. Never pack a box.</h2>
          <p>
            When an order comes in, {FULFILMENT_PARTNER} prints it, frames or stretches it, packs
            it and ships it to your customer. No inventory, no shipping supplies, no trips to the
            post office, no minimums.
          </p>
          <p>
            You upload web-resolution images; print masters stay at the shop. Card payments run
            through Helcim at checkout, and each order lands in a fulfilment queue the shop works
            from directly.
          </p>
        </div>
        <ul className="svc-products">
          {products.map((p) => (
            <li key={p.name}>
              <strong>{p.name}</strong>
              <span>{p.body}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="svc-steps" id="how-it-works">
        <span className="svc-kicker">How it works</span>
        <h2 className="svc-h2">Three steps from portfolio to first sale.</h2>
        <ol className="svc-steps__list">
          {steps.map((s) => (
            <li key={s.title}>
              <strong>{s.title}</strong>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="svc-builder" id="builder">
        <span className="svc-kicker">Try it</span>
        <h2 className="svc-h2">The product builder your customers use.</h2>
        <p className="svc-lede">
          Every piece on the site gets this. Pick a format, a size and the finish, see it in 3D or
          on a wall, and the price updates as you go.
        </p>
        <div className="svc-builder__frame">
          <DemoBuilder imageUrl={builderImageUrl} imageTitle={builderImageTitle} />
        </div>
        <p className="svc-builder__note">
          Sample products and prices. Your site offers the formats and sizes you choose, at prices
          you set.
        </p>
      </section>

      {galleries.length > 0 ? (
        <section className="svc-galleries" id="galleries">
          <span className="svc-kicker">The galleries in this look</span>
          <h2 className="svc-h2">See how the work is presented.</h2>
          <div className="svc-galleries__grid">
            {galleries.map((g, i) => (
              <Link key={g.id} href={`/gallery/${g.slug}`} className="svc-galleries__card">
                <div className="svc-galleries__img">
                  {g.coverImageUrl ? (
                    <Image
                      src={g.coverImageUrl}
                      alt={g.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                      priority={i < 2}
                    />
                  ) : null}
                </div>
                <h3>{g.name}</h3>
                {g.description ? <p>{g.description}</p> : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="svc-looks" id="looks">
        <span className="svc-kicker">Pick a look</span>
        <h2 className="svc-h2">Four starting points, each tuned to a kind of work.</h2>
        <p className="svc-lede">
          Same platform, different feeling. Each one is a live demo with its own sample galleries.
          Yours starts from one of these and is tuned to your work.
        </p>
        <div className="svc-looks__grid">
          {themeLinks.map((link) => {
            const preset = themes[link.preset]
            const active = link.preset === theme.preset
            return (
              <a
                key={link.preset}
                href={link.url}
                className={active ? 'svc-look svc-look--active' : 'svc-look'}
              >
                <span className="svc-look__swatch" aria-hidden>
                  <span style={{ background: preset.colorBg }} />
                  <span style={{ background: preset.colorSurface }} />
                  <span style={{ background: preset.colorAccent }} />
                  <span style={{ background: preset.colorPrimary }} />
                </span>
                <span className="svc-look__name" style={{ fontFamily: preset.fontHeading }}>
                  {link.label}
                </span>
                <span className="svc-look__tagline">{link.tagline}</span>
                {active ? <span className="svc-look__here">You are here</span> : null}
              </a>
            )
          })}
        </div>
      </section>

      <section className="svc-pricing" id="pricing">
        <span className="svc-kicker">Pricing</span>
        <h2 className="svc-h2">The more you sell, the less you pay us.</h2>
        <p className="svc-lede">
          A monthly platform fee that steps down with your print sales, and a one-time setup fee.
          Production is at cost; the markup is yours.
        </p>
        <ul className="svc-tiers">
          {pricingTiers.map((t) => (
            <li key={t.name} className="svc-tier">
              <span className="svc-tier__name">{t.name}</span>
              <span className="svc-tier__monthly">{t.monthly}</span>
              <span className="svc-tier__volume">{t.volume}</span>
              <span className="svc-tier__note">{t.note}</span>
            </li>
          ))}
        </ul>
        <div className="svc-build">
          <strong>
            {pricingBuild.label}: {pricingBuild.value}
          </strong>
          <span>{pricingBuild.note}</span>
        </div>
        <ul className="svc-footnotes">
          {pricingFootnotes.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>

      <section className="svc-cta" id="contact">
        <div>
          <h2 className="svc-h2">Get your own site.</h2>
          <p>
            Email a link to your portfolio: Instagram, an existing site, or a folder of work. You
            get a draft deployment in your look to review before any commitment.
          </p>
        </div>
        <div className="svc-cta__actions">
          <a className="svc-btn" href={mailto(`${PLATFORM_NAME} artist site inquiry`)}>
            Email us about your site
          </a>
          <span className="svc-cta__email">{CONTACT_EMAIL}</span>
        </div>
      </section>
    </div>
  )
}
