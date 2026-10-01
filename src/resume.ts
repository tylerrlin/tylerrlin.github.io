import data from '../resume.json'

// The resume's words live in /resume.json (edit that file to change them).
// This module types and validates it, and flattens it into the stops the walk
// lays out along the path. `npm run build` type-checks resume.json against
// ResumeFile below, so a missing or misspelled field fails the build.

export type ResumeEntry = {
  /** Organization or school, shown as the entry heading. */
  org: string
  /** Job title or degree line under the heading (optional). */
  role?: string
  /** Free-form date range, e.g. "May 2024 – Sep 2024". */
  dates: string
  /** One stop on the walk per bullet. */
  bullets: string[]
}

export type ResumeSection = {
  /** Section heading, also used for the section link in the top bar. */
  title: string
  entries: ResumeEntry[]
}

type ResumeFile = { sections: ResumeSection[] }

const file: ResumeFile = data

/** Sections in reading order, each with a stable id derived from its title. */
export const resume = file.sections.map((s) => ({
  ...s,
  id: s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
}))

/** One stop on the path: a heading, an entry's header, or a single line. */
export type Station = {
  kind: 'section' | 'entry' | 'line'
  section: number
  /** Index of the entry this stop belongs to (entries are numbered across sections), or -1. */
  entry: number
}

/** The resume flattened into stops, in reading order. */
export const stations: Station[] = (() => {
  const out: Station[] = []
  let entry = 0
  resume.forEach((s, si) => {
    out.push({ kind: 'section', section: si, entry: -1 })
    for (const e of s.entries) {
      out.push({ kind: 'entry', section: si, entry })
      for (let b = 0; b < e.bullets.length; b++) out.push({ kind: 'line', section: si, entry })
      entry++
    }
  })
  return out
})()
