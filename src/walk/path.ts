import { stations, type Station } from '../resume'

// The resume walk, in world units (the penguin is 1.334 tall, feet at y = 0).
// The path runs along +z, toward the bird's-eye camera, so walking forward
// moves the world up the screen like scrolling a page. Everything here is
// pure math shared by the DOM layer (layout, input) and the scene (drawing).

/** Bird's-eye framing for a viewport. */
export type Bird = {
  vw: number
  vh: number
  wide: boolean
  /** Camera tilt below the horizon, radians. */
  pitch: number
  /** Screen pixels per world unit at the penguin. */
  ppu: number
  /** Screen pixels per world unit of travel along the path (ppu foreshortened). */
  alongPx: number
  /** tan(fov / 2) over the viewport height: a long lens, so the snow reads flat. */
  tanHalf: number
  dist: number
  /** Where the penguin is held, as a share of the viewport height. */
  centerY: number
  /** Lateral sway of the path, world units. */
  sway: number
}

const PITCH = (64 * Math.PI) / 180
const TAN_HALF = Math.tan((6 * Math.PI) / 180)
/** Long lenses still foreshorten a little across the screen; pad spacing for it. */
const PERSPECTIVE_PAD = 1.08

/** The timeline layout (text either side of the path) needs this much width. */
export const WIDE_MIN = 720

export function birdFor(vw: number, vh: number): Bird {
  const wide = vw >= WIDE_MIN
  const ppu = Math.min(96, Math.max(50, Math.min(vh / 10.5, vw / 4.4)))
  return {
    vw,
    vh,
    wide,
    pitch: PITCH,
    ppu,
    alongPx: ppu * Math.sin(PITCH),
    tanHalf: TAN_HALF,
    dist: vh / (2 * ppu * TAN_HALF),
    centerY: wide ? 0.5 : 0.4,
    sway: wide ? 0.55 : 0.16,
  }
}

// --- The path: x as a gentle function of z ---------------------------------

const WAVELENGTH = 15

/** Fades the sway in over the first few units so the walk starts straight. */
function swayRamp(z: number) {
  const t = Math.min(1, Math.max(0, z / 6))
  return t * t * (3 - 2 * t)
}

export function pathX(z: number, sway: number) {
  return sway * swayRamp(z) * Math.sin((z / WAVELENGTH) * Math.PI * 2)
}

/** dx/dz along the path. */
export function pathSlope(z: number, sway: number) {
  const h = 0.01
  return (pathX(z + h, sway) - pathX(z - h, sway)) / (2 * h)
}

// --- Placement: where each block of text sits relative to its stop ---------

/** Screen gap between the path and the text column (wide). */
export const COLUMN_GAP = 54
/** Text is centered on the penguin's body, which stands above its feet. */
export const BODY_LIFT = 18
/** Narrow: text hangs below the stop, clear of the feet and shadow. */
export const BELOW = 34
/** Narrow: room for the penguin to stand between one block and the next stop. */
const STAND_ROOM = 72
export const GUTTER = 20

export function sideOf(s: Station): 'left' | 'right' {
  return s.kind === 'line' ? 'right' : 'left'
}

/**
 * Lay the stops along the path from measured text heights (CSS px), so every
 * block has room at the bird's-eye scale. Returns each stop's z.
 */
export function layoutStops(heights: number[], bird: Bird): number[] {
  const z: number[] = [0]
  for (let i = 1; i < stations.length; i++) {
    const a = heights[i - 1] ?? 0
    const b = heights[i] ?? 0
    const sectionBreak = stations[i].kind === 'section'
    let px: number
    if (bird.wide) {
      // Blocks are centered on their stops; leave a gutter between neighbors.
      px = Math.max(96, (a + b) / 2 + (sectionBreak ? 92 : 34))
    } else {
      px = BELOW + a + STAND_ROOM + (sectionBreak ? 36 : 0)
    }
    let zi = z[i - 1] + (px / bird.alongPx) * PERSPECTIVE_PAD
    if (bird.wide) {
      // A pinned header rides down to its last bullet before letting go, so
      // the next block on its side must clear it there, not where it began.
      for (let j = i - 1; j >= 0; j--) {
        if (sideOf(stations[j]) !== sideOf(stations[i])) continue
        const clear = (heights[j] + b) / 2 + (sectionBreak ? 92 : 40)
        zi = Math.max(zi, z[stickyEnd[j]] + (clear / bird.alongPx) * PERSPECTIVE_PAD)
        break
      }
    }
    z.push(zi)
  }
  return z
}

/**
 * The last stop each block stays pinned through, beside the penguin (wide
 * only): an entry's header holds while its bullets go by. Other blocks pin
 * through their own stop only.
 */
export const stickyEnd: number[] = stations.map((s, i) => {
  let end = i
  if (s.kind === 'entry') {
    while (end + 1 < stations.length && stations[end + 1].kind === 'line' && stations[end + 1].entry === s.entry) end++
  }
  return end
})

/** Index of the stop nearest to z. */
export function nearestStop(z: number, stops: number[]) {
  let best = 0
  for (let i = 1; i < stops.length; i++) if (Math.abs(stops[i] - z) < Math.abs(stops[best] - z)) best = i
  return best
}
