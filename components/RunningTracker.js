"use client"

import { useEffect, useMemo, useState } from "react"
import {
  buildCalendar,
  sessionFor,
  goals,
  paces,
  planStart,
  planEnd,
  diffDays,
  formatDay,
  formatShort,
} from "@/lib/running-plan"

const KEY_STORAGE = "running-key"
const LOGGABLE = ["run", "test", "race", "walk"]

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

function summarize(log) {
  if (!log) return ""
  if (log.status === "skipped") return "skipped"
  const parts = []
  if (log.continuousMin != null) parts.push(`${log.continuousMin} min non-stop`)
  if (log.totalMin != null) parts.push(`${log.totalMin} min total`)
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

export default function RunningTracker({ initialLogs, storageReady }) {
  const [logs, setLogs] = useState(initialLogs || {})
  const [today, setToday] = useState(null)
  const [adminKey, setAdminKey] = useState("")
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    setToday(localToday())
    try {
      setAdminKey(window.localStorage.getItem(KEY_STORAGE) || "")
    } catch {
      // storage unavailable: owner just logs in again
    }
  }, [])

  const calendar = useMemo(() => buildCalendar(), [])
  const isOwner = Boolean(adminKey)

  const stats = useMemo(() => {
    const entries = Object.entries(logs).filter(
      ([, log]) => log && log.status !== "skipped"
    )
    const best = entries.reduce(
      (m, [, log]) => Math.max(m, log.continuousMin || 0),
      0
    )
    const totalMin = entries.reduce((s, [, log]) => s + (log.totalMin || 0), 0)
    return { count: entries.length, best, totalMin }
  }, [logs])

  const todaySession = today ? sessionFor(today) : null
  const beforePlan = today && today < planStart
  const afterPlan = today && today > planEnd

  function openEditor(date) {
    if (!isOwner) return
    setEditing(date)
  }

  function lock() {
    try {
      window.localStorage.removeItem(KEY_STORAGE)
    } catch {}
    setAdminKey("")
    setEditing(null)
  }

  return (
    <div className="rn">
      <p className="rn-intro">
        I started running on October 3, 2026 with close to zero fitness. The
        plan: finish a 2.5K race on October 30, then run 40 minutes without
        stopping by the end of November. Every session gets logged here.
      </p>

      {!storageReady && (
        <p className="rn-warn">
          Log storage isn&apos;t connected yet, so only the plan is shown.
        </p>
      )}

      <TodayPanel
        today={today}
        session={todaySession}
        log={today ? logs[today] : null}
        beforePlan={beforePlan}
        afterPlan={afterPlan}
        isOwner={isOwner}
        onLog={() => openEditor(today)}
      />

      <Goals today={today} logs={logs} best={stats.best} />

      <ProgressChart logs={logs} today={today} />

      <div className="game-notes rn-stats">
        <div className="out">
          <span className="k">sessions logged:</span>{" "}
          <span className="v">{stats.count}</span>
        </div>
        <div className="out">
          <span className="k">time on feet:</span>{" "}
          <span className="v">{stats.totalMin} min</span>
        </div>
        <div className="out">
          <span className="k">longest non-stop jog:</span>{" "}
          <span className="v">{stats.best} min</span>
        </div>
        <div className="out">
          <span className="k">paces:</span>{" "}
          <span className="v">
            jog {paces.jog}, walk {paces.walk}, treadmill incline{" "}
            {paces.incline}
          </span>
        </div>
      </div>

      <h2 className="rn-h2">The plan</h2>
      <div className="rn-weeks">
        {calendar.map((week) => (
          <div className="rn-week" key={week.start}>
            <div className="rn-week-head">
              <span className="rn-week-label">{week.label}</span>
              <span className="rn-week-range">
                {formatShort(week.start)} – {formatShort(week.end)}
              </span>
            </div>
            <ul className="rn-days">
              {week.days.map((session) => {
                const log = logs[session.date]
                const m = marker(session, log, today)
                const clickable = isOwner && LOGGABLE.includes(session.kind)
                const rowClass = [
                  "rn-day",
                  `kind-${session.kind}`,
                  session.date === today ? "is-current" : "",
                  m.cls,
                ]
                  .filter(Boolean)
                  .join(" ")
                const body = (
                  <>
                    <span className="rn-mark" aria-hidden="true">
                      {m.text}
                    </span>
                    <span className="rn-date">{formatDay(session.date)}</span>
                    <span className="rn-title">
                      {session.title}
                      {log && (
                        <span className="rn-logged">{summarize(log)}</span>
                      )}
                      {log?.notes && (
                        <span className="rn-notes">“{log.notes}”</span>
                      )}
                    </span>
                  </>
                )
                return (
                  <li key={session.date} className={rowClass}>
                    {clickable ? (
                      <button
                        type="button"
                        className="rn-day-btn"
                        onClick={() => openEditor(session.date)}
                        aria-label={`Log ${formatDay(session.date)}`}
                      >
                        {body}
                      </button>
                    ) : (
                      <div className="rn-day-btn">{body}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <OwnerBox
        isOwner={isOwner}
        onUnlock={(key) => {
          try {
            window.localStorage.setItem(KEY_STORAGE, key)
          } catch {}
          setAdminKey(key)
        }}
        onLock={lock}
      />

      {editing && (
        <LogEditor
          date={editing}
          session={sessionFor(editing)}
          existing={logs[editing]}
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
          onAuthFailed={lock}
        />
      )}
    </div>
  )
}

function TodayPanel({ today, session, log, beforePlan, afterPlan, isOwner, onLog }) {
  if (!today) return <div className="rn-today rn-today-empty" />

  if (beforePlan) {
    return (
      <div className="rn-today">
        <div className="rn-today-date">{formatDay(today)}</div>
        <div className="rn-today-title">
          The plan starts {formatDay(planStart)}.
        </div>
      </div>
    )
  }

  if (afterPlan) {
    return (
      <div className="rn-today">
        <div className="rn-today-date">{formatDay(today)}</div>
        <div className="rn-today-title">
          This block is finished. Next up: getting the 5K under 30 minutes.
        </div>
      </div>
    )
  }

  const canLog = isOwner && LOGGABLE.includes(session.kind)

  return (
    <div className={`rn-today kind-${session.kind}`}>
      <div className="rn-today-date">today, {formatDay(today)}</div>
      <div className="rn-today-title">{session.title}</div>
      {session.note && <p className="rn-today-note">{session.note}</p>}
      <div className="rn-today-foot">
        <span className="rn-today-status">
          {log
            ? summarize(log)
            : LOGGABLE.includes(session.kind)
            ? "not logged yet"
            : "nothing to log today"}
        </span>
        {canLog && (
          <button type="button" className="rn-btn" onClick={onLog}>
            {log ? "Edit today's log" : "Log today's session"}
          </button>
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

function ProgressChart({ logs, today }) {
  const W = 640
  const H = 220
  const pad = { l: 34, r: 12, t: 12, b: 26 }
  const span = diffDays(planStart, planEnd)
  const yMax = 45

  const x = (date) => pad.l + (diffDays(planStart, date) / span) * (W - pad.l - pad.r)
  const y = (min) => H - pad.b - (min / yMax) * (H - pad.t - pad.b)

  const planned = buildCalendar()
    .flatMap((w) => w.days)
    .filter((s) => s.target != null)
  const plannedPath = planned.map((s) => `${x(s.date)},${y(s.target)}`).join(" ")

  const actual = Object.entries(logs)
    .filter(
      ([date, log]) =>
        date >= planStart &&
        date <= planEnd &&
        log &&
        log.status !== "skipped" &&
        log.continuousMin != null
    )
    .sort(([a], [b]) => (a < b ? -1 : 1))
  const actualPath = actual.map(([d, l]) => `${x(d)},${y(l.continuousMin)}`).join(" ")

  const showToday = today && today >= planStart && today <= planEnd

  return (
    <figure className="rn-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Longest non-stop jog per session, planned versus actual">
        {[0, 10, 20, 30, 40].map((v) => (
          <g key={v}>
            <line
              x1={pad.l}
              x2={W - pad.r}
              y1={y(v)}
              y2={y(v)}
              className={v === 40 ? "rn-grid-goal" : "rn-grid"}
            />
            <text x={pad.l - 8} y={y(v) + 4} className="rn-axis" textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        {[planStart, goals.race.date, goals.continuous.date].map((d) => (
          <text key={d} x={x(d)} y={H - 6} className="rn-axis" textAnchor="middle">
            {formatShort(d)}
          </text>
        ))}
        {showToday && (
          <line x1={x(today)} x2={x(today)} y1={pad.t} y2={H - pad.b} className="rn-today-line" />
        )}
        <polyline points={plannedPath} className="rn-planned" />
        {actual.length > 1 && <polyline points={actualPath} className="rn-actual" />}
        {actual.map(([d, l]) => (
          <circle key={d} cx={x(d)} cy={y(l.continuousMin)} r="3.5" className="rn-dot">
            <title>
              {formatDay(d)}: {l.continuousMin} min non-stop
            </title>
          </circle>
        ))}
      </svg>
      <figcaption>
        <span className="rn-key rn-key-actual">actual</span>{" "}
        <span className="rn-key rn-key-planned">planned</span> longest non-stop
        jog per session, in minutes
      </figcaption>
    </figure>
  )
}

function OwnerBox({ isOwner, onUnlock, onLock }) {
  const [open, setOpen] = useState(false)
  const [key, setKey] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  if (isOwner) {
    return (
      <div className="rn-owner">
        Editing unlocked on this device.{" "}
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

function LogEditor({ date, session, existing, adminKey, onClose, onSaved, onDeleted, onAuthFailed }) {
  const [form, setForm] = useState(() => ({
    status: existing?.status || "done",
    continuousMin: existing?.continuousMin ?? "",
    totalMin: existing?.totalMin ?? "",
    speedKmh: existing?.speedKmh ?? "",
    place: existing?.place || "treadmill",
    breathing: existing?.breathing || null,
    notes: existing?.notes || "",
  }))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }))
  const setInput = (field) => (e) => set(field)(e.target.value)

  async function request(method, body) {
    const url = method === "DELETE" ? `/api/running?date=${date}` : "/api/running"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "x-running-key": adminKey },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json().catch(() => ({}))
    if (res.status === 401) {
      onAuthFailed()
      throw new Error("Your key is no longer valid. Log in again.")
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
          <h3 id="rn-modal-title">{formatDay(date)}</h3>
          <p>{session.title}</p>
        </div>

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
                <span className="rn-label">Longest non-stop jog (min)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  placeholder={session.target ? String(session.target) : ""}
                  value={form.continuousMin}
                  onChange={setInput("continuousMin")}
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
          <button type="submit" className="rn-btn" disabled={busy}>
            {busy ? "Saving…" : "Save session"}
          </button>
        </div>
      </form>
    </div>
  )
}
