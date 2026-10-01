// Resume content, transcribed verbatim from Tyler's resume. Words here are
// Tyler's; the walk (components/resume) only lays them out along a path.

export type ResumeEntry = {
  org: string
  role?: string
  dates: string
  bullets: string[]
}

export type ResumeSection = {
  id: 'education' | 'experience'
  title: string
  entries: ResumeEntry[]
}

export const resume: ResumeSection[] = [
  {
    id: 'education',
    title: 'Education',
    entries: [
      {
        org: 'Tufts University — School of Engineering',
        dates: 'Sep 2022 – Present',
        bullets: [
          'Bachelor of Science, Major in Computer Science, Minor in Cognitive and Brain Science',
          "GPA: 3.92 / 4.00, Dean's List",
          'Relevant courses: Algorithms (A-), Data Structures (A), Database Systems (A), Calculus III (A), Linear Algebra (A-), Machine Structure & Assembly (IP), Parallel & High Performance Computing (IP)',
        ],
      },
    ],
  },
  {
    id: 'experience',
    title: 'Experience',
    entries: [
      {
        org: 'Striide Co',
        role: 'Full Stack Engineer Intern',
        dates: 'May 2024 – Sep 2024',
        bullets: [
          'Engineered a complete web authentication and token management solution in Rust, adhering to OWASP best practices for security and access control.',
          'Built an automated CI/CD pipeline to dockerize and deploy the backend REST API on Google Cloud Run.',
          'Extended the Mapbox GL JS API to efficiently display 50,000 open businesses on an interactive map.',
          'Integrated Google Analytics 4 to track, analyze, and improve user engagement by defined metrics.',
          'Developed Python web scraping tools that leverage packet-sniffing techniques to extract paginated data from various sources.',
        ],
      },
      {
        org: 'The Legacy Project @ Tufts JumboCode',
        role: 'Software Engineer',
        dates: 'Oct 2023 – May 2024',
        bullets: [
          'Restructured the user role hierarchy for future expansion across multiple university chapters.',
          'Implemented robust, sanitized, and tested API routes, streamlining the chapter enrollment process.',
          'Migrated existing codebase from NextJS 12 to NextJS 14.',
        ],
      },
      {
        org: 'Stealth Startup',
        role: 'Software Engineer Intern',
        dates: 'May 2023 – Oct 2023',
        bullets: [
          'Extended the Google Maps Python SDK to generate dynamic, populated maps of property assets.',
          'Established a normalized (3NF) SQL database for efficient retrieval of spatial data and asset information.',
        ],
      },
      {
        org: 'FirstRoot Inc',
        role: 'Compliance Consultant',
        dates: 'Jun 2021 – Aug 2021',
        bullets: [
          "Led the exploration of COPPA Compliance for FirstRoot's Participatory Budgeting platform, documenting clear and concise scoping for workflows.",
          'Developed necessary extensions to the data architecture, incorporating input through iterative presentations.',
          'Participated in SAFe® (Agile) development practices, including Daily Stand Ups, Sprint planning/reviews, pair programming, and automated testing in a CI/CD pipeline.',
        ],
      },
    ],
  },
]

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
