// Site content lives here so real details can drop in without touching layout.
// Everything marked TODO is placeholder copy — replace before shipping.

export type Project = {
  name: string
  year: string // e.g. '2025'
  summary: string
  tags: string[]
  href?: string // live site or case study
  source?: string // repository
}

export type ContactLink = {
  label: string
  value: string
  href: string
  copy?: boolean // show a copy-to-clipboard button for the value
}

export const profile = {
  name: 'Tyler Lin',
  role: 'Software engineer',
  // TODO: replace with a real one-to-two sentence introduction.
  intro:
    'A line or two on the kind of software I like to build, and what I care about while building it.',
}

// TODO: replace with real projects (name, one-line summary, stack tags, links).
export const projects: Project[] = [
  {
    name: 'Project name',
    year: '20XX', // TODO
    summary: 'One sentence on what it does and who it is for — the problem, not the stack.',
    tags: ['TypeScript', 'React'],
    href: '#',
    source: '#',
  },
  {
    name: 'Project name',
    year: '20XX', // TODO
    summary: 'One sentence on the most interesting technical decision behind it.',
    tags: ['Go', 'PostgreSQL'],
    source: '#',
  },
  {
    name: 'Project name',
    year: '20XX', // TODO
    summary: 'One sentence on the outcome — what shipped and what changed because of it.',
    tags: ['Python', 'Data'],
    href: '#',
  },
]

// TODO: replace with a real bio. Two short paragraphs reads best in the panel.
export const about: string[] = [
  'A short introduction goes here: what kind of software you like building, and what you care about when you build it.',
  'A second paragraph for what you are exploring lately, or what you are looking for next. Keep it warm and specific.',
]

// TODO: replace with real focus areas / tools (4–8 items).
export const focus: string[] = ['Area one', 'Area two', 'Area three', 'Area four']

// TODO: replace with a real line about what you're open to.
export const contactNote =
  'A sentence about what you are open to — new roles, collaborations, or just a good conversation.'

// TODO: confirm handles and add a real email address.
export const contact: ContactLink[] = [
  { label: 'Email', value: 'hello@example.com', href: 'mailto:hello@example.com', copy: true },
  { label: 'GitHub', value: 'github.com/tylerrlin', href: 'https://github.com/tylerrlin' },
  { label: 'LinkedIn', value: 'linkedin.com/in/your-handle', href: '#' },
]
