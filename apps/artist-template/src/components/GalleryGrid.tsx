import { geoMercator, geoPath } from 'd3-geo'
import Image from 'next/image'
import Link from 'next/link'
import { feature } from 'topojson-client'
import worldTopo from 'world-atlas/countries-110m.json'

import { RouteDecor, regionForCoords, type MapRegion } from './route-map-decor'
import type { GalleryGridMode } from '@/lib/themes'

// World land geometry for the travel route basemap, decoded once at module
// load. Server-only (this is a server component) so the topojson itself never
// ships to the client — only the small projected SVG path string does.
const WORLD_LAND = feature(
  worldTopo as unknown as Parameters<typeof feature>[0],
  (worldTopo as unknown as { objects: { countries: Parameters<typeof feature>[1] } }).objects
    .countries,
) as unknown as GeoJSON.FeatureCollection

type Artwork = {
  id: string | number
  slug?: string | null
  title?: string | null
  imageUrl?: string | null
  year?: number | null
  location?: string | null
  description?: string | null
  lat?: number | null
  lng?: number | null
  isLimitedEdition?: boolean | null
  editionSize?: number | null
  editionsRemaining?: number | null
}

type Props = {
  artworks: Artwork[]
  mode: GalleryGridMode
  // Literal accent colour for the route map's SVG (presentation attributes
  // don't resolve CSS var()). Falls back to currentColor.
  accent?: string
  // Optional AI-generated antique map image. When set, it becomes the route
  // map's backdrop (route overlaid); otherwise the drawn d3 coastline map is used.
  mapImageUrl?: string
}

type EditionState =
  | { kind: 'none' }
  | { kind: 'available'; size: number }
  | { kind: 'low'; size: number; remaining: number }
  | { kind: 'soldOut'; size: number }

function editionStateFor(a: Artwork): EditionState {
  if (!a.isLimitedEdition || !a.editionSize) return { kind: 'none' }
  const remaining = a.editionsRemaining ?? a.editionSize
  if (remaining <= 0) return { kind: 'soldOut', size: a.editionSize }
  // Low when 25% or 3-or-fewer remaining, whichever is more permissive.
  const lowThreshold = Math.max(3, Math.floor(a.editionSize * 0.25))
  if (remaining <= lowThreshold) {
    return { kind: 'low', size: a.editionSize, remaining }
  }
  return { kind: 'available', size: a.editionSize }
}

function EditionMarker({ state }: { state: EditionState }) {
  if (state.kind === 'none') return null

  if (state.kind === 'soldOut') {
    return (
      <>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'saturate(0)',
            WebkitBackdropFilter: 'saturate(0)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '6px 16px',
            background: 'rgba(0,0,0,0.78)',
            color: '#fff',
            fontSize: '0.75rem',
            letterSpacing: 2,
            textTransform: 'uppercase',
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.25)',
            pointerEvents: 'none',
          }}
        >
          Sold out
        </div>
      </>
    )
  }

  const isLow = state.kind === 'low'
  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        left: 10,
        padding: '4px 10px',
        background: isLow ? 'var(--color-accent)' : 'rgba(0,0,0,0.72)',
        color: '#fff',
        fontSize: '0.7rem',
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontWeight: 600,
        borderRadius: 2,
        pointerEvents: 'none',
        boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
      }}
    >
      {isLow ? `Only ${state.remaining} left` : `Edition of ${state.size}`}
    </div>
  )
}

// Deterministic small rotation per index for the album mode. Same artwork
// always rotates the same way — feels intentional, not random.
function albumRotation(i: number): number {
  const seeds = [-1.2, 0.8, -0.6, 1.6, -1.8, 0.4, -1.0, 1.2]
  return seeds[i % seeds.length]
}

// Magazine layout: every Nth tile claims 2x2 to break the rhythm. The pattern
// is deterministic so above-the-fold tiles are consistent across renders.
function magazineSpan(i: number): { col: number; row: number } {
  // i % 7 == 0  → 2x2 feature (every 7 tiles, 1 feature)
  // i % 11 == 4 → 1x2 tall portrait
  if (i % 7 === 0) return { col: 2, row: 2 }
  if (i % 11 === 4) return { col: 1, row: 2 }
  return { col: 1, row: 1 }
}

