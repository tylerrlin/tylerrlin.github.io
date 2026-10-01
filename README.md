# tylerrlin.github.io

Personal portfolio — minimalist game-menu home screen with a low-poly 3D penguin.

## Stack

- [Vite](https://vite.dev) + React + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) (via `@tailwindcss/vite`)
- [React Three Fiber](https://r3f.docs.pmnd.rs) + [drei](https://drei.docs.pmnd.rs)

## Content

Name, role and social links live in `src/content.ts`.

The resume lives in [`resume.json`](resume.json) at the repo root. Edit it to
change the walk; no code changes needed. Sections appear in file order, and each
entry becomes a stop on the path, followed by one stop per bullet:

```json
{
  "sections": [
    {
      "title": "Experience",
      "entries": [
        {
          "org": "Company",
          "role": "Job title (optional)",
          "dates": "May 2024 – Sep 2024",
          "bullets": ["One stop per bullet."]
        }
      ]
    }
  ]
}
```

`npm run build` type-checks the file, so a missing or misspelled field fails
the build with an error pointing at it.

## Development

```sh
npm install
npm run dev      # dev server
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build locally
```

## Deployment

Pushes to `main` build and deploy to GitHub Pages via `.github/workflows/deploy.yml`.
