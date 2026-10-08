import Link from 'next/link'

// Home hero for the skeuomorphic travel preset: a wooden desk seen from
// above. An open notebook carries the name in handwriting; polaroids with
// tape, a postcard of the latest journey with a passport stamp, and a luggage
// tag that opens the journal. All drawn in CSS, no image assets.

type Polaroid = { slug: string; title: string; imageUrl: string; location?: string | null }

export default function DeskHero({
  artistName,
  tagline,
  polaroids,
  journey,
}: {
  artistName: string
  tagline: string
  polaroids: Polaroid[]
  journey: { slug: string; name: string; coverImageUrl?: string | null; place?: string | null; year?: number | null } | null
}) {
  const [p1, p2, p3] = polaroids
  const stamp = [journey?.name?.split(' ')[0], journey?.year].filter(Boolean).join(' · ')
  return (
    <section className="desk">
      <style>{`
        .desk {
          position: relative; overflow: hidden;
          padding: clamp(40px, 6vw, 80px) var(--page-padding) clamp(56px, 8vw, 110px);
          background:
            repeating-linear-gradient(92deg, rgba(0,0,0,0.035) 0 2px, transparent 2px 9px),
            repeating-linear-gradient(88deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 23px),
            linear-gradient(180deg, #7a5134, #6a432a 55%, #5c3922);
          box-shadow: inset 0 18px 30px -18px rgba(0,0,0,0.6), inset 0 -18px 30px -18px rgba(0,0,0,0.5);
        }
        .desk__inner {
          position: relative; max-width: var(--max-width); margin: 0 auto;
          display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: clamp(28px, 5vw, 64px); align-items: center;
        }
        .desk__book {
          position: relative; background: #fbf6ea; border-radius: 3px 10px 10px 3px; padding: 44px 36px 40px 64px;
          transform: rotate(-1.6deg);
          background-image:
            linear-gradient(90deg, transparent 46px, rgba(200,60,60,0.35) 46px 48px, transparent 48px),
            repeating-linear-gradient(180deg, transparent 0 31px, rgba(60,90,140,0.18) 31px 32px);
          box-shadow: 0 2px 2px rgba(0,0,0,0.25), 0 18px 34px rgba(0,0,0,0.45), inset 10px 0 18px -10px rgba(0,0,0,0.25);
        }
        .desk__book::before {
          content: ''; position: absolute; left: 14px; top: 18px; bottom: 18px; width: 14px;
          background: radial-gradient(circle at 7px 7px, #6a432a 3.5px, transparent 4px) 0 0 / 14px 32px repeat-y;
        }
        .desk__hand { font-family: var(--font-caveat), cursive; color: #2c3e66; }
        .desk__book h1 { font-family: var(--font-caveat), cursive; font-weight: 700; font-size: clamp(2.6rem, 5vw, 4rem); line-height: 1; margin: 0 0 12px; color: #2c3e66; }
        .desk__book p { font-family: var(--font-caveat), cursive; font-size: 1.45rem; line-height: 32px; margin: 0; color: #3a3a3a; }
        .desk__tag {
          display: inline-flex; align-items: center; gap: 10px; margin-top: 22px; padding: 10px 18px 10px 26px;
          background: linear-gradient(#e9d3a6, #dcc08a); color: #3d2a17; text-decoration: none; position: relative;
          clip-path: polygon(14px 0, 100% 0, 100% 100%, 14px 100%, 0 50%);
          font-family: var(--font-caveat), cursive; font-size: 1.4rem; font-weight: 700;
          filter: drop-shadow(0 3px 4px rgba(0,0,0,0.3));
        }
        .desk__tag::before { content: ''; width: 9px; height: 9px; border-radius: 50%; background: #6a432a; box-shadow: inset 0 1px 2px rgba(0,0,0,0.5); }
        .desk__pile { position: relative; min-height: 470px; }
        .pol {
          position: absolute; background: #fdfdf9; padding: 10px 10px 40px; width: 46%;
          box-shadow: 0 1px 2px rgba(0,0,0,0.25), 0 14px 26px rgba(0,0,0,0.45); text-decoration: none; color: #333;
          transition: transform 0.2s ease;
        }
        .pol:hover { transform: rotate(0deg) scale(1.03) !important; z-index: 5; }
        .pol img { display: block; width: 100%; aspect-ratio: 1; object-fit: cover; filter: saturate(0.9) contrast(1.02); }
        .pol span { position: absolute; left: 12px; right: 12px; bottom: 8px; font-family: var(--font-caveat), cursive; font-size: 1.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pol::after {
          content: ''; position: absolute; top: -12px; left: 50%; width: 84px; height: 26px; transform: translateX(-50%) rotate(-3deg);
          background: rgba(235, 225, 190, 0.75); box-shadow: 0 1px 2px rgba(0,0,0,0.15);
        }
        .pol--1 { left: 2%; top: 6%; transform: rotate(-6deg); z-index: 2; }
        .pol--2 { right: 0; top: 0; transform: rotate(5deg); z-index: 1; }
        .pol--3 { left: 30%; top: 40%; transform: rotate(-1.5deg); z-index: 3; }
        .post {
          position: absolute; right: 2%; bottom: -2%; width: 52%; aspect-ratio: 3 / 2; background: #fbf6ea; padding: 8px;
          transform: rotate(3.5deg); z-index: 4; text-decoration: none; color: #3d2f23;
          box-shadow: 0 1px 2px rgba(0,0,0,0.25), 0 16px 30px rgba(0,0,0,0.45);
        }
        .post img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .post b {
          position: absolute; left: 18px; bottom: 16px; color: #fff; font-family: var(--font-caveat), cursive; font-size: 1.7rem;
          text-shadow: 0 2px 8px rgba(0,0,0,0.6);
        }
        .stamp {
          position: absolute; right: -16px; top: -30px; width: 104px; height: 104px; border-radius: 50%;
          border: 3px double rgba(160,40,40,0.85); color: rgba(160,40,40,0.9); transform: rotate(-14deg);
          display: flex; align-items: center; justify-content: center; text-align: center;
          font: 700 0.58rem/1.25 Georgia, serif; letter-spacing: 0.08em; text-transform: uppercase; padding: 16px;
          background: rgba(251,246,234,0.25); mix-blend-mode: multiply;
        }
        @media (max-width: 860px) {
          .desk__inner { grid-template-columns: 1fr; }
          .desk__pile { min-height: 400px; }
          .pol { width: 54%; }
          .post { width: 64%; }
        }
      `}</style>
      <div className="desk__inner">
        <div className="desk__book">
          <h1>{artistName}</h1>
          <p>{tagline}.</p>
          <p className="desk__hand">Photographs from the road, printed and posted to your door.</p>
          <Link href="/gallery" className="desk__tag">
            Open the journal →
          </Link>
        </div>
        <div className="desk__pile">
          {[p1, p2, p3].map((p, i) =>
            p ? (
              <Link key={p.slug} href={`/artwork/${p.slug}`} className={`pol pol--${i + 1}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt={p.title} />
                <span>{p.location || p.title}</span>
              </Link>
            ) : null,
          )}
          {journey?.coverImageUrl ? (
            <Link href={`/gallery/${journey.slug}`} className="post">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={journey.coverImageUrl} alt={journey.name} />
              <b>Greetings from {journey.place?.split(',')[0] || journey.name}</b>
              {stamp ? <span className="stamp">{stamp}</span> : null}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
