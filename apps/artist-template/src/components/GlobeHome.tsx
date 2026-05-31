'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Interactive 3D globe home for the travel preset. Each trip is a pin at its
// real coordinates; hovering shows the gallery's cover, clicking opens it (or a
// chooser when trips share a location). The globe surface is a hosted earth
// texture (declarative — needs no ref). Auto-rotation and framing use a
// callback ref so we reliably get the globe instance once it mounts. The
// server-rendered galleries grid below (in the page) is the no-JS fallback.

export type GalleryPin = {
  slug: string
  name: string
  lat: number
  lng: number
  coverImageUrl?: string | null
}

type Cluster = { lat: number; lng: number; galleries: GalleryPin[] }

type GlobeInstance = {
  controls: () => { autoRotate: boolean; autoRotateSpeed: number; enableZoom: boolean }
  pointOfView: (pov: { lat: number; lng: number; altitude: number }, ms?: number) => void
}

export default function GlobeHome({
  galleries,
  accent,
  atmosphere,
}: {
  galleries: GalleryPin[]
  accent: string
  atmosphere: string
}) {
  const router = useRouter()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [Globe, setGlobe] = useState<React.ComponentType<Record<string, unknown>> | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [active, setActive] = useState<Cluster | null>(null)

  // Group trips at the same place (rounded to ~1°) into one pin + chooser.
  const clusters = useMemo<Cluster[]>(() => {
    const byKey = new Map<string, GalleryPin[]>()
    for (const g of galleries) {
      const key = `${Math.round(g.lat)},${Math.round(g.lng)}`
      const arr = byKey.get(key)
      if (arr) arr.push(g)
      else byKey.set(key, [g])
    }
    return Array.from(byKey.values()).map((gs) => ({
      lat: gs.reduce((s, g) => s + g.lat, 0) / gs.length,
      lng: gs.reduce((s, g) => s + g.lng, 0) / gs.length,
      galleries: gs,
    }))
  }, [galleries])
  const clustersRef = useRef(clusters)
  clustersRef.current = clusters
  const instanceRef = useRef<GlobeInstance | null>(null)

  // Browser-only import — keeps react-globe.gl/three out of SSR.
  useEffect(() => {
    let alive = true
    import('react-globe.gl').then((mod) => {
      if (alive) setGlobe(() => mod.default as unknown as React.ComponentType<Record<string, unknown>>)
    })
    return () => {
      alive = false
    }
  }, [])

  // Responsive canvas size.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const apply = () =>
      setSize({ w: el.clientWidth, h: Math.min(Math.round(el.clientWidth * 0.8), 560) })
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Callback ref: fires with the globe instance the moment React attaches it.
  // controls()/pointOfView() may not be ready on the first tick, so retry on
  // animation frames until they are, then auto-rotate and frame the trips.
  const configureGlobe = useCallback((instance: GlobeInstance | null) => {
    instanceRef.current = instance
    if (!instance) return
    let tries = 0
    const cfg = () => {
      let controls: ReturnType<GlobeInstance['controls']> | null = null
      try {
        controls = instance.controls?.() ?? null
      } catch {
        controls = null
      }
      if (!controls) {
        if (tries++ < 120) requestAnimationFrame(cfg)
        return
      }
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.5
      controls.enableZoom = false
      const cl = clustersRef.current
      if (cl.length) {
        const mid = cl[Math.floor(cl.length / 2)]
        try {
          instance.pointOfView({ lat: mid.lat, lng: mid.lng, altitude: 2.3 }, 0)
        } catch {
          /* not ready; harmless */
        }
      }
    }
    cfg()
  }, [])

  return (
    <section
      ref={wrapRef}
      aria-label="Map of trips"
      style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 32 }}
    >
      {Globe && size.w > 0 ? (
        <Globe
          ref={configureGlobe as unknown as undefined}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          showAtmosphere
          atmosphereColor={atmosphere}
          atmosphereAltitude={0.18}
          pointsData={clusters as unknown as object[]}
          pointLat={(d: object) => (d as Cluster).lat}
          pointLng={(d: object) => (d as Cluster).lng}
          pointColor={() => accent}
          pointAltitude={0.12}
          pointRadius={1.6}
          pointResolution={24}
          pointsMerge={false}
          pointLabel={(d: object) => {
            // Hover tooltip: the gallery's cover image (or a montage for a
            // cluster) plus its name.
            const c = d as Cluster
            const card = (g: GalleryPin) =>
              `<figure style="margin:0;text-align:center">` +
              (g.coverImageUrl
                ? `<img src="${g.coverImageUrl}" alt="" style="display:block;width:168px;height:108px;object-fit:cover;border-radius:6px"/>`
                : '') +
              `<figcaption style="margin-top:6px;font:600 13px system-ui,sans-serif;color:#fff">${g.name}</figcaption>` +
              `</figure>`
            return (
              `<div style="display:flex;gap:10px;padding:8px;background:rgba(20,15,10,0.9);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.45)">` +
              c.galleries.map(card).join('') +
              `</div>`
            )
          }}
          onPointHover={(pt: object | null) => {
            // Pause auto-rotation while a pin is hovered.
            const controls = instanceRef.current?.controls?.()
            if (controls) controls.autoRotate = !pt
          }}
          onPointClick={(d: object) => {
            const c = d as Cluster
            if (c.galleries.length === 1) router.push(`/gallery/${c.galleries[0].slug}`)
            else setActive(c)
          }}
        />
      ) : (
        <div style={{ width: '100%', height: 'min(80vw, 560px)' }} aria-hidden />
      )}

      {active ? (
        <div
          role="dialog"
          aria-label="Choose a trip"
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: 16,
            boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
            minWidth: 220,
            zIndex: 5,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <strong style={{ fontFamily: 'var(--font-heading)' }}>Trips here</strong>
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close"
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-secondary)', fontSize: '1.1rem', lineHeight: 1 }}
            >
              ×
            </button>
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {active.galleries.map((g) => (
              <li key={g.slug}>
                <button
                  type="button"
                  onClick={() => router.push(`/gallery/${g.slug}`)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg)',
                    color: 'var(--color-primary)',
                    borderRadius: 6,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                  }}
                >
                  {g.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
