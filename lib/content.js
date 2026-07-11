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
  // Sin proyectos por ahora — se agregarán los reales aquí.
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
