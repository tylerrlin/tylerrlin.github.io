import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { email, socials, type SocialLink } from '../content'
import { enterResume } from '../walk/state'
import { lookAt } from '../attention'

// Low-poly glyphs that match the penguin: flat facets in three navy tones, an
// orange accent, ice where a cutout would be. Drawn on a 24 x 24 grid. Each
// glyph lays a dark base under its facets so antialiased seams read as creases.
const ICONS: Record<SocialLink['icon'] | 'email', ReactNode> = {
  email: (
    <>
      <polygon className="fd" points="1.5,4 22.5,4 22.5,20 1.5,20" />
      <polygon className="fm" points="1.5,4 11.2,12.6 1.5,20" />
      <polygon className="fl" points="1.5,20 12,11.6 22.5,20" />
      <polygon className="fs" points="1.5,4 12,4 12,13.6" />
      <polygon className="fsd" points="12,4 22.5,4 12,13.6" />
    </>
  ),
  linkedin: (
    <>
      <polygon className="fd" points="4,2.5 20,2.5 21.5,4 21.5,20 20,21.5 4,21.5 2.5,20 2.5,4" />
      <polygon className="fl" points="4,2.5 20,2.5 21.5,4 10.5,9.5 2.5,4" />
      <polygon className="fm" points="2.5,4 10.5,9.5 4,21.5 2.5,20" />
      <polygon className="fm" points="21.5,4 21.5,20 10.5,9.5" />
      <polygon className="fi" points="5.6,9.8 8.5,9.8 8.5,18.9 5.6,18.9" />
      <polygon
        className="fi"
        points="10.4,9.8 13.2,9.8 13.2,11 14.8,9.6 17.1,9.5 18.6,10.7 18.9,12.6 18.9,18.9 16,18.9 16,13.4 15.3,12.6 14,12.7 13.2,13.7 13.2,18.9 10.4,18.9"
      />
      <polygon className="fs" points="7.05,4.6 9,6.55 7.05,8.5 5.1,6.55" />
    </>
  ),
  github: (
    <>
      {/* A twelve-sided disc fanned from the center, so each wedge catches the light. */}
      <polygon className="fm" points="12,12 14.74,1.76 19.5,4.5" />
      <polygon className="fd" points="12,12 19.5,4.5 22.24,9.26" />
      <polygon className="fk" points="12,12 22.24,9.26 22.24,14.74" />
      <polygon className="fd" points="12,12 22.24,14.74 19.5,19.5" />
      <polygon className="fk" points="12,12 19.5,19.5 14.74,22.24" />
      <polygon className="fd" points="12,12 14.74,22.24 9.26,22.24" />
      <polygon className="fm" points="12,12 9.26,22.24 4.5,19.5" />
      <polygon className="fd" points="12,12 4.5,19.5 1.76,14.74" />
      <polygon className="fm" points="12,12 1.76,14.74 1.76,9.26" />
      <polygon className="fl" points="12,12 1.76,9.26 4.5,4.5" />
      <polygon className="fm" points="12,12 4.5,4.5 9.26,1.76" />
      <polygon className="fl" points="12,12 9.26,1.76 14.74,1.76" />
      <polygon
        className="fi"
        points="9.4,22.24 9.4,19.6 7.5,19.9 5.8,18.3 4.7,16.8 4.7,16.1 6.3,17.2 9.4,18.1 10.1,16.7 6.2,15.2 5.3,11.4 6.4,8.6 6.5,5.8 9.4,6.9 12,6.5 14.7,6.9 17.6,5.8 17.7,8.6 18.8,11.4 17.8,15.2 13.9,16.7 14.7,18.6 14.7,22.24"
      />
    </>
  ),
}

// Copied: a faceted check in green. Its facets hold 3.8:1 to 5.9:1 on the snow.
const CHECK = (
  <>
    <polygon fill="#3a8a5a" points="2.5,12.5 6,9 10,12.5 10,19.5" />
    <polygon fill="#2e7a4b" points="10,12.5 18,4.5 19.75,6.25 10,16" />
    <polygon fill="#236b40" points="10,16 19.75,6.25 21.5,8 10,19.5" />
  </>
)

/** Two faceted sheets, one over the other. */
const COPY = (
  <>
    <polygon fill="currentColor" opacity="0.55" points="4,1 11,1 11,8 9.4,8 9.4,2.6 4,2.6" />
    <polygon fill="currentColor" points="1,4 8,4 8,11 1,11" />
  </>
)

const glance = {
  onMouseEnter: (e: { currentTarget: Element }) => lookAt(e.currentTarget),
  onFocus: (e: { currentTarget: Element }) => lookAt(e.currentTarget),
}

const COPIED_MS = 1600
/** Keep the box this far inside the viewport. */
const EDGE = 12

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // No async clipboard (insecure context, older browsers): the old way.
    const back = document.activeElement as HTMLElement | null
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
    document.body.append(ta)
    ta.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      // Nothing more to try: the address stays on show to copy by hand.
    }
    ta.remove()
    back?.focus({ preventScroll: true })
    return ok
  }
}

/**
 * The email glyph copies the address instead of opening a mail app. Hovering
 * or focusing it shows the address in a small box with its own copy button;
 * a tap (no hover on touch) copies and pins the box open until the next tap
 * elsewhere. Whichever control copied turns to a check for a moment.
 */
