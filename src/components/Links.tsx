import type { ReactNode } from 'react'
import { profile, socials, type SocialLink } from '../content'
import { lookAt } from '../attention'

// Low-poly glyphs that match the penguin: flat facets in three navy tones, an
// orange accent, ice where a cutout would be. Drawn on a 24 x 24 grid. Each
// glyph lays a dark base under its facets so antialiased seams read as creases.
const ICONS: Record<SocialLink['icon'], ReactNode> = {
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

const glance = {
  onMouseEnter: (e: { currentTarget: Element }) => lookAt(e.currentTarget),
  onFocus: (e: { currentTarget: Element }) => lookAt(e.currentTarget),
}

export default function Links() {
  return (
    <nav aria-label="Links" className="flex items-center justify-center gap-3 min-[25rem]:gap-4 wide:justify-start">
      <a
        href={profile.resume}
        target="_blank"
        rel="noopener noreferrer"
        {...glance}
        className="group block focus-visible:outline-offset-2"
      >
        {/* Chamfered corners, cut like one of the penguin's facets. */}
        <span className="chamfer flex h-12 items-center gap-3 bg-navy pr-4 pl-5 text-[15px] min-[25rem]:pr-5 min-[25rem]:pl-6 font-medium tracking-[0.01em] text-snow transition-colors duration-300 group-hover:bg-navy-soft">
          Resume
          <span aria-hidden className="font-mono text-[10px] tracking-[0.18em] text-orange">
            PDF
          </span>
          <svg
            aria-hidden
            viewBox="0 0 12 12"
            className="size-3 transition-transform duration-300 ease-out-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          >
            <polygon points="3,1 11,1 11,9" fill="var(--color-orange)" />
            <polygon points="1,9.6 9,1.6 10.4,3 2.4,11" fill="var(--color-snow)" />
          </svg>
        </span>
        <span className="sr-only"> (PDF, opens in a new tab)</span>
      </a>

      <span aria-hidden className="h-7 w-px bg-navy/20" />

      <ul className="-mr-2.5 flex items-center">
        {socials.map(({ label, href, icon }) => {
          const external = href.startsWith('http')
          return (
            <li key={label}>
              <a
                href={href}
                aria-label={label}
                title={label}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
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
