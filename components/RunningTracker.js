"use client"

import { useEffect, useMemo, useState } from "react"
import {
  buildCalendar,
  sessionFor,
  goals,
  paces,
  planStart,
  planEnd,
  addDays,
  weekday,
  diffDays,
  formatDay,
  formatShort,
} from "@/lib/running-plan"

const KEY_STORAGE = "running-key"
const LOGGABLE = ["run", "test", "race", "walk"]
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const PLACE_LABEL = {
  treadmill: "treadmill",
  outdoor: "outdoors",
  mountain: "mountain",
}
const BREATHING_LABEL = {
  easy: "breathing easy",
  ok: "breathing ok",
  hard: "breathing hard",
  "very-hard": "breathing very hard",
}

function localToday() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function inPlan(date) {
  return date >= planStart && date <= planEnd
}

// Weeks run Monday to Sunday.
function startOfWeek(date) {
  return addDays(date, -((weekday(date) + 6) % 7))
}

function round1(n) {
  return Math.round(n * 10) / 10
}

// Average pace for a session in min/km, or null without distance and time.
function paceOf(log) {
  if (!log?.distanceKm || !log?.totalMin) return null
  return log.totalMin / log.distanceKm
}

function formatPace(minPerKm) {
  let m = Math.floor(minPerKm)
  let s = Math.round((minPerKm - m) * 60)
  if (s === 60) {
    m += 1
    s = 0
  }
  return `${m}:${String(s).padStart(2, "0")} /km`
}

function summarize(log) {
  if (!log) return ""
  if (log.status === "skipped") return "skipped"
  const parts = []
  if (log.distanceKm != null) parts.push(`${log.distanceKm} km`)
  if (log.continuousMin != null) parts.push(`${log.continuousMin} min non-stop`)
  if (log.totalMin != null) parts.push(`${log.totalMin} min total`)
  const pace = paceOf(log)
  if (pace) parts.push(formatPace(pace))
  if (log.speedKmh != null) parts.push(`${log.speedKmh} km/h`)
  if (log.place) parts.push(PLACE_LABEL[log.place])
  if (log.breathing) parts.push(BREATHING_LABEL[log.breathing])
  if (log.status === "partial") parts.unshift("partial")
  return parts.join(", ") || "done"
}

function marker(session, log, today) {
  if (log?.status === "done") return { text: "[x]", cls: "is-done" }
  if (log?.status === "partial") return { text: "[~]", cls: "is-partial" }
  if (log?.status === "skipped") return { text: "[-]", cls: "is-skipped" }
  if (session.date === today) return { text: "[>]", cls: "is-today" }
  if (session.kind === "rest") return { text: " · ", cls: "is-rest" }
  if (session.kind === "walk") return { text: "[ ]", cls: "is-rest" }
  if (today && session.date < today) return { text: "[ ]", cls: "is-missed" }
  return { text: "[ ]", cls: "" }
}

// What the plan says about a date, for headers and the editor.
function planLabel(date) {
  if (!inPlan(date)) return "Extra run, outside the plan"
  const session = sessionFor(date)
  return session.kind === "rest" ? "Extra run, rest day in the plan" : session.title
}

