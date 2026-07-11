// Central content for the portfolio. Editing text/data here updates the UI —
// the React components just render whatever lives in these arrays/objects.

export const profile = {
  brand: "esteban@portfolio",
  name: "Esteban",
  role: "Systems Engineering student · Software / Data / QA",
  meta: [
    { key: "location:", value: "Costa Rica 🇨🇷 (open to remote)" },
    {
      key: "focus:",
      value:
        "building tools that automate real problems — from game engines to data pipelines",
    },
    {
      key: "status:",
      value:
        "available for junior roles — software engineering, data analysis, QA",
    },
  ],
  links: {
    github: "https://github.com/Esteban-PG",
    linkedin: "https://www.linkedin.com/in/esteban-chaves-obando1010/",
    email: "esteban.alp10@gmail.com",
  },
}

export const projects = [
  {
    slug: "slash",
    title: "Slash — 2D Game Engine & Precision Platformer",
    description:
      'A custom 2D game engine built from scratch in C++ with Lua scripting, powering "Slash" — a deceptive precision platformer ("Looks easy. It\'s not."). Features an ECS architecture, SDL2 rendering, Tiled map integration, and a trigger-zone system driven by shared Lua globals.',
    chips: ["C++", "Lua", "SDL2", "ECS", "Tiled"],
    link: { label: "source →", href: "https://github.com/Esteban-PG" },
  },
  {
    slug: "job-radar",
    title: "Job Radar — Career Page Monitor Bot",
    description:
      "A Python bot that automates job hunting: it monitors the career pages of target companies, detects new openings that match configured keywords, and sends alerts — turning hours of manual checking into a background process.",
    chips: ["Python", "Web Scraping", "Automation"],
    link: { label: "source →", href: "https://github.com/Esteban-PG" },
  },
  {
    slug: "resto-os",
    title: "Restaurant Order Management System",
    description:
      "A digital order management system conceived after observing a real bottleneck at a local restaurant. Designed as a mobile-first PWA covering order intake, kitchen flow, and daily sales visibility for small food businesses.",
    chips: ["Next.js", "Supabase", "PWA", "Vercel"],
    link: { label: "case study →", href: "https://github.com/Esteban-PG" },
  },
  {
    slug: "sql-pipelines",
    title: "SQL & Data Pipeline Portfolio",
    description:
      "A collection of data projects on public datasets: advanced SQL (window functions, CTEs, query optimization), data cleaning and transformation in Python, and analysis-ready outputs — built as practice for production data engineering workflows.",
    chips: ["SQL", "PostgreSQL", "Python", "pandas"],
    link: { label: "source →", href: "https://github.com/Esteban-PG" },
  },
]

export const experience = [
  {
    role: "Data Analytics Intern — Mastercard",
    meta: "internship · data & reporting",
    bullets: [
      "Independently managed datasets end-to-end: cleaning, transforming, and validating raw data.",
      "Built KPI dashboards in Excel used for recurring business reporting.",
      "Presented findings directly to stakeholders, translating data into decisions.",
    ],
  },
  {
    role: "Test Engineer — HCL Tech",
    meta: "aug 2025 – dec 2025 · QA",
    bullets: [
      "Executed functional and regression testing cycles across enterprise software applications, identifying and reproducing defects with documented precision.",
      "Produced technically detailed bug reports in compliance with testing and security procedures, contributing to software stability and release readiness.",
    ],
  },
  {
    role: "B.Sc. Systems Engineering — Universidad de Costa Rica",
    meta: "final-year student",
    bullets: [
      "Coursework in software testing (CI-0142), databases, and software engineering practice.",
      "Focus areas: test automation, CI/CD, Agile methodologies (Scrum/Kanban).",
    ],
  },
]

export const skills = [
  {
    group: "languages",
    items: ["Python", "SQL", "C++ / Lua", "JavaScript"],
  },
  {
    group: "data",
    items: [
      "PostgreSQL · MySQL · Oracle",
      "Advanced Excel",
      "Data cleaning & KPI dashboards",
      "Window functions · CTEs",
    ],
  },
  {
    group: "practices",
    items: [
      "Test automation & QA",
      "CI/CD · DevOps basics",
      "Agile (Scrum / Kanban)",
      "Git",
    ],
  },
  {
    group: "languages_spoken",
    items: ["Spanish (native)", "English (professional)"],
  },
]
