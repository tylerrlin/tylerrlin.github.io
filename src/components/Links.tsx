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
      <polygon
        className="fd"
        points="14.74,1.76 19.5,4.5 22.24,9.26 22.24,14.74 19.5,19.5 14.74,22.24 9.26,22.24 4.5,19.5 1.76,14.74 1.76,9.26 4.5,4.5 9.26,1.76"
      />
      <polygon className="fl" points="11,10.5 9.26,1.76 14.74,1.76 19.5,4.5" />
      <polygon className="fl" points="11,10.5 1.76,9.26 4.5,4.5 9.26,1.76" />
      <polygon className="fm" points="11,10.5 19.5,4.5 22.24,9.26 22.24,14.74" />
      <polygon className="fm" points="11,10.5 4.5,19.5 1.76,14.74 1.76,9.26" />
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
    <nav aria-label="Links" className="flex items-center justify-center gap-5 wide:justify-start">
      <a
        href={profile.resume}
        target="_blank"
        rel="noopener noreferrer"
        {...glance}
        className="group inline-flex h-11 items-center gap-2.5 rounded-[3px] bg-navy pr-4 pl-5 text-[15px] font-medium tracking-[0.01em] text-snow transition-colors duration-300 hover:bg-navy-soft"
      >
        Resume
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className="size-3 text-orange transition-transform duration-300 ease-out-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        >
          <path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        <span className="sr-only">(PDF, opens in a new tab)</span>
      </a>

      <span aria-hidden className="h-6 w-px bg-navy/20" />

      <ul className="-mx-2.5 flex items-center">
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
                className="facets grid size-11 place-items-center rounded-[3px]"
              >
                <svg aria-hidden viewBox="0 0 24 24" className="size-[26px] wide:size-6">
                  {ICONS[icon]}
                </svg>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
