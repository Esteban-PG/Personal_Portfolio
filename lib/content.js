// Central content for the portfolio. Editing text/data here updates the UI —
// the React components just render whatever lives in these arrays/objects.

export const profile = {
  brand: "esteban@portfolio",
  name: "Esteban",
  role: "Computer Science graduate · Software · Data · QA",
  cv: "/cv/Esteban_Chaves_Obando.pdf",
  meta: [
    { key: "location:", value: "Costa Rica 🇨🇷 (open to remote)" },
    {
      key: "focus:",
      value:
        "I build things end to end — engineering, data, and testing",
    },
    {
      key: "status:",
      value:
        "CS degree completed · available for junior roles — software engineering, data, QA",
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
    role: "B.Sc. in Computing — Software Engineering emphasis",
    meta: "graduated jul 2026 · ECCI, Universidad de Costa Rica",
    href: "https://www.ecci.ucr.ac.cr/oferta-académica/bachillerato-en-computación-con-varios-énfasis-0",
    bullets: [
      "Four-year B.Sc. in Computing (ECCI–UCR) with an emphasis in Software Engineering: software architecture & design, quality assurance, relational databases, and Agile project management.",
      "Coursework: software testing (CI-0142), databases & SQL, algorithms & data structures, operating systems, and software engineering practice (Scrum / Kanban).",
      "Carried it into real work: testing coursework applied as a Test Engineer, and a self-built C++17 / SDL2 / Lua game engine (ECS) — now playable in the browser via WebAssembly.",
    ],
  },
]

export const skills = [
  {
    group: "languages",
    items: ["Python", "SQL", "C/C++ / Lua", "JavaScript", "Java"],
  },
  {
    group: "data",
    items: [
      "PostgreSQL · MySQL",
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
