import { useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { SECTIONS } from '../sections'

type Props = {
  selected: number
  onSelect: (index: number) => void
  onOpen: (index: number) => void
  itemRefs: RefObject<(HTMLButtonElement | null)[]>
}

// A title-screen menu: one item is always "selected" (hover, focus, or arrow
// keys move it), marked by a small orange diamond that glides between rows.
export default function Menu({ selected, onSelect, onOpen, itemRefs }: Props) {
  const list = useRef<HTMLUListElement>(null)
  const [marker, setMarker] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = itemRefs.current[selected]
    if (!el || !list.current) return
    const num = el.querySelector<HTMLElement>('[data-index]')
    const update = () => setMarker(num ? num.offsetTop + num.offsetHeight / 2 : el.offsetTop)
    update()
    // Fonts swapping in can shift rows; keep the marker aligned.
    document.fonts?.ready.then(update)
  }, [selected, itemRefs])

  return (
    <nav aria-label="Main">
      <ul ref={list} className="relative -ml-1 flex flex-col">
        <span
          aria-hidden
          className="absolute top-0 -left-4 size-[7px] bg-orange transition-transform duration-500 ease-out-soft md:-left-6 [@media(hover:none)]:hidden"
          style={{
            transform: `translateY(${(marker ?? 0) - 3.5}px) rotate(45deg)`,
            opacity: marker === null ? 0 : 1,
          }}
        />
        {SECTIONS.map((s, i) => {
          const active = i === selected
          return (
            <li key={s.id}>
              <button
                ref={(el) => {
                  itemRefs.current[i] = el
                }}
                type="button"
                tabIndex={active ? 0 : -1}
                onClick={() => onOpen(i)}
                onMouseEnter={() => onSelect(i)}
                onFocus={() => onSelect(i)}
                className={[
                  'group flex cursor-pointer items-baseline gap-5 py-2 pr-2 pl-1 text-left transition-colors duration-300 focus-visible:outline-none md:py-2.5',
                  active ? 'text-navy' : 'text-navy/55 hover:text-navy/75 [@media(hover:none)]:text-navy',
                ].join(' ')}
              >
                <span data-index className="w-6 font-mono text-xs tracking-wider tabular-nums text-slate">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={[
                    'font-display text-[2.5rem] leading-none decoration-orange decoration-2 underline-offset-[10px] transition-transform duration-500 ease-out-soft group-focus-visible:underline md:text-5xl',
                    active ? 'translate-x-2 [@media(hover:none)]:translate-x-0' : '',
                  ].join(' ')}
                >
                  {s.label}
                </span>
                <span
                  aria-hidden
                  className={[
                    'hidden font-mono text-[11px] tracking-[0.18em] uppercase text-ember transition-opacity duration-300 md:inline',
                    active ? 'opacity-100' : 'opacity-0',
                  ].join(' ')}
                >
                  {s.hint}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
