import Image from 'next/image'
import Link from 'next/link'

// Home hero for the Bauhaus preset: a constructed composition on a strict
// 12-column grid. One black block carries the name, two photographs take
// their cells, and the three primaries fill the rest. The primaries are the
// style itself, so they live here rather than in the token set.

const RED = '#d42a1f'
const YELLOW = '#f2b705'
const BLUE = '#1f4e9c'
const INK = '#111111'

type Piece = { slug: string; title: string; imageUrl: string }

export default function ConstructHero({
  artistName,
  tagline,
  pieces,
}: {
  artistName: string
  tagline: string
  pieces: Piece[]
}) {
  const [a, b] = pieces
  return (
    <section className="cx">
      <style>{`
        .cx { max-width: var(--max-width); margin: 0 auto; padding: 32px var(--page-padding) 0; }
        .cx__grid {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          grid-template-rows: repeat(6, minmax(52px, 1fr));
          gap: 8px;
          height: min(78vh, 720px);
        }
        .cx__cell { position: relative; overflow: hidden; }
        .cx__name {
          grid-column: 1 / 8; grid-row: 1 / 5;
          background: ${INK}; color: #fff;
          padding: clamp(20px, 3vw, 40px);
          display: flex; flex-direction: column; justify-content: flex-end;
        }
        .cx__name h1 {
          font-family: var(--font-heading); font-weight: 800;
          font-size: clamp(2.4rem, 6.2vw, 5.8rem); line-height: 0.92;
          letter-spacing: -0.02em; text-transform: uppercase; margin: 0;
        }
        .cx__name p {
          margin: 18px 0 0; font-size: clamp(0.9rem, 1.2vw, 1.05rem);
          letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.8;
        }
        .cx__img-a { grid-column: 8 / 13; grid-row: 1 / 5; }
        .cx__red { grid-column: 1 / 3; grid-row: 5 / 7; background: ${RED}; }
        .cx__red::after {
          content: ''; position: absolute; inset: 18%;
          border-radius: 50%; background: #f1ede4;
        }
        .cx__yellow {
          grid-column: 3 / 6; grid-row: 5 / 7; background: ${YELLOW}; color: ${INK};
          padding: 16px 18px; display: flex; flex-direction: column; justify-content: space-between;
          font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.78rem;
        }
        .cx__yellow b { font-size: clamp(1.6rem, 3vw, 2.6rem); letter-spacing: -0.02em; line-height: 1; }
        .cx__img-b { grid-column: 6 / 10; grid-row: 5 / 7; }
        .cx__blue {
          grid-column: 10 / 13; grid-row: 5 / 7; background: ${BLUE}; color: #fff;
          text-decoration: none; padding: 16px 18px;
          display: flex; flex-direction: column; justify-content: space-between;
          text-transform: uppercase; letter-spacing: 0.14em; font-weight: 700; font-size: 0.8rem;
          transition: background 0.15s;
        }
        .cx__blue:hover { background: #163b78; }
        .cx__blue span:last-child { font-size: 1.6rem; letter-spacing: 0; }
        .cx__caption {
          position: absolute; left: 0; bottom: 0; background: ${INK}; color: #fff;
          font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase;
          padding: 6px 10px; font-weight: 500;
        }
        @media (max-width: 860px) {
          .cx__grid { height: auto; grid-template-rows: none; grid-auto-rows: minmax(90px, auto); }
          .cx__name { grid-column: 1 / 13; grid-row: auto; min-height: 260px; }
          .cx__img-a { grid-column: 1 / 13; grid-row: auto; aspect-ratio: 4 / 3; }
          .cx__red { grid-column: 1 / 5; grid-row: auto; aspect-ratio: 1; }
          .cx__yellow { grid-column: 5 / 13; grid-row: auto; }
          .cx__img-b { grid-column: 1 / 13; grid-row: auto; aspect-ratio: 16 / 9; }
          .cx__blue { grid-column: 1 / 13; grid-row: auto; min-height: 96px; }
        }
      `}</style>
      <div className="cx__grid">
        <div className="cx__cell cx__name">
          <h1>{artistName}</h1>
          <p>{tagline}</p>
        </div>
        {a ? (
          <Link href={`/artwork/${a.slug}`} className="cx__cell cx__img-a">
            <Image src={a.imageUrl} alt={a.title} fill sizes="(max-width: 860px) 100vw, 42vw" style={{ objectFit: 'cover' }} priority />
            <span className="cx__caption">{a.title}</span>
          </Link>
        ) : null}
        <div className="cx__cell cx__red" aria-hidden />
        <div className="cx__cell cx__yellow">
          <span>Prints</span>
          <b>Editions</b>
          <span>Made to order</span>
        </div>
        {b ? (
          <Link href={`/artwork/${b.slug}`} className="cx__cell cx__img-b">
            <Image src={b.imageUrl} alt={b.title} fill sizes="(max-width: 860px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
            <span className="cx__caption">{b.title}</span>
          </Link>
        ) : null}
        <Link href="/gallery" className="cx__cell cx__blue">
          <span>The work</span>
          <span>→</span>
        </Link>
      </div>
    </section>
  )
}
