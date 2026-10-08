import Link from 'next/link'

// Home hero for the maximalism preset: a collage of overlapping shapes on a
// hot-pink field. Name set huge in black italic, photographs cut into an
// arch, a circle and a tilted card, a rotating sticker, and a ticker of the
// galleries running underneath. The ticker stops under reduced motion.

const PINK = '#ff2e88'
const COBALT = '#2b3cff'
const LIME = '#c6f432'
const TANGERINE = '#ff8a1f'
const INK = '#1e0b3a'

type Piece = { slug: string; title: string; imageUrl: string }

export default function CollageHero({
  artistName,
  tagline,
  pieces,
  galleries,
}: {
  artistName: string
  tagline: string
  pieces: Piece[]
  galleries: string[]
}) {
  const [a, b, c] = pieces
  const ticker = (galleries.length ? galleries : ['New editions']).join('  ✺  ')
  return (
    <section className="cl">
      <style>{`
        .cl { position: relative; overflow: hidden; background: ${PINK}; color: ${INK}; }
        .cl::before {
          content: ''; position: absolute; inset: 0; opacity: 0.35;
          background: repeating-linear-gradient(45deg, transparent 0 22px, rgba(255,255,255,0.35) 22px 26px);
        }
        .cl__inner {
          position: relative; max-width: var(--max-width); margin: 0 auto;
          padding: clamp(36px, 6vw, 72px) var(--page-padding) clamp(40px, 6vw, 72px);
          display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: 24px; align-items: center;
        }
        .cl__name {
          font-family: var(--font-heading); font-style: italic; font-weight: 900;
          font-size: clamp(3rem, 8.2vw, 7.6rem); line-height: 0.86; letter-spacing: -0.03em; margin: 0;
          color: #fff; -webkit-text-stroke: 3px ${INK}; paint-order: stroke fill;
          text-shadow: 6px 6px 0 ${INK};
        }
        .cl__tag {
          display: inline-block; margin: 22px 0 26px; padding: 8px 16px; background: ${LIME};
          border: 3px solid ${INK}; border-radius: 999px; font-weight: 700; transform: rotate(-2deg);
          box-shadow: 4px 4px 0 ${INK};
        }
        .cl__cta {
          display: inline-block; padding: 14px 26px; background: ${COBALT}; color: #fff; text-decoration: none;
          border: 3px solid ${INK}; border-radius: 999px; font-weight: 700; font-size: 1.05rem;
          box-shadow: 6px 6px 0 ${INK}; transition: transform 0.12s, box-shadow 0.12s;
        }
        .cl__cta:hover { transform: translate(3px, 3px); box-shadow: 3px 3px 0 ${INK}; }
        .cl__stage { position: relative; min-height: clamp(380px, 46vw, 560px); }
        .cl__shape { position: absolute; display: block; overflow: hidden; border: 4px solid ${INK}; box-shadow: 10px 10px 0 ${INK}; }
        .cl__shape img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
        .cl__shape:hover img { transform: scale(1.06); }
        .cl__arch { left: 4%; top: 2%; width: 44%; height: 74%; border-radius: 999px 999px 18px 18px; background: ${TANGERINE}; z-index: 2; }
        .cl__circle { right: 4%; top: 0; width: 40%; aspect-ratio: 1; border-radius: 50%; background: ${LIME}; z-index: 1; }
        .cl__card { right: 10%; bottom: 0; width: 46%; height: 46%; border-radius: 22px; transform: rotate(5deg); background: ${COBALT}; z-index: 3; }
        .cl__sticker {
          position: absolute; left: 38%; bottom: 4%; width: 120px; height: 120px; border-radius: 50%; z-index: 4;
          background: ${LIME}; border: 3px solid ${INK}; display: flex; align-items: center; justify-content: center;
          text-align: center; font-weight: 800; font-size: 0.82rem; line-height: 1.1; text-transform: uppercase;
          animation: cl-spin 14s linear infinite; box-shadow: 4px 4px 0 ${INK};
        }
        .cl__star { position: absolute; z-index: 0; color: ${LIME}; font-size: 120px; line-height: 1; right: 40%; top: -30px; text-shadow: 4px 4px 0 ${INK}; }
        .cl__ticker { position: relative; background: ${INK}; color: ${LIME}; overflow: hidden; white-space: nowrap; border-top: 4px solid ${INK}; }
        .cl__ticker div {
          display: inline-block; padding: 12px 0; font-family: var(--font-heading); font-style: italic; font-weight: 900;
          font-size: 1.5rem; animation: cl-tick 28s linear infinite;
        }
        @keyframes cl-spin { to { transform: rotate(360deg); } }
        @keyframes cl-tick { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .cl__sticker, .cl__ticker div { animation: none; } }
        @media (max-width: 860px) {
          .cl__inner { grid-template-columns: 1fr; }
          .cl__stage { min-height: 360px; }
          .cl__sticker { width: 96px; height: 96px; font-size: 0.7rem; }
        }
      `}</style>
      <div className="cl__inner">
        <div>
          <h1 className="cl__name">{artistName}</h1>
          <span className="cl__tag">{tagline}!</span>
          <div>
            <Link href="/gallery" className="cl__cta">
              Dive into the colour →
            </Link>
          </div>
        </div>
        <div className="cl__stage">
          <span className="cl__star" aria-hidden>
            ✺
          </span>
          {a ? (
            <Link href={`/artwork/${a.slug}`} className="cl__shape cl__arch">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.imageUrl} alt={a.title} />
            </Link>
          ) : null}
          {b ? (
            <Link href={`/artwork/${b.slug}`} className="cl__shape cl__circle">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.imageUrl} alt={b.title} />
            </Link>
          ) : null}
          {c ? (
            <Link href={`/artwork/${c.slug}`} className="cl__shape cl__card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.imageUrl} alt={c.title} />
            </Link>
          ) : null}
          <span className="cl__sticker" aria-hidden>
            New
            <br />
            colour
            <br />
            editions
          </span>
        </div>
      </div>
      <div className="cl__ticker" aria-hidden>
        <div>
          {`${ticker}  ✺  ${ticker}  ✺  ${ticker}  ✺  `}
          {`${ticker}  ✺  ${ticker}  ✺  ${ticker}  ✺  `}
        </div>
      </div>
    </section>
  )
}
