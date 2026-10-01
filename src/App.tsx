import { Suspense, lazy } from 'react'
import Backdrop from './components/Backdrop'
import Snow from './components/Snow'
import Links from './components/Links'
import { profile } from './content'

// The 3D scene is split into its own chunk so type and layout paint first.
const Scene = lazy(() => import('./components/scene/Scene'))

// One poster, one coordinate system (index.css). On wide screens the name
// stands on the horizon with the penguin beside it, inside one screen. When
// stacked, name, penguin and details read top to bottom, and the details flow
// below the horizon so short phones scroll instead of clipping.
export default function App() {
  return (
    <main className="relative min-h-svh overflow-x-clip wide:h-svh wide:min-h-[23rem]">
      <Backdrop />
      <Snow />
      <div className="absolute inset-x-0 top-(--stage-top) h-(--stage) wide:inset-0 wide:h-auto">
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </div>

      <div className="rise-in absolute inset-x-0 top-(--name-top) px-6 text-center wide:top-auto wide:bottom-[calc(100%-var(--horizon))] wide:px-(--pad-x) wide:text-left">
        <p className="font-mono text-[11px] tracking-[0.26em] text-navy-soft uppercase wide:mb-[clamp(0.75rem,2svh,1.25rem)] wide:text-xs">
          {profile.role}
        </p>
        <h1 className="mt-2 font-display text-(length:--name-size) leading-[0.95] tracking-[-0.02em] wide:mt-0 wide:translate-y-[0.065em] wide:text-[clamp(5rem,min(15vw,24svh),15rem)] wide:leading-[0.8]">
          {profile.name}
        </h1>
      </div>

      <div className="rise-in relative px-6 pt-[calc(var(--feet)+clamp(1.5rem,4.5svh,3rem))] pb-14 text-center [animation-delay:120ms] wide:absolute wide:inset-x-0 wide:top-[calc(var(--horizon)+clamp(1.75rem,8svh,4.5rem))] wide:p-0 wide:px-(--pad-x) wide:text-left">
        <Links />
      </div>
    </main>
  )
}
