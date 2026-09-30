// A tiny channel from the DOM to the penguin: where on screen something
// interesting is happening, so it can glance there. Read every frame, so it's
// a plain mutable object rather than React state.

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
