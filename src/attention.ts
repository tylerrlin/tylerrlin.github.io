// A tiny channel from the DOM to the penguin: where on screen something
// interesting is happening, so it can glance there. Read every frame, so it's
// a plain mutable object rather than React state — pointer moves re-render nothing.
//
// Two sources, in priority order:
//   1. focus: a menu item or panel title was selected (`lookAt`). The penguin
//      turns to it and holds for a few seconds.
//   2. pointer: a fine pointer moving over the page. Followed calmly between
//      focus glances, and dropped once it goes stale so idle glances resume.

export type AttentionKind = 'menu' | 'panel'

export const attention = {
  version: 0,
  kind: 'menu' as AttentionKind,
  // Viewport (client) coordinates of the thing to look at.
  x: 0,
  y: 0,
}

export function lookAt(el: Element | null, kind: AttentionKind) {
  if (!el) return
  const r = el.getBoundingClientRect()
  attention.x = r.left + Math.min(r.width, 240) / 2
  attention.y = r.top + r.height / 2
  attention.kind = kind
  attention.version++
}

const POINTER_STALE_MS = 2600

export const pointer = {
  x: 0,
  y: 0,
  at: -Infinity, // performance.now() of the last move
  inside: false,
}

/** The latest pointer position, or null when it's stale or off the page. */
export function currentPointer(now: number) {
  if (!pointer.inside || now - pointer.at > POINTER_STALE_MS) return null
  return pointer
}

let installed = false

/** Follow a fine pointer (mouse/pen) across the page. Touch is ignored. */
export function installPointerTracking() {
  if (installed || typeof window === 'undefined') return
  installed = true
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch') return
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.at = performance.now()
      pointer.inside = true
    },
    { passive: true },
  )
  document.documentElement.addEventListener('pointerleave', () => {
    pointer.inside = false
  })
}
