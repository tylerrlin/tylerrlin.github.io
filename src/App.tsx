import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import Backdrop from './components/Backdrop'
import Snow from './components/Snow'
import Menu from './components/Menu'
import Panel from './components/Panels'
import { SECTIONS, sectionFromHash } from './sections'
import { profile } from './content'
import { lookAt } from './attention'

// The 3D scene is split into its own chunk so type and layout paint first.
const Scene = lazy(() => import('./components/scene/Scene'))

function isTyping(el: Element | null) {
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).isContentEditable)
}

export default function App() {
  const [selected, setSelected] = useState(() => Math.max(0, sectionFromHash(location.hash)))
  const [open, setOpen] = useState<number | null>(() => {
    const i = sectionFromHash(location.hash)
    return i >= 0 ? i : null
  })
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const heading = useRef<HTMLHeadingElement>(null)
  const pushed = useRef(false) // did we add the current history entry?
  const returnFocus = useRef(false)

  const select = useCallback((i: number) => {
    setSelected(i)
    lookAt(itemRefs.current[i], 'menu')
  }, [])

  const openPanel = useCallback((i: number) => {
    setSelected(i)
    setOpen(i)
    history.pushState(null, '', `#${SECTIONS[i].id}`)
    pushed.current = true
  }, [])

  const closePanel = useCallback(() => {
    returnFocus.current = true
    if (pushed.current) {
      pushed.current = false
      history.back() // popstate closes the panel
    } else {
      history.replaceState(null, '', location.pathname + location.search)
      setOpen(null)
    }
  }, [])

  // Browser back/forward moves between the title screen and panels.
  useEffect(() => {
    const onPop = () => {
      const i = sectionFromHash(location.hash)
      pushed.current = false
      if (i >= 0) {
        setSelected(i)
        setOpen(i)
      } else {
        returnFocus.current = true
        setOpen(null)
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Focus follows the view: the panel title on open, the menu item on return.
  useEffect(() => {
    if (open !== null) {
      heading.current?.focus({ preventScroll: true })
      const top = heading.current?.closest('section')?.getBoundingClientRect().top ?? 0
      if (top < 0 || top > window.innerHeight * 0.6) {
        heading.current?.closest('section')?.scrollIntoView({ block: 'start' })
      } else if (window.scrollY > 0 && window.matchMedia('(min-width: 768px)').matches) {
        window.scrollTo({ top: 0 })
      }
      lookAt(heading.current, 'panel')
    } else if (returnFocus.current) {
      returnFocus.current = false
      itemRefs.current[selected]?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Title-screen controls: arrows move the selection, Enter opens, Esc backs out.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || isTyping(document.activeElement)) return
      if (open !== null) {
        if (e.key === 'Escape') {
          e.preventDefault()
          closePanel()
        }
        return
      }
      // Only steer the menu when focus is on the page itself or already in the
      // menu; anywhere else, arrows keep their usual job (scrolling, etc.).
      const active = document.activeElement
      const inMenu = !active || active === document.body || !!active.closest('nav[aria-label="Main"]')
      if (!inMenu) return
      const n = SECTIONS.length
      let next: number | null = null
      if (e.key === 'ArrowDown') next = (selected + 1) % n
      else if (e.key === 'ArrowUp') next = (selected - 1 + n) % n
      else if (e.key === 'Home') next = 0
      else if (e.key === 'End') next = n - 1
      else if (e.key === 'Enter') {
        // Links handle their own Enter; this covers focus on the page itself.
        if (!active || active === document.body) {
          e.preventDefault()
          openPanel(selected)
        }
        return
      }
      if (next === null) return
      e.preventDefault()
      itemRefs.current[next]?.focus()
      select(next)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, selected, select, openPanel, closePanel])

  const onTitle = open === null

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <Backdrop />
      <Snow />

      <div className="relative grid min-h-dvh grid-cols-1 md:grid-cols-2">
        {/* Scene column: on top on phones, pinned to the right half on desktop. */}
        <div className="relative h-[42svh] md:sticky md:top-0 md:order-last md:h-dvh">
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </div>

        <main className="relative flex flex-col px-6 pt-1 pb-12 sm:px-10 md:min-h-dvh md:justify-center md:pt-12 md:pb-36 md:pr-6 md:pl-[max(4rem,9vw)]">
          {onTitle ? (
            <div className="rise-in">
              <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.24em] text-slate uppercase">
                <span aria-hidden className="h-px w-6 bg-navy/30" />
                {profile.role}
              </p>
              <h1 className="mt-3 font-display text-[3.75rem] leading-[0.92] md:mt-4 md:leading-[0.9] tracking-[-0.015em] md:text-[clamp(5.5rem,8.4vw,8.75rem)]">
                {profile.name}
              </h1>
              <p className="mt-4 max-w-[40ch] text-[16px] leading-[1.6] text-pretty text-navy-soft md:mt-7 md:text-[17px] md:leading-[1.65]">
                {profile.intro}
              </p>
              <div className="mt-8 md:mt-12">
                <Menu selected={selected} onSelect={select} onOpen={openPanel} itemRefs={itemRefs} />
              </div>
            </div>
          ) : (
            <div className="md:max-w-[39rem] md:rounded-[28px] md:bg-snow/75 md:p-12 md:pt-10 md:shadow-[0_40px_90px_-50px_rgba(31,37,54,0.45)] md:ring-1 md:ring-navy/[0.07] md:backdrop-blur-md">
              <Panel key={open} index={open} onClose={closePanel} ref={heading} />
            </div>
          )}
        </main>
      </div>

    </div>
  )
}

