// Running plan — the single source of truth for /running.
// Edit sessions here and push; logs live in Redis and are matched by date.
//
// kind:   "run" | "test" | "race" | "walk" | "rest"
// target: planned longest continuous jog for that session, in minutes
//         (used for the progress chart; omit on walk/rest days)

export const goals = {
  race: {
    date: "2026-10-30",
    label: "2.5K race",
  },
  continuous: {
    date: "2026-11-28",
    minutes: 40,
    label: "40 min non-stop (≈5K)",
  },
}

export const paces = {
  jog: "7–7.5 km/h",
  walk: "5–5.5 km/h",
  incline: "1%",
}

const sessions = {
  // Week 1
  "2026-10-03": { kind: "run", title: "4 min jog + 2 walk, x5", target: 4 },
  "2026-10-05": { kind: "run", title: "4 min jog + 2 walk, x5", target: 4 },
  "2026-10-07": { kind: "run", title: "5 min jog + 2 walk, x4", target: 5 },
  "2026-10-09": { kind: "run", title: "5 min jog + 2 walk, x4", target: 5 },
  // Week 2
  "2026-10-10": { kind: "run", title: "6 min jog + 2 walk, x4", target: 6 },
  "2026-10-12": { kind: "run", title: "6 min jog + 2 walk, x4", target: 6 },
  "2026-10-14": { kind: "run", title: "7 min jog + 2 walk, x3", target: 7 },
  "2026-10-16": { kind: "run", title: "7 min jog + 2 walk, x3", target: 7 },
  // Week 3
  "2026-10-17": { kind: "run", title: "8 min jog + 2 walk, x3", target: 8 },
  "2026-10-19": { kind: "run", title: "8 min jog + 2 walk, x3", target: 8 },
  "2026-10-21": { kind: "run", title: "10 min jog + 2 walk, x2", target: 10 },
  "2026-10-23": { kind: "run", title: "12 min jog + 2 walk + 8 jog", target: 12 },
  // Race week
  "2026-10-24": {
    kind: "test",
    title: "Test: 2.5 km as continuous as you can (~20 min)",
    target: 20,
    note: "Checkpoint: 15–20 min non-stop means November is on track. Try it outdoors on flat ground if you can.",
  },
  "2026-10-26": { kind: "run", title: "20 min easy jog (or 10 + 2 walk + 10)", target: 20 },
  "2026-10-28": { kind: "run", title: "15 min easy jog, nothing more", target: 15 },
  "2026-10-29": { kind: "rest", title: "Full rest before the race" },
  "2026-10-30": {
    kind: "race",
    title: "Race day: 2.5K",
    target: 20,
    note: "Start slower than the people around you. Nothing new: no new shoes, no new clothes.",
  },
  "2026-10-31": { kind: "rest", title: "Recovery" },
  "2026-11-01": { kind: "rest", title: "Recovery" },
}

// Phase 2: continuous easy jogs. Mon/Wed/Fri + a long Saturday.
const phase2 = [
  { monday: "2026-11-02", weekday: 20, long: 24 },
  { monday: "2026-11-09", weekday: 22, long: 28 },
  { monday: "2026-11-16", weekday: 25, long: 34 },
  { monday: "2026-11-23", weekday: 25, long: 40 },
]

for (const week of phase2) {
  for (const offset of [0, 2, 4]) {
    sessions[addDays(week.monday, offset)] = {
      kind: "run",
      title: `${week.weekday} min easy continuous jog`,
      target: week.weekday,
    }
  }
  sessions[addDays(week.monday, 5)] = {
    kind: "run",
    title:
      week.long === 40
        ? "Goal run: 40 min non-stop"
        : `Long run: ${week.long} min non-stop`,
    target: week.long,
    long: true,
  }
}

export const weeks = [
  { label: "Week 1", start: "2026-10-03", end: "2026-10-09" },
  { label: "Week 2", start: "2026-10-10", end: "2026-10-16" },
  { label: "Week 3", start: "2026-10-17", end: "2026-10-23" },
  { label: "Race week", start: "2026-10-24", end: "2026-10-30" },
  { label: "Recovery", start: "2026-10-31", end: "2026-11-01" },
  { label: "Week 5", start: "2026-11-02", end: "2026-11-08" },
  { label: "Week 6", start: "2026-11-09", end: "2026-11-15" },
  { label: "Week 7", start: "2026-11-16", end: "2026-11-22" },
  { label: "Week 8", start: "2026-11-23", end: "2026-11-29" },
]

export const planStart = weeks[0].start
export const planEnd = weeks[weeks.length - 1].end

// Any day without an explicit session: Tue/Thu are optional easy walks,
// everything else is rest.
export function sessionFor(date) {
  if (sessions[date]) return { date, ...sessions[date] }
  const day = weekday(date)
  if (day === 2 || day === 4) {
    return { date, kind: "walk", title: "Easy walk 20–30 min, or rest" }
  }
  return { date, kind: "rest", title: "Rest" }
}

export function daysBetween(start, end) {
  const out = []
  for (let d = start; d <= end; d = addDays(d, 1)) out.push(d)
  return out
}

export function buildCalendar() {
  return weeks.map((week) => ({
    ...week,
    days: daysBetween(week.start, week.end).map(sessionFor),
  }))
}

// --- date helpers (dates are plain "YYYY-MM-DD" strings, no timezones) ---

export function addDays(date, n) {
  const [y, m, d] = date.split("-").map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + n))
  return t.toISOString().slice(0, 10)
}

export function weekday(date) {
  const [y, m, d] = date.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

export function diffDays(from, to) {
  const toUTC = (s) => {
    const [y, m, d] = s.split("-").map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((toUTC(to) - toUTC(from)) / 86400000)
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

export function formatDay(date) {
  const [, m, d] = date.split("-").map(Number)
  return `${DAY_NAMES[weekday(date)]} ${MONTH_NAMES[m - 1]} ${d}`
}

export function formatShort(date) {
  const [, m, d] = date.split("-").map(Number)
  return `${MONTH_NAMES[m - 1]} ${d}`
}
