import { Suspense, lazy } from 'react'
import Menu from './components/Menu'

const Scene = lazy(() => import('./components/scene/Scene'))

export default function App() {
  return (
    <main className="flex h-full flex-col-reverse md:flex-row">
      <section className="flex flex-1 items-center justify-center p-8 md:p-16">
        <Menu />
      </section>
      <section className="h-[45vh] flex-1 md:h-auto">
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </section>
    </main>
  )
}
