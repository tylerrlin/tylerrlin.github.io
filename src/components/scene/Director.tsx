import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector3, type PerspectiveCamera } from 'three'
import { PENGUIN_HEIGHT } from './Penguin'
import { drawGround, makeRidges, type Print, type ScreenPoint } from './ground'
import { stations } from '../../resume'
import { dom, getMode, HOME_FACING, walk, walker, currentBird } from '../../walk/state'
import {
  BELOW,
  BODY_LIFT,
  COLUMN_GAP,
  GUTTER,
  nearestStop,
  pathSlope,
  pathX,
  sideOf,
  stickyRange,
  type Bird,
} from '../../walk/path'

// Runs the whole show, once per frame and without React: eases between the
// home framing and the bird's-eye walk, walks the penguin toward its target,
// points the camera, and projects the resume text and the snowfield to match.

const WIDE_QUERY = '(width >= 48rem) and (min-aspect-ratio: 4/5)'
const HOME_FOV = 28
/** The poster composition never spreads wider than this (App.tsx, --frame). */
const FRAME = 1680

// Where the penguin stands at home, in shares of its stage box (the hero on
// the poster, the stage box in index.css when stacked): `x` its center (of the
// composition frame), `feet` from the top, `height` its height, capped at
// `maxW` of the frame width so squat windows shrink it instead of crowding
// the type.
const STAND = {
  wide: { x: 0.69, feet: 0.855, height: 0.62, maxW: 0.36 },
  narrow: { x: 0.52, feet: 0.94, height: 0.8, maxW: 0.8 },
}

/** Seconds for the flight between home and the walk. */
const FLIGHT = 1.6
/** Walk spring stiffness (critically damped) and speed limits, world units/s. */
const OMEGA = 5.2
const SPEED = { walk: 2.3, run: 9 }
/** Body travel per step grows a little with speed; feet stay planted either way. */
const STRIDE = { base: 0.26, perSpeed: 0.045, max: 0.42 }
const MAX_PRINTS = 64
/** Seconds to fade to snow and back around a reduced-motion jump, and to land from the plain column. */
const VEIL = { out: 0.12, in: 0.22, land: 0.45 }

/**
 * A camera framing: it looks at `target` (relative to the penguin's feet)
 * from `dist` away, tilted `pitch` below level, with tan(fov/2) over the
 * canvas height and the optical center at canvas pixel (cx, cy).
 */
type Pose = { oy: number; pitch: number; dist: number; tanHalf: number; cx: number; cy: number }

type Rect = { left: number; top: number; width: number; height: number }

function homePose(canvas: Rect, stage: Rect, wide: boolean): Pose {
  const stand = wide ? STAND.wide : STAND.narrow
  const frame = Math.min(stage.width, FRAME)
  const px = Math.min(stand.height * stage.height, stand.maxW * frame)
  const viewH = (PENGUIN_HEIGHT * stage.height) / px // world units across the stage height
  const tan = Math.tan((HOME_FOV * Math.PI) / 360)
  const dist = viewH / (2 * tan)
  return {
    // Nearly level, so the penguin keeps a straight-on, portrait view.
    oy: (stand.feet - 0.5) * viewH,
    pitch: Math.atan(0.07),
    dist: dist * Math.hypot(1, 0.07),
    tanHalf: (tan * canvas.height) / stage.height,
    cx: stage.left - canvas.left + (stage.width - frame) / 2 + stand.x * frame,
    cy: stage.top - canvas.top + stage.height / 2,
  }
}

function birdPose(canvas: Rect, bird: Bird): Pose {
  return {
    oy: 0.45,
    pitch: bird.pitch,
    dist: bird.dist,
    tanHalf: (bird.tanHalf * canvas.height) / bird.vh,
    cx: bird.vw / 2 - canvas.left,
    cy: bird.centerY * bird.vh - canvas.top,
  }
}

