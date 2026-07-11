# Esteban — Portfolio

Personal portfolio built with **Next.js (App Router)**, **React**, and **JavaScript**.
Terminal-themed, dark, mono/sans typography, with a typewriter intro in the hero.

## Stack

- [Next.js 14](https://nextjs.org/) — App Router
- React 18
- Plain JavaScript (no TypeScript)
- `next/font` for self-hosted IBM Plex Sans / Mono
- Global CSS (`app/globals.css`) — no CSS framework

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the dev server (hot reload)    |
| `npm run build` | Production build                     |
| `npm run start` | Serve the production build           |

## Project structure

```
app/
  layout.js        Root layout: fonts + metadata
  page.js          Home page — composes all sections
  globals.css      Theme variables + all styles
components/
  Nav.js
  Hero.js          "use client" — typewriter animation
  Projects.js
  Experience.js
  Skills.js
  Footer.js
lib/
  content.js       All copy/data (profile, projects, experience, skills)
legacy/
  index.html       Original single-file version (kept for reference)
```

## Editing content

All text and data lives in [`lib/content.js`](lib/content.js). Edit the arrays
there (projects, experience, skills, profile links) and the UI updates — no need
to touch the components.

## Deploy

Ready for [Vercel](https://vercel.com/): push to a Git repo and import it, or run
`vercel`. No environment variables required.
