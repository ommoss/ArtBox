import Link from 'next/link'

// Home hero for the brutalist fine-art preset. No decoration: the name set as
// large as the viewport allows, one photograph at its own proportions, and an
// index of editions as a plain table. Everything is a link and looks like one.

type Work = {
  slug?: string
  title?: string | null
  imageUrl?: string
  year?: number | null
  location?: string | null
  isLimitedEdition?: boolean
  editionSize?: number | null
}

export default function BrutalHero({
  artistName,
  tagline,
  works,
  total,
}: {
  artistName: string
  tagline: string
  works: Work[]
  total: number
}) {
  const rows = works.filter((w) => w.slug && w.imageUrl)
  const lead = rows[0]
  return (
    <section className="br">
      <style>{`
        .br { padding: 0 var(--page-padding); max-width: var(--max-width); margin: 0 auto; }
        .br__bar {
          display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;
          border-bottom: 2px solid #000; padding: 10px 0; font-size: 0.8rem; text-transform: uppercase;
        }
        .br__name {
          font-family: var(--font-heading); font-size: clamp(3rem, 11.5vw, 13rem); line-height: 0.82;
          letter-spacing: -0.045em; text-transform: uppercase; margin: 18px 0 14px; overflow-wrap: anywhere;
        }
        .br__grid { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); border-top: 2px solid #000; }
        .br__img { border-right: 2px solid #000; padding: 20px 20px 20px 0; }
        .br__img img { display: block; width: 100%; height: auto; max-height: 72vh; object-fit: contain; object-position: left top; }
        .br__img p { margin: 10px 0 0; font-size: 0.8rem; }
        .br__index { padding: 20px 0 20px 20px; }
        .br__index h2 { font-family: var(--font-heading); font-size: 1.4rem; margin: 0 0 12px; text-transform: uppercase; }
        .br__table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .br__table th { text-align: left; font-weight: 700; border-bottom: 2px solid #000; padding: 6px 8px 6px 0; text-transform: uppercase; }
        .br__table td { border-bottom: 1px solid #000; padding: 9px 8px 9px 0; vertical-align: top; }
        .br__table tr:hover td { background: #ffff00; }
        .br__table a { color: var(--color-accent); text-decoration: underline; text-underline-offset: 2px; }
        .br__table .num { width: 3.2em; }
        .br__more { display: inline-block; margin-top: 18px; color: #000; font-weight: 700; text-transform: uppercase; }
        .br__more:hover { background: #000; color: #fff; }
        @media (max-width: 860px) {
          .br__grid { grid-template-columns: 1fr; }
          .br__img { border-right: none; border-bottom: 2px solid #000; padding-right: 0; }
          .br__index { padding-left: 0; }
          .br__table .loc { display: none; }
        }
      `}</style>
      <div className="br__bar">
        <span>{tagline}</span>
        <span>
          {total} works · printed to order · Victoria BC
        </span>
      </div>
      <h1 className="br__name">{artistName}</h1>
      <div className="br__grid">
        {lead ? (
          <div className="br__img">
            <Link href={`/artwork/${lead.slug}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lead.imageUrl} alt={lead.title ?? ''} />
            </Link>
            <p>
              FIG. 1 — {lead.title}
              {lead.year ? `, ${lead.year}` : ''}
            </p>
          </div>
        ) : null}
        <div className="br__index">
          <h2>Index of editions</h2>
          <table className="br__table">
            <thead>
              <tr>
                <th className="num">No.</th>
                <th>Title</th>
                <th className="loc">Place</th>
                <th>Year</th>
                <th>Edition</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w, i) => (
                <tr key={w.slug}>
                  <td className="num">{String(i + 1).padStart(3, '0')}</td>
                  <td>
                    <Link href={`/artwork/${w.slug}`}>{w.title}</Link>
                  </td>
                  <td className="loc">{w.location ?? '—'}</td>
                  <td>{w.year ?? '—'}</td>
                  <td>{w.isLimitedEdition && w.editionSize ? `1/${w.editionSize}` : 'Open'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link href="/gallery" className="br__more">
            → Full catalogue
          </Link>
        </div>
      </div>
    </section>
  )
}
