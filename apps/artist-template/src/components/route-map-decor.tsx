// Antique-map decoration for the travel route mini-map. Hand-drawn SVG line-art
// motifs in a sepia "old map" style, chosen by the trip's region. Pure SVG —
// rendered server-side inside GalleryGrid's route map. Not photoreal engravings;
// stylized iconography (a sea serpent, a galleon, wind-faces, waves, a compass).

import type { ReactElement } from 'react'

const INK = '#6b5538' // sepia line colour

export type MapRegion = 'asian' | 'european' | 'generic'

// Rough region buckets from the trip's centre coordinate.
export function regionForCoords(lat: number, lng: number): MapRegion {
  if (lng >= 95 && lng <= 155 && lat >= -10 && lat <= 55) return 'asian'
  if (lng >= -25 && lng <= 45 && lat >= 28 && lat <= 72) return 'european'
  return 'generic'
}

type Spot = { cx: number; cy: number; s?: number; flip?: boolean }

function CompassRose({ cx, cy, s = 1 }: Spot): ReactElement {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`} stroke={INK} strokeWidth={1.1} opacity={0.7}>
      <circle r={24} fill="none" />
      <circle r={18} fill="none" />
      <path d="M0 0 L9 -9 L0 -13 L-9 -9 Z" fill={INK} fillOpacity={0.25} transform="rotate(45)" />
      <path d="M0 0 L9 -9 L0 -13 L-9 -9 Z" fill={INK} fillOpacity={0.25} transform="rotate(135)" />
      <path d="M0 -28 L5 0 L0 6 L-5 0 Z" fill={INK} fillOpacity={0.55} />
      <path d="M0 28 L5 0 L0 -6 L-5 0 Z" fill="none" />
      <path d="M28 0 L0 5 L-6 0 L0 -5 Z" fill={INK} fillOpacity={0.55} />
      <path d="M-28 0 L0 5 L6 0 L0 -5 Z" fill="none" />
      <circle r={2.2} fill={INK} stroke="none" />
      <text x={0} y={-30} textAnchor="middle" fontSize={7} fill={INK} stroke="none" fontFamily="Georgia, serif">
        N
      </text>
    </g>
  )
}

function SeaSerpent({ cx, cy, s = 1, flip = false }: Spot): ReactElement {
  return (
    <g
      transform={`translate(${cx} ${cy}) scale(${flip ? -s : s} ${s})`}
      stroke={INK}
      strokeWidth={1.4}
      fill="none"
      strokeLinecap="round"
      opacity={0.6}
    >
      <path d="M-32 4 q 6 -11 12 0 q 6 11 12 0 q 6 -11 12 0" />
      <path d="M4 4 q 9 -1 13 -8" />
      <path d="M15 -6 q 6 -5 11 -1 q 3 3 -1 6 q -5 3 -10 -1 z" fill={INK} fillOpacity={0.5} />
      <circle cx={20} cy={-5} r={0.9} fill="#fff" stroke="none" />
      <path d="M26 -7 l 6 -2 M26 -4 l 6 1" />
    </g>
  )
}

function Galleon({ cx, cy, s = 1 }: Spot): ReactElement {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`} stroke={INK} strokeWidth={1.2} fill="none" opacity={0.6}>
      <path d="M-17 3 q 17 13 34 0 l -4 6 q -13 6 -26 0 z" fill={INK} fillOpacity={0.16} />
      <line x1={-7} y1={3} x2={-7} y2={-20} />
      <line x1={7} y1={3} x2={7} y2={-23} />
      <path d="M-7 -17 q 10 3 0 15 z" fill={INK} fillOpacity={0.12} />
      <path d="M7 -20 q 10 3 0 17 z" fill={INK} fillOpacity={0.12} />
      <path d="M7 -23 l 9 2 l -9 3 z" fill={INK} fillOpacity={0.3} />
    </g>
  )
}

function WindFace({ cx, cy, s = 1, flip = false }: Spot): ReactElement {
  return (
    <g
      transform={`translate(${cx} ${cy}) scale(${flip ? -s : s} ${s})`}
      stroke={INK}
      strokeWidth={1.1}
      fill="none"
      opacity={0.55}
    >
      <circle r={11} fill={INK} fillOpacity={0.06} />
      <circle cx={-12} cy={2} r={4} />
      <circle cx={12} cy={2} r={4} />
      <circle cx={-4} cy={-2} r={1} fill={INK} stroke="none" />
      <circle cx={4} cy={-2} r={1} fill={INK} stroke="none" />
      <path d="M-3 4 q 3 3 6 0" />
      <path d="M16 0 q 15 -2 23 5 q -7 1 -11 -2" />
      <path d="M16 5 q 12 2 18 9" />
    </g>
  )
}

function Wave({ cx, cy, s = 1 }: Spot): ReactElement {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`} stroke={INK} strokeWidth={1.1} fill="none" opacity={0.4} strokeLinecap="round">
      <path d="M0 0 q 8 -8 16 0 q 4 4 9 2" />
      <path d="M14 -1 q 3 -6 8 -3 q 2 2 0 5 q -2 2 -4 0" />
    </g>
  )
}

// Compose the motifs for a region. Positioned in the corners/edges (usually sea
// or empty), away from the route which sits toward the centre.
export function RouteDecor({ region, w, h }: { region: MapRegion; w: number; h: number }): ReactElement {
  const items: ReactElement[] = [<CompassRose key="compass" cx={46} cy={h - 46} s={1} />]
  if (region === 'asian') {
    items.push(
      <WindFace key="wind1" cx={w - 64} cy={52} s={1.1} flip />,
      <WindFace key="wind2" cx={66} cy={60} s={0.8} />,
      <Wave key="wave1" cx={w - 150} cy={h - 44} s={1.2} />,
      <Wave key="wave2" cx={w - 92} cy={h - 64} s={0.95} />,
      <Wave key="wave3" cx={w - 56} cy={h - 40} s={0.8} />,
    )
  } else if (region === 'european') {
    items.push(
      <SeaSerpent key="serpent" cx={w - 120} cy={62} s={1.15} />,
      <Galleon key="galleon" cx={104} cy={62} s={1.05} />,
      <WindFace key="wind1" cx={w - 58} cy={h - 56} s={0.8} flip />,
    )
  } else {
    items.push(
      <SeaSerpent key="serpent" cx={w - 116} cy={h - 56} s={0.9} />,
      <Wave key="wave1" cx={w - 96} cy={58} s={1.2} />,
      <Wave key="wave2" cx={116} cy={h - 52} s={1} />,
    )
  }
  return <g aria-hidden>{items}</g>
}
