// Server-only helpers for the password gate on /finanzas.
// The password and the signing secret live in Vercel env vars, never in the repo.
import { createHmac, createHash, timingSafeEqual } from "crypto"
import { Redis } from "@upstash/redis"

export const SESSION_COOKIE = "finanzas_session"
export const SESSION_DAYS = 30

const MAX_ATTEMPTS = 8 // wrong passwords allowed per IP…
const WINDOW_SECONDS = 15 * 60 // …in this window

function secret() {
  return process.env.FINANZAS_SESSION_SECRET || ""
}

function sign(value) {
  return createHmac("sha256", secret()).update(value).digest("hex")
}

function sameText(a, b) {
  // Hash first so both buffers have the same length for timingSafeEqual.
  const ha = createHash("sha256").update(String(a)).digest()
  const hb = createHash("sha256").update(String(b)).digest()
  return timingSafeEqual(ha, hb)
}

export function authConfigured() {
  return Boolean(process.env.FINANZAS_PASSWORD && secret())
}

export function passwordMatches(given) {
  const expected = process.env.FINANZAS_PASSWORD
  if (!expected || !secret()) return false
  return sameText(given || "", expected)
}

/** Token = "<expiry ms>.<hmac>". Changing FINANZAS_SESSION_SECRET logs every device out. */
export function createSessionToken() {
  const expires = String(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  return `${expires}.${sign(expires)}`
}

export function sessionValid(token) {
  if (!token || !secret()) return false
  const [expires, mac] = String(token).split(".")
  if (!expires || !mac || !/^\d+$/.test(expires)) return false
  if (Number(expires) < Date.now()) return false
  return sameText(mac, sign(expires))
}

// ---------- login attempt limit (uses the same Upstash Redis as /running) ----------

let redisClient = null
function redis() {
  if (redisClient) return redisClient
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  redisClient = new Redis({ url, token })
  return redisClient
}

function attemptsKey(ip) {
  return `finanzas:login:${ip || "unknown"}`
}

/** True when this IP already used up its wrong attempts. */
export async function tooManyAttempts(ip) {
  const r = redis()
  if (!r) return false
  try {
    const n = Number(await r.get(attemptsKey(ip))) || 0
    return n >= MAX_ATTEMPTS
  } catch {
    return false
  }
}

export async function recordFailedAttempt(ip) {
  const r = redis()
  if (!r) return
  try {
    const key = attemptsKey(ip)
    const n = await r.incr(key)
    if (n === 1) await r.expire(key, WINDOW_SECONDS)
  } catch {
    // If Redis is down, the 1-second delay on every wrong password still applies.
  }
}

export async function clearAttempts(ip) {
  const r = redis()
  if (!r) return
  try {
    await r.del(attemptsKey(ip))
  } catch {}
}
