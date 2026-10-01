import { socials, type SocialLink } from '../content'
import { lookAt } from '../attention'

const ICONS: Record<SocialLink['icon'], string> = {
  email: 'M3 5.5h18v13H3zM3.5 6l8.5 7 8.5-7',
  linkedin:
    'M4.5 9.5h3v10h-3zM6 4.5a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5zM10 9.5h2.9v1.4c.5-.9 1.6-1.7 3.2-1.7 3 0 3.6 2 3.6 4.5v5.8h-3v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7v5.2h-3z',
  github:
    'M12 2.8a9.3 9.3 0 0 0-2.9 18.1c.5.1.6-.2.6-.4v-1.6c-2.6.6-3.2-1.2-3.2-1.2-.4-1.1-1-1.4-1-1.4-.9-.6 0-.6 0-.6 1 .1 1.5 1 1.5 1 .8 1.4 2.2 1 2.8.8.1-.6.3-1 .6-1.2-2.1-.2-4.3-1-4.3-4.6 0-1 .4-1.9 1-2.5-.1-.3-.4-1.2.1-2.5 0 0 .8-.3 2.6 1a8.9 8.9 0 0 1 4.7 0c1.8-1.3 2.6-1 2.6-1 .5 1.3.2 2.2.1 2.5.6.6 1 1.5 1 2.5 0 3.6-2.2 4.4-4.3 4.6.3.3.6.9.6 1.8v2.7c0 .3.2.6.6.4A9.3 9.3 0 0 0 12 2.8z',
}

export default function Socials() {
  return (
    <ul className="flex items-center justify-center gap-2 md:-ml-2.5 md:justify-start">
      {socials.map(({ label, href, icon }) => {
        const external = href.startsWith('http')
        return (
          <li key={label}>
            <a
              href={href}
              aria-label={label}
              title={label}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              onMouseEnter={(e) => lookAt(e.currentTarget)}
              onFocus={(e) => lookAt(e.currentTarget)}
              className="grid size-11 place-items-center rounded-full text-navy-soft transition-colors duration-300 hover:bg-navy/[0.06] hover:text-navy"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-[22px]"
                {...(icon === 'email'
                  ? { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinejoin: 'round' as const }
                  : { fill: 'currentColor' })}
              >
                <path d={ICONS[icon]} />
              </svg>
            </a>
          </li>
        )
      })}
    </ul>
  )
}
