import { useLayoutEffect, useState, type MouseEvent, type RefObject } from 'react'
import { SECTIONS } from '../sections'

type Props = {
  selected: number
  onSelect: (index: number) => void
  onOpen: (index: number) => void
  itemRefs: RefObject<(HTMLAnchorElement | null)[]>
}

// A title-screen menu: one item is always "selected" (hover, focus, or arrow
// keys move it), marked by a small orange diamond that glides between rows.
// Each item is a real link to its section's hash, so it can be bookmarked or
// opened in a new tab; a plain click opens the panel in place.
export default function Menu({ selected, onSelect, onOpen, itemRefs }: Props) {
  const [marker, setMarker] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = itemRefs.current[selected]
    if (!el) return
    const num = el.querySelector<HTMLElement>('[data-index]')
    // offsetTop is relative to the <ul> (the nearest positioned ancestor).
    const update = () => setMarker(num ? num.offsetTop + num.offsetHeight / 2 : el.offsetTop)
    update()
    // Fonts swapping in can shift rows; keep the marker aligned.
    document.fonts?.ready.then(update)
  }, [selected, itemRefs])

  const onClick = (e: MouseEvent<HTMLAnchorElement>, i: number) => {
    // Let the browser handle new-tab / new-window clicks.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    onOpen(i)
  }

  return (
    <nav aria-label="Main">
      <ul className="relative flex flex-col border-t border-navy/10 md:border-0">
        <li
          aria-hidden
          className="absolute top-0 -left-6 hidden size-[7px] bg-orange transition-transform duration-500 ease-out-soft md:block"
          style={{
            transform: `translateY(${(marker ?? 0) - 3.5}px) rotate(45deg)`,
            opacity: marker === null ? 0 : 1,
          }}
        />
        {SECTIONS.map((s, i) => {
          const active = i === selected
          return (
            <li key={s.id} className="border-b border-navy/10 md:border-0">
              <a
                ref={(el) => {
                  itemRefs.current[i] = el
                }}
                href={`#${s.id}`}
                aria-current={active ? 'true' : undefined}
                onClick={(e) => onClick(e, i)}
                onMouseEnter={() => onSelect(i)}
                onFocus={() => onSelect(i)}
                className={[
                  'group grid grid-cols-[2.25rem_1fr_auto] items-baseline py-4 transition-colors duration-300 focus-visible:outline-none md:flex md:gap-5 md:py-2.5 md:pr-2',
                  active ? 'text-navy' : 'text-navy md:text-navy/50 md:hover:text-navy/75',
                ].join(' ')}
              >
                <span data-index className="w-6 font-mono text-xs tracking-wider tabular-nums text-slate">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-[2.125rem] leading-none decoration-orange decoration-2 underline-offset-[8px] group-focus-visible:underline md:text-5xl md:underline-offset-[10px]">
                  {s.label}
                </span>
                {/* Phones: one tidy row per item; the hint sits right-aligned so each item explains itself. */}
                <span className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.16em] text-slate uppercase md:hidden">
                  {s.hint}
                  <svg aria-hidden viewBox="0 0 12 12" className="size-2.5 text-navy/45">
                    <path d="M2 6h8M6.5 2.5 10 6l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                </span>
                {/* Desktop: revealed beside the selected item. */}
                <span
                  aria-hidden
                  className={[
                    'hidden font-mono text-[11px] tracking-[0.18em] text-ember-deep uppercase transition-opacity duration-300 md:inline',
                    active ? 'opacity-100' : 'opacity-0',
                  ].join(' ')}
                >
                  {s.hint}
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
