export type SectionId = 'projects' | 'about' | 'contact'

export const SECTIONS: { id: SectionId; label: string; hint: string }[] = [
  { id: 'projects', label: 'Projects', hint: 'Selected work' },
  { id: 'about', label: 'About', hint: 'Who I am' },
  { id: 'contact', label: 'Contact', hint: 'Say hello' },
]

export function sectionFromHash(hash: string): number {
  return SECTIONS.findIndex((s) => `#${s.id}` === hash)
}
