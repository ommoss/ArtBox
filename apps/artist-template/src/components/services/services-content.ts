// Copy and numbers for the demo home page. Everything a non-developer might
// want to change lives here.
//
// PRICING NUMBERS ARE PLACEHOLDERS. Owen to confirm before launch; the page
// labels them "indicative" until then.

export const CONTACT_EMAIL = 'admin@mosseditions.com'

export const PLATFORM_NAME = 'Moss Editions'
export const FULFILMENT_PARTNER = 'Artbox Printing'
export const FULFILMENT_CITY = 'Victoria, BC'

export const mailto = (subject: string) =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`

export const proofPoints = [
  { title: 'Printing, framing and shipping included', body: 'Every order is produced and shipped by Artbox Printing. You never touch a box.' },
  { title: 'You set the prices', body: 'Production cost is fixed. Your markup on top is yours, with no commission.' },
  { title: 'Your look, your name', body: 'Four starting looks, tuned to your work. Your domain, your brand, your galleries.' },
]

export const products = [
  { name: 'Fine art paper prints', body: 'Archival pigment prints on matte, lustre and baryta papers.' },
  { name: 'Framed prints', body: 'Real wood mouldings in black, white and oak, matted, behind glass or acrylic.' },
  { name: 'Canvas wraps', body: 'Gallery, mirror or solid-colour edge wraps on stretcher bars.' },
  { name: 'Wood block mounts', body: 'Prints mounted on a stained wood block, ready to hang, no frame needed.' },
  { name: 'Greeting cards', body: 'Packs of folded cards printed from any piece in your galleries.' },
]

export const steps = [
  {
    title: 'Send your work',
    body: 'A Dropbox folder, an Instagram, or an existing site is enough. We set up galleries, sizes and products, and load your first pieces.',
  },
  {
    title: 'Approve a draft',
    body: 'You get a private draft deployment in your chosen look before any commitment. Change the look, the copy, the prices, the order of things.',
  },
  {
    title: 'Sell, and let the shop do the rest',
    body: 'Orders go straight to Artbox Printing. They print, frame, pack and ship. You get paid your markup on every sale.',
  },
]

export type PricingTier = {
  name: string
  volume: string
  monthly: string
  note: string
}

// PLACEHOLDER values. Tiers are keyed on trailing three-month print sales.
export const pricingTiers: PricingTier[] = [
  { name: 'Studio', volume: 'Under $1,000 / month in print sales', monthly: '$39 / month', note: 'For a first year of selling online.' },
  { name: 'Gallery', volume: '$1,000 to $3,000 / month', monthly: '$19 / month', note: 'Fee steps down as the work sells.' },
  { name: 'Editions', volume: 'Over $3,000 / month', monthly: 'No monthly fee', note: 'Volume covers the platform.' },
]

export const pricingBuild = {
  label: 'One-time setup',
  value: 'From $1,500',
  note: 'Negotiable. Covers galleries, product setup, image preparation and launch.',
}

export const pricingFootnotes = [
  'On every tier you pay Artbox Printing’s production cost per order and set your own markup on top. There is no commission.',
  'Pricing shown is indicative. Your quote depends on how many pieces you launch with and how much image preparation they need.',
]
