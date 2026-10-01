// A tiny channel from the DOM to the penguin: where on screen something
// interesting is happening, so it can glance there. Read every frame, so it's
// a plain mutable object rather than React state — pointer moves re-render nothing.
//
// Two sources, in priority order:
//   1. focus: a link was hovered or focused (`lookAt`). The penguin turns to it
//      and holds briefly.
//   2. pointer: a fine pointer moving over the page. Followed calmly between
//      focus glances, and dropped once it goes stale so idle glances resume.

export const attention = {
  version: 0,
  // Viewport (client) coordinates of the thing to look at.
  x: 0,
  y: 0,
}

export function lookAt(el: Element | null) {
  if (!el) return
  const r = el.getBoundingClientRect()
  attention.x = r.left + Math.min(r.width, 240) / 2
  attention.y = r.top + r.height / 2
  attention.version++
}

const POINTER_STALE_MS = 2600

const pointer = {
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
