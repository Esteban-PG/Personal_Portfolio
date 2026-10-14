// Server-only helpers for the password gate on /finanzas.
// The password and the signing secret live in Vercel env vars, never in the repo.
import { createHmac, createHash, timingSafeEqual } from "crypto"
import { Redis } from "@upstash/redis"

export const SESSION_COOKIE = "finanzas_session"
export const SESSION_DAYS = 30

export const MAX_ATTEMPTS = 8 // wrong passwords allowed per IP…
const WINDOW_SECONDS = 15 * 60 // …in this window
// Someone guessing from many IPs at once: after this many wrong passwords in an hour (all IPs
// together) login closes for everyone until the hour ends. Open sessions keep working.
export const MAX_GLOBAL_ATTEMPTS = 40
const GLOBAL_WINDOW_SECONDS = 60 * 60
const GLOBAL_KEY = "finanzas:login:global"
const MAX_PASSWORD_LENGTH = 200

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
  // Only a plain string counts (["clave"] or {…} never match), and absurdly long input is rejected.
  if (typeof given !== "string" || given.length === 0 || given.length > MAX_PASSWORD_LENGTH) return false
  return sameText(given, expected)
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

/** True when this IP already used up its wrong attempts, or login is closed for everyone. */
export async function tooManyAttempts(ip) {
  const r = redis()
  if (!r) return false
  try {
    const [n, g] = await Promise.all([r.get(attemptsKey(ip)), r.get(GLOBAL_KEY)])
    return (Number(n) || 0) >= MAX_ATTEMPTS || (Number(g) || 0) >= MAX_GLOBAL_ATTEMPTS
  } catch {
    return false
  }
}

/** Counts a wrong password. Returns the new totals ({ ip, global }) so the caller can raise an alert. */
export async function recordFailedAttempt(ip) {
  const r = redis()
  if (!r) return { ip: 0, global: 0 }
  try {
    const key = attemptsKey(ip)
    const [n, g] = await Promise.all([r.incr(key), r.incr(GLOBAL_KEY)])
    if (n === 1) await r.expire(key, WINDOW_SECONDS)
    if (g === 1) await r.expire(GLOBAL_KEY, GLOBAL_WINDOW_SECONDS)
    return { ip: n, global: g }
  } catch {
    // If Redis is down, the 1-second delay on every wrong password still applies.
    return { ip: 0, global: 0 }
  }
}

export async function clearAttempts(ip) {
  const r = redis()
  if (!r) return
  try {
    await r.del(attemptsKey(ip))
  } catch {}
}
