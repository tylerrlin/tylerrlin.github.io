// Site content lives here so details can change without touching layout.

export const profile = {
  name: 'Tyler Lin',
  role: 'Software engineer',
}

export type SocialLink = {
  label: string
  href: string
  icon: 'email' | 'linkedin' | 'github'
}

export const socials: SocialLink[] = [
  { label: 'Email', href: 'mailto:tylerrlin@gmail.com', icon: 'email' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/tylerrlin/', icon: 'linkedin' },
  { label: 'GitHub', href: 'https://github.com/tylerrlin', icon: 'github' },
]
