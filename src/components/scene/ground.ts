import { stations } from '../../resume'
import { pathX } from '../../walk/path'

// The snowfield under the resume walk, drawn on a 2D canvas that sits beneath
// the text (so prints and the trail never cover a word) while the penguin, in
// WebGL, walks over both. Every mark is a world point run through the scene
// camera, so the ground tilts, zooms and scrolls with the 3D view exactly.

export type ScreenPoint = { x: number; y: number }
/** World → viewport px, or false when the point is behind the camera. */
export type Project = (x: number, y: number, z: number, out: ScreenPoint) => boolean

export type Print = { x: number; z: number; heading: number; side: number }

// A light ice blue for shading, navy for marks; facets lit from the upper left.
const TRAIL = 'rgba(132, 148, 176, '
const TRAIL_LAYERS: [number, number][] = [
  [0.6, 0.075],
  [0.3, 0.07],
]
const RIDGE_SHADE = 'rgba(150, 162, 186, '
const MARKER = {
  section: { lit: '#ee962a', shade: '#d27a14', r: 0.2 },
  entry: { lit: '#434c67', shade: '#1f2536', r: 0.13 },
  line: { lit: '#59627c', shade: '#3a4257', r: 0.06 },
}

/** Wind-carved ridges (sastrugi) scattered over the field, seeded so they stay put. */
type Ridge = { x: number; z: number; len: number; ang: number; bend: number }

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function makeRidges(zFrom: number, zTo: number): Ridge[] {
  const rand = mulberry32(7)
  const out: Ridge[] = []
  const count = Math.round((zTo - zFrom) * 32 * 0.2)
  for (let i = 0; i < count; i++) {
    out.push({
      x: (rand() - 0.5) * 32,
      z: zFrom + rand() * (zTo - zFrom),
      len: 0.35 + rand() * 0.9,
      ang: -0.35 + (rand() - 0.5) * 0.3, // the wind blows from one quarter
      bend: (rand() - 0.5) * 0.5,
    })
  }
  return out.sort((a, b) => a.z - b.z)
}

const p0: ScreenPoint = { x: 0, y: 0 }
const p1: ScreenPoint = { x: 0, y: 0 }
const p2: ScreenPoint = { x: 0, y: 0 }
const p3: ScreenPoint = { x: 0, y: 0 }
const p4: ScreenPoint = { x: 0, y: 0 }

export type GroundFrame = {
  ctx: CanvasRenderingContext2D
  project: Project
  /** Overall opacity: the field fades in as the camera tips over. */
  alpha: number
  /** Screen px per world unit at the penguin. */
  unit: number
  pos: number
  sway: number
  /** z half-range worth drawing around the penguin. */
  reach: number
  stops: number[]
  /** 0..1 emphasis per stop. */
  emphasis: number[]
  prints: Print[]
  printCount: number
  ridges: Ridge[]
}

