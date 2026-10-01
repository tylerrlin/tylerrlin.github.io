import { Component, Suspense, lazy, useEffect, useSyncExternalStore, type ReactNode } from 'react'
import Backdrop from './components/Backdrop'
import Snow from './components/Snow'
import Links from './components/Links'
import { ResumeGround, ResumeHud, ResumeText } from './components/resume/Resume'
import { profile } from './content'
import { dom, getMode, installHistory, subscribeMode } from './walk/state'

// The 3D scene is split into its own chunk so type and layout paint first.
const Scene = lazy(() => import('./components/scene/Scene'))

/** Without WebGL the page stands on its own: the poster, and the resume as a plain column. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

// One poster, one coordinate system (index.css). On wide screens the name
// stands on the horizon with the penguin beside it, inside one screen. When
// stacked, name, penguin and details read top to bottom, and the details flow
// below the horizon so short phones scroll instead of clipping.
//
// Resume opens the walk: the sky and the type tilt away, the camera rises to
// a bird's-eye view, and the resume lies along a path in the snow (walk/,
// components/resume). Layers, bottom to top: snowfield, sky, resume text,
// penguin, home type, walk controls.
export default function App() {
  const resume = useSyncExternalStore(subscribeMode, getMode) === 'resume'
  useEffect(installHistory, [])

  return (
    <main className="relative min-h-svh overflow-x-clip wide:h-svh wide:min-h-[23rem]">
      <ResumeGround />
      <div ref={(el) => void (dom.sky = el)} aria-hidden className="absolute inset-0">
        <Backdrop />
        <Snow />
      </div>
      {/* The box the penguin stands in at home (Director frames it). */}
      <div
        ref={(el) => void (dom.stage = el)}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-(--stage-top) h-(--stage) wide:inset-0 wide:h-auto"
      />
      <ResumeText />
      <SceneBoundary>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </SceneBoundary>

      <div
        ref={(el) => void (dom.home[0] = el)}
        inert={resume}
        className="absolute inset-x-0 top-(--name-top) px-6 text-center wide:top-auto wide:bottom-[calc(100%-var(--horizon))] wide:px-(--pad-x) wide:text-left"
      >
        <div className="rise-in">
          <p className="font-mono text-[11px] tracking-[0.26em] text-navy-soft uppercase wide:mb-[clamp(0.75rem,2svh,1.25rem)] wide:text-xs">
            {profile.role}
          </p>
          <h1 className="mt-2 font-display text-(length:--name-size) leading-[0.95] tracking-[-0.02em] wide:mt-0 wide:translate-y-[0.065em] wide:text-[clamp(5rem,min(15vw,24svh),15rem)] wide:leading-[0.8]">
            {profile.name}
          </h1>
        </div>
      </div>

      <div
        ref={(el) => void (dom.home[1] = el)}
        inert={resume}
        className="relative px-6 pt-[calc(var(--feet)+clamp(2.75rem,8svh,4.5rem))] pb-14 text-center wide:absolute wide:inset-x-0 wide:top-[calc(var(--horizon)+clamp(1.75rem,8svh,4.5rem))] wide:p-0 wide:px-(--pad-x) wide:text-left"
      >
        <div className="rise-in [animation-delay:120ms]">
          <Links />
        </div>
      </div>

      {/* Reduced motion: the scene cross-fades through snow instead of flying. */}
      <div ref={(el) => void (dom.veil = el)} aria-hidden className="pointer-events-none fixed inset-0 bg-ice opacity-0" />
      <ResumeHud />
    </main>
  )
}
