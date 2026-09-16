import { HOME_KEY, siteUrl } from '@/lib/site'

// Compact strip at the foot of a demo site's home. The full pitch lives on
// the marketing root; here the site is allowed to be the artist's site.
export default function DemoBand() {
  return (
    <section className="demo-band" id="about-this-site">
      <div className="demo-band__inner">
        <div>
          <span className="svc-kicker">About this site</span>
          <h2 className="demo-band__title">A sample print shop, built on Moss Editions.</h2>
          <p className="demo-band__lede">
            The artist and the work are placeholders. Everything else is what a real site gets:
            galleries, the product builder, checkout, and every order printed, framed and shipped
            by Artbox Printing in Victoria, BC.
          </p>
        </div>
        <div className="demo-band__actions">
          <a className="svc-btn" href={siteUrl(HOME_KEY, '/#how-it-works')}>
            How it works
          </a>
          <a className="svc-btn svc-btn--ghost" href={siteUrl(HOME_KEY, '/#contact')}>
            Get your own site
          </a>
        </div>
      </div>
    </section>
  )
}
