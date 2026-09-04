import * as React from 'react'

import { TOKENS } from '../theme-tokens'
import type { BuilderStage } from '../types'

const STAGES: { id: BuilderStage; label: string }[] = [
  { id: 'format', label: 'Format' },
  { id: 'size', label: 'Size' },
  { id: 'customize', label: 'Customize' },
]

export function StageProgress({
  current,
  onJumpTo,
  canJumpTo,
}: {
  current: BuilderStage
  onJumpTo: (s: BuilderStage) => void
  // Lets the parent gate navigation — e.g. the customer can't jump to
  // Customize until they've picked a size.
  canJumpTo: (s: BuilderStage) => boolean
}) {
  const currentIdx = STAGES.findIndex((s) => s.id === current)
  return (
    <ol className="pbv2-progress">
      {STAGES.map((stage, idx) => {
        const done = idx < currentIdx
        const active = idx === currentIdx
        const reachable = canJumpTo(stage.id)
        return (
          <li
            key={stage.id}
            className={`pbv2-progress-item ${active ? 'pbv2-progress-item--active' : ''} ${done ? 'pbv2-progress-item--done' : ''}`}
          >
            <button
              type="button"
              onClick={() => reachable && onJumpTo(stage.id)}
              disabled={!reachable}
              className="pbv2-progress-btn"
              aria-current={active ? 'step' : undefined}
            >
              <span className="pbv2-progress-dot" aria-hidden>
                {done ? '✓' : idx + 1}
              </span>
              <span className="pbv2-progress-label">{stage.label}</span>
            </button>
            {idx < STAGES.length - 1 ? (
              <span className="pbv2-progress-rail" aria-hidden />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

// Injected once by the shell's single <style> (see ProductBuilderV3.tsx).
export const STAGE_PROGRESS_CSS = `
.pbv2-progress {
  display: flex;
  align-items: center;
  gap: 0;
  list-style: none;
  margin: 0;
  padding: 0;
}
.pbv2-progress-item {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}
.pbv2-progress-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${TOKENS.secondary};
  font-family: ${TOKENS.fontBody};
  font-size: 0.85rem;
  transition: color 0.15s;
}
.pbv2-progress-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.pbv2-progress-btn:focus { outline: none; }
.pbv2-progress-btn:focus-visible {
  outline: 2px solid ${TOKENS.primary};
  outline-offset: 2px;
  border-radius: ${TOKENS.controlRadius};
}
.pbv2-progress-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${TOKENS.bg};
  border: 1px solid ${TOKENS.border};
  color: ${TOKENS.secondary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex: 0 0 24px;
}
.pbv2-progress-item--active .pbv2-progress-btn { color: ${TOKENS.primary}; font-weight: 600; }
.pbv2-progress-item--active .pbv2-progress-dot {
  background: ${TOKENS.primary};
  color: ${TOKENS.bg};
  border-color: ${TOKENS.primary};
}
.pbv2-progress-item--done .pbv2-progress-dot {
  background: ${TOKENS.accent};
  color: ${TOKENS.bg};
  border-color: ${TOKENS.accent};
}
.pbv2-progress-rail {
  flex: 1;
  height: 1px;
  background: ${TOKENS.border};
  margin: 0 4px;
}
`
