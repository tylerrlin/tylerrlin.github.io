import { stations } from '../resume'
import { birdFor, nearestStop, type Bird } from './path'

// The resume walk's shared state. Two kinds of state live here:
//
//  - `mode` ('home' | 'resume'): changes rarely, so React subscribes to it.
//  - `walk`: the per-frame state the scene integrates (penguin position along
//    the path, the eased home/resume blend). Plain mutable fields, read and
//    written in useFrame, so animation re-renders nothing.
//
// The DOM side (components/resume) measures the text, lays out the stops and
// turns wheel / touch / keys into a target position; the scene walks there.

export type Mode = 'home' | 'resume'

let mode: Mode = 'home'
const listeners = new Set<() => void>()

export function getMode() {
  return mode
}
export function subscribeMode(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
function setMode(next: Mode) {
  if (next === mode) return
  mode = next
  listeners.forEach((cb) => cb())
}

// --- How the resume reads ----------------------------------------------------
// 'walk' lays it along the path; 'list' is the plain reading column the resume
// shows while the scene loads (index.css), kept on by choice. The scene swaps
// the layouts under a cross-fade (Director); the choice is remembered.

export type View = 'walk' | 'list'

const VIEW_KEY = 'resume-view'

let view: View = (() => {
  try {
    return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'walk'
  } catch {
    return 'walk'
  }
})()
const viewListeners = new Set<() => void>()

export function getView() {
  return view
}
export function subscribeView(cb: () => void) {
  viewListeners.add(cb)
  return () => viewListeners.delete(cb)
}
export function setView(next: View) {
  if (next === view) return
  view = next
  try {
    localStorage.setItem(VIEW_KEY, next)
  } catch {
    // Private mode or blocked storage: the choice lasts for this visit.
  }
  walk.drive = 0
  walk.target = walk.pos // the penguin stops where it stands
  viewListeners.forEach((cb) => cb())
}

/** True while the text layer shows the plain column (still loading, or the list view). */
export function inColumn() {
  const el = dom.textLayer
  if (!el) return false
  return el.hasAttribute('data-live') ? el.hasAttribute('data-list') : el.dataset.mode === 'resume'
}

export const walk = {
  /** Where the penguin is headed, world z along the path. */
  target: 0,
  /** Where it is (integrated by the scene). */
  pos: 0,
  /** z of every stop, from layoutStops. */
  stops: stations.map((_, i) => i * 2),
  /** Text block sizes (CSS px), measured by the DOM layer. */
  sizes: stations.map(() => ({ w: 0, h: 0 })),
  bird: null as Bird | null,
  /** Bumped whenever the layout changes, so the scene can redraw. */
  layoutVersion: 0,
  /** Held-key cruising: -1 / 1 while an arrow is held, else 0 (see applyDrive). */
  drive: 0 as -1 | 0 | 1,
  /** Re-measure the text and re-lay the stops (set by the DOM layer). */
  relayout: () => {},
}

/** Elements the scene writes to every frame. Registered by ref callbacks. */
export const dom = {
  stage: null as HTMLElement | null, // where the penguin stands at home
  sky: null as HTMLElement | null, // backdrop + snowfall, tilted away on enter
  home: [] as (HTMLElement | null)[], // name and links
  ground: null as HTMLCanvasElement | null, // path, markers, footprints
  textLayer: null as HTMLElement | null,
  blocks: stations.map(() => null as HTMLElement | null),
  progress: null as HTMLElement | null,
  nav: null as HTMLElement | null,
  hud: null as HTMLElement | null, // Home, section nav, hint
  veil: null as HTMLElement | null, // reduced motion: cross-fades through snow
}

export function currentBird() {
  if (!walk.bird || walk.bird.vw !== window.innerWidth || walk.bird.vh !== window.innerHeight) {
    walk.bird = birdFor(window.innerWidth, window.innerHeight)
  }
  return walk.bird
}

// --- Navigation -----------------------------------------------------------

const last = () => walk.stops[walk.stops.length - 1]
const clampZ = (z: number) => Math.min(last(), Math.max(walk.stops[0], z))

export function targetStop() {
  return nearestStop(walk.target, walk.stops)
}

export function goToStop(i: number) {
  const k = Math.min(stations.length - 1, Math.max(0, i))
  walk.target = walk.stops[k]
}

/** Step to the next/previous stop from where the penguin is headed. */
export function step(dir: 1 | -1) {
  goToStop(targetStop() + dir)
}

/** Jump to the next/previous heading (section or entry). */
export function leap(dir: 1 | -1) {
  let i = targetStop() + dir
  while (i > 0 && i < stations.length - 1 && stations[i].kind === 'line') i += dir
  goToStop(i)
}

export function goToSection(section: number) {
  goToStop(stations.findIndex((s) => s.kind === 'section' && s.section === section))
}

/** Average distance between stops, world units. */
function spacing() {
  return (last() - walk.stops[0]) / Math.max(1, walk.stops.length - 1)
}

/** How far the target may run ahead of the penguin: a smooth distance, not a stop count. */
function lead() {
  return spacing() * 1.6
}

/** Free movement (wheel, drag), in world units. Never far ahead of the penguin. */
export function nudge(dz: number) {
  const l = lead()
  walk.target = clampZ(Math.min(walk.pos + l, Math.max(walk.pos - l, walk.target + dz)))
}

/**
 * Settle after free movement or cruising: on the first stop at or past the
 * target in the direction of travel, so the penguin never turns back.
 */
export function settleAhead(dir: number) {
  if (!dir) return goToStop(nearestStop(walk.target, walk.stops))
  const slack = spacing() * 0.15 // just past a stop counts as being on it
  const z = walk.target - dir * slack
  const i = dir > 0 ? walk.stops.findIndex((s) => s >= z) : walk.stops.findLastIndex((s) => s <= z)
  goToStop(i < 0 ? (dir > 0 ? walk.stops.length - 1 : 0) : i)
}

/** Start or stop cruising along the path (a held arrow key). */
export function startDrive(dir: 1 | -1) {
  walk.drive = dir
}
export function stopDrive() {
  if (!walk.drive) return
  const dir = walk.drive
  walk.drive = 0
  settleAhead(dir)
}

/** Called every frame by the scene: while cruising, keep the target a steady lead ahead. */
export function applyDrive() {
  if (walk.drive) walk.target = clampZ(walk.pos + walk.drive * lead() * 0.9)
}

/** Re-lay the stops, keeping the penguin at the same place in the reading. */
export function setStops(stops: number[]) {
  const map = (z: number) => {
    const old = walk.stops
    let i = 0
    while (i < old.length - 2 && z > old[i + 1]) i++
    const span = old[i + 1] - old[i] || 1
    const f = Math.min(1, Math.max(0, (z - old[i]) / span))
    return stops[i] + f * (stops[i + 1] - stops[i])
  }
  walk.pos = map(walk.pos)
  walk.target = map(walk.target)
  walk.stops = stops
  walk.layoutVersion++
}

// --- Entering and leaving --------------------------------------------------

const HASH = '#resume'

function lockScroll(on: boolean) {
  document.documentElement.style.overflow = on ? 'hidden' : ''
}

function applyEnter() {
  lockScroll(true)
  setMode('resume')
}

function applyExit() {
  lockScroll(false)
  setMode('home')
}

/** From the Resume button: a history entry, so Back returns home. */
export function enterResume() {
  if (mode === 'resume') return
  history.pushState({ resume: true }, '', HASH)
  applyEnter()
}

/** From the Home control or Esc. */
export function exitResume() {
  if (mode === 'home') return
  if (history.state?.resume) {
    history.back() // popstate finishes the exit
  } else {
    // Arrived by deep link: there is no home entry behind us to go back to.
    history.replaceState(null, '', location.pathname + location.search)
    applyExit()
  }
}

let installed = false
export function installHistory() {
  if (installed) return
  installed = true
  window.addEventListener('popstate', () => {
    if (location.hash === HASH) applyEnter()
    else applyExit()
  })
  if (location.hash === HASH) applyEnter()
}

/** The penguin's home yaw: a three-quarter turn toward the name. */
export const HOME_FACING = -0.42

/** The penguin's pose, written by the scene's walk and read by Penguin. */
export const walker = {
  x: 0,
  z: 0,
  heading: HOME_FACING,
  /** Step cycle, radians: one full turn is a left and a right step. */
  phase: 0,
  /** 0 idle .. 1 walking, eased. */
  amount: 0,
  /** Body travel per step, world units. */
  stride: 0.3,
  /** Eased home (0) .. resume (1) blend. */
  resume: 0,
}
