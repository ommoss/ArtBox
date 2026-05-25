'use client'

import * as React from 'react'

import { TOKENS } from '../theme-tokens'
import type { RoomBackground } from '../types'

import { CURATED_ROOMS } from './curated-rooms'

// Lets the customer pick between:
//   - No room (default, plain preview)
//   - One of N curated rooms (correctly scaled)
//   - Their own uploaded wall photo (scale is best-effort; customer drags
//     the framed piece to fit visually)
//
// Sits as a horizontal strip near the top of the preview column.

type Props = {
  active: RoomBackground | null
  onChange: (room: RoomBackground | null) => void
}

export function RoomPicker({ active, onChange }: Props) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : ''
      if (!dataUrl) return
      onChange({
        id: `upload-${Date.now()}`,
        label: 'Your photo',
        imageUrl: dataUrl,
        // Without calibration we guess at a typical room photo scale. The
        // customer can still drag-resize the framed piece to fit their wall.
        pxPerIn: 8,
        anchor: { x: 0.5, y: 0.4 },
      })
    }
    reader.readAsDataURL(file)
    // Reset so the same file can be re-picked if needed.
    e.target.value = ''
  }

  const roomKey = (r: RoomBackground) =>
    r.id ?? r.imageUrl ?? r.backgroundCss ?? ''
  const activeKey = active ? roomKey(active) : null

  return (
    <>
      <style>{CSS}</style>
      <div className="pbv2-room-picker">
        <div className="pbv2-room-picker-head">
          <span className="pbv2-room-picker-label">View on a wall</span>
          {active ? (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="pbv2-room-clear"
            >
              Remove
            </button>
          ) : null}
        </div>
        <div className="pbv2-room-strip">
          <button
            type="button"
            onClick={() => onChange(null)}
            className={`pbv2-room-chip ${active === null ? 'pbv2-room-chip--active' : ''}`}
            aria-pressed={active === null}
          >
            None
          </button>
          {CURATED_ROOMS.map((room) => {
            const key = roomKey(room)
            const isActive = activeKey === key
            // Gradient wall presets use CSS background; photo rooms use a
            // background image. Either way the chip shows a preview of the
            // wall it represents.
            const chipBg: React.CSSProperties = room.backgroundCss
              ? { background: room.backgroundCss }
              : room.imageUrl
                ? {
                    backgroundImage: `url(${room.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : {}
            // Choose label color for contrast against the chip background.
            // Dark walls (charcoal) need a light label; bright walls need dark.
            const isDark = key === 'wall-charcoal'
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange(room)}
                className={`pbv2-room-chip pbv2-room-chip--thumb ${isActive ? 'pbv2-room-chip--active' : ''}`}
                aria-pressed={isActive}
                title={room.label}
                style={chipBg}
              >
                <span
                  className="pbv2-room-chip-label"
                  style={{
                    color: isDark ? '#fff' : '#1a1410',
                    textShadow: isDark
                      ? '0 1px 3px rgba(0,0,0,0.6)'
                      : '0 1px 2px rgba(255,255,255,0.6)',
                  }}
                >
                  {room.label}
                </span>
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="pbv2-room-chip pbv2-room-chip--upload"
          >
            + Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            style={{ display: 'none' }}
            aria-hidden
          />
        </div>
      </div>
    </>
  )
}

const CSS = `
.pbv2-room-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: ${TOKENS.surface};
  border: 1px solid ${TOKENS.border};
  border-radius: 6px;
  font-family: ${TOKENS.fontBody};
}
.pbv2-room-picker-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pbv2-room-picker-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${TOKENS.primary};
  font-weight: 600;
}
.pbv2-room-clear {
  background: transparent;
  border: none;
  color: ${TOKENS.secondary};
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: underline;
}
.pbv2-room-clear:hover { color: ${TOKENS.primary}; }
.pbv2-room-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.pbv2-room-chip {
  flex: 0 0 auto;
  position: relative;
  min-width: 72px;
  height: 56px;
  border: 1px solid ${TOKENS.border};
  border-radius: 4px;
  background: ${TOKENS.bg};
  color: ${TOKENS.primary};
  font-size: 0.8rem;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-family: ${TOKENS.fontBody};
}
.pbv2-room-chip:hover { border-color: ${TOKENS.primary}; }
.pbv2-room-chip:focus { outline: none; }
.pbv2-room-chip:focus-visible {
  outline: 2px solid ${TOKENS.primary};
  outline-offset: 2px;
}
.pbv2-room-chip--active {
  border-color: ${TOKENS.primary};
  box-shadow: 0 0 0 1px ${TOKENS.primary};
}
.pbv2-room-chip--thumb {
  background-size: cover;
  background-position: center;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.6);
  min-width: 80px;
}
.pbv2-room-chip--upload {
  border-style: dashed;
  color: ${TOKENS.secondary};
}
.pbv2-room-chip-label {
  position: absolute;
  bottom: 4px;
  left: 6px;
  font-size: 0.7rem;
  font-weight: 500;
}
`
