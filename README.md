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
  layout.js            Root layout: fonts + metadata
  page.js              Home page — composes all sections
  globals.css          Theme variables + all styles
  icon.svg             Favicon
  opengraph-image.js   Social preview, generated at build time
  sitemap.js           /sitemap.xml
  robots.js            /robots.txt
  ragebait/page.js     /ragebait — plays the WASM build of the game
components/
  Nav.js
  Hero.js              "use client" — typewriter animation
  Projects.js
  Experience.js
  Skills.js
  Footer.js
  RagebaitGame.js      "use client" — Emscripten canvas + loader
lib/
  content.js           All copy/data (profile, projects, experience, skills)
public/
  cv/                  Downloadable CV (PDF)
  ragebait/            Emscripten build artifacts — see docs/ragebait-build.md
docs/
  ragebait-build.md    How to refresh the Ragebait WASM build
```

> Anything inside `public/` is served as-is at the site root, so keep notes and
> docs in `docs/` instead.

## Editing content

All text and data lives in [`lib/content.js`](lib/content.js). Edit the arrays
there (projects, experience, skills, profile links) and the UI updates — no need
to touch the components.

## Deploy

Deployed on [Vercel](https://vercel.com/) at
<https://personal-portfolio-ten-sigma-53.vercel.app>; every push to `main`
redeploys.

### Environment variables

| Variable               | Required | Purpose                                                                 |
| ---------------------- | -------- | ----------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | No       | Canonical/OG/sitemap/robots base URL. Set it when a custom domain is added — otherwise `siteUrl` in [`lib/content.js`](lib/content.js) falls back to the Vercel URL above. |
