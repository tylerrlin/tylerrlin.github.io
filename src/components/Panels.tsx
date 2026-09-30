import { forwardRef, useEffect, useRef, useState, type ReactNode } from 'react'
import { about, contact, contactNote, focus, projects } from '../content'
import { SECTIONS, type SectionId } from '../sections'

function Arrow() {
  return (
    <svg aria-hidden viewBox="0 0 12 12" className="size-2.5">
      <path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[11px] tracking-[0.2em] text-slate uppercase">{children}</p>
  )
}

function ProjectsBody() {
  return (
    <ol className="border-t border-navy/12">
      {projects.map((p, i) => (
        <li
          key={i}
          className="grid grid-cols-[2rem_1fr] gap-x-4 border-b border-navy/12 py-6 md:grid-cols-[2.5rem_1fr]"
        >
          <span className="pt-2 font-mono text-xs tabular-nums text-slate">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div>
            {/* Name left, year right-aligned on the same line: the list reads as an index. */}
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-display text-[1.875rem] leading-tight">{p.name}</h3>
              <span className="shrink-0 font-mono text-xs tabular-nums text-slate">
                <span className="sr-only">Year: </span>
                {p.year}
              </span>
            </div>
            <p className="mt-1.5 max-w-[46ch] text-[15px] leading-relaxed text-slate">{p.summary}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <ul className="flex flex-wrap gap-1.5" aria-label="Built with">
                {p.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-navy/15 px-2.5 py-0.5 font-mono text-[11px] tracking-wide text-navy-soft"
                  >
                    {t}
                  </li>
                ))}
              </ul>
              <div className="flex gap-4 font-mono text-xs">
                {p.href && (
                  <a
                    href={p.href}
                    className="inline-flex items-center gap-1.5 text-navy underline decoration-navy/25 underline-offset-4 transition-colors hover:text-ember hover:decoration-ember"
                  >
                    Visit <Arrow />
                    <span className="sr-only">{p.name}</span>
                  </a>
                )}
                {p.source && (
                  <a
                    href={p.source}
                    className="inline-flex items-center gap-1.5 text-navy underline decoration-navy/25 underline-offset-4 transition-colors hover:text-ember hover:decoration-ember"
                  >
                    Source <Arrow />
                    <span className="sr-only">for {p.name}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}

function AboutBody() {
  return (
    <div className="space-y-10">
      <div className="max-w-[52ch] space-y-5 text-[17px] leading-[1.7] text-navy-soft">
        {about.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      <div>
        <Kicker>Focus</Kicker>
        <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 border-t border-navy/12 pt-5 sm:max-w-md">
          {focus.map((f) => (
            <li key={f} className="flex items-center gap-3 text-[15px]">
              <span aria-hidden className="size-1.5 rotate-45 bg-orange" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard unavailable (e.g. insecure context): nothing to announce.
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? `${label} copied` : `Copy ${label.toLowerCase()}`}
        className={[
          'inline-flex size-9 shrink-0 sm:h-7 sm:w-[5.25rem] cursor-pointer items-center justify-center gap-1.5 rounded-full border font-mono text-[10px] tracking-[0.16em] uppercase transition-colors duration-200',
          copied
            ? 'border-navy bg-navy text-snow'
            : 'border-navy/15 text-navy-soft hover:border-navy/35 hover:text-navy',
        ].join(' ')}
      >
        {copied ? (
          <svg aria-hidden viewBox="0 0 16 16" className="size-3">
            <path d="m3 8.5 3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        ) : (
          <svg aria-hidden viewBox="0 0 16 16" className="size-3">
            <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10.5 3.5v-.5A1.5 1.5 0 0 0 9 1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        )}
        <span aria-hidden className="hidden sm:inline">
          {copied ? 'Copied' : 'Copy'}
        </span>
      </button>
      <span role="status" className="sr-only">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </>
  )
}

function ContactBody() {
  return (
    <div className="space-y-8">
      <p className="max-w-[44ch] text-[17px] leading-[1.7] text-navy-soft">{contactNote}</p>
      <ul className="border-t border-navy/12">
        {contact.map((c) => (
          <li key={c.label} className="flex items-center gap-3 border-b border-navy/12">
            <a
              href={c.href}
              {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
              className="group grid min-w-0 flex-1 grid-cols-[4.25rem_1fr] items-baseline gap-3 py-5 transition-colors hover:text-ember sm:grid-cols-[5.5rem_1fr] sm:gap-4"
            >
              <span className="font-mono text-[11px] tracking-[0.18em] text-slate uppercase">
                {c.label}
              </span>
              {/* The arrow follows the value, so rows stay aligned with or without a copy button. */}
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="min-w-0 truncate font-display text-[1.3rem] leading-tight sm:text-2xl md:text-[1.75rem]">
                  {c.value}
                </span>
                <span className="shrink-0 text-slate transition-transform duration-300 ease-out-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ember">
                  <Arrow />
                </span>
              </span>
            </a>
            {c.copy && <CopyButton text={c.value} label={c.label === 'Email' ? 'Email address' : c.label} />}
          </li>
        ))}
      </ul>
    </div>
  )
}

const BODIES: Record<SectionId, () => ReactNode> = {
  projects: ProjectsBody,
  about: AboutBody,
  contact: ContactBody,
}

type Props = { index: number; onClose: () => void }

const Panel = forwardRef<HTMLHeadingElement, Props>(function Panel({ index, onClose }, headingRef) {
  const section = SECTIONS[index]
  const Body = BODIES[section.id]
  return (
    <section
      id={`panel-${section.id}`}
      aria-labelledby={`panel-${section.id}-title`}
      className="rise-in"
    >
      <button
        type="button"
        onClick={onClose}
        className="group -ml-1 inline-flex cursor-pointer items-center gap-3 py-1 pl-1 font-mono text-xs tracking-[0.14em] text-slate uppercase transition-colors hover:text-navy"
      >
        <svg aria-hidden viewBox="0 0 14 10" className="h-2.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5">
          <path d="M5 1 1 5l4 4M1 5h12" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        Back
        <kbd className="hidden rounded border border-navy/20 px-1.5 py-px font-mono text-[10px] tracking-normal text-slate [@media(hover:hover)]:inline">
          Esc
        </kbd>
      </button>

      <header className="mt-8 mb-8 md:mt-10 md:mb-10">
        <Kicker>
          {String(index + 1).padStart(2, '0')} &nbsp;/&nbsp; {section.hint}
        </Kicker>
        <h2
          id={`panel-${section.id}-title`}
          ref={headingRef}
          tabIndex={-1}
          className="mt-3 font-display text-6xl leading-[0.95] tracking-[-0.01em] outline-none md:text-7xl"
        >
          {section.label}
        </h2>
      </header>

      <Body />
    </section>
  )
})

export default Panel
