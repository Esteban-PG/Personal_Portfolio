import { NextResponse } from "next/server"
import {
  SESSION_COOKIE,
  SESSION_DAYS,
  authConfigured,
  passwordMatches,
  createSessionToken,
  tooManyAttempts,
  recordFailedAttempt,
  clearAttempts,
} from "@/lib/finanzas-auth"

export const dynamic = "force-dynamic"

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function clientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for") || ""
  return forwarded.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown"
}

export async function POST(request) {
  if (!authConfigured()) {
    return NextResponse.json(
      { error: "Falta configurar FINANZAS_PASSWORD y FINANZAS_SESSION_SECRET en Vercel." },
      { status: 503 }
    )
  }

  const ip = clientIp(request)
  if (await tooManyAttempts(ip)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera 15 minutos." },
      { status: 429 }
    )
  }

  let body = {}
  try {
    body = await request.json()
  } catch {}

  if (!passwordMatches(body.password)) {
    await recordFailedAttempt(ip)
    await sleep(1000) // slows down guessing
    return NextResponse.json({ error: "Clave incorrecta." }, { status: 401 })
  }

  await clearAttempts(ip)
  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })
  return response
}