export default function GalleryGrid({ artworks, mode, accent, mapImageUrl }: Props) {
  if (mode === 'solo') {
    // One piece per row at its native aspect ratio, with the piece's story
    // beside it; rows alternate sides on desktop and stack on mobile. Native
    // aspect uses a plain <img>: the demo's external image URLs carry no
    // dimensions for next/image, and Unsplash already serves optimized
    // AVIF/WebP. This is the fine-art "room to breathe" layout.
    return (
      <>
        <style>{`
          .gg-solo { display: flex; flex-direction: column; gap: 96px; margin-top: 56px; }
          .gg-solo-row { display: flex; flex-direction: column; gap: 24px; }
          .gg-solo-text { align-self: center; }
          .gg-solo-media { display: flex; justify-content: center; }
          /* Cap on both axes so tall/large pieces never overrun the column or
             the viewport; width:auto keeps aspect ratio true (no squish). */
          .gg-solo-img {
            display: block;
            width: auto; height: auto;
            max-width: 100%; max-height: 68vh;
            border-radius: var(--image-radius);
            box-shadow: var(--image-shadow);
          }
          @media (min-width: 860px) {
            .gg-solo { gap: 128px; }
            .gg-solo-row { flex-direction: row; gap: 64px; align-items: center; }
            .gg-solo-row--flip { flex-direction: row-reverse; }
            .gg-solo-media { flex: 1 1 58%; min-width: 0; }
            .gg-solo-text { flex: 1 1 42%; }
            .gg-solo-img { max-height: 80vh; }
          }
        `}</style>
        <div className="gg-solo">
          {artworks.map((a, i) => {
            const edition = editionStateFor(a)
            const editionLabel =
              edition.kind === 'soldOut'
                ? `Sold out · edition of ${edition.size}`
                : edition.kind === 'low'
                  ? `Only ${edition.remaining} of ${edition.size} left`
                  : edition.kind === 'available'
                    ? `Limited edition of ${edition.size}`
                    : null
            const meta = [a.year, a.location].filter(Boolean).join(' · ')
            return (
              <Link
                key={a.id}
                href={`/artwork/${a.slug}`}
                className={`gg-solo-row${i % 2 === 1 ? ' gg-solo-row--flip' : ''}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="gg-solo-media">
                  {a.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="gg-solo-img"
                      src={a.imageUrl}
                      alt={a.title ?? ''}
                      loading={i < 1 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  ) : null}
                </div>
                <div className="gg-solo-text">
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 'var(--weight-heading)' as unknown as number,
                      letterSpacing: 'var(--tracking-heading)',
                      fontSize: '1.8rem',
                      margin: 0,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {a.title}
                  </h3>
                  {meta ? (
                    <p style={{ color: 'var(--color-secondary)', margin: '8px 0 0', fontSize: '0.9rem' }}>
                      {meta}
                    </p>
                  ) : null}
                  {a.description ? (
                    <p style={{ margin: '20px 0 0', lineHeight: 1.7, maxWidth: 440 }}>
                      {a.description}
                    </p>
                  ) : null}
                  {editionLabel ? (
                    <p
                      style={{
                        margin: '20px 0 0',
                        fontSize: '0.75rem',
                        letterSpacing: 1.5,
                        textTransform: 'uppercase',
                        color:
                          edition.kind === 'low'
                            ? 'var(--color-accent)'
                            : 'var(--color-secondary)',
                      }}
                    >
                      {editionLabel}
                    </p>
                  ) : null}
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: 24,
                      fontSize: '0.85rem',
                      letterSpacing: 0.3,
                      color: 'var(--color-accent)',
                    }}
                  >
                    View print →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </>
    )
  }

  if (mode === 'route') {
    // Travel: plot the gallery's photos on a real map (land/sea coastlines from
    // world-atlas, projected with d3-geo) joined by a dashed route in shot
    // order, then the photos below numbered to match. Server-rendered SVG, no
    // client JS. The projection fits the trip's own bounds, so wide trips reveal
    // coastline and tight ones sit on a patch of land.
    const geo = artworks.filter(
      (a) => typeof a.lat === 'number' && typeof a.lng === 'number',
    )
    const W = 800
    const H = 380
    const PAD = 30
    let routeMap: {
      land: string
      route: string
      pts: { x: number; y: number; n: number }[]
      region: MapRegion
    } | null = null
    if (geo.length >= 1) {
      const lats = geo.map((a) => a.lat as number)
      const lngs = geo.map((a) => a.lng as number)
      let minLat = Math.min(...lats)
      let maxLat = Math.max(...lats)
      let minLng = Math.min(...lngs)
      let maxLng = Math.max(...lngs)
      // Pad proportionally so the route fills the frame; a floor handles a
      // single point or an all-in-one-spot trip.
      const padLat = (maxLat - minLat) * 0.25 || 0.06
      const padLng = (maxLng - minLng) * 0.25 || 0.06
      minLat -= padLat
      maxLat += padLat
      minLng -= padLng
      maxLng += padLng
      // Fit to a MultiPoint of the padded corners, NOT a Polygon: a Polygon
      // ring with the wrong winding is read by d3 as "everything except this
      // box" and fits the whole globe (scale collapses). MultiPoint has no
      // winding, so the bounding box fits correctly.
      const fitObject: GeoJSON.MultiPoint = {
        type: 'MultiPoint',
        coordinates: [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
      }
      const projection = geoMercator().fitExtent([[PAD, PAD], [W - PAD, H - PAD]], fitObject)
      projection.clipExtent([[0, 0], [W, H]])
      const toPath = geoPath(projection)
      // Skip the world-land path when an AI map image will be the backdrop.
      const land = mapImageUrl ? '' : toPath(WORLD_LAND) || ''
      const pts = geo.map((a, i) => {
        const xy = projection([a.lng as number, a.lat as number])
        return { x: xy ? xy[0] : 0, y: xy ? xy[1] : 0, n: i + 1 }
      })
      const route = pts
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(' ')
      const region = regionForCoords(
        lats.reduce((s, v) => s + v, 0) / lats.length,
        lngs.reduce((s, v) => s + v, 0) / lngs.length,
      )
      routeMap = { land, route, pts, region }
    }
    const routeAccent = accent || 'currentColor'
    return (
      <>
        <style>{`
          .gg-route-map { width: 100%; aspect-ratio: 800 / 380; border: 1px solid var(--color-border); border-radius: var(--image-radius); margin: 24px 0 40px; display: block; overflow: hidden; }
          .gg-route-sea { fill: #c0cabb; }
          .gg-route-land { fill: #e7d7b0; stroke: #6b5538; stroke-opacity: 0.5; stroke-width: 0.8; stroke-linejoin: round; }
          .gg-route-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr)); gap: 24px; }
          .gg-route-badge { position: absolute; top: 10px; left: 10px; width: 26px; height: 26px; border-radius: 999px; background: var(--color-accent); color: #fff; font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.25); }
        `}</style>
        {routeMap ? (
          <svg
            className="gg-route-map"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="Antique map of this gallery's route"
          >
            <defs>
              <filter id="rmPaper" x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n" />
                <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.33  0 0 0 0 0.2  0 0 0 0.5 0" />
              </filter>
            </defs>
            {mapImageUrl ? (
              // AI-generated antique map fills the frame; route overlays on top.
              <image
                href={mapImageUrl}
                x={0}
                y={0}
                width={W}
                height={H}
                preserveAspectRatio="xMidYMid slice"
              />
            ) : (
              <>
                <rect x={0} y={0} width={W} height={H} className="gg-route-sea" />
                {routeMap.land ? <path className="gg-route-land" d={routeMap.land} /> : null}
                {/* aged paper grain over land + sea */}
                <rect x={0} y={0} width={W} height={H} filter="url(#rmPaper)" opacity={0.12} />
                {/* region-themed antique motifs (sea serpents, galleons, wind-faces…) */}
                <RouteDecor region={routeMap.region} w={W} h={H} />
              </>
            )}
            {routeMap.pts.length >= 2 ? (
              <path
                d={routeMap.route}
                fill="none"
                stroke={routeAccent}
                strokeWidth={2.5}
                strokeDasharray="7 6"
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={0.92}
              />
            ) : null}
            {routeMap.pts.map((p) => (
              <g key={p.n}>
                <circle cx={p.x} cy={p.y} r={12} fill={routeAccent} stroke="#f3ead2" strokeWidth={1.8} />
                <text x={p.x} y={p.y} dy="0.35em" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">
                  {p.n}
                </text>
              </g>
            ))}
            {/* double frame border */}
            <rect x={6} y={6} width={W - 12} height={H - 12} fill="none" stroke="#6b5538" strokeOpacity={0.5} strokeWidth={1.5} />
            <rect x={11} y={11} width={W - 22} height={H - 22} fill="none" stroke="#6b5538" strokeOpacity={0.3} strokeWidth={0.6} />
          </svg>
        ) : null}
        <div className="gg-route-grid">
          {artworks.map((a, i) => {
            const isAboveFold = i < 4
            return (
              <Link
                key={a.id}
                href={`/artwork/${a.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '4 / 3',
                    background: 'linear-gradient(135deg, #e8e6df 0%, #d6d3c8 100%)',
                    borderRadius: 'var(--image-radius)',
                    overflow: 'hidden',
                  }}
                >
                  {a.imageUrl ? (
                    <Image
                      src={a.imageUrl}
                      alt={a.title ?? ''}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                      priority={isAboveFold}
                    />
                  ) : null}
                  <span className="gg-route-badge">{i + 1}</span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 500, marginTop: 10, marginBottom: 0, overflowWrap: 'anywhere' }}>
                  {a.title}
                </h3>
                {a.location ? (
                  <p style={{ color: 'var(--color-secondary)', margin: 0, fontSize: '0.85rem' }}>
                    {a.location}
                  </p>
                ) : null}
              </Link>
            )
          })}
        </div>
      </>
    )
  }

  if (mode === 'magazine') {
    return (
      <>
        {/* Fixed 4-col grid can't use min(); drop to 2 cols on phones. The
            2×2 feature spans degrade cleanly to full-width at 2 cols. */}
        <style>{`
          .gg-magazine { grid-template-columns: repeat(4, 1fr); }
          @media (max-width: 768px) {
            .gg-magazine {
              grid-template-columns: repeat(2, 1fr);
              grid-auto-rows: 180px;
            }
          }
        `}</style>
        <div
          className="gg-magazine"
          style={{
            display: 'grid',
            gridAutoRows: '220px',
            gridAutoFlow: 'dense',
            gap: 16,
            marginTop: 32,
          }}
        >
        {artworks.map((a, i) => {
          const span = magazineSpan(i)
          const isAboveFold = i < 4
          const sizes =
            span.col === 2
              ? '(max-width: 768px) 100vw, 50vw'
              : '(max-width: 768px) 50vw, 25vw'
          const edition = editionStateFor(a)
          return (
            <Link
              key={a.id}
              href={`/artwork/${a.slug}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                gridColumn: `span ${span.col}`,
                gridRow: `span ${span.row}`,
                position: 'relative',
                overflow: 'hidden',
                background: 'var(--color-surface)',
              }}
            >
              {a.imageUrl ? (
                <Image
                  src={a.imageUrl}
                  alt={a.title ?? ''}
                  fill
                  sizes={sizes}
                  style={{ objectFit: 'cover' }}
                  priority={isAboveFold}
                />
              ) : null}
              <EditionMarker state={edition} />
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: '40px 16px 14px',
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))',
                  color: '#fff',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                <div style={{ fontSize: '0.95rem', lineHeight: 1.2 }}>
                  {a.title}
                </div>
                {a.year ? (
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                    {a.year}
                  </div>
                ) : null}
              </div>
            </Link>
          )
        })}
        </div>
      </>
    )
  }

  if (mode === 'album') {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))',
          gap: 36,
          marginTop: 40,
          paddingTop: 8,
        }}
      >
        {artworks.map((a, i) => {
          const rot = albumRotation(i)
          const isAboveFold = i < 4
          const edition = editionStateFor(a)
          return (
            <Link
              key={a.id}
              href={`/artwork/${a.slug}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                transform: `rotate(${rot}deg)`,
                transition: 'transform 0.2s ease',
              }}
              className="album-card"
            >
              <div
                style={{
                  background: 'var(--color-surface)',
                  padding: '12px 12px 16px',
                  boxShadow: 'var(--image-shadow)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    background:
                      'linear-gradient(135deg, #e8e6df 0%, #d6d3c8 100%)',
                    overflow: 'hidden',
                    marginBottom: 12,
                  }}
                >
                  {a.imageUrl ? (
                    <Image
                      src={a.imageUrl}
                      alt={a.title ?? ''}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      style={{ objectFit: 'cover' }}
                      priority={isAboveFold}
                    />
                  ) : null}
                  <EditionMarker state={edition} />
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      overflowWrap: 'anywhere',
                      flex: 1,
                    }}
                  >
                    {a.title}
                  </span>
                  {a.year ? (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        letterSpacing: 1.5,
                        textTransform: 'uppercase',
                        color: 'var(--color-secondary)',
                        border: '1px solid var(--color-border)',
                        padding: '2px 8px',
                        marginLeft: 8,
                      }}
                    >
                      {a.year}
                    </span>
                  ) : null}
                </div>
                {a.location ? (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-secondary)',
                      marginTop: 4,
                      fontStyle: 'italic',
                    }}
                  >
                    {a.location}
                  </div>
                ) : null}
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  if (mode === 'cinematic') {
    // Wide-aspect, large-tile layout for marine/sailing work: a 1–2 column
    // grid of 3:2 landscape images shown big, edge-to-edge (radius/shadow come
    // from the theme, which is 0/none for sailing), with a clean caption below.
    return (
      <div
        style={{
          display: 'grid',
          // min(...,100%) so a single wide tile never overflows a phone.
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(560px, 100%), 1fr))',
          gap: 40,
          marginTop: 32,
        }}
      >
        {artworks.map((a, i) => {
          const isAboveFold = i < 2
          const edition = editionStateFor(a)
          return (
            <Link
              key={a.id}
              href={`/artwork/${a.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '3 / 2',
                  background:
                    'linear-gradient(135deg, #dfe6e8 0%, #c7d2d6 100%)',
                  borderRadius: 'var(--image-radius)',
                  overflow: 'hidden',
                }}
              >
                {a.imageUrl ? (
                  <Image
                    src={a.imageUrl}
                    alt={a.title ?? ''}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: 'cover' }}
                    priority={isAboveFold}
                  />
                ) : null}
                <EditionMarker state={edition} />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginTop: 12,
                  gap: 12,
                }}
              >
                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 500,
                    margin: 0,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {a.title}
                </h3>
                {a.location ? (
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--color-secondary)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {a.location}
                  </span>
                ) : null}
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  // Uniform — gallery-wall look used by the fine-art preset. Generous gap and
  // a larger minimum tile give each piece breathing room, like a hung wall.
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
        gap: 40,
        marginTop: 32,
      }}
    >
      {artworks.map((a, i) => {
        const isAboveFold = i < 4
        const edition = editionStateFor(a)
        return (
          <Link
            key={a.id}
            href={`/artwork/${a.slug}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              style={{
                position: 'relative',
                aspectRatio: '1 / 1',
                background:
                  'linear-gradient(135deg, #e8e6df 0%, #d6d3c8 100%)',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {a.imageUrl ? (
                <Image
                  src={a.imageUrl}
                  alt={a.title ?? ''}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
                  style={{ objectFit: 'cover' }}
                  priority={isAboveFold}
                />
              ) : null}
              <EditionMarker state={edition} />
            </div>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 500,
                marginTop: 10,
                marginBottom: 0,
                overflowWrap: 'anywhere',
              }}
            >
              {a.title}
            </h3>
            {a.year ? (
              <p style={{ color: 'var(--color-secondary)', margin: 0, fontSize: '0.85rem' }}>
                {a.year}
              </p>
            ) : null}
          </Link>
        )
      })}
    </div>
  )
}