export default function RunningTracker({ initialLogs, storageReady }) {
  const [logs, setLogs] = useState(initialLogs || {})
  const [today, setToday] = useState(null)
  const [adminKey, setAdminKey] = useState("")
  const [keyRejected, setKeyRejected] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    setToday(localToday())
    let stored = ""
    try {
      stored = window.localStorage.getItem(KEY_STORAGE) || ""
    } catch {
      // storage unavailable: owner just logs in again
    }
    setAdminKey(stored)
    if (!stored) return
    // Check the saved key up front so a rejected key shows a message
    // instead of failing silently on the first save.
    fetch("/api/running", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-running-key": stored },
      body: JSON.stringify({ check: true }),
    })
      .then((res) => setKeyRejected(res.status === 401))
      .catch(() => {})
  }, [])

  const calendar = useMemo(() => buildCalendar(), [])
  const isOwner = Boolean(adminKey)

  const stats = useMemo(() => {
    const entries = Object.entries(logs).filter(
      ([, log]) => log && log.status !== "skipped"
    )
    const weekStart = today ? startOfWeek(today) : null
    const weekEnd = weekStart ? addDays(weekStart, 6) : null
    let best = 0
    let totalMin = 0
    let totalKm = 0
    let weekKm = 0
    let longestKm = 0
    let bestPace = null
    for (const [date, log] of entries) {
      best = Math.max(best, log.continuousMin || 0)
      totalMin += log.totalMin || 0
      totalKm += log.distanceKm || 0
      longestKm = Math.max(longestKm, log.distanceKm || 0)
      if (weekStart && date >= weekStart && date <= weekEnd) {
        weekKm += log.distanceKm || 0
      }
      const pace = paceOf(log)
      if (pace && (bestPace === null || pace < bestPace)) bestPace = pace
    }
    return {
      count: entries.length,
      best,
      totalMin: Math.round(totalMin),
      totalKm: round1(totalKm),
      weekKm: round1(weekKm),
      longestKm: round1(longestKm),
      bestPace,
    }
  }, [logs, today])

  // Logs on dates the plan doesn't cover, newest first.
  const extraRuns = useMemo(
    () =>
      Object.entries(logs)
        .filter(([date, log]) => log && !inPlan(date))
        .sort(([a], [b]) => (a < b ? 1 : -1)),
    [logs]
  )

  const afterPlan = today && today > planEnd

  function openEditor(date, pickDate = false) {
    if (!isOwner) return
    setEditing({ date, pickDate })
  }

  function unlock(key) {
    try {
      window.localStorage.setItem(KEY_STORAGE, key)
    } catch {}
    setAdminKey(key)
    setKeyRejected(false)
  }

  function lock() {
    try {
      window.localStorage.removeItem(KEY_STORAGE)
    } catch {}
    setAdminKey("")
    setKeyRejected(false)
    setEditing(null)
  }

  const extraSection = extraRuns.length > 0 && (
    <>
      <h2 className="rn-h2">Other runs</h2>
      <ul className="rn-days rn-extra">
        {extraRuns.map(([date, log]) => (
          <LogRow
            key={date}
            date={date}
            title={planLabel(date)}
            log={log}
            mark={marker({ date, kind: "run" }, log, today)}
            clickable={isOwner}
            onOpen={() => openEditor(date)}
          />
        ))}
      </ul>
    </>
  )

  return (
    <div className="rn">
      <p className="rn-intro">
        A public log of my running training: a progressive plan to build
        endurance step by step, with every session tracked to show the
        progress along the way.
      </p>

      {!storageReady && (
        <p className="rn-warn">
          Log storage isn&apos;t connected yet, so only the plan is shown.
        </p>
      )}

      <TodayPanel
        today={today}
        log={today ? logs[today] : null}
        isOwner={isOwner}
        onLog={() => openEditor(today)}
        onLogOther={() => openEditor(today, true)}
      />

      <Goals today={today} logs={logs} best={stats.best} />

      <ProgressChart logs={logs} today={today} />

      <div className="game-notes rn-stats">
        <div className="out">
          <span className="k">sessions logged:</span>{" "}
          <span className="v">{stats.count}</span>
        </div>
        <div className="out">
          <span className="k">distance:</span>{" "}
          <span className="v">
            {stats.totalKm} km total, {stats.weekKm} km this week
          </span>
        </div>
        <div className="out">
          <span className="k">time on feet:</span>{" "}
          <span className="v">{stats.totalMin} min</span>
        </div>
        <div className="out">
          <span className="k">longest run:</span>{" "}
          <span className="v">{stats.longestKm} km</span>
        </div>
        <div className="out">
          <span className="k">longest non-stop jog:</span>{" "}
          <span className="v">{stats.best} min</span>
        </div>
        <div className="out">
          <span className="k">best average pace:</span>{" "}
          <span className="v">
            {stats.bestPace ? formatPace(stats.bestPace) : "—"}
          </span>
        </div>
        <div className="out">
          <span className="k">paces:</span>{" "}
          <span className="v">
            jog {paces.jog}, walk {paces.walk}, treadmill incline{" "}
            {paces.incline}
          </span>
        </div>
      </div>

      {afterPlan && extraSection}

      <h2 className="rn-h2">The plan</h2>
      <div className="rn-weeks">
        {calendar.map((week) => {
          const planned = week.days.filter((s) => s.target != null)
          const done = planned.filter((s) => {
            const status = logs[s.date]?.status
            return status === "done" || status === "partial"
          })
          const current =
            today &&
            (today < planStart
              ? week.start === planStart
              : today >= week.start && today <= week.end)
          return (
            <details className="rn-week" key={week.start} open={Boolean(current)}>
              <summary className="rn-week-head">
                <span className="rn-week-label">{week.label}</span>
                <span className="rn-week-range">
                  {formatShort(week.start)} – {formatShort(week.end)}
                </span>
                {planned.length > 0 && (
                  <span className="rn-week-count">
                    {done.length}/{planned.length} done
                  </span>
                )}
              </summary>
              <ul className="rn-days">
                {week.days.map((session) => (
                  <LogRow
                    key={session.date}
                    date={session.date}
                    title={session.title}
                    kind={session.kind}
                    log={logs[session.date]}
                    mark={marker(session, logs[session.date], today)}
                    current={session.date === today}
                    clickable={isOwner}
                    onOpen={() => openEditor(session.date)}
                  />
                ))}
              </ul>
            </details>
          )
        })}
      </div>

      {!afterPlan && extraSection}

      <OwnerBox
        isOwner={isOwner}
        keyRejected={keyRejected}
        onUnlock={unlock}
        onLock={lock}
      />

      {editing && (
        <LogEditor
          initialDate={editing.date}
          pickDate={editing.pickDate}
          logs={logs}
          adminKey={adminKey}
          onClose={() => setEditing(null)}
          onSaved={(date, log) => {
            setLogs((prev) => ({ ...prev, [date]: log }))
            setEditing(null)
          }}
          onDeleted={(date) => {
            setLogs((prev) => {
              const next = { ...prev }
              delete next[date]
              return next
            })
            setEditing(null)
          }}
          onKeyRejected={() => setKeyRejected(true)}
        />
      )}
    </div>
  )
}

