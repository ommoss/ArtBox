// Legal page copy. Plain-language drafts for a small British Columbia print
// business; have them reviewed before a real artist site goes live. The
// operator fields are substituted per site so the same text serves the
// marketing root, the demos and real artist deployments.
//
// Assumed structure (change here if the commercial model changes): the artist
// is the seller named on the site, Moss Editions operates the platform, and
// Artbox Printing produces and ships the goods.

import type { ReactNode } from 'react'

export type LegalContext = {
  siteName: string // the name on the site (artist or platform)
  platform: string
  producer: string
  producerCity: string
  contactEmail: string
  updated: string
}

export type LegalDoc = { slug: string; title: string; summary: string; body: (ctx: LegalContext) => ReactNode }

export const legalDocs: LegalDoc[] = [
  {
    slug: 'privacy',
    title: 'Privacy policy',
    summary: 'What we collect, why, and who sees it.',
    body: (c) => (
      <>
        <p>
          {c.siteName} is operated on the {c.platform} platform. This policy explains what personal
          information the site collects, how it is used, and who it is shared with. It is written to
          meet British Columbia&apos;s Personal Information Protection Act and Canada&apos;s PIPEDA.
        </p>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Order details.</strong> Name, email, shipping address, phone number if given, and
            the items you order. Needed to produce and deliver your order and to contact you about it.
          </li>
          <li>
            <strong>Payment.</strong> Card details are handled by our payment processor and never
            stored on this site. We keep the processor&apos;s reference number and the amount.
          </li>
          <li>
            <strong>Messages.</strong> Anything you send through the contact form or by email.
          </li>
          <li>
            <strong>Site usage.</strong> Standard server logs and privacy-respecting analytics
            (page views, referrer, approximate region). No advertising trackers.
          </li>
        </ul>
        <h2>Who sees it</h2>
        <p>
          Order and shipping details are shared with {c.producer} in {c.producerCity}, who prints,
          packs and ships every order, and with the carrier delivering it. Payment details go to the
          payment processor. Email goes through our email provider. None of them may use your
          information for their own purposes. We do not sell or rent personal information.
        </p>
        <h2>How long we keep it</h2>
        <p>
          Order records are kept for seven years to satisfy Canadian tax rules. Contact-form
          messages are kept as long as the conversation is live and deleted on request afterwards.
        </p>
        <h2>Your choices</h2>
        <p>
          You can ask what we hold about you, ask for corrections, or ask for deletion where the law
          allows. Write to {c.contactEmail}. If you think a request was handled badly you can
          complain to the Office of the Information and Privacy Commissioner for British Columbia.
        </p>
        <h2>Cookies</h2>
        <p>
          The site uses a session cookie for your cart and, on protected galleries, a cookie that
          remembers a passcode you entered. Nothing follows you across other sites.
        </p>
        <p className="legal-updated">Last updated {c.updated}.</p>
      </>
    ),
  },
  {
    slug: 'terms',
    title: 'Terms of sale',
    summary: 'The agreement between you and the seller when you order a print.',
    body: (c) => (
      <>
        <p>
          These terms apply to every order placed on {c.siteName}. Placing an order means you accept
          them. The seller is {c.siteName}; production and delivery are carried out by {c.producer}.
        </p>
        <h2>Orders and acceptance</h2>
        <p>
          An order is accepted when we send the confirmation email. We may refuse or cancel an
          order if a listed price was wrong, an image cannot be produced at the size chosen, or an
          edition has sold out, and in that case you are refunded in full.
        </p>
        <h2>Prices and taxes</h2>
        <p>
          Prices are in Canadian dollars. Applicable GST and PST are shown at checkout. Shipping is
          shown separately before you pay. Prices can change without notice; the price you see when
          you order is the price you pay.
        </p>
        <h2>Made to order</h2>
        <p>
          Every print is produced for your order. Sizes are nominal and may vary by a few
          millimetres. Colour on screen and colour on paper never match exactly; we calibrate for
          the print, and small differences are not a defect.
        </p>
        <h2>Limited editions</h2>
        <p>
          Edition sizes stated on the site are the total number of prints that will ever be made of
          that image in that edition, across all sizes unless the listing says otherwise.
        </p>
        <h2>Copyright and use</h2>
        <p>
          The artist keeps copyright in every image. Buying a print gives you the physical print
          for personal display. It does not include any right to copy, scan, publish, or resell
          reproductions of the image.
        </p>
        <h2>Liability</h2>
        <p>
          Our responsibility for any order is limited to the price you paid for it. Nothing in
          these terms removes rights you have under the British Columbia Business Practices and
          Consumer Protection Act.
        </p>
        <h2>Law</h2>
        <p>These terms are governed by the laws of British Columbia and Canada.</p>
        <p className="legal-updated">Last updated {c.updated}.</p>
      </>
    ),
  },
  {
    slug: 'shipping-returns',
    title: 'Shipping and returns',
    summary: 'Where we ship, how long it takes, and what happens if something arrives damaged.',
    body: (c) => (
      <>
        <h2>Production time</h2>
        <p>
          Prints are made to order by {c.producer} in {c.producerCity}. Paper prints usually leave
          within 3 to 5 business days; framed prints, canvas wraps and block mounts within 7 to 10
          business days. Busy seasons can add a few days and we will tell you if they do.
        </p>
        <h2>Shipping</h2>
        <p>
          We ship across Canada and to the United States. Shipping cost and options are shown at
          checkout before you pay. Large framed pieces ship in double-wall cartons with corner
          protection; canvases ship boxed. You get a tracking number by email when the order leaves.
          Duties and taxes on orders shipped outside Canada are the buyer&apos;s responsibility.
        </p>
        <h2>Local pickup</h2>
        <p>Orders can be picked up at {c.producer} in {c.producerCity} at no charge. Choose pickup at checkout.</p>
        <h2>Damaged or defective</h2>
        <p>
          If a print arrives damaged or with a production fault, email {c.contactEmail} within 14
          days of delivery with photos of the print and the packaging. We reprint and reship at no
          cost. Please keep the packaging until the claim is settled; the carrier may ask for it.
        </p>
        <h2>Returns</h2>
        <p>
          Because every print is made for your order, we do not accept returns for change of mind
          or for the ordinary differences between a screen and a print. If you have any doubt about
          a size or finish, ask before ordering and we will help you choose.
        </p>
        <h2>Cancellations</h2>
        <p>
          An order can be cancelled for a full refund until production starts, normally within one
          business day of ordering. After that it is made and the terms above apply.
        </p>
        <p className="legal-updated">Last updated {c.updated}.</p>
      </>
    ),
  },
]
