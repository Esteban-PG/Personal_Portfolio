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
  MAX_ATTEMPTS,
  MAX_GLOBAL_ATTEMPTS,
} from "@/lib/finanzas-auth"
import { avisarAcceso } from "@/lib/finanzas"

export const dynamic = "force-dynamic"

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function clientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for") || ""
  return forwarded.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown"
}

// Who is trying: IP, approximate place (Vercel geolocation headers) and browser.
function quien(request, ip) {
  return {
    ip,
    ciudad: request.headers.get("x-vercel-ip-city") || "",
    pais: request.headers.get("x-vercel-ip-country") || "",
    dispositivo: (request.headers.get("user-agent") || "").slice(0, 200),
  }
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
      { error: "Demasiados intentos. Intenta más tarde." },
      { status: 429 }
    )
  }

  let body = {}
  try {
    body = await request.json()
  } catch {}

  if (!passwordMatches(body && body.password)) {
    const n = await recordFailedAttempt(ip)
    if (n.ip === MAX_ATTEMPTS) await avisarAcceso("intentos", { ...quien(request, ip), intentos: n.ip })
    if (n.global === MAX_GLOBAL_ATTEMPTS) await avisarAcceso("bloqueo", { ...quien(request, ip), intentos: n.global })
    await sleep(1000) // slows down guessing
    return NextResponse.json({ error: "Clave incorrecta." }, { status: 401 })
  }

  await clearAttempts(ip)
  await avisarAcceso("login", quien(request, ip))
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
