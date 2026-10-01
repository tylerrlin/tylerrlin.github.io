import { Suspense, lazy } from 'react'
import Backdrop from './components/Backdrop'
import Snow from './components/Snow'
import Socials from './components/Socials'
import { profile } from './content'
import { lookAt } from './attention'

// The 3D scene is split into its own chunk so type and layout paint first.
const Scene = lazy(() => import('./components/scene/Scene'))

export default function App() {
  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <Backdrop />
      <Snow />

      <div className="relative grid min-h-dvh grid-cols-1 grid-rows-[42svh_1fr] md:grid-cols-2 md:grid-rows-1">
        {/* Scene column: on top on phones, the right half on desktop. */}
        <div className="relative md:order-last md:h-dvh">
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </div>

        <main className="relative flex flex-col justify-center px-9 pt-2 pb-[10svh] sm:px-12 md:min-h-dvh md:pt-12 md:pb-36 md:pr-6 md:pl-[max(4rem,9vw)]">
          <div className="rise-in text-center md:text-left">
            <p className="flex items-center justify-center gap-3 font-mono text-[11px] tracking-[0.24em] text-slate uppercase md:justify-start">
              <span aria-hidden className="h-px w-6 bg-navy/30" />
              {profile.role}
              <span aria-hidden className="h-px w-6 bg-navy/30 md:hidden" />
            </p>
            <h1 className="mt-3 font-display text-[3.75rem] leading-[0.92] tracking-[-0.015em] md:mt-4 md:text-[clamp(5.5rem,8.4vw,8.75rem)] md:leading-[0.9]">
              {profile.name}
            </h1>

            <div className="mt-5 md:mt-7">
              <Socials />
            </div>

            <a
              href={profile.resume}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={(e) => lookAt(e.currentTarget)}
              onFocus={(e) => lookAt(e.currentTarget)}
              className="group mt-9 inline-flex items-baseline gap-4 md:mt-12"
            >
              <span
                aria-hidden
                className="size-[7px] -translate-y-[0.55em] rotate-45 bg-orange transition-transform duration-300 group-hover:scale-125"
              />
              <span className="font-display text-[2.5rem] leading-none decoration-orange decoration-2 underline-offset-[10px] group-hover:underline group-focus-visible:underline md:text-5xl">
                Resume
              </span>
              <span className="font-mono text-[11px] tracking-[0.18em] text-ember-deep uppercase">
                PDF ↗
              </span>
            </a>
          </div>
        </main>
      </div>
    </div>
  )
}
