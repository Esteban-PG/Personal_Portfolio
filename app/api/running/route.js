import { NextResponse } from "next/server"
import { timingSafeEqual } from "crypto"
import { getLogs, saveLog, deleteLog, storageConfigured } from "@/lib/running-store"

export const dynamic = "force-dynamic"

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const STATUSES = ["done", "partial", "skipped"]
const PLACES = ["treadmill", "outdoor", "mountain"]
const BREATHING = ["easy", "ok", "hard", "very-hard"]

// Writes require the header `x-running-key` to match RUNNING_ADMIN_KEY.
function authorized(request) {
  const expected = process.env.RUNNING_ADMIN_KEY
  if (!expected) return false
  const given = Buffer.from(request.headers.get("x-running-key") || "")
  const want = Buffer.from(expected)
  return given.length === want.length && timingSafeEqual(given, want)
}

function number(value, max) {
  if (value === "" || value === null || value === undefined) return null
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.min(Math.round(n * 10) / 10, max)
}

function pick(value, allowed) {
  return allowed.includes(value) ? value : null
}

function cleanLog(input = {}) {
  return {
    status: pick(input.status, STATUSES) || "done",
    continuousMin: number(input.continuousMin, 300),
    totalMin: number(input.totalMin, 300),
    speedKmh: number(input.speedKmh, 30),
    place: pick(input.place, PLACES),
    breathing: pick(input.breathing, BREATHING),
    notes: typeof input.notes === "string" ? input.notes.slice(0, 500) : "",
    updatedAt: new Date().toISOString(),
  }
}

export async function GET() {
  const { logs, storageReady } = await getLogs()
  return NextResponse.json({ logs, storageReady })
}

export async function POST(request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Wrong key." }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 })
  }

  // Used by the login box to verify the key without writing anything.
  if (body.check) return NextResponse.json({ ok: true })

  if (!storageConfigured()) {
    return NextResponse.json(
      { error: "Storage is not connected. Add Upstash Redis in Vercel." },
      { status: 503 }
    )
  }
  if (!DATE_RE.test(body.date || "")) {
    return NextResponse.json({ error: "Date must be YYYY-MM-DD." }, { status: 400 })
  }

  const log = cleanLog(body.log)
  await saveLog(body.date, log)
  return NextResponse.json({ date: body.date, log })
}

export async function DELETE(request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Wrong key." }, { status: 401 })
  }
  const date = new URL(request.url).searchParams.get("date") || ""
  if (!DATE_RE.test(date)) {
    return NextResponse.json({ error: "Date must be YYYY-MM-DD." }, { status: 400 })
  }
  await deleteLog(date)
  return NextResponse.json({ date, deleted: true })
}