const smooth = (a: number, b: number, x: number) => {
  const t = MathUtils.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const logLerp = (a: number, b: number, t: number) => Math.exp(MathUtils.lerp(Math.log(a), Math.log(b), t))

function dampAngle(from: number, to: number, lambda: number, dt: number) {
  let d = (to - from) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return from + d * (1 - Math.exp(-lambda * dt))
}

const wideQuery = typeof window !== 'undefined' ? window.matchMedia(WIDE_QUERY) : null
const reducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null

export default function Director() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const gl = useThree((s) => s.gl)

  const s = useMemo(
    () => ({
      raw: 0, // linear flight progress, 0 home .. 1 walk
      vel: 0,
      wasResume: false,
      v: new Vector3(),
      anchor: { x: 0, y: 0 } as ScreenPoint,
      at: { x: 0, y: 0 } as ScreenPoint,
      east: { x: 0, y: 0 } as ScreenPoint,
      pose: { oy: 0, pitch: 0, dist: 1, tanHalf: 0.25, cx: 0, cy: 0 } as Pose,
      canvasRect: { left: 0, top: 0, width: 1, height: 1 } as Rect,
      prints: Array.from({ length: MAX_PRINTS }, () => ({ x: 0, z: 0, heading: 0, side: 1 }) as Print),
      printCount: 0,
      ridges: makeRidges(-12, 40),
      ridgesFor: -1,
      emphasis: stations.map(() => 0),
      // Last values written to the DOM, so unchanged frames write nothing.
      blockX: stations.map(() => NaN),
      blockY: stations.map(() => NaN),
      blockO: stations.map(() => NaN),
      blockVis: stations.map(() => true),
      live: false,
      // Reduced motion: 0 idle, 1 fading out, 2 fading back in.
      veilPhase: 0,
      veil: 0,
      veilMode: false, // this fade carries a home <-> resume switch
      veilO: NaN,
      skyShift: NaN,
      homeO: NaN,
      textO: 0,
      layerO: NaN,
      layerVis: '',
      hudO: NaN,
      section: -1,
      progress: NaN,
      groundKey: '',
    }),
    [],
  )

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const reduce = reducedMotion?.matches ?? false
    const resume = getMode() === 'resume'
    const bird = currentBird()
    const stops = walk.stops
    const lastStop = stops[stops.length - 1]

    // --- Reads first (layout), then everything else is writes. ------------
    const cr = gl.domElement.getBoundingClientRect()
    s.canvasRect.left = cr.left
    s.canvasRect.top = cr.top
    s.canvasRect.width = cr.width || 1
    s.canvasRect.height = cr.height || 1
    const stageRect = dom.stage?.getBoundingClientRect() ?? cr
    const W = s.canvasRect.width
    const H = s.canvasRect.height

    // The scene is up: the text layer and the HUD are ours from here on (until
    // now the resume reads as a plain column, see index.css).
    if (!s.live && dom.textLayer && dom.hud) {
      s.live = true
      dom.textLayer.setAttribute('data-live', '')
      dom.hud.style.transition = 'none'
      if (resume) {
        // Arrived on /#resume and read the plain column while the scene
        // loaded: land straight in the walk, rising out of the snow.
        s.raw = 1
        s.veil = 1
        s.veilPhase = 2
      }
    }

    // --- Flight between home and the walk ---------------------------------
    const goal = resume ? 1 : 0
    if (resume && !s.wasResume) s.printCount = 0 // a fresh trail each visit
    s.wasResume = resume
    if (!resume) walk.target = walk.pos
    if (reduce) {
      // No flights and no walking: fade to snow, jump, fade back.
      if (s.veilPhase === 0 && (s.raw !== goal || walk.pos !== walk.target)) {
        s.veilPhase = 1
        s.veilMode = s.raw !== goal
      }
      if (s.veilPhase === 1) {
        s.veil = Math.min(1, s.veil + dt / VEIL.out)
        if (s.veil === 1) {
          s.raw = goal
          walk.pos = walk.target
          s.veilPhase = 2
        }
      } else if (s.veilPhase === 2) {
        s.veil = Math.max(0, s.veil - dt / VEIL.in)
        if (s.veil === 0) s.veilPhase = 0
      }
      s.vel = 0
    } else {
      if (s.veilPhase === 1) s.veilPhase = 2
      s.veil = Math.max(0, s.veil - dt / VEIL.land)
      if (s.veil === 0) s.veilPhase = 0
      s.raw = MathUtils.clamp(s.raw + Math.sign(goal - s.raw) * (dt / FLIGHT), 0, 1)
    }
    const veilO = Math.round(s.veil * 1000) / 1000
    if (veilO !== s.veilO && dom.veil) {
      s.veilO = veilO
      dom.veil.style.opacity = String(veilO)
    }
    // Dev only: window.__flight = 0..1 holds the flight at that point.
    const hold = import.meta.env.DEV ? (window as { __flight?: number }).__flight : undefined
    if (hold !== undefined) s.raw = hold
    // Tilt leads, zoom follows, so the field opens up before the bird shrinks.
    const tilt = easeInOut(MathUtils.clamp(s.raw / 0.85, 0, 1))
    const zoom = easeInOut(MathUtils.clamp((s.raw - 0.1) / 0.9, 0, 1))
    const blend = easeInOut(s.raw)
    walker.resume = blend

    // --- Walk ----------------------------------------------------------------
    // Leaving, the penguin stops where it is (the spring becomes a pure damper,
    // walk.target = walk.pos above) and the home framing gathers around it.
    const prevX = walker.x
    const prevZ = walker.z
    if (!reduce) {
      const gap = walk.target - walk.pos
      s.vel += (OMEGA * OMEGA * gap - 2 * OMEGA * s.vel) * dt
      const vmax = MathUtils.clamp(Math.abs(gap) * 1.5, SPEED.walk, SPEED.run)
      s.vel = MathUtils.clamp(s.vel, -vmax, vmax)
      walk.pos += s.vel * dt
      if (Math.abs(gap) < 1e-4 && Math.abs(s.vel) < 1e-3) {
        walk.pos = walk.target
        s.vel = 0
      }
    }
    const pos = walk.pos
    walker.x = pathX(pos, bird.sway)
    walker.z = pos
    const moved = Math.hypot(walker.x - prevX, walker.z - prevZ)
    const speed = moved / Math.max(dt, 1e-4)

    // Steps: the phase advances with distance, half a cycle per stride, so the
    // planted foot keeps pace with the ground. Jumps (reduced motion, relayout)
    // don't walk.
    const walking = !reduce && moved < 1.5
    walker.stride = Math.min(STRIDE.max, STRIDE.base + STRIDE.perSpeed * speed)
    if (walking) {
      const before = Math.floor(walker.phase / Math.PI)
      walker.phase += (moved * Math.PI) / walker.stride
      const after = Math.floor(walker.phase / Math.PI)
      if (after !== before && walker.amount > 0.4 && resume) {
        // A foot just landed: the left (+x) on even half-cycles, the right on odd.
        const side = after % 2 === 0 ? 1 : -1
        const h = walker.heading
        const lx = side * 0.165
        const lz = walker.stride * 0.5 + 0.07
        const p = s.prints[s.printCount % MAX_PRINTS]
        p.x = walker.x + lx * Math.cos(h) + lz * Math.sin(h)
        p.z = walker.z - lx * Math.sin(h) + lz * Math.cos(h)
        p.heading = h
        p.side = side
        s.printCount++
      }
    }
    walker.amount = reduce ? 0 : MathUtils.damp(walker.amount, walking ? smooth(0.06, 0.45, speed) : 0, 9, dt)

    // Facing: along the path while walking, toward the text when standing
    // (wide), toward the viewer when the text is below (narrow), and back to
    // the home three-quarter view when leaving.
    const here = nearestStop(pos, stops)
    let want: number
    if (!resume) want = HOME_FACING
    else if (speed > 0.15) {
      const dir = Math.sign(s.vel) || 1
      want = Math.atan2(pathSlope(pos, bird.sway) * dir, dir)
    } else want = bird.wide ? (sideOf(stations[here]) === 'right' ? 0.45 : -0.45) : 0
    walker.heading = reduce ? want : dampAngle(walker.heading, want, speed > 0.15 ? 9 : 4.5, dt)

    // --- Camera ----------------------------------------------------------------
    const home = homePose(s.canvasRect, stageRect, wideQuery?.matches ?? true)
    const away = birdPose(s.canvasRect, bird)
    const pose = s.pose
    pose.pitch = MathUtils.lerp(home.pitch, away.pitch, tilt)
    pose.dist = logLerp(home.dist, away.dist, zoom)
    pose.tanHalf = logLerp(home.tanHalf, away.tanHalf, zoom)
    pose.oy = MathUtils.lerp(home.oy, away.oy, zoom)
    pose.cx = MathUtils.lerp(home.cx, away.cx, zoom)
    pose.cy = MathUtils.lerp(home.cy, away.cy, zoom)

    const tx = walker.x
    const ty = pose.oy
    const tz = walker.z
    camera.position.set(tx, ty + pose.dist * Math.sin(pose.pitch), tz + pose.dist * Math.cos(pose.pitch))
    camera.up.set(0, 1, 0)
    camera.lookAt(tx, ty, tz)
    camera.fov = (2 * Math.atan(pose.tanHalf) * 180) / Math.PI
    camera.aspect = W / H
    camera.setViewOffset(W, H, W / 2 - pose.cx, H / 2 - pose.cy, W, H)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()

    // --- The home layers tilt away ------------------------------------------
    // Shift the sky and the home type by how far the horizon has moved, so
    // they slide off as if the camera tipped down past them.
    const horizon = (p: Pose) => p.cy - (H / (2 * p.tanHalf)) * Math.tan(p.pitch)
    const shift = Math.max(-1.6 * bird.vh, horizon(pose) - horizon(home))
    const skyShift = Math.round(shift * 10) / 10
    if (skyShift !== s.skyShift) {
      s.skyShift = skyShift
      const t = skyShift === 0 ? '' : `translate3d(0, ${skyShift}px, 0)`
      if (dom.sky) dom.sky.style.transform = t
      for (const el of dom.home) if (el) el.style.transform = t
    }
    // The type is near the camera: gone within the first quarter of the tilt.
    const homeO = Math.round((1 - smooth(0, 0.25, s.raw)) * 1000) / 1000
    if (homeO !== s.homeO) {
      s.homeO = homeO
      for (const el of dom.home) if (el) el.style.opacity = homeO === 1 ? '' : String(homeO)
    }

    // --- Project the resume ----------------------------------------------------
    const v = s.v
    const project = (x: number, y: number, z: number, out: ScreenPoint) => {
      v.set(x, y, z).applyMatrix4(camera.matrixWorldInverse)
      if (v.z > -camera.near) return false
      v.applyMatrix4(camera.projectionMatrix)
      out.x = ((v.x + 1) / 2) * W + s.canvasRect.left
      out.y = ((1 - v.y) / 2) * H + s.canvasRect.top
      return true
    }

    // In late on the way in; out early on the way home, before the penguin
    // grows back over the text.
    s.textO = resume || reduce
      ? smooth(0.62, 1, blend)
      : Math.min(s.textO, MathUtils.damp(s.textO, smooth(0.82, 1, blend), 12, dt))
    const textO = Math.round(s.textO * 1000) / 1000
    for (let i = 0; i < stations.length; i++) {
      const [a, b] = bird.wide ? stickyRange(i, stops) : [stops[i], stops[i]]
      const off = pos < a ? a - pos : pos > b ? pos - b : 0
      s.emphasis[i] = 1 - smooth(0.12, 1.5, off)
    }

    // The layer stays visible (in the accessibility tree) throughout resume
    // mode, even while transparent; at home it is hidden outright.
    const layerVis = textO === 0 && !resume ? 'hidden' : 'visible'
    if (dom.textLayer && (textO !== s.layerO || layerVis !== s.layerVis)) {
      s.layerO = textO
      s.layerVis = layerVis
      dom.textLayer.style.opacity = String(textO)
      dom.textLayer.style.visibility = layerVis
    }
    // The controls (and the snow fades under them) come and go with the text.
    const hudO = Math.round(textO * (s.veilMode ? 1 - s.veil : 1) * 1000) / 1000
    if (hudO !== s.hudO && dom.hud) {
      s.hudO = hudO
      dom.hud.style.opacity = String(hudO)
    }

    if (textO > 0) {
      const anchor = s.anchor
      for (let i = 0; i < stations.length; i++) {
        const el = dom.blocks[i]
        if (!el) continue
        const { w, h } = walk.sizes[i]
        const [a, b] = bird.wide ? stickyRange(i, stops) : [stops[i], stops[i]]
        const za = MathUtils.clamp(pos, a, b)
        // Culled blocks go transparent, never visibility: hidden, so screen
        // readers keep the whole resume.
        if (!project(pathX(za, bird.sway), 0, za, anchor)) {
          if (s.blockVis[i]) el.style.opacity = '0'
          s.blockVis[i] = false
          continue
        }
        let x: number
        let y: number
        if (bird.wide) {
          x = sideOf(stations[i]) === 'right' ? anchor.x + COLUMN_GAP : anchor.x - COLUMN_GAP - w
          y = anchor.y - BODY_LIFT - h / 2
        } else {
          const sway = anchor.x - bird.vw / 2
          x = stations[i].kind === 'section' ? anchor.x - w / 2 : GUTTER + sway
          y = anchor.y + BELOW
        }
        x = Math.round(x)
        y = Math.round(y)
        // Cull off-screen blocks, and far ones that would bunch up near the
        // horizon while the camera is still tipping over.
        const near = Math.abs(za - pos) < (0.75 * bird.vh) / bird.alongPx + 2
        const visible = near && y < bird.vh + 40 && y + h > -40
        if (visible !== s.blockVis[i]) {
          s.blockVis[i] = visible
          el.style.opacity = visible ? '' : '0'
        }
        if (!visible) continue
        if (x !== s.blockX[i] || y !== s.blockY[i]) {
          s.blockX[i] = x
          s.blockY[i] = y
          el.style.transform = `translate3d(${x}px, ${y}px, 0)`
        }
        const o = Math.round((0.34 + 0.66 * s.emphasis[i]) * 100) / 100
        if (o !== s.blockO[i]) {
          s.blockO[i] = o
          el.style.setProperty('--o', String(o))
          el.toggleAttribute('data-current', o > 0.9)
        }
      }
    }

    // --- HUD: current section and progress ----------------------------------
    const section = stations[here].section
    if (section !== s.section && dom.nav) {
      s.section = section
      dom.nav.querySelectorAll<HTMLElement>('[data-section]').forEach((b) => {
        const on = Number(b.dataset.section) === section
        if (on) b.setAttribute('aria-current', 'location')
        else b.removeAttribute('aria-current')
      })
    }
    const progress = Math.round((lastStop > 0 ? pos / lastStop : 0) * 1000) / 1000
    if (progress !== s.progress && dom.progress) {
      s.progress = progress
      dom.progress.style.transform = `scaleX(${progress})`
    }

    // --- Snowfield ---------------------------------------------------------------
    const canvas = dom.ground
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const cw = Math.round(bird.vw * dpr)
      const ch = Math.round(bird.vh * dpr)
      let resized = false
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw
        canvas.height = ch
        resized = true
      }
      const alpha = smooth(0.18, 0.85, blend)
      const key = `${alpha.toFixed(3)}|${pos.toFixed(4)}|${tilt.toFixed(4)}|${zoom.toFixed(4)}|${s.printCount}|${walk.layoutVersion}|${here}`
      if (key !== s.groundKey || resized) {
        s.groundKey = key
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, bird.vw, bird.vh)
        if (alpha > 0) {
          if (s.ridgesFor !== walk.layoutVersion) {
            s.ridgesFor = walk.layoutVersion
            s.ridges = makeRidges(-14, lastStop + 14)
          }
          const p0 = s.at
          const p1 = s.east
          project(walker.x, 0, walker.z, p0)
          project(walker.x + 1, 0, walker.z, p1)
          drawGround({
            ctx,
            project,
            alpha,
            unit: Math.max(1, Math.hypot(p1.x - p0.x, p1.y - p0.y)),
            pos,
            sway: bird.sway,
            reach: (0.75 * bird.vh) / bird.alongPx + 2,
            stops,
            emphasis: s.emphasis,
            prints: s.prints,
            printCount: s.printCount,
            ridges: s.ridges,
          })
        }
      }
    }
  })

  return null
}
