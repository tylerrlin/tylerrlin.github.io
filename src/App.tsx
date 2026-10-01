import { Suspense, lazy } from 'react'
import Backdrop from './components/Backdrop'
import Snow from './components/Snow'
import Links from './components/Links'
import { profile } from './content'

// The 3D scene is split into its own chunk so type and layout paint first.
const Scene = lazy(() => import('./components/scene/Scene'))

// One poster, one coordinate system: the sky, the penguin and the type are all
// placed against --horizon (index.css). On desktop the name stands on the
// horizon line with the penguin beside it; on phones it reads top to bottom.
export default function App() {
  return (
    <main className="relative h-svh min-h-[34rem] overflow-hidden">
      <Backdrop />
      <Snow />
      <Suspense fallback={null}>
        <Scene />
      </Suspense>

      <div className="rise-in absolute inset-x-0 top-[10%] px-6 text-center wide:top-auto wide:bottom-[calc(100%-var(--horizon))] wide:px-[max(2.5rem,7vw)] wide:text-left">
        <p className="font-mono text-[11px] wide:text-xs tracking-[0.26em] text-navy-soft uppercase wide:mb-5">{profile.role}</p>
        <h1 className="mt-2 font-display text-[min(27vw,14svh)] leading-[0.95] tracking-[-0.02em] wide:mt-0 wide:translate-y-[0.065em] wide:text-[clamp(5rem,min(15vw,24svh),15rem)] wide:leading-[0.8]">
          {profile.name}
        </h1>
      </div>

      <div className="rise-in absolute inset-x-0 top-[calc(var(--horizon)+12.5%)] px-6 text-center [animation-delay:120ms] wide:top-[calc(var(--horizon)+4.5rem)] wide:px-[max(2.5rem,7vw)] wide:text-left">
        <p className="font-display text-[1.6rem] leading-tight text-navy-soft italic wide:text-[clamp(1.75rem,3.4svh,2.5rem)]">{profile.tagline}</p>
        <div className="mt-6 wide:mt-8">
          <Links />
        </div>
      </div>
    </main>
  )
}
