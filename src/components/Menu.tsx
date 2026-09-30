const ITEMS = [
  { label: 'projects', href: '#projects' },
  { label: 'about', href: '#about' },
  { label: 'contact', href: '#contact' },
]

export default function Menu() {
  return (
    <div className="w-full max-w-sm">
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
        Tyler Lin
      </h1>
      <p className="mt-3 text-sm text-ink/60">
        software engineer
      </p>

      <nav className="mt-12">
        <ul className="space-y-4">
          {ITEMS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className="group flex items-baseline gap-3 text-lg transition-colors hover:text-accent"
              >
                <span
                  aria-hidden
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  &gt;
                </span>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