export function drawGround(f: GroundFrame) {
  const { ctx, project, alpha, unit, pos, sway, reach, stops } = f
  const zMin = pos - reach
  const zMax = pos + reach
  const fade = (z: number) => {
    const d = Math.abs(z - pos) / reach
    return d >= 1 ? 0 : d < 0.7 ? 1 : 1 - (d - 0.7) / 0.3
  }

  // Ridges: a bright crest over a soft shadow, like light raking the snow.
  ctx.lineCap = 'round'
  for (const r of f.ridges) {
    if (r.z < zMin || r.z > zMax) continue
    const a = alpha * fade(r.z)
    if (a <= 0.01) continue
    const dx = Math.cos(r.ang) * r.len * 0.5
    const dz = Math.sin(r.ang) * r.len * 0.5
    if (!project(r.x - dx, 0, r.z - dz, p0) || !project(r.x + dx, 0, r.z + dz, p1)) continue
    if (!project(r.x - dz * r.bend, 0, r.z + dx * r.bend, p2)) continue
    ctx.lineWidth = Math.max(1, unit * 0.035)
    ctx.strokeStyle = RIDGE_SHADE + (0.22 * a).toFixed(3) + ')'
    ctx.beginPath()
    ctx.moveTo(p0.x, p0.y + 1.2)
    ctx.quadraticCurveTo(p2.x, p2.y + 1.2, p1.x, p1.y + 1.2)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.6 * a).toFixed(3) + ')'
    ctx.beginPath()
    ctx.moveTo(p0.x, p0.y)
    ctx.quadraticCurveTo(p2.x, p2.y, p1.x, p1.y)
    ctx.stroke()
  }

  // The trail: packed snow, a soft band with a firmer core. It fades in from a
  // little behind the first stop and runs just past the last. One stroke per
  // layer (overlapping strokes would stack into blotches); the start fades
  // with a gradient along its first stretch.
  const zHead = stops[0] - 3
  const zStart = Math.max(zMin, zHead)
  const zEnd = Math.min(zMax, stops[stops.length - 1] + 1.5)
  if (zEnd > zStart) {
    const STEP = 0.25
    const zFade = Math.min(zEnd, stops[0] - 0.5)
    for (const [width, a] of TRAIL_LAYERS) {
      ctx.lineWidth = width * unit
      ctx.lineJoin = 'round'
      ctx.lineCap = 'butt'
      const color = TRAIL + (alpha * a).toFixed(3) + ')'
      if (zStart < zFade && project(pathX(zHead, sway), 0, zHead, p1) && project(pathX(zFade, sway), 0, zFade, p2)) {
        const g = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
        g.addColorStop(0, TRAIL + '0)')
        g.addColorStop(1, color)
        ctx.strokeStyle = g
        trace(ctx, project, zStart, zFade, STEP, sway)
      }
      ctx.strokeStyle = color
      trace(ctx, project, Math.max(zStart, zFade), zEnd, STEP, sway)
    }
    ctx.lineCap = 'round'
  }

  // Footprints: three toes and a heel, fading as the trail grows longer.
  const n = f.prints.length
  for (let i = 0; i < Math.min(n, f.printCount); i++) {
    const p = f.prints[(f.printCount - 1 - i) % n]
    if (p.z < zMin || p.z > zMax) continue
    const a = alpha * fade(p.z) * 0.34 * (1 - i / n)
    if (a <= 0.01) continue
    const fx = Math.sin(p.heading)
    const fz = Math.cos(p.heading)
    const rx = Math.cos(p.heading)
    const rz = -Math.sin(p.heading)
    if (!project(p.x - fx * 0.045, 0, p.z - fz * 0.045, p0)) continue
    ctx.strokeStyle = 'rgba(31,37,54,' + a.toFixed(3) + ')'
    ctx.lineWidth = Math.max(1, unit * 0.026)
    ctx.beginPath()
    for (const spread of [-0.4, 0, 0.4]) {
      const tx = p.x + fx * 0.07 + rx * spread * 0.09
      const tz = p.z + fz * 0.07 + rz * spread * 0.09
      if (!project(tx, 0, tz, p1)) continue
      ctx.moveTo(p0.x, p0.y)
      ctx.lineTo(p1.x, p1.y)
    }
    ctx.stroke()
  }

  // Markers at each stop: small faceted diamonds laid in the snow.
  for (let i = 0; i < stops.length; i++) {
    const z = stops[i]
    if (z < zMin || z > zMax) continue
    const m = MARKER[stations[i].kind]
    const em = f.emphasis[i]
    const a = alpha * fade(z) * (0.55 + 0.45 * em)
    if (a <= 0.01) continue
    const x = pathX(z, sway)
    const r = m.r * (1 + 0.25 * em)
    if (
      !project(x, 0, z, p0) ||
      !project(x, 0, z - r, p1) ||
      !project(x + r, 0, z, p2) ||
      !project(x, 0, z + r, p3) ||
      !project(x - r, 0, z, p4)
    )
      continue
    ctx.globalAlpha = a
    facet(ctx, p0, p4, p1, m.lit)
    facet(ctx, p0, p1, p2, m.lit)
    facet(ctx, p0, p2, p3, m.shade)
    facet(ctx, p0, p3, p4, m.shade)
    ctx.globalAlpha = 1
  }
}

function facet(ctx: CanvasRenderingContext2D, a: ScreenPoint, b: ScreenPoint, c: ScreenPoint, fill: string) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(b.x, b.y)
  ctx.lineTo(c.x, c.y)
  ctx.closePath()
  ctx.fill()
}

/** Stroke the path between two z values. */
function trace(ctx: CanvasRenderingContext2D, project: Project, from: number, to: number, step: number, sway: number) {
  if (to <= from) return
  ctx.beginPath()
  let started = false
  for (let z = from; ; z = Math.min(to, z + step)) {
    if (project(pathX(z, sway), 0, z, p0)) {
      if (started) ctx.lineTo(p0.x, p0.y)
      else ctx.moveTo(p0.x, p0.y)
      started = true
    }
    if (z >= to) break
  }
  ctx.stroke()
}
