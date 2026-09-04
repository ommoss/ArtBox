# Demo theme overhaul plan (2026-09-04)

Decisions so far: services home on all four demos (demo-flag gated, each theme's hero kept as top band); sailing preset rebranded (Tom no longer pursued) and carries the glass header; all four themes get a research-led visual pass, travel first; volume-based pricing; V3 builder embedded and polished; per-genre demo artist names; CTA to admin@mosseditions.com. Companion docs: RESEARCH-print-sites-2026-09.md, REVIEW-builder-v3-2026-09.md.

## Direction per theme (from the research)

Evidence: every top seller uses white or neutral chrome with sans type; every one shows a room mockup; grids are uniform 3-4 col tiles with the price on the card; scarcity is always a number. Saatchi measured +17% spend from a room visualiser. So the four themes differ by hero, type and content, not by inventing chrome the market doesn't use. The exception is art, which stays dark on purpose as the one "gallery wall" look in the set.

| Preset | Rebrand | Reference | Hero | Header | Type | Chrome | Gallery | Product cues |
|---|---|---|---|---|---|---|---|---|
| sailing -> wildlife | Wildlife (large-format, limited editions) | lik.com, aaronreedphotography.com | Single wide-aspect release in a room mockup, one CTA "Secure your edition"; carousel behind at reduced weight | GLASS: transparent over hero, white chrome, blur flip on scroll | Inter, tight tracking | Light neutral | Uniform wide tiles, caption title + edition + price, format filter (panoramic/standard/square) | Size, then medium, then frame; "N artist proof / N limited edition"; "not sure? contact us" |
| lifestyle | keep | graymalin.com, galerieprints.com | Promo bar + bright hero, collections as tiles with "Shop now" | Solid, sticky, logo-centred | Playfair + sans | White, saturated photos | 3-4 col uniform, "from" price on card, series tags | Frame colour swatches, size row with framed outer dims, per-size editions, free framing offer |
| art | keep dark | lumas.com, yellowkorner.com | Headline "Signed & limited edition", single piece, "just sold" strip | Solid dark, sticky | Inter light, wide tracking | #0d0d0e | Solo rows (keep) with badge + "x sizes" | Per-size sold-out state, budget filter, AR/room preview |
| travel | biggest rework | shop.jimmychin.com, stevemccurry.com | Collection rows by journey, caption "Title | Place, Year"; globe demoted to a section, not the whole hero | Solid warm, sticky (drop sidebar layout) | Georgia + sans | Warm paper, red-orange accent | Rows per trip, route map kept inside gallery | Landscape-style configurator, "notify me" |

Travel's sidebar header goes; none of the references use one and it fights the mobile layout. Globe stays as a mid-page section ("browse by place").

## Phases

0. Housekeeping (0.5d). Commit the GalleryGrid working change. Fix themeLinks URLs (still point at -editorial/-atmospheric/-warm). Rename Vercel projects and env for wildlife. Confirm the four Neon branches.
1. Chrome extraction (1d). Header, Footer, DemoBanner components; globals.css replaces the 225-line inline stylesheet in (public)/layout.tsx. Theme gains headerStyle: solid | glass and tokens --header-bg, --header-blur, --header-border, --header-fg-over-hero, --control-radius. Sticky header on all presets. Drop HeaderLayout 'sidebar'.
2. Glass header on wildlife (1d). Fixed transparent header over hero, white chrome + hairline rule, IntersectionObserver sentinel flips to glass (blur 12px, tinted fill, light border) then solid past the hero. Mobile menu as glass panel. @supports fallback. Hero top offset. Verified on the dark art preset too, since the pattern must survive a future dark glass.
3. Rebrand sailing -> wildlife (1d). Preset key/label, demo content set (galleries by region/format, ~22 artworks, 6 featured, 3 editions, all images visually vetted), new Neon branch seeded, artist name per genre.
4. V3 builder pass (1.5d). All 8 High items from the review, plus Medium 9-14 (demo-mode URL sync off, sticky mobile price bar, 3D preload, owned demo image, control radius token). Align three to 0.184 across the workspace. Remove V2.
5. Services home (2d). ServicesHome rendered when NEXT_PUBLIC_IS_DEMO=true. Sections in order: theme hero band; "Fulfilment included" lead (Artbox Printing in Victoria prints, frames, packs and ships; no inventory or shipping on the artist's side; paper, framed, canvas, block mount; Helcim checkout); how it works in three steps; live V3 builder on a fixture artwork; "Pick your look" theme cards; pricing tiers; CTA. /about-the-demo redirects to /#pricing.
6. Theme-blind surface fixes (1d). Home gallery grid placeholder and radius, HeroBanner scrims, cart/checkout/contact headings, footer. Test all four presets, art being the hard case.
7. Per-theme visual pass (2-3d). Apply the table above: palettes, type scale, gallery card captions with price and edition, product page cues (edition line, per-size sold out, framed outer dimensions, contact-us secondary CTA), travel rework.
8. Deploy + verify (0.5d). Four projects, lockfile check, desktop + 390px screenshots per home.

Total roughly 11-12 working days. Phases 1-2 first (everything else lands on top), then 3 and 4 in parallel with 5.

## Pricing tier structure (numbers to be confirmed)

Three tiers keyed on trailing-3-month print sales. Upfront build fee listed as "from" and marked negotiable.

| Tier | Monthly sales | Monthly fee | Build fee |
|---|---|---|---|
| Studio | under $X | $Y/mo | from $Z, negotiable |
| Gallery | $X to $2X | reduced | from $Z, negotiable |
| Editions | over $2X | no monthly fee | from $Z, negotiable |

Plus, on every tier: production cost per order at Artbox's price, artist sets the markup, no commission on top. Placeholder numbers ship as "from" language until Owen confirms.

## Open questions
1. DECIDED: wildlife.
2. DECIDED: "from" placeholders.
3. DECIDED: Moss Editions is the platform, Artbox Printing the fulfilment partner; no logo or domain yet, email only.
4. DECIDED: art stays dark (variety).

## Status (2026-09-04, end of day 1)

Done locally, uncommitted:
- Phase 1: chrome extracted (components/site/*, (public)/globals.css), new tokens (--control-radius, --header-glass-bg, --header-blur, --header-h), headerStyle solid|glass, sidebar layout removed, sticky headers everywhere, mobile menu toggle, per-genre demo artist names, announcement bar (env NEXT_PUBLIC_ANNOUNCEMENT, lifestyle demo default).
- Phase 2: glass header on wildlife, verified in all three states + phone.
- Phase 3: sailing -> wildlife rename with env aliases (sailing/minimal/editorial/atmospheric/warm still resolve); wildlife content set authored (5 galleries, 25 vetted artworks, 6 featured, 3 editions). NOT yet seeded: needs a DB. Plan: TRUNCATE the old sailing branch ep-wild-star-akr8iroh and reseed with NEXT_PUBLIC_THEME=wildlife (Owen to confirm).
- Phase 5: ServicesHome on demo deployments (components/services/*), copy + PLACEHOLDER pricing in services-content.ts, /about-the-demo redirects to /#how-it-works, live V3 builder on fixtures.
- Phase 6: hardcoded colours/radii replaced with tokens across gallery/about/artwork/cart/checkout/contact/confirmation + GalleryGrid placeholders.
- Phase 7 (partial): wildlife carousel edition CTA; art 'gallery-wall' hero; travel 'journeys' hero with the globe demoted to a "browse by place" section; lifestyle announcement bar. Verified by headless screenshots on each theme's own Neon branch.
- Phase 4: V3 builder pass run by a subagent (see REVIEW doc for the item list).

Dev note: next.config now honours NEXT_DIST_DIR so a second dev server (other theme + branch) can run on 3002 with NEXT_DIST_DIR=.next-alt without corrupting .next.

Remaining: seed wildlife DB; rename Vercel projects/env (NEXT_PUBLIC_IS_DEMO=true on all four, NEXT_PUBLIC_ARTIST_NAME unset, themeLinks URLs updated); real pricing numbers; gallery-card "from" prices (needs template pricing per site); owned demo image for the builder; wedding preset (deferred).