function EmailButton() {
  const root = useRef<HTMLLIElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const pointer = useRef('')
  // Esc'd while focus stays on the glyph: keep it shut until focus leaves.
  const dismissed = useRef(false)
  const timer = useRef(0)
  const id = useId()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [copied, setCopied] = useState<'icon' | 'box' | null>(null)
  const [shift, setShift] = useState(0)
  const open = hovered || focused || pinned

  const close = () => {
    setHovered(false)
    setFocused(false)
    setPinned(false)
  }

  const copy = async (from: 'icon' | 'box') => {
    if (pointer.current === 'touch') setPinned(true)
    pointer.current = ''
    if (!(await copyText(email))) return
    setCopied(from)
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(null), COPIED_MS)
  }
  useEffect(() => () => clearTimeout(timer.current), [])

  // Centered over the glyph, nudged sideways to stay on screen.
  useLayoutEffect(() => {
    if (!open || !root.current || !box.current) return
    const r = root.current.getBoundingClientRect()
    const w = box.current.offsetWidth
    const left = r.left + r.width / 2 - w / 2
    const fit = Math.min(window.innerWidth - EDGE - w, Math.max(EDGE, left))
    setShift(fit - left)
  }, [open])

  // Esc closes it, and so does a tap or click anywhere else.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      close()
      if (root.current?.contains(document.activeElement)) {
        dismissed.current = true
        root.current.querySelector('button')?.focus()
      }
    }
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) close()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  return (
    <li
      ref={root}
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={(e) => {
        // Keyboard focus opens it; focus from a click or tap leaves that to hover and pinning.
        if (e.target.matches(':focus-visible') && !dismissed.current) setFocused(true)
      }}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget)) return
        setFocused(false)
        dismissed.current = false
      }}
    >
      <button
        type="button"
        aria-label="Copy email address"
        aria-describedby={`${id}-address`}
        onPointerDown={(e) => void (pointer.current = e.pointerType)}
        onClick={() => copy('icon')}
        {...glance}
        className="facets group relative grid size-12 cursor-pointer place-items-center focus-visible:outline-offset-2"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="relative z-10 size-7 transition-transform duration-300 ease-out-soft group-hover:-translate-y-[3px] group-focus-visible:-translate-y-[3px] md:size-[30px]"
        >
          {copied === 'icon' ? CHECK : ICONS.email}
        </svg>
        <span
          aria-hidden
          className="absolute bottom-[5px] h-[3px] w-5 scale-x-0 rounded-[50%] bg-navy/25 blur-[1.5px] transition-transform duration-300 ease-out-soft group-hover:scale-x-100 group-focus-visible:scale-x-100"
        />
      </button>

      {/* The bottom padding bridges the gap to the glyph, so the pointer can
          cross into the box without it closing. */}
      <div
        ref={box}
        data-open={open || undefined}
        className="email-pop absolute bottom-full pb-2"
        style={{ left: `calc(50% + ${shift}px)` }}
      >
        <div className="chamfer flex items-center gap-1.5 bg-snow py-1 pr-1 pl-3.5">
          <span id={`${id}-address`} className="font-mono text-[12.5px] tracking-[0.02em] whitespace-nowrap text-navy select-all">
            {email}
          </span>
          <button
            type="button"
            aria-label="Copy"
            onClick={() => copy('box')}
            className="chamfer-sm grid size-8 shrink-0 cursor-pointer place-items-center text-navy-soft transition-colors duration-300 hover:bg-navy/8 hover:text-navy focus-visible:outline-offset-[-3px]"
          >
            <svg aria-hidden viewBox={copied === 'box' ? '0 0 24 24' : '0 0 12 12'} className="size-3.5">
              {copied === 'box' ? CHECK : COPY}
            </svg>
          </button>
        </div>
      </div>
      <span role="status" className="sr-only">
        {copied ? 'Email address copied' : ''}
      </span>
    </li>
  )
}

export default function Links() {
  return (
    <nav aria-label="Links" className="flex items-center justify-center gap-3 min-[25rem]:gap-4 wide:justify-start">
      <a
        href="#resume"
        data-resume-link
        onClick={(e) => {
          e.preventDefault()
          enterResume()
        }}
        {...glance}
        className="group block focus-visible:outline-offset-2"
      >
        {/* Chamfered corners, cut like one of the penguin's facets. */}
        <span className="chamfer flex h-12 items-center gap-3 bg-navy pr-4 pl-5 text-[15px] min-[25rem]:pr-5 min-[25rem]:pl-6 font-medium tracking-[0.01em] text-snow transition-colors duration-300 group-hover:bg-navy-soft">
          Resume
          <svg
            aria-hidden
            viewBox="0 0 12 12"
            className="size-3 transition-transform duration-300 ease-out-soft group-hover:translate-x-0.5"
          >
            <polygon points="7,1 11.4,6 7,6" fill="var(--color-orange)" />
            <polygon points="11.4,6 7,11 7,6" fill="#d27a14" />
            <polygon points="0.6,5 9,5 9,7 0.6,7" fill="var(--color-snow)" />
          </svg>
        </span>
      </a>

      <span aria-hidden className="h-7 w-px bg-navy/20" />

      <ul className="-mr-2.5 flex items-center">
        <EmailButton />
        {socials.map(({ label, href, icon }) => {
          return (
            <li key={label}>
              <a
                href={href}
                aria-label={label}
                title={label}
                target="_blank"
                rel="noopener noreferrer"
                {...glance}
                className="facets group relative grid size-12 place-items-center focus-visible:outline-offset-2"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="relative z-10 size-7 transition-transform duration-300 ease-out-soft group-hover:-translate-y-[3px] group-focus-visible:-translate-y-[3px] md:size-[30px]"
                >
                  {ICONS[icon]}
                </svg>
                {/* A shadow on the snow that appears as the glyph lifts. */}
                <span
                  aria-hidden
                  className="absolute bottom-[5px] h-[3px] w-5 scale-x-0 rounded-[50%] bg-navy/25 blur-[1.5px] transition-transform duration-300 ease-out-soft group-hover:scale-x-100 group-focus-visible:scale-x-100"
                />
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
