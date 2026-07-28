// Central content for the portfolio. Editing text/data here updates the UI —
// the React components just render whatever lives in these arrays/objects.

// Production URL — single source of truth for metadataBase, Open Graph,
// sitemap and robots. Set NEXT_PUBLIC_SITE_URL in Vercel once the domain is
// known; until then everything falls back to the default below (edit it here).
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://esteban-portfolio.vercel.app"

export const profile = {
  brand: "esteban@portfolio",
  name: "Esteban",
  // Keep `role` short — it also renders as a single line in the generated
  // Open Graph image (app/opengraph-image.js), which does not wrap.
  role: "Junior Software Engineer · QA · Data",
  cv: "/cv/Esteban_Chaves_Obando.pdf",
  meta: [
    { key: "location:", value: "San José, Costa Rica 🇨🇷 (open to remote)" },
    {
      key: "focus:",
      value:
        "I build things end to end — software development, testing, and data",
    },
    {
      key: "status:",
      value:
        "CS graduate (UCR, jul 2026) · open to junior roles — software engineering, QA, or data",
    },
  ],
  links: {
    github: "https://github.com/Esteban-PG",
    linkedin: "https://www.linkedin.com/in/esteban-chaves-obando1010/",
    email: "esteban.alp10@gmail.com",
    // itch.io page for Ragebait — fill in when published to show the
    // "also on: itch.io →" link on the /ragebait page.
    itch: "",
  },
}

export const projects = [
  {
    slug: "job-alert-bot",
    title: "Job Alert Bot — Telegram Alerts for Corporate Job Boards",
    // `status` renders as a live badge in the card header (optional).
    status: "live · running every 30 min since jul 2026",
    description:
      "A job-alert bot that watches six corporate career sites and sends new matching vacancies straight to Telegram. Most companies don't build their own job board — they rent an ATS — so classifying sources by platform collapses them into a handful of reusable templates, and adding a new company becomes a YAML entry instead of new code. It runs unattended on GitHub Actions every 30 minutes and costs nothing to operate.",
    // `highlights` renders as a bullet list under the description (optional).
    highlights: [
      "Reverse-engineered the private REST APIs behind Workday, Phenom, Radancy and Amazon's own ATS — a CSRF token hidden inside a session JWT, opaque GUID location facets, and an all-or-nothing location filter that silently returns the global catalog when partially specified.",
      "Config-driven architecture: 6 active boards run on 5 reusable platform templates — adding a company touches no Python.",
      "Stateful on stateless infrastructure: a 20 KB SQLite dedupe ledger survives ephemeral CI runners via immutable cache keys, so each run notifies only genuinely new postings.",
      "Built to fail loudly: alerts when a source breaks after two consecutive failures, and again when it recovers — for an alert bot, silence is ambiguous.",
      "73 tests, no network required, running in CI on Python 3.12 and 3.14.",
    ],
    chips: [
      "Python",
      "SQLite",
      "GitHub Actions",
      "REST APIs",
      "Reverse Engineering",
      "Telegram Bot API",
      "pytest",
      "CI/CD",
    ],
    links: [
      { label: "source →", href: "https://github.com/Esteban-PG/Job-alert-bot" },
    ],
  },
  {
    slug: "ragebait",
    title: "Ragebait — Trap Platformer on a Custom Engine",
    description:
      "A trap platformer: reach the exit door while dodging spikes, falling walls, and floors that vanish under your feet. 12 levels across 3 worlds with progress saved between sessions — built on my own C++17 / SDL2 / Lua engine with an Entity-Component-System architecture. Levels are designed in Tiled and driven by hot-reloadable Lua scripts (no recompile), with procedural textures, code-generated 8-bit audio, and a WebAssembly port.",
    chips: ["C++17", "SDL2", "Lua", "ECS", "Tiled", "WebAssembly"],
    links: [
      // Plays in the browser on its own page (WASM build in public/ragebait/).
      { label: "play →", href: "/ragebait", internal: true },
      // Cuando el repo sea público / esté en itch.io, agregar aquí:
      // { label: "source →", href: "https://github.com/sebasbose/ragebait" },
    ],
  },
]

export const experience = [
  {
    role: "Intern, Associate Consultant — Mastercard",
    meta: "jan 2026 – mar 2026 · data & analytics",
    bullets: [
      "Analyzed millions of payment transactions using SQL and Python to identify market performance trends across Caribbean clients, supporting strategic business recommendations.",
      "Designed and built a KPI dashboard in Excel consolidating performance metrics for Caribbean market accounts, surfacing optimization opportunities across client operations.",
      "Delivered 3 client-facing executive presentations in English, translating multi-million-record analyses into clear narratives for technical and non-technical stakeholders.",
    ],
  },
  {
    role: "Test Engineer — HCL Tech",
    meta: "aug 2025 – dec 2025 · QA",
    bullets: [
      "Executed daily functional and regression test cycles on new software builds, running ~30 manual test cases per application for tech and gaming industry clients under same-day turnaround, logging execution and results in Jira.",
      "Identified and escalated 3 critical defects ahead of release, documenting detailed reproduction steps and evidence in Jira in compliance with testing procedures and security controls to support release stability.",
      "Maintained test case documentation in Confluence for a 5-person QA team, sustaining consistent regression coverage across a continuous stream of new applications within Agile sprint timelines and daily stand-ups.",
    ],
  },
  {
    role: "B.Sc. in Computer Science — Universidad de Costa Rica",
    meta: "mar 2021 – jul 2026 · ECCI, UCR",
    href: "https://www.ecci.ucr.ac.cr/oferta-académica/bachillerato-en-computación-con-varios-énfasis-0",
    bullets: [
      "Four-year degree at ECCI–UCR with an emphasis in Software Engineering: software architecture & design, quality assurance, and Agile project management.",
      "Coursework: software engineering, software testing, data structures, relational databases, operating systems, concurrency & parallel programming, and networking protocols.",
      "Carried it into real work: testing coursework applied as a Test Engineer, and a self-built C++17 / SDL2 / Lua game engine (ECS) — now playable in the browser via WebAssembly.",
    ],
  },
  {
    role: "Technical Degree in Software Development — Colegio Técnico de Aserrí",
    meta: "feb 2018 – dec 2020 · technical high school",
  },
]

export const skills = [
  {
    group: "languages",
    items: ["Java", "Python", "SQL", "C/C++", "JavaScript", "Lua"],
  },
  {
    group: "frameworks",
    items: ["React · Next.js", "JUnit", "pytest", "SDL2"],
  },
  {
    group: "data",
    items: [
      "PostgreSQL · MySQL · SQLite",
      "Power BI",
      "Excel (KPI dashboards)",
      "Window functions · CTEs",
    ],
  },
  {
    group: "tools",
    items: [
      "Git / GitHub",
      "GitHub Actions",
      "Jira · Confluence",
      "Vercel",
      "Linux / UNIX",
    ],
  },
  {
    group: "practices",
    items: [
      "Unit & automated testing (pytest)",
      "Functional & regression testing",
      "CI/CD with GitHub Actions",
      "Code review & Git workflows",
      "Agile / Scrum · SDLC",
    ],
  },
  {
    group: "cloud_coursework",
    items: ["GCP & AWS fundamentals", "Microservices architecture"],
  },
  {
    group: "languages_spoken",
    items: ["Spanish (native)", "English (advanced / fluent)"],
  },
]
