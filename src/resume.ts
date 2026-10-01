// Tyler's resume. Edit the content below to change the resume walk: sections
// appear in this order, each entry becomes a stop on the path, followed by one
// stop per bullet. TypeScript checks the shape at build time, so a missing or
// misspelled field fails `npm run build`.

export type ResumeEntry = {
  /** Organization or school, shown as the entry heading. */
  org: string
  /** Job title or degree line under the heading (optional). */
  role?: string
  /** Free-form date range, e.g. "May 2024 – Sep 2024" (optional). */
  dates?: string
  /** One stop on the walk per bullet. */
  bullets: string[]
}

export type ResumeSection = {
  /** Section heading, also used for the section link in the top bar. */
  title: string
  entries: ResumeEntry[]
}

export const resume = withIds([
  {
    title: 'Education',
    entries: [
      {
        org: 'Tufts University — School of Engineering',
        dates: 'Sep 2022 – May 2026',
        bullets: [
          'Bachelor of Science, Major in Computer Science, Minor in Cognitive and Brain Science',
          'GPA: 3.84 / 4.00',
          'Relevant Courses: Parallel & High Performance Computing, Algorithms, Data Structures, Database Systems, Multivariable Calculus, Linear Algebra, Machine Structure & Assembly',
        ],
      },
    ],
  },
  {
    title: 'Experience',
    entries: [
      {
        org: 'State Street Markets',
        role: 'eFX Benchmarks Intern',
        dates: 'Jun 2025 – Aug 2025',
        bullets: [
          'Developed a gradient boosting regressor to predict fixing window currency pair correlations.',
          'Built a real-time dashboard to monitor anonymous market-making activity across ECNs/fixing sessions.',
          'Analyzed the effectiveness of a benchmark execution strategy during WMR fixing windows.',
        ],
      },
      {
        org: 'Striide Co',
        role: 'Full Stack Engineer Intern',
        dates: 'May 2024 – Sep 2024',
        bullets: [
          'Engineered a complete web authentication and token management solution in Rust (Rocket), adhering to OWASP best practices for security and access control.',
          'Built an automated CI/CD pipeline to dockerize and deploy the backend REST API on Google Cloud Run.',
          'Extended the Mapbox GL JS API to efficiently display 50,000 open businesses on an interactive map.',
          'Integrated Google Analytics 4 to track, analyze, and improve user engagement.',
          'Developed Python web scraping tools to extract paginated data from various sources.',
        ],
      },
      {
        org: 'The Legacy Project @ Tufts JumboCode',
        role: 'Software Engineer',
        dates: 'Oct 2023 – May 2024',
        bullets: [
          'Restructured the user role hierarchy for future expansion across multiple university chapters.',
          'Implemented robust, sanitized, and unit tested API routes, streamlining the chapter enrollment process.',
          'Migrated existing codebase from NextJS 12 to NextJS 14.',
        ],
      },
      {
        org: 'Stealth Startup',
        role: 'Software Engineer Intern',
        dates: 'May 2023 – Oct 2023',
        bullets: [
          'Extended the open source Google Maps Python SDK to generate dynamic, populated maps of property assets.',
          'Established a normalized (3NF) SQL database for efficient retrieval of spatial data and asset information.',
        ],
      },
    ],
  },
])

/** Give each section a stable id derived from its title (used for anchors and links). */
function withIds(sections: ResumeSection[]) {
  return sections.map((s) => ({
    ...s,
    id: s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  }))
}

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