function LogRow({ date, title, kind = "run", log, mark, current, clickable, onOpen }) {
  const rowClass = ["rn-day", `kind-${kind}`, current ? "is-current" : "", mark.cls]
    .filter(Boolean)
    .join(" ")
  const body = (
    <>
      <span className="rn-mark" aria-hidden="true">
        {mark.text}
      </span>
      <span className="rn-date">{formatDay(date)}</span>
      <span className="rn-title">
        {title}
        {log && <span className="rn-logged">{summarize(log)}</span>}
        {log?.notes && <span className="rn-notes">“{log.notes}”</span>}
      </span>
    </>
  )
  return (
    <li className={rowClass}>
      {clickable ? (
        <button
          type="button"
          className="rn-day-btn"
          onClick={onOpen}
          aria-label={`Log ${formatDay(date)}`}
        >
          {body}
        </button>
      ) : (
        <div className="rn-day-btn">{body}</div>
      )}
    </li>
  )
}

function TodayPanel({ today, log, isOwner, onLog, onLogOther }) {
  if (!today) return <div className="rn-today rn-today-empty" />

  const session = inPlan(today) ? sessionFor(today) : null
  let kind = "run"
  let title
  let note = null
  if (today < planStart) {
    kind = "rest"
    title = `The plan starts ${formatDay(planStart)}.`
  } else if (!session) {
    title = "The plan is done. Every run still gets logged here."
  } else {
    kind = session.kind
    title = session.title
    note = session.note
  }

  const plannedRun = session && LOGGABLE.includes(session.kind)
  const status = log
    ? summarize(log)
    : plannedRun
    ? "not logged yet"
    : "nothing planned today"

  return (
    <div className={`rn-today kind-${kind}`}>
      <div className="rn-today-date">today, {formatDay(today)}</div>
      <div className="rn-today-title">{title}</div>
      {note && <p className="rn-today-note">{note}</p>}
      <div className="rn-today-foot">
        <span className="rn-today-status">{status}</span>
        {isOwner && (
          <div className="rn-today-actions">
            <button type="button" className="rn-btn rn-btn-quiet" onClick={onLogOther}>
              + Another day
            </button>
            <button type="button" className="rn-btn" onClick={onLog}>
              {log ? "Edit today's log" : "Log today's run"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Goals({ today, logs, best }) {
  const raceLog = logs[goals.race.date]
  const raceDone = raceLog && raceLog.status !== "skipped"
  const daysToRace = today ? diffDays(today, goals.race.date) : null
  const daysToGoal = today ? diffDays(today, goals.continuous.date) : null
  const goalMin = goals.continuous.minutes
  const reached = best >= goalMin

  let raceText
  if (raceDone) {
    raceText = raceLog.totalMin
      ? `finished in ${raceLog.totalMin} min`
      : "finished"
  } else if (daysToRace === null) {
    raceText = formatDay(goals.race.date)
  } else if (daysToRace > 1) {
    raceText = `${daysToRace} days to go, ${formatDay(goals.race.date)}`
  } else if (daysToRace === 1) {
    raceText = "tomorrow"
  } else if (daysToRace === 0) {
    raceText = "today"
  } else {
    raceText = "not logged"
  }

  return (
    <div className="rn-goals">
      <div className="rn-goal">
        <div className="rn-goal-name">{goals.race.label}</div>
        <div className={`rn-goal-state ${raceDone ? "is-done" : ""}`}>
          {raceText}
        </div>
      </div>

      <div className="rn-goal">
        <div className="rn-goal-name">{goals.continuous.label}</div>
        <div className="rn-bar" role="img" aria-label={`${best} of ${goalMin} minutes`}>
          <span className="rn-cells" aria-hidden="true">
            {Array.from({ length: goalMin }, (_, i) => (
              <span
                key={i}
                className={i + 1 <= best ? "on" : i < best ? "half" : ""}
              />
            ))}
          </span>
          <span className="rn-bar-num">
            {best}/{goalMin} min
          </span>
        </div>
        <div className={`rn-goal-state ${reached ? "is-done" : ""}`}>
          {reached
            ? "reached"
            : daysToGoal !== null && daysToGoal >= 0
            ? `target ${formatDay(goals.continuous.date)}, ${daysToGoal} days left`
            : `target ${formatDay(goals.continuous.date)}`}
        </div>
      </div>
    </div>
  )
}

const CHART_METRICS = [
  ["distance", "Distance"],
  ["nonstop", "Non-stop jog"],
]

function ProgressChart({ logs, today }) {
  const W = 640
  const H = 220
  const pad = { l: 34, r: 12, t: 12, b: 26 }

  const done = Object.entries(logs)
    .filter(([, log]) => log && log.status !== "skipped")
    .sort(([a], [b]) => (a < b ? -1 : 1))
  const hasNonstop = done.some(([, l]) => l.continuousMin != null)
  const [picked, setPicked] = useState(null)
  // Until a metric is picked, show non-stop minutes only if any were logged.
  const metric = picked || (hasNonstop ? "nonstop" : "distance")

  const actual = done.filter(([, l]) =>
    metric === "nonstop" ? l.continuousMin != null : l.distanceKm != null
  )
  const value = (l) => (metric === "nonstop" ? l.continuousMin : l.distanceKm)

  // The x axis covers the plan, stretched to include any run outside it
  // and today once the plan is over.
  const firstDate = done[0]?.[0]
  const start = firstDate && firstDate < planStart ? firstDate : planStart
  const end = [planEnd, done.at(-1)?.[0], today].filter(Boolean).sort().at(-1)
  const span = Math.max(diffDays(start, end), 1)

  const maxKm = Math.max(0, ...actual.map(([, l]) => l.distanceKm || 0))
  const yMax = metric === "nonstop" ? 45 : Math.max(5, Math.ceil(maxKm / 5) * 5)
  const yTicks =
    metric === "nonstop"
      ? [0, 10, 20, 30, 40]
      : Array.from({ length: 6 }, (_, i) => round1((yMax / 5) * i))

  const x = (date) => pad.l + (diffDays(start, date) / span) * (W - pad.l - pad.r)
  const y = (v) => H - pad.b - (Math.min(v, yMax) / yMax) * (H - pad.t - pad.b)

  const planned = buildCalendar()
    .flatMap((w) => w.days)
    .filter((s) => s.target != null)
  const plannedPath = planned.map((s) => `${x(s.date)},${y(s.target)}`).join(" ")
  const actualPath = actual.map(([d, l]) => `${x(d)},${y(value(l))}`).join(" ")

  // Axis labels closer than ~48px to an earlier one are dropped.
  const ticks = []
  for (const d of [start, planStart, goals.race.date, goals.continuous.date, end]) {
    if (ticks.every((t) => Math.abs(x(t) - x(d)) > 48)) ticks.push(d)
  }

  const showToday = today && today >= start && today <= end
  const unit = metric === "nonstop" ? "min non-stop" : "km"

  return (
    <figure className="rn-chart">
      <div className="rn-chart-head">
        <Segmented
          name="Chart"
          value={metric}
          onChange={(v) => v && setPicked(v)}
          options={CHART_METRICS}
        />
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={
          metric === "nonstop"
            ? "Longest non-stop jog per session, planned versus actual"
            : "Distance per session"
        }
      >
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={pad.l}
              x2={W - pad.r}
              y1={y(v)}
              y2={y(v)}
              className={metric === "nonstop" && v === 40 ? "rn-grid-goal" : "rn-grid"}
            />
            <text x={pad.l - 8} y={y(v) + 4} className="rn-axis" textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        {ticks.map((d) => (
          <text key={d} x={x(d)} y={H - 6} className="rn-axis" textAnchor="middle">
            {formatShort(d)}
          </text>
        ))}
        {showToday && (
          <line x1={x(today)} x2={x(today)} y1={pad.t} y2={H - pad.b} className="rn-today-line" />
        )}
        {metric === "nonstop" && <polyline points={plannedPath} className="rn-planned" />}
        {metric === "distance" &&
          actual.map(([d, l]) => (
            <rect
              key={d}
              x={x(d) - 4}
              y={y(l.distanceKm)}
              width="8"
              height={Math.max(y(0) - y(l.distanceKm), 1)}
              rx="2"
              className="rn-bar-km"
            >
              <title>
                {formatDay(d)}: {l.distanceKm} km
              </title>
            </rect>
          ))}
        {metric === "nonstop" && actual.length > 1 && (
          <polyline points={actualPath} className="rn-actual" />
        )}
        {metric === "nonstop" &&
          actual.map(([d, l]) => (
            <circle key={d} cx={x(d)} cy={y(l.continuousMin)} r="3.5" className="rn-dot">
              <title>
                {formatDay(d)}: {l.continuousMin} min non-stop
              </title>
            </circle>
          ))}
        {actual.length === 0 && (
          <text x={W / 2} y={H / 2} className="rn-axis" textAnchor="middle">
            {metric === "nonstop"
              ? "No session has non-stop minutes logged yet"
              : "No session has a distance logged yet"}
          </text>
        )}
      </svg>
      <figcaption>
        {metric === "nonstop" ? (
          <>
            <span className="rn-key rn-key-actual">actual</span>{" "}
            <span className="rn-key rn-key-planned">planned</span> longest
            non-stop jog per session, in minutes
          </>
        ) : (
          <>distance per session, in {unit}</>
        )}
      </figcaption>
    </figure>
  )
}

function OwnerBox({ isOwner, keyRejected, onUnlock, onLock }) {
  const [open, setOpen] = useState(false)
  const [key, setKey] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  if (isOwner) {
    return (
      <div className="rn-owner">
        {keyRejected ? (
          <span className="rn-error">
            The server rejected the saved key. If you changed it in Vercel,
            lock and log in again with the new one.
          </span>
        ) : (
          "Editing unlocked on this device."
        )}{" "}
        <button type="button" className="rn-link" onClick={onLock}>
          Lock
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <div className="rn-owner">
        <button type="button" className="rn-link" onClick={() => setOpen(true)}>
          Owner login
        </button>
      </div>
    )
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      const res = await fetch("/api/running", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-running-key": key },
        body: JSON.stringify({ check: true }),
      })
      if (res.ok) onUnlock(key)
      else setError("That key didn't match.")
    } catch {
      setError("Couldn't reach the server. Check your connection.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="rn-owner rn-owner-form" onSubmit={submit}>
      <label htmlFor="rn-key">Owner key</label>
      <input
        id="rn-key"
        type="password"
        autoComplete="current-password"
        value={key}
        onChange={(e) => setKey(e.target.value)}
      />
      <button type="submit" className="rn-btn" disabled={busy || !key}>
        {busy ? "Checking…" : "Unlock editing"}
      </button>
      {error && <span className="rn-error">{error}</span>}
    </form>
  )
}

function Segmented({ name, value, options, onChange }) {
  return (
    <div className="rn-seg" role="radiogroup" aria-label={name}>
      {options.map(([v, label]) => (
        <button
          type="button"
          key={v}
          role="radio"
          aria-checked={value === v}
          className={value === v ? "is-on" : ""}
          onClick={() => onChange(value === v ? null : v)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function formFromLog(log) {
  return {
    status: log?.status || "done",
    distanceKm: log?.distanceKm ?? "",
    continuousMin: log?.continuousMin ?? "",
    totalMin: log?.totalMin ?? "",
    speedKmh: log?.speedKmh ?? "",
    place: log?.place || "treadmill",
    breathing: log?.breathing || null,
    notes: log?.notes || "",
  }
}

function LogEditor({ initialDate, pickDate, logs, adminKey, onClose, onSaved, onDeleted, onKeyRejected }) {
  const [date, setDate] = useState(initialDate)
  const [form, setForm] = useState(() => formFromLog(logs[initialDate]))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const validDate = DATE_RE.test(date)
  const existing = validDate ? logs[date] : null
  const session = validDate && inPlan(date) ? sessionFor(date) : null

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }))
  const setInput = (field) => (e) => set(field)(e.target.value)

  // Picking a date that already has a log loads it, so saving edits it.
  function changeDate(value) {
    setDate(value)
    if (DATE_RE.test(value)) setForm(formFromLog(logs[value]))
  }

  async function request(method, body) {
    const url = method === "DELETE" ? `/api/running?date=${date}` : "/api/running"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "x-running-key": adminKey },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json().catch(() => ({}))
    if (res.status === 401) {
      onKeyRejected()
      throw new Error(
        "The server rejected your key. If you changed it in Vercel, lock and log in again."
      )
    }
    if (!res.ok) throw new Error(data.error || "Saving failed. Try again.")
    return data
  }

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      const data = await request("POST", { date, log: form })
      onSaved(data.date, data.log)
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  async function remove() {
    setBusy(true)
    setError("")
    try {
      await request("DELETE")
      onDeleted(date)
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  return (
    <div className="rn-modal" role="dialog" aria-modal="true" aria-labelledby="rn-modal-title">
      <div className="rn-backdrop" onClick={onClose} />
      <form className="rn-sheet" onSubmit={save}>
        <div className="rn-sheet-head">
          <h3 id="rn-modal-title">{validDate ? formatDay(date) : "Pick a date"}</h3>
          {validDate && <p>{planLabel(date)}</p>}
        </div>

        {pickDate && (
          <label className="rn-field">
            <span className="rn-label">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => changeDate(e.target.value)}
              required
            />
            {existing && (
              <span className="rn-hint">This day already has a log; saving updates it.</span>
            )}
          </label>
        )}

        <div className="rn-field">
          <span className="rn-label">How did it go?</span>
          <Segmented
            name="Status"
            value={form.status}
            onChange={(v) => set("status")(v || "done")}
            options={[
              ["done", "Done"],
              ["partial", "Partly"],
              ["skipped", "Skipped"],
            ]}
          />
        </div>

        {form.status !== "skipped" && (
          <>
            <div className="rn-row">
              <label className="rn-field">
                <span className="rn-label">Distance (km)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={form.distanceKm}
                  onChange={setInput("distanceKm")}
                />
              </label>
              <label className="rn-field">
                <span className="rn-label">Whole session (min)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={form.totalMin}
                  onChange={setInput("totalMin")}
                />
              </label>
              <label className="rn-field">
                <span className="rn-label">Longest non-stop jog (min)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  placeholder={session?.target ? String(session.target) : ""}
                  value={form.continuousMin}
                  onChange={setInput("continuousMin")}
                />
                <span className="rn-hint">Counts toward the 40 min goal</span>
              </label>
              <label className="rn-field">
                <span className="rn-label">Jog speed (km/h)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  placeholder="7.5"
                  value={form.speedKmh}
                  onChange={setInput("speedKmh")}
                />
              </label>
            </div>

            <div className="rn-field">
              <span className="rn-label">Where</span>
              <Segmented
                name="Where"
                value={form.place}
                onChange={set("place")}
                options={[
                  ["treadmill", "Treadmill"],
                  ["outdoor", "Outdoors, flat"],
                  ["mountain", "Mountain"],
                ]}
              />
            </div>

            <div className="rn-field">
              <span className="rn-label">Breathing</span>
              <Segmented
                name="Breathing"
                value={form.breathing}
                onChange={set("breathing")}
                options={[
                  ["easy", "Easy"],
                  ["ok", "OK"],
                  ["hard", "Hard"],
                  ["very-hard", "Very hard"],
                ]}
              />
            </div>
          </>
        )}

        <label className="rn-field">
          <span className="rn-label">Notes</span>
          <textarea
            rows={3}
            maxLength={500}
            value={form.notes}
            onChange={setInput("notes")}
          />
        </label>

        {error && <p className="rn-error">{error}</p>}

        <div className="rn-sheet-actions">
          {existing && (
            <button type="button" className="rn-link rn-delete" onClick={remove} disabled={busy}>
              Delete log
            </button>
          )}
          <button type="button" className="rn-btn rn-btn-quiet" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="rn-btn" disabled={busy || !validDate}>
            {busy ? "Saving…" : "Save session"}
          </button>
        </div>
      </form>
    </div>
  )
}
