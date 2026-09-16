import { HOME_KEY, MULTI_SITE, siteUrl } from '@/lib/site'

// Shown on demo sites only. Real artist sites never render it. Links back to
// the marketing root when one deployment serves everything, otherwise to the
// demo's own "how it works" section.
export default function DemoBanner() {
  const href = MULTI_SITE ? siteUrl(HOME_KEY, '/#how-it-works') : '/#how-it-works'
  return (
    <div className="demo-banner">
      <span className="demo-banner__text">
        Sample artist site — built on the Moss Editions platform
      </span>
      <a href={href} className="demo-banner__cta">
        See how it works →
      </a>
    </div>
  )
}
